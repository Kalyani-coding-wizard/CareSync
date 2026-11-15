import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/firebaseService';
import { body, validationResult } from 'express-validator';
import * as crypto from 'crypto';

const router = Router();

// GET /api/profiles — list profiles user has access to
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firestore = db();
    const snap = await firestore
      .collection('profiles')
      .where('authorizedUsers', 'array-contains', req.user!.uid)
      .get();

    const ownedSnap = await firestore
      .collection('profiles')
      .where('ownerId', '==', req.user!.uid)
      .get();

    const profiles = new Map();
    [...snap.docs, ...ownedSnap.docs].forEach(doc => {
      profiles.set(doc.id, { id: doc.id, ...doc.data() });
    });

    res.json(Array.from(profiles.values()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// POST /api/profiles — create new elderly profile
router.post('/',
  authenticate,
  [
    body('name').trim().isLength({ min: 2 }),
    body('dob').isISO8601().toDate(),
    body('passcode').isLength({ min: 4, max: 8 }).isNumeric(),
    body('emergencyEmails').isArray().optional(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const firestore = db();
      const { name, dob, passcode, photo, emergencyEmails } = req.body;

      // Hash the passcode (never store plain)
      const hashedPasscode = crypto
        .createHash('sha256')
        .update(passcode + process.env.PASSCODE_SALT || 'caresync-salt')
        .digest('hex');

      const profileRef = await firestore.collection('profiles').add({
        ownerId: req.user!.uid,
        ownerEmail: req.user!.email,
        name,
        dob,
        photo: photo || null,
        hashedPasscode,
        authorizedUsers: [req.user!.uid],
        emergencyEmails: emergencyEmails || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({ id: profileRef.id, name, message: 'Profile created successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create profile' });
    }
  }
);

// POST /api/profiles/join — join a profile via passcode
router.post('/join',
  authenticate,
  [
    body('profileId').notEmpty(),
    body('passcode').isLength({ min: 4, max: 8 }).isNumeric(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const firestore = db();
      const { profileId, passcode } = req.body;

      const profileDoc = await firestore.collection('profiles').doc(profileId).get();
      if (!profileDoc.exists) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      const profile = profileDoc.data()!;
      const hashedInput = crypto
        .createHash('sha256')
        .update(passcode + (process.env.PASSCODE_SALT || 'caresync-salt'))
        .digest('hex');

      if (hashedInput !== profile.hashedPasscode) {
        res.status(401).json({ error: 'Invalid passcode' });
        return;
      }

      // Add user to authorized list
      const authorizedUsers: string[] = profile.authorizedUsers || [];
      if (!authorizedUsers.includes(req.user!.uid)) {
        authorizedUsers.push(req.user!.uid);
        await profileDoc.ref.update({ authorizedUsers });
      }

      res.json({ message: 'Successfully joined profile', profileId, name: profile.name });
    } catch (err) {
      res.status(500).json({ error: 'Failed to join profile' });
    }
  }
);

// PATCH /api/profiles/:id — update profile
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firestore = db();
    const doc = await firestore.collection('profiles').doc(req.params.id).get();

    if (!doc.exists) { res.status(404).json({ error: 'Profile not found' }); return; }
    if (doc.data()!.ownerId !== req.user!.uid) { res.status(403).json({ error: 'Forbidden' }); return; }

    const allowed = ['name', 'dob', 'photo', 'emergencyEmails'];
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await doc.ref.update(updates);
    res.json({ message: 'Profile updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;

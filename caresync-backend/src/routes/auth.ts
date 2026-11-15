import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auth, db } from '../services/firebaseService';
import { body, validationResult } from 'express-validator';

const router = Router();

// POST /api/auth/register — set user role in Firestore + Firebase custom claims
router.post('/register',
  authenticate,
  [body('role').isIn(['elderly', 'caretaker', 'family']), body('name').trim().notEmpty()],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { role, name } = req.body;
    try {
      // Set custom claims on Firebase Auth token
      await auth().setCustomUserClaims(req.user!.uid, { role });

      // Store in Firestore
      await db().collection('users').doc(req.user!.uid).set({
        name,
        email: req.user!.email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      res.json({ message: 'Registration complete', role });
    } catch {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// GET /api/auth/me — get current user info
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db().collection('users').doc(req.user!.uid).get();
    if (!doc.exists) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ uid: req.user!.uid, ...doc.data() });
  } catch {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;

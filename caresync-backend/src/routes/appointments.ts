import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/firebaseService';
import { body, validationResult } from 'express-validator';

const router = Router();

// GET /api/appointments?profileId=xxx
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { profileId } = req.query as { profileId: string };
  if (!profileId) { res.status(400).json({ error: 'profileId required' }); return; }

  try {
    const snap = await db().collection('appointments')
      .where('profileId', '==', profileId)
      .orderBy('dateTime', 'asc')
      .get();

    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/appointments
router.post('/',
  authenticate,
  [
    body('profileId').notEmpty(),
    body('doctorName').trim().notEmpty(),
    body('specialty').optional().trim(),
    body('dateTime').isISO8601(),
    body('location').optional().trim(),
    body('notes').optional().trim(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { profileId, doctorName, specialty, dateTime, location, notes } = req.body;

    try {
      const ref = await db().collection('appointments').add({
        profileId,
        doctorName,
        specialty: specialty || '',
        dateTime,
        location: location || '',
        notes: notes || '',
        reminderSent: false,
        createdBy: req.user!.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({ id: ref.id, message: 'Appointment scheduled' });
    } catch {
      res.status(500).json({ error: 'Failed to schedule appointment' });
    }
  }
);

// PATCH /api/appointments/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db().collection('appointments').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }

    const allowed = ['doctorName', 'specialty', 'dateTime', 'location', 'notes'];
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await doc.ref.update(updates);
    res.json({ message: 'Appointment updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db().collection('appointments').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }
    await doc.ref.delete();
    res.json({ message: 'Appointment cancelled' });
  } catch {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;

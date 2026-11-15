import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/firebaseService';
import { body, validationResult } from 'express-validator';

const router = Router();

// Verify user has access to a profile
async function canAccessProfile(uid: string, profileId: string): Promise<boolean> {
  const firestore = db();
  const doc = await firestore.collection('profiles').doc(profileId).get();
  if (!doc.exists) return false;
  const data = doc.data()!;
  return data.ownerId === uid || (data.authorizedUsers || []).includes(uid);
}

// GET /api/medications?profileId=xxx
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { profileId } = req.query as { profileId: string };
  if (!profileId) { res.status(400).json({ error: 'profileId required' }); return; }

  if (!(await canAccessProfile(req.user!.uid, profileId))) {
    res.status(403).json({ error: 'Access denied' }); return;
  }

  try {
    const snap = await db().collection('medications')
      .where('profileId', '==', profileId)
      .where('active', '==', true)
      .orderBy('name')
      .get();

    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// POST /api/medications
router.post('/',
  authenticate,
  [
    body('profileId').notEmpty(),
    body('name').trim().notEmpty(),
    body('dosage').notEmpty(),
    body('unit').notEmpty(),
    body('frequency').isIn(['daily', 'twice_daily', 'three_times', 'weekly', 'as_needed', 'custom']),
    body('times').isArray({ min: 1 }),
    body('startDate').isISO8601(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { profileId, name, dosage, unit, frequency, times, instructions, startDate, endDate, refillCount, color } = req.body;

    if (!(await canAccessProfile(req.user!.uid, profileId))) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    try {
      const ref = await db().collection('medications').add({
        profileId,
        name: name.trim(),
        dosage,
        unit,
        frequency,
        times,                   // e.g. ["08:00", "20:00"]
        instructions: instructions || '',
        startDate,
        endDate: endDate || null,
        refillCount: refillCount || null,
        refillAlertAt: refillCount ? Math.ceil(refillCount * 0.2) : null, // alert at 20% remaining
        color: color || '#3B82F6',
        active: true,
        createdBy: req.user!.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Generate adherence records for the next 7 days
      await generateAdherenceRecords(profileId, ref.id, times, 7);

      res.status(201).json({ id: ref.id, message: 'Medication added successfully' });
    } catch {
      res.status(500).json({ error: 'Failed to add medication' });
    }
  }
);

// PATCH /api/medications/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db().collection('medications').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }

    if (!(await canAccessProfile(req.user!.uid, doc.data()!.profileId))) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    const allowed = ['name', 'dosage', 'unit', 'frequency', 'times', 'instructions', 'endDate', 'refillCount', 'color'];
    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    await doc.ref.update(updates);
    res.json({ message: 'Medication updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// DELETE /api/medications/:id (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await db().collection('medications').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ error: 'Not found' }); return; }

    if (!(await canAccessProfile(req.user!.uid, doc.data()!.profileId))) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    await doc.ref.update({ active: false, deletedAt: new Date().toISOString() });
    res.json({ message: 'Medication removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove medication' });
  }
});

async function generateAdherenceRecords(
  profileId: string,
  medId: string,
  times: string[],
  days: number
): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();
  const today = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(date);
      scheduledTime.setHours(hours, minutes, 0, 0);

      const ref = firestore.collection('adherence').doc();
      batch.set(ref, {
        profileId,
        medId,
        scheduledTime: scheduledTime.toISOString(),
        date: dateStr,
        status: 'pending',
        reminderSent: false,
        missedAlertSent: false,
        takenAt: null,
        notes: '',
        createdAt: new Date().toISOString(),
      });
    }
  }
  await batch.commit();
}

export default router;

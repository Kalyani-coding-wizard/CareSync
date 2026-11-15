import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/firebaseService';
import { body, validationResult } from 'express-validator';

const router = Router();

// PATCH /api/adherence/:id — mark as taken or missed
router.patch('/:id',
  authenticate,
  [body('status').isIn(['taken', 'missed', 'skipped'])],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const doc = await db().collection('adherence').doc(req.params.id).get();
      if (!doc.exists) { res.status(404).json({ error: 'Record not found' }); return; }

      const { status, notes } = req.body;
      await doc.ref.update({
        status,
        takenAt: status === 'taken' ? new Date().toISOString() : null,
        notes: notes || '',
        markedBy: req.user!.uid,
        updatedAt: new Date().toISOString(),
      });

      res.json({ message: `Medication marked as ${status}` });
    } catch {
      res.status(500).json({ error: 'Failed to update adherence' });
    }
  }
);

// GET /api/adherence?profileId=xxx&medId=xxx&startDate=xxx&endDate=xxx
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { profileId, medId, startDate, endDate } = req.query as Record<string, string>;
  if (!profileId) { res.status(400).json({ error: 'profileId required' }); return; }

  try {
    // Verify access
    const profileDoc = await db().collection('profiles').doc(profileId).get();
    if (!profileDoc.exists) { res.status(404).json({ error: 'Profile not found' }); return; }
    const profile = profileDoc.data()!;
    if (profile.ownerId !== req.user!.uid && !(profile.authorizedUsers || []).includes(req.user!.uid)) {
      res.status(403).json({ error: 'Access denied' }); return;
    }

    let query = db().collection('adherence').where('profileId', '==', profileId) as FirebaseFirestore.Query;
    if (medId) query = query.where('medId', '==', medId);
    if (startDate) query = query.where('scheduledTime', '>=', startDate);
    if (endDate) query = query.where('scheduledTime', '<=', endDate);

    const snap = await query.orderBy('scheduledTime', 'desc').limit(200).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: 'Failed to fetch adherence records' });
  }
});

// GET /api/adherence/stats/:profileId — adherence rate stats
router.get('/stats/:profileId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profileId } = req.params;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const snap = await db().collection('adherence')
      .where('profileId', '==', profileId)
      .where('scheduledTime', '>=', thirtyDaysAgo)
      .where('scheduledTime', '<=', new Date().toISOString())
      .get();

    const records = snap.docs.map(d => d.data());
    const total = records.length;
    const taken = records.filter(r => r.status === 'taken').length;
    const missed = records.filter(r => r.status === 'missed').length;
    const pending = records.filter(r => r.status === 'pending').length;

    const adherenceRate = total > 0 ? Math.round((taken / (total - pending)) * 100) : 0;

    // Calculate current streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = [...new Set(
      records.filter(r => r.status !== 'pending').map(r => r.date)
    )].sort().reverse();

    for (const date of sortedDates) {
      const dayRecords = records.filter(r => r.date === date);
      const allTaken = dayRecords.every(r => r.status === 'taken');
      if (allTaken && date <= today) streak++;
      else break;
    }

    res.json({ total, taken, missed, pending, adherenceRate, streak, period: '30 days' });
  } catch {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

export default router;

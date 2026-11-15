import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../services/firebaseService';
import { sendReminderEmail } from '../services/emailService';
import { body, validationResult } from 'express-validator';

const router = Router();

// POST /api/sos — trigger emergency SOS alert
router.post('/',
  authenticate,
  [
    body('profileId').notEmpty(),
    body('message').optional().trim(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const { profileId, message } = req.body;

    try {
      const profileDoc = await db().collection('profiles').doc(profileId).get();
      if (!profileDoc.exists) { res.status(404).json({ error: 'Profile not found' }); return; }

      const profile = profileDoc.data()!;

      // Collect ALL family/caretaker emails + emergency emails
      const emails = new Set<string>(profile.emergencyEmails || []);
      if (profile.ownerEmail) emails.add(profile.ownerEmail);

      for (const uid of (profile.authorizedUsers || [])) {
        const userDoc = await db().collection('users').doc(uid).get();
        if (userDoc.exists) emails.add(userDoc.data()!.email);
      }

      if (emails.size === 0) {
        res.status(400).json({ error: 'No emergency contacts configured' });
        return;
      }

      await sendReminderEmail({
        to: Array.from(emails),
        patientName: profile.name,
        type: 'sos',
        details: {
          sosMessage: message || `${profile.name} has triggered an emergency SOS alert and needs immediate assistance.`,
        },
      });

      // Log the SOS event
      await db().collection('sos_events').add({
        profileId,
        triggeredBy: req.user!.uid,
        message: message || '',
        emailsSent: Array.from(emails),
        timestamp: new Date().toISOString(),
      });

      res.json({
        message: 'SOS alert sent',
        contactsNotified: emails.size,
      });
    } catch (err) {
      console.error('SOS failed:', err);
      res.status(500).json({ error: 'Failed to send SOS alert' });
    }
  }
);

export default router;

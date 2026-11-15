import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { processMedicationReminders, processMissedMedicationAlerts, processAppointmentReminders } from '../services/reminderService';

const router = Router();

// POST /api/reminders/process — called by Cloud Scheduler
// Protected by a secret header to prevent unauthorized calls
router.post('/process', async (req, res): Promise<void> => {
  const schedulerSecret = req.headers['x-scheduler-secret'];
  if (schedulerSecret !== process.env.SCHEDULER_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const [medResult, missedResult, apptResult] = await Promise.all([
      processMedicationReminders(),
      processMissedMedicationAlerts(),
      processAppointmentReminders(),
    ]);

    res.json({
      message: 'Reminders processed',
      medications: medResult,
      missed: missedResult,
      appointments: apptResult,
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Reminder processing failed:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// POST /api/reminders/test-email — dev only
router.post('/test-email', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const { sendReminderEmail } = await import('../services/emailService');
  try {
    await sendReminderEmail({
      to: req.user!.email,
      patientName: 'Test Patient',
      type: 'medication',
      details: {
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '8:00 AM',
      },
    });
    res.json({ message: 'Test email sent to ' + req.user!.email });
  } catch (err) {
    res.status(500).json({ error: 'Email failed', details: String(err) });
  }
});

export default router;

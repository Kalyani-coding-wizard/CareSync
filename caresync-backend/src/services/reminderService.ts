import { db } from './firebaseService';
import { sendReminderEmail } from './emailService';

/**
 * Called by Cloud Scheduler (or manually) every 15 minutes.
 * Checks all pending medication reminders and sends emails.
 */
export async function processMedicationReminders(): Promise<{ sent: number; skipped: number }> {
  const firestore = db();
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000);   // 15 min from now

  let sent = 0;
  let skipped = 0;

  // Get all adherence records that are still pending and due soon
  const adherenceSnap = await firestore
    .collection('adherence')
    .where('status', '==', 'pending')
    .where('scheduledTime', '>=', windowStart.toISOString())
    .where('scheduledTime', '<=', windowEnd.toISOString())
    .where('reminderSent', '==', false)
    .get();

  for (const doc of adherenceSnap.docs) {
    const record = doc.data();

    try {
      // Get medication details
      const medDoc = await firestore.collection('medications').doc(record.medId).get();
      if (!medDoc.exists) { skipped++; continue; }
      const med = medDoc.data()!;

      // Get profile details
      const profileDoc = await firestore.collection('profiles').doc(record.profileId).get();
      if (!profileDoc.exists) { skipped++; continue; }
      const profile = profileDoc.data()!;

      // Get authorized user emails (family + caretakers)
      const emails: string[] = [];
      if (profile.ownerEmail) emails.push(profile.ownerEmail);
      for (const uid of (profile.authorizedUsers || [])) {
        const userDoc = await firestore.collection('users').doc(uid).get();
        if (userDoc.exists) emails.push(userDoc.data()!.email);
      }

      if (emails.length === 0) { skipped++; continue; }

      await sendReminderEmail({
        to: emails,
        patientName: profile.name,
        type: 'medication',
        details: {
          medicationName: med.name,
          dosage: `${med.dosage} ${med.unit}`,
          scheduledTime: new Date(record.scheduledTime).toLocaleTimeString(),
        },
      });

      // Mark reminder as sent
      await doc.ref.update({ reminderSent: true });
      sent++;
    } catch (err) {
      console.error(`Failed to process reminder ${doc.id}:`, err);
      skipped++;
    }
  }

  console.log(`📧 Reminders processed: ${sent} sent, ${skipped} skipped`);
  return { sent, skipped };
}

/**
 * Checks for missed medications (past due by >30 mins, still pending).
 * Sends escalation alert to caretakers & family.
 */
export async function processMissedMedicationAlerts(): Promise<{ alerted: number }> {
  const firestore = db();
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const missedSnap = await firestore
    .collection('adherence')
    .where('status', '==', 'pending')
    .where('scheduledTime', '<=', thirtyMinsAgo)
    .where('missedAlertSent', '==', false)
    .get();

  let alerted = 0;

  for (const doc of missedSnap.docs) {
    const record = doc.data();

    try {
      const medDoc = await firestore.collection('medications').doc(record.medId).get();
      const profileDoc = await firestore.collection('profiles').doc(record.profileId).get();
      if (!medDoc.exists || !profileDoc.exists) continue;

      const med = medDoc.data()!;
      const profile = profileDoc.data()!;

      // Mark as missed in Firestore
      await doc.ref.update({ status: 'missed', missedAlertSent: true });

      // Collect caretaker + family emails
      const emails: string[] = [];
      for (const uid of (profile.authorizedUsers || [])) {
        const userDoc = await firestore.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          if (['caretaker', 'family'].includes(userData.role)) {
            emails.push(userData.email);
          }
        }
      }

      if (emails.length > 0) {
        await sendReminderEmail({
          to: emails,
          patientName: profile.name,
          type: 'missed_medication',
          details: {
            medicationName: med.name,
            dosage: `${med.dosage} ${med.unit}`,
            scheduledTime: new Date(record.scheduledTime).toLocaleString(),
          },
        });
        alerted++;
      }
    } catch (err) {
      console.error(`Failed to send missed alert for ${doc.id}:`, err);
    }
  }

  return { alerted };
}

/**
 * Sends appointment reminders for appointments in the next 24h and 1h.
 */
export async function processAppointmentReminders(): Promise<{ sent: number }> {
  const firestore = db();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  let sent = 0;

  const apptSnap = await firestore
    .collection('appointments')
    .where('dateTime', '>=', now.toISOString())
    .where('dateTime', '<=', in24h)
    .where('reminderSent', '==', false)
    .get();

  for (const doc of apptSnap.docs) {
    const appt = doc.data();
    const apptTime = new Date(appt.dateTime);

    // Only send if within 24h window or 1h window
    const msUntil = apptTime.getTime() - now.getTime();
    if (msUntil > 24 * 60 * 60 * 1000 + 10 * 60 * 1000) continue; // too far ahead

    const profileDoc = await firestore.collection('profiles').doc(appt.profileId).get();
    if (!profileDoc.exists) continue;
    const profile = profileDoc.data()!;

    const emails: string[] = [];
    if (profile.ownerEmail) emails.push(profile.ownerEmail);
    for (const uid of (profile.authorizedUsers || [])) {
      const userDoc = await firestore.collection('users').doc(uid).get();
      if (userDoc.exists) emails.push(userDoc.data()!.email);
    }

    if (emails.length === 0) continue;

    await sendReminderEmail({
      to: emails,
      patientName: profile.name,
      type: 'appointment',
      details: {
        doctorName: appt.doctorName,
        appointmentDate: apptTime.toLocaleString(),
        location: appt.location,
      },
    });

    await doc.ref.update({ reminderSent: true });
    sent++;
  }

  return { sent };
}

import test from 'node:test';
import assert from 'node:assert/strict';

function renderMedicationReminderEmail({ patientName, medicationName, dosage, scheduledTime }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>CareSync Medication Reminder</h2>
      <p>Hello, this is a reminder for <strong>${patientName}</strong>.</p>
      <p>Medication: <strong>${medicationName} (${dosage})</strong></p>
      <p>Scheduled Time: <strong>${scheduledTime}</strong></p>
      <a href="https://caresync.demo/dashboard">Mark as Taken</a>
    </div>
  `.trim();
}

function renderMissedDoseEscalationEmail({ patientName, medicationName, minutesPast, level }) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #FEF2F2; border-left: 4px solid #DC2626;">
      <h2>⚠️ [Level ${level} Alert] Missed Medication Dose</h2>
      <p>Patient: <strong>${patientName}</strong></p>
      <p>Medication: <strong>${medicationName}</strong></p>
      <p>Status: Unconfirmed for ${minutesPast} minutes past scheduled time.</p>
    </div>
  `.trim();
}

test('Proactive Email Engine Suite', async (t) => {
  await t.test('renders valid HTML medication reminder email with recipient details', () => {
    const html = renderMedicationReminderEmail({
      patientName: 'Eleanor Vance',
      medicationName: 'Metformin',
      dosage: '500mg',
      scheduledTime: '8:00 AM',
    });
    assert.equal(html.includes('Eleanor Vance'), true);
    assert.equal(html.includes('Metformin (500mg)'), true);
    assert.equal(html.includes('8:00 AM'), true);
  });

  await t.test('renders missed-dose escalation email with red urgency indicator', () => {
    const html = renderMissedDoseEscalationEmail({
      patientName: 'Eleanor Vance',
      medicationName: 'Atorvastatin',
      minutesPast: 35,
      level: 3,
    });
    assert.equal(html.includes('Level 3 Alert'), true);
    assert.equal(html.includes('#DC2626'), true); // Red border
    assert.equal(html.includes('35 minutes past'), true);
  });
});

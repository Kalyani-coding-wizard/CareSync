import test from 'node:test';
import assert from 'node:assert/strict';

// Core escalation determination logic from reminderService
function determineEscalationLevel(minutesPast) {
  if (minutesPast < 1) return 0; // Not yet late
  if (minutesPast < 15) return 1; // Level 1: Gentle nudge (Patient only)
  if (minutesPast < 30) return 2; // Level 2: Caretaker alert
  if (minutesPast < 60) return 3; // Level 3: Family circle alert
  return 4;                       // Level 4: Emergency contacts + Doctor
}

function resolveEscalationRecipients(level, profile) {
  const recipients = [];
  if (level >= 1 && profile.email) {
    recipients.push(profile.email);
  }
  if (level >= 2 && profile.primaryCaretakerEmail) {
    recipients.push(profile.primaryCaretakerEmail);
  }
  if (level >= 3 && Array.isArray(profile.familyEmails)) {
    recipients.push(...profile.familyEmails);
  }
  if (level >= 4) {
    if (Array.isArray(profile.emergencyContacts)) {
      recipients.push(...profile.emergencyContacts.map(c => c.email).filter(Boolean));
    }
    if (profile.doctorEmail) {
      recipients.push(profile.doctorEmail);
    }
  }
  return [...new Set(recipients)];
}

test('Smart Escalation Ladder Suite', async (t) => {
  const mockProfile = {
    name: 'Eleanor Vance',
    email: 'eleanor@caresync.demo',
    primaryCaretakerEmail: 'sarah.vance@caresync.demo',
    familyEmails: ['marcus.vance@caresync.demo', 'david.vance@caresync.demo'],
    emergencyContacts: [{ email: 'emergency.911@county.gov' }],
    doctorEmail: 'dr.chen@cardiology.demo',
  };

  await t.test('minutesPast < 1 returns Level 0 (no escalation)', () => {
    assert.equal(determineEscalationLevel(0), 0);
    assert.equal(determineEscalationLevel(0.5), 0);
  });

  await t.test('minutesPast in [1, 15) returns Level 1 (Patient only)', () => {
    assert.equal(determineEscalationLevel(5), 1);
    assert.equal(determineEscalationLevel(14.9), 1);
    const recipients = resolveEscalationRecipients(1, mockProfile);
    assert.deepEqual(recipients, ['eleanor@caresync.demo']);
  });

  await t.test('minutesPast in [15, 30) returns Level 2 (Patient + Caretaker)', () => {
    assert.equal(determineEscalationLevel(15), 2);
    assert.equal(determineEscalationLevel(28), 2);
    const recipients = resolveEscalationRecipients(2, mockProfile);
    assert.equal(recipients.includes('eleanor@caresync.demo'), true);
    assert.equal(recipients.includes('sarah.vance@caresync.demo'), true);
    assert.equal(recipients.includes('marcus.vance@caresync.demo'), false);
  });

  await t.test('minutesPast in [30, 60) returns Level 3 (Patient + Caretaker + Family)', () => {
    assert.equal(determineEscalationLevel(30), 3);
    assert.equal(determineEscalationLevel(59), 3);
    const recipients = resolveEscalationRecipients(3, mockProfile);
    assert.equal(recipients.includes('marcus.vance@caresync.demo'), true);
    assert.equal(recipients.includes('david.vance@caresync.demo'), true);
    assert.equal(recipients.includes('dr.chen@cardiology.demo'), false);
  });

  await t.test('minutesPast >= 60 returns Level 4 (Emergency + Doctor)', () => {
    assert.equal(determineEscalationLevel(60), 4);
    assert.equal(determineEscalationLevel(120), 4);
    const recipients = resolveEscalationRecipients(4, mockProfile);
    assert.equal(recipients.includes('emergency.911@county.gov'), true);
    assert.equal(recipients.includes('dr.chen@cardiology.demo'), true);
    assert.equal(recipients.length, 6);
  });

  await t.test('skips duplicate escalation if currentLevel >= newLevel', () => {
    const shouldEscalate = (currentLevel, newLevel) => newLevel > currentLevel;
    assert.equal(shouldEscalate(2, 2), false); // already at level 2
    assert.equal(shouldEscalate(3, 2), false); // already at level 3
    assert.equal(shouldEscalate(1, 2), true);  // needs escalation to level 2
  });
});

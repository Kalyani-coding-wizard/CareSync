import test from 'node:test';
import assert from 'node:assert/strict';

// Helper functions mirroring adherence routes & frontend utils
function calculateAdherenceRate(taken, total) {
  if (total === 0) return 0;
  return Math.round((taken / total) * 100);
}

function calculateStreak(dailyRecords) {
  let streak = 0;
  // records ordered newest to oldest
  for (const day of dailyRecords) {
    if (day.taken === day.total && day.total > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getAdherenceColor(rate) {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

test('Adherence & Metrics Suite', async (t) => {
  await t.test('calculates percentage correctly', () => {
    assert.equal(calculateAdherenceRate(8, 10), 80);
    assert.equal(calculateAdherenceRate(14, 14), 100);
    assert.equal(calculateAdherenceRate(0, 10), 0);
    assert.equal(calculateAdherenceRate(0, 0), 0);
    assert.equal(calculateAdherenceRate(7, 9), 78); // 77.77% rounded to 78%
  });

  await t.test('calculates consecutive streak correctly', () => {
    const perfectWeek = [
      { day: 7, taken: 4, total: 4 },
      { day: 6, taken: 4, total: 4 },
      { day: 5, taken: 4, total: 4 },
      { day: 4, taken: 4, total: 4 },
      { day: 3, taken: 4, total: 4 },
      { day: 2, taken: 4, total: 4 },
      { day: 1, taken: 4, total: 4 },
    ];
    assert.equal(calculateStreak(perfectWeek), 7);

    const brokenStreak = [
      { day: 5, taken: 4, total: 4 },
      { day: 4, taken: 4, total: 4 },
      { day: 3, taken: 3, total: 4 }, // Missed one!
      { day: 2, taken: 4, total: 4 },
      { day: 1, taken: 4, total: 4 },
    ];
    assert.equal(calculateStreak(brokenStreak), 2);
  });

  await t.test('assigns accessible clinical status colors', () => {
    assert.equal(getAdherenceColor(95), 'text-green-600');
    assert.equal(getAdherenceColor(90), 'text-green-600');
    assert.equal(getAdherenceColor(85), 'text-yellow-600');
    assert.equal(getAdherenceColor(70), 'text-yellow-600');
    assert.equal(getAdherenceColor(65), 'text-red-600');
    assert.equal(getAdherenceColor(0), 'text-red-600');
  });

  await t.test('formats 24h military time to accessible 12h AM/PM strings', () => {
    assert.equal(formatTime('08:00'), '8:00 AM');
    assert.equal(formatTime('12:30'), '12:30 PM');
    assert.equal(formatTime('18:45'), '6:45 PM');
    assert.equal(formatTime('20:00'), '8:00 PM');
    assert.equal(formatTime('00:00'), '12:00 AM');
  });
});

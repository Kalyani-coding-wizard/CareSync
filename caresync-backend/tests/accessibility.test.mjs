import test from 'node:test';
import assert from 'node:assert/strict';

// Accessibility helper functions
function getFontSizeClass(size) {
  switch (size) {
    case 'xl': return 'text-xl md:text-2xl';
    case 'large': return 'text-lg md:text-xl';
    default: return 'text-base';
  }
}

function getHighContrastClasses(enabled) {
  return enabled
    ? 'bg-black text-yellow-300 border-yellow-400'
    : 'bg-white text-slate-900 border-slate-200';
}

function validateTouchTargetSize(heightPx, widthPx) {
  // WCAG 2.1 Success Criterion 2.5.5 requires minimum 44px by 44px
  // CareSync sets minimum 48px by 48px for senior tremor accessibility
  return heightPx >= 48 && widthPx >= 48;
}

function validateTremorBuffer(countdownSeconds) {
  // Tremor false-alarm buffer must be at least 3 seconds
  return countdownSeconds >= 3 && countdownSeconds <= 10;
}

test('Elderly Accessibility Suite (WCAG & Tremor Focus)', async (t) => {
  await t.test('provides proper 3-step font scaler classes for low vision seniors', () => {
    assert.equal(getFontSizeClass('normal'), 'text-base');
    assert.equal(getFontSizeClass('large'), 'text-lg md:text-xl');
    assert.equal(getFontSizeClass('xl'), 'text-xl md:text-2xl');
  });

  await t.test('switches to high-contrast WCAG AAA color palette on demand', () => {
    const highContrast = getHighContrastClasses(true);
    assert.equal(highContrast.includes('bg-black'), true);
    assert.equal(highContrast.includes('text-yellow-300'), true);

    const normal = getHighContrastClasses(false);
    assert.equal(normal.includes('bg-white'), true);
  });

  await t.test('enforces minimum 48px touch targets for arthritis & tremor safety', () => {
    assert.equal(validateTouchTargetSize(48, 48), true);
    assert.equal(validateTouchTargetSize(56, 120), true);
    assert.equal(validateTouchTargetSize(32, 32), false); // too small
    assert.equal(validateTouchTargetSize(44, 44), false); // below CareSync 48px standard
  });

  await t.test('SOS countdown buffer protects against accidental tremor taps', () => {
    assert.equal(validateTremorBuffer(5), true); // default 5s
    assert.equal(validateTremorBuffer(0), false); // no buffer is dangerous
    assert.equal(validateTremorBuffer(15), false); // too long for real emergencies
  });
});

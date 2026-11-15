import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Hashing algorithm used by CareSync
function hashPasscode(passcode, salt = 'caresync-salt') {
  return crypto
    .createHash('sha256')
    .update(passcode + salt)
    .digest('hex');
}

function verifyPasscode(inputPasscode, storedHash, salt = 'caresync-salt') {
  const inputHash = hashPasscode(inputPasscode, salt);
  return inputHash === storedHash;
}

test('Passcode Verification Suite', async (t) => {
  await t.test('generates 64-character SHA-256 hex hash', () => {
    const hash = hashPasscode('482910');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  await t.test('verifies correct passcode successfully (Eleanor Vance demo: 482910)', () => {
    const validPasscode = '482910';
    const storedHash = hashPasscode(validPasscode);
    assert.equal(verifyPasscode('482910', storedHash), true);
  });

  await t.test('rejects incorrect passcode', () => {
    const validPasscode = '482910';
    const storedHash = hashPasscode(validPasscode);
    assert.equal(verifyPasscode('123456', storedHash), false);
    assert.equal(verifyPasscode('000000', storedHash), false);
    assert.equal(verifyPasscode('482911', storedHash), false);
  });

  await t.test('salt produces distinct hashes for identical passcodes', () => {
    const hashA = hashPasscode('482910', 'salt-patient-a');
    const hashB = hashPasscode('482910', 'salt-patient-b');
    assert.notEqual(hashA, hashB);
  });

  await t.test('validates passcode length constraint (4 to 8 digits numeric)', () => {
    const isValidFormat = (code) => /^\d{4,8}$/.test(code);
    assert.equal(isValidFormat('482910'), true);
    assert.equal(isValidFormat('1234'), true);
    assert.equal(isValidFormat('12345678'), true);
    assert.equal(isValidFormat('123'), false); // too short
    assert.equal(isValidFormat('123456789'), false); // too long
    assert.equal(isValidFormat('48291a'), false); // non-numeric
  });
});

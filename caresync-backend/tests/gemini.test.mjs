import test from 'node:test';
import assert from 'node:assert/strict';

// Validation logic for Gemini AI interactions & OCR structures
function validateDrugInteractionRequest(medications) {
  if (!Array.isArray(medications) || medications.length < 2) {
    return { valid: false, error: 'At least 2 medications required for interaction checking' };
  }
  for (const med of medications) {
    if (!med.name || typeof med.name !== 'string' || med.name.trim().length === 0) {
      return { valid: false, error: 'Each medication must have a non-empty name' };
    }
  }
  return { valid: true };
}

function parseGeminiInteractionResponse(rawText) {
  // Clean markdown fences if any
  const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
  try {
    const data = JSON.parse(cleaned);
    const hasRequiredFields = 'hasInteractions' in data && 'severity' in data && 'summary' in data;
    return { success: hasRequiredFields, data };
  } catch {
    return { success: false, data: null };
  }
}

function parsePrescriptionOCR(rawText) {
  const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
  try {
    const data = JSON.parse(cleaned);
    const isValid = Boolean(data.name && data.dosage && data.frequency);
    return { success: isValid, data };
  } catch {
    return { success: false, data: null };
  }
}

test('Gemini Clinical AI Suite', async (t) => {
  await t.test('validates minimum 2 medications for interaction check', () => {
    assert.equal(validateDrugInteractionRequest([]).valid, false);
    assert.equal(validateDrugInteractionRequest([{ name: 'Metformin' }]).valid, false);
    assert.equal(
      validateDrugInteractionRequest([{ name: 'Metformin' }, { name: 'Lisinopril' }]).valid,
      true
    );
  });

  await t.test('rejects medications with blank names', () => {
    assert.equal(
      validateDrugInteractionRequest([{ name: '' }, { name: 'Lisinopril' }]).valid,
      false
    );
  });

  await t.test('parses structured JSON interaction response from Gemini', () => {
    const mockGeminiOutput = `\`\`\`json
{
  "hasInteractions": true,
  "severity": "moderate",
  "summary": "Atorvastatin with grapefruit causes elevated serum levels. Lisinopril requires potassium monitoring.",
  "interactions": [
    {
      "drugs": ["Atorvastatin", "Grapefruit"],
      "severity": "high",
      "mechanism": "CYP3A4 inhibition",
      "recommendation": "Avoid all grapefruit products."
    }
  ],
  "disclaimer": "Consult your physician before changing medication schedules."
}
\`\`\``;

    const parsed = parseGeminiInteractionResponse(mockGeminiOutput);
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.hasInteractions, true);
    assert.equal(parsed.data.severity, 'moderate');
    assert.equal(parsed.data.interactions.length, 1);
  });

  await t.test('parses prescription OCR output from Gemini Vision', () => {
    const mockVisionOutput = `\`\`\`json
{
  "name": "Metformin HCl",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "instructions": "Take 1 tablet twice daily with meals",
  "refillCount": 3,
  "doctorName": "Dr. Jennifer Chen",
  "rxNumber": "RX-849201"
}
\`\`\``;

    const parsed = parsePrescriptionOCR(mockVisionOutput);
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.name, 'Metformin HCl');
    assert.equal(parsed.data.dosage, '500mg');
    assert.equal(parsed.data.frequency, 'twice_daily');
  });
});

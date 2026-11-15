import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function checkDrugInteractions(medications: string[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a clinical pharmacist AI assistant for CareSync, an elderly care platform.

Analyze the following medication list for potential drug interactions, contraindications, and safety concerns:

Medications: ${medications.join(', ')}

Provide:
1. Any dangerous drug-drug interactions (flag as HIGH/MEDIUM/LOW risk)
2. Common side effects to watch for in elderly patients
3. Food/drink interactions (e.g., grapefruit, alcohol)
4. Best times to take these medications relative to meals
5. Any special storage requirements

Format your response as clear, simple language suitable for elderly patients and family caregivers.
Always recommend consulting their doctor before making any changes.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function answerHealthQuestion(question: string, patientMedications: string[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a friendly, compassionate health assistant on the CareSync elderly care platform.

Patient's current medications: ${patientMedications.length > 0 ? patientMedications.join(', ') : 'None listed'}

The patient or caregiver is asking: "${question}"

Answer in simple, clear language suitable for elderly individuals and their families. 
- Use large clear sentences (avoid medical jargon)
- If the question involves a potential emergency, say "CALL 911 IMMEDIATELY" first
- Always recommend consulting their doctor for medical decisions
- Keep answers friendly, reassuring, and practical
- If you are not sure, say so clearly and suggest speaking with a pharmacist or doctor`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function extractMedicationFromPrescription(imageBase64: string, mimeType: string): Promise<{
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  refills?: number;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a medical data extraction assistant. Analyze this prescription or medication label image.

Extract and return ONLY a JSON object with these fields:
{
  "name": "medication name",
  "dosage": "strength/dosage (e.g. 500mg)",
  "frequency": "how often (e.g. twice daily, every 8 hours)",
  "instructions": "special instructions (e.g. take with food)",
  "refills": number_of_refills_or_null
}

If you cannot read a field clearly, use null for that field.
Return ONLY the JSON object, no other text.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: mimeType as 'image/jpeg' | 'image/png',
        data: imageBase64,
      },
    },
  ]);

  const text = result.response.text().trim();
  // Strip markdown code blocks if present
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

export async function generateAdherenceInsight(
  medicationName: string,
  adherenceRate: number,
  missedDoses: number,
  period: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a compassionate health coach on CareSync, an elderly care platform.

Medication: ${medicationName}
Adherence rate: ${adherenceRate}% over the last ${period}
Missed doses: ${missedDoses}

Write a short (2-3 sentences), encouraging, and actionable insight for the patient or caregiver.
- If adherence is >90%: celebrate the great job, give encouragement
- If adherence is 70-90%: acknowledge effort, give 1 gentle practical tip
- If adherence is <70%: express concern kindly, suggest speaking with doctor, give 1 simple tip
Keep the tone warm and supportive, never judgmental.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

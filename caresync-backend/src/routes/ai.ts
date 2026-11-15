import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkDrugInteractions, answerHealthQuestion, extractMedicationFromPrescription, generateAdherenceInsight } from '../services/geminiService';
import { body, validationResult } from 'express-validator';

const router = Router();

// POST /api/ai/drug-interactions
router.post('/drug-interactions',
  authenticate,
  [body('medications').isArray({ min: 1 })],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const result = await checkDrugInteractions(req.body.medications);
      res.json({ analysis: result });
    } catch {
      res.status(500).json({ error: 'AI analysis failed' });
    }
  }
);

// POST /api/ai/ask
router.post('/ask',
  authenticate,
  [
    body('question').trim().isLength({ min: 3 }),
    body('medications').optional().isArray(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const { question, medications } = req.body;
      const answer = await answerHealthQuestion(question, medications || []);
      res.json({ answer });
    } catch {
      res.status(500).json({ error: 'AI assistant failed' });
    }
  }
);

// POST /api/ai/scan-prescription — Gemini Vision OCR
router.post('/scan-prescription',
  authenticate,
  [
    body('imageBase64').notEmpty(),
    body('mimeType').isIn(['image/jpeg', 'image/png', 'image/webp']),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const { imageBase64, mimeType } = req.body;
      const result = await extractMedicationFromPrescription(imageBase64, mimeType);
      res.json({ extracted: result });
    } catch {
      res.status(500).json({ error: 'Prescription scan failed' });
    }
  }
);

// POST /api/ai/adherence-insight
router.post('/adherence-insight',
  authenticate,
  [
    body('medicationName').notEmpty(),
    body('adherenceRate').isNumeric(),
    body('missedDoses').isNumeric(),
    body('period').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    try {
      const { medicationName, adherenceRate, missedDoses, period } = req.body;
      const insight = await generateAdherenceInsight(medicationName, adherenceRate, missedDoses, period);
      res.json({ insight });
    } catch {
      res.status(500).json({ error: 'Insight generation failed' });
    }
  }
);

export default router;

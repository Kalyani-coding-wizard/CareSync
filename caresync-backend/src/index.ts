import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeFirebase } from './services/firebaseService';

// Routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import medicationRoutes from './routes/medications';
import adherenceRoutes from './routes/adherence';
import appointmentRoutes from './routes/appointments';
import reminderRoutes from './routes/reminders';
import aiRoutes from './routes/ai';
import sosRoutes from './routes/sos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Firebase Admin
initializeFirebase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (required for Cloud Run)
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'caresync-api' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sos', sosRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏥 CareSync API running on port ${PORT}`);
});

export default app;

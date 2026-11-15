import { Request, Response, NextFunction } from 'express';
import { auth } from '../services/firebaseService';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      role: decoded.role || 'elderly',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient role' });
      return;
    }
    next();
  };
}

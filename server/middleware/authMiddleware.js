import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_awdf';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function validateTask(req, res, next) {
  const { title } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }
  next();
}

export function validateRegister(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.trim()) {
    return res.status(400).json({ message: 'Valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  next();
}

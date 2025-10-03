const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔐 Check for Authorization header and Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🔍 Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Attach user info to request (e.g., id, role, email, etc.)
    req.user = {
      id: decoded.id,         // Unique user _id from DB (PM, Employee, etc.)
      role: decoded.role,     // Optional: if you include role in token
      email: decoded.email,   // Optional: if email is part of token
    };

    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    return res.status(401).json({ error: 'Invalid token. Please log in again.' });
  }
};

module.exports = verifyToken;
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Accesso negato, token mancante' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback_123');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token non valido o scaduto' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Privilegi insufficienti' });
    }
    next();
  };
};

module.exports = { protect, authorize };

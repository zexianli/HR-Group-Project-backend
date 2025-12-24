import { verifyJWTToken } from "../utils/jwtUtils.js";

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const decoded = verifyJWTToken(token);

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Employee Only
export function employeeOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  if (req.user.role !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Access denied, employees only' });
  }

  next();
}

// HR Only
export function hrOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  if (req.user.role !== 'HR') {
    return res.status(403).json({ message: 'Access denied, HR only' });
  }

  next();
}

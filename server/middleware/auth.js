import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authRoute = async (req, res, next) => {
  try {
    // ✅ Check both formats: custom "token" header and standard "Authorization: Bearer <token>"
    const token =
      req.headers.token ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // ✅ Find user in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // ✅ Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

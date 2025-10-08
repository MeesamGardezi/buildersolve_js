const { db } = require('../config/firebase');
const { AuthorizationError } = require('../utils/errors');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      throw new AuthorizationError('Authentication required');
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      throw new AuthorizationError('User not found');
    }

    const userData = userDoc.data();

    if (!userData.isAdmin) {
      throw new AuthorizationError('Admin access required');
    }

    req.admin = {
      uid: req.user.uid,
      email: req.user.email
    };

    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message }
      });
    }
    return res.status(403).json({
      success: false,
      error: { message: 'Authorization failed' }
    });
  }
};

module.exports = {
  requireAdmin
};
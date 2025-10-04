import { db } from '../config/firebase.js';
import { AuthorizationError } from '../utils/errors.js';
import { errorResponse } from '../utils/responses.js';

export const requireAdmin = async (req, res, next) => {
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
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Authorization failed', 403);
  }
};
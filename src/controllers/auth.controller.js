import { db, auth } from '../config/firebase.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

export const register = async (req, res, next) => {
  try {
    const { displayName, email, bio } = req.body;
    const uid = req.user.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      throw new ConflictError('User profile already exists');
    }

    const userData = {
      displayName,
      email,
      bio: bio || null,
      profilePicUrl: null,
      createdAt: new Date(),
      strikeCount: 0,
      totalUploads: 0,
      impactScore: 0,
      followerCount: 0,
      followingCount: 0,
      isAdmin: false
    };

    await userRef.set(userData);

    return successResponse(res, { uid, ...userData }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new NotFoundError('User profile not found');
    }

    const userData = userDoc.data();

    return successResponse(res, { uid, ...userData }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { displayName, bio, profilePicUrl } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new NotFoundError('User profile not found');
    }

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicUrl !== undefined) updateData.profilePicUrl = profilePicUrl;

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();

    return successResponse(res, { uid, ...updatedData }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const uid = req.user.uid;

    await db.collection('users').doc(uid).delete();

    await auth.deleteUser(uid);

    return successResponse(res, null, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};
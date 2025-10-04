import { auth } from '../config/firebase.js';

export const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

export const isValidCategory = (category) => {
  const validCategories = ['nature', 'philosophy', 'skills', 'art', 'science', 'other'];
  return validCategories.includes(category);
};

export const calculateCompletionRate = (completions, totalViews) => {
  if (totalViews === 0) return 0;
  return (completions / totalViews) * 100;
};

export const isAllCaps = (str) => {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase() && letters.length > 3;
};
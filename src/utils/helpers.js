const { auth } = require('../config/firebase');

const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const generateUniqueId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

const isValidCategory = (category) => {
  const validCategories = ['nature', 'philosophy', 'skills', 'art', 'science', 'other'];
  return validCategories.includes(category.toLowerCase());
};

const calculateCompletionRate = (completions, totalViews) => {
  if (totalViews === 0) return 0;
  return (completions / totalViews) * 100;
};

const isAllCaps = (str) => {
  const letters = str.replace(/[^a-zA-Z]/g, '');
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase() && letters.length > 3;
};

module.exports = {
  verifyFirebaseToken,
  generateUniqueId,
  sanitizeString,
  isValidCategory,
  calculateCompletionRate,
  isAllCaps
};
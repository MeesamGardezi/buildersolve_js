const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  createVideo,
  getFeed,
  getFollowingFeed,
  getCategoryFeed,
  getVideoById,
  trackView,
  trackCompletion,
  trackSkip,
  updateVideo,
  deleteVideo,
} = require('./video.controller');

/**
 * Video Routes
 * Base path: /api/videos
 */

// Public routes (optional auth)
router.get('/feed', optionalAuth, getFeed);
router.get('/category/:category', optionalAuth, getCategoryFeed);
router.get('/:videoId', optionalAuth, getVideoById);
router.post('/:videoId/view', trackView);

// Protected routes (auth required)
// Upload URL route REMOVED - frontend uploads directly to Firebase Storage
router.post('/', authenticate, createVideo);
router.get('/following/feed', authenticate, getFollowingFeed);
router.post('/:videoId/complete', authenticate, trackCompletion);
router.post('/:videoId/skip', authenticate, trackSkip);
router.put('/:videoId', authenticate, updateVideo);
router.delete('/:videoId', authenticate, deleteVideo);

module.exports = router;
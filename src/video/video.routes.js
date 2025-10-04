const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUploadUrl,
  createVideo,
  getFeed,
  getFollowingFeed,
  getCategoryFeed,
  getVideoById,
  getUserVideos,
  trackView,
  trackCompletion,
  trackSkip,
  saveVideo,
  unsaveVideo,
  getSavedVideos,
  updateVideo,
  deleteVideo,
} = require('./video.controller');

/**
 * Video Routes
 * Base path: /api/videos
 */

// Public routes (no auth required)
router.get('/feed', getFeed); // Can be accessed without auth
router.get('/category/:category', getCategoryFeed); // Can be accessed without auth
router.get('/:videoId', getVideoById); // Can be accessed without auth

// Protected routes (auth required)
router.post('/upload-url', authenticate, getUploadUrl);
router.post('/', authenticate, createVideo);
router.get('/following', authenticate, getFollowingFeed);
router.post('/:videoId/view', trackView); // Optional auth
router.post('/:videoId/complete', authenticate, trackCompletion);
router.post('/:videoId/skip', authenticate, trackSkip);
router.put('/:videoId', authenticate, updateVideo);
router.delete('/:videoId', authenticate, deleteVideo);

module.exports = router;
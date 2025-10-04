const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserVideos,
  saveVideo,
  unsaveVideo,
  getSavedVideos,
} = require('../video/video.controller');

/**
 * User Routes
 * Base path: /api/users
 */

// Get user's uploaded videos (public)
router.get('/:userId/videos', getUserVideos);

// Saved videos routes (protected)
router.get('/me/saved', authenticate, getSavedVideos);
router.post('/me/saved/:videoId', authenticate, saveVideo);
router.delete('/me/saved/:videoId', authenticate, unsaveVideo);

module.exports = router;
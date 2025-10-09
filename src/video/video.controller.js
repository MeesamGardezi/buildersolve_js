const VideoModel = require('./video.model');
const { admin } = require('../config/firebase');

/**
 * Video Controllers
 * Handles business logic for video operations
 */

/**
 * Create video metadata (video already uploaded to storage by client)
 * POST /api/videos
 */
exports.createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      videoUrl,
      storagePath,
      thumbnailUrl,
      duration,
    } = req.body;

    // Validation
    if (!title || !category || !videoUrl || !storagePath) {
      return res.status(400).json({
        success: false,
        error: { message: 'title, category, videoUrl, and storagePath are required' },
      });
    }

    const validCategories = ['nature', 'philosophy', 'skills', 'art', 'science', 'other'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid category' },
      });
    }

    // Get user info
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Create video in Firestore
    const video = await VideoModel.createVideo({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category.toLowerCase(),
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      duration: duration || 0,
      uploaderId: req.user.uid,
      uploaderName: userData.displayName || req.user.email,
      uploaderProfilePic: userData.profilePicUrl || '',
    });

    // Update user's total uploads count
    if (userDoc.exists) {
      await admin
        .firestore()
        .collection('users')
        .doc(req.user.uid)
        .update({
          totalUploads: admin.firestore.FieldValue.increment(1),
        });
    }

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error('Create video error:', error);
    next(error);
  }
};

/**
 * Get feed videos
 * GET /api/videos/feed
 */
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Limit cannot exceed 50' },
      });
    }

    const userId = req.user ? req.user.uid : null;
    const result = await VideoModel.getFeedVideos(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get following feed
 * GET /api/videos/following
 */
exports.getFollowingFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Limit cannot exceed 50' },
      });
    }

    const result = await VideoModel.getFollowingFeedVideos(req.user.uid, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category feed
 * GET /api/videos/category/:category
 */
exports.getCategoryFeed = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const validCategories = ['nature', 'philosophy', 'skills', 'art', 'science', 'other'];
    if (!validCategories.includes(category.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid category' },
      });
    }

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Limit cannot exceed 50' },
      });
    }

    const userId = req.user ? req.user.uid : null;
    const result = await VideoModel.getCategoryVideos(
      category.toLowerCase(),
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single video by ID
 * GET /api/videos/:videoId
 */
exports.getVideoById = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const userId = req.user ? req.user.uid : null;

    const video = await VideoModel.getVideoById(videoId, userId);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's uploaded videos
 * GET /api/users/:userId/videos
 */
exports.getUserVideos = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Limit cannot exceed 50' },
      });
    }

    const result = await VideoModel.getUserVideos(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track video view
 * POST /api/videos/:videoId/view
 */
exports.trackView = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    await VideoModel.incrementViewCount(videoId);

    res.status(200).json({
      success: true,
      data: { message: 'View tracked' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track video completion
 * POST /api/videos/:videoId/complete
 */
exports.trackCompletion = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { watchDuration } = req.body;

    await VideoModel.incrementCompletionCount(videoId);

    res.status(200).json({
      success: true,
      data: { message: 'Completion tracked' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track video skip
 * POST /api/videos/:videoId/skip
 */
exports.trackSkip = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { watchDuration } = req.body;

    await VideoModel.incrementSkipCount(videoId);

    res.status(200).json({
      success: true,
      data: { message: 'Skip tracked' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save video
 * POST /api/users/me/saved/:videoId
 */
exports.saveVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    // Check if video exists
    const video = await VideoModel.getVideoById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' },
      });
    }

    await VideoModel.saveVideo(req.user.uid, videoId);

    res.status(200).json({
      success: true,
      data: { isSaved: true, message: 'Video saved' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unsave video
 * DELETE /api/users/me/saved/:videoId
 */
exports.unsaveVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    await VideoModel.unsaveVideo(req.user.uid, videoId);

    res.status(200).json({
      success: true,
      data: { isSaved: false, message: 'Video unsaved' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get saved videos
 * GET /api/users/me/saved
 */
exports.getSavedVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: { message: 'Limit cannot exceed 50' },
      });
    }

    const result = await VideoModel.getSavedVideos(req.user.uid, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update video
 * PUT /api/videos/:videoId
 */
exports.updateVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, description, category, thumbnailUrl } = req.body;

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) {
      const validCategories = ['nature', 'philosophy', 'skills', 'art', 'science', 'other'];
      if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid category' },
        });
      }
      updateData.category = category.toLowerCase();
    }
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;

    const video = await VideoModel.updateVideo(videoId, req.user.uid, updateData);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
};

/**
 * Delete video
 * DELETE /api/videos/:videoId
 */
exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const result = await VideoModel.deleteVideo(videoId, req.user.uid);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' },
      });
    }

    // Update user's total uploads count
    await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .update({
        totalUploads: admin.firestore.FieldValue.increment(-1),
      });

    res.status(200).json({
      success: true,
      data: { message: 'Video deleted successfully' },
    });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: { message: error.message },
      });
    }
    next(error);
  }
};
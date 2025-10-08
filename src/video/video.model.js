const { admin, db } = require('../config/firebase');

/**
 * Video Model
 * Handles all Firestore operations for videos
 */

const VIDEOS_COLLECTION = 'videos';
const SAVED_VIDEOS_COLLECTION = 'savedVideos';

class VideoModel {
  /**
   * Create a new video document
   */
  static async createVideo(videoData) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc();
      const videoId = videoRef.id;

      const video = {
        videoId,
        title: videoData.title,
        description: videoData.description || '',
        category: videoData.category,
        videoUrl: videoData.videoUrl,
        thumbnailUrl: videoData.thumbnailUrl || '',
        duration: videoData.duration || 0,
        uploaderId: videoData.uploaderId,
        uploaderName: videoData.uploaderName || '',
        uploaderProfilePic: videoData.uploaderProfilePic || '',
        viewCount: 0,
        completionCount: 0,
        skipCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await videoRef.set(video);
      return { videoId, ...video, createdAt: new Date(), updatedAt: new Date() };
    } catch (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  /**
   * Get video by ID
   */
  static async getVideoById(videoId, userId = null) {
    try {
      const videoDoc = await db.collection(VIDEOS_COLLECTION).doc(videoId).get();

      if (!videoDoc.exists) {
        return null;
      }

      const video = videoDoc.data();

      // Check if user has saved this video
      if (userId) {
        const savedDoc = await db
          .collection(SAVED_VIDEOS_COLLECTION)
          .doc(`${userId}_${videoId}`)
          .get();
        video.isSaved = savedDoc.exists;
      } else {
        video.isSaved = false;
      }

      return video;
    } catch (error) {
      throw new Error(`Failed to get video: ${error.message}`);
    }
  }

  /**
   * Get feed videos with pagination
   */
  static async getFeedVideos(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const snapshot = await db.collection(VIDEOS_COLLECTION).get();
      const totalVideos = snapshot.size;
      const totalPages = Math.ceil(totalVideos / limit);

      // Get paginated videos
      const videosSnapshot = await db
        .collection(VIDEOS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const videos = [];
      for (const doc of videosSnapshot.docs) {
        const video = doc.data();
        
        // Check if user saved this video
        if (userId) {
          const savedDoc = await db
            .collection(SAVED_VIDEOS_COLLECTION)
            .doc(`${userId}_${video.videoId}`)
            .get();
          video.isSaved = savedDoc.exists;
        } else {
          video.isSaved = false;
        }

        videos.push(video);
      }

      return {
        videos,
        pagination: {
          page,
          limit,
          totalPages,
          totalVideos,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get feed videos: ${error.message}`);
    }
  }

  /**
   * Get videos from followed users
   */
  static async getFollowingFeedVideos(userId, page = 1, limit = 20) {
    try {
      // First get the list of users this user follows
      const followingSnapshot = await db
        .collection('following')
        .where('followerId', '==', userId)
        .get();

      const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);

      if (followingIds.length === 0) {
        return {
          videos: [],
          pagination: { page, limit, totalPages: 0, totalVideos: 0 },
        };
      }

      const offset = (page - 1) * limit;

      // Get videos from followed users
      // Note: Firestore 'in' queries are limited to 10 items
      // For production, consider batching or alternative approach
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < followingIds.length; i += batchSize) {
        batches.push(followingIds.slice(i, i + batchSize));
      }

      let allVideos = [];
      for (const batch of batches) {
        const snapshot = await db
          .collection(VIDEOS_COLLECTION)
          .where('uploaderId', 'in', batch)
          .orderBy('createdAt', 'desc')
          .get();

        allVideos = allVideos.concat(snapshot.docs.map(doc => doc.data()));
      }

      // Sort all videos by createdAt
      allVideos.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      const totalVideos = allVideos.length;
      const totalPages = Math.ceil(totalVideos / limit);
      const paginatedVideos = allVideos.slice(offset, offset + limit);

      // Check saved status for each video
      const videos = [];
      for (const video of paginatedVideos) {
        const savedDoc = await db
          .collection(SAVED_VIDEOS_COLLECTION)
          .doc(`${userId}_${video.videoId}`)
          .get();
        video.isSaved = savedDoc.exists;
        videos.push(video);
      }

      return {
        videos,
        pagination: { page, limit, totalPages, totalVideos },
      };
    } catch (error) {
      throw new Error(`Failed to get following feed: ${error.message}`);
    }
  }

  /**
   * Get videos by category
   */
  static async getCategoryVideos(category, userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Get total count for category
      const countSnapshot = await db
        .collection(VIDEOS_COLLECTION)
        .where('category', '==', category)
        .get();
      const totalVideos = countSnapshot.size;
      const totalPages = Math.ceil(totalVideos / limit);

      // Get paginated videos
      const videosSnapshot = await db
        .collection(VIDEOS_COLLECTION)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const videos = [];
      for (const doc of videosSnapshot.docs) {
        const video = doc.data();
        
        if (userId) {
          const savedDoc = await db
            .collection(SAVED_VIDEOS_COLLECTION)
            .doc(`${userId}_${video.videoId}`)
            .get();
          video.isSaved = savedDoc.exists;
        } else {
          video.isSaved = false;
        }

        videos.push(video);
      }

      return {
        videos,
        pagination: { page, limit, totalPages, totalVideos },
      };
    } catch (error) {
      throw new Error(`Failed to get category videos: ${error.message}`);
    }
  }

  /**
   * Get videos uploaded by a specific user
   */
  static async getUserVideos(uploaderId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const countSnapshot = await db
        .collection(VIDEOS_COLLECTION)
        .where('uploaderId', '==', uploaderId)
        .get();
      const totalVideos = countSnapshot.size;
      const totalPages = Math.ceil(totalVideos / limit);

      const videosSnapshot = await db
        .collection(VIDEOS_COLLECTION)
        .where('uploaderId', '==', uploaderId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const videos = videosSnapshot.docs.map(doc => ({
        ...doc.data(),
        isSaved: false,
      }));

      return {
        videos,
        pagination: { page, limit, totalPages, totalVideos },
      };
    } catch (error) {
      throw new Error(`Failed to get user videos: ${error.message}`);
    }
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(videoId) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc(videoId);
      await videoRef.update({
        viewCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }
  }

  /**
   * Increment completion count
   */
  static async incrementCompletionCount(videoId) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc(videoId);
      await videoRef.update({
        completionCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to increment completion count: ${error.message}`);
    }
  }

  /**
   * Increment skip count
   */
  static async incrementSkipCount(videoId) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc(videoId);
      await videoRef.update({
        skipCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to increment skip count: ${error.message}`);
    }
  }

  /**
   * Save video for user
   */
  static async saveVideo(userId, videoId) {
    try {
      const savedVideoRef = db
        .collection(SAVED_VIDEOS_COLLECTION)
        .doc(`${userId}_${videoId}`);

      await savedVideoRef.set({
        userId,
        videoId,
        savedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to save video: ${error.message}`);
    }
  }

  /**
   * Unsave video for user
   */
  static async unsaveVideo(userId, videoId) {
    try {
      const savedVideoRef = db
        .collection(SAVED_VIDEOS_COLLECTION)
        .doc(`${userId}_${videoId}`);

      await savedVideoRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Failed to unsave video: ${error.message}`);
    }
  }

  /**
   * Get user's saved videos
   */
  static async getSavedVideos(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Get all saved video IDs for user
      const savedSnapshot = await db
        .collection(SAVED_VIDEOS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('savedAt', 'desc')
        .get();

      const savedVideoIds = savedSnapshot.docs.map(doc => doc.data().videoId);
      const totalVideos = savedVideoIds.length;
      const totalPages = Math.ceil(totalVideos / limit);

      if (savedVideoIds.length === 0) {
        return {
          videos: [],
          pagination: { page, limit, totalPages: 0, totalVideos: 0 },
        };
      }

      // Get paginated video IDs
      const paginatedIds = savedVideoIds.slice(offset, offset + limit);

      // Fetch actual video data
      const batchSize = 10;
      const videos = [];

      for (let i = 0; i < paginatedIds.length; i += batchSize) {
        const batch = paginatedIds.slice(i, i + batchSize);
        const videosSnapshot = await db
          .collection(VIDEOS_COLLECTION)
          .where('videoId', 'in', batch)
          .get();

        videosSnapshot.docs.forEach(doc => {
          videos.push({ ...doc.data(), isSaved: true });
        });
      }

      return {
        videos,
        pagination: { page, limit, totalPages, totalVideos },
      };
    } catch (error) {
      throw new Error(`Failed to get saved videos: ${error.message}`);
    }
  }

  /**
   * Update video metadata
   */
  static async updateVideo(videoId, uploaderId, updateData) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc(videoId);
      const videoDoc = await videoRef.get();

      if (!videoDoc.exists) {
        return null;
      }

      const video = videoDoc.data();

      // Only uploader can update their video
      if (video.uploaderId !== uploaderId) {
        throw new Error('Unauthorized to update this video');
      }

      const allowedUpdates = ['title', 'description', 'category', 'thumbnailUrl'];
      const updates = {};

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await videoRef.update(updates);

      return { ...video, ...updates, updatedAt: new Date() };
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  /**
   * Delete video
   */
  static async deleteVideo(videoId, uploaderId) {
    try {
      const videoRef = db.collection(VIDEOS_COLLECTION).doc(videoId);
      const videoDoc = await videoRef.get();

      if (!videoDoc.exists) {
        return null;
      }

      const video = videoDoc.data();

      // Only uploader can delete their video
      if (video.uploaderId !== uploaderId) {
        throw new Error('Unauthorized to delete this video');
      }

      await videoRef.delete();

      // Also delete all saved references
      const savedSnapshot = await db
        .collection(SAVED_VIDEOS_COLLECTION)
        .where('videoId', '==', videoId)
        .get();

      const batch = db.batch();
      savedSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return true;
    } catch (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }
}

module.exports = VideoModel;
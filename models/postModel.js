const initializeFirebase = require('../config/firebaseConfig');
const db = initializeFirebase();

/**
 * Create a new post
 * @param {object} postData 
 * @returns {string} postId
 */
const createPost = async (postData) => {
  try {
    const newPostRef = db.ref('posts').push();
    const postId = newPostRef.key;
    const post = {
      authorId: postData.authorId,
      status: postData.status || '',
      caption: postData.caption || '',
      mediaUrl: postData.mediaUrl || '',
      mediaType: postData.mediaType || '', // 'image', 'video', etc.
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: {},
      comments: {},
    };
    await newPostRef.set(post);
    return postId;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a post by ID
 * @param {string} postId 
 * @returns {object|null}
 */
const getPostById = async (postId) => {
  try {
    const postSnapshot = await db.ref(`posts/${postId}`).once('value');
    return postSnapshot.exists() ? { id: postSnapshot.key, ...postSnapshot.val() } : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a post
 * @param {string} postId 
 * @param {object} updatedData 
 */
const updatePost = async (postId, updatedData) => {
  try {
    updatedData.updatedAt = Date.now();
    await db.ref(`posts/${postId}`).update(updatedData);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a post
 * @param {string} postId 
 */
const deletePost = async (postId) => {
  try {
    await db.ref(`posts/${postId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Like a post
 * @param {string} postId 
 * @param {string} userId 
 */
const likePost = async (postId, userId) => {
  try {
    await db.ref(`posts/${postId}/likes/${userId}`).set(true);
  } catch (error) {
    throw error;
  }
};

/**
 * Unlike a post
 * @param {string} postId 
 * @param {string} userId 
 */
const unlikePost = async (postId, userId) => {
  try {
    await db.ref(`posts/${postId}/likes/${userId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Add a comment to a post
 * @param {string} postId 
 * @param {object} commentData 
 * @returns {string} commentId
 */
const addComment = async (postId, commentData) => {
  try {
    const newCommentRef = db.ref(`posts/${postId}/comments`).push();
    const commentId = newCommentRef.key;
    const comment = {
      authorId: commentData.authorId,
      content: commentData.content || '',
      mediaUrl: commentData.mediaUrl || '',
      mediaType: commentData.mediaType || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: {},
      replies: {},
    };
    await newCommentRef.set(comment);
    return commentId;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a comment by ID
 * @param {string} postId 
 * @param {string} commentId 
 * @returns {object|null}
 */
const getCommentById = async (postId, commentId) => {
  try {
    const commentSnapshot = await db.ref(`posts/${postId}/comments/${commentId}`).once('value');
    return commentSnapshot.exists() ? { id: commentSnapshot.key, ...commentSnapshot.val() } : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a comment
 * @param {string} postId 
 * @param {string} commentId 
 * @param {object} updatedData 
 */
const updateComment = async (postId, commentId, updatedData) => {
  try {
    updatedData.updatedAt = Date.now();
    await db.ref(`posts/${postId}/comments/${commentId}`).update(updatedData);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a comment
 * @param {string} postId 
 * @param {string} commentId 
 */
const deleteComment = async (postId, commentId) => {
  try {
    await db.ref(`posts/${postId}/comments/${commentId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Like a comment
 * @param {string} postId 
 * @param {string} commentId 
 * @param {string} userId 
 */
const likeComment = async (postId, commentId, userId) => {
  try {
    await db.ref(`posts/${postId}/comments/${commentId}/likes/${userId}`).set(true);
  } catch (error) {
    throw error;
  }
};

/**
 * Unlike a comment
 * @param {string} postId 
 * @param {string} commentId 
 * @param {string} userId 
 */
const unlikeComment = async (postId, commentId, userId) => {
  try {
    await db.ref(`posts/${postId}/comments/${commentId}/likes/${userId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Add a reply to a comment
 * @param {string} postId 
 * @param {string} commentId 
 * @param {object} replyData 
 * @returns {string} replyId
 */
const addReply = async (postId, commentId, replyData) => {
  try {
    const newReplyRef = db.ref(`posts/${postId}/comments/${commentId}/replies`).push();
    const replyId = newReplyRef.key;
    const reply = {
      authorId: replyData.authorId,
      content: replyData.content || '',
      mediaUrl: replyData.mediaUrl || '',
      mediaType: replyData.mediaType || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likes: {},
    };
    await newReplyRef.set(reply);
    return replyId;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a reply by ID
 * @param {string} postId 
 * @param {string} commentId 
 * @param {string} replyId 
 * @returns {object|null}
 */
const getReplyById = async (postId, commentId, replyId) => {
  try {
    const replySnapshot = await db.ref(`posts/${postId}/comments/${commentId}/replies/${replyId}`).once('value');
    return replySnapshot.exists() ? { id: replySnapshot.key, ...replySnapshot.val() } : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a reply
 * @param {string} postId 
 * @param {string} commentId 
 * @param {string} replyId 
 * @param {object} updatedData 
 */
const updateReply = async (postId, commentId, replyId, updatedData) => {
  try {
    updatedData.updatedAt = Date.now();
    await db.ref(`posts/${postId}/comments/${commentId}/replies/${replyId}`).update(updatedData);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a reply
 * @param {string} postId 
 * @param {string} commentId 
 * @param {string} replyId 
 */
const deleteReply = async (postId, commentId, replyId) => {
  try {
    await db.ref(`posts/${postId}/comments/${commentId}/replies/${replyId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all posts (with optional pagination)
 * @returns {array}
 */
const getAllPosts = async () => {
  try {
    const postsSnapshot = await db.ref('posts').orderByChild('createdAt').once('value');
    const postsData = postsSnapshot.val();
    if (!postsData) return [];
    const posts = Object.keys(postsData).map(postId => ({
      id: postId,
      ...postsData[postId],
    }));
    return posts;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  addReply,
  getReplyById,
  updateReply,
  deleteReply,
  getAllPosts,
};

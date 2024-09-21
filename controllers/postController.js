const postModel = require('../models/postModel');
// const { validationResult } = require('express-validator');

/**
 * Create a new post
 */
const createPost = async (req, res) => {
  const authorId = req.user.id;
  const { status, caption } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  try {
    const postData = {
      authorId,
      status,
      caption,
      mediaUrl,
      mediaType,
    };
    const postId = await postModel.createPost(postData);
    return res.status(201).json({ message: 'Post created successfully.', postId });
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ message: 'Server error while creating post.' });
  }
};

/**
 * Get a single post by ID
 */
const getPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    return res.status(200).json({ post });
  } catch (error) {
    console.error('Get Post Error:', error);
    return res.status(500).json({ message: 'Server error while fetching post.' });
  }
};

/**
 * Update a post
 */
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { status, caption } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this post.' });
    }

    const updatedData = {};
    if (status !== undefined) updatedData.status = status;
    if (caption !== undefined) updatedData.caption = caption;
    if (mediaUrl) {
      updatedData.mediaUrl = mediaUrl;
      updatedData.mediaType = mediaType;
    }

    await postModel.updatePost(postId, updatedData);
    return res.status(200).json({ message: 'Post updated successfully.' });
  } catch (error) {
    console.error('Update Post Error:', error);
    return res.status(500).json({ message: 'Server error while updating post.' });
  }
};

/**
 * Delete a post
 */
const deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post.' });
    }

    await postModel.deletePost(postId);
    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return res.status(500).json({ message: 'Server error while deleting post.' });
  }
};

/**
 * Like a post
 */
const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.likes && post.likes[userId]) {
      return res.status(400).json({ message: 'Post already liked.' });
    }

    await postModel.likePost(postId, userId);
    return res.status(200).json({ message: 'Post liked successfully.' });
  } catch (error) {
    console.error('Like Post Error:', error);
    return res.status(500).json({ message: 'Server error while liking post.' });
  }
};

/**
 * Unlike a post
 */
const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (!post.likes || !post.likes[userId]) {
      return res.status(400).json({ message: 'Post is not liked yet.' });
    }

    await postModel.unlikePost(postId, userId);
    return res.status(200).json({ message: 'Post unliked successfully.' });
  } catch (error) {
    console.error('Unlike Post Error:', error);
    return res.status(500).json({ message: 'Server error while unliking post.' });
  }
};

/**
 * Add a comment to a post
 */
const addComment = async (req, res) => {
  const { postId } = req.params;
  const authorId = req.user.id;
  const { content } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: 'Content or media is required for a comment.' });
  }

  try {
    const post = await postModel.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const commentData = {
      authorId,
      content,
      mediaUrl,
      mediaType,
    };
    const commentId = await postModel.addComment(postId, commentData);
    return res.status(201).json({ message: 'Comment added successfully.', commentId });
  } catch (error) {
    console.error('Add Comment Error:', error);
    return res.status(500).json({ message: 'Server error while adding comment.' });
  }
};

/**
 * Update a comment
 */
const updateComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: 'Content or media is required to update the comment.' });
  }

  try {
    const comment = await postModel.getCommentById(postId, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this comment.' });
    }

    const updatedData = {};
    if (content !== undefined) updatedData.content = content;
    if (mediaUrl) {
      updatedData.mediaUrl = mediaUrl;
      updatedData.mediaType = mediaType;
    }

    await postModel.updateComment(postId, commentId, updatedData);
    return res.status(200).json({ message: 'Comment updated successfully.' });
  } catch (error) {
    console.error('Update Comment Error:', error);
    return res.status(500).json({ message: 'Server error while updating comment.' });
  }
};

/**
 * Delete a comment
 */
const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const comment = await postModel.getCommentById(postId, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment.' });
    }

    await postModel.deleteComment(postId, commentId);
    return res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    return res.status(500).json({ message: 'Server error while deleting comment.' });
  }
};

/**
 * Like a comment
 */
const likeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await postModel.getCommentById(postId, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.likes && comment.likes[userId]) {
      return res.status(400).json({ message: 'Comment already liked.' });
    }

    await postModel.likeComment(postId, commentId, userId);
    return res.status(200).json({ message: 'Comment liked successfully.' });
  } catch (error) {
    console.error('Like Comment Error:', error);
    return res.status(500).json({ message: 'Server error while liking comment.' });
  }
};

/**
 * Unlike a comment
 */
const unlikeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await postModel.getCommentById(postId, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (!comment.likes || !comment.likes[userId]) {
      return res.status(400).json({ message: 'Comment is not liked yet.' });
    }

    await postModel.unlikeComment(postId, commentId, userId);
    return res.status(200).json({ message: 'Comment unliked successfully.' });
  } catch (error) {
    console.error('Unlike Comment Error:', error);
    return res.status(500).json({ message: 'Server error while unliking comment.' });
  }
};

/**
 * Add a reply to a comment
 */
const addReply = async (req, res) => {
  const { postId, commentId } = req.params;
  const authorId = req.user.id;
  const { content } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: 'Content or media is required for a reply.' });
  }

  try {
    const comment = await postModel.getCommentById(postId, commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const replyData = {
      authorId,
      content,
      mediaUrl,
      mediaType,
    };
    const replyId = await postModel.addReply(postId, commentId, replyData);
    return res.status(201).json({ message: 'Reply added successfully.', replyId });
  } catch (error) {
    console.error('Add Reply Error:', error);
    return res.status(500).json({ message: 'Server error while adding reply.' });
  }
};

/**
 * Update a reply
 */
const updateReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const { content } = req.body;
  let mediaUrl = '';
  let mediaType = '';

  if (req.file) {
    mediaUrl = req.file.path;        // Cloudinary URL
    mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
  }

  if (!content && !mediaUrl) {
    return res.status(400).json({ message: 'Content or media is required to update the reply.' });
  }

  try {
    const reply = await postModel.getReplyById(postId, commentId, replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found.' });
    }

    if (reply.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this reply.' });
    }

    const updatedData = {};
    if (content !== undefined) updatedData.content = content;
    if (mediaUrl) {
      updatedData.mediaUrl = mediaUrl;
      updatedData.mediaType = mediaType;
    }

    await postModel.updateReply(postId, commentId, replyId, updatedData);
    return res.status(200).json({ message: 'Reply updated successfully.' });
  } catch (error) {
    console.error('Update Reply Error:', error);
    return res.status(500).json({ message: 'Server error while updating reply.' });
  }
};

/**
 * Delete a reply
 */
const deleteReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;

  try {
    const reply = await postModel.getReplyById(postId, commentId, replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found.' });
    }

    if (reply.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this reply.' });
    }

    await postModel.deleteReply(postId, commentId, replyId);
    return res.status(200).json({ message: 'Reply deleted successfully.' });
  } catch (error) {
    console.error('Delete Reply Error:', error);
    return res.status(500).json({ message: 'Server error while deleting reply.' });
  }
};

/**
 * Get all posts
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Get All Posts Error:', error);
    return res.status(500).json({ message: 'Server error while fetching posts.' });
  }
};

module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  addReply,
  updateReply,
  deleteReply,
  getAllPosts,
};

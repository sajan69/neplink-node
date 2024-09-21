const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware'); // Multer middleware

// Create a new post
router.post('/', ensureAuthenticated, upload.single('media'), postController.createPost);

// Get all posts
router.get('/', ensureAuthenticated, postController.getAllPosts);

// Get a single post by ID
router.get('/:postId', ensureAuthenticated, postController.getPost);

// Update a post
router.put('/:postId', ensureAuthenticated, upload.single('media'), postController.updatePost);

// Delete a post
router.delete('/:postId', ensureAuthenticated, postController.deletePost);

// Like a post
router.post('/:postId/like', ensureAuthenticated, postController.likePost);

// Unlike a post
router.post('/:postId/unlike', ensureAuthenticated, postController.unlikePost);

// Add a comment to a post
router.post('/:postId/comments', ensureAuthenticated, upload.single('media'), postController.addComment);

// Update a comment
router.put('/:postId/comments/:commentId', ensureAuthenticated, upload.single('media'), postController.updateComment);

// Delete a comment
router.delete('/:postId/comments/:commentId', ensureAuthenticated, postController.deleteComment);

// Like a comment
router.post('/:postId/comments/:commentId/like', ensureAuthenticated, postController.likeComment);

// Unlike a comment
router.post('/:postId/comments/:commentId/unlike', ensureAuthenticated, postController.unlikeComment);

// Add a reply to a comment
router.post('/:postId/comments/:commentId/replies', ensureAuthenticated, upload.single('media'), postController.addReply);

// Update a reply
router.put('/:postId/comments/:commentId/replies/:replyId', ensureAuthenticated, upload.single('media'), postController.updateReply);

// Delete a reply
router.delete('/:postId/comments/:commentId/replies/:replyId', ensureAuthenticated, postController.deleteReply);

module.exports = router;

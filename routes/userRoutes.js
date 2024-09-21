const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

// Friend Requests
router.post('/send-friend-request', ensureAuthenticated, userController.sendFriendRequest);
router.post('/accept-friend-request', ensureAuthenticated, userController.acceptFriendRequest);
router.post('/decline-friend-request', ensureAuthenticated, userController.declineFriendRequest);
router.post('/cancel-friend-request', ensureAuthenticated, userController.cancelFriendRequest);

// Friends Management
router.post('/remove-friend', ensureAuthenticated, userController.removeFriend);

// Blocking Management
router.post('/block-user', ensureAuthenticated, userController.blockUser);
router.post('/unblock-user', ensureAuthenticated, userController.unblockUser);

// Fetch Friends and Blocked Users
router.get('/friends', ensureAuthenticated, userController.getFriends);
router.get('/blocked-users', ensureAuthenticated, userController.getBlockedUsers);

// Fetch Friend Requests
router.get('/friend-requests/incoming', ensureAuthenticated, userController.getIncomingFriendRequests);
router.get('/friend-requests/outgoing', ensureAuthenticated, userController.getOutgoingFriendRequests);

// Profile Page
router.get('/profile', ensureAuthenticated, userController.getProfile);

// Update Profile (Optional)
router.post('/profile/update', ensureAuthenticated,  userController.updateProfile);

module.exports = router;

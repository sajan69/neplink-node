const userModel = require('../models/userModel');
const postModel = require('../models/postModel');

/**
 * Send a friend request
 */
const sendFriendRequest = async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required.' });
  }

  if (senderId === recipientId) {
    return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
  }

  try {
    const recipient = await userModel.getUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found.' });
    }

    const sender = await userModel.getUserById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender user not found.' });
    }

    // Check if already friends
    if (sender.friends && sender.friends[recipientId]) {
      return res.status(400).json({ message: 'You are already friends with this user.' });
    }

    // Check if a friend request is already sent
    if (sender.friendRequestsSent && sender.friendRequestsSent[recipientId]) {
      return res.status(400).json({ message: 'Friend request already sent.' });
    }

    // Check if recipient has sent a friend request to sender
    if (sender.friendRequestsReceived && sender.friendRequestsReceived[recipientId]) {
      // Auto-accept the friend request
      await userModel.acceptFriendRequest(senderId, recipientId);
      return res.status(200).json({ message: 'Friend request accepted automatically as you have a pending request from the recipient.' });
    }

    // Check if the recipient has blocked the sender or vice versa
    if ((sender.blocked && sender.blocked[recipientId]) || (recipient.blocked && recipient.blocked[senderId])) {
      return res.status(400).json({ message: 'Cannot send friend request due to blocking.' });
    }

    // Send the friend request
    await userModel.sendFriendRequest(senderId, recipientId);
    return res.status(200).json({ message: 'Friend request sent successfully.' });
  } catch (error) {
    console.error('Send Friend Request Error:', error);
    return res.status(500).json({ message: 'Server error while sending friend request.' });
  }
};

/**
 * Accept a friend request
 */
const acceptFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { senderId } = req.body;

  if (!senderId) {
    return res.status(400).json({ message: 'Sender ID is required.' });
  }

  try {
    const sender = await userModel.getUserById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender user not found.' });
    }

    const user = await userModel.getUserById(userId);
    if (!user.friendRequestsReceived || !user.friendRequestsReceived[senderId]) {
      return res.status(400).json({ message: 'No friend request from this user.' });
    }

    // Accept the friend request
    await userModel.acceptFriendRequest(userId, senderId);
    return res.status(200).json({ message: 'Friend request accepted successfully.' });
  } catch (error) {
    console.error('Accept Friend Request Error:', error);
    return res.status(500).json({ message: 'Server error while accepting friend request.' });
  }
};

/**
 * Decline a friend request
 */
const declineFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const { senderId } = req.body;

  if (!senderId) {
    return res.status(400).json({ message: 'Sender ID is required.' });
  }

  try {
    const sender = await userModel.getUserById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender user not found.' });
    }

    const user = await userModel.getUserById(userId);
    if (!user.friendRequestsReceived || !user.friendRequestsReceived[senderId]) {
      return res.status(400).json({ message: 'No friend request from this user.' });
    }

    // Decline the friend request
    await userModel.declineFriendRequest(userId, senderId);
    return res.status(200).json({ message: 'Friend request declined successfully.' });
  } catch (error) {
    console.error('Decline Friend Request Error:', error);
    return res.status(500).json({ message: 'Server error while declining friend request.' });
  }
};

/**
 * Cancel a sent friend request
 */
const cancelFriendRequest = async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required.' });
  }

  try {
    const recipient = await userModel.getUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found.' });
    }

    const sender = await userModel.getUserById(senderId);
    if (!sender.friendRequestsSent || !sender.friendRequestsSent[recipientId]) {
      return res.status(400).json({ message: 'No friend request sent to this user.' });
    }

    // Cancel the friend request
    await userModel.cancelFriendRequest(senderId, recipientId);
    return res.status(200).json({ message: 'Friend request canceled successfully.' });
  } catch (error) {
    console.error('Cancel Friend Request Error:', error);
    return res.status(500).json({ message: 'Server error while canceling friend request.' });
  }
};

/**
 * Get incoming friend requests
 */
const getIncomingFriendRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomingRequests = await userModel.getIncomingFriendRequests(userId);
    return res.status(200).json({ incomingRequests });
  } catch (error) {
    console.error('Get Incoming Friend Requests Error:', error);
    return res.status(500).json({ message: 'Server error while fetching incoming friend requests.' });
  }
};

/**
 * Get outgoing friend requests
 */
const getOutgoingFriendRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const outgoingRequests = await userModel.getOutgoingFriendRequests(userId);
    return res.status(200).json({ outgoingRequests });
  } catch (error) {
    console.error('Get Outgoing Friend Requests Error:', error);
    return res.status(500).json({ message: 'Server error while fetching outgoing friend requests.' });
  }
};

/**
 * Remove a friend
 */
const removeFriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ message: 'Friend ID is required.' });
  }

  if (userId === friendId) {
    return res.status(400).json({ message: 'You cannot remove yourself.' });
  }

  try {
    const friend = await userModel.getUserById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await userModel.getUserById(userId);
    if (!user.friends || !user.friends[friendId]) {
      return res.status(400).json({ message: 'You are not friends with this user.' });
    }

    await userModel.removeFriend(userId, friendId);
    return res.status(200).json({ message: 'Friend removed successfully.' });
  } catch (error) {
    console.error('Remove Friend Error:', error);
    return res.status(500).json({ message: 'Server error while removing friend.' });
  }
};

/**
 * Block a user
 */
const blockUser = async (req, res) => {
  const userId = req.user.id;
  const { blockId } = req.body;

  if (!blockId) {
    return res.status(400).json({ message: 'User ID to block is required.' });
  }

  if (userId === blockId) {
    return res.status(400).json({ message: 'You cannot block yourself.' });
  }

  try {
    const userToBlock = await userModel.getUserById(blockId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await userModel.getUserById(userId);
    if (user.blocked && user.blocked[blockId]) {
      return res.status(400).json({ message: 'User is already blocked.' });
    }

    await userModel.blockUser(userId, blockId);
    return res.status(200).json({ message: 'User blocked successfully.' });
  } catch (error) {
    console.error('Block User Error:', error);
    return res.status(500).json({ message: 'Server error while blocking user.' });
  }
};

/**
 * Unblock a user
 */
const unblockUser = async (req, res) => {
  const userId = req.user.id;
  const { blockId } = req.body;

  if (!blockId) {
    return res.status(400).json({ message: 'User ID to unblock is required.' });
  }

  if (userId === blockId) {
    return res.status(400).json({ message: 'You cannot unblock yourself.' });
  }

  try {
    const user = await userModel.getUserById(userId);
    if (!user.blocked || !user.blocked[blockId]) {
      return res.status(400).json({ message: 'User is not blocked.' });
    }

    await userModel.unblockUser(userId, blockId);
    return res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error('Unblock User Error:', error);
    return res.status(500).json({ message: 'Server error while unblocking user.' });
  }
};

/**
 * Get user's friends
 */
const getFriends = async (req, res) => {
  const userId = req.user.id;

  try {
    const friends = await userModel.getFriends(userId);
    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Get Friends Error:', error);
    return res.status(500).json({ message: 'Server error while fetching friends.' });
  }
};

/**
 * Get user's blocked users
 */
const getBlockedUsers = async (req, res) => {
  const userId = req.user.id;

  try {
    const blockedUsers = await userModel.getBlockedUsers(userId);
    return res.status(200).json({ blockedUsers });
  } catch (error) {
    console.error('Get Blocked Users Error:', error);
    return res.status(500).json({ message: 'Server error while fetching blocked users.' });
  }
};

/**
 * Get Profile Data
 */
const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user details
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).render('error', { message: 'User not found.' });
    }

    // Fetch user's friends
    const friends = await userModel.getFriends(userId);

    // Fetch all posts
    const allPosts = await postModel.getAllPosts();
    const userPosts = allPosts.filter(post => post.authorId === userId);

    return res.render('profile', {
      user,
      friends,
      posts: userPosts,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    // return res.status(500).render('error', { message: 'Server error while fetching profile.' });
  }
};

/**
 * Update User Profile
 * (Optional)
 */
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstname, lastname, email } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    await userModel.updateProfile(userId, { firstname, lastname, email });
    return res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ message: 'Server error while updating profile.' });
  }
}



module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getFriends,
  getBlockedUsers,
  removeFriend,
  blockUser,
  unblockUser,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  getProfile,
  updateProfile,
};

const initializeFirebase = require('../config/firebaseConfig');
const db = initializeFirebase();

/**
 * Get user by ID
 * @param {string} userId 
 * @returns {object|null}
 */
const getUserById = async (userId) => {
  try {
    const userSnapshot = await db.ref(`users/${userId}`).once('value');
    return userSnapshot.exists() ? { id: userSnapshot.key, ...userSnapshot.val() } : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email 
 * @returns {object|null}
 */
const getUserByEmail = async (email) => {
  try {
    const snapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userId = Object.keys(users)[0];
      return { id: userId, ...users[userId] };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by username
 * @param {string} username 
 * @returns {object|null}
 */
const getUserByUsername = async (username) => {
  try {
    const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userId = Object.keys(users)[0];
      return { id: userId, ...users[userId] };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user data
 * @param {string} userId 
 * @param {object} data 
 */
const updateUser = async (userId, data) => {
  try {
    await db.ref(`users/${userId}`).update(data);
  } catch (error) {
    throw error;
  }
};

/**
 * Send a friend request
 * @param {string} senderId 
 * @param {string} recipientId 
 */
const sendFriendRequest = async (senderId, recipientId) => {
  try {
    // Add to sender's sent requests
    await db.ref(`users/${senderId}/friendRequestsSent/${recipientId}`).set(true);
    // Add to recipient's received requests
    await db.ref(`users/${recipientId}/friendRequestsReceived/${senderId}`).set(true);
  } catch (error) {
    throw error;
  }
};

/**
 * Accept a friend request
 * @param {string} userId 
 * @param {string} senderId 
 */
const acceptFriendRequest = async (userId, senderId) => {
  try {
    // Remove from received requests
    await db.ref(`users/${userId}/friendRequestsReceived/${senderId}`).remove();
    // Remove from sender's sent requests
    await db.ref(`users/${senderId}/friendRequestsSent/${userId}`).remove();
    
    // Add each other as friends
    await db.ref(`users/${userId}/friends/${senderId}`).set(true);
    await db.ref(`users/${senderId}/friends/${userId}`).set(true);
  } catch (error) {
    throw error;
  }
};

/**
 * Decline a friend request
 * @param {string} userId 
 * @param {string} senderId 
 */
const declineFriendRequest = async (userId, senderId) => {
  try {
    // Remove from received requests
    await db.ref(`users/${userId}/friendRequestsReceived/${senderId}`).remove();
    // Remove from sender's sent requests
    await db.ref(`users/${senderId}/friendRequestsSent/${userId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel a sent friend request
 * @param {string} senderId 
 * @param {string} recipientId 
 */
const cancelFriendRequest = async (senderId, recipientId) => {
  try {
    // Remove from sender's sent requests
    await db.ref(`users/${senderId}/friendRequestsSent/${recipientId}`).remove();
    // Remove from recipient's received requests
    await db.ref(`users/${recipientId}/friendRequestsReceived/${senderId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Get incoming friend requests
 * @param {string} userId 
 * @returns {array}
 */
const getIncomingFriendRequests = async (userId) => {
  try {
    const snapshot = await db.ref(`users/${userId}/friendRequestsReceived`).once('value');
    if (!snapshot.exists()) return [];
    const requests = snapshot.val();
    const requestIds = Object.keys(requests);
    const users = [];
    for (const id of requestIds) {
      const user = await getUserById(id);
      if (user) users.push(user);
    }
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Get outgoing friend requests
 * @param {string} userId 
 * @returns {array}
 */
const getOutgoingFriendRequests = async (userId) => {
  try {
    const snapshot = await db.ref(`users/${userId}/friendRequestsSent`).once('value');
    if (!snapshot.exists()) return [];
    const requests = snapshot.val();
    const requestIds = Object.keys(requests);
    const users = [];
    for (const id of requestIds) {
      const user = await getUserById(id);
      if (user) users.push(user);
    }
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Add friend (directly, bypassing requests)
 * @param {string} userId 
 * @param {string} friendId 
 */
const addFriend = async (userId, friendId) => {
  try {
    // Add friend to user's friends list
    await db.ref(`users/${userId}/friends/${friendId}`).set(true);
    // Add user to friend's friends list
    await db.ref(`users/${friendId}/friends/${userId}`).set(true);
  } catch (error) {
    throw error;
  }
};

/**
 * Remove friend
 * @param {string} userId 
 * @param {string} friendId 
 */
const removeFriend = async (userId, friendId) => {
  try {
    // Remove friend from user's friends list
    await db.ref(`users/${userId}/friends/${friendId}`).remove();
    // Remove user from friend's friends list
    await db.ref(`users/${friendId}/friends/${userId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Block user
 * @param {string} userId 
 * @param {string} blockId 
 */
const blockUser = async (userId, blockId) => {
  try {
    // Add to blocked
    await db.ref(`users/${userId}/blocked/${blockId}`).set(true);
    // Remove from friends if already friends
    await removeFriend(userId, blockId);
    // Remove any existing friend requests
    await declineFriendRequest(userId, blockId);
    await declineFriendRequest(blockId, userId);
  } catch (error) {
    throw error;
  }
};

/**
 * Unblock user
 * @param {string} userId 
 * @param {string} blockId 
 */
const unblockUser = async (userId, blockId) => {
  try {
    await db.ref(`users/${userId}/blocked/${blockId}`).remove();
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's friends
 * @param {string} userId 
 * @returns {array}
 */
const getFriends = async (userId) => {
  try {
    const userSnapshot = await db.ref(`users/${userId}/friends`).once('value');
    if (!userSnapshot.exists()) return [];
    const friends = userSnapshot.val();
    const friendIds = Object.keys(friends);
    const users = [];
    for (const id of friendIds) {
      const user = await getUserById(id);
      if (user) users.push(user);
    }
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's blocked users
 * @param {string} userId 
 * @returns {array}
 */
const getBlockedUsers = async (userId) => {
  try {
    const userSnapshot = await db.ref(`users/${userId}/blocked`).once('value');
    if (!userSnapshot.exists()) return [];
    const blocked = userSnapshot.val();
    const blockedIds = Object.keys(blocked);
    const users = [];
    for (const id of blockedIds) {
      const user = await getUserById(id);
      if (user) users.push(user);
    }
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  addFriend,
  removeFriend,
  blockUser,
  unblockUser,
  getFriends,
  getBlockedUsers,
};

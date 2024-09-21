const admin = require('firebase-admin');
const serviceAccount = require('../config/neplink-firebase-adminsdk-3g4qu-4ae5341d7a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://neplink-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

const db = admin.database();

const updateUsers = async () => {
  try {
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val();

    if (!users) {
      console.log('No users found.');
      return;
    }

    const updates = {};

    Object.keys(users).forEach(userId => {
      const user = users[userId];
      let needsUpdate = false;

      if (!user.friends || Array.isArray(user.friends)) {
        updates[`users/${userId}/friends`] = {};
        needsUpdate = true;
      }

      if (!user.blocked || Array.isArray(user.blocked)) {
        updates[`users/${userId}/blocked`] = {};
        needsUpdate = true;
      }

      if (!user.bio) {
        updates[`users/${userId}/bio`] = '';
        needsUpdate = true;
      }

      if (!user.profilePic) {
        updates[`users/${userId}/profilePic`] = 'public/img/default.jpg';
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Updating user: ${userId}`);
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      console.log('Users updated successfully.');
    } else {
      console.log('No updates needed.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateUsers();

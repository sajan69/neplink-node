const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseConfig');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

// Middleware to ensure user is authenticated
router.use(ensureAuthenticated);

// Send Message
router.post('/send', async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.googleId || req.user.twitterId || req.user.githubId;
    
    if (!message || !recipientId) {
      return res.status(400).send('Message or recipientId missing');
    }

    const chatRef = db.ref(`chats/${senderId}/${recipientId}`);
    await chatRef.push({ senderId, message, timestamp: Date.now() });
    
    res.status(200).send('Message sent');
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});

// Fetch Messages
router.get('/messages/:recipientId', async (req, res) => {
  try {
    const recipientId = req.params.recipientId;
    const senderId = req.user.googleId || req.user.twitterId || req.user.githubId;
    
    const chatRef = db.ref(`chats/${senderId}/${recipientId}`);
    chatRef.once('value', (snapshot) => {
      res.status(200).json(snapshot.val());
    });
  } catch (error) {
    res.status(500).send('Error fetching messages');
  }
});

module.exports = router;

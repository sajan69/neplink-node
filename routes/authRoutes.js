const express = require('express');
const passport = require('../config/passportConfig');
const router = express.Router();
const bcrypt = require('bcryptjs');
const initializeFirebase = require('../config/firebaseConfig');

const db = initializeFirebase();




// Auth Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/profile'); // Redirect to a protected route or homepage
});

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter'), (req, res) => {
  res.redirect('/profile');
});

router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
}));

router.get('/github/callback', passport.authenticate('github'), (req, res) => {
  res.redirect('/profile');
});


// Registration Route
router.post('/register', async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  // Basic validation
  if (!firstname || !email || !password || !username) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  try {
    const usersRef = db.ref('users');
    // Check if email already exists
    const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
    if (snapshot.exists()) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Check if username is taken
    const snapshotUsername = await usersRef.orderByChild('username').equalTo(username).once('value');
    if (snapshotUsername.exists()) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUserRef = usersRef.push();
    const newUser = {
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      friends: {},
      blocked: {},
      bio: '', // Optional bio
      profilePic: 'public/img/default.jpg', // Default static image path
    };

    await newUserRef.set(newUser);

    // Automatically log in the user after registration
    req.login({ id: newUserRef.key, ...newUser }, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after registration.' });
      }
      return res.status(201).json({ message: 'Registration successful.', user: { id: newUserRef.key, ...newUser } });
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { 
      return res.status(500).json({ message: 'Server error during login.' });
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) { 
        return res.status(500).json({ message: 'Error logging in user.' });
      }
      return res.status(200).json({ message: 'Login successful.', user });
    });
  })(req, res, next);
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});


module.exports = router;

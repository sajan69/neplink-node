const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const initializeFirebase = require('./firebaseConfig');

// Initialize Firebase
const db = initializeFirebase();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userRef = db.ref(`users/${profile.id}`);
    userRef.once('value', async (snapshot) => {
      if (snapshot.exists()) {
        return done(null, snapshot.val());
      }

      const firstname = profile.name?.givenName || 'GoogleUser';
      const lastname = profile.name?.familyName || '';
      const email = profile.emails?.[0]?.value || `${profile.id}@google.com`;
      const username = email.split('@')[0];

      const newUser = {
        firstname,
        lastname,
        username,
        email,
        googleId: profile.id,
        friends: {},
      blocked: {},
      bio: '', // Optional bio
    profilePic: 'public/img/default.jpg' // Default static image path
      };

      await userRef.set(newUser);
      done(null, newUser);
    });
  } catch (error) {
    console.error('Error:', error);
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  // Save the user ID to the session
  done(null, user.googleId || user.twitterId || user.githubId);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    const userRef = db.ref(`users/${id}`);
    userRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        user.id = id; // Include 'id' in user object
        done(null, user);
      } else {
        // If not found by direct ID, search by OAuth IDs
        searchUserByOAuthId(id).then(user => {
          if (user) {
            done(null, user);
          } else {
            done(new Error('User not found'), null);
          }
        });
      }
    });
  } catch (error) {
    done(error, null);
  }
});


// Twitter Strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "/auth/twitter/callback",
}, async (token, tokenSecret, profile, done) => {
  console.log('Twitter Profile:', profile);

  try {
    const userRef = db.ref(`users/${profile.id}`);
    userRef.once('value', async (snapshot) => {
      if (snapshot.exists()) {
        return done(null, snapshot.val());
      }

      const firstname = profile.displayName.split(' ')[0] || 'TwitterUser';
      const lastname = profile.displayName.split(' ')[1] || '';
      const username = profile.username || `twitterUser${profile.id}`;

      const newUser = {
        firstname,
        lastname,
        username,
        twitterId: profile.id,
        friends: {},
      blocked: {},
      bio: '', // Optional bio
    profilePic: 'public/img/default.jpg' // Default static image path
      };

      await userRef.set(newUser);
      done(null, newUser);
    });
  } catch (error) {
    console.error('Error:', error);
    done(error, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
}, async (accessToken, refreshToken, profile, done) => {
  console.log('GitHub Profile:', profile);

  try {
    const userRef = db.ref(`users/${profile.id}`);
    console.log('User Ref:', userRef);
    userRef.once('value', async (snapshot) => {
      if (snapshot.exists()) {
        return done(null, snapshot.val());
      }

      const firstname = profile.displayName.split(' ')[0] || 'GitHubUser';
      const lastname = profile.displayName.split(' ')[1] || '';
      const username = profile.username || `githubUser${profile.id}`;

      const newUser = {
        firstname,
        lastname,
        username,
        githubId: profile.id,
        profileUrl: profile._json.html_url,
        avatarUrl: profile._json.avatar_url,
        friends: {},
      blocked: {},
      bio: bio || '', // Optional bio
    profilePic: profilePic || 'public/img/default.jpg' // Default static image path
      };

      await userRef.set(newUser);
      done(null, newUser);
    });
  } catch (error) {
    console.error('Error:', error);
    done(error, null);
  }
}));


// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use 'email' instead of default 'username'
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const usersRef = db.ref('users');
      const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
      const users = snapshot.val();

      if (!users) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      const userId = Object.keys(users)[0];
      const user = users[userId];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize User
passport.serializeUser((user, done) => {
  // Use a unique identifier, prefer Firebase UID if available
  done(null, user.id || user.googleId || user.twitterId || user.githubId);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
  try {
    const userRef = db.ref(`users/${id}`);
    userRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        done(null, snapshot.val());
      } else {
        // If not found by direct ID, search by OAuth IDs
        searchUserByOAuthId(id).then(user => {
          if (user) {
            done(null, user);
          } else {
            done(new Error('User not found'), null);
          }
        });
      }
    });
  } catch (error) {
    done(error, null);
  }
});

// Helper function to search user by OAuth IDs
const searchUserByOAuthId = async (id) => {
  const usersRef = db.ref('users');
  const snapshot = await usersRef.orderByChild('googleId').equalTo(id).once('value');
  const users = snapshot.val();
  if (users) return Object.values(users)[0];

  const snapshotTwitter = await usersRef.orderByChild('twitterId').equalTo(id).once('value');
  const usersTwitter = snapshotTwitter.val();
  if (usersTwitter) return Object.values(usersTwitter)[0];

  const snapshotGithub = await usersRef.orderByChild('githubId').equalTo(id).once('value');
  const usersGithub = snapshotGithub.val();
  if (usersGithub) return Object.values(usersGithub)[0];

  return null;
};



module.exports = passport;

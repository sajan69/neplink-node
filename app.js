require('dotenv').config();
const express = require('express');
const passport = require('./config/passportConfig');
const session = require('express-session');
const path = require('path');
const initializeFirebase = require('./config/firebaseConfig');
const cloudinaryConfig = require('./config/cloudinaryConfig'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes'); // Import postRoutes
const { ensureAuthenticated } = require('./middlewares/authMiddleware');
const { json, urlencoded } = require('express');
const morgan = require('morgan'); // For logging
const rateLimit = require('express-rate-limit'); // For rate limiting
const { getProfile } = require('./controllers/userController'); // Adjust the path as needed


const app = express();

// Initialize Firebase
initializeFirebase();
console.log('Firebase initialized');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Use morgan for logging HTTP requests
app.use(morgan('combined'));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // Use the session secret from the environment
  resave: false,
  saveUninitialized: false, // Consider setting to false for better security
  cookie: { 
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Body parser
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postRoutes); // Use postRoutes under /posts

// Routes for rendering forms
app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});


// Protected Route Example use controller
app.get('/profile', ensureAuthenticated, getProfile);


// User Management Page
app.get('/user-management', ensureAuthenticated, (req, res) => {
  res.render('userManagement');
});

// Posts Management Page (Optional)
app.get('/posts-management', ensureAuthenticated, (req, res) => {
  res.render('posts'); // Create a posts.ejs view as needed
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
  res.render('login'); // Redirecting to login for simplicity
});

// Export the app for Vercel
module.exports = app;

// If running locally, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

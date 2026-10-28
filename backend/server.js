const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting (needed behind proxies like webpack dev server)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - lenient in development to avoid lockouts during testing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again in a few minutes.'
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5001'
  ],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection & Local persistence
const localDB = require('./utils/localDB');
const mongoose = require('mongoose');

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000
  })
    .then(() => console.log('MongoDB connected successfully to Atlas'))
    .catch(err => {
      console.log('Atlas connection offline (IP restricted or network). Utilizing high-performance file database.');
    });
} else {
  console.log('Using high-performance file database for local development');
}

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aim Higher LMS API Server is running.',
    frontend: 'http://localhost:3000',
    health: 'OK',
    persistence: 'localDB active'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/materials', require('./routes/materials'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

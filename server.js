
// Import required packages
const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

// Load environment variables from .env file if present
try {
  if (fs.existsSync('.env')) {
    require('dotenv').config();
    console.log('Environment loaded from .env file');
  }
} catch (err) {
  console.log('Could not load .env file:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression for faster load times
app.use(compression());

// Basic request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Check if the dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist directory not found. Make sure to run "npm run build" before starting the server.');
  console.log('Current directory:', __dirname);
  console.log('Looking for:', distPath);
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Serve robots.txt if it exists
const robotsPath = path.join(distPath, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  app.get('/robots.txt', (req, res) => {
    res.sendFile(robotsPath);
  });
}

// Handle SPA routing - redirect all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view your application`);
  console.log('=================================');
  console.log('Server environment:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('Supabase URL available:', !!process.env.VITE_SUPABASE_URL);
});

// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

// Kitchen API routes
app.use('/api', require('./kitchen/routes/kitchen'));

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../chat.html'));
});

app.get('/index_EN.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../index_EN.html'));
});

// Kitchen dashboard
app.get('/kitchen', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/kitchen/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Kitchen dashboard: http://localhost:${PORT}/kitchen`);
  console.log(`Health check: http://localhost:${PORT}/healthz`);
});
// server.js - Express app entry point
const express = require('express');
const cors = require('cors');
const { initialize } = require('./db');

const booksRoutes = require('./routes/books');
const authorsRoutes = require('./routes/authors');
const customersRoutes = require('./routes/customers');

const app = express();
app.use(cors());                 // allow the React dev server (localhost:5173) to call us
app.use(express.json());         // parse JSON request bodies

// Simple request log - handy during the demo
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'JL Book Order API is running' }));

app.use('/api/books', booksRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/customers', customersRoutes);

// Central error handler - returns DB error text to the front end
app.use((err, req, res, next) => {
  console.error('[error]', err.message || err);
  res.status(500).json({ error: err.message || 'Unexpected server error' });
});

const PORT = process.env.PORT || 3000;

initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] JL Book Order API listening on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('[server] Failed to connect to Oracle. Check backend/.env');
    console.error(e.message);
    process.exit(1);
  });

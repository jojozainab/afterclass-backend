const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Allow the Vue development server to make requests to this API.
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

// Convert incoming JSON request bodies into JavaScript objects.
app.use(express.json());

// A simple route for checking that the starter server is running.
app.get('/', (req, res) => {
  res.json({ message: 'AfterClass API is running' });
});

app.listen(port, () => {
  console.log(`AfterClass API running at http://localhost:${port}`);
});

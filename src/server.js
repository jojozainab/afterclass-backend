const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { connectDatabase } = require('./db/connection');
const orderRoutes = require('./routes/orders');
const lessonRoutes = require('./routes/lessons');
const searchRoutes = require('./routes/search');
const teacherRoutes = require('./routes/teachers');
const enrolmentRoutes = require('./routes/enrolment');
const { ObjectId } = require('mongodb');
const logger = require('./middleware/logger');

const app = express();
const port = process.env.PORT || 3000;

// Register first so API, image, preflight and invalid requests are logged.
app.use(logger);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../public/images')));
// Static middleware calls next() when a file is missing.
app.use('/images', (req, res) => {
  res.status(404).json({ error: 'Lesson image not found.' });
});
app.use('/orders', orderRoutes);
app.use('/lessons', lessonRoutes);
app.use('/search', searchRoutes);
app.use('/teachers', teacherRoutes);
app.use('/enrolment', enrolmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AfterClass API is running' });
});

app.get('/lessons', async (req, res) => {
  const teacherId = req.query.teacherId;
  if (teacherId !== undefined && (typeof teacherId !== 'string' || !/^[a-fA-F0-9]{24}$/.test(teacherId))) {
    return res.status(400).json({ error: 'Invalid teacher ID.' });
  }
  try {
    const filter = teacherId ? { teacherId: new ObjectId(teacherId) } : {};
    const lessons = await app.locals.database.collection('lesson').find(filter).toArray();
    res.json(lessons);
  } catch {
    res.status(500).json({ error: 'Unable to retrieve lessons. Please try again.' });
  }
});

async function startServer() {
  // Reuse one MongoClient instead of opening a connection for every request.
  const { client, database } = await connectDatabase();
  app.locals.database = database;
  console.log('Connected to MongoDB Atlas');

  const server = app.listen(port, () => {
    console.log(`AfterClass API running at http://localhost:${port}`);
  });

  async function shutdown() {
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  // Do not print credentials or connection strings in startup errors.
  console.error('Database startup failed. Check MONGODB_URI, database credentials and Atlas network access.');
  console.error('Error type:', error.name);
  if (error.code !== undefined) {
    console.error('Error code:', error.code);
  }
  process.exitCode = 1;
});

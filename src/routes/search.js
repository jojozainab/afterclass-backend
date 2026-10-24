const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  if (req.query.q !== undefined && typeof req.query.q !== 'string') {
    return res.status(400).json({ error: 'Search must be a single text value.' });
  }
  const query = (req.query.q || '').trim();
  if (query.length > 100) {
    return res.status(400).json({ error: 'Search must be 100 characters or fewer.' });
  }
  // Escape regex syntax so punctuation is searched as literal text.
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filter = query ? {
    $expr: {
      $or: ['topic', 'location', 'price', 'space'].map((field) => ({
        $regexMatch: {
          input: { $convert: { input: `$${field}`, to: 'string', onError: '', onNull: '' } },
          regex: pattern,
          options: 'i',
        },
      })),
    },
  } : {};
  try {
    const lessons = await req.app.locals.database.collection('lesson').find(filter).toArray();
    res.json(lessons);
  } catch {
    res.status(500).json({ error: 'Unable to search lessons. Please try again.' });
  }
});

module.exports = router;

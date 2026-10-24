const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teachers = await req.app.locals.database.collection('teacher')
      .find({}).sort({ lastName: 1, firstName: 1 }).toArray();
    res.json(teachers);
  } catch {
    res.status(500).json({ error: 'Unable to retrieve teachers. Please try again.' });
  }
});

module.exports = router;

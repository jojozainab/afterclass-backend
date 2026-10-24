const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/:lessonid', async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.lessonid)) {
    return res.status(400).json({ error: 'Invalid lesson ID.' });
  }
  try {
    const database = req.app.locals.database;
    const lessonId = new ObjectId(req.params.lessonid);
    const lesson = await database.collection('lesson').findOne({ _id: lessonId });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Sum purchased quantities, not the number of orders or remaining spaces.
    const totals = await database.collection('order').aggregate([
      { $match: { 'items.lessonId': lessonId } },
      { $unwind: '$items' },
      { $match: { 'items.lessonId': lessonId } },
      { $group: { _id: null, enrolment: { $sum: '$items.quantity' } } },
    ]).toArray();

    res.json({ lessonId: lessonId.toHexString(), enrolment: totals[0]?.enrolment || 0 });
  } catch {
    res.status(500).json({ error: 'Unable to calculate enrolment. Please try again.' });
  }
});

module.exports = router;

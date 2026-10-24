const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, phone, items } = req.body || {};
  if (typeof name !== "string" || !/^[A-Za-z]+$/.test(name)) {
    return res.status(400).json({ error: "Name must contain letters only." });
  }
  if (typeof phone !== "string" || !/^[0-9]+$/.test(phone)) {
    return res
      .status(400)
      .json({ error: "Phone must be a string containing digits only." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Include at least one lesson in items." });
  }

  const seen = new Set();
  const orderItems = [];
  for (const item of items) {
    if (
      !item ||
      typeof item.lessonId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(item.lessonId)
    ) {
      return res
        .status(400)
        .json({ error: "Each item must have a valid lessonId." });
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      return res
        .status(400)
        .json({ error: "Each quantity must be a positive whole number." });
    }
    const lessonId = new ObjectId(item.lessonId);
    const key = lessonId.toHexString();
    if (seen.has(key)) {
      return res
        .status(400)
        .json({
          error: "Combine repeated lessons into one item with a quantity.",
        });
    }
    seen.add(key);
    orderItems.push({ lessonId, quantity: item.quantity });
  }

  try {
    const database = req.app.locals.database;
    const lessons = await database
      .collection("lesson")
      .find({
        _id: { $in: orderItems.map((item) => item.lessonId) },
      })
      .toArray();
    if (lessons.length !== orderItems.length) {
      return res
        .status(404)
        .json({ error: "One or more lessons do not exist." });
    }
    const availability = new Map(
      lessons.map((lesson) => [lesson._id.toHexString(), lesson.space]),
    );
    if (
      orderItems.some(
        (item) => item.quantity > availability.get(item.lessonId.toHexString()),
      )
    ) {
      return res
        .status(409)
        .json({ error: "Not enough spaces available for this order." });
    }
    const result = await database.collection("order").insertOne({
      name,
      phone,
      items: orderItems,
      createdAt: new Date(),
    });
    return res
      .status(201)
      .json({
        message: "Order submitted successfully.",
        orderId: result.insertedId,
      });
  } catch {
    return res
      .status(500)
      .json({ error: "Unable to save the order. Please try again." });
  }
});

module.exports = router;

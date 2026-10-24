const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.put("/:id", async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid lesson ID." });
  }
  const body = req.body;
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Provide at least one lesson attribute to update." });
  }

  // Accept ordinary attribute names, never MongoDB operators, paths or _id updates.
  const updates = {};
  for (const [key, value] of Object.entries(body)) {
    if (
      !/^[A-Za-z][A-Za-z0-9_]*$/.test(key) ||
      ["_id", "constructor", "prototype"].includes(key)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or protected lesson attribute." });
    }
    // Existing lesson attributes have defined types. Additional scalar attributes
    // are supported so this route is not restricted to availability changes.
    if (
      value === null ||
      !["string", "number", "boolean"].includes(typeof value)
    ) {
      return res
        .status(400)
        .json({
          error: "Lesson attributes must be strings, numbers or booleans.",
        });
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      return res
        .status(400)
        .json({ error: "Numeric attributes must be finite." });
    }
    if (
      ["topic", "location", "image"].includes(key) &&
      (typeof value !== "string" || !value.trim())
    ) {
      return res
        .status(400)
        .json({ error: `${key} must be a nonempty string.` });
    }
    if (key === "price" && (typeof value !== "number" || value < 0)) {
      return res
        .status(400)
        .json({ error: "Price must be a nonnegative number." });
    }
    if (key === "space" && (!Number.isSafeInteger(value) || value < 0)) {
      return res
        .status(400)
        .json({ error: "Space must be a nonnegative whole number." });
    }
    if (key === "teacherId") {
      if (typeof value !== "string" || !/^[a-fA-F0-9]{24}$/.test(value)) {
        return res.status(400).json({ error: "Invalid teacher ID." });
      }
      updates[key] = new ObjectId(value);
    } else {
      updates[key] = value;
    }
  }

  try {
    const database = req.app.locals.database;
    if (
      updates.teacherId &&
      !(await database
        .collection("teacher")
        .findOne({ _id: updates.teacherId }))
    ) {
      return res.status(404).json({ error: "Teacher not found." });
    }
    const result = await database
      .collection("lesson")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Lesson not found." });
    }
    return res.json({
      message: "Lesson updated successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch {
    return res
      .status(500)
      .json({ error: "Unable to update lesson. Please try again." });
  }
});

module.exports = router;

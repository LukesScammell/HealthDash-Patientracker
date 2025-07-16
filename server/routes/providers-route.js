
const express = require("express");
const router = express.Router();
// ✅ Correct
const Provider = require('../models/provider-mongodb');
const { authRequired, roleRequired } = require('../middleware/auth'); // ✅

// Get current provider's profile (for nav display)
router.get("/me", authRequired, roleRequired("provider"), async (req, res) => {
  // Find provider by email, contact, or name, and return the name
  const user = req.session.user;
  let provider = null;
  if (user && user.username) {
    // Try to find by email
    provider = await Provider.findOne({ email: user.username });
    // If not found, try by contact
    if (!provider) {
      provider = await Provider.findOne({ contact: user.username });
    }
    // If still not found, try by name
    if (!provider) {
      provider = await Provider.findOne({ name: { $regex: new RegExp(`^${user.username}$`, 'i') } });
    }
  }
  if (!provider) return res.status(404).send("Provider profile not found");
  res.json({ name: provider.name });
});


router.get("/", authRequired, async (req, res) => {
  const providers = await Provider.find();
  res.json(providers);
});

router.post("/", authRequired, async (req, res) => {
  const provider = await Provider.create(req.body);
  res.status(201).json(provider);
});

router.put("/:id", authRequired, async (req, res) => {
  const updated = await Provider.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
});

router.delete("/:id", authRequired, async (req, res) => {
  await Provider.deleteOne({ id: req.params.id });
  res.sendStatus(204);
});

module.exports = router;

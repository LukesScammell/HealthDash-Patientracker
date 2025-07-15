const express = require("express");
const router = express.Router();


// ✅ Correct
const Provider = require('../models/provider-mongodb');


const { authRequired, roleRequired } = require('../middleware/auth'); // ✅


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

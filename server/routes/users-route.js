const express = require("express");
const router = express.Router();

const user = require('../models/user-mongodb');

router.get("/", async (req, res) => {
  const users = await user.find();
  res.json(users);
});

module.exports = router;

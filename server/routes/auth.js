const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/user");
const Patient = require("../models/patient");

// Current logged-in user
router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  res.json(req.session.user);
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }
  req.session.user = { username: user.username, role: user.role };
  res.json(req.session.user);
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

// Register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).send("Missing fields");
  if (!["patient", "provider"].includes(role)) return res.status(400).send("Invalid role");

  const exists = await User.findOne({ username });
  if (exists) return res.status(409).send("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed, role });

  if (role === "patient") {
    await Patient.create({
      first: "New", last: "Patient", disease: "Not specified", description: "",
      medications: [], patientUsername: username, providerUsername: ""
    });
  }

  res.status(201).send("User registered");
});

module.exports = router;

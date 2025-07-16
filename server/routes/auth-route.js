const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require('../models/user-mongodb');
const Patient = require('../models/patient-mongodb');

const userRoutes = require('./users-route');
const patientRoutes = require('./patients-route');

// Current logged-in user
router.get("/me", async (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  // Fetch latest user info from DB for safety
  const user = await User.findById(req.session.user.id);
  if (!user) return res.status(404).send("User not found");

  // If patient, get first/last name from Patient collection
  if (user.role === "patient") {
    const patient = await Patient.findOne({ patientUsername: user.username });
    if (patient) {
      return res.json({
        id: user._id,
        username: user.username,
        role: user.role,
        first: patient.first,
        last: patient.last
      });
    }
  }
  // If provider, get name from Provider collection
  if (user.role === "provider") {
    const Provider = require('../models/provider-mongodb');
    const provider = await Provider.findOne({ username: user.username });
    if (provider) {
      return res.json({
        id: user._id,
        username: user.username,
        role: user.role,
        name: provider.name
      });
    }
  }
  // Default: just return user info
  res.json({ id: user._id, username: user.username, role: user.role });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  console.log("Login attempt:", username);
  if (!user) {
    console.log("❌ User not found");
    return res.status(401).send("Invalid credentials");
  }
  const match = await bcrypt.compare(password, user.password);
  console.log("Password match:", match);
  if (!match) return res.status(401).send("Invalid credentials");

  req.session.user = { id: user._id, username: user.username, role: user.role };
  res.json({ message: "Login successful", role: user.role, username: user.username });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

// Register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).send("Missing fields");
  if (!["patient", "provider", "admin"].includes(role)) return res.status(400).send("Invalid role");

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

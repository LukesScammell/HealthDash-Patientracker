const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");

const { authRequired, roleRequired } = require("./middleware/auth");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const Patient = require("./models/patient.js");
const User = require("./models/user.js");
const Provider = require("./models/provider.js");

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/pages")));
app.use(logger); // optional

app.use(session({
  secret: "secure-session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    sameSite: "lax"
  }
}));

// ===== CONNECT TO MONGO =====
mongoose.connect("mongodb://localhost:27017/healthdash")
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(c => c.name));
    console.log(`👥 Users in DB: ${await User.countDocuments()}`);
    console.log(`🧑‍⚕️ Patients in DB: ${await Patient.countDocuments()}`);
    console.log(`🔬 Providers in DB: ${await Provider.countDocuments()}`);
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===== ROUTES =====
app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  res.json(req.session.user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }
  req.session.user = { username: user.username, role: user.role };
  res.json(req.session.user);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

// ===== PATIENT API =====
app.get("/patients", authRequired, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post("/patients", authRequired, async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
});

app.delete("/patients/:id", authRequired, async (req, res) => {
  await Patient.deleteOne({ _id: req.params.id });
  res.sendStatus(204);
});

app.get("/patients/me", authRequired, roleRequired("patient"), async (req, res) => {
  const patient = await Patient.findOne({ patientUsername: req.session.user.username });
  if (!patient) return res.status(404).send("No patient profile found.");
  res.json(patient);
});

app.get("/patients/provider", authRequired, roleRequired("provider"), async (req, res) => {
  const patients = await Patient.find({ providerUsername: req.session.user.username });
  res.json(patients);
});

app.put("/patients/:id", authRequired, roleRequired("provider"), async (req, res) => {
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send("Missing fields");
  }

  if (!["patient", "provider"].includes(role)) {
    return res.status(400).send("Invalid role");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(409).send("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashed, role });

  if (role === "patient") {
    await Patient.create({
      first: "New",
      last: "Patient",
      disease: "Not specified",
      description: "",
      medications: [],
      patientUsername: username,
      providerUsername: ""
    });
  }

  console.log("✅ Registered user:", newUser);
  res.status(201).send("User registered");
});

// ===== DEV: View All Users =====
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ===== ERROR HANDLER =====
app.use(errorHandler);

// ===== START SERVER =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

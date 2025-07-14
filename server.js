const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 3000;

// ===== DEFINE SCHEMAS FIRST =====
const patientSchema = new mongoose.Schema({
  first: String,
  last: String,
  disease: String,
  medications: [
    {
      name: String,
      image: String
    }
  ],
  description: String
});
const Patient = mongoose.model("Patient", patientSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});
const User = mongoose.model("User", userSchema);

const providerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  specialty: String,
  contact: String
});
const Provider = mongoose.model("Provider", providerSchema);

// ===== CONNECT TO MONGO & COUNT =====
mongoose.connect("mongodb://localhost:27017/healthdash")
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(c => c.name));

    const userCount = await User.countDocuments();
    console.log(`👥 Users in DB: ${userCount}`);

    const patientCount = await Patient.countDocuments();
    console.log(`🧑‍⚕️ Patients in DB: ${patientCount}`);

    const providerCount = await Provider.countDocuments();
    console.log(`🔬 Providers in DB: ${providerCount}`);
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));


// ===== MIDDLEWARE =====
app.use(express.static("public"));
app.use(express.json());
app.use(session({
  secret: "secure-session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    sameSite: "lax"  // ✅ or "none" if using cross-origin
  }
}));

// ===== AUTH HELPERS =====
function authRequired(req, res, next) {
  if (!req.session.user) return res.status(401).send("Unauthorized");
  next();
}

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

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const role = "provider"; // 🔐 Force it here

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send("User already exists.");
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashed, role });
  console.log("✅ Registered user:", newUser);
  res.status(201).send("User registered");
});

// Dev-only route to see all users (do NOT include in production)
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ===== START SERVER =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


// // Start server
// app.listen(3000, '0.0.0.0', () =>
//   console.log("Server running at http://your-local-ip:3000")
// );
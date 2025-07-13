const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://localhost:27017/healthdash"; // Replace with Atlas URI if needed

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: "healthdash-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 30 } // 30-minute session
}));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/healthdash")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const patientSchema = new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  condition: String,
  medications: [String]
});

const providerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  specialty: String,
  contact: String
});

// Models
const User = mongoose.model("User", userSchema);
const Patient = mongoose.model("Patient", patientSchema);
const Provider = mongoose.model("Provider", providerSchema);

// === Auth Routes ===
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send("Missing fields");
  }

  const emailRegex = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/;

  if (!emailRegex.test(username)) {
    return res.status(400).send("Invalid email format");
  }

  if (!passRegex.test(password)) {
    return res.status(400).send("Password must be at least 8 characters and include a number");
  }

  const existing = await User.findOne({ username });
  if (existing) return res.status(409).send("Username already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed, role });

  req.session.user = { username: user.username, role: user.role };
  res.status(201).json(req.session.user);
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Invalid credentials");

  req.session.user = { username: user.username, role: user.role };
  res.status(200).json(req.session.user);
});

// === Forgot Password Route ===
app.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).send("Missing username");

  const user = await User.findOne({ username });
  if (!user) return res.status(404).send("User not found");

  // Generate temp password
  const tempPassword = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(tempPassword, 10);

  // Update user password in DB
  user.password = hashed;
  await user.save();

  console.log(`🔐 Temporary password for ${user.username}: ${tempPassword}`);
  res.status(200).send("Reset link sent (simulated)");
});


app.post("/logout", (req, res) => {
  req.session.destroy(() => res.sendStatus(200));
});

app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  res.json(req.session.user);
});

// Middleware
function authRequired(req, res, next) {
  if (!req.session.user) return res.status(401).send("Unauthorized");
  next();
}

function providerOnly(req, res, next) {
  if (req.session.user?.role !== "provider") return res.status(403).send("Forbidden");
  next();
}

app.get("/users", authRequired, async (req, res) => {
  const users = await User.find({}, { username: 1, role: 1, _id: 0 });
  res.json(users);
});

// === Patient Routes ===
app.get("/patients", authRequired, async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post("/patients", authRequired, async (req, res) => {
  const newPatient = new Patient({ ...req.body, id: Date.now() });
  await newPatient.save();
  res.status(201).json(newPatient);
});

app.delete("/patients/:id", authRequired, async (req, res) => {
  const result = await Patient.deleteOne({ id: parseInt(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).send("Patient not found");
  res.sendStatus(204);
});

// === Provider Routes ===
app.get("/providers", authRequired, async (req, res) => {
  const providers = await Provider.find();
  res.json(providers);
});

app.post("/providers", authRequired, async (req, res) => {
  const newProvider = new Provider({ ...req.body, id: Date.now() });
  await newProvider.save();
  res.status(201).json(newProvider);
});

app.delete("/providers/:id", authRequired, async (req, res) => {
  const result = await Provider.deleteOne({ id: parseInt(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).send("Provider not found");
  res.sendStatus(204);
});

app.put("/providers/:id", authRequired, providerOnly, async (req, res) => {
  const updated = await Provider.findOneAndUpdate(
    { id: parseInt(req.params.id) },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).send("Provider not found");
  res.status(200).json(updated);
});

// Start server
app.listen(3000, '0.0.0.0', () =>
  console.log("Server running at http://your-local-ip:3000")
);
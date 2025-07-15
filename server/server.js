// server/server.js
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 3000;

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);

// ✅ Serve all frontend assets (JS, CSS, nav.html, pages/*.html)
app.use(express.static(path.join(__dirname, "../client")));

// ✅ Redirect "/" to index.html inside /pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/index.html"));
});

// ===== Session =====
app.use(session({
  secret: "secure-session",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000, // 1 hour
    sameSite: "lax"
  }
}));

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

// ===== Routes =====
const patientRoutes = require("./routes/patients");
const authRoutes = require("./routes/auth");
const providerRoutes = require("./routes/providers");
const userRoutes = require("./routes/users");

app.use("/patients", patientRoutes);
app.use("/", authRoutes);         // /me, /login, /register, /logout
app.use("/providers", providerRoutes);
app.use("/users", userRoutes);    // dev-only

// ===== MongoDB Models for Connection Stats =====
const Patient = require("./models/patient");
const User = require("./models/user");
const Provider = require("./models/provider");

// ===== Connect to MongoDB =====
mongoose.connect("mongodb://localhost:27017/healthdash")
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🧑‍⚕️ Patients: ${await Patient.countDocuments()}`);
    console.log(`🔬 Providers: ${await Provider.countDocuments()}`);
  })
  .catch(err => console.error("❌ MongoDB error:", err));

// ===== Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

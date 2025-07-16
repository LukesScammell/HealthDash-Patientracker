// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");


const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const patient = require("./models/patient-mongodb");
const User = require("./models/user-mongodb");
const provider = require("./models/provider-mongodb");

const patientRoutes = require('./routes/patients-route');
const authRoutes = require('./routes/auth-route');
const providerRoutes = require("./routes/providers-route");
const userRoutes = require('./routes/users-route');

const app = express();
const PORT = 3000;

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);

// ✅ Serve all frontend assets (JS, CSS, nav.html, pages/*.html)
app.use(express.static(path.join(__dirname, '../client')));

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


// ===== Routes =====
app.use("/patients", patientRoutes);
app.use("/", authRoutes);         // /me, /login, /register, /logout
app.use("/providers", providerRoutes);
app.use("/users", userRoutes);    // dev-only


// ===== MongoDB Connect & Start Server =====
async function startServer() {
  try {
    await mongoose.connect("mongodb://localhost:27017/healthdash");
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));

    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: "admin" });
    const patients = await patient.countDocuments();
    const providers = await provider.countDocuments();

    console.log(`👥 Users: ${totalUsers}`);
    console.log(`👑 Admins: ${adminUsers}`);
    console.log(`🧑‍⚕️ Patients: ${patients}`);
    console.log(`🔬 Providers: ${providers}`);

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}

startServer();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGO_URI = "mongodb://localhost:27017/healthdash";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// === SCHEMAS ===
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  condition: String,
  medications: [String]
});

const providerSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  contact: String
});

const User = mongoose.model("User", userSchema);
const Patient = mongoose.model("Patient", patientSchema);
const Provider = mongoose.model("Provider", providerSchema);

// === HASHED PASSWORDS ===
const users = [
  { username: "admin@healthdash.com", password: "admin123", role: "provider" },
  { username: "nurse@clinic.org", password: "nurse123", role: "provider" },
  { username: "guest@healthdash.com", password: "guest123", role: "readonly" },
  { username: "viewer@clinic.org", password: "viewer123", role: "readonly" }
];

async function seed() {
  console.log("🔄 Seeding data...");

  // Clear collections
  await User.deleteMany();
  await Patient.deleteMany();
  await Provider.deleteMany();

  // Hash passwords
  const hashedUsers = await Promise.all(users.map(async (u) => ({
    username: u.username,
    role: u.role,
    password: await bcrypt.hash(u.password, 10)
  })));

  await User.insertMany(hashedUsers);

  await Patient.insertMany([
    { name: "Alice Johnson", age: 34, condition: "Hypertension", medications: ["Lisinopril"] },
    { name: "Bob Smith", age: 58, condition: "Diabetes", medications: ["Metformin", "Insulin"] }
  ]);

  await Provider.insertMany([
    { name: "Dr. Lisa Wong", specialty: "Cardiology", contact: "lisa.wong@hospital.org" },
    { name: "Dr. Omar Patel", specialty: "Endocrinology", contact: "omar.patel@clinic.com" }
  ]);

  console.log("✅ Seeding complete");
  mongoose.disconnect();
}

seed();

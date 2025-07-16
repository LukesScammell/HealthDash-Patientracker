const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Connect to your MongoDB
mongoose.connect("mongodb://localhost:27017/healthdash")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    return seedData();
  })
  .then(() => {
    console.log("✅ Seeding complete");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});
const User = mongoose.model("user", userSchema);

// Define Patient Schema
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
  description: String,
  patientUsername: String,
  email: String,
  providerUsername: String
});
const Patient = mongoose.model("patient", patientSchema);

// Define Provider Schema
const providerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  specialty: String,
  contact: String
});
const Provider = mongoose.model("provider", providerSchema);

// Seed Logic
async function seedData() {
  // Users
  const userCount = await User.countDocuments();
  const patientCount = await Patient.countDocuments();
  if (patientCount === 0) {
    await Patient.create([
      {
        first: "Alice",
        last: "Nguyen",
        disease: "Asthma",
        medications: [
          { name: "Inhaler", image: "images/medications/inhaler.png" }
        ],
        description: "Mild exercise-induced asthma",
        patientUsername: "alice@email.com",
        email: "alice@email.com",
        providerUsername: "provider1@email.com"
      },
      {
        first: "Bob",
        last: "Lee",
        disease: "Diabetes",
        medications: [
          { name: "Insulin", image: "images/medications/insulin.png" }
        ],
        description: "Daily insulin required",
        patientUsername: "bob@email.com",
        email: "bob@email.com",
        providerUsername: "provider1@email.com"
      },
      {
        first: "Luke",
        last: "Scammell",
        disease: "ADHD",
        medications: [],
        description: "ADHD",
        patientUsername: "luke@email.com",
        email: "luke@email.com",
        providerUsername: "provider1@email.com"
      }
    ]);
    console.log("🧑‍⚕️ Seeded patients");
  } else {
    console.log("🧑‍⚕️ Patients already exist. Skipping...");
  }

  // Providers
  const providerCount = await Provider.countDocuments();
  if (providerCount === 0) {
    await Provider.create([
      { id: 1, name: "Dr. Sarah Kim", specialty: "Cardiology", contact: "s.kim@hospital.com" },
      { id: 2, name: "Dr. Alex Chen", specialty: "Dermatology", contact: "a.chen@clinic.com" }
    ]);
    console.log("🔬 Seeded providers");
  } else {
    console.log("🔬 Providers already exist. Skipping...");
  }
}

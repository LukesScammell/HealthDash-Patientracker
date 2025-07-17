const express = require("express");
const router = express.Router();

const Patient = require("../models/patient-mongodb");
const { authRequired, roleRequired } = require("../middleware/auth");

// Add prescription to a patient (provider only)
router.post("/:id/prescriptions", authRequired, roleRequired("provider"), async (req, res) => {
  const { medication, dosage, instructions } = req.body;
  const provider = req.session.user.username;
  if (!medication || !dosage) return res.status(400).send("Missing medication or dosage");
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).send("Patient not found");
  patient.prescriptions = patient.prescriptions || [];
  patient.prescriptions.push({ medication, dosage, instructions, provider });

  // Add medication to medications array if not already present
  patient.medications = patient.medications || [];
  const alreadyHasMed = patient.medications.some(m => m.name === medication);
  if (!alreadyHasMed) {
    // Try to find image for medication
    let image = "";
    const medImages = {
      "Ibuprofen": "/images/ibuprofen.png",
      "Inhaler": "/images/inhaler.png",
      "Insulin": "/images/insulin.png",
      "Antivirals": "/images/antivirals.jpg",
      "Amoxicillin": "/images/amoxicillin.png",
      "Antihistamines": "/images/antihistamines.jpg",
      "Paracetamol": "/images/paracetamol.png",
      "SSRI": "/images/ssri.jpg",
      "Triptans": "/images/triptans.jpg"
    };
    image = medImages[medication] || "";
    patient.medications.push({ name: medication, image });
  }

  await patient.save();
  res.status(201).json(patient.prescriptions[patient.prescriptions.length - 1]);
});

// All patients (admin/provider)
router.get("/", authRequired, async (req, res) => {
  res.json(await Patient.find());
});

// POST /patients – Only providers can add patients
router.post("/", authRequired, roleRequired("provider"), async (req, res) => {
  const providerUsername = req.session.user.username;

const newPatient = {
  ...req.body,
  providerUsername: req.session.user.username, // auto-assign logged-in provider
};

  try {
    const created = await Patient.create(newPatient);
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Failed to add patient:", err);
    res.status(400).send("Invalid patient data");
  }
});
// Delete patient
router.delete("/:id", authRequired, async (req, res) => {
  await Patient.deleteOne({ _id: req.params.id });
  res.sendStatus(204);
});

// Current patient's own profile
router.get("/me", authRequired, roleRequired("patient"), async (req, res) => {
  const patient = await Patient.findOne({ patientUsername: req.session.user.username });
  if (!patient) return res.status(404).send("Profile not found");
  res.json(patient);
});

// ✅ This route returns only patients assigned to the logged-in provider
router.get("/provider", authRequired, roleRequired("provider"), async (req, res) => {
  const providerUsername = req.session.user.username;

  const patients = await Patient.find({ providerUsername });

  res.json(patients);
});
// Update patient (provider only)
router.put("/:id", authRequired, async (req, res) => {
  const user = req.session.user;

  // Only allow providers to update their own patients OR admins to reassign
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).send("Patient not found");

  if (user.role === "provider") {
    if (patient.providerUsername !== user.username) {
      return res.status(403).send("You can only edit your own patients");
    }
  } else if (user.role !== "admin") {
    return res.status(403).send("Not authorized");
  }

  // Only allow admin to change the providerUsername
  if (user.role !== "admin" && req.body.providerUsername) {
    delete req.body.providerUsername;
  }

  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});
module.exports = router;
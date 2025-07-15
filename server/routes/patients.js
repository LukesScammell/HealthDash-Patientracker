const express = require("express");
const router = express.Router();

const Patient = require("../models/patient");
const { authRequired, roleRequired } = require("../middleware/auth");

// All patients (admin/provider)
router.get("/", authRequired, async (req, res) => {
  res.json(await Patient.find());
});

// Create patient
router.post("/", authRequired, async (req, res) => {
  const patient = await Patient.create(req.body);
  res.status(201).json(patient);
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
router.put("/:id", authRequired, roleRequired("provider"), async (req, res) => {
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

module.exports = router;
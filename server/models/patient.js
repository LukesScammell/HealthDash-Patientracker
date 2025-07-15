const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  first: String,
  last: String,
  disease: String,
  description: String,
  medications: [{ name: String, image: String }],
  providerUsername: String,
  patientUsername: String
});

module.exports = mongoose.model("patient", patientSchema);
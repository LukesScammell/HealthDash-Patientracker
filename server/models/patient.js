const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  first: String,
  last: String,
  disease: String,
  medications: [ { name: String, image: String } ],
  description: String,
  patientUsername: String,
  providerUsername: String   // ✅ This is critical
});


module.exports = mongoose.model("patient", patientSchema);
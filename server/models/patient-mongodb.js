const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  first: String,
  last: String,
  disease: String,
  medications: [ { name: String, image: String } ],
  description: String,
  patientUsername: String,
  providerUsername: String,   // ✅ This is critical
  prescriptions: [
    {
      medication: String,
      dosage: String,
      instructions: String,
      date: { type: Date, default: Date.now },
      provider: String // provider name or id
    }
  ]
});


module.exports = mongoose.model("patient", patientSchema);
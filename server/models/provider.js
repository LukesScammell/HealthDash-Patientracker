const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  specialty: String,
  contact: String
});

module.exports = mongoose.model("provider", providerSchema);
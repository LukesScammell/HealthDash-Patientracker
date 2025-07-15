// server/models/providers.js
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialty: String,
  password: String,
});

module.exports = mongoose.model('Provider', providerSchema);
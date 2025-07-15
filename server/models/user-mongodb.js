// server/models/users.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // e.g., 'admin', 'provider', 'patient'
});

module.exports = mongoose.model('User', userSchema);
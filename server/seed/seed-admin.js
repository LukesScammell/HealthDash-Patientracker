// seed-admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user-mongodb");

mongoose.connect("mongodb://localhost:27017/healthdash").then(async () => {
  const hashed = await bcrypt.hash("your-password", 10);
  await User.create({
    username: "admin@example.com",
    password: hashed,
    role: "admin"
  });
  console.log("✅ Admin created");
  process.exit();
});

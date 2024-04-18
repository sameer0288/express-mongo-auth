const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
  },
  age: {
    type: Number,
  },
  workDetails: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);

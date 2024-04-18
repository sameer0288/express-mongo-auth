const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();
// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Email not verified" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ email, password: hashedPassword, otp });
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Verify OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ msg: "Email verified" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
const auth = require("../middleware/auth");

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { location, age, workDetails } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    user.location = location;
    user.age = age;
    user.workDetails = workDetails;

    await user.save();

    res.json({ msg: "Profile updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;

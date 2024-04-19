const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
require("dotenv").config();
const router = express.Router();

// Generate a random string for OTP
const generateOTP = () => {
  const characters = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += characters[Math.floor(Math.random() * characters.length)];
  }
  return otp;
};

// Generate a unique token for OTP verification
const generateVerificationToken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// Store OTP and verification token in memory (for demonstration purposes)
const otpCache = new Map();

// API endpoint for sending OTP to user's email
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Generate and save unique verification token
    const verificationToken = generateVerificationToken();

    // Generate and save OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // Save OTP and verification token in the database (for future verification during signup)
    // Save OTP and verification token in memory
    otpCache.set(email, { otp, verificationToken });

    // Send email with OTP and verification token
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "UserAuth - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px; text-align: center;">
          <h2 style="color: #866118;">UserAuth- OTP Verification</h2>
          <p style="font-size: 16px;">Your OTP for UserAuth is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #666;">This is an automated email, please do not reply.</p>
          <div style="margin-top: 20px; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px;">
            <p style="font-size: 14px; color: #555;">For any questions or concerns, please contact our support team.</p>
            <a href="mailto:support@userauth.com" style="text-decoration: none; color: #866118; font-weight: bold;">Contact Support</a>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "OTP sent successfully. Check your email." });
    // console.log(otp, otpExpiresAt, verificationToken);
  } catch (error) {
    console.error("Error during OTP sending:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint for user signup with OTP verification
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      verificationText,
      firstName,
      lastName,
      password /* other user info */,
    } = req.body;

    // Log request details for debugging
    // console.log("Request received:", req.body);

    // Check if the provided email exists in the OTP cache
    const storedOtpData = otpCache.get(email);

    if (!storedOtpData) {
      // User not found in the cache, indicating verification failure
      return res.status(401).json({
        error: "Incorrect OTP or OTP expired. Please try again.",
      });
    }

    const { otp, verificationToken } = storedOtpData;

    // Check if the provided OTP and verification token match the stored data
    if (verificationText !== otp) {
      return res.status(401).json({
        error: "Incorrect OTP. Please try again.",
      });
    }

    // Correct OTP
    // Save user information to the database
    const newUser = new User({
      userInformation: {
        email,
        firstName,
        lastName,
        password,
        isVerified: true, // Set the user as verified
      },
      verificationInformation: {
        otp: null, // Set OTP to null after successful verification if needed
        otpExpiresAt: null, // Set OTP expiration to null after successful verification if needed
        verificationToken: null, // Set verification token to null after successful verification
      },
    });

    await newUser.save();

    // Generate JWT token (optional)
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24d",
    });

    res.status(201).json({ message: "Signup successful. Welcome!", token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({
      "userInformation.email": email,
    });

    // If user not found, return an error
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password using the comparePassword method
    const isPasswordValid = await user.comparePassword(password);

    // If the password is invalid, return an error
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    a;

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24d",
    });

    // Return success message and token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint for getting user data
router.get("/user", async (req, res) => {
  // console.log("Endpoint: /user");
  try {
    // Extract the JWT token from the request headers
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("Received token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use the actual secret key from environment variables
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      console.error("JWT secret key not provided");
      return res.status(500).json({ error: "Internal Server Error" });
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      // console.log("Decoded payload with actual secret key:", decoded);

      // Check if the token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.log("Token expired");
        return res.status(401).json({ error: "Token expired" });
      }

      // Find the user by ID
      const user = await User.findById(decoded.userId);

      // If user not found, return an error
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
      }

      // Return the user data without the password field
      const userData = {
        _id: user._id,
        email: user.userInformation.email,
        firstName: user.userInformation.firstName,
        lastName: user.userInformation.lastName,
        isVerified: user.userInformation.isVerified,
        organizationInformation: user.organizationInformation,
      };

      // console.log("User data:", userData);

      // Return the user data
      res.status(200).json(userData);
    } catch (error) {
      console.error("Error verifying token with actual secret key:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

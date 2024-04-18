const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const auth = async (req, res, next) => {
  const token = req.header("Authorization");

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded token
    const user = await User.findById(decoded.user.id).select("-password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = auth;

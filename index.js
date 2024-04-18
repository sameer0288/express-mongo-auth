const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const chalk = require("chalk");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Adds security headers
app.use(cors()); // Enables CORS for all routes
app.use(express.json()); // Parses JSON request body
app.use(morgan("combined")); // Logs HTTP requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.green("MongoDB connected"));
  })
  .catch((err) => {
    console.error(chalk.red(`MongoDB connection error: ${err}`));
  });

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(chalk.red(err.stack));
  res.status(500).json({ msg: "Server Error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(chalk.blue(`Server running on port ${PORT}`));
});

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = 4000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.json());

// Routes Middleware
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

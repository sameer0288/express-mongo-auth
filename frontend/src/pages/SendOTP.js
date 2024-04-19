import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
const SendOTP = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate
  const sendOTP = async () => {
    setLoading(true); // Set loading state to true
    try {
      const response = await axios.post(
        "https://express-mongo-auth.onrender.com/api/auth/send-otp",
        { email }
      );
      setMessage(response.data.message);
      if (response.data.message.includes("success")) {
        navigate("/register"); // Navigate to register page on success
      }
    } catch (error) {
      setMessage(error.response.data.error);
    }
    setLoading(false); // Set loading state to false
  };

  return (
    <div className="page">
      <h2>Send OTP</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={sendOTP} disabled={loading}>
        Send OTP
      </button>{" "}
      {/* Disable button when loading */}
      {loading && <p className="loading">Loading...</p>}{" "}
      {/* Display loading message */}
      <p
        className={`message ${
          message.includes("success") ? "success" : "error"
        }`}
      >
        {message}
      </p>{" "}
      {/* Display message with color based on success or error */}
    </div>
  );
};

export default SendOTP;

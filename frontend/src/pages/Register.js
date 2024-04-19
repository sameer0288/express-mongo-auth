import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Register = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationText, setVerificationText] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const registerUser = async () => {
    try {
      const response = await axios.post(
        "https://express-mongo-auth.onrender.com/api/auth/register",
        {
          email,
          verificationText,
          firstName,
          lastName,
          password,
        }
      );
      setMessage(response.data.message);
      if (response.data.message.includes("successful")) {
        navigate("/login");
      }
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="page">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Verification OTP"
        value={verificationText}
        onChange={(e) => setVerificationText(e.target.value)}
      />
      <button onClick={registerUser}>Register</button>
      <p
        className={`message ${
          message.includes("success") ? "success" : "error"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default Register;

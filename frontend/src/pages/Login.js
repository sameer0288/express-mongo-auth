import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const loginUser = async () => {
    try {
      const response = await axios.post(
        "https://express-mongo-auth.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);
      if (response.data.message === "Login successful") {
        navigate("/user");
      }
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>
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
      <button onClick={loginUser}>Login</button>
      <p
        className={`message ${
          message.includes("successful") ? "success" : "error"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default Login;

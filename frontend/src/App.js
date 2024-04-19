import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";

import SendOTP from "./pages/SendOTP";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserData from "./pages/UserData";

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>User Authentication</h1>
          <div className="nav-links">
            <Link to="/send-otp">Send OTP</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
            <Link to="/user">User Data</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/send-otp" element={<SendOTP />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<UserData />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

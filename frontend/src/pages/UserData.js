import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserData = () => {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "https://express-mongo-auth.onrender.com/api/auth/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        setMessage(error.response.data.error);
      }
    };

    getUserData();
  }, [navigate]);

  return (
    <div className="page">
      <h2>User Data</h2>
      <div className="user-box">
        {userData ? (
          <>
            <p>
              <strong>Name:</strong> {userData.firstName} {userData.lastName}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Verified:</strong> {userData.isVerified ? "Yes" : "No"}
            </p>
          </>
        ) : (
          <p className="message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default UserData;

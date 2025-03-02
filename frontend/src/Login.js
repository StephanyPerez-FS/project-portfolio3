import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      console.log("Token received:", token);
      localStorage.setItem("jwt", token);
      navigate("/search");
    } else {
      console.log("No token found, staying on login page.");
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#121212",
        color: "white",
        textAlign: "center",
      }}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
        alt="Spotify Logo"
        style={{ width: "150px", marginBottom: "20px" }}
      />
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
      >
        Please Sign In
      </h2>
      <p
        style={{
          maxWidth: "400px",
          marginBottom: "20px",
          fontSize: "16px",
          opacity: "0.8",
        }}
      >
        To search for artists, tracks, or songs, you must log in to your Spotify
        account.
      </p>
      <a
        href="http://localhost:3001/spotify/v1/login"
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#1db954",
          borderRadius: "50px",
          textDecoration: "none",
          cursor: "pointer",
          transition: "background 0.3s ease",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#1ed760")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1db954")}
      >
        Sign In with Spotify
      </a>
    </div>
  );
};

export default Login;

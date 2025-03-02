import React, { useState, useEffect } from "react";
import { searchSpotify } from "./Api";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSearch = async () => {
    const data = await searchSpotify(query, "artist");
    setResults(data.artists?.items || []);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Search Music
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#282828",
          borderRadius: "50px",
          padding: "10px 20px",
          width: "400px",
          maxWidth: "90%",
          marginBottom: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "16px",
            backgroundColor: "transparent",
            color: "white",
            padding: "5px",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: "#1db954",
            border: "none",
            borderRadius: "50px",
            color: "white",
            fontSize: "16px",
            padding: "10px 20px",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1ed760")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#1db954")}
        >
          Search
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        {results.map((artist) => (
          <div
            key={artist.id}
            style={{
              backgroundColor: "#282828",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
              transition: "transform 0.2s",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={artist.images[0]?.url}
              alt={artist.name}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                textDecoration: "none",
                display: "block",
              }}
            >
              {artist.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;

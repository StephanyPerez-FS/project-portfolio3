import React, { useState } from "react";
import { searchSpotify } from "./Api";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchSpotify(query, "artist");
    setResults(data.artists.items || []);
  };

  return (
    <div>
      <h2>Search Music</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artists..."
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {results.map((artist) => (
          <li key={artist.id}>
            <img src={artist.images[0]?.url} alt={artist.name} width="50" />
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              {artist.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;

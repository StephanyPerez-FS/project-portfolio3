import axios from "axios";

const API_URL = "http://localhost:3001/spotify/v1";

export const loginToSpotify = async () => {
  try {
    const response = await axios.get(`${API_URL}/login`);
    return response.data.token;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export const searchSpotify = async (query, type) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query, type },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return null;
  }
};

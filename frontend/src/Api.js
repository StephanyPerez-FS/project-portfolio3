export const searchSpotify = async (query, type) => {
  const token = localStorage.getItem("jwt");

  if (!token) {
    console.error("No token found. Redirecting to login.");
    window.location.href = "/"; // Redirect to login if no token
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/spotify/v1/search?query=${encodeURIComponent(
        query
      )}&type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Search request failed:", error);
    return { artists: { items: [] } };
  }
};

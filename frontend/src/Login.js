import React, { useEffect, useState } from "react";
import { loginToSpotify } from "./Api";

const Login = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const authenticate = async () => {
      const newToken = await loginToSpotify();
      setToken(newToken);
      localStorage.setItem("jwt", newToken);
    };

    authenticate();
  }, []);

  return (
    <div>
      <h1>Spotify Music Search</h1>
      {token ? <p> Logged in!</p> : <p>🔄 Logging in...</p>}
    </div>
  );
};

export default Login;

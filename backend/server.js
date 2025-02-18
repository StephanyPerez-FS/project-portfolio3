require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const jwt = require("jsonwebtoken");
const session = require("express-session");
const axios = require("axios");
const Session = require("./models/Session");

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Spotify OAuth Strategy
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      const token = jwt.sign({ id: profile.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      try {
        const session = new Session({ userId: profile.id, jwtToken: token });
        await session.save();
        return done(null, { profile, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get("/", (req, res) => {
  res.send("Spotify Music Search API is running");
});

// Login Route
app.get(
  "/spotify/v1/login",
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private"],
  })
);

// Callback Route
app.get(
  "/spotify/v1/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  (req, res) => {
    res.json({ message: "Logged in successfully!", token: req.user.token });
  }
);

// Check JWT Status Route
app.get("/spotify/v1/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ status: true, user: req.user });
  } else {
    res.json({ status: false });
  }
});

// Search Route
app.get("/spotify/v1/search", async (req, res) => {
  const { query, type } = req.query;
  const token = req.user?.token;

  if (!token)
    return res
      .status(401)
      .json({ error: "Unauthorized. Please log in first." });

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=${type}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout Route
app.get("/spotify/v1/logout", (req, res) => {
  req.logout(() => res.json({ message: "Logged out successfully!" }));
});

// Refresh Token Route
app.post("/spotify/v1/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      null,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

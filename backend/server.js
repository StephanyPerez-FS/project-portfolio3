require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const connectDB = require("./db");
const passport = require("passport");
const SpotifyStrategy = require("passport-spotify").Strategy;
const jwt = require("jsonwebtoken");
const session = require("express-session");
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

// JWT Validation Middleware
const validateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    const session = await Session.findOne({ userId: decoded.id });

    if (!session) {
      return res
        .status(401)
        .json({ status: false, error: "Session not found." });
    }
    next();
  } catch (err) {
    res.status(401).json({ status: false, error: "Invalid or expired token." });
  }
};

// Spotify OAuth Strategy
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_REDIRECT_URI,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      const jwtToken = jwt.sign({ id: profile.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("Received Spotify Access Token:", accessToken); // Debug

      try {
        await Session.findOneAndUpdate(
          { userId: profile.id },
          {
            jwtToken: jwtToken,
            spotifyAccessToken: accessToken,
            refreshToken: refreshToken,
          },
          { upsert: true, new: true }
        );
        console.log("Session saved successfully.");
        return done(null, { profile, token: jwtToken });
      } catch (err) {
        console.error("Error saving session:", err.message);
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
  (req, res, next) => {
    console.log("Redirecting user to Spotify authentication...");
    next();
  },
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private"],
    showDialog: true,
  })
);

// Callback Route
app.get(
  "/spotify/v1/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User authenticated, sending token...");
    res.redirect(`http://localhost:3000/?token=${req.user.token}`);
  }
);

// Check JWT Status
app.get("/spotify/v1/status", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: false, error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await Session.findOne({ userId: decoded.id });

    if (session) {
      res.json({ status: true });
    } else {
      res.json({ status: false, error: "Session not found." });
    }
  } catch (err) {
    res.status(401).json({ status: false, error: "Invalid or expired token." });
  }
});

// Search Route (Protected)
app.get("/spotify/v1/search", validateJWT, async (req, res) => {
  const { query, type } = req.query;
  const session = await Session.findOne({ userId: req.user.id });

  if (!session || !session.spotifyAccessToken) {
    return res.status(401).json({ error: "No valid Spotify access token." });
  }

  console.log("Using Spotify access token:", session.spotifyAccessToken);

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=${type}`,
      { headers: { Authorization: `Bearer ${session.spotifyAccessToken}` } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Spotify API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

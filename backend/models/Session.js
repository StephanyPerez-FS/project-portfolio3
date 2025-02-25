const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jwtToken: { type: String, required: true },
  spotifyAccessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

module.exports = mongoose.model("Session", sessionSchema);

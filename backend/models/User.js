const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    contactNumber: { type: String, trim: true },
    country: { type: String, trim: true },
    location: { type: String, trim: true },
    genderIdentity: { type: String, trim: true },
    pronouns: { type: String, trim: true },
    disabilityType: { type: String, trim: true },
    disabilityPercentage: { type: String, trim: true },
    communicationStyle: { type: String, trim: true },
    interests: [{ type: String, trim: true }],
    accessibilityPreferences: [{ type: String, trim: true }],
    communityTags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

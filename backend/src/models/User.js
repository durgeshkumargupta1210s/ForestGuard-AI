import mongoose from "mongoose";

/**
 * User Schema
 * Stores application users
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      // Excluded from queries by default. Code that needs to compare a
      // hash must opt in with .select("+password").
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // Written by user.service.js updateProfile(). Previously undeclared,
    // so Mongoose strict mode silently dropped it and the Settings
    // toggle reported success without persisting anything.
    notifications: {
      type: Boolean,
      default: true,
    },

    // Written by user.service.js updateAvatar(). Same silent-drop issue.
    avatar: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;

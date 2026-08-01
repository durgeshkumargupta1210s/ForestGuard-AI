import express from "express";

import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadAvatar,
  deleteUserAccount,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| User Profile
|--------------------------------------------------------------------------
*/

// Get logged-in user profile
router.get(

  "/profile",

  protect,

  getUserProfile,

);

// Update profile
router.put(

  "/profile",

  protect,

  updateUserProfile,

);

// Change password
router.put(

  "/change-password",

  protect,

  changeUserPassword,

);

// Upload avatar
router.post(

  "/avatar",

  protect,

  upload.single("avatar"),

  uploadAvatar,

);

// Delete account
router.delete(

  "/account",

  protect,

  deleteUserAccount,

);

export default router;
import bcrypt from "bcrypt";

import User from "../models/User.js";

/**
 * Get user profile
 */
export const getProfile = async (userId) => {

  const user = await User.findById(userId)

    .select("-password");

  if (!user) {

    throw new Error("User not found");

  }

  return user;

};

/**
 * Update profile
 */
export const updateProfile = async (

  userId,

  data,

) => {

  const user = await User.findById(userId);

  if (!user) {

    throw new Error("User not found");

  }

  user.name = data.name || user.name;

  user.email = data.email || user.email;

  if (data.notifications !== undefined) {

    user.notifications = data.notifications;

  }

  await user.save();

  return await User.findById(userId)

    .select("-password");

};

/**
 * Change password
 */
export const changePassword = async (

  userId,

  currentPassword,

  newPassword,

) => {

  const user = await User.findById(userId).select("+password");

  if (!user) {

    throw new Error("User not found");

  }

  const isMatch = await bcrypt.compare(

    currentPassword,

    user.password,

  );

  if (!isMatch) {

    throw new Error("Current password is incorrect");

  }

  user.password = await bcrypt.hash(

    newPassword,

    10,

  );

  await user.save();

  return true;

};

/**
 * Delete account
 */
export const deleteAccount = async (

  userId,

  password,

) => {

  const user = await User.findById(userId).select("+password");

  if (!user) {

    throw new Error("User not found");

  }

  const isMatch = await bcrypt.compare(

    password,

    user.password,

  );

  if (!isMatch) {

    throw new Error("Invalid password");

  }

  await User.findByIdAndDelete(userId);

  return true;

};

/**
 * Update avatar
 */
export const updateAvatar = async (

  userId,

  avatarUrl,

) => {

  const user = await User.findById(userId);

  if (!user) {

    throw new Error("User not found");

  }

  user.avatar = avatarUrl;

  await user.save();

  return await User.findById(userId)

    .select("-password");

};
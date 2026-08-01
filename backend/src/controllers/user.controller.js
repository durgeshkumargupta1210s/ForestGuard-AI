import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updateAvatar,
} from "../services/user.service.js";

/**
 * GET /api/users/profile
 */
export const getUserProfile = async (req, res) => {

  try {

    const user = await getProfile(

      req.user.id

    );

    res.status(200).json({

      success: true,

      data: user,

    });

  }

  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * PUT /api/users/profile
 */
export const updateUserProfile = async (

  req,

  res,

) => {

  try {

    const user = await updateProfile(

      req.user.id,

      req.body,

    );

    res.status(200).json({

      success: true,

      message: "Profile updated successfully.",

      data: user,

    });

  }

  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * PUT /api/users/change-password
 */
export const changeUserPassword = async (

  req,

  res,

) => {

  try {

    const {

      currentPassword,

      newPassword,

    } = req.body;

    await changePassword(

      req.user.id,

      currentPassword,

      newPassword,

    );

    res.status(200).json({

      success: true,

      message: "Password changed successfully.",

    });

  }

  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * POST /api/users/avatar
 */
export const uploadAvatar = async (

  req,

  res,

) => {

  try {

    if (!req.file) {

      return res.status(400).json({

        success: false,

        message: "Please upload an image.",

      });

    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await updateAvatar(

      req.user.id,

      avatarUrl,

    );

    res.status(200).json({

      success: true,

      message: "Avatar uploaded successfully.",

      data: user,

    });

  }

  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};

/**
 * DELETE /api/users/account
 */
export const deleteUserAccount = async (

  req,

  res,

) => {

  try {

    const {

      password,

    } = req.body;

    await deleteAccount(

      req.user.id,

      password,

    );

    res.status(200).json({

      success: true,

      message: "Account deleted successfully.",

    });

  }

  catch (error) {

    res.status(400).json({

      success: false,

      message: error.message,

    });

  }

};
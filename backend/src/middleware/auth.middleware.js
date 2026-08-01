import jwt from "jsonwebtoken";

import User from "../models/User.js";

/**
 * Protect private routes
 */
export const protect = async (

  req,

  res,

  next,

) => {

  try {

    let token = null;

    // Authorization: Bearer <token>

    if (

      req.headers.authorization &&

      req.headers.authorization.startsWith("Bearer ")

    ) {

      token = req.headers.authorization.split(" ")[1];

    }

    if (!token) {

      return res.status(401).json({

        success: false,

        message: "Access denied. Token not provided.",

      });

    }

    // Verify JWT

    const decoded = jwt.verify(

      token,

      process.env.JWT_SECRET

    );

    // Fetch user

    const user = await User.findById(

      decoded.id

    ).select("-password");

    if (!user) {

      return res.status(401).json({

        success: false,

        message: "User not found.",

      });

    }

    // Attach user to request

    req.user = user;

    next();

  }

  catch (error) {

    return res.status(401).json({

      success: false,

      message: "Invalid or expired token.",

    });

  }

};
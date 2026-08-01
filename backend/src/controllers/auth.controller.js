import { registerUser, loginUser } from "../services/auth.service.js";

/**
 * Register controller handler
 */
export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    const statusCode =
      error.message === "User already exists" || error.statusCode === 409
        ? 409
        : error.statusCode || 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * Login controller handler
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || "Invalid credentials",
    });
  }
};
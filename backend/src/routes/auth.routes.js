import express from "express";

import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

/*
    Register User

    POST /api/auth/register
*/
router.post("/register", register);

/*
    Login User

    POST /api/auth/login
*/
router.post("/login", login);

export default router;

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import User from "../models/User.js";



/**
 * Register new user
 */
export const registerUser = async (userData) => {


    const {
        name,
        email,
        password
    } = userData;

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
        const error = new Error("Name, email, and password are required");
        error.statusCode = 400;
        throw error;
    }

    // Check existing user

    const existingUser =
        await User.findOne({
            email: normalizedEmail
        });



    if(existingUser){

        const error = new Error("User already exists");
        error.statusCode = 409;
        throw error;

    }



    // Hash password

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );



    // Create user
    //
    // `role` is deliberately NOT taken from userData — accepting it
    // from the request body would let anyone self-register as admin.
    // The schema default ("user") applies instead.

    const user =
        await User.create({

            name: normalizedName,

            email: normalizedEmail,

            password:
            hashedPassword

        });



    return user;

};





/**
 * Login user
 */
export const loginUser = async (
    email,
    password
) => {


    // Find user (password is select:false, so opt in explicitly)

    const user =
        await User.findOne({
            email
        }).select("+password");



    if(!user){

        throw new Error(
            "Invalid credentials"
        );

    }




    // Compare password

    const isPasswordValid =
        await bcrypt.compare(

            password,

            user.password

        );



    if(!isPasswordValid){

        throw new Error(
            "Invalid credentials"
        );

    }




    // Generate JWT Token

    const token =
        jwt.sign(

            {
                id:user._id,

                role:user.role

            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );



    return {

        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
        },

        token

    };

};
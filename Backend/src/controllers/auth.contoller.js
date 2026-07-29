import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

const generateToken = (user) => {
    return jwt.sign({
        email: user.email,
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
}

const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required" 
            });
        }
        const doUserExist = await userModel.findOne({ email });
        if (doUserExist) {
            return res.status(409).json({ message: "User already exists" });
        }
        const user = await userModel.create({ name, email, password });
        const token = generateToken(user);
        res.cookie("token", token, cookieOptions);
        res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                name: user.name,
                email: user.email,
                id: user._id
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({
                message: "All fields are required" 
            });
        }
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                message: `Please log in using ${user.authProvider}`,
                success: false
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password",
                success: false
            })
        }
        const token = generateToken(user);
        res.cookie("token", token, cookieOptions);
        res.status(200).json({
            message: "User logged in successfully",
            success: true,
            user: {
                name: user.name,
                email: user.email,
                id: user._id
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const googleAuthCallback = (req, res) => {
    try {
        console.log(req.user);
        const user = req.user;

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
        }

        const token = generateToken(user);
        res.cookie("token", token, cookieOptions);
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error) {
        console.error("Error in Google auth callback:", error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }
}
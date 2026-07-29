import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const doUserExist = await userModel.findOne({ email });
    if (doUserExist) {
        return res.status(409).json({ message: "User already exists" });
    }
    const user = await userModel.create({ name, email, password });
    const token = jwt.sign({
        email: user.email,
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
    res.cookie("token", token);
    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            name: user.name,
            email: user.email,
            id: user._id
        }
    });
}

export const loginUser = async (req, res) => {
    const { email, password} =req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false
        })
    }
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid password",
            success: false
        })
    }
    const token = jwt.sign({
        email: user.email,
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    res.cookie("token", token);
    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
            name: user.name,
            email: user.email,
            id: user._id
        }
    });
}
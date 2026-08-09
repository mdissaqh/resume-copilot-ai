import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized. User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized. Invalid or expired token." });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");
        
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
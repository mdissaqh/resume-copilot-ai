import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
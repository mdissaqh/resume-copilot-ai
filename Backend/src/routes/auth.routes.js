import {Router} from "express";
import { registerUser, loginUser, googleAuthCallback } from "../controllers/auth.contoller.js";
import passport from "passport";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/google",
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get("/google/callback",
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`,
        session: false
    }), googleAuthCallback
);


export default router;
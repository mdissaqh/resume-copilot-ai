import { Router } from "express";
import { registerUser, loginUser, googleAuthCallback, getCurrentUser, logoutUser } from "../controllers/auth.contoller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getCurrentUser);

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
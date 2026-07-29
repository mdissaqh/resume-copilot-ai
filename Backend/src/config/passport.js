import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model.js";

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await userModel.findOne({
                email: profile._json.email
            })
            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.profilePicture = profile._json.picture;
                    await user.save();
                }
                return done(null, user);
            }
            const newUser = await userModel.create({
                name: profile.displayName,
                email: profile._json.email,
                googleId: profile.id,
                profilePicture: profile._json.picture,
                authProvider: 'google'
            });
            return done(null, newUser);
        }catch (error) {
            console.error("Error in GoogleStrategy:", error);
            return done(error, null);
        }
    })
);

export default passport;
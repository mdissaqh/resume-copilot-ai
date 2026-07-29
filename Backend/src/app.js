import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import "./config/passport.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


app.use("/api/auth", authRouter);

export default app;
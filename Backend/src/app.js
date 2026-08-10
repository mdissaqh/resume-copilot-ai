import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import "./config/passport.js";
import cors from "cors";
import morgan from "morgan";
import analyzeRouter from "./routes/analyze.routes.js";
import resumeRouter from "./routes/resume.routes.js";

const app = express();
    
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/analyze", analyzeRouter)
app.use("/api/resume", resumeRouter);

export default app;
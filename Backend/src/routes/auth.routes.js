import {Router} from "express";
import { registerUser, loginUser } from "../controllers/auth.contoller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
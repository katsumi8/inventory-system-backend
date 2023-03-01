import express from "express";
import { deserializeUser } from "../middlewares/deserializeUser";
import { requireUser } from "../middlewares/requireUser";
import { getMeHandler } from "../controllers/user.controller";


const router = express.Router();

router.use(deserializeUser, requireUser);

router.get("/me", getMeHandler);

export default router;
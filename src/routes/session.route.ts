import { googleOauthHandler } from "../controllers/auth.controller";
import express from "express";

const router = express.Router();

router.get("/oauth/google", googleOauthHandler);

export default router;

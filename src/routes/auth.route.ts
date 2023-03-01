import express from "express";
import { deserializeUser } from "../middlewares/deserializeUser";
import { requireUser } from "../middlewares/requireUser";
import { validate } from "../middlewares/validate";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller";

import {
  createUserSchema,
  forgotPasswordSchema,
  loginUserSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schema/user.schema";

const router = express.Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.get("/refresh", refreshAccessTokenHandler);
router.get("/logout", deserializeUser, requireUser, logoutHandler);
// Verify Email Address
router.get(
  "/verifyemail/:verificationCode",
  validate(verifyEmailSchema),
  verifyEmailHandler
);

router.post(
  "/forgotpassword",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
router.patch(
  "/resetpassword/:resetToken",
  validate(resetPasswordSchema),
  resetPasswordHandler
);

export default router;

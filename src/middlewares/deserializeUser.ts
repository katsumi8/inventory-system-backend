import { exclude } from "../controllers/auth.controller";
import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import redisClient from "../utils/connectRedis";
import { findUniqueUser } from "../services/user.service";
import { User } from "@prisma/client";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let access_token;

    // First if checks authorization header coming from third party
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in",
      });
    }

    // Validate the access token
    const decoded = verifyJwt<{ sub: string }>(
      access_token,
      "accessTokenPublicKey"
    );

    if (!decoded) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token or user doesn't exist",
      });
    }

    // Check if the user has a valid session
    const session = await redisClient.get(decoded.sub);
    if (!session) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token or session has expired",
      });
    }
    // Check if the user still exist
    const user = await findUniqueUser({ id: JSON.parse(session).id });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token or session has expired",
      });
    }

    // Add user to res.locals
    res.locals.user = exclude(user, [
      "password",
      "verified",
      "verificationCode",
      "passwordResetToken",
      "passwordResetAt",
    ]);

    next();
  } catch (err: any) {
    next(err);
  }
};

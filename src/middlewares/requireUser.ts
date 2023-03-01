import { NextFunction, Request, Response } from "express";

// checks if the request is from an authenticated user and returns an error response if the user is not authenticated.
export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Session has expired or user doesn't exist",
      });
    }

    next();
  } catch (err: any) {
    next(err);
  }
};

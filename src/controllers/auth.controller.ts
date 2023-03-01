import { CookieOptions, NextFunction, Request, Response } from "express";
import {
  CreateUserInput,
  ForgotPasswordInput,
  LoginUserInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../schema/user.schema";
import {
  getGoogleOauthToken,
  getGoogleUser,
} from "../services/session.service";
import { prisma } from "../utils/prisma";
import config from "config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import {
  findFirstUser,
  findUniqueUser,
  signTokens,
  updateUser,
  upsertUser,
} from "../services/user.service";
import redisClient from "../utils/connectRedis";
import { signJwt, verifyJwt } from "../utils/jwt";
import Email from "../utils/emails";

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
};
if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;
const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("accessTokenExpiresIn") * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("refreshTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("refreshTokenExpiresIn") * 60 * 1000,
};

export function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

export const registerHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const verifyCode = crypto.randomBytes(32).toString("hex");
    const verificationCode = crypto
      .createHash("sha256")
      .update(verifyCode)
      .digest("hex");

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        verificationCode,
      },
    });

    const redirectUrl = `${config.get<string>(
      "frontendOrigin"
    )}/verifyemail/${verifyCode}`;

    try {
      await new Email(user, redirectUrl).sendVerificationCode();
      // await updateUser({ id: user.id }, { verificationCode });

      res.status(201).json({
        status: "success",
        message:
          "An email with a verification code has been sent to your email",
      });
    } catch (error) {
      await updateUser({ id: user.id }, { verificationCode: null });
      return res.status(500).json({
        status: "error",
        message: "There was an error sending email, please try again",
      });
    }
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({
          status: "fail",
          message: "Email already exist, please use another email address",
        });
      }
    }
    next(err);
  }
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash("sha256")
      .update(req.params.verificationCode)
      .digest("hex");

    const user = await updateUser(
      { verificationCode },
      { verified: true, verificationCode: null },
      { email: true }
    );

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Could not verify email",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(403).json({
        status: "fail",
        message: `Verification code is invalid or user doesn't exist`,
      });
    }
    next(err);
  }
};

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const user = await findUniqueUser({ email: req.body.email.toLowerCase() });
    const message = "You will receive a reset email";
    if (!user) {
      return res.status(403).json({
        status: "fail",
        message: "Account not exist.",
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: "fail",
        message: "Account not verified.",
      });
    }

    if (user.provider !== "local") {
      return res.status(403).json({
        status: "fail",
        message:
          "We found your account. It looks like you registered with a social auth account. Try signing in with social auth.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await updateUser(
      { id: user.id },
      {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { email: true }
    );

    try {
      const url = `${config.get<string>(
        "frontendOrigin"
      )}/resetpassword/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken();

      res.status(200).json({
        status: "success",
        message,
      });
    } catch (err: any) {
      await updateUser(
        { id: user.id },
        { passwordResetToken: null, passwordResetAt: null },
        {}
      );
      return res.status(500).json({
        status: "error",
        message: "There was an error sending email",
      });
    }
  } catch (err: any) {
    next(err);
  }
};

export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput["params"],
    Record<string, never>,
    ResetPasswordInput["body"]
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await findFirstUser({
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        message: "Invalid token or token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    // Change password data
    await updateUser(
      {
        id: user.id,
      },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
      { email: true }
    );

    logout(res);
    res.status(200).json({
      status: "success",
      message: "Password data updated successfully",
    });
  } catch (err: any) {
    next(err);
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUniqueUser(
      { email: email.toLowerCase() },
      {
        id: true,
        name: true,
        email: true,
        verified: true,
        password: true,
        provider: true,
      }
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // Check if user is verified
    if (!user.verified) {
      const verifyCode = crypto.randomBytes(32).toString("hex");
      const verificationCode = crypto
        .createHash("sha256")
        .update(verifyCode)
        .digest("hex");
      const redirectUrl = `${config.get<string>(
        "frontendOrigin"
      )}/verifyemail/${verifyCode}`;

      try {
        await new Email(user, redirectUrl).sendVerificationCode();
        await updateUser({ id: user.id }, { verificationCode });

        return res.status(201).json({
          status: "success",
          message:
            "An email with a verification code has been sent to your email",
          verified: user.verified,
        });
      } catch (error) {
        await updateUser({ id: user.id }, { verificationCode: null });
        return res.status(500).json({
          status: "error",
          message:
            "Email was not verified. And there was an error sending email, please try again",
          verified: user.verified,
        });
      }
    }

    if (user.provider === "Google" || user.provider === "GitHub") {
      return res.status(401).json({
        status: "fail",
        message: `Use ${user.provider} OAuth2 instead`,
      });
    }

    const { access_token, refresh_token } = await signTokens(user);
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.status(200).json({
      status: "success",
      message: `Welcome back ${user.name}`,
      verified: user.verified,
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = "Could not refresh access token";

    if (!refresh_token) {
      return res.status(403).json({
        status: "fail",
        message: "refresh Token is not provided!",
      });
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      "refreshTokenPublicKey"
    );

    if (!decoded) {
      return res.status(403).json({
        status: "fail",
        message,
      });
    }

    // Check if user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return res.status(403).json({
        status: "fail",
        message: "Session is out",
      });
    }

    // Check if user still exist
    const user = await findUniqueUser({ id: JSON.parse(session).id });

    if (!user) {
      return res.status(403).json({
        status: "fail",
        message,
      });
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey", {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    });

    // 4. Add Cookies
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

function logout(res: Response) {
  res.cookie("access_token", "", { maxAge: -1 });
  res.cookie("refresh_token", "", { maxAge: -1 });
  res.cookie("logged_in", "", { maxAge: -1 });
}

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await redisClient.del(res.locals.user.id);
    logout(res);

    res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    next(err);
  }
};

export const googleOauthHandler = async (req: Request, res: Response) => {
  const FRONTEND_ORIGIN = config.get<string>("frontendOrigin");

  try {
    const code = req.query.code as string;
    const pathUrl = (req.query.state as string) || "/";

    if (!code) {
      return res.status(401).json({
        status: "fail",
        message: "Authorization code not provided!",
      });
    }

    const { id_token, access_token } = await getGoogleOauthToken({ code });

    const { name, verified_email, email } = await getGoogleUser({
      id_token,
      access_token,
    });

    if (!verified_email) {
      return res.status(403).json({
        status: "fail",
        message: "Google account not verified",
      });
    }

    const user = await upsertUser(
      { email: email.toLowerCase() },
      { name, email, password: "", verified: true, provider: "Google" },
      { name, email, provider: "Google" }
    );

    if (!user) return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);

    // Create access and refresh token
    const { access_token: accessToken, refresh_token } = await signTokens(user);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("access_token", accessToken, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
  } catch (err: any) {
    console.log("Failed to authorize Google User", err);
    return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
  }
};

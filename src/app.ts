import express, { NextFunction, Request, Response } from "express";
import config from "config";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/prisma";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import sessionRouter from "./routes/session.route";
import productRouter from "./routes/product.route";
import validateEnv from "./utils/validateEnv";
import rateLimit from "express-rate-limit";

validateEnv();

const app = express();

async function bootstrap() {
  await connectDB();

  // TEMPLATE ENGINE for email
  app.set("view engine", "pug");
  app.set("views", `${__dirname}/views`);

  // Body Parser
  app.use(express.json({ limit: "10kb" }));
  // Cookie Parser
  // To be able to use cookies from frontend
  app.use(cookieParser());
  // To see response time and response size
  if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
  app.use("/api/images", express.static(path.join(__dirname, "../public")));

  // limit access per IP address
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 10 requests per minute
    message: "Too many requests from this IP, please try again in a minute",
  });
  app.use(limiter);

  // Cors
  // To limit the access point from frontend
  app.use(
    cors({
      credentials: true,
      origin: [config.get<string>("frontendOrigin")],
    })
  );

  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/sessions", sessionRouter);
  app.use("/api/products", productRouter);
  app.get("/api/healthChecker", (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      message: "Can connect",
    });
  });

  // UnKnown Routes
  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

export default app;

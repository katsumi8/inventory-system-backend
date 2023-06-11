import express from "express";
import { validate } from "../middlewares/validate";
import * as orderController from "../controllers/order.controller";
import { requireUser } from "../middlewares/requireUser";
import { deserializeUser } from "../middlewares/deserializeUser";
import { createOrderSchema } from "../schema/order.schema";

const router = express.Router();

// /* GET employees. */
router.get("/", orderController.get);

// /* POST employee */
router.post(
  "/",
  deserializeUser,
  requireUser,
  validate(createOrderSchema),
  orderController.post
);

export default router;

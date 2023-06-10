import express from "express";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../schema/product.schema";
import * as orderController from "../controllers/order.controller";
import { requireUser } from "../middlewares/requireUser";
import { deserializeUser } from "../middlewares/deserializeUser";

const router = express.Router();

// /* GET employees. */
router.get("/", orderController.get);

// /* POST employee */
router.post(
  "/",
  deserializeUser,
  requireUser,
  validate(createProductSchema),
  orderController.post
);

export default router;

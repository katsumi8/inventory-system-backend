import express from "express";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../schema/product.schema";
import * as productsController from "../controllers/product.controller";

const router = express.Router();

// /* GET employees. */
router.get("/", productsController.get);

// /* POST employee */
router.post("/", validate(createProductSchema), productsController.post);

export default router;

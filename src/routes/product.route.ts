import express from "express";
import * as productsController from "../controllers/product.controller";

const router = express.Router();

// /* GET employees. */
router.get("/", productsController.get);
// router.get("/byEmail", employeeController.getByEmail);

// /* POST employee */
router.post("/", productsController.post);

// /* PUT employee */
// router.put("/:id", employeeController.update);

// /* DELETE employee */
// router.delete("/:id", employeeController.remove);

export default router;

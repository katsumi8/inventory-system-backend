import { Prisma } from "@prisma/client";
import { Response, Request } from "express";
import { CreateProductInput } from "../schema/product.schema";
import { prisma } from "../utils/prisma";

// GET /products
export async function get(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany();

    return res.status(200).json({ data: products, errors: [] });
  } catch (error) {
    console.log(error);
  }
}

// POST /products
export async function post(
  req: Request<{}, {}, CreateProductInput>,
  res: Response
) {
  const productCreateInput = req.body;

  try {
    await prisma.product.create({
      data: {
        ...productCreateInput,
        salesPrice: Number(productCreateInput.salesPrice),
        openingStockValue: Number(productCreateInput.openingStockValue),
        purchasePrice: Number(productCreateInput.purchasePrice),
      },
    });

    return res
      .status(200)
      .json({ code: "OK", message: "Product created successfully" });
  } catch (error) {
    console.log(error);
  }
}

import { Response, Request } from "express";
import { prisma } from "../utils/prisma";

// GET /products
export async function get(req: Request, res: Response) {
  const products = await prisma.product.findMany();

  return res.status(200).json({ data: products, errors: [] });
}

// POST /products
export async function post(req: Request, res: Response) {
  const { name, unit, price, category } = req.body;

  const product = await prisma.product.create({
    data: {
      category,
      name,
      unit,
      price,
    },
  });

  return res.status(200).json({ data: product, errors: [] });
}

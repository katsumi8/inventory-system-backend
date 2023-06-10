import { Prisma, User } from "@prisma/client";
import { Response, Request } from "express";
import { CreateOrderInput } from "schema/order.schema";
import { prisma } from "../utils/prisma";

// GET /products
export async function get(req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({});

    return res.status(200).json({ data: orders, errors: [] });
  } catch (error) {
    console.log(error);
  }
}

// POST /products
export async function post(
  req: Request<{}, {}, CreateOrderInput>,
  res: Response
) {
  const { supplier, additionalNotes, orderLines } = req.body;
  const user: User = res.locals.user;
  const userId = user.id;

  try {
    await prisma.order.create({
      data: {
        supplier,
        additionalNotes,
        userId,
        orderLines: {
          create: orderLines.map((line) => ({
            quantity: line.quantity,
            productId: line.productId,
          })),
        },
      },
    });

    return res
      .status(200)
      .json({ code: "OK", message: "Product created successfully" });
  } catch (error) {
    console.log(error);
  }
}

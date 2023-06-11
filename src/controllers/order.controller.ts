import { Order, OrderLine, Prisma, Product, User } from "@prisma/client";
import { Response, Request } from "express";
import { CreateOrderInput } from "schema/order.schema";
import { prisma } from "../utils/prisma";

// GET /products
export async function get(req: Request, res: Response) {
  type Pretify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type test = Pretify<
    Pretify<Order> & {
      orderLines: Pretify<
        Pretify<OrderLine> & {
          product: Pretify<Product>;
        }
      >[];
    }
  >[];

  try {
    const orders = await prisma.order.findMany({
      include: { orderLines: { include: { product: true } } },
    });

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

  console.log(req.body);
  try {
    await prisma.order.create({
      data: {
        supplier,
        additionalNotes,
        userId,
        orderLines: {
          create: orderLines.map((line) => ({
            quantity: line.quantity,
            productId: Number(line.productId),
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

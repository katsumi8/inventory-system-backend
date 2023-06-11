import { TypeOf, z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    supplier: z.string().min(1, "Supplier is required"),
    additionalNotes: z.string().optional(),
    orderLines: z
      .array(
        z.object({
          quantity: z.number().min(1, "Quantity must be at least 1"),
          productId: z.string().min(1, "Product Id is required"),
        })
      )
      .min(1, "At least one order line item is required"),
  }),
});

export type CreateOrderInput = TypeOf<typeof createOrderSchema>["body"];

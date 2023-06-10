import { TypeOf, z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    itemName: z.string().min(1, "Name is required"),
    unit: z.string().min(1, "Unit is required"),
    salesPrice: z.string().min(1, "Sales Price is required"),
    itemCategory: z.string().min(1, "Item Category is required"),
    salesAccount: z.string().min(1, "Sales Account is required"),
    purchasePrice: z.string(),
    purchaseAccount: z.string().min(1, "Purchase Account is required"),
    stockKeepingUnit: z.string().min(1, "Stock Keeping Unit is required"),
    openingStockValue: z.string().optional(),
  }),
});

export type CreateProductInput = TypeOf<typeof createProductSchema>["body"];

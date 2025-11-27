import { z } from "zod";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};

// Order validation schema
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        qty: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
});


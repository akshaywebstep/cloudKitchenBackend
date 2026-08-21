import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ===============================================
// 📦 STOCK SCHEMA
// ===============================================
const stockSchema = z.object({

    // ✅ Required
    id: z.coerce
        .number()
        .positive("Id must be a positive number"),

    // ✅ 0 ya positive number allow karne ke liye:
    stock: z.coerce
        .number()
        .min(0, "Stock cannot be negative"), // ya .nonnegative()

    // ✅ Optional
    expireAt: z.coerce
        .date()
        .optional(),

});

// ==============================
// 🧾 CREATE SCHEMA
// ==============================

export const createStockSchema = z.object({
    stocks: z.array(stockSchema)
        .min(1, "At least one stock is required")
});

// ==============================
// 🛡️ MIDDLEWARE
// ==============================

export const validateCreateStock = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const result = createStockSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors,
        });
    }

    req.body = result.data;

    next();
};
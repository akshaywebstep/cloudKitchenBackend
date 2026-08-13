import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Adjust this to match your actual Prisma enum name for unit (e.g. Unit)
export const UnitEnum = z.enum(['KG', 'GM', 'ITEM']);

// ==============================
// 🧾 CREATE SCHEMA
// ==============================
export const createInventorySchema = z.object({
    ingredients: z.array(
        z.object({
            id: z.number().int().positive("Ingredient id is required"),
            unit: UnitEnum
        })
    ).min(1, "At least one ingredient is required")
});

export const validateCreateInventory = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = createInventorySchema.safeParse(req.body);

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

// ==============================
// ✏️ UPDATE SCHEMA (change unit for one ingredient mapping)
// ==============================
export const updateInventorySchema = z.object({
    unit: UnitEnum
});

export const validateUpdateInventory = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = updateInventorySchema.safeParse(req.body);

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
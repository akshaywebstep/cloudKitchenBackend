import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Unit } from '../../../../../prisma/generated/prisma/client';

// ===============================================
// 🥬 INGREDIENT SCHEMA
// ===============================================
const ingredientSchema = z.object({

    id: z.coerce.number().positive().optional(),

    name: z
        .string()
        .trim()
        .min(1, "Ingredient name is required")
        .optional(),

    category: z
        .string()
        .trim()
        .min(1, "Category is required")
        .optional(),

    image: z
        .string()
        .url("Image must be a valid URL")
        .optional(),

    unit: z.nativeEnum(Unit, {
        message: "Unit is required"
    }),

}).superRefine((val, ctx) => {

    // ✅ Agar id nahi hai to name + category dono required
    if (!val.id) {

        if (!val.name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ingredient name is required if id is not provided",
                path: ["name"],
            });
        }

        if (!val.category) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Category is required if id is not provided",
                path: ["category"],
            });
        }
    }
});

// ==============================
// 🧾 CREATE SCHEMA
// ==============================

export const createIngredientSchema = z.object({

    ingredients: z.array(ingredientSchema)
        .min(1, "At least one ingredient is required")

});

// ==============================
// 🛡️ MIDDLEWARE
// ==============================

export const validateCreateIngredient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const result = createIngredientSchema.safeParse(req.body);

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

export const updateInventoryIngredientSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required").optional(),
    category: z.string().trim().min(1, "Category is required").optional(),
    image: z.string().trim().optional().transform((val) => val || undefined),
    unit: z.nativeEnum(Unit).optional(),
}).refine((val) => Object.keys(val).length > 0, {
    message: "At least one field is required",
});

export const validateUpdateInventoryIngredient = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const result = updateInventoryIngredientSchema.safeParse(req.body);

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

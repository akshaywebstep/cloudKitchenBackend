import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../../prisma/generated/prisma/client';

// ===============================================
// 🏷️ CATEGORY / SUBCATEGORY SCHEMA
// ===============================================
const categorySchema = z.object({
    id: z.coerce.number().positive().optional(),
    name: z.string().trim().min(1).optional(),
}).superRefine((val, ctx) => {
    if (!val.id && !val.name) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either category id or name is required",
            path: ["name"],
        });
    }
});

const subCategorySchema = z.object({
    id: z.coerce.number().positive().optional(),
    name: z.string().trim().min(1).optional(),
}).superRefine((val, ctx) => {
    if (!val.id && !val.name) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either subCategory id or name is required",
            path: ["name"],
        });
    }
});

// ===============================================
// 🥬 INGREDIENT SCHEMA
// ===============================================
const ingredientSchema = z.object({
    id: z.coerce.number().positive("Ingredient id is required"),

    quantity: z.coerce
        .number()
        .positive("Ingredient quantity must be greater than 0"),
});

// ==============================
// 🍽️ CREATE MENU ITEM SCHEMA
// ==============================
export const createMenuItemSchema = z.object({

    // ===============================================
    // 🏷️ BASIC INFO
    // ===============================================
    name: z
        .string()
        .trim()
        .min(1, "Menu item name is required"),

    description: z
        .string()
        .trim()
        .optional(),

    price: z.coerce
        .number()
        .positive("Price must be greater than 0"),

    // ===============================================
    // 🏷️ CATEGORY
    // ===============================================
    category: categorySchema.optional(),

    // ===============================================
    // 🏷️ SUB CATEGORY
    // ===============================================
    subCategory: subCategorySchema.optional(),

    // ===============================================
    // 🥬 INGREDIENTS
    // ===============================================
    ingredients: z.array(ingredientSchema)
        .min(1, "At least one ingredient is required"),
});

// ==============================
// ✏️ UPDATE MENU ITEM SCHEMA
// ==============================
export const updateMenuItemSchema = createMenuItemSchema.partial();

// ==============================
// 🆔 PARAM SCHEMA
// ==============================
export const menuItemIdSchema = z.object({
    id: z.coerce.number().positive(),
});

// ==============================
// 🔄 STATUS SCHEMA
// ==============================
export const updateMenuItemStatusSchema = z.object({
    status: z.nativeEnum(Status, {
        message: "Invalid status value"
    })
});

// ==============================
// 🛡️ MIDDLEWARES
// ==============================

export const validateCreateMenuItem = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = createMenuItemSchema.safeParse(req.body);

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

export const validateUpdateMenuItem = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = updateMenuItemSchema.safeParse(req.body);

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

export const validateMenuItemId = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = menuItemIdSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Invalid menu item id',
        });
    }

    next();
};

export const validateMenuItemStatus = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const result = updateMenuItemStatusSchema.safeParse(req.body);

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
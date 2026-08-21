import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Status } from '../../../../prisma/generated/prisma/client';

// ===============================================
// 🍽️ CUISINE SCHEMA
// ===============================================
const cuisineSchema = z.object({
    id: z.coerce.number().positive().optional(),
    name: z.string().min(1).optional(),
}).superRefine((val, ctx) => {
    // ❌ id bhi nahi, name bhi nahi
    if (!val.id && !val.name) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Either cuisine id or name is required",
            path: ["name"],
        });
    }

    // ❌ id nahi hai aur name empty hai
    if (!val.id && val.name === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cuisine name is required if id is not provided",
            path: ["name"],
        });
    }
});

// ==============================
// 🧾 SCHEMAS
// ==============================

export const createBranchSchema = z.object({
    // ===============================================
    // 🏷️ BASIC INFO
    // ===============================================
    name: z
        .string()
        .min(1, "Branch name is required"),

    // ===============================================
    // 📍 ADDRESS
    // ===============================================
    addressLine1: z
        .string()
        .min(1, "Address Line 1 is required"),

    addressLine2: z
        .string()
        .optional(),

    landmark: z
        .string()
        .optional(),

    area: z
        .string()
        .optional(),

    pincode: z
        .string()
        .regex(/^[0-9]{6}$/, "Pincode must be a valid 6 digit number"),

    // ===============================================
    // 🌍 LOCATION RELATIONS
    // ===============================================
    countryId: z
        .coerce
        .number()
        .positive("Country is required"),

    stateId: z
        .coerce
        .number()
        .positive("State is required"),

    cityId: z
        .coerce
        .number()
        .positive("City is required"),

    // ===============================================
    // 📞 CONTACT PERSON
    // ===============================================
    contactTitle: z.enum(['MR', 'MRS', 'MS', 'DR'], {
        message: "Contact title must be MR, MRS, MS or DR"
    }),

    contactFirstName: z
        .string()
        .min(1, "Contact first name cannot be empty"),

    contactLastName: z
        .string()
        .optional(),

    contactEmail: z
        .string()
        .email("Invalid contact email format"),

    contactPhone: z
        .string()
        .min(7, "Contact phone is too short")
        .max(15, "Contact phone is too long")
        .regex(/^\+?[0-9]+$/, "Contact phone must be a valid number"),

    cuisines: z.array(cuisineSchema)
        .min(1, "At least one cuisine is required")
});

export const updateBranchSchema = createBranchSchema.partial();

export const branchIdSchema = z.object({
    id: z.coerce.number().positive(),
});

export const updateBranchStatusSchema = z.object({
    status: z.nativeEnum(Status, {
        message: "Invalid status value"
    })
});

// ==============================
// 🛡️ MIDDLEWARES
// ==============================

export const validateCreateBranch = (req: Request, res: Response, next: NextFunction) => {
    const result = createBranchSchema.safeParse(req.body);

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

export const validateUpdateBranch = (req: Request, res: Response, next: NextFunction) => {
    const result = updateBranchSchema.safeParse(req.body);

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

export const validateBranchId = (req: Request, res: Response, next: NextFunction) => {
    const result = branchIdSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Invalid branch id',
        });
    }

    next();
};

export const validateBranchStatus = (req: Request, res: Response, next: NextFunction) => {
    const result = updateBranchStatusSchema.safeParse(req.body);

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
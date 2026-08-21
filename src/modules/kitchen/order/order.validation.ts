import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '../../../../prisma/generated/prisma/client';

// ==============================
// 🛒 ORDER ITEM SCHEMA
// ==============================
const orderItemSchema = z.object({
    menuItemId: z.coerce.number().positive("menuItemId is required"),
    quantity: z.coerce.number().int().positive("quantity must be a positive integer"),
});

// ==============================
// 👤 CUSTOMER SCHEMA
// ==============================
const customerSchema = z.object({
    firstName: z.string().min(1, "firstName is required"),
    lastName: z.string().optional(),
    gender: z.string().optional(),
});

// ==============================
// 📍 ADDRESS SCHEMA (billing & shipping dono ke liye common)
// ==============================
const addressSchema = z.object({
    address1: z.string().min(1, "address1 is required"),
    address2: z.string().optional(),
    countryId: z.coerce.number().positive("countryId is required"),
    stateId: z.coerce.number().positive("stateId is required"),
    cityId: z.coerce.number().positive("cityId is required"),
    pincode: z.string().optional(),
    phoneNumber: z.string().min(1, "phoneNumber is required"),
});

// ==============================
// 🧾 CREATE ORDER SCHEMA
// ==============================
export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    customer: customerSchema,
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
});

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction) => {
    const result = createOrderSchema.safeParse(req.body);
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
// 🔄 BULK UPDATE STATUS SCHEMA
// ==============================
export const bulkUpdateOrderStatusSchema = z.object({
    orderIds: z
        .array(
            z.coerce.number().positive({ message: "Each order ID must be a positive number" })
        )
        .min(1, { message: "At least one order ID is required" }),
    status: z.nativeEnum(OrderStatus, { message: "Invalid status value" })
});

export const validateBulkUpdateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
    const result = bulkUpdateOrderStatusSchema.safeParse(req.body);

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
// 🆔 PARAM SCHEMA 
// ==============================
export const orderIdSchema = z.object({
    id: z.coerce.number().positive(),
});

export const validateOrderId = (req: Request, res: Response, next: NextFunction) => {
    const result = orderIdSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ status: false, message: 'Invalid order id' });
    }
    next();
};
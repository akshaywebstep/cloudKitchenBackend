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
// 🧾 CREATE ORDER SCHEMA
// ==============================
export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
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
// 🔄 UPDATE STATUS SCHEMA
// ==============================
export const updateOrderStatusSchema = z.object({
    status: z.nativeEnum(OrderStatus, { message: "Invalid status value" })
});

export const validateUpdateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
    const result = updateOrderStatusSchema.safeParse(req.body);
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
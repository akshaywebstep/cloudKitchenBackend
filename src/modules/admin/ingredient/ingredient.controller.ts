import { Request, Response } from 'express';
import * as IngredientService from './ingredient.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE INGREDIENT
// =====================================================
export const CreateIngredient = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE INGREDIENT START ===');

    try {
        const result = await IngredientService.createIngredient(req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE INGREDIENT ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE INGREDIENT END ===');
    }
};

// =====================================================
// 📄 GET ALL INGREDIENTS
// =====================================================
export const getIngredients = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET INGREDIENTS START ===');

    try {
        const { page = 1, limit = 10, name, category, status } = req.query;

        const result = await IngredientService.getIngredients({
            page: Number(page),
            limit: Number(limit),
            filters: {
                name: name ? String(name) : undefined,
                category: category ? String(category) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Ingredients fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET INGREDIENTS END ===');
    }
};

// =====================================================
// 📄 GET SINGLE INGREDIENT
// =====================================================
export const getIngredientById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await IngredientService.getIngredientById(id);

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// ✏️ UPDATE INGREDIENT
// =====================================================
export const updateIngredient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await IngredientService.updateIngredient(id, req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE INGREDIENT
// =====================================================
export const deleteIngredient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await IngredientService.deleteIngredient(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};
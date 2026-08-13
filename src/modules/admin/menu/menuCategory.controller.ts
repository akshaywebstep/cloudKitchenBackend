import { Request, Response } from 'express';
import * as MenuCategoryService from './menuCategory.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE MENU CATEGORY
// =====================================================
export const createMenuCategory = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE MENU CATEGORY START ===');

    try {
        const result = await MenuCategoryService.createMenuCategory(req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE MENU CATEGORY ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE MENU CATEGORY END ===');
    }
};

// =====================================================
// 📄 GET ALL MENU CATEGORIES
// =====================================================
export const getMenuCategories = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET MENU CATEGORIES START ===');

    try {
        const { page = 1, limit = 10, name, parentId, status } = req.query;

        const result = await MenuCategoryService.getMenuCategories({
            page: Number(page),
            limit: Number(limit),
            filters: {
                name: name ? String(name) : undefined,
                parentId: parentId !== undefined ? (parentId === 'null' ? null : Number(parentId)) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Menu categories fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET MENU CATEGORIES END ===');
    }
};

// =====================================================
// 🌳 GET NESTED TREE
// =====================================================
export const getMenuCategoryTree = async (req: Request, res: Response) => {
    try {
        const result = await MenuCategoryService.getMenuCategoryTree();

        return res.status(200).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 📄 GET SINGLE MENU CATEGORY
// =====================================================
export const getMenuCategoryById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await MenuCategoryService.getMenuCategoryById(id);

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// ✏️ UPDATE MENU CATEGORY
// =====================================================
export const updateMenuCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await MenuCategoryService.updateMenuCategory(id, req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE MENU CATEGORY
// =====================================================
export const deleteMenuCategory = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await MenuCategoryService.deleteMenuCategory(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};
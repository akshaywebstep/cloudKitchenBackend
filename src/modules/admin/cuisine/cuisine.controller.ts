import { Request, Response } from 'express';
import * as CuisineService from './cuisine.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE CUISINE
// =====================================================
export const CreateCuisine = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE CUISINE START ===');

    try {
        const result = await CuisineService.createCuisine(req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE CUISINE ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE CUISINE END ===');
    }
};

// =====================================================
// 📄 GET ALL CUISINES
// =====================================================
export const getCuisines = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET CUISINES START ===');

    try {
        const { page = 1, limit = 10, name, status } = req.query;

        const result = await CuisineService.getCuisines({
            page: Number(page),
            limit: Number(limit),
            filters: {
                name: name ? String(name) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Cuisines fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET CUISINES END ===');
    }
};

// =====================================================
// 📄 GET SINGLE CUISINE
// =====================================================
export const getCuisineById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await CuisineService.getCuisineById(id);

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// ✏️ UPDATE CUISINE
// =====================================================
export const updateCuisine = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await CuisineService.updateCuisine(id, req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE CUISINE
// =====================================================
export const deleteCuisine = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await CuisineService.deleteCuisine(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};
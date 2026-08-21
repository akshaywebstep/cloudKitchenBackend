import { Request, Response } from 'express';
import * as BranchService from './branch.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE BRANCH
// =====================================================
export const createBranch = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE BRANCH START ===');

    try {
        const result = await BranchService.createBranch(req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE BRANCH ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE BRANCH END ===');
    }
};

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getBranches = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET BRANCHES START ===');

    try {
        const { page = 1, limit = 10, userId, name, status } = req.query;

        const result = await BranchService.getBranches({
            page: Number(page),
            limit: Number(limit),
            filters: {
                userId: userId ? Number(userId) : undefined,
                name: name ? String(name) : undefined,
                status: status ? (String(status) as any) : undefined
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Branches fetched successfully',
            data: result.data,
            meta: result.meta
        });
    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET BRANCHES END ===');
    }
};

// =====================================================
// 📄 GET SINGLE BRANCH
// =====================================================
export const getBranchById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await BranchService.getBranchById(id);

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// ✏️ UPDATE BRANCH
// =====================================================
export const updateBranch = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await BranchService.updateBranch(id, req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};

// =====================================================
// 🗑️ DELETE BRANCH
// =====================================================
export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await BranchService.deleteBranch(id);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    }
};
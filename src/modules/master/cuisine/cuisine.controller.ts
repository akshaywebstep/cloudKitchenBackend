import { Request, Response } from 'express';
import * as CuisineService from './cuisine.service';
import { debugError } from '../../../core/helpers/debug';
import { debug } from 'node:console';

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getCuisines = async (req: Request, res: Response) => {
    debug('=== GET BRANCHES START ===');

    try {
        const { page = 1, limit = 10, name, category, status } = (req as any).validatedQuery as {
            page?: number;
            limit?: number;
            name?: string;
            category?: string;
            status?: string;
        };

        const result = await CuisineService.getCuisines({
            page: Number(page),
            limit: Number(limit),
            filters: {
                name,
                category,
                status
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Cuisines fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debug('=== GET BRANCHES END ===');
    }
};
import { Request, Response } from 'express';
import * as IngredienteService from './ingredient.service';
import { debug, debugError } from '../../../core/helpers/debug';

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getIngredientes = async (req: Request, res: Response) => {
    debug('=== GET BRANCHES START ===');

    try {
        const { page = 1, limit = 10, name, category, status } = (req as any).validatedQuery as {
            page?: number;
            limit?: number;
            name?: string;
            category?: string;
            status?: string;
        };

        const result = await IngredienteService.getIngredientes({
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
            message: 'Ingredientes fetched successfully',
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
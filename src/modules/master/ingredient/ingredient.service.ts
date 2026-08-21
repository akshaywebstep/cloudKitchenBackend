import { debug, debugError } from '../../../core/helpers/debug';
import ingredienteRepo from './ingredient.repository';

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getIngredientes = async (params: {
    page: number;
    limit: number;
    filters: {
        name?: string;
        category?: string;
        status?: string;
    };
}) => {
    try {
        const { page, limit, filters } = params;

        const skip = (page - 1) * limit;

        debug(`[Ingrediente Service] Fetching ingredientes | Page: ${page}`);

        // ===============================================
        // 🔍 BUILD WHERE FILTER
        // ===============================================
        const where: any = {};

        if (filters.name) {
            where.name = {
                contains: filters.name
            };
        }

        if (filters.category) {
            where.category = {
                contains: filters.category
            };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        // ===============================================
        // 📦 FETCH DATA
        // ===============================================
        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            ingredienteRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),

            // filtered count
            ingredienteRepo.count({ where }),

            // total count (without filter)
            ingredienteRepo.count(),
        ]);

        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;

        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page,
                limit,

                total,        // 🔥 total records (all)
                filtered,     // 🔥 after filter
                count: data.length, // 🔥 current page items

                totalPages,   // 🔥 total pages possible

                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        debugError(`[Ingrediente Service] getIngredientes failed: ${error.message}`);

        return {
            status: false,
            message: "Failed to fetch ingredientes",
            data: [],
            meta: null,
        };
    }
};
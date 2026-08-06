// src/modules/admin/index.ts

import { Router } from 'express';
import cuisineRoutes from './cuisine/cuisine.route';
import ingredientRoutes from './ingredient/ingredient.route';
import { prisma } from '../../../lib/prisma';
import stringHelper from '../../core/helpers/string.helper';

const router = Router({
    mergeParams: true
});

// This mounts cuisine sub-routes under /cuisine
router.use('/cuisine', cuisineRoutes);
router.use('/ingredient', ingredientRoutes);

router.get('/country', async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const countries = await prisma.country.findMany({
            where: search
                ? {
                    name: {
                        contains: search
                    }
                }
                : undefined,
            select: {
                id: true,
                name: true,
                iso2: true,
                iso3: true,
                phonecode: true
            },
            orderBy: {
                name: 'asc'
            },
            take: Number(req.query.limit || 250)
        });

        return res.status(200).json({
            status: true,
            message: 'Countries fetched successfully',
            data: stringHelper.convertBigInt(countries, 'number')
        });
    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Unable to fetch countries'
        });
    }
});

router.get('/state', async (req, res) => {
    try {
        const countryId = req.query.countryId ? BigInt(String(req.query.countryId)) : undefined;
        const states = await prisma.state.findMany({
            where: countryId ? { countryId } : undefined,
            select: {
                id: true,
                name: true,
                countryId: true,
                iso2: true,
                type: true
            },
            orderBy: {
                name: 'asc'
            },
            take: Number(req.query.limit || 500)
        });

        return res.status(200).json({
            status: true,
            message: 'States fetched successfully',
            data: stringHelper.convertBigInt(states, 'number')
        });
    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Unable to fetch states'
        });
    }
});

router.get('/city', async (req, res) => {
    try {
        const countryId = req.query.countryId ? BigInt(String(req.query.countryId)) : undefined;
        const stateId = req.query.stateId ? BigInt(String(req.query.stateId)) : undefined;
        const cities = await prisma.city.findMany({
            where: {
                ...(countryId ? { countryId } : {}),
                ...(stateId ? { stateId } : {})
            },
            select: {
                id: true,
                name: true,
                stateId: true,
                countryId: true
            },
            orderBy: {
                name: 'asc'
            },
            take: Number(req.query.limit || 500)
        });

        return res.status(200).json({
            status: true,
            message: 'Cities fetched successfully',
            data: stringHelper.convertBigInt(cities, 'number')
        });
    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Unable to fetch cities'
        });
    }
});

export default router;

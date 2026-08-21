// src/modules/kitchen/subscription/subscription.controller.ts

import { Request, Response } from 'express';
import { debug, debugError, debugWarn } from '../../../core/helpers/debug';
import { listPlansService, selectPlanService } from './subscription.service';

export const listPlans = async (_req: Request, res: Response) => {
    debug('=== LIST PLANS START ===');

    try {
        const result = await listPlansService();

        if (!result.status) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error: any) {
        debugError('LIST PLANS ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debug('=== LIST PLANS END ===');
    }
};

export const selectPlan = async (req: Request, res: Response) => {
    debug('=== SELECT PLAN START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };

        const kitchenId = request.kitchen.id;

        const { subscriptionId, billingCycle, duration } = request.body;

        const result = await selectPlanService({
            kitchenId,
            subscriptionId,
            billingCycle,
            duration
        });

        if (!result.status) {
            return res.status(400).json(result);
        }

        return res.status(201).json({
            status: true,
            message: result.message
        });

    } catch (error: any) {
        debugError('❌ SELECT PLAN ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debug('=== SELECT PLAN END ===');
    }
};

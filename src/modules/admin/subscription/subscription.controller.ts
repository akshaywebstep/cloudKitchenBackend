import { Request, Response } from 'express';
import * as SubscriptionAdminService from './subscription.service';
import debugHelper from '../../../core/helpers/debug';

// =====================================================
// ✅ CREATE SUBSCRIPTION
// =====================================================
export const createSubscription = async (req: Request, res: Response) => {
    debugHelper.debug('=== CREATE SUBSCRIPTION START ===');
    try {
        const result = await SubscriptionAdminService.createSubscription(req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(201).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ CREATE SUBSCRIPTION ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== CREATE SUBSCRIPTION END ===');
    }
};

// =====================================================
// ✏️ UPDATE SUBSCRIPTION
// =====================================================
export const updateSubscription = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE SUBSCRIPTION START ===');
    try {
        const { id } = req.params;
        const result = await SubscriptionAdminService.updateSubscription(Number(id), req.body);

        if (!result.status) {
            return res.status(400).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ UPDATE SUBSCRIPTION ERROR:', error);
        return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
    } finally {
        debugHelper.debug('=== UPDATE SUBSCRIPTION END ===');
    }
};

// =====================================================
// 📄 LIST SUBSCRIPTIONS
// =====================================================
export const getSubscriptions = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET SUBSCRIPTIONS START ===');
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await SubscriptionAdminService.getSubscriptions({
            page: Number(page),
            limit: Number(limit),
        });

        return res.status(200).json({ status: true, message: 'Subscription plans fetched successfully', data: result.data, meta: result.meta });
    } catch (error: any) {
        debugHelper.debugError('❌ GET SUBSCRIPTIONS ERROR:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET SUBSCRIPTIONS END ===');
    }
};

// =====================================================
// 🔍 GET SINGLE SUBSCRIPTION (preview)
// =====================================================
export const getSubscriptionById = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET SUBSCRIPTION BY ID START ===');
    try {
        const { id } = req.params;
        const result = await SubscriptionAdminService.getSubscriptionById(Number(id));

        if (!result.status) {
            return res.status(404).json({ status: false, message: result.message });
        }

        return res.status(200).json({ status: true, message: result.message, data: result.data });
    } catch (error: any) {
        debugHelper.debugError('❌ GET SUBSCRIPTION BY ID ERROR:', error);
        return res.status(500).json({ status: false, message: error.message });
    } finally {
        debugHelper.debug('=== GET SUBSCRIPTION BY ID END ===');
    }
};
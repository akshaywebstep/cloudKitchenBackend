// src/modules/admin/subscription/index.ts (fix path also)

import { Router } from 'express';
import { verifyToken } from '../auth/auth.middleware';
import * as SubscriptionController from '../../kitchen/subscription/subscription.controller';
import { validateSelectPlan } from '../../kitchen/subscription/subscription.validation';

const router = Router({
    mergeParams: true
});

router.get(
  '/plans',
  SubscriptionController.listPlans
);

router.post(
  '/select',
  verifyToken({ checkOnboarding: true }),
  validateSelectPlan,
  SubscriptionController.selectPlan
);

export default router;

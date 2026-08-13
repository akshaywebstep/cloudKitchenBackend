// src/modules/admin/index.ts

import { Router } from 'express';
import authRoutes from './auth/auth.route';
import onboardingRoutes from './onboarding/onboarding.route';
import subscriptionRoutes from './subscription/subscription.route';
import branchRoutes from './branch/branch.route';
import orderRoutes from "./order/order.route";
import staffRoleRoutes from "./staffRole/staffRole.route";

const router = Router({
    mergeParams: true
});

// This mounts auth sub-routes under /auth
router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/branch', branchRoutes);
router.use("/order/branch/:branchId", orderRoutes);
router.use("/staff-role", staffRoleRoutes); 

export default router;
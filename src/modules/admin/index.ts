// src/modules/admin/index.ts

import { Router } from "express";
import authRoutes from "./auth/auth.route";
import kitchenRoutes from "./kitchen/kitchen.route";

const router = Router({
  mergeParams: true,
});

// This mounts admin sub-routes under /api/v1/admin
router.use("/auth", authRoutes);
router.use("/kitchen", kitchenRoutes);

export default router;

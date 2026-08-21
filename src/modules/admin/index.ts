// src/modules/admin/index.ts

import { Router } from "express";
import authRoutes from "./auth/auth.route";
import kitchenRoutes from "./kitchen/kitchen.route";
import IngredientRoutes from "./ingredient/ingredient.route";
import CuisineRoutes from "./cuisine/cuisine.route";
import BranchRoutes from "./branch/branch.route";
import MenuRoutes from "./menu/menuCategory.route";
import OrderRoutes from "./orders/order.route";
import SubscriptionRoutes from "./subscription/subscription.route";

const router = Router({
  mergeParams: true,
});

// This mounts admin sub-routes under /api/v1/admin
router.use("/auth", authRoutes);
router.use("/kitchen", kitchenRoutes);
router.use("/ingredient", IngredientRoutes);
router.use("/cuisine", CuisineRoutes);
router.use("/branch", BranchRoutes);
router.use("/menu", MenuRoutes);
router.use("/order", OrderRoutes);
router.use("/subscription", SubscriptionRoutes); // This mounts the order routes under /api/v1/admin/orders

export default router;

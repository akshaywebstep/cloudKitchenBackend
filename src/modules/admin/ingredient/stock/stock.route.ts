import { Router } from 'express';
import * as StockController from './stock.controller';
import { verifyToken } from "../../auth/auth.middleware";
import { validateCreateStock } from "./stock.validation";
import { checkPermission } from "../../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../../prisma/generated/prisma/client";

const router = Router({
  mergeParams: true,
});

// 📌 Create Stock
// POST /api/v1/kitchen/branch/:branchId/stock
router.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({
    panel: Panel.ADMIN,
    module: "stock",
    action: Action.CREATE,
  }),
  validateCreateStock,
  StockController.createStock,
);

// 📌 Get All Stocks
// GET /api/v1/kitchen/branch/:branchId/stock
router.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  checkPermission({ panel: Panel.ADMIN, module: "stock", action: Action.VIEW }),
  StockController.getStocks,
);

export default router;
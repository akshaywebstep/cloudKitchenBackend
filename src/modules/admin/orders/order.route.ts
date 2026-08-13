import { Router } from "express";
import * as OrderController from "./order.controller";
import { verifyToken } from "../auth/auth.middleware";
import { checkPermission } from "../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../prisma/generated/prisma/client";

const router = Router({ mergeParams: true });

// 📌 Get All Orders (All branches/kitchens)
// GET /api/v1/admin/order
router.get(
  "/",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "order", action: Action.VIEW }),
  OrderController.getOrders,
);

// 📌 Get Single Order
// GET /api/v1/admin/order/:id
router.get(
  "/:id",
  verifyToken(),
  checkPermission({ panel: Panel.ADMIN, module: "order", action: Action.VIEW }),
  OrderController.getOrderById,
);

export default router;

import { Router } from "express";
import multer from "multer";
import * as KitchenController from "./kitchen.controller";
import { verifyToken } from "../auth/auth.middleware";
import {
  validateCreateKitchen,
  validateUpdateKitchen,
} from "./kitchen.validation";
import { checkPermission } from "../../../core/permission/permission.middleware";
import { Panel, Action } from "../../../../prisma/generated/prisma/client";

// ✅ disk storage —
const upload = multer({
  dest: "uploads/tmp/",
});

const router = Router({ mergeParams: true });

router.post(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "kitchen",
    action: Action.CREATE,
  }),
  upload.any(),
  validateCreateKitchen,
  KitchenController.createKitchen,
);

router.put(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "kitchen",
    action: Action.UPDATE,
  }),
  upload.any(),
  validateUpdateKitchen,
  KitchenController.updateKitchen,
);

// 📌 Get All Kitchens
// GET /api/v1/admin/kitchen
router.get(
  "/",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "kitchen",
    action: Action.VIEW,
  }),
  KitchenController.getKitchens,
);

// 📌 Get Single Kitchen
// GET /api/v1/admin/kitchen/:id
router.get(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "kitchen",
    action: Action.VIEW,
  }),
  KitchenController.getKitchenById,
);

// 📌 Delete Kitchen
// DELETE /api/v1/admin/kitchen/:id
router.delete(
  "/:id",
  verifyToken(),
  checkPermission({
    panel: Panel.ADMIN,
    module: "kitchen",
    action: Action.DELETE,
  }),
  KitchenController.deleteKitchen,
);

export default router;

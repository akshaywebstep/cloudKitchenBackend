import { Request, Response, NextFunction } from "express";
import { checkUserPermission } from "./permission.service";
import { Panel, Action } from "../../../prisma/generated/prisma/client";
import debugHelper from "../helpers/debug";

export const checkPermission = (options: { panel: Panel; module: string; action: Action }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    debugHelper.debug("=== PERMISSION CHECK START ===");

    try {
      // 👇 admin, kitchen, ya user — jo bhi auth middleware set kare
      const request = req as Request & {
        admin?: { id: number };
        kitchen?: { id: number };
        user?: { id: number };
      };
      const userId = request.admin?.id ?? request.kitchen?.id ?? request.user?.id;

      if (!userId) {
        debugHelper.debugError("[Permission Middleware] ❌ userId not found in request");
        return res.status(401).json({ status: false, message: "Unauthorized: user not found in request" });
      }

      const result = await checkUserPermission(userId, options);

      debugHelper.debug(`[Permission Middleware] Result:`, JSON.stringify(result));

      if (!result.status) {
        return res.status(403).json({ status: false, message: result.message });
      }

      next();
    } catch (error: any) {
      debugHelper.debugError("❌ PERMISSION MIDDLEWARE ERROR:", error);
      return res.status(500).json({ status: false, message: error.message || "Internal server error" });
    } finally {
      debugHelper.debug("=== PERMISSION CHECK END ===");
    }
  };
};
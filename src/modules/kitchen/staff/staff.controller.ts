import { Request, Response } from 'express';
import * as StaffService from './staff.service';
import debugHelper from '../../../core/helpers/debug';
import { saveFile } from "../../../core/helpers/file.helper";

// =====================================================
// ✅ CREATE STAFF
// =====================================================
export const createStaff = async (req: Request, res: Response) => {
  debugHelper.debug("=== CREATE STAFF START ===");

  try {
    const request = req as Request & {
      kitchen: { id: number };
      files?: Express.Multer.File[];
    };

    const kitchenId = request.kitchen.id;

    // 🖼️ Handle Profile Picture Upload
    const profilePictureFile = request.files?.find(
      (f) => f.fieldname === "profilePicture",
    );

    let savedPath: string | undefined;
    if (profilePictureFile) {
      savedPath = await saveFile(profilePictureFile, {
        destination: "uploads/profilePicture",
        name: "staff-profilePicture",
        unique: true,
      });
    }

    // Service call
    const result = await StaffService.createStaff({
      kitchenId,
      profilePicture: savedPath || "", // Saved file path
      ...req.body,
    });

    if (!result.status) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    debugHelper.debugError("❌ CREATE STAFF ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  } finally {
    debugHelper.debug("=== CREATE STAFF END ===");
  }
};

// =====================================================
// 📋 GET STAFF FORM OPTIONS
// =====================================================
export const getStaffFormOptions = async (req: Request, res: Response) => {
  debugHelper.debug("=== GET STAFF FORM OPTIONS START ===");

  try {
    const request = req as Request & { kitchen: { id: number } };
    const kitchenId = request.kitchen.id;

    const staffUserId = req.query.staffUserId
      ? Number(req.query.staffUserId)
      : undefined;

    const result = await StaffService.getStaffFormOptions(
      kitchenId,
      staffUserId,
    );

    if (!result.status) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    debugHelper.debugError("❌ GET STAFF FORM OPTIONS ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  } finally {
    debugHelper.debug("=== GET STAFF FORM OPTIONS END ===");
  }
};

// =====================================================
// 📄 GET ALL STAFF
// =====================================================
export const getStaff = async (req: Request, res: Response) => {
  debugHelper.debug("=== GET STAFF START ===");

  try {
    const request = req as Request & { kitchen: { id: number } };
    const kitchenId = request.kitchen.id;

    const { page = 1, limit = 10, status } = req.query;

    const result = await StaffService.getStaff({
      page: Number(page),
      limit: Number(limit),
      filters: {
        kitchenId,
        status: status ? (String(status) as any) : undefined,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Staff fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    debugHelper.debugError("❌ Controller Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  } finally {
    debugHelper.debug("=== GET STAFF END ===");
  }
};

// =====================================================
// 🔍 GET SINGLE STAFF
// =====================================================
export const getStaffById = async (req: Request, res: Response) => {
  debugHelper.debug("=== GET STAFF BY ID START ===");

  try {
    const request = req as Request & { kitchen: { id: number } };
    const kitchenId = request.kitchen.id;
    const { id } = req.params;

    const result = await StaffService.getStaffById(Number(id));

    if (!result.status) {
      return res.status(404).json({ status: false, message: result.message });
    }

    if (Number(result.data?.parentId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Staff does not belong to this kitchen",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Staff fetched successfully",
      data: result.data,
    });
  } catch (error: any) {
    debugHelper.debugError("❌ Controller Error:", error);
    return res.status(500).json({ status: false, message: error.message });
  } finally {
    debugHelper.debug("=== GET STAFF BY ID END ===");
  }
};

// =====================================================
// ✏️ UPDATE STAFF
// =====================================================
export const updateStaff = async (req: Request, res: Response) => {
  debugHelper.debug("=== UPDATE STAFF START ===");

  try {
    const request = req as Request & {
      kitchen: { id: number };
      files?: Express.Multer.File[];
    };
    const kitchenId = request.kitchen.id;
    const { id } = req.params;

    // 🖼️ Nayi profile picture search karo (agar upload hui ho)
    const profilePictureFile = request.files?.find(
      (f) => f.fieldname === "profilePicture",
    );

    let savedPath: string | undefined;
    if (profilePictureFile) {
      savedPath = await saveFile(profilePictureFile, {
        destination: "uploads/profilePicture",
        name: "staff-profilePicture",
        unique: true,
      });
    }

    const result = await StaffService.updateStaff(Number(id), kitchenId, {
      ...req.body,
      ...(savedPath ? { profilePicture: savedPath } : {}),
    });

    if (!result.status) {
      return res.status(400).json({ status: false, message: result.message });
    }

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    debugHelper.debugError("❌ UPDATE STAFF Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  } finally {
    debugHelper.debug("=== UPDATE STAFF END ===");
  }
};


// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const kitchenSubscriptionRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.KitchenSubscriptionFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const kitchenSubscription = await prisma.kitchenSubscription.findUnique(options);

      if (!kitchenSubscription) {
        return {
          status: false,
          message: "KitchenSubscription not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscription, "number"),
        message: kitchenSubscription ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.KitchenSubscriptionFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const kitchenSubscription = await prisma.kitchenSubscription.findFirst(options);

      if (!kitchenSubscription) {
        return {
          status: false,
          message: "KitchenSubscription not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscription, "number"),
        message: kitchenSubscription ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.KitchenSubscriptionFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenSubscriptions = await prisma.kitchenSubscription.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscriptions, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.KitchenSubscriptionWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.kitchenSubscription.count({
        where: options.where,
      });

      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to count kitchenSubscription records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.KitchenSubscriptionCreateInput,
    options: Partial<Prisma.KitchenSubscriptionCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscription, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenSubscription",
      };
    }
  },

  // ---------- Create Many KitchenSubscriptions ----------
  async createMany(
    options: Prisma.KitchenSubscriptionCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.kitchenSubscription.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenSubscription record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenSubscription records",
      };
    }
  },

  // ---------- Delete Many KitchenSubscriptions ----------
  async deleteMany(
    options: { where: Prisma.KitchenSubscriptionWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.kitchenSubscription.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenSubscription record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenSubscription records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.KitchenSubscriptionUpdateInput,
    options: Partial<Prisma.KitchenSubscriptionUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscription, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update kitchenSubscription",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.KitchenSubscriptionWhereUniqueInput,
    options: Partial<Prisma.KitchenSubscriptionDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenSubscription, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenSubscription",
      };
    }
  },
};

export default kitchenSubscriptionRepo;

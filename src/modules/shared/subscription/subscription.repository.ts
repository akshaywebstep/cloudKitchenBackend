// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const subscriptionRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.SubscriptionFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const subscription = await prisma.subscription.findUnique(options);

      if (!subscription) {
        return {
          status: false,
          message: "Subscription not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(subscription, "number"),
        message: subscription ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.SubscriptionFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const subscription = await prisma.subscription.findFirst(options);

      if (!subscription) {
        return {
          status: false,
          message: "Subscription not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(subscription, "number"),
        message: subscription ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.SubscriptionFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const subscriptions = await prisma.subscription.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(subscriptions, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.SubscriptionWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.subscription.count({
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
        message: err.message || "Unable to count subscription records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.SubscriptionCreateInput,
    options: Partial<Prisma.SubscriptionCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const subscription = await prisma.subscription.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(subscription, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create subscription",
      };
    }
  },

  // ---------- Create Many Subscriptions ----------
  async createMany(
    options: Prisma.SubscriptionCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.subscription.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Subscription record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create subscription records",
      };
    }
  },

  // ---------- Delete Many Subscriptions ----------
  async deleteMany(
    options: { where: Prisma.SubscriptionWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.subscription.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Subscription record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete subscription records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.SubscriptionUpdateInput,
    options: Partial<Prisma.SubscriptionUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const subscription = await prisma.subscription.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(subscription, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update subscription",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.SubscriptionWhereUniqueInput,
    options: Partial<Prisma.SubscriptionDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const subscription = await prisma.subscription.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(subscription, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete subscription",
      };
    }
  },
};

export default subscriptionRepo;

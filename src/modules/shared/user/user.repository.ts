// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const userRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.UserFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const user = await prisma.user.findUnique(options);

      if (!user) {
        return {
          status: false,
          message: "User not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(user, "number"),
        message: user ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.UserFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const user = await prisma.user.findFirst(options);

      if (!user) {
        return {
          status: false,
          message: "User not found",
        };
      }
      
      return {
        status: true,
        data: stringHelper.convertBigInt(user, "number"),
        message: user ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.UserFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const users = await prisma.user.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(users, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.UserWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.user.count({
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
        message: err.message || "Unable to count user records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.UserCreateInput,
    options: Partial<Prisma.UserCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const user = await prisma.user.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(user, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create user",
      };
    }
  },

      // ---------- Create Many Users ----------
  async createMany(
    options: Prisma.UserCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.user.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} User record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create user records",
      };
    }
  },

  // ---------- Delete Many Users ----------
  async deleteMany(
    options: { where: Prisma.UserWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.user.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} User record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete user records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.UserUpdateInput,
    options: Partial<Prisma.UserUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(user, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update user",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.UserWhereUniqueInput,
    options: Partial<Prisma.UserDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const user = await prisma.user.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(user, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete user",
      };
    }
  },
};

export default userRepo;

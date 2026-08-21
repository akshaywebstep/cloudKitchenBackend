// src/modules/shared/location/state.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const stateRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.StateFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const state = await prisma.state.findUnique(options);

      if (!state) {
        return {
          status: false,
          message: "State not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(state, "number"),
        message: state ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.StateFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const state = await prisma.state.findFirst(options);

      if (!state) {
        return {
          status: false,
          message: "State not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(state, "number"),
        message: state ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.StateFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const states = await prisma.state.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(states, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.StateWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.state.count({
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
        message: err.message || "Unable to count state records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.StateCreateInput,
    options: Partial<Prisma.StateCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const state = await prisma.state.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(state, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create state",
      };
    }
  },

  // ---------- Create Many States ----------
  async createMany(
    options: Prisma.StateCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.state.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} State record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create state records",
      };
    }
  },

  // ---------- Delete Many States ----------
  async deleteMany(
    options: { where: Prisma.StateWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.state.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} State record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete state records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.StateUpdateInput,
    options: Partial<Prisma.StateUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const state = await prisma.state.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(state, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update state",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.StateWhereUniqueInput,
    options: Partial<Prisma.StateDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const state = await prisma.state.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(state, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete state",
      };
    }
  },
};

export default stateRepo;

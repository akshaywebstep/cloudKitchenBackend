// src/modules/shared/location/city.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const cityRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.CityFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const city = await prisma.city.findUnique(options);

      if (!city) {
        return {
          status: false,
          message: "City not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(city, "number"),
        message: city ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.CityFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const city = await prisma.city.findFirst(options);

      if (!city) {
        return {
          status: false,
          message: "City not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(city, "number"),
        message: city ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.CityFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const citys = await prisma.city.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(citys, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.CityWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.city.count({
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
        message: err.message || "Unable to count city records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.CityCreateInput,
    options: Partial<Prisma.CityCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const city = await prisma.city.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(city, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create city",
      };
    }
  },

  // ---------- Create Many Citys ----------
  async createMany(
    options: Prisma.CityCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.city.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} City record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create city records",
      };
    }
  },

  // ---------- Delete Many Citys ----------
  async deleteMany(
    options: { where: Prisma.CityWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.city.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} City record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete city records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.CityUpdateInput,
    options: Partial<Prisma.CityUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const city = await prisma.city.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(city, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update city",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.CityWhereUniqueInput,
    options: Partial<Prisma.CityDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const city = await prisma.city.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(city, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete city",
      };
    }
  },
};

export default cityRepo;

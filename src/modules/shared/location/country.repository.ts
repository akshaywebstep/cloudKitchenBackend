// src/modules/shared/location/country.repository.ts

import { prisma, Prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

const countryRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.CountryFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const country = await prisma.country.findUnique(options);

      if (!country) {
        return {
          status: false,
          message: "Country not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(country, "number"),
        message: country ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.CountryFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const country = await prisma.country.findFirst(options);

      if (!country) {
        return {
          status: false,
          message: "Country not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(country, "number"),
        message: country ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.CountryFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const countrys = await prisma.country.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(countrys, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.CountryWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.country.count({
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
        message: err.message || "Unable to count country records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.CountryCreateInput,
    options: Partial<Prisma.CountryCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const country = await prisma.country.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(country, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create country",
      };
    }
  },

  // ---------- Create Many Countrys ----------
  async createMany(
    options: Prisma.CountryCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.country.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Country record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create country records",
      };
    }
  },

  // ---------- Delete Many Countrys ----------
  async deleteMany(
    options: { where: Prisma.CountryWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.country.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Country record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete country records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.CountryUpdateInput,
    options: Partial<Prisma.CountryUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const country = await prisma.country.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(country, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update country",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.CountryWhereUniqueInput,
    options: Partial<Prisma.CountryDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const country = await prisma.country.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(country, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete country",
      };
    }
  },
};

export default countryRepo;

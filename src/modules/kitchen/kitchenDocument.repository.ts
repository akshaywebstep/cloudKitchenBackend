// src/modules/admin/admin/admin.repository.ts

import { prisma, Prisma } from "../../../lib/prisma";
import stringHelper from "../../core/helpers/string.helper";

const kitchenDocumentRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options: Prisma.KitchenDocumentFindUniqueArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }

      const kitchenDocument = await prisma.kitchenDocument.findUnique(options);

      if (!kitchenDocument) {
        return {
          status: false,
          message: "KitchenDocument not found",
        };
      }

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocument, "number"),
        message: kitchenDocument ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument record",
      };
    }
  },

  // ---------- Find Admin(First Match) ----------
  async findFirst(options: Prisma.KitchenDocumentFindFirstArgs): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }

      const kitchenDocument = await prisma.kitchenDocument.findFirst(options);

      if (!kitchenDocument) {
        return {
          status: false,
          message: "KitchenDocument not found",
        };
      }
      
      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocument, "number"),
        message: kitchenDocument ? "Admin record retrieved successfully" : "Admin not found",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument record",
      };
    }
  },

  // ---------- Find Multiple Admins ----------
  async findMany(options: Prisma.KitchenDocumentFindManyArgs = {}): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenDocuments = await prisma.kitchenDocument.findMany(options);

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocuments, "number"),
        message: "Admin records retrieved successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument records",
      };
    }
  },

  // ---------- Count Admins ----------
  async count(options: { where?: Prisma.KitchenDocumentWhereInput } = {}): Promise<{ status: boolean; data?: number; message: string }> {
    try {
      const count = await prisma.kitchenDocument.count({
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
        message: err.message || "Unable to count kitchenDocument records",
      };
    }
  },

  // ---------- Create Admin ----------
  async create(
    data: Prisma.KitchenDocumentCreateInput,
    options: Partial<Prisma.KitchenDocumentCreateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenDocument = await prisma.kitchenDocument.create({
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocument, "number"),
        message: "Admin created successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenDocument",
      };
    }
  },

      // ---------- Create Many KitchenDocuments ----------
  async createMany(
    options: Prisma.KitchenDocumentCreateManyArgs
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.data || (Array.isArray(options.data) && (options.data as any[]).length === 0)) {
        return {
          status: false,
          message: "No data provided for createMany",
        };
      }

      const result = await prisma.kitchenDocument.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true, // safe default — skips already-assigned permissions
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenDocument record(s) created successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenDocument records",
      };
    }
  },

  // ---------- Delete Many KitchenDocuments ----------
  async deleteMany(
    options: { where: Prisma.KitchenDocumentWhereInput }
  ): Promise<{ status: boolean; data?: { count: number }; message: string }> {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }

      const result = await prisma.kitchenDocument.deleteMany({
        where: options.where,
      });

      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenDocument record(s) deleted successfully`,
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenDocument records",
      };
    }
  },

  // ---------- Update Admin ----------
  async update(
    id: number,
    data: Prisma.KitchenDocumentUpdateInput,
    options: Partial<Prisma.KitchenDocumentUpdateArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenDocument = await prisma.kitchenDocument.update({
        where: { id },
        data,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocument, "number"),
        message: "Admin updated successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to update kitchenDocument",
      };
    }
  },

  // ---------- Delete Admin ----------
  async delete(
    where: Prisma.KitchenDocumentWhereUniqueInput,
    options: Partial<Prisma.KitchenDocumentDeleteArgs> = {}
  ): Promise<{ status: boolean; data?: any; message: string }> {
    try {
      const kitchenDocument = await prisma.kitchenDocument.delete({
        where,
        ...options,
      });

      return {
        status: true,
        data: stringHelper.convertBigInt(kitchenDocument, "number"),
        message: "Admin deleted successfully",
      };
    } catch (err: any) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenDocument",
      };
    }
  },
};

export default kitchenDocumentRepo;

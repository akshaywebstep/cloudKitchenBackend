import DebugHelper from "../../../core/helpers/debug";
import debugHelper from "../../../core/helpers/debug";
import { Status, UserType } from "../../../../prisma/generated/prisma/client";
import branchRepo from "./branch.repository";
import { prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

// =====================================================
// ✅ CREATE BRANCH
// =====================================================
export const createBranch = async (data: {
  userId: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  pincode?: string;
  countryId: number;
  stateId: number;
  cityId: number;
  contactTitle: string;
  contactFirstName: string;
  contactLastName?: string;
  contactEmail: string;
  contactPhone: string;
  status?: Status;
  cuisines?: { id?: number; name?: string }[];
}) => {
  try {
    debugHelper.debug('[Branch Service] createBranch called with data:', JSON.stringify(data));

    // ✅ Verify userId belongs to a KITCHEN user
    const kitchenUser = await prisma.user.findFirst({
      where: { id: data.userId, userType: UserType.KITCHEN },
    });

    if (!kitchenUser) {
      debugHelper.debug('[Branch Service] Invalid kitchen userId:', data.userId);
      return { status: false, message: "Invalid kitchen (userId) provided" };
    }

    const branch = await prisma.$transaction(async (tx) => {
      const createdBranch = await tx.branch.create({
        data: {
          user: { connect: { id: data.userId } },
          name: data.name,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark,
          area: data.area,
          pincode: data.pincode,
          country: { connect: { id: data.countryId } },
          state: { connect: { id: data.stateId } },
          city: { connect: { id: data.cityId } },
          contactTitle: data.contactTitle,
          contactFirstName: data.contactFirstName,
          contactLastName: data.contactLastName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          status: data.status || Status.ACTIVE,
        },
      });

      debugHelper.debug('[Branch Service] Branch created with id:', createdBranch.id.toString());
      debugHelper.debug('[Branch Service] RAW cuisines received:', JSON.stringify(data.cuisines));

      if (data.cuisines && data.cuisines.length > 0) {
        const cuisineIds = data.cuisines
          .filter((c) => c.id)
          .map((c) => BigInt(c.id as number));

        debugHelper.debug('[Branch Service] Filtered cuisineIds:', cuisineIds.map(String));

        const uniqueCuisineIds = [...new Set(cuisineIds)];

        debugHelper.debug('[Branch Service] Unique cuisineIds:', uniqueCuisineIds.map(String));

        if (uniqueCuisineIds.length > 0) {
          const result = await tx.branchCuisine.createMany({
            data: uniqueCuisineIds.map((cuisineId) => ({
              branchId: createdBranch.id,
              cuisineId,
            })),
            skipDuplicates: true,
          });

          debugHelper.debug('[Branch Service] ✅ BranchCuisine createMany result:', JSON.stringify(result));
        } else {
          debugHelper.debug('[Branch Service] ⚠️ No valid cuisine IDs found — createMany SKIPPED');
        }
      } else {
        debugHelper.debug('[Branch Service] ⚠️ data.cuisines empty or undefined');
      }

      return tx.branch.findUnique({
        where: { id: createdBranch.id },
        include: {
          country: true,
          state: true,
          city: true,
          cuisines: { include: { cuisine: true } },
        },
      });
    });

    return {
      status: true,
      data: stringHelper.convertBigInt(branch, "number"),
      message: "Branch created successfully",
    };
  } catch (error: any) {
    debugHelper.debugError("[Branch Service] createBranch failed:", error);
    return {
      status: false,
      message: error.message || "Failed to create branch",
    };
  }
};

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getBranches = async (params: {
  page: number;
  limit: number;
  filters: {
    userId?: number;
    name?: string;
    status?: Status;
  };
}) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.name) {
      where.name = { contains: filters.name.trim() };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      branchRepo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          country: true,
          state: true,
          city: true,
          cuisines: { include: { cuisine: true } }, // ✅ NAYA
        },
      }),
      branchRepo.count({ where }),
      branchRepo.count({ where: {} }),
    ]);

    const data = dataRes.data || [];
    const filtered = filteredCountRes.data || 0;
    const total = totalCountRes.data || 0;
    const totalPages = Math.ceil(filtered / limit);

    return {
      status: true,
      data,
      meta: {
        page,
        limit,
        total,
        filtered,
        count: data.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error: any) {
    DebugHelper.debugError(
      `[Branch Service] getBranches failed: ${error.message}`,
    );
    return {
      status: false,
      message: error.message || "Failed to fetch branches",
      data: [],
      meta: null,
    };
  }
};

// =====================================================
// 📄 GET SINGLE BRANCH
// =====================================================
export const getBranchById = async (id: number) => {
  try {
    const result = await branchRepo.findUnique({
      where: { id },
      include: {
        country: true,
        state: true,
        city: true,
        cuisines: { include: { cuisine: true } }, // ✅ NAYA
      },
    });

    if (!result.status) return { status: false, message: result.message };

    return {
      status: true,
      data: result.data,
      message: "Branch fetched successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to fetch branch",
    };
  }
};

// =====================================================
// ✏️ UPDATE BRANCH
// =====================================================
export const updateBranch = async (
  id: number,
  data: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    area?: string;
    pincode?: string;
    countryId?: number;
    stateId?: number;
    cityId?: number;
    contactTitle?: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactEmail?: string;
    contactPhone?: string;
    status?: Status;
    cuisines?: { id?: number; name?: string }[]; // ✅ NAYA
  },
) => {
  try {
    debugHelper.debug('[Branch Service] updateBranch called for id:', id, JSON.stringify(data));

    const existing = await prisma.branch.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return { status: false, message: "Branch not found" };

    const branch = await prisma.$transaction(async (tx) => {
      const updatedBranch = await tx.branch.update({
        where: { id: BigInt(id) },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.addressLine1 ? { addressLine1: data.addressLine1 } : {}),
          ...(data.addressLine2 !== undefined
            ? { addressLine2: data.addressLine2 || null }
            : {}),
          ...(data.landmark !== undefined
            ? { landmark: data.landmark || null }
            : {}),
          ...(data.area !== undefined ? { area: data.area || null } : {}),
          ...(data.pincode !== undefined ? { pincode: data.pincode || null } : {}),
          ...(data.countryId
            ? { country: { connect: { id: data.countryId } } }
            : {}),
          ...(data.stateId ? { state: { connect: { id: data.stateId } } } : {}),
          ...(data.cityId ? { city: { connect: { id: data.cityId } } } : {}),
          ...(data.contactTitle ? { contactTitle: data.contactTitle } : {}),
          ...(data.contactFirstName
            ? { contactFirstName: data.contactFirstName }
            : {}),
          ...(data.contactLastName !== undefined
            ? { contactLastName: data.contactLastName || null }
            : {}),
          ...(data.contactEmail ? { contactEmail: data.contactEmail } : {}),
          ...(data.contactPhone ? { contactPhone: data.contactPhone } : {}),
          ...(data.status ? { status: data.status } : {}),
        },
      });

      // ✅ Sirf tab touch karo jab "cuisines" field bheja gaya ho (undefined = mat chhedo)
      if (data.cuisines !== undefined) {
        debugHelper.debug('[Branch Service] RAW cuisines for update:', JSON.stringify(data.cuisines));

        // Purani saari mapping hata do (replace-all approach)
        await tx.branchCuisine.deleteMany({ where: { branchId: BigInt(id) } });

        const cuisineIds = data.cuisines
          .filter((c) => c.id)
          .map((c) => BigInt(c.id as number));

        const uniqueCuisineIds = [...new Set(cuisineIds)];

        if (uniqueCuisineIds.length > 0) {
          const result = await tx.branchCuisine.createMany({
            data: uniqueCuisineIds.map((cuisineId) => ({
              branchId: BigInt(id),
              cuisineId,
            })),
            skipDuplicates: true,
          });
          debugHelper.debug('[Branch Service] ✅ Cuisines updated:', JSON.stringify(result));
        } else {
          debugHelper.debug('[Branch Service] ⚠️ Empty cuisines array — all mappings cleared');
        }
      }

      return tx.branch.findUnique({
        where: { id: updatedBranch.id },
        include: {
          country: true,
          state: true,
          city: true,
          cuisines: { include: { cuisine: true } },
        },
      });
    });

    return {
      status: true,
      data: stringHelper.convertBigInt(branch, "number"),
      message: "Branch updated successfully",
    };
  } catch (error: any) {
    debugHelper.debugError('[Branch Service] updateBranch failed:', error);
    return {
      status: false,
      message: error.message || "Failed to update branch",
    };
  }
};

// =====================================================
// 🗑️ DELETE BRANCH
// =====================================================
export const deleteBranch = async (id: number) => {
  try {
    const existing = await branchRepo.findUnique({ where: { id } });
    if (!existing.status) return { status: false, message: "Branch not found" };

    const result = await branchRepo.delete({ id });
    if (!result.status) return { status: false, message: result.message };

    return {
      status: true,
      data: result.data,
      message: "Branch deleted successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to delete branch",
    };
  }
};

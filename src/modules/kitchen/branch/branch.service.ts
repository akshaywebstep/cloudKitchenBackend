import DebugHelper from '../../../core/helpers/debug';
import branchRepo from './branch.repository';
import { Status } from '../../../../prisma/generated/prisma/client';
import { prisma } from '../../../../lib/prisma';
import stringHelper from '../../../core/helpers/string.helper';

type BranchCuisineInput = {
    id?: number;
    name?: string;
};

const resolveCuisineIds = async (tx: any, cuisines: BranchCuisineInput[]) => {
    if (!Array.isArray(cuisines)) {
        throw new Error("Cuisines must be an array");
    }

    const ids = [
        ...new Set(
            cuisines
                .filter(c => c.id)
                .map(c => Number(c.id))
                .filter(id => Number.isFinite(id))
        )
    ];

    const names = [
        ...new Set(
            cuisines
                .filter(c => !c.id && c.name)
                .map(c => c.name!.trim().toLowerCase())
                .filter(Boolean)
        )
    ];

    let existingIds: number[] = [];

    if (ids.length > 0) {
        const existing = await tx.cuisine.findMany({
            where: { id: { in: ids } },
            select: { id: true }
        });

        if (existing.length !== ids.length) {
            throw new Error("Some cuisine IDs are invalid");
        }

        existingIds = existing.map((c: { id: bigint | number }) => Number(c.id));
    }

    let createdIds: number[] = [];

    if (names.length > 0) {
        const created = await Promise.all(
            names.map(name =>
                tx.cuisine.upsert({
                    where: { name },
                    update: {},
                    create: {
                        name: stringHelper.toTitleCase(name),
                        status: Status.PENDING
                    }
                })
            )
        );

        createdIds = created.map((c: { id: bigint | number }) => Number(c.id));
    }

    return [...new Set([...existingIds, ...createdIds])];
};

const BRANCH_UPDATE_FIELDS = new Set([
    "name",
    "addressLine1",
    "addressLine2",
    "landmark",
    "area",
    "pincode",
    "countryId",
    "stateId",
    "cityId",
    "contactTitle",
    "contactFirstName",
    "contactLastName",
    "contactEmail",
    "contactPhone",
    "status"
]);

const pickBranchUpdateData = (data: Record<string, any>) => {
    const updateData: Record<string, any> = {};

    for (const field of BRANCH_UPDATE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            updateData[field] = data[field];
        }
    }

    return updateData;
};

// =====================================================
// ✅ CREATE BRANCH
// =====================================================
export const createBranch = async (data: {
    kitchenId: number;
    name: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    area: string;
    pincode: string;
    countryId: number;
    stateId: number;
    cityId: number;
    contactTitle: string;
    contactFirstName: string;
    contactLastName: string;
    contactEmail: string;
    contactPhone: string;
    cuisines: BranchCuisineInput[];
}) => {
    const { kitchenId, name, addressLine1, addressLine2, landmark, area, pincode, countryId, stateId, cityId, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone, cuisines } = data;

    DebugHelper.debug('[Branch Service] Saving new branch to database...');

    DebugHelper.debug('[Branch Service] Data: ', JSON.stringify(data, null, 2));

    try {
        // ===============================================
        // 🧠 TRANSACTION START
        // ===============================================
        const result = await prisma.$transaction(async (tx) => {

            // ===============================================
            // 1️⃣ CREATE BRANCH
            // ===============================================
            const branch = await tx.branch.create({
                data: {
                    user: {
                        connect: {
                            id: kitchenId
                        }
                    },
                    name,
                    addressLine1,
                    addressLine2,
                    landmark,
                    area,
                    pincode,
                    country: {
                        connect: {
                            id: countryId
                        }
                    },
                    state: {
                        connect: {
                            id: stateId
                        }
                    },
                    city: {
                        connect: {
                            id: cityId
                        }
                    },
                    contactTitle,
                    contactFirstName,
                    contactLastName,
                    contactEmail,
                    contactPhone
                }
            });

            const cuisineIds = await resolveCuisineIds(tx, cuisines);

            // ===============================================
            // 4️⃣ CREATE MAPPING
            // ===============================================
            if (cuisineIds.length > 0) {
                await tx.branchCuisine.createMany({
                    data: cuisineIds.map(cid => ({
                        branchId: branch.id,
                        cuisineId: cid
                    })),
                    skipDuplicates: true
                });
            }

            return await tx.branch.findUnique({
                where: { id: branch.id },
                include: {
                    cuisines: {
                        include: { cuisine: true }
                    }
                }
            });
        });

        return {
            status: true,
            data: stringHelper.convertBigInt(result, "number"),
            message: 'Branch created successfully'
        };

    } catch (error: any) {
        DebugHelper.debugError('[Branch Service] Error:', error);

        return {
            status: false,
            message: error.message || 'Failed to create branch'
        };
    }
};

// =====================================================
// 📄 GET ALL BRANCHES (With Cuisines & Inventory Stocks)
// =====================================================
export const getBranches = async (params: {
    page: number;
    limit: number;
    filters: {
        kitchenId: number;
        countryId?: number;
        stateId?: number;
        cityId?: number;
        name?: string;
        pincode?: string;
    };
}) => {
    try {
        const { page, limit, filters } = params;

        const skip = (page - 1) * limit;

        DebugHelper.debug(`[Branch Service] Fetching branches | Page: ${page}`);

        // ===============================================
        // 🔍 BUILD WHERE FILTER
        // ===============================================
        const where: any = {
            status: Status.ACTIVE
        };

        // 🔥 mandatory (multi-tenant safety)
        where.userId = BigInt(filters.kitchenId);

        if (filters.countryId) {
            where.countryId = BigInt(filters.countryId);
        }

        if (filters.stateId) {
            where.stateId = BigInt(filters.stateId);
        }

        if (filters.cityId) {
            where.cityId = BigInt(filters.cityId);
        }

        if (filters.pincode) {
            where.pincode = filters.pincode;
        }

        if (filters.name) {
            where.name = {
                contains: filters.name
            };
        }

        // ===============================================
        // 📦 FETCH DATA
        // ===============================================
        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
          branchRepo.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              cuisines: {
                include: { cuisine: true },
              },
              // 🔥 YAHAN ADD KIYA HAI: Cuisines ke saath Inventory aur Stocks include honge
              inventory: {
                include: {
                  ingredient: true, // Ingredient Master Info
                  stocks: true, // Actual InventoryStock Table Data
                },
              },
            },
          }),

          // filtered count
          branchRepo.count({ where }),

          // total count for this kitchen active branches
          branchRepo.count({
            where: {
              userId: BigInt(filters.kitchenId),
              status: Status.ACTIVE,
            },
          }),
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

                total,        // 🔥 total records (all)
                filtered,     // 🔥 after filter
                count: data.length, // 🔥 current page items

                totalPages,   // 🔥 total pages possible

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
            message: "Failed to fetch branches",
            data: [],
            meta: null,
        };
    }
};

// =====================================================
// 🔍 GET BRANCH BY ID
// =====================================================
export const getBranchById = async (id: bigint) => {
    try {
        DebugHelper.debug(`[Branch Service] Fetching branch: ${id}`);

        const response = await branchRepo.findUnique({
          where: { id },
          include: {
            cuisines: {
              include: { cuisine: true },
            },
            // 📦 INVENTORY & STOCKS DATA ADDED HERE
            inventory: {
              include: {
                ingredient: true,
                stocks: true,
              },
            },
          },
        });

        if (!response?.data) {
            return {
                status: false,
                message: 'Branch not found'
            };
        }

        return {
            status: true,
            data: response.data
        };

    } catch (error: any) {
        DebugHelper.debugError(`[Branch Service] getBranchById failed: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong'
        };
    }
};

// =====================================================
// ✏️ UPDATE BRANCH
// =====================================================
export const updateBranch = async (
    id: bigint,
    data: any
) => {
    try {
        DebugHelper.debug(`[Branch Service] Updating branch: ${id}`);

        const existing = await branchRepo.findUnique({
            where: { id }
        });

        if (!existing?.data) {
            return {
                status: false,
                message: 'Branch not found'
            };
        }

        const { cuisines } = data;
        const branchData = pickBranchUpdateData(data);

        const updatedBranch = await prisma.$transaction(async (tx) => {
            const branch = Object.keys(branchData).length > 0
                ? await tx.branch.update({
                    where: { id },
                    data: branchData
                })
                : await tx.branch.findUnique({
                    where: { id }
                });

            if (cuisines !== undefined) {
                const cuisineIds = await resolveCuisineIds(tx, cuisines);

                await tx.branchCuisine.deleteMany({
                    where: { branchId: id }
                });

                if (cuisineIds.length > 0) {
                    await tx.branchCuisine.createMany({
                        data: cuisineIds.map(cid => ({
                            branchId: id,
                            cuisineId: cid
                        })),
                        skipDuplicates: true
                    });
                }
            }

            return branch;
        });

        return {
            status: true,
            message: 'Branch updated successfully',
            data: stringHelper.convertBigInt(updatedBranch, "number")
        };

    } catch (error: any) {
        DebugHelper.debugError(`[Branch Service] updateBranch failed: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong while updating branch'
        };
    }
};

// =====================================================
// ❌ DELETE BRANCH (SOFT DELETE)
// =====================================================
export const deleteBranch = async (id: bigint) => {
    try {
        DebugHelper.debug(`[Branch Service] Deleting branch: ${id}`);

        const existing = await branchRepo.findUnique({
            where: { id }
        });

        if (!existing?.data) {
            return {
                status: false,
                message: 'Branch not found'
            };
        }

        // 🔹 Soft delete
        const response = await branchRepo.update(Number(id), {
            status: Status.INACTIVE
        });

        if (!response.status) {
            return {
                status: false,
                message: 'Failed to delete branch'
            };
        }

        return {
            status: true,
            message: 'Branch deleted successfully'
        };

    } catch (error: any) {
        DebugHelper.debugError(`[Branch Service] deleteBranch failed: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong while deleting branch'
        };
    }
};

// =====================================================
// 🔄 TOGGLE STATUS
// =====================================================
export const updateBranchStatus = async (id: bigint, status: Status) => {
    try {
        DebugHelper.debug(`[Branch Service] Updating status: ${id} -> ${status}`);

        const existing = await branchRepo.findUnique({
            where: { id: Number(id) }
        });

        if (!existing?.data) {
            return {
                status: false,
                message: 'Branch not found'
            };
        }

        // ❌ optional: prevent same update
        if (existing.data.status === status) {
            return {
                status: false,
                message: `Branch already ${status}`
            };
        }

        const response = await branchRepo.update(Number(id), {
            status
        });

        return {
            status: true,
            message: 'Branch status updated successfully',
            data: response.data
        };

    } catch (error: any) {
        DebugHelper.debugError(`[Branch Service] updateBranchStatus failed: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong'
        };
    }
};
import DebugHelper from "../../../core/helpers/debug";
import { Status } from "../../../../prisma/generated/prisma/client";
import stringHelper from "../../../core/helpers/string.helper";
import menuCategoryRepo from "./menuCategory.repository";

// =====================================================
// ✅ CREATE MENU CATEGORY
// =====================================================
export const createMenuCategory = async (data: {
  name: string;
  image?: string;
  parentId?: number;
  status?: Status;
}) => {
  try {
    // ✅ Agar parentId diya hai to verify karo wo valid category hai
    if (data.parentId) {
      const parentExists = await menuCategoryRepo.findUnique({
        where: { id: data.parentId },
      });
      if (!parentExists.status) {
        return {
          status: false,
          message: "Invalid parentId — parent category not found",
        };
      }
    }

    // ✅ Duplicate check — same name under same parent (parentId + name unique)
    const existing = await menuCategoryRepo.findFirst({
      where: {
        name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
        parentId: data.parentId ?? null,
      },
    });

    if (existing.status) {
      return {
        status: false,
        message:
          "Category with this name already exists under the given parent",
      };
    }

    const result = await menuCategoryRepo.create({
      name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
      image: data.image,
      status: data.status || Status.PENDING,
      ...(data.parentId ? { parent: { connect: { id: data.parentId } } } : {}),
    });

    if (!result.status) {
      return { status: false, message: result.message };
    }

    return {
      status: true,
      data: result.data,
      message: "Menu category created successfully",
    };
  } catch (error: any) {
    DebugHelper.debugError(
      "[MenuCategory Service] createMenuCategory failed:",
      error,
    );
    return {
      status: false,
      message: error.message || "Failed to create menu category",
    };
  }
};

// =====================================================
// 📄 GET ALL MENU CATEGORIES (flat, with filters)
// =====================================================
export const getMenuCategories = async (params: {
    page: number;
    limit: number;
    filters: {
        name?: string;
        parentId?: number | null;
        status?: Status;
    };
}) => {
    try {
        const { page, limit, filters } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters.name) {
            where.name = { contains: filters.name.trim() };
        }
        if (filters.parentId !== undefined) {
            where.parentId = filters.parentId;
        } else {
            where.parentId = null;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
            menuCategoryRepo.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    parent: true,
                    subCategories: true
                }
            }),
            menuCategoryRepo.count({ where }),
            menuCategoryRepo.count({ where: { parentId: null } })
        ]);

        const data = dataRes.data || [];
        const filtered = filteredCountRes.data || 0;
        const total = totalCountRes.data || 0;
        const totalPages = Math.ceil(filtered / limit);

        return {
            status: true,
            data,
            meta: {
                page, limit, total, filtered,
                count: data.length,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error: any) {
        DebugHelper.debugError(`[MenuCategory Service] getMenuCategories failed: ${error.message}`);
        return { status: false, message: error.message || 'Failed to fetch menu categories', data: [], meta: null };
    }
};

// =====================================================
// 🌳 GET NESTED TREE (parent → children)
// =====================================================
export const getMenuCategoryTree = async () => {
  try {
    const categories = await menuCategoryRepo.findMany({
      where: {},
      orderBy: { createdAt: "asc" },
    });

    if (!categories.status) {
      return { status: false, message: categories.message };
    }

    const all = categories.data as any[];

    const buildTree = (parentId: number | null): any[] => {
    return all
        .filter(cat => (cat.parentId ?? null) === parentId)
        .map(cat => ({
            ...cat,
            subCategories: buildTree(cat.id)   
        }));
};

    const tree = buildTree(null);

    return {
      status: true,
      data: tree,
      message: "Menu category tree fetched successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to build menu category tree",
      data: [],
    };
  }
};

// =====================================================
// 📄 GET SINGLE MENU CATEGORY
// =====================================================
export const getMenuCategoryById = async (id: number) => {
  try {
    const result = await menuCategoryRepo.findUnique({
      where: { id },
      include: { parent: true, subCategories: true }
    });

    if (!result.status) return { status: false, message: result.message };

    return {
      status: true,
      data: result.data,
      message: "Menu category fetched successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to fetch menu category",
    };
  }
};

// =====================================================
// ✏️ UPDATE MENU CATEGORY
// =====================================================
export const updateMenuCategory = async (
  id: number,
  data: {
    name?: string;
    image?: string;
    parentId?: number | null;
    status?: Status;
  },
) => {
  try {
    const existing = await menuCategoryRepo.findUnique({ where: { id } });
    if (!existing.status)
      return { status: false, message: "Menu category not found" };

    // ✅ Prevent self-parenting
    if (data.parentId === id) {
      return { status: false, message: "A category cannot be its own parent" };
    }

    if (data.parentId) {
      const parentExists = await menuCategoryRepo.findUnique({
        where: { id: data.parentId },
      });
      if (!parentExists.status) {
        return {
          status: false,
          message: "Invalid parentId — parent category not found",
        };
      }
    }

    if (data.name) {
      const nameClash = await menuCategoryRepo.findFirst({
        where: {
          name: stringHelper.toTitleCase(data.name.trim().toLowerCase()),
          parentId:
            data.parentId !== undefined
              ? data.parentId
              : (existing.data as any).parentId,
          NOT: { id },
        },
      });

      if (nameClash.status) {
        return {
          status: false,
          message:
            "Another category with this name already exists under this parent",
        };
      }
    }

    const result = await menuCategoryRepo.update(id, {
      ...(data.name
        ? { name: stringHelper.toTitleCase(data.name.trim().toLowerCase()) }
        : {}),
      ...(data.image !== undefined ? { image: data.image || null } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.parentId !== undefined
        ? data.parentId === null
          ? { parent: { disconnect: true } }
          : { parent: { connect: { id: data.parentId } } }
        : {}),
    });

    if (!result.status) return { status: false, message: result.message };

    return {
      status: true,
      data: result.data,
      message: "Menu category updated successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to update menu category",
    };
  }
};

// =====================================================
// 🗑️ DELETE MENU CATEGORY
// =====================================================
export const deleteMenuCategory = async (id: number) => {
  try {
    const existing = await menuCategoryRepo.findUnique({ where: { id } });
    if (!existing.status)
      return { status: false, message: "Menu category not found" };

    // ✅ Block delete if it has children
    const childrenCount = await menuCategoryRepo.count({
      where: { parentId: id },
    });
    if ((childrenCount.data || 0) > 0) {
      return {
        status: false,
        message:
          "Cannot delete — this category has subcategories. Delete or reassign them first.",
      };
    }

    const result = await menuCategoryRepo.delete({ id });
    if (!result.status) return { status: false, message: result.message };

    return {
      status: true,
      data: result.data,
      message: "Menu category deleted successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to delete menu category",
    };
  }
};

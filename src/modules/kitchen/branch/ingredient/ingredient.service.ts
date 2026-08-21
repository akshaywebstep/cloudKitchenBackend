import DebugHelper from "../../../../core/helpers/debug";
import { Status, Unit } from "../../../../../prisma/generated/prisma/client";
import { prisma } from "../../../../../lib/prisma";
import stringHelper from "../../../../core/helpers/string.helper";
import ingredientRepo from "./ingredient.repository";
import debugHelper from "../../../../core/helpers/debug";
import inventoryStockRepo from "./stock/stock.repository";

// =====================================================
// ✅ CREATE INGREDIENT
// =====================================================
export const createIngredient = async (data: {
  kitchenId: number;
  branchId: number;
  ingredients: Array<{
    id?: number;
    name?: string;
    category?: string;
    image?: string;
    unit?: Unit;
  }>;
}) => {
  const { kitchenId, branchId, ingredients } = data;

  DebugHelper.debug("[Ingredient Service] Saving ingredients to inventory...");

  DebugHelper.debug(
    "[Ingredient Service] Data:",
    JSON.stringify(data, null, 2),
  );

  try {
    // ===============================================
    // 🧠 TRANSACTION START
    // ===============================================
    const result = await prisma.$transaction(async (tx) => {
      // ===============================================
      // ✅ SAFETY CHECK
      // ===============================================
      if (!Array.isArray(ingredients)) {
        throw new Error("Ingredients must be an array");
      }

      // ===============================================
      // 🧹 NORMALIZE DATA
      // ===============================================
      const ingredientIds = ingredients
        .filter((i) => i.id)
        .map((i) => Number(i.id));

      const newIngredients = ingredients
        .filter((i) => !i.id && i.name && i.category)
        .map((i) => ({
          name: i.name!.trim().toLowerCase(),
          category: i.category!.trim(),
          image: i.image,
          unit: i.unit || Unit.ITEM,
        }));

      // ===============================================
      // 🛡️ REMOVE DUPLICATES
      // ===============================================
      const uniqueIngredients = Array.from(
        new Map(newIngredients.map((i) => [i.name, i])).values(),
      );
      const requestedUnitsById = new Map(
        ingredients
          .filter((i) => i.id)
          .map((i) => [Number(i.id), i.unit || Unit.ITEM]),
      );
      const requestedUnitsByName = new Map(
        uniqueIngredients.map((i) => [i.name, i.unit || Unit.ITEM]),
      );
      const inventoryItems: { id: number; unit: Unit }[] = [];

      // ===============================================
      // 1️⃣ VALIDATE EXISTING IDS
      // ===============================================
      let existingIngredientIds: number[] = [];

      if (ingredientIds.length > 0) {
        const existingIngredients = await tx.ingredient.findMany({
          where: {
            id: {
              in: ingredientIds,
            },
          },
          select: {
            id: true,
          },
        });

        if (existingIngredients.length !== ingredientIds.length) {
          throw new Error("Some ingredient IDs are invalid");
        }

        existingIngredientIds = existingIngredients.map((i) => Number(i.id));
        inventoryItems.push(
          ...existingIngredientIds.map((id) => ({
            id,
            unit: requestedUnitsById.get(id) || Unit.ITEM,
          })),
        );
      }

      // ===============================================
      // 2️⃣ CREATE / GET INGREDIENTS
      // ===============================================
      if (uniqueIngredients.length > 0) {
        const createdIngredients = await Promise.all(
          uniqueIngredients.map((item) =>
            tx.ingredient.upsert({
              where: {
                name: item.name,
              },

              update: {},

              create: {
                name: stringHelper.toTitleCase(item.name),
                category: stringHelper.toTitleCase(item.category),
                image: item.image,
                status: Status.PENDING,
              },
            }),
          ),
        );

        inventoryItems.push(
          ...createdIngredients.map((i) => ({
            id: Number(i.id),
            unit:
              requestedUnitsByName.get(String(i.name).trim().toLowerCase()) ||
              Unit.ITEM,
          })),
        );
      }

      // ===============================================
      // 3️⃣ MERGE ALL IDS
      // ===============================================
      const finalIngredientIds = inventoryItems.map((item) => item.id);

      // ===============================================
      // 4️⃣ CREATE BRANCH INVENTORY MAPPING
      // ===============================================
      if (finalIngredientIds.length > 0) {
        const inventoryPayload = inventoryItems.map((item) => ({
          kitchenId,
          branchId,
          ingredientId: item.id,
          unit: item.unit,
        }));

        await tx.branchIngredientInventory.createMany({
          data: inventoryPayload,
          skipDuplicates: true,
        });
      }

      // ===============================================
      // 5️⃣ RETURN INVENTORY
      // ===============================================
      return await tx.branchIngredientInventory.findMany({
        where: {
          kitchenId,
          branchId,
        },
        include: {
          ingredient: true,
        },
        orderBy: {
          id: "desc",
        },
      });
    });

    DebugHelper.debug(
      "[Ingredient Service] Ingredients saved successfully",
      JSON.stringify(stringHelper.convertBigInt(result, "number"), null, 2),
    );

    return {
      status: true,
      data: stringHelper.convertBigInt(result, "number"),
      message: "Ingredients added successfully",
    };
  } catch (error: any) {
    DebugHelper.debugError("[Ingredient Service] Error:", error);

    return {
      status: false,
      message: error.message || "Failed to add ingredients",
    };
  }
};

// =====================================================
// 📄 GET ALL INGREDIENTS
// =====================================================
// =====================================================
// 📄 GET ALL INGREDIENTS (with Stock Data)
// =====================================================
export const getIngredients = async (params: {
  page: number;
  limit: number;
  filters: {
    kitchenId: number;
    branchId: number;
    name?: string;
    category?: string;
  };
}) => {
  try {
    const { page, limit, filters } = params;

    debugHelper.debug(
      `[Ingredient Service] Fetching ingredients | Page: ${page}`,
      filters,
    );

    const skip = (page - 1) * limit;

    DebugHelper.debug(
      `[Ingredient Service] Fetching Ingredients | Page: ${page}`,
    );

    // ===============================================
    // 🔍 BUILD WHERE FILTER
    // ===============================================
    const where: any = {
      kitchenId: BigInt(filters.kitchenId),
      branchId: BigInt(filters.branchId),
    };

    if (filters.name) {
      where.ingredient = {
        ...(where.ingredient || {}),
        name: {
          contains: filters.name.trim(),
        },
      };
    }

    if (filters.category) {
      where.ingredient = {
        ...(where.ingredient || {}),
        category: {
          contains: filters.category.trim(),
        },
      };
    }

    // ===============================================
    // 📦 FETCH DATA
    // ===============================================
    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      ingredientRepo.findMany({
        where,
        select: {
          id: true,
          kitchenId: true,
          branchId: true,
          ingredientId: true,
          unit: true,
          createdAt: true,
          ingredient: {
            select: {
              id: true,
              name: true,
              image: true,
              category: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      ingredientRepo.count({
        where,
      }),

      ingredientRepo.count({
        where: {
          kitchenId: BigInt(filters.kitchenId),
          branchId: BigInt(filters.branchId),
        },
      }),
    ]);

    const data = dataRes.data || [];
    const filtered = filteredCountRes.data || 0;
    const total = totalCountRes.data || 0;

    const totalPages = Math.ceil(filtered / limit);

    // ===============================================
    // 📊 FETCH STOCK FOR THESE INVENTORY ITEMS
    // ⚠️ inventoryItemId === BranchIngredientInventory.id (NOT ingredientId)
    // ===============================================
    const itemIds = data.map((item: any) => item.id);

    let stockData: any[] = [];

    if (itemIds.length > 0) {
      const stockRes = await inventoryStockRepo.findMany({
        where: {
          inventoryItemId: {
            in: itemIds,
          },
        },
        select: {
          id: true,
          inventoryItemId: true,
          quantity: true,
          expiryDate: true,
          batchNumber: true,
          createdAt: true,
        },
        orderBy: {
          expiryDate: "asc",
        },
      });

      stockData = stockRes.data || [];
    }

    // ===============================================
    // 🧩 MERGE STOCK INTO EACH INGREDIENT ROW (raw, no processing)
    // ===============================================
    const dataWithStock = data.map((item: any) => {
      const stock = stockData.filter(
        (s: any) => String(s.inventoryItemId) === String(item.id),
      );

      return {
        ...item,
        stock,
      };
    });
    return {
      status: true,
      data: dataWithStock,
      meta: {
        page,
        limit,
        total,
        filtered,
        count: dataWithStock.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error: any) {
    DebugHelper.debugError(
      `[Ingredient Service] getIngredients failed: ${error.message}`,
    );

    return {
      status: false,
      message: error.message || "Failed to fetch ingredients",
      data: [],
      meta: null,
    };
  }
};
export const updateInventoryIngredient = async (data: {
  kitchenId: number;
  branchId: number;
  inventoryId: number;
  name?: string;
  category?: string;
  image?: string;
  unit?: Unit;
}) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.branchIngredientInventory.findFirst({
        where: {
          id: BigInt(data.inventoryId),
          kitchenId: BigInt(data.kitchenId),
          branchId: BigInt(data.branchId),
        },
        include: { ingredient: true },
      });

      if (!inventory) {
        throw new Error("Branch inventory ingredient not found");
      }

      if (data.unit) {
        await tx.branchIngredientInventory.update({
          where: { id: inventory.id },
          data: { unit: data.unit },
        });
      }

      const wantsIngredientEdit = Boolean(
        data.name || data.category || data.image !== undefined,
      );
      if (wantsIngredientEdit) {
        if (inventory.ingredient.status !== Status.PENDING) {
          throw new Error(
            "Only custom ingredients can be edited. Master ingredients can only be removed from branch inventory.",
          );
        }

        const sharedInventoryCount = await tx.branchIngredientInventory.count({
          where: {
            ingredientId: inventory.ingredientId,
            NOT: {
              id: inventory.id,
            },
          },
        });

        if (sharedInventoryCount > 0) {
          throw new Error(
            "This custom ingredient is used by another inventory item and cannot be renamed here.",
          );
        }

        await tx.ingredient.update({
          where: { id: inventory.ingredientId },
          data: {
            ...(data.name
              ? {
                  name: stringHelper.toTitleCase(
                    data.name.trim().toLowerCase(),
                  ),
                }
              : {}),
            ...(data.category
              ? { category: stringHelper.toTitleCase(data.category.trim()) }
              : {}),
            ...(data.image !== undefined ? { image: data.image || null } : {}),
          },
        });
      }

      return tx.branchIngredientInventory.findFirst({
        where: { id: inventory.id },
        include: { ingredient: true },
      });
    });

    return {
      status: true,
      data: stringHelper.convertBigInt(result, "number"),
      message: "Branch inventory ingredient updated successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to update branch inventory ingredient",
    };
  }
};

export const deleteInventoryIngredient = async (data: {
  kitchenId: number;
  branchId: number;
  inventoryId: number;
}) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.branchIngredientInventory.findFirst({
        where: {
          id: BigInt(data.inventoryId),
          kitchenId: BigInt(data.kitchenId),
          branchId: BigInt(data.branchId),
        },
        include: { ingredient: true },
      });

      if (!inventory) {
        throw new Error("Branch inventory ingredient not found");
      }

      const menuUsageCount = await tx.menuItemIngredient.count({
        where: { inventoryItemId: inventory.id },
      });

      if (menuUsageCount > 0) {
        throw new Error(
          "This ingredient is used in menu items. Remove it from menu first.",
        );
      }

      await tx.branchIngredientInventory.delete({
        where: { id: inventory.id },
      });

      const remainingInventoryCount = await tx.branchIngredientInventory.count({
        where: { ingredientId: inventory.ingredientId },
      });

      if (
        inventory.ingredient.status === Status.PENDING &&
        remainingInventoryCount === 0
      ) {
        await tx.ingredient.delete({
          where: { id: inventory.ingredientId },
        });
      }

      return inventory;
    });

    return {
      status: true,
      data: stringHelper.convertBigInt(result, "number"),
      message: "Branch inventory ingredient removed successfully",
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || "Failed to remove branch inventory ingredient",
    };
  }
};

import debugHelper from "../../../core/helpers/debug";
import {
  OrderStatus,
  OrderSource,
  Status,
} from "../../../../prisma/generated/prisma/client";
import orderRepo from "./order.repository";
import { prisma } from "../../../../lib/prisma";
import stringHelper from "../../../core/helpers/string.helper";

// =====================================================
// ✅ CREATE ORDER (Manual, by Kitchen)
// =====================================================
export const createOrder = async (data: {
  kitchenId: number;
  branchId: number;
  items: { menuItemId: number; quantity: number }[];
  customer: {
    firstName: string;
    lastName?: string;
    gender?: string;
  };
  billingAddress: {
    address1: string;
    address2?: string;
    countryId: number;
    stateId: number;
    cityId: number;
    pincode?: string;
    phoneNumber: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    countryId: number;
    stateId: number;
    cityId: number;
    pincode?: string;
    phoneNumber: string;
  };
}) => {
  const { kitchenId, branchId, items, customer, billingAddress, shippingAddress } = data;

  debugHelper.debug(
    "[Order Service] createOrder called with:",
    JSON.stringify(data),
  );

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ===============================================
      // 🍽️ FETCH MENU ITEMS (must belong to kitchen+branch, ACTIVE)
      // ===============================================
      const menuItemIds = items.map((item) => BigInt(item.menuItemId));

      const menuItems = await tx.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          kitchenId: BigInt(kitchenId),
          branchId: BigInt(branchId),
          status: Status.ACTIVE,
        },
        select: { id: true, price: true, name: true },
      });

      const menuItemMap = new Map(
        menuItems.map((item) => [item.id.toString(), item]),
      );

      // ===============================================
      // ❌ VALIDATE ALL MENU ITEMS EXIST
      // ===============================================
      const invalidIds = items
        .filter((item) => !menuItemMap.has(String(item.menuItemId)))
        .map((item) => item.menuItemId);

      if (invalidIds.length > 0) {
        throw new Error(
          `Invalid or inactive menu item ids: ${invalidIds.join(", ")}`,
        );
      }

      // ===============================================
      // 💰 CALCULATE TOTAL (price snapshot from menuItem)
      // ===============================================
      let totalAmount = 0;

      const orderItemsData = items.map((item) => {
        const menuItem = menuItemMap.get(String(item.menuItemId))!;
        const price = menuItem.price;
        totalAmount += price * item.quantity;

        return {
          menuItemId: menuItem.id,
          quantity: item.quantity,
          price,
        };
      });

      // ===============================================
      // 👤 CREATE CUSTOMER
      // ===============================================
      const newCustomer = await tx.customer.create({
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          gender: customer.gender,
        },
      });

      // ===============================================
      // 📍 CREATE BILLING ADDRESS (type khud set — client se nahi lena)
      // ===============================================
      await tx.customerAddress.create({
        data: {
          customerId: newCustomer.id,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          countryId: BigInt(billingAddress.countryId),
          stateId: BigInt(billingAddress.stateId),
          cityId: BigInt(billingAddress.cityId),
          pincode: billingAddress.pincode,
          phoneNumber: billingAddress.phoneNumber,
          type: "BILLING",   // 👈 hardcoded
        },
      });

      // ===============================================
      // 📍 CREATE SHIPPING ADDRESS (type khud set — client se nahi lena)
      // ===============================================
      await tx.customerAddress.create({
        data: {
          customerId: newCustomer.id,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          countryId: BigInt(shippingAddress.countryId),
          stateId: BigInt(shippingAddress.stateId),
          cityId: BigInt(shippingAddress.cityId),
          pincode: shippingAddress.pincode,
          phoneNumber: shippingAddress.phoneNumber,
          type: "SHIPPING",   // 👈 hardcoded
        },
      });

      // ===============================================
      // 🧾 CREATE ORDER (customer link ke saath)
      // ===============================================
      const order = await tx.order.create({
        data: {
          user: { connect: { id: BigInt(kitchenId) } },
          branch: { connect: { id: BigInt(branchId) } },
          customer: { connect: { id: newCustomer.id } },
          source: OrderSource.MANUAL,
          totalAmount,
          status: OrderStatus.PLACED,
        },
      });

      // ===============================================
      // 🛒 CREATE ORDER ITEMS
      // ===============================================
      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { menuItem: true } },
          branch: true,
          customer: { include: { addresses: true } },
        },
      });
    });

    return {
      status: true,
      data: stringHelper.convertBigInt(result, "number"),
      message: "Order created successfully",
    };
  } catch (error: any) {
    debugHelper.debugError("[Order Service] createOrder failed:", error);
    return {
      status: false,
      message: error.message || "Failed to create order",
    };
  }
};

// =====================================================
// 📄 GET ALL ORDERS
// =====================================================
export const getOrders = async (params: {
  page: number;
  limit: number;
  filters: { kitchenId: number; branchId: number; status?: OrderStatus };
}) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: BigInt(filters.kitchenId),
      branchId: BigInt(filters.branchId),
    };

    if (filters.status) where.status = filters.status;

    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      orderRepo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { menuItem: true } },
          customer: { include: { addresses: true } }, // 👈 NEW
        },
      }),
      orderRepo.count({ where }),
      orderRepo.count({
        where: {
          userId: BigInt(filters.kitchenId),
          branchId: BigInt(filters.branchId),
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
        total,
        filtered,
        count: data.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error: any) {
    debugHelper.debugError(
      `[Order Service] getOrders failed: ${error.message}`,
    );
    return {
      status: false,
      message: error.message || "Failed to fetch orders",
      data: [],
      meta: null,
    };
  }
};

// =====================================================
// 📄 GET SINGLE ORDER
// =====================================================
export const getOrderById = async (id: number) => {
  try {
    const result = await orderRepo.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true } },
        branch: true,
        customer: { include: { addresses: true } }, // 👈 NEW
      },
    });
    if (!result.status) return { status: false, message: result.message };
    return {
      status: true,
      data: result.data,
      message: "Order fetched successfully",
    };
  } catch (error: any) {
    return { status: false, message: error.message || "Failed to fetch order" };
  }
};

// =====================================================
// 🔄 BULK UPDATE ORDER STATUS (With Auto Inventory Deduction)
// =====================================================
export const bulkUpdateOrderStatus = async (data: {
    kitchenId: number;
    branchId: number;
    orderIds: number[];
    status: OrderStatus;
}) => {
    const { kitchenId, branchId, orderIds, status } = data;

    debugHelper.debug('[Order Service] bulkUpdateOrderStatus called with:', JSON.stringify(data));

    try {
        const bigIntOrderIds = orderIds.map((id) => BigInt(id));

        // 🧠 Transaction Start: Ensures atomicity (Deduction + Status Update)
        const result = await prisma.$transaction(async (tx) => {
            
            // 1️⃣ Fetch Orders with Nested Relations (Order -> Items -> MenuItem -> Ingredients)
            const existingOrders = await tx.order.findMany({
                where: {
                    id: { in: bigIntOrderIds },
                    userId: BigInt(kitchenId),
                    branchId: BigInt(branchId)
                },
                include: {
                    items: {
                        include: {
                            menuItem: {
                                include: {
                                    ingredients: true // Fetches menuItemIngredient relation
                                }
                            }
                        }
                    }
                }
            });

            if (existingOrders.length === 0) {
                throw new Error('No valid orders found for this kitchen/branch');
            }

            // 2️⃣ Authorization & Existence Check
            const existingIdsSet = new Set(existingOrders.map((o) => Number(o.id)));
            const invalidIds = orderIds.filter((id) => !existingIdsSet.has(Number(id)));

            if (invalidIds.length > 0) {
                throw new Error(`Orders not found or unauthorized: ${invalidIds.join(', ')}`);
            }

            // =========================================================
            // 📦 3️⃣ INVENTORY DEDUCTION LOGIC (Only when status -> PREPARING)
            // =========================================================
            if (status === OrderStatus.PREPARING) {
                // Map to accumulate total required quantity per inventory item
                const ingredientDeductionMap = new Map<string, number>();

                for (const order of existingOrders) {
                    debugHelper.debug(`Order ID: ${order.id}, Old Status: ${order.status}`);

                    // 🛡️ Double Deduction Guard: Sirf tabhi minus hoga jab purana status PREPARING na ho!
                    if (order.status !== OrderStatus.PREPARING) {
                        for (const item of order.items) {
                            const dishQuantity = item.quantity; // e.g. 2 portion

                            for (const ing of item.menuItem.ingredients) {
                                const inventoryItemId = ing.inventoryItemId.toString(); // Links to branchIngredientInventory.id / inventorystock
                                const qtyRequiredPerDish = Number(ing.quantityRequired); // e.g. 0.3 KG

                                const totalNeeded = dishQuantity * qtyRequiredPerDish;

                                const currentTotal = ingredientDeductionMap.get(inventoryItemId) || 0;
                                ingredientDeductionMap.set(inventoryItemId, currentTotal + totalNeeded);
                            }
                        }
                    }
                }

                debugHelper.debug('[Deduction Map Total]:', Object.fromEntries(ingredientDeductionMap));

                // ⚡ Deduct Stock from `inventorystock` table
                for (const [inventoryItemId, totalDeductQty] of ingredientDeductionMap.entries()) {
                    const updateRes = await tx.inventoryStock.updateMany({
                        where: {
                            inventoryItemId: BigInt(inventoryItemId)
                        },
                        data: {
                            quantity: {
                                decrement: totalDeductQty // Prisma Atomic Decrement (quantity = quantity - totalDeductQty)
                            }
                        }
                    });

                    debugHelper.debug(
                        `[Stock Updated] inventoryItemId: ${inventoryItemId}, Deducted Qty: ${totalDeductQty}, Rows Affected: ${updateRes.count}`
                    );
                }
            }

            // =========================================================
            // 🔄 4️⃣ BULK UPDATE ORDER STATUS
            // =========================================================
            const updateResult = await tx.order.updateMany({
                where: {
                    id: { in: bigIntOrderIds },
                    userId: BigInt(kitchenId),
                    branchId: BigInt(branchId)
                },
                data: { status }
            });

            return updateResult;
        });

        return {
            status: true,
            message: `${result.count} order(s) updated to ${status} successfully`,
            data: {
                updatedCount: result.count,
                orderIds
            }
        };
    } catch (error: any) {
        debugHelper.debugError('[Order Service] bulkUpdateOrderStatus failed:', error);
        return { 
            status: false, 
            message: error.message || 'Failed to bulk update order status' 
        };
    }
};

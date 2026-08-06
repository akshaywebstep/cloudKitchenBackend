// src/index.ts
import cluster from "cluster";
import "dotenv/config";
import express from "express";
import cors from "cors";

// src/routes/v1/index.ts
import { Router as Router13 } from "express";

// src/modules/system/index.ts
import { Router } from "express";

// src/core/helpers/formatBytes.helper.ts
var formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(dm)} ${sizes[i]}`;
};

// src/core/config/databaseEnv.ts
var hasLiveDatabaseEnv = Boolean(
  process.env.LIVE_DATABASE_HOST || process.env.LIVE_DATABASE_NAME || process.env.LIVE_DATABASE_USER
);
var DB_ENV = process.env.DB_ENV || (hasLiveDatabaseEnv ? "live" : "local");
var isLiveDatabase = DB_ENV === "live";
var getDatabaseEnv = (key) => process.env[isLiveDatabase ? `LIVE_${key}` : key] ?? process.env[key];
var splitHostAndPort = (host) => {
  const trimmed = host?.trim();
  if (!trimmed) {
    return { host: void 0, port: void 0 };
  }
  if (trimmed.includes("://") || trimmed.startsWith("[")) {
    return { host: trimmed, port: void 0 };
  }
  const match = trimmed.match(/^(.+):(\d+)$/);
  if (!match) {
    return { host: trimmed, port: void 0 };
  }
  return {
    host: match[1],
    port: Number(match[2])
  };
};
var envNumber = (key, fallback) => {
  const value = Number(getDatabaseEnv(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
var explicitDatabasePort = () => {
  const key = isLiveDatabase ? "LIVE_DATABASE_PORT" : "DATABASE_PORT";
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : void 0;
};
var hostParts = () => splitHostAndPort(getDatabaseEnv("DATABASE_HOST"));
var getDatabaseHost = () => hostParts().host;
var getDatabasePort = () => {
  const parsedPort = hostParts().port;
  const explicitPort = explicitDatabasePort();
  if (explicitPort) {
    return explicitPort;
  }
  if (parsedPort) {
    return parsedPort;
  }
  return envNumber("DATABASE_PORT", 3306);
};
var getDatabaseName = () => getDatabaseEnv("DATABASE_NAME");
var getDatabaseTarget = () => ({
  env: DB_ENV,
  host: getDatabaseHost(),
  port: getDatabasePort(),
  database: getDatabaseName()
});

// lib/prisma.ts
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// prisma/generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "mysql",
  "inlineSchema": '// ===============================================\n// Prisma Schema - Production Ready (Single User + RBAC)\n// ===============================================\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "generated/prisma"\n}\n\ndatasource db {\n  provider = "mysql"\n}\n\n// ===============================================\n// ENUMS\n// ===============================================\n\nenum Status {\n  PENDING\n  ACTIVE\n  INACTIVE\n  DISCONTINUED\n}\n\nenum UserType {\n  ADMIN\n  ADMIN_STAFF\n  KITCHEN\n  KITCHEN_STAFF\n}\n\nenum DocumentType {\n  FSSAI\n  GST\n}\n\nenum Panel {\n  ADMIN\n  KITCHEN\n}\n\nenum FeatureType {\n  INCLUDE\n  EXCLUDE\n}\n\nenum Action {\n  CREATE\n  VIEW\n  UPDATE\n  DELETE\n  VIEW_TRASH\n  RESTORE\n  DESTROY\n}\n\nenum BillingCycle {\n  MONTHLY\n  YEARLY\n}\n\nenum SubscriptionStatus {\n  ACTIVE\n  EXPIRED\n}\n\nenum IntegrationChannel {\n  ZOMATO\n  SWIGGY\n  MANUAL\n}\n\nenum IntegrationStatus {\n  ACTIVE\n  INACTIVE\n}\n\nenum OrderStatus {\n  PLACED\n  PREPARING\n  COMPLETED\n  CANCELLED\n}\n\nenum OrderSource {\n  ZOMATO\n  SWIGGY\n  MANUAL\n}\n\nenum Unit {\n  // Weight\n  KG\n  GM\n  MG\n\n  // Liquid\n  LITER\n  ML\n\n  // Quantity\n  ITEM\n  PIECE\n  DOZEN\n  PAIR\n  TRAY\n\n  // Packaging\n  PACKET\n  BOX\n  BOTTLE\n  CAN\n  JAR\n  POUCH\n  SACHET\n\n  // Bulk / Storage\n  BAG\n  SACK\n  CARTON\n  CONTAINER\n\n  // Kitchen usage\n  SPOON\n  TSP\n  TBSP\n  CUP\n  BOWL\n  PLATE\n  SLICE\n\n  // Length / rolls\n  ROLL\n\n  // Optional restaurant specific\n  PORTION\n  SERVING\n}\n\nmodel Ingredient {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  name String @unique\n\n  // \u{1F525} image for UI suggestion\n  image String?\n\n  // \u{1F525} simple category (since no heavy logic needed)\n  category String? // Veg, Spice, Dairy, Meat etc.\n\n  status Status @default(ACTIVE)\n\n  // ===============================================\n  // \u{1F517} RELATIONS\n  // ===============================================\n  inventories BranchIngredientInventory[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([name])\n  @@index([category])\n  @@map("ingredient")\n}\n\nmodel Cuisine {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  name String @unique // North Indian, South Indian, Chinese\n\n  // \u{1F525} UI ke liye\n  image String? // optional (icon / banner)\n\n  status Status @default(ACTIVE)\n\n  cuisines BranchCuisine[] @relation("CuisineToBranches")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([name])\n  @@map("cuisine")\n}\n\n// ===============================================\n// MENU CATEGORY\n// ===============================================\nmodel MenuCategory {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  // ===============================================\n  // \u{1F539} BASIC INFO\n  // ===============================================\n  name  String  @unique\n  image String?\n\n  status Status @default(ACTIVE)\n\n  // ===============================================\n  // \u{1F517} SELF RELATION (SUB CATEGORY)\n  // ===============================================\n  parentId BigInt? @db.BigInt\n\n  parent MenuCategory? @relation("MenuCategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)\n\n  subCategories MenuCategory[] @relation("MenuCategoryHierarchy")\n\n  // ===============================================\n  // \u{1F517} RELATIONS\n  // ===============================================\n  menuItems    MenuItem[] @relation("CategoryMenuItems")\n  subMenuItems MenuItem[] @relation("SubCategoryMenuItems")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // \u{1F525} prevent duplicate sub-category under same parent\n  @@unique([parentId, name])\n  @@index([name])\n  @@index([parentId])\n  @@map("menucategory")\n}\n\nmodel Country {\n  id             BigInt  @id @default(autoincrement()) @db.BigInt\n  name           String\n  iso3           String?\n  iso2           String?\n  phonecode      String?\n  currency       String?\n  currencyName   String?\n  currencySymbol String?\n  nationality    String?\n\n  states State[] @relation("CountryToState")\n  cities City[]  @relation("CountryToCity")\n\n  branches Branch[] @relation("BranchCountry")\n\n  @@map("country")\n}\n\nmodel State {\n  id        BigInt  @id @default(autoincrement()) @db.BigInt\n  name      String\n  countryId BigInt\n  iso2      String?\n  type      String?\n\n  country Country @relation("CountryToState", fields: [countryId], references: [id], onDelete: Cascade)\n  cities  City[]  @relation("StateToCity")\n\n  branches Branch[] @relation("BranchState")\n\n  @@index([countryId])\n  @@map("state")\n}\n\nmodel City {\n  id        BigInt @id @default(autoincrement()) @db.BigInt\n  name      String\n  stateId   BigInt\n  countryId BigInt\n\n  state   State   @relation("StateToCity", fields: [stateId], references: [id], onDelete: Cascade)\n  country Country @relation("CountryToCity", fields: [countryId], references: [id], onDelete: Cascade)\n\n  branches Branch[] @relation("BranchCity")\n\n  @@index([stateId])\n  @@index([countryId])\n  @@map("city")\n}\n\n// ===============================================\n// USER\n// ===============================================\nmodel User {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  // hierarchy\n  parentId BigInt? @db.BigInt\n  parent   User?   @relation("UserHierarchy", fields: [parentId], references: [id], onDelete: SetNull)\n  children User[]  @relation("UserHierarchy")\n\n  // \u{1F525} tenant root\n  rootId       BigInt? @db.BigInt\n  root         User?   @relation("UserRoot", fields: [rootId], references: [id], onDelete: SetNull)\n  rootChildren User[]  @relation("UserRoot")\n\n  profilePicture String\n\n  // ===============================================\n  // PERSON (Admin OR Kitchen Owner)\n  // ===============================================\n  title     String? // Mr, Ms, etc.\n  firstName String? // Admin name\n  lastName  String?\n\n  // ===============================================\n  // KITCHEN (Only if userType = KITCHEN)\n  // ===============================================\n  kitchenName String? // business name\n\n  // ===============================================\n  // AUTH (COMMON FOR ALL)\n  // ===============================================\n  email    String @unique\n  phone    String @unique\n  password String\n\n  // ===============================================\n  // OPTIONAL CONTACT PERSON (Kitchen only)\n  // ===============================================\n  contactTitle     String?\n  contactFirstName String?\n  contactLastName  String?\n  contactEmail     String?\n  contactPhone     String?\n\n  userType UserType\n  status   Status   @default(ACTIVE)\n\n  // \u{1F539} relation to documents\n  kitchenDocuments KitchenDocument[] @relation("KitchenDocuments")\n\n  // custom RBAC role\n  roleId BigInt? @db.BigInt\n  role   Role?   @relation("UserRole", fields: [roleId], references: [id], onDelete: SetNull)\n\n  // reverse relations\n  ownedRoles Role[] @relation("RoleOwner")\n\n  // business relations\n  branches      Branch[]                    @relation("UserBranches")\n  subscriptions KitchenSubscription[]       @relation("KitchenSubscriptions")\n  menuItems     MenuItem[]                  @relation("KitchenMenuItems")\n  inventory     BranchIngredientInventory[] @relation("KitchenIngredientInventory")\n  orders        Order[]                     @relation("UserOrders")\n\n  branchAccess UserBranchAccess[] @relation("UserBranchAccess")\n\n  resetPasswordToken     String?\n  resetPasswordExpiresAt DateTime?\n\n  isOnboardingCompleted Boolean   @default(false)\n  onboardingCompletedAt DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([rootId])\n  @@map("user")\n}\n\n// ===============================================\n// KITCHEN DOCUMENTS\n// ===============================================\nmodel KitchenDocument {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  kitchenId BigInt @db.BigInt\n  kitchen   User   @relation("KitchenDocuments", fields: [kitchenId], references: [id], onDelete: Cascade)\n\n  // document type\n  type DocumentType\n\n  // file or number\n  documentNumber String? // GST / FSSAI number\n  documentFile   String? // uploaded file path\n\n  status Status @default(ACTIVE)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([kitchenId])\n  @@map("kitchendocument")\n}\n\n// ===============================================\n// EMAIL CONFIG\n// ===============================================\nmodel emailConfig {\n  id BigInt @id @default(autoincrement())\n\n  // context\n  panel  String // admin, kitchen, supplier\n  module String // auth, order, subscription\n  action String // FORGOT_PASSWORD, ORDER_CREATED, etc.\n\n  // email content\n  subject      String // email subject\n  htmlTemplate String? @db.LongText // HTML template with variables\n\n  // SMTP configuration\n  smtpHost     String // SMTP host\n  smtpSecure   Boolean // true = SSL, false = TLS\n  smtpPort     Int // port (465 / 587)\n  smtpUsername String // SMTP username\n  smtpPassword String // SMTP password\n\n  // sender details\n  fromEmail String // sender email\n  fromName  String // sender name\n\n  // recipients\n  to  Json? // TO emails\n  cc  Json? // CC emails\n  bcc Json? // BCC emails\n\n  // dynamic data\n  variables Json? // template variables (name, resetLink, etc.)\n\n  // status\n  status Status @default(ACTIVE)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("emailconfig")\n}\n\n// ===============================================\n// ROLE (Tenant Scoped)\n// ===============================================\nmodel Role {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  ownerId BigInt @db.BigInt\n  owner   User   @relation("RoleOwner", fields: [ownerId], references: [id], onDelete: Cascade)\n\n  name   String\n  status Status @default(ACTIVE)\n\n  // assigned users\n  users           User[]              @relation("UserRole")\n  rolePermissions RoleHasPermission[] @relation("RolePermissions")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([ownerId, name])\n  @@index([ownerId])\n  @@map("role")\n}\n\n// ===============================================\n// PERMISSION\n// ===============================================\nmodel Permission {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  panel  Panel\n  module String\n  action Action\n\n  status Status @default(ACTIVE)\n\n  roles RoleHasPermission[] @relation("PermissionRoles")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([panel, module, action])\n  @@map("permission")\n}\n\n// ===============================================\n// ROLE \u2194 PERMISSION\n// ===============================================\nmodel RoleHasPermission {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  roleId       BigInt @db.BigInt\n  permissionId BigInt @db.BigInt\n\n  role       Role       @relation("RolePermissions", fields: [roleId], references: [id], onDelete: Cascade)\n  permission Permission @relation("PermissionRoles", fields: [permissionId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@unique([roleId, permissionId])\n  @@map("rolehaspermission")\n}\n\n// ===============================================\n// SUBSCRIPTION\n// ===============================================\nmodel Subscription {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  name  String\n  title String? // short display title (e.g. "Starter Plan")\n\n  price       Float // monthly price\n  annualPrice Float? // yearly price\n\n  discountPct Float? // % discount on annual (e.g. 20 for 20%)\n\n  freeTrialDays Int? // trial period in days\n\n  maxBranches Int\n  maxUsers    Int\n\n  userSubs KitchenSubscription[] @relation("SubscriptionKitchens")\n  features SubscriptionFeature[] @relation("SubscriptionFeatures")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("subscription")\n}\n\n// ===============================================\n// SUBSCRIPTION FEATURES\n// ===============================================\nmodel SubscriptionFeature {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  subscriptionId BigInt\n  subscription   Subscription @relation("SubscriptionFeatures", fields: [subscriptionId], references: [id], onDelete: Cascade)\n\n  type    FeatureType // INCLUDE / EXCLUDE\n  feature String // e.g. "Priority Support", "Analytics Dashboard"\n\n  createdAt DateTime @default(now())\n\n  @@map("subscriptionfeature")\n}\n\n// ===============================================\n// KITCHEN SUBSCRIPTION\n// ===============================================\nmodel KitchenSubscription {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  kitchenId      BigInt @db.BigInt\n  subscriptionId BigInt @db.BigInt\n\n  kitchen      User         @relation("KitchenSubscriptions", fields: [kitchenId], references: [id], onDelete: Cascade)\n  subscription Subscription @relation("SubscriptionKitchens", fields: [subscriptionId], references: [id], onDelete: Restrict)\n\n  // ========================\n  // TRIAL INFO\n  // ========================\n  trialStartDate DateTime?\n  trialEndDate   DateTime?\n  trialDays      Int?\n\n  // ========================\n  // ACTUAL SUBSCRIPTION\n  // ========================\n  planStartDate DateTime?\n  planEndDate   DateTime?\n\n  billingCycle BillingCycle // MONTHLY / YEARLY\n  duration     Int // e.g. 1, 3, 12 (months/years based on cycle)\n\n  // ========================\n  // PRICING SNAPSHOT\n  // ========================\n  pricePaid     Float // final paid amount\n  originalPrice Float? // before discount\n  discountPct   Float?\n\n  // ========================\n  // LIMIT SNAPSHOT\n  // ========================\n  maxUsers    Int\n  maxBranches Int\n\n  // ========================\n  // STATUS\n  // ========================\n  status SubscriptionStatus\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([kitchenId])\n  @@map("kitchensubscription")\n}\n\n// ===============================================\n// BRANCH\n// ===============================================\nmodel Branch {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  // ===============================================\n  // \u{1F539} OWNER (Kitchen / User)\n  // ===============================================\n  userId BigInt @db.BigInt\n  user   User   @relation("UserBranches", fields: [userId], references: [id], onDelete: Cascade)\n\n  name String\n\n  // ===============================================\n  // \u{1F4CD} LOCATION (Complete Address)\n  // ===============================================\n  addressLine1 String\n  addressLine2 String?\n\n  landmark String? // e.g. Near Metro Station, Mall, etc.\n  area     String? // locality / sector / colony\n\n  pincode String? // postal code (India: 6 digit)\n\n  // ===============================================\n  // \u{1F30D} LOCATION RELATIONS\n  // ===============================================\n  countryId BigInt @db.BigInt\n  stateId   BigInt @db.BigInt\n  cityId    BigInt @db.BigInt\n\n  country Country @relation("BranchCountry", fields: [countryId], references: [id])\n  state   State   @relation("BranchState", fields: [stateId], references: [id])\n  city    City    @relation("BranchCity", fields: [cityId], references: [id])\n\n  // ===============================================\n  // \u{1F4DE} CONTACT PERSON (Optional)\n  // ===============================================\n  contactTitle     String\n  contactFirstName String\n  contactLastName  String?\n  contactEmail     String\n  contactPhone     String\n\n  // ===============================================\n  // \u{1F504} STATUS\n  // ===============================================\n  status Status @default(ACTIVE)\n\n  // ===============================================\n  // \u{1F517} RELATIONS\n  // ===============================================\n  cuisines     BranchCuisine[]             @relation("BranchToCuisines")\n  menuItems    MenuItem[]                  @relation("BranchMenuItems")\n  inventory    BranchIngredientInventory[] @relation("BranchIngredientInventory")\n  orders       Order[]                     @relation("BranchOrders")\n  integrations Integration[]               @relation("BranchIntegrations")\n\n  userAccess UserBranchAccess[] @relation("BranchUserAccess")\n\n  // ===============================================\n  // \u23F1\uFE0F META\n  // ===============================================\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // \u{1F525} Prevent duplicate branch names per user\n  @@unique([userId, name])\n  // ===============================================\n  // \u26A1 INDEXES & CONSTRAINTS\n  // ===============================================\n  @@index([userId])\n  @@index([countryId])\n  @@index([stateId])\n  @@index([cityId])\n  @@map("branch")\n}\n\nmodel BranchCuisine {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  branchId  BigInt @db.BigInt\n  cuisineId BigInt @db.BigInt\n\n  branch  Branch  @relation("BranchToCuisines", fields: [branchId], references: [id], onDelete: Cascade)\n  cuisine Cuisine @relation("CuisineToBranches", fields: [cuisineId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@unique([branchId, cuisineId]) // duplicate mapping prevent\n  @@index([branchId])\n  @@index([cuisineId])\n  @@map("branchcuisine")\n}\n\n// ===============================================\n// BRANCH ACCESS\n// ===============================================\nmodel UserBranchAccess {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  userId   BigInt @db.BigInt\n  branchId BigInt @db.BigInt\n\n  user   User   @relation("UserBranchAccess", fields: [userId], references: [id], onDelete: Cascade)\n  branch Branch @relation("BranchUserAccess", fields: [branchId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@unique([userId, branchId])\n  @@map("userbranchaccess")\n}\n\n// ===============================================\n// INTEGRATION\n// ===============================================\nmodel Integration {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  branchId BigInt @db.BigInt\n  branch   Branch @relation("BranchIntegrations", fields: [branchId], references: [id], onDelete: Cascade)\n\n  channel     IntegrationChannel\n  credentials Json\n\n  status IntegrationStatus\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("integration")\n}\n\n// ===============================================\n// MENU\n// ===============================================\nmodel MenuItem {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  kitchenId BigInt @db.BigInt\n  branchId  BigInt @db.BigInt\n\n  kitchen User   @relation("KitchenMenuItems", fields: [kitchenId], references: [id], onDelete: Cascade)\n  branch  Branch @relation("BranchMenuItems", fields: [branchId], references: [id], onDelete: Cascade)\n\n  // ===============================================\n  // \u{1F539} CATEGORY\n  // ===============================================\n  categoryId    BigInt? @db.BigInt\n  subCategoryId BigInt? @db.BigInt\n\n  category    MenuCategory? @relation("CategoryMenuItems", fields: [categoryId], references: [id])\n  subCategory MenuCategory? @relation("SubCategoryMenuItems", fields: [subCategoryId], references: [id])\n\n  name        String\n  description String?\n  price       Float\n\n  status Status @default(ACTIVE)\n\n  ingredients MenuItemIngredient[] @relation("MenuItemIngredients")\n  orderItems  OrderItem[]          @relation("MenuItemOrders")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([kitchenId, branchId])\n  @@index([categoryId])\n  @@index([subCategoryId])\n  @@map("menuitem")\n}\n\n// ===============================================\n// BRANCH INGREDIENT INVENTORY\n// ===============================================\nmodel BranchIngredientInventory {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  kitchenId BigInt @db.BigInt\n  branchId  BigInt @db.BigInt\n\n  kitchen User   @relation("KitchenIngredientInventory", fields: [kitchenId], references: [id], onDelete: Cascade)\n  branch  Branch @relation("BranchIngredientInventory", fields: [branchId], references: [id], onDelete: Cascade)\n\n  ingredientId BigInt     @db.BigInt\n  ingredient   Ingredient @relation(fields: [ingredientId], references: [id], onDelete: Cascade)\n\n  unit Unit\n\n  stocks InventoryStock[] @relation("BranchIngredientInventoryItemToStock")\n\n  ingredients MenuItemIngredient[] @relation("BranchIngredientInventoryIngredients")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([kitchenId, branchId])\n  @@map("branchingredientinventory")\n}\n\nmodel InventoryStock {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  inventoryItemId BigInt\n  inventoryItem   BranchIngredientInventory @relation("BranchIngredientInventoryItemToStock", fields: [inventoryItemId], references: [id], onDelete: Cascade)\n\n  quantity Float\n\n  expiryDate  DateTime?\n  batchNumber String?\n\n  createdAt DateTime @default(now())\n\n  @@index([inventoryItemId])\n  @@map("inventorystock")\n}\n\n// ===============================================\n// INGREDIENT MAPPING\n// ===============================================\nmodel MenuItemIngredient {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  menuItemId      BigInt @db.BigInt\n  inventoryItemId BigInt @db.BigInt\n\n  menuItem      MenuItem                  @relation("MenuItemIngredients", fields: [menuItemId], references: [id], onDelete: Cascade)\n  inventoryItem BranchIngredientInventory @relation("BranchIngredientInventoryIngredients", fields: [inventoryItemId], references: [id], onDelete: Restrict)\n\n  quantityRequired Float\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([menuItemId, inventoryItemId])\n  @@map("menuitemingredient")\n}\n\n// ===============================================\n// ORDERS\n// ===============================================\nmodel Order {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  userId   BigInt @db.BigInt\n  branchId BigInt @db.BigInt\n\n  user   User   @relation("UserOrders", fields: [userId], references: [id], onDelete: Restrict)\n  branch Branch @relation("BranchOrders", fields: [branchId], references: [id], onDelete: Restrict)\n\n  source      OrderSource\n  totalAmount Float\n\n  status OrderStatus\n\n  items OrderItem[] @relation("OrderItems")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([userId, branchId])\n  @@map("order")\n}\n\nmodel OrderItem {\n  id BigInt @id @default(autoincrement()) @db.BigInt\n\n  orderId    BigInt @db.BigInt\n  menuItemId BigInt @db.BigInt\n\n  order    Order    @relation("OrderItems", fields: [orderId], references: [id], onDelete: Cascade)\n  menuItem MenuItem @relation("MenuItemOrders", fields: [menuItemId], references: [id], onDelete: Restrict)\n\n  quantity Int\n  price    Float\n\n  @@map("orderitem")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Ingredient":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"category","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"inventories","kind":"object","type":"BranchIngredientInventory","relationName":"BranchIngredientInventoryToIngredient"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"ingredient"},"Cuisine":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"cuisines","kind":"object","type":"BranchCuisine","relationName":"CuisineToBranches"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"cuisine"},"MenuCategory":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"parentId","kind":"scalar","type":"BigInt"},{"name":"parent","kind":"object","type":"MenuCategory","relationName":"MenuCategoryHierarchy"},{"name":"subCategories","kind":"object","type":"MenuCategory","relationName":"MenuCategoryHierarchy"},{"name":"menuItems","kind":"object","type":"MenuItem","relationName":"CategoryMenuItems"},{"name":"subMenuItems","kind":"object","type":"MenuItem","relationName":"SubCategoryMenuItems"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"menucategory"},"Country":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"iso3","kind":"scalar","type":"String"},{"name":"iso2","kind":"scalar","type":"String"},{"name":"phonecode","kind":"scalar","type":"String"},{"name":"currency","kind":"scalar","type":"String"},{"name":"currencyName","kind":"scalar","type":"String"},{"name":"currencySymbol","kind":"scalar","type":"String"},{"name":"nationality","kind":"scalar","type":"String"},{"name":"states","kind":"object","type":"State","relationName":"CountryToState"},{"name":"cities","kind":"object","type":"City","relationName":"CountryToCity"},{"name":"branches","kind":"object","type":"Branch","relationName":"BranchCountry"}],"dbName":"country"},"State":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"countryId","kind":"scalar","type":"BigInt"},{"name":"iso2","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"country","kind":"object","type":"Country","relationName":"CountryToState"},{"name":"cities","kind":"object","type":"City","relationName":"StateToCity"},{"name":"branches","kind":"object","type":"Branch","relationName":"BranchState"}],"dbName":"state"},"City":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"stateId","kind":"scalar","type":"BigInt"},{"name":"countryId","kind":"scalar","type":"BigInt"},{"name":"state","kind":"object","type":"State","relationName":"StateToCity"},{"name":"country","kind":"object","type":"Country","relationName":"CountryToCity"},{"name":"branches","kind":"object","type":"Branch","relationName":"BranchCity"}],"dbName":"city"},"User":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"parentId","kind":"scalar","type":"BigInt"},{"name":"parent","kind":"object","type":"User","relationName":"UserHierarchy"},{"name":"children","kind":"object","type":"User","relationName":"UserHierarchy"},{"name":"rootId","kind":"scalar","type":"BigInt"},{"name":"root","kind":"object","type":"User","relationName":"UserRoot"},{"name":"rootChildren","kind":"object","type":"User","relationName":"UserRoot"},{"name":"profilePicture","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"kitchenName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"contactTitle","kind":"scalar","type":"String"},{"name":"contactFirstName","kind":"scalar","type":"String"},{"name":"contactLastName","kind":"scalar","type":"String"},{"name":"contactEmail","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"userType","kind":"enum","type":"UserType"},{"name":"status","kind":"enum","type":"Status"},{"name":"kitchenDocuments","kind":"object","type":"KitchenDocument","relationName":"KitchenDocuments"},{"name":"roleId","kind":"scalar","type":"BigInt"},{"name":"role","kind":"object","type":"Role","relationName":"UserRole"},{"name":"ownedRoles","kind":"object","type":"Role","relationName":"RoleOwner"},{"name":"branches","kind":"object","type":"Branch","relationName":"UserBranches"},{"name":"subscriptions","kind":"object","type":"KitchenSubscription","relationName":"KitchenSubscriptions"},{"name":"menuItems","kind":"object","type":"MenuItem","relationName":"KitchenMenuItems"},{"name":"inventory","kind":"object","type":"BranchIngredientInventory","relationName":"KitchenIngredientInventory"},{"name":"orders","kind":"object","type":"Order","relationName":"UserOrders"},{"name":"branchAccess","kind":"object","type":"UserBranchAccess","relationName":"UserBranchAccess"},{"name":"resetPasswordToken","kind":"scalar","type":"String"},{"name":"resetPasswordExpiresAt","kind":"scalar","type":"DateTime"},{"name":"isOnboardingCompleted","kind":"scalar","type":"Boolean"},{"name":"onboardingCompletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"KitchenDocument":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"kitchenId","kind":"scalar","type":"BigInt"},{"name":"kitchen","kind":"object","type":"User","relationName":"KitchenDocuments"},{"name":"type","kind":"enum","type":"DocumentType"},{"name":"documentNumber","kind":"scalar","type":"String"},{"name":"documentFile","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"kitchendocument"},"emailConfig":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"panel","kind":"scalar","type":"String"},{"name":"module","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"htmlTemplate","kind":"scalar","type":"String"},{"name":"smtpHost","kind":"scalar","type":"String"},{"name":"smtpSecure","kind":"scalar","type":"Boolean"},{"name":"smtpPort","kind":"scalar","type":"Int"},{"name":"smtpUsername","kind":"scalar","type":"String"},{"name":"smtpPassword","kind":"scalar","type":"String"},{"name":"fromEmail","kind":"scalar","type":"String"},{"name":"fromName","kind":"scalar","type":"String"},{"name":"to","kind":"scalar","type":"Json"},{"name":"cc","kind":"scalar","type":"Json"},{"name":"bcc","kind":"scalar","type":"Json"},{"name":"variables","kind":"scalar","type":"Json"},{"name":"status","kind":"enum","type":"Status"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"emailconfig"},"Role":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"ownerId","kind":"scalar","type":"BigInt"},{"name":"owner","kind":"object","type":"User","relationName":"RoleOwner"},{"name":"name","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"users","kind":"object","type":"User","relationName":"UserRole"},{"name":"rolePermissions","kind":"object","type":"RoleHasPermission","relationName":"RolePermissions"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"role"},"Permission":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"panel","kind":"enum","type":"Panel"},{"name":"module","kind":"scalar","type":"String"},{"name":"action","kind":"enum","type":"Action"},{"name":"status","kind":"enum","type":"Status"},{"name":"roles","kind":"object","type":"RoleHasPermission","relationName":"PermissionRoles"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"permission"},"RoleHasPermission":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"roleId","kind":"scalar","type":"BigInt"},{"name":"permissionId","kind":"scalar","type":"BigInt"},{"name":"role","kind":"object","type":"Role","relationName":"RolePermissions"},{"name":"permission","kind":"object","type":"Permission","relationName":"PermissionRoles"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"rolehaspermission"},"Subscription":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"name","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"annualPrice","kind":"scalar","type":"Float"},{"name":"discountPct","kind":"scalar","type":"Float"},{"name":"freeTrialDays","kind":"scalar","type":"Int"},{"name":"maxBranches","kind":"scalar","type":"Int"},{"name":"maxUsers","kind":"scalar","type":"Int"},{"name":"userSubs","kind":"object","type":"KitchenSubscription","relationName":"SubscriptionKitchens"},{"name":"features","kind":"object","type":"SubscriptionFeature","relationName":"SubscriptionFeatures"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"subscription"},"SubscriptionFeature":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"subscriptionId","kind":"scalar","type":"BigInt"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"SubscriptionFeatures"},{"name":"type","kind":"enum","type":"FeatureType"},{"name":"feature","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"subscriptionfeature"},"KitchenSubscription":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"kitchenId","kind":"scalar","type":"BigInt"},{"name":"subscriptionId","kind":"scalar","type":"BigInt"},{"name":"kitchen","kind":"object","type":"User","relationName":"KitchenSubscriptions"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"SubscriptionKitchens"},{"name":"trialStartDate","kind":"scalar","type":"DateTime"},{"name":"trialEndDate","kind":"scalar","type":"DateTime"},{"name":"trialDays","kind":"scalar","type":"Int"},{"name":"planStartDate","kind":"scalar","type":"DateTime"},{"name":"planEndDate","kind":"scalar","type":"DateTime"},{"name":"billingCycle","kind":"enum","type":"BillingCycle"},{"name":"duration","kind":"scalar","type":"Int"},{"name":"pricePaid","kind":"scalar","type":"Float"},{"name":"originalPrice","kind":"scalar","type":"Float"},{"name":"discountPct","kind":"scalar","type":"Float"},{"name":"maxUsers","kind":"scalar","type":"Int"},{"name":"maxBranches","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"SubscriptionStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"kitchensubscription"},"Branch":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"userId","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"UserBranches"},{"name":"name","kind":"scalar","type":"String"},{"name":"addressLine1","kind":"scalar","type":"String"},{"name":"addressLine2","kind":"scalar","type":"String"},{"name":"landmark","kind":"scalar","type":"String"},{"name":"area","kind":"scalar","type":"String"},{"name":"pincode","kind":"scalar","type":"String"},{"name":"countryId","kind":"scalar","type":"BigInt"},{"name":"stateId","kind":"scalar","type":"BigInt"},{"name":"cityId","kind":"scalar","type":"BigInt"},{"name":"country","kind":"object","type":"Country","relationName":"BranchCountry"},{"name":"state","kind":"object","type":"State","relationName":"BranchState"},{"name":"city","kind":"object","type":"City","relationName":"BranchCity"},{"name":"contactTitle","kind":"scalar","type":"String"},{"name":"contactFirstName","kind":"scalar","type":"String"},{"name":"contactLastName","kind":"scalar","type":"String"},{"name":"contactEmail","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"Status"},{"name":"cuisines","kind":"object","type":"BranchCuisine","relationName":"BranchToCuisines"},{"name":"menuItems","kind":"object","type":"MenuItem","relationName":"BranchMenuItems"},{"name":"inventory","kind":"object","type":"BranchIngredientInventory","relationName":"BranchIngredientInventory"},{"name":"orders","kind":"object","type":"Order","relationName":"BranchOrders"},{"name":"integrations","kind":"object","type":"Integration","relationName":"BranchIntegrations"},{"name":"userAccess","kind":"object","type":"UserBranchAccess","relationName":"BranchUserAccess"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"branch"},"BranchCuisine":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"cuisineId","kind":"scalar","type":"BigInt"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchToCuisines"},{"name":"cuisine","kind":"object","type":"Cuisine","relationName":"CuisineToBranches"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"branchcuisine"},"UserBranchAccess":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"userId","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"UserBranchAccess"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchUserAccess"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"userbranchaccess"},"Integration":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchIntegrations"},{"name":"channel","kind":"enum","type":"IntegrationChannel"},{"name":"credentials","kind":"scalar","type":"Json"},{"name":"status","kind":"enum","type":"IntegrationStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"integration"},"MenuItem":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"kitchenId","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"kitchen","kind":"object","type":"User","relationName":"KitchenMenuItems"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchMenuItems"},{"name":"categoryId","kind":"scalar","type":"BigInt"},{"name":"subCategoryId","kind":"scalar","type":"BigInt"},{"name":"category","kind":"object","type":"MenuCategory","relationName":"CategoryMenuItems"},{"name":"subCategory","kind":"object","type":"MenuCategory","relationName":"SubCategoryMenuItems"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"Status"},{"name":"ingredients","kind":"object","type":"MenuItemIngredient","relationName":"MenuItemIngredients"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MenuItemOrders"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"menuitem"},"BranchIngredientInventory":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"kitchenId","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"kitchen","kind":"object","type":"User","relationName":"KitchenIngredientInventory"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchIngredientInventory"},{"name":"ingredientId","kind":"scalar","type":"BigInt"},{"name":"ingredient","kind":"object","type":"Ingredient","relationName":"BranchIngredientInventoryToIngredient"},{"name":"unit","kind":"enum","type":"Unit"},{"name":"stocks","kind":"object","type":"InventoryStock","relationName":"BranchIngredientInventoryItemToStock"},{"name":"ingredients","kind":"object","type":"MenuItemIngredient","relationName":"BranchIngredientInventoryIngredients"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"branchingredientinventory"},"InventoryStock":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"inventoryItemId","kind":"scalar","type":"BigInt"},{"name":"inventoryItem","kind":"object","type":"BranchIngredientInventory","relationName":"BranchIngredientInventoryItemToStock"},{"name":"quantity","kind":"scalar","type":"Float"},{"name":"expiryDate","kind":"scalar","type":"DateTime"},{"name":"batchNumber","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":"inventorystock"},"MenuItemIngredient":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"menuItemId","kind":"scalar","type":"BigInt"},{"name":"inventoryItemId","kind":"scalar","type":"BigInt"},{"name":"menuItem","kind":"object","type":"MenuItem","relationName":"MenuItemIngredients"},{"name":"inventoryItem","kind":"object","type":"BranchIngredientInventory","relationName":"BranchIngredientInventoryIngredients"},{"name":"quantityRequired","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"menuitemingredient"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"userId","kind":"scalar","type":"BigInt"},{"name":"branchId","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"UserOrders"},{"name":"branch","kind":"object","type":"Branch","relationName":"BranchOrders"},{"name":"source","kind":"enum","type":"OrderSource"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderItems"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"BigInt"},{"name":"orderId","kind":"scalar","type":"BigInt"},{"name":"menuItemId","kind":"scalar","type":"BigInt"},{"name":"order","kind":"object","type":"Order","relationName":"OrderItems"},{"name":"menuItem","kind":"object","type":"MenuItem","relationName":"MenuItemOrders"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Float"}],"dbName":"orderitem"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","parent","children","root","rootChildren","kitchen","kitchenDocuments","owner","users","role","roles","_count","permission","rolePermissions","ownedRoles","user","country","state","branches","cities","states","city","branch","cuisines","cuisine","subCategories","menuItems","subMenuItems","category","subCategory","menuItem","inventoryItem","ingredients","items","order","orderItems","inventory","orders","integrations","userAccess","userSubs","subscription","features","subscriptions","branchAccess","ingredient","stocks","inventories","Ingredient.findUnique","Ingredient.findUniqueOrThrow","Ingredient.findFirst","Ingredient.findFirstOrThrow","Ingredient.findMany","data","Ingredient.createOne","Ingredient.createMany","Ingredient.updateOne","Ingredient.updateMany","create","update","Ingredient.upsertOne","Ingredient.deleteOne","Ingredient.deleteMany","having","_avg","_sum","_min","_max","Ingredient.groupBy","Ingredient.aggregate","Cuisine.findUnique","Cuisine.findUniqueOrThrow","Cuisine.findFirst","Cuisine.findFirstOrThrow","Cuisine.findMany","Cuisine.createOne","Cuisine.createMany","Cuisine.updateOne","Cuisine.updateMany","Cuisine.upsertOne","Cuisine.deleteOne","Cuisine.deleteMany","Cuisine.groupBy","Cuisine.aggregate","MenuCategory.findUnique","MenuCategory.findUniqueOrThrow","MenuCategory.findFirst","MenuCategory.findFirstOrThrow","MenuCategory.findMany","MenuCategory.createOne","MenuCategory.createMany","MenuCategory.updateOne","MenuCategory.updateMany","MenuCategory.upsertOne","MenuCategory.deleteOne","MenuCategory.deleteMany","MenuCategory.groupBy","MenuCategory.aggregate","Country.findUnique","Country.findUniqueOrThrow","Country.findFirst","Country.findFirstOrThrow","Country.findMany","Country.createOne","Country.createMany","Country.updateOne","Country.updateMany","Country.upsertOne","Country.deleteOne","Country.deleteMany","Country.groupBy","Country.aggregate","State.findUnique","State.findUniqueOrThrow","State.findFirst","State.findFirstOrThrow","State.findMany","State.createOne","State.createMany","State.updateOne","State.updateMany","State.upsertOne","State.deleteOne","State.deleteMany","State.groupBy","State.aggregate","City.findUnique","City.findUniqueOrThrow","City.findFirst","City.findFirstOrThrow","City.findMany","City.createOne","City.createMany","City.updateOne","City.updateMany","City.upsertOne","City.deleteOne","City.deleteMany","City.groupBy","City.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.updateOne","User.updateMany","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","KitchenDocument.findUnique","KitchenDocument.findUniqueOrThrow","KitchenDocument.findFirst","KitchenDocument.findFirstOrThrow","KitchenDocument.findMany","KitchenDocument.createOne","KitchenDocument.createMany","KitchenDocument.updateOne","KitchenDocument.updateMany","KitchenDocument.upsertOne","KitchenDocument.deleteOne","KitchenDocument.deleteMany","KitchenDocument.groupBy","KitchenDocument.aggregate","emailConfig.findUnique","emailConfig.findUniqueOrThrow","emailConfig.findFirst","emailConfig.findFirstOrThrow","emailConfig.findMany","emailConfig.createOne","emailConfig.createMany","emailConfig.updateOne","emailConfig.updateMany","emailConfig.upsertOne","emailConfig.deleteOne","emailConfig.deleteMany","emailConfig.groupBy","emailConfig.aggregate","Role.findUnique","Role.findUniqueOrThrow","Role.findFirst","Role.findFirstOrThrow","Role.findMany","Role.createOne","Role.createMany","Role.updateOne","Role.updateMany","Role.upsertOne","Role.deleteOne","Role.deleteMany","Role.groupBy","Role.aggregate","Permission.findUnique","Permission.findUniqueOrThrow","Permission.findFirst","Permission.findFirstOrThrow","Permission.findMany","Permission.createOne","Permission.createMany","Permission.updateOne","Permission.updateMany","Permission.upsertOne","Permission.deleteOne","Permission.deleteMany","Permission.groupBy","Permission.aggregate","RoleHasPermission.findUnique","RoleHasPermission.findUniqueOrThrow","RoleHasPermission.findFirst","RoleHasPermission.findFirstOrThrow","RoleHasPermission.findMany","RoleHasPermission.createOne","RoleHasPermission.createMany","RoleHasPermission.updateOne","RoleHasPermission.updateMany","RoleHasPermission.upsertOne","RoleHasPermission.deleteOne","RoleHasPermission.deleteMany","RoleHasPermission.groupBy","RoleHasPermission.aggregate","Subscription.findUnique","Subscription.findUniqueOrThrow","Subscription.findFirst","Subscription.findFirstOrThrow","Subscription.findMany","Subscription.createOne","Subscription.createMany","Subscription.updateOne","Subscription.updateMany","Subscription.upsertOne","Subscription.deleteOne","Subscription.deleteMany","Subscription.groupBy","Subscription.aggregate","SubscriptionFeature.findUnique","SubscriptionFeature.findUniqueOrThrow","SubscriptionFeature.findFirst","SubscriptionFeature.findFirstOrThrow","SubscriptionFeature.findMany","SubscriptionFeature.createOne","SubscriptionFeature.createMany","SubscriptionFeature.updateOne","SubscriptionFeature.updateMany","SubscriptionFeature.upsertOne","SubscriptionFeature.deleteOne","SubscriptionFeature.deleteMany","SubscriptionFeature.groupBy","SubscriptionFeature.aggregate","KitchenSubscription.findUnique","KitchenSubscription.findUniqueOrThrow","KitchenSubscription.findFirst","KitchenSubscription.findFirstOrThrow","KitchenSubscription.findMany","KitchenSubscription.createOne","KitchenSubscription.createMany","KitchenSubscription.updateOne","KitchenSubscription.updateMany","KitchenSubscription.upsertOne","KitchenSubscription.deleteOne","KitchenSubscription.deleteMany","KitchenSubscription.groupBy","KitchenSubscription.aggregate","Branch.findUnique","Branch.findUniqueOrThrow","Branch.findFirst","Branch.findFirstOrThrow","Branch.findMany","Branch.createOne","Branch.createMany","Branch.updateOne","Branch.updateMany","Branch.upsertOne","Branch.deleteOne","Branch.deleteMany","Branch.groupBy","Branch.aggregate","BranchCuisine.findUnique","BranchCuisine.findUniqueOrThrow","BranchCuisine.findFirst","BranchCuisine.findFirstOrThrow","BranchCuisine.findMany","BranchCuisine.createOne","BranchCuisine.createMany","BranchCuisine.updateOne","BranchCuisine.updateMany","BranchCuisine.upsertOne","BranchCuisine.deleteOne","BranchCuisine.deleteMany","BranchCuisine.groupBy","BranchCuisine.aggregate","UserBranchAccess.findUnique","UserBranchAccess.findUniqueOrThrow","UserBranchAccess.findFirst","UserBranchAccess.findFirstOrThrow","UserBranchAccess.findMany","UserBranchAccess.createOne","UserBranchAccess.createMany","UserBranchAccess.updateOne","UserBranchAccess.updateMany","UserBranchAccess.upsertOne","UserBranchAccess.deleteOne","UserBranchAccess.deleteMany","UserBranchAccess.groupBy","UserBranchAccess.aggregate","Integration.findUnique","Integration.findUniqueOrThrow","Integration.findFirst","Integration.findFirstOrThrow","Integration.findMany","Integration.createOne","Integration.createMany","Integration.updateOne","Integration.updateMany","Integration.upsertOne","Integration.deleteOne","Integration.deleteMany","Integration.groupBy","Integration.aggregate","MenuItem.findUnique","MenuItem.findUniqueOrThrow","MenuItem.findFirst","MenuItem.findFirstOrThrow","MenuItem.findMany","MenuItem.createOne","MenuItem.createMany","MenuItem.updateOne","MenuItem.updateMany","MenuItem.upsertOne","MenuItem.deleteOne","MenuItem.deleteMany","MenuItem.groupBy","MenuItem.aggregate","BranchIngredientInventory.findUnique","BranchIngredientInventory.findUniqueOrThrow","BranchIngredientInventory.findFirst","BranchIngredientInventory.findFirstOrThrow","BranchIngredientInventory.findMany","BranchIngredientInventory.createOne","BranchIngredientInventory.createMany","BranchIngredientInventory.updateOne","BranchIngredientInventory.updateMany","BranchIngredientInventory.upsertOne","BranchIngredientInventory.deleteOne","BranchIngredientInventory.deleteMany","BranchIngredientInventory.groupBy","BranchIngredientInventory.aggregate","InventoryStock.findUnique","InventoryStock.findUniqueOrThrow","InventoryStock.findFirst","InventoryStock.findFirstOrThrow","InventoryStock.findMany","InventoryStock.createOne","InventoryStock.createMany","InventoryStock.updateOne","InventoryStock.updateMany","InventoryStock.upsertOne","InventoryStock.deleteOne","InventoryStock.deleteMany","InventoryStock.groupBy","InventoryStock.aggregate","MenuItemIngredient.findUnique","MenuItemIngredient.findUniqueOrThrow","MenuItemIngredient.findFirst","MenuItemIngredient.findFirstOrThrow","MenuItemIngredient.findMany","MenuItemIngredient.createOne","MenuItemIngredient.createMany","MenuItemIngredient.updateOne","MenuItemIngredient.updateMany","MenuItemIngredient.upsertOne","MenuItemIngredient.deleteOne","MenuItemIngredient.deleteMany","MenuItemIngredient.groupBy","MenuItemIngredient.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.updateOne","Order.updateMany","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.updateOne","OrderItem.updateMany","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","AND","OR","NOT","id","orderId","menuItemId","quantity","price","equals","in","notIn","lt","lte","gt","gte","not","userId","branchId","OrderSource","source","totalAmount","OrderStatus","status","createdAt","updatedAt","inventoryItemId","quantityRequired","expiryDate","batchNumber","contains","startsWith","endsWith","search","kitchenId","ingredientId","Unit","unit","categoryId","subCategoryId","name","description","Status","IntegrationChannel","channel","credentials","IntegrationStatus","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","cuisineId","addressLine1","addressLine2","landmark","area","pincode","countryId","stateId","cityId","contactTitle","contactFirstName","contactLastName","contactEmail","contactPhone","subscriptionId","trialStartDate","trialEndDate","trialDays","planStartDate","planEndDate","BillingCycle","billingCycle","duration","pricePaid","originalPrice","discountPct","maxUsers","maxBranches","SubscriptionStatus","FeatureType","type","feature","title","annualPrice","freeTrialDays","every","some","none","roleId","permissionId","Panel","panel","module","Action","action","panel_module_action","ownerId","subject","htmlTemplate","smtpHost","smtpSecure","smtpPort","smtpUsername","smtpPassword","fromEmail","fromName","to","cc","bcc","variables","DocumentType","documentNumber","documentFile","parentId","rootId","profilePicture","firstName","lastName","kitchenName","email","phone","password","UserType","userType","resetPasswordToken","resetPasswordExpiresAt","isOnboardingCompleted","onboardingCompletedAt","iso2","iso3","phonecode","currency","currencyName","currencySymbol","nationality","image","userId_branchId","menuItemId_inventoryItemId","parentId_name","branchId_cuisineId","userId_name","ownerId_name","roleId_permissionId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","_relevance","increment","decrement","multiply","divide"]'),
  graph: "kQ7XAd4CCx4BANsFACExAACQBgAgmAMAAI8GADCZAwAAjQEAEJoDAACPBgAwmwMEAAAAAa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEAAAABoQQBANsFACEBAAAAAQAgDwcAAJoGACAYAACdBgAgIgAAsgYAIC8AANEGACAwAADSBgAgmAMAAM8GADCZAwAAAwAQmgMAAM8GADCbAwQA2QUAIakDBADZBQAhrwNAAOAFACGwA0AA4AUAIbkDBADZBQAhugMEANkFACG8AwAA0Aa8AyIFBwAAlQwAIBgAAJYMACAiAACeDAAgLwAAsgwAIDAAALMMACAPBwAAmgYAIBgAAJ0GACAiAACyBgAgLwAA0QYAIDAAANIGACCYAwAAzwYAMJkDAAADABCaAwAAzwYAMJsDBAAAAAGpAwQA2QUAIa8DQADgBQAhsANAAOAFACG5AwQA2QUAIboDBADZBQAhvAMAANAGvAMiAwAAAAMAIAEAAAQAMAIAAAUAICkDAADLBgAgBAAAwgYAIAUAAMsGACAGAADCBgAgCAAAzAYAIAsAAM0GACAQAADOBgAgFAAAiQYAIBwAALAGACAmAACQBgAgJwAAvQYAIC0AAOEFACAuAAC_BgAgmAMAAMkGADCZAwAABwAQmgMAAMkGADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACHVAwEA2wUAIdYDAQDbBQAh1wMBANsFACHYAwEA2wUAIdkDAQDbBQAh7AMBANsFACHyAwQArQYAIYsEBACtBgAhjAQEAK0GACGNBAEA2gUAIY4EAQDbBQAhjwQBANsFACGQBAEA2wUAIZEEAQDaBQAhkgQBANoFACGTBAEA2gUAIZUEAADKBpUEIpYEAQDbBQAhlwRAAJIGACGYBCAA-QUAIZkEQACSBgAhAQAAAAcAIB0DAACVDAAgBAAAqgwAIAUAAJUMACAGAACqDAAgCAAArwwAIAsAAKwMACAQAACwDAAgFAAAwAsAIBwAAJwMACAmAACPDAAgJwAApgwAIC0AAIwJACAuAACoDAAg1QMAAIIHACDWAwAAggcAINcDAACCBwAg2AMAAIIHACDZAwAAggcAIOwDAACCBwAg8gMAAIIHACCLBAAAggcAIIwEAACCBwAgjgQAAIIHACCPBAAAggcAIJAEAACCBwAglgQAAIIHACCXBAAAggcAIJkEAACCBwAgtAQAALEMACApAwAAywYAIAQAAMIGACAFAADLBgAgBgAAwgYAIAgAAMwGACALAADNBgAgEAAAzgYAIBQAAIkGACAcAACwBgAgJgAAkAYAICcAAL0GACAtAADhBQAgLgAAvwYAIJgDAADJBgAwmQMAAAcAEJoDAADJBgAwmwMEAAAAAa4DAADuBcIDIq8DQADgBQAhsANAAOAFACHVAwEA2wUAIdYDAQDbBQAh1wMBANsFACHYAwEA2wUAIdkDAQDbBQAh7AMBANsFACHyAwQArQYAIYsEBACtBgAhjAQEAK0GACGNBAEA2gUAIY4EAQDbBQAhjwQBANsFACGQBAEA2wUAIZEEAQAAAAGSBAEAAAABkwQBANoFACGVBAAAygaVBCKWBAEA2wUAIZcEQACSBgAhmAQgAPkFACGZBEAAkgYAIQMAAAAHACABAAAJADACAAAKACABAAAABwAgAwAAAAcAIAEAAAkAMAIAAAoAIAwHAACaBgAgmAMAAMcGADCZAwAADgAQmgMAAMcGADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG5AwQA2QUAIeoDAADIBokEIokEAQDbBQAhigQBANsFACEEBwAAlQwAIIkEAACCBwAgigQAAIIHACC0BAAArgwAIAwHAACaBgAgmAMAAMcGADCZAwAADgAQmgMAAMcGADCbAwQAAAABrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAh6gMAAMgGiQQiiQQBANsFACGKBAEA2wUAIQMAAAAOACABAAAPADACAAAQACAMCQAAmgYAIAoAAMIGACAPAADvBQAgmAMAAMEGADCZAwAAEgAQmgMAAMEGADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIfoDBADZBQAhAQAAABIAIAMAAAAHACABAAAJADACAAAKACAJCwAAxQYAIA4AAMYGACCYAwAAxAYAMJkDAAAVABCaAwAAxAYAMJsDBADZBQAhrwNAAOAFACHyAwQA2QUAIfMDBADZBQAhAgsAAKwMACAOAACtDAAgCgsAAMUGACAOAADGBgAgmAMAAMQGADCZAwAAFQAQmgMAAMQGADCbAwQAAAABrwNAAOAFACHyAwQA2QUAIfMDBADZBQAhqAQAAMMGACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAEAAAAVACABAAAABwAgAQAAABUAIAQJAACVDAAgCgAAqgwAIA8AAK0JACC0BAAAqwwAIA0JAACaBgAgCgAAwgYAIA8AAO8FACCYAwAAwQYAMJkDAAASABCaAwAAwQYAMJsDBAAAAAGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBANoFACH6AwQA2QUAIacEAADABgAgAwAAABIAIAEAAB0AMAIAAB4AICARAACaBgAgEgAAuAYAIBMAALcGACAXAAC8BgAgGQAAjQYAIBwAALAGACAmAACQBgAgJwAAvQYAICgAAL4GACApAAC_BgAgmAMAALsGADCZAwAAIAAQmgMAALsGADCbAwQA2QUAIagDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhzQMBANoFACHOAwEA2wUAIc8DAQDbBQAh0AMBANsFACHRAwEA2wUAIdIDBADZBQAh0wMEANkFACHUAwQA2QUAIdUDAQDaBQAh1gMBANoFACHXAwEA2wUAIdgDAQDaBQAh2QMBANoFACEQEQAAlQwAIBIAAKIMACATAAChDAAgFwAApQwAIBkAAP0LACAcAACcDAAgJgAAjwwAICcAAKYMACAoAACnDAAgKQAAqAwAIM4DAACCBwAgzwMAAIIHACDQAwAAggcAINEDAACCBwAg1wMAAIIHACC0BAAAqQwAICERAACaBgAgEgAAuAYAIBMAALcGACAXAAC8BgAgGQAAjQYAIBwAALAGACAmAACQBgAgJwAAvQYAICgAAL4GACApAAC_BgAgmAMAALsGADCZAwAAIAAQmgMAALsGADCbAwQAAAABqAMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBANoFACHNAwEA2gUAIc4DAQDbBQAhzwMBANsFACHQAwEA2wUAIdEDAQDbBQAh0gMEANkFACHTAwQA2QUAIdQDBADZBQAh1QMBANoFACHWAwEA2gUAIdcDAQDbBQAh2AMBANoFACHZAwEA2gUAIaYEAAC6BgAgAwAAACAAIAEAACEAMAIAACIAIAsSAAC4BgAgFAAAiQYAIBUAAIgGACCYAwAAuQYAMJkDAAAkABCaAwAAuQYAMJsDBADZBQAhvwMBANoFACHSAwQA2QUAIeoDAQDbBQAhmgQBANsFACEGEgAAogwAIBQAAMALACAVAAC_CwAg6gMAAIIHACCaBAAAggcAILQEAACkDAAgCxIAALgGACAUAACJBgAgFQAAiAYAIJgDAAC5BgAwmQMAACQAEJoDAAC5BgAwmwMEAAAAAb8DAQDaBQAh0gMEANkFACHqAwEA2wUAIZoEAQDbBQAhAwAAACQAIAEAACUAMAIAACYAIAoSAAC4BgAgEwAAtwYAIBQAAIkGACCYAwAAtgYAMJkDAAAoABCaAwAAtgYAMJsDBADZBQAhvwMBANoFACHSAwQA2QUAIdMDBADZBQAhBBIAAKIMACATAAChDAAgFAAAwAsAILQEAACjDAAgChIAALgGACATAAC3BgAgFAAAiQYAIJgDAAC2BgAwmQMAACgAEJoDAAC2BgAwmwMEAAAAAb8DAQDaBQAh0gMEANkFACHTAwQA2QUAIQMAAAAoACABAAApADACAAAqACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAACAAIAMAAAAgACABAAAhADACAAAiACABAAAAKAAgAQAAACAAIAMAAAAoACABAAApADACAAAqACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAACQAIAEAAAAoACABAAAAIAAgCRgAAJ0GACAaAAC1BgAgmAMAALQGADCZAwAANgAQmgMAALQGADCbAwQA2QUAIakDBADZBQAhrwNAAOAFACHMAwQA2QUAIQIYAACWDAAgGgAAoAwAIAoYAACdBgAgGgAAtQYAIJgDAAC0BgAwmQMAADYAEJoDAAC0BgAwmwMEAAAAAakDBADZBQAhrwNAAOAFACHMAwQA2QUAIaUEAACzBgAgAwAAADYAIAEAADcAMAIAADgAIAMAAAA2ACABAAA3ADACAAA4ACABAAAANgAgFAcAAJoGACAYAACdBgAgHgAArgYAIB8AAK4GACAiAACyBgAgJQAApQYAIJgDAACxBgAwmQMAADwAEJoDAACxBgAwmwMEANkFACGfAwgA3AUAIakDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAhvQMEAK0GACG-AwQArQYAIb8DAQDaBQAhwAMBANsFACEKBwAAlQwAIBgAAJYMACAeAACaDAAgHwAAmgwAICIAAJ4MACAlAACXDAAgvQMAAIIHACC-AwAAggcAIMADAACCBwAgtAQAAJ8MACAUBwAAmgYAIBgAAJ0GACAeAACuBgAgHwAArgYAICIAALIGACAlAAClBgAgmAMAALEGADCZAwAAPAAQmgMAALEGADCbAwQAAAABnwMIANwFACGpAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG5AwQA2QUAIb0DBACtBgAhvgMEAK0GACG_AwEA2gUAIcADAQDbBQAhAwAAADwAIAEAAD0AMAIAAD4AIA4DAACuBgAgGwAArwYAIBwAALAGACAdAACwBgAgmAMAAKwGADCZAwAAQAAQmgMAAKwGADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIYsEBACtBgAhoQQBANsFACEBAAAAQAAgAQAAAEAAIAcDAACaDAAgGwAAmwwAIBwAAJwMACAdAACcDAAgiwQAAIIHACChBAAAggcAILQEAACdDAAgDwMAAK4GACAbAACvBgAgHAAAsAYAIB0AALAGACCYAwAArAYAMJkDAABAABCaAwAArAYAMJsDBAAAAAGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBAAAAAYsEBACtBgAhoQQBANsFACGkBAAAqwYAIAMAAABAACABAABDADACAABEACADAAAAPAAgAQAAPQAwAgAAPgAgAwAAADwAIAEAAD0AMAIAAD4AIAEAAABAACABAAAAPAAgAQAAADwAIAEAAABAACALIAAAqAYAICEAAJMGACCYAwAAqgYAMJkDAABMABCaAwAAqgYAMJsDBADZBQAhnQMEANkFACGvA0AA4AUAIbADQADgBQAhsQMEANkFACGyAwgA3AUAIQIgAACZDAAgIQAAkQwAIAwgAACoBgAgIQAAkwYAIJgDAACqBgAwmQMAAEwAEJoDAACqBgAwmwMEAAAAAZ0DBADZBQAhrwNAAOAFACGwA0AA4AUAIbEDBADZBQAhsgMIANwFACGjBAAAqQYAIAMAAABMACABAABNADACAABOACAKIAAAqAYAICQAAKcGACCYAwAApgYAMJkDAABQABCaAwAApgYAMJsDBADZBQAhnAMEANkFACGdAwQA2QUAIZ4DAgDfBQAhnwMIANwFACECIAAAmQwAICQAAJgMACAKIAAAqAYAICQAAKcGACCYAwAApgYAMJkDAABQABCaAwAApgYAMJsDBAAAAAGcAwQA2QUAIZ0DBADZBQAhngMCAN8FACGfAwgA3AUAIQMAAABQACABAABRADACAABSACADAAAAUAAgAQAAUQAwAgAAUgAgAQAAAFAAIAEAAABMACABAAAAUAAgAwAAAAMAIAEAAAQAMAIAAAUAIA4RAACaBgAgGAAAnQYAICMAAKUGACCYAwAAogYAMJkDAABZABCaAwAAogYAMJsDBADZBQAhqAMEANkFACGpAwQA2QUAIasDAACjBqsDIqwDCADcBQAhrgMAAKQGrgMirwNAAOAFACGwA0AA4AUAIQMRAACVDAAgGAAAlgwAICMAAJcMACAOEQAAmgYAIBgAAJ0GACAjAAClBgAgmAMAAKIGADCZAwAAWQAQmgMAAKIGADCbAwQAAAABqAMEANkFACGpAwQA2QUAIasDAACjBqsDIqwDCADcBQAhrgMAAKQGrgMirwNAAOAFACGwA0AA4AUAIQMAAABZACABAABaADACAABbACALGAAAnQYAIJgDAACeBgAwmQMAAF0AEJoDAACeBgAwmwMEANkFACGpAwQA2QUAIa4DAAChBsYDIq8DQADgBQAhsANAAOAFACHDAwAAnwbDAyLEAwAAoAYAIAEYAACWDAAgCxgAAJ0GACCYAwAAngYAMJkDAABdABCaAwAAngYAMJsDBAAAAAGpAwQA2QUAIa4DAAChBsYDIq8DQADgBQAhsANAAOAFACHDAwAAnwbDAyLEAwAAoAYAIAMAAABdACABAABeADACAABfACAJEQAAmgYAIBgAAJ0GACCYAwAAnAYAMJkDAABhABCaAwAAnAYAMJsDBADZBQAhqAMEANkFACGpAwQA2QUAIa8DQADgBQAhAhEAAJUMACAYAACWDAAgChEAAJoGACAYAACdBgAgmAMAAJwGADCZAwAAYQAQmgMAAJwGADCbAwQAAAABqAMEANkFACGpAwQA2QUAIa8DQADgBQAhogQAAJsGACADAAAAYQAgAQAAYgAwAgAAYwAgAQAAADYAIAEAAAA8ACABAAAAAwAgAQAAAFkAIAEAAABdACABAAAAYQAgFwcAAJoGACArAACWBgAgmAMAAJcGADCZAwAAawAQmgMAAJcGADCbAwQA2QUAIa4DAACZBukDIq8DQADgBQAhsANAAOAFACG5AwQA2QUAIdoDBADZBQAh2wNAAJIGACHcA0AAkgYAId0DAgDeBQAh3gNAAJIGACHfA0AAkgYAIeEDAACYBuEDIuIDAgDfBQAh4wMIANwFACHkAwgA3QUAIeUDCADdBQAh5gMCAN8FACHnAwIA3wUAIQkHAACVDAAgKwAAkwwAINsDAACCBwAg3AMAAIIHACDdAwAAggcAIN4DAACCBwAg3wMAAIIHACDkAwAAggcAIOUDAACCBwAgFwcAAJoGACArAACWBgAgmAMAAJcGADCZAwAAawAQmgMAAJcGADCbAwQAAAABrgMAAJkG6QMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAh2gMEANkFACHbA0AAkgYAIdwDQACSBgAh3QMCAN4FACHeA0AAkgYAId8DQACSBgAh4QMAAJgG4QMi4gMCAN8FACHjAwgA3AUAIeQDCADdBQAh5QMIAN0FACHmAwIA3wUAIecDAgDfBQAhAwAAAGsAIAEAAGwAMAIAAG0AIAMAAABrACABAABsADACAABtACAJKwAAlgYAIJgDAACUBgAwmQMAAHAAEJoDAACUBgAwmwMEANkFACGvA0AA4AUAIdoDBADZBQAh6gMAAJUG6gMi6wMBANoFACECKwAAkwwAILQEAACUDAAgCSsAAJYGACCYAwAAlAYAMJkDAABwABCaAwAAlAYAMJsDBAAAAAGvA0AA4AUAIdoDBADZBQAh6gMAAJUG6gMi6wMBANoFACEDAAAAcAAgAQAAcQAwAgAAcgAgAQAAAGsAIAEAAABwACADAAAAPAAgAQAAPQAwAgAAPgAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAABZACABAABaADACAABbACADAAAAYQAgAQAAYgAwAgAAYwAgAQAAAAcAIAEAAAAHACABAAAADgAgAQAAABIAIAEAAAAgACABAAAAawAgAQAAADwAIAEAAAADACABAAAAWQAgAQAAAGEAIAohAACTBgAgmAMAAJEGADCZAwAAhAEAEJoDAACRBgAwmwMEANkFACGeAwgA3AUAIa8DQADgBQAhsQMEANkFACGzA0AAkgYAIbQDAQDbBQAhBCEAAJEMACCzAwAAggcAILQDAACCBwAgtAQAAJIMACAKIQAAkwYAIJgDAACRBgAwmQMAAIQBABCaAwAAkQYAMJsDBAAAAAGeAwgA3AUAIa8DQADgBQAhsQMEANkFACGzA0AAkgYAIbQDAQDbBQAhAwAAAIQBACABAACFAQAwAgAAhgEAIAMAAABMACABAABNADACAABOACABAAAAhAEAIAEAAABMACABAAAAAwAgAQAAAAEAIAseAQDbBQAhMQAAkAYAIJgDAACPBgAwmQMAAI0BABCaAwAAjwYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhoQQBANsFACEEHgAAggcAIDEAAI8MACChBAAAggcAILQEAACQDAAgAwAAAI0BACABAACOAQAwAgAAAQAgAwAAAI0BACABAACOAQAwAgAAAQAgAwAAAI0BACABAACOAQAwAgAAAQAgCB4BAAAAATEAAI4MACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAGhBAEAAAABATcAAJIBACAHHgEAAAABmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABoQQBAAAAAQE3AACUAQAwCB4BAIkHACExAACEDAAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACGhBAEAiQcAIQIAAAABACA3AACWAQAgBx4BAIkHACGbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhAgAAAI0BACA3AACYAQAgAwAAAAEAIDwAAJIBACA9AACWAQAgAQAAAAEAIAEAAACNAQAgBw0AAP8LACAeAACCBwAgQgAAgAwAIEMAAIMMACBEAACCDAAgRQAAgQwAIKEEAACCBwAgCh4BAKcFACGYAwAAjgYAMJkDAACeAQAQmgMAAI4GADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACG_AwEAswUAIaEEAQCnBQAhAwAAAI0BACABAACdAQAwQQAAngEAIAMAAACNAQAgAQAAjgEAMAIAAAEAIAoZAACNBgAgmAMAAIwGADCZAwAApAEAEJoDAACMBgAwmwMEAAAAAa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEAAAABoQQBANsFACEBAAAAoQEAIAEAAAChAQAgChkAAI0GACCYAwAAjAYAMJkDAACkAQAQmgMAAIwGADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIaEEAQDbBQAhAxkAAP0LACChBAAAggcAILQEAAD-CwAgAwAAAKQBACABAAClAQAwAgAAoQEAIAMAAACkAQAgAQAApQEAMAIAAKEBACADAAAApAEAIAEAAKUBADACAAChAQAgBxkAAPwLACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAGhBAEAAAABATcAAKkBACAGmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABoQQBAAAAAQE3AACrAQAwBxkAAPILACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhAgAAAKEBACA3AACtAQAgBpsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhoQQBAIkHACECAAAApAEAIDcAAK8BACADAAAAoQEAIDwAAKkBACA9AACtAQAgAQAAAKEBACABAAAApAEAIAYNAADtCwAgQgAA7gsAIEMAAPELACBEAADwCwAgRQAA7wsAIKEEAACCBwAgCZgDAACLBgAwmQMAALUBABCaAwAAiwYAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIb8DAQCzBQAhoQQBAKcFACEDAAAApAEAIAEAALQBADBBAAC1AQAgAwAAAKQBACABAAClAQAwAgAAoQEAIAEAAABEACABAAAARAAgAwAAAEAAIAEAAEMAMAIAAEQAIAMAAABAACABAABDADACAABEACADAAAAQAAgAQAAQwAwAgAARAAgCwMAAOwLACAbAADpCwAgHAAA6gsAIB0AAOsLACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAGLBAQAAAABoQQBAAAAAQE3AAC9AQAgB5sDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAYsEBAAAAAGhBAEAAAABATcAAL8BADALAwAAxwsAIBsAAMgLACAcAADJCwAgHQAAygsAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhiwQEALsHACGhBAEAiQcAIQIAAABEACA3AADBAQAgB5sDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhiwQEALsHACGhBAEAiQcAIQIAAABAACA3AADDAQAgAwAAAEQAIDwAAL0BACA9AADBAQAgAQAAAEQAIAEAAABAACAHDQAAwgsAIEIAAMMLACBDAADGCwAgRAAAxQsAIEUAAMQLACCLBAAAggcAIKEEAACCBwAgCpgDAACKBgAwmQMAAMkBABCaAwAAigYAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIb8DAQCzBQAhiwQEALIFACGhBAEApwUAIQMAAABAACABAADIAQAwQQAAyQEAIAMAAABAACABAABDADACAABEACAPFAAAiQYAIBUAAIgGACAWAACHBgAgmAMAAIYGADCZAwAAzwEAEJoDAACGBgAwmwMEAAAAAb8DAQDaBQAhmgQBANsFACGbBAEA2wUAIZwEAQDbBQAhnQQBANsFACGeBAEA2wUAIZ8EAQDbBQAhoAQBANsFACEBAAAAzAEAIAEAAADMAQAgDxQAAIkGACAVAACIBgAgFgAAhwYAIJgDAACGBgAwmQMAAM8BABCaAwAAhgYAMJsDBADZBQAhvwMBANoFACGaBAEA2wUAIZsEAQDbBQAhnAQBANsFACGdBAEA2wUAIZ4EAQDbBQAhnwQBANsFACGgBAEA2wUAIQsUAADACwAgFQAAvwsAIBYAAL4LACCaBAAAggcAIJsEAACCBwAgnAQAAIIHACCdBAAAggcAIJ4EAACCBwAgnwQAAIIHACCgBAAAggcAILQEAADBCwAgAwAAAM8BACABAADQAQAwAgAAzAEAIAMAAADPAQAgAQAA0AEAMAIAAMwBACADAAAAzwEAIAEAANABADACAADMAQAgDBQAAL0LACAVAAC8CwAgFgAAuwsAIJsDBAAAAAG_AwEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBAEAAAABoAQBAAAAAQE3AADUAQAgCZsDBAAAAAG_AwEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBAEAAAABoAQBAAAAAQE3AADWAQAwDBQAAJwLACAVAACbCwAgFgAAmgsAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQIAAADMAQAgNwAA2AEAIAmbAwQA2AYAIb8DAQC5BwAhmgQBAIkHACGbBAEAiQcAIZwEAQCJBwAhnQQBAIkHACGeBAEAiQcAIZ8EAQCJBwAhoAQBAIkHACECAAAAzwEAIDcAANoBACADAAAAzAEAIDwAANQBACA9AADYAQAgAQAAAMwBACABAAAAzwEAIAwNAACVCwAgQgAAlgsAIEMAAJkLACBEAACYCwAgRQAAlwsAIJoEAACCBwAgmwQAAIIHACCcBAAAggcAIJ0EAACCBwAgngQAAIIHACCfBAAAggcAIKAEAACCBwAgDJgDAACFBgAwmQMAAOABABCaAwAAhQYAMJsDBACRBQAhvwMBALMFACGaBAEApwUAIZsEAQCnBQAhnAQBAKcFACGdBAEApwUAIZ4EAQCnBQAhnwQBAKcFACGgBAEApwUAIQMAAADPAQAgAQAA3wEAMEEAAOABACADAAAAzwEAIAEAANABADACAADMAQAgAQAAACYAIAEAAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIAMAAAAkACABAAAlADACAAAmACAIEgAAkgsAIBQAAJQLACAVAACTCwAgmwMEAAAAAb8DAQAAAAHSAwQAAAAB6gMBAAAAAZoEAQAAAAEBNwAA6AEAIAWbAwQAAAABvwMBAAAAAdIDBAAAAAHqAwEAAAABmgQBAAAAAQE3AADqAQAwCBIAAPoKACAUAAD8CgAgFQAA-woAIJsDBADYBgAhvwMBALkHACHSAwQA2AYAIeoDAQCJBwAhmgQBAIkHACECAAAAJgAgNwAA7AEAIAWbAwQA2AYAIb8DAQC5BwAh0gMEANgGACHqAwEAiQcAIZoEAQCJBwAhAgAAACQAIDcAAO4BACADAAAAJgAgPAAA6AEAID0AAOwBACABAAAAJgAgAQAAACQAIAcNAAD1CgAgQgAA9goAIEMAAPkKACBEAAD4CgAgRQAA9woAIOoDAACCBwAgmgQAAIIHACAImAMAAIQGADCZAwAA9AEAEJoDAACEBgAwmwMEAJEFACG_AwEAswUAIdIDBACRBQAh6gMBAKcFACGaBAEApwUAIQMAAAAkACABAADzAQAwQQAA9AEAIAMAAAAkACABAAAlADACAAAmACABAAAAKgAgAQAAACoAIAMAAAAoACABAAApADACAAAqACADAAAAKAAgAQAAKQAwAgAAKgAgAwAAACgAIAEAACkAMAIAACoAIAcSAADzCgAgEwAA8goAIBQAAPQKACCbAwQAAAABvwMBAAAAAdIDBAAAAAHTAwQAAAABATcAAPwBACAEmwMEAAAAAb8DAQAAAAHSAwQAAAAB0wMEAAAAAQE3AAD-AQAwBxIAAOcKACATAADmCgAgFAAA6AoAIJsDBADYBgAhvwMBALkHACHSAwQA2AYAIdMDBADYBgAhAgAAACoAIDcAAIACACAEmwMEANgGACG_AwEAuQcAIdIDBADYBgAh0wMEANgGACECAAAAKAAgNwAAggIAIAMAAAAqACA8AAD8AQAgPQAAgAIAIAEAAAAqACABAAAAKAAgBQ0AAOEKACBCAADiCgAgQwAA5QoAIEQAAOQKACBFAADjCgAgB5gDAACDBgAwmQMAAIgCABCaAwAAgwYAMJsDBACRBQAhvwMBALMFACHSAwQAkQUAIdMDBACRBQAhAwAAACgAIAEAAIcCADBBAACIAgAgAwAAACgAIAEAACkAMAIAACoAIAEAAAAKACABAAAACgAgAwAAAAcAIAEAAAkAMAIAAAoAIAMAAAAHACABAAAJADACAAAKACADAAAABwAgAQAACQAwAgAACgAgJgMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBAAALwKACAUAAC9CgAgHAAAvwoAICYAAMAKACAnAADBCgAgLQAAvgoAIC4AAMIKACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB7AMBAAAAAfIDBAAAAAGLBAQAAAABjAQEAAAAAY0EAQAAAAGOBAEAAAABjwQBAAAAAZAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAQAAAAGVBAAAAJUEApYEAQAAAAGXBEAAAAABmAQgAAAAAZkEQAAAAAEBNwAAkAIAIBmbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB7AMBAAAAAfIDBAAAAAGLBAQAAAABjAQEAAAAAY0EAQAAAAGOBAEAAAABjwQBAAAAAZAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAQAAAAGVBAAAAJUEApYEAQAAAAGXBEAAAAABmAQgAAAAAZkEQAAAAAEBNwAAkgIAMCYDAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgFAAA0wkAIBwAANUJACAmAADWCQAgJwAA1wkAIC0AANQJACAuAADYCQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAIQIAAAAKACA3AACUAgAgGZsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIdUDAQCJBwAh1gMBAIkHACHXAwEAiQcAIdgDAQCJBwAh2QMBAIkHACHsAwEAiQcAIfIDBAC7BwAhiwQEALsHACGMBAQAuwcAIY0EAQC5BwAhjgQBAIkHACGPBAEAiQcAIZAEAQCJBwAhkQQBALkHACGSBAEAuQcAIZMEAQC5BwAhlQQAAMoJlQQilgQBAIkHACGXBEAAiAcAIZgEIADLCQAhmQRAAIgHACECAAAABwAgNwAAlgIAIAMAAAAKACA8AACQAgAgPQAAlAIAIAEAAAAKACABAAAABwAgFA0AANwKACBCAADdCgAgQwAA4AoAIEQAAN8KACBFAADeCgAg1QMAAIIHACDWAwAAggcAINcDAACCBwAg2AMAAIIHACDZAwAAggcAIOwDAACCBwAg8gMAAIIHACCLBAAAggcAIIwEAACCBwAgjgQAAIIHACCPBAAAggcAIJAEAACCBwAglgQAAIIHACCXBAAAggcAIJkEAACCBwAgHJgDAAD_BQAwmQMAAJwCABCaAwAA_wUAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIdUDAQCnBQAh1gMBAKcFACHXAwEApwUAIdgDAQCnBQAh2QMBAKcFACHsAwEApwUAIfIDBACyBQAhiwQEALIFACGMBAQAsgUAIY0EAQCzBQAhjgQBAKcFACGPBAEApwUAIZAEAQCnBQAhkQQBALMFACGSBAEAswUAIZMEAQCzBQAhlQQAAIAGlQQilgQBAKcFACGXBEAApgUAIZgEIADzBQAhmQRAAKYFACEDAAAABwAgAQAAmwIAMEEAAJwCACADAAAABwAgAQAACQAwAgAACgAgAQAAABAAIAEAAAAQACADAAAADgAgAQAADwAwAgAAEAAgAwAAAA4AIAEAAA8AMAIAABAAIAMAAAAOACABAAAPADACAAAQACAJBwAA2woAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABuQMEAAAAAeoDAAAAiQQCiQQBAAAAAYoEAQAAAAEBNwAApAIAIAibAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAbkDBAAAAAHqAwAAAIkEAokEAQAAAAGKBAEAAAABATcAAKYCADAJBwAA2goAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAh6gMAAKoKiQQiiQQBAIkHACGKBAEAiQcAIQIAAAAQACA3AACoAgAgCJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAh6gMAAKoKiQQiiQQBAIkHACGKBAEAiQcAIQIAAAAOACA3AACqAgAgAwAAABAAIDwAAKQCACA9AACoAgAgAQAAABAAIAEAAAAOACAHDQAA1QoAIEIAANYKACBDAADZCgAgRAAA2AoAIEUAANcKACCJBAAAggcAIIoEAACCBwAgC5gDAAD7BQAwmQMAALACABCaAwAA-wUAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIbkDBACRBQAh6gMAAPwFiQQiiQQBAKcFACGKBAEApwUAIQMAAAAOACABAACvAgAwQQAAsAIAIAMAAAAOACABAAAPADACAAAQACAXmAMAAPgFADCZAwAAtgIAEJoDAAD4BQAwmwMEAAAAAa4DAADuBcIDIq8DQADgBQAhsANAAOAFACH1AwEA2gUAIfYDAQDaBQAh-AMBANoFACH7AwEA2gUAIfwDAQDbBQAh_QMBANoFACH-AyAA-QUAIf8DAgDfBQAhgAQBANoFACGBBAEA2gUAIYIEAQDaBQAhgwQBANoFACGEBAAA-gUAIIUEAAD6BQAghgQAAPoFACCHBAAA-gUAIAEAAACzAgAgAQAAALMCACAXmAMAAPgFADCZAwAAtgIAEJoDAAD4BQAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh9QMBANoFACH2AwEA2gUAIfgDAQDaBQAh-wMBANoFACH8AwEA2wUAIf0DAQDaBQAh_gMgAPkFACH_AwIA3wUAIYAEAQDaBQAhgQQBANoFACGCBAEA2gUAIYMEAQDaBQAhhAQAAPoFACCFBAAA-gUAIIYEAAD6BQAghwQAAPoFACAG_AMAAIIHACCEBAAAggcAIIUEAACCBwAghgQAAIIHACCHBAAAggcAILQEAADUCgAgAwAAALYCACABAAC3AgAwAgAAswIAIAMAAAC2AgAgAQAAtwIAMAIAALMCACADAAAAtgIAIAEAALcCADACAACzAgAgFJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB9QMBAAAAAfYDAQAAAAH4AwEAAAAB-wMBAAAAAfwDAQAAAAH9AwEAAAAB_gMgAAAAAf8DAgAAAAGABAEAAAABgQQBAAAAAYIEAQAAAAGDBAEAAAABhASAAAAAAYUEgAAAAAGGBIAAAAABhwSAAAAAAQE3AAC7AgAgFJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB9QMBAAAAAfYDAQAAAAH4AwEAAAAB-wMBAAAAAfwDAQAAAAH9AwEAAAAB_gMgAAAAAf8DAgAAAAGABAEAAAABgQQBAAAAAYIEAQAAAAGDBAEAAAABhASAAAAAAYUEgAAAAAGGBIAAAAABhwSAAAAAAQE3AAC9AgAwFJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIfUDAQC5BwAh9gMBALkHACH4AwEAuQcAIfsDAQC5BwAh_AMBAIkHACH9AwEAuQcAIf4DIADLCQAh_wMCANkGACGABAEAuQcAIYEEAQC5BwAhggQBALkHACGDBAEAuQcAIYQEgAAAAAGFBIAAAAABhgSAAAAAAYcEgAAAAAECAAAAswIAIDcAAL8CACAUmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh9QMBALkHACH2AwEAuQcAIfgDAQC5BwAh-wMBALkHACH8AwEAiQcAIf0DAQC5BwAh_gMgAMsJACH_AwIA2QYAIYAEAQC5BwAhgQQBALkHACGCBAEAuQcAIYMEAQC5BwAhhASAAAAAAYUEgAAAAAGGBIAAAAABhwSAAAAAAQIAAAC2AgAgNwAAwQIAIAMAAACzAgAgPAAAuwIAID0AAL8CACABAAAAswIAIAEAAAC2AgAgCg0AAM8KACBCAADQCgAgQwAA0woAIEQAANIKACBFAADRCgAg_AMAAIIHACCEBAAAggcAIIUEAACCBwAghgQAAIIHACCHBAAAggcAIBeYAwAA8gUAMJkDAADHAgAQmgMAAPIFADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACH1AwEAswUAIfYDAQCzBQAh-AMBALMFACH7AwEAswUAIfwDAQCnBQAh_QMBALMFACH-AyAA8wUAIf8DAgCSBQAhgAQBALMFACGBBAEAswUAIYIEAQCzBQAhgwQBALMFACGEBAAA9AUAIIUEAAD0BQAghgQAAPQFACCHBAAA9AUAIAMAAAC2AgAgAQAAxgIAMEEAAMcCACADAAAAtgIAIAEAALcCADACAACzAgAgAQAAAB4AIAEAAAAeACADAAAAEgAgAQAAHQAwAgAAHgAgAwAAABIAIAEAAB0AMAIAAB4AIAMAAAASACABAAAdADACAAAeACAJCQAAzgoAIAoAAJ4KACAPAACfCgAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAAB-gMEAAAAAQE3AADPAgAgBpsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAfoDBAAAAAEBNwAA0QIAMAkJAAC0CQAgCgAAtQkAIA8AALYJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIfoDBADYBgAhAgAAAB4AIDcAANMCACAGmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACH6AwQA2AYAIQIAAAASACA3AADVAgAgAwAAAB4AIDwAAM8CACA9AADTAgAgAQAAAB4AIAEAAAASACAFDQAArwkAIEIAALAJACBDAACzCQAgRAAAsgkAIEUAALEJACAJmAMAAPEFADCZAwAA2wIAEJoDAADxBQAwmwMEAJEFACGuAwAAtAXCAyKvA0AAnQUAIbADQACdBQAhvwMBALMFACH6AwQAkQUAIQMAAAASACABAADaAgAwQQAA2wIAIAMAAAASACABAAAdADACAAAeACAMDAAA7wUAIJgDAADrBQAwmQMAAOECABCaAwAA6wUAMJsDBAAAAAGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh9QMAAOwF9QMi9gMBANoFACH4AwAA7QX4AyL5AwAA8AUAIAEAAADeAgAgAQAAAN4CACALDAAA7wUAIJgDAADrBQAwmQMAAOECABCaAwAA6wUAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIfUDAADsBfUDIvYDAQDaBQAh-AMAAO0F-AMiAgwAAK0JACC0BAAArgkAIAMAAADhAgAgAQAA4gIAMAIAAN4CACADAAAA4QIAIAEAAOICADACAADeAgAgAwAAAOECACABAADiAgAwAgAA3gIAIAgMAACsCQAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAH1AwAAAPUDAvYDAQAAAAH4AwAAAPgDAgE3AADmAgAgB5sDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB9QMAAAD1AwL2AwEAAAAB-AMAAAD4AwIBNwAA6AIAMAgMAACfCQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh9QMAAJ0J9QMi9gMBALkHACH4AwAAngn4AyICAAAA3gIAIDcAAOoCACAHmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh9QMAAJ0J9QMi9gMBALkHACH4AwAAngn4AyICAAAA4QIAIDcAAOwCACADAAAA3gIAIDwAAOYCACA9AADqAgAgAQAAAN4CACABAAAA4QIAIAUNAACYCQAgQgAAmQkAIEMAAJwJACBEAACbCQAgRQAAmgkAIAqYAwAA5AUAMJkDAADyAgAQmgMAAOQFADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACH1AwAA5QX1AyL2AwEAswUAIfgDAADmBfgDIgMAAADhAgAgAQAA8QIAMEEAAPICACADAAAA4QIAIAEAAOICADACAADeAgAgAQAAABcAIAEAAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACAGCwAAlgkAIA4AAJcJACCbAwQAAAABrwNAAAAAAfIDBAAAAAHzAwQAAAABATcAAPoCACAEmwMEAAAAAa8DQAAAAAHyAwQAAAAB8wMEAAAAAQE3AAD8AgAwBgsAAJQJACAOAACVCQAgmwMEANgGACGvA0AA5gYAIfIDBADYBgAh8wMEANgGACECAAAAFwAgNwAA_gIAIASbAwQA2AYAIa8DQADmBgAh8gMEANgGACHzAwQA2AYAIQIAAAAVACA3AACAAwAgAwAAABcAIDwAAPoCACA9AAD-AgAgAQAAABcAIAEAAAAVACAFDQAAjwkAIEIAAJAJACBDAACTCQAgRAAAkgkAIEUAAJEJACAHmAMAAOMFADCZAwAAhgMAEJoDAADjBQAwmwMEAJEFACGvA0AAnQUAIfIDBACRBQAh8wMEAJEFACEDAAAAFQAgAQAAhQMAMEEAAIYDACADAAAAFQAgAQAAFgAwAgAAFwAgECoAAOEFACAsAADiBQAgmAMAANgFADCZAwAAjAMAEJoDAADYBQAwmwMEAAAAAZ8DCADcBQAhrwNAAOAFACGwA0AA4AUAIb8DAQDaBQAh5QMIAN0FACHmAwIA3wUAIecDAgDfBQAh7AMBANsFACHtAwgA3QUAIe4DAgDeBQAhAQAAAIkDACABAAAAiQMAIBAqAADhBQAgLAAA4gUAIJgDAADYBQAwmQMAAIwDABCaAwAA2AUAMJsDBADZBQAhnwMIANwFACGvA0AA4AUAIbADQADgBQAhvwMBANoFACHlAwgA3QUAIeYDAgDfBQAh5wMCAN8FACHsAwEA2wUAIe0DCADdBQAh7gMCAN4FACEHKgAAjAkAICwAAI0JACDlAwAAggcAIOwDAACCBwAg7QMAAIIHACDuAwAAggcAILQEAACOCQAgAwAAAIwDACABAACNAwAwAgAAiQMAIAMAAACMAwAgAQAAjQMAMAIAAIkDACADAAAAjAMAIAEAAI0DADACAACJAwAgDSoAAIoJACAsAACLCQAgmwMEAAAAAZ8DCAAAAAGvA0AAAAABsANAAAAAAb8DAQAAAAHlAwgAAAAB5gMCAAAAAecDAgAAAAHsAwEAAAAB7QMIAAAAAe4DAgAAAAEBNwAAkQMAIAubAwQAAAABnwMIAAAAAa8DQAAAAAGwA0AAAAABvwMBAAAAAeUDCAAAAAHmAwIAAAAB5wMCAAAAAewDAQAAAAHtAwgAAAAB7gMCAAAAAQE3AACTAwAwDSoAAPAIACAsAADxCAAgmwMEANgGACGfAwgA2gYAIa8DQADmBgAhsANAAOYGACG_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_AwAgAwAAAG0AIDwAALkDACA9AAC9AwAgAQAAAG0AIAEAAABrACAMDQAA1ggAIEIAANcIACBDAADaCAAgRAAA2QgAIEUAANgIACDbAwAAggcAINwDAACCBwAg3QMAAIIHACDeAwAAggcAIN8DAACCBwAg5AMAAIIHACDlAwAAggcAIBWYAwAAyAUAMJkDAADFAwAQmgMAAMgFADCbAwQAkQUAIa4DAADMBekDIq8DQACdBQAhsANAAJ0FACG5AwQAkQUAIdoDBACRBQAh2wNAAKYFACHcA0AApgUAId0DAgDJBQAh3gNAAKYFACHfA0AApgUAIeEDAADKBeEDIuIDAgCSBQAh4wMIAJMFACHkAwgAywUAIeUDCADLBQAh5gMCAJIFACHnAwIAkgUAIQMAAABrACABAADEAwAwQQAAxQMAIAMAAABrACABAABsADACAABtACABAAAAIgAgAQAAACIAIAMAAAAgACABAAAhADACAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIB0RAADMCAAgEgAAzQgAIBMAAM4IACAXAADPCAAgGQAA0AgAIBwAANEIACAmAADSCAAgJwAA0wgAICgAANQIACApAADVCAAgmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdMDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAEBNwAAzQMAIBObAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQE3AADPAwAwHREAAPoHACASAAD7BwAgEwAA_AcAIBcAAP0HACAZAAD-BwAgHAAA_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AQCJBwAhAgAAAIYBACA3AADJBAAgBpsDBADYBgAhngMIANoGACGvA0AA5gYAIbEDBADYBgAhswNAAIgHACG0AwEAiQcAIQIAAACEAQAgNwAAywQAIAMAAACGAQAgPAAAxQQAID0AAMkEACABAAAAhgEAIAEAAACEAQAgBw0AAIMHACBCAACEBwAgQwAAhwcAIEQAAIYHACBFAACFBwAgswMAAIIHACC0AwAAggcAIAmYAwAApQUAMJkDAADRBAAQmgMAAKUFADCbAwQAkQUAIZ4DCACTBQAhrwNAAJ0FACGxAwQAkQUAIbMDQACmBQAhtAMBAKcFACEDAAAAhAEAIAEAANAEADBBAADRBAAgAwAAAIQBACABAACFAQAwAgAAhgEAIAEAAABOACABAAAATgAgAwAAAEwAIAEAAE0AMAIAAE4AIAMAAABMACABAABNADACAABOACADAAAATAAgAQAATQAwAgAATgAgCCAAAIAHACAhAACBBwAgmwMEAAAAAZ0DBAAAAAGvA0AAAAABsANAAAAAAbEDBAAAAAGyAwgAAAABATcAANkEACAGmwMEAAAAAZ0DBAAAAAGvA0AAAAABsANAAAAAAbEDBAAAAAGyAwgAAAABATcAANsEADAIIAAA_gYAICEAAP8GACCbAwQA2AYAIZ0DBADYBgAhrwNAAOYGACGwA0AA5gYAIbEDBADYBgAhsgMIANoGACECAAAATgAgNwAA3QQAIAabAwQA2AYAIZ0DBADYBgAhrwNAAOYGACGwA0AA5gYAIbEDBADYBgAhsgMIANoGACECAAAATAAgNwAA3wQAIAMAAABOACA8AADZBAAgPQAA3QQAIAEAAABOACABAAAATAAgBQ0AAPkGACBCAAD6BgAgQwAA_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_AwEAswUAIeUDCADLBQAh5gMCAJIFACHnAwIAkgUAIewDAQCnBQAh7QMIAMsFACHuAwIAyQUAIRAqAADhBQAgLAAA4gUAIJgDAADYBQAwmQMAAIwDABCaAwAA2AUAMJsDBADZBQAhnwMIANwFACGvA0AA4AUAIbADQADgBQAhvwMBANoFACHlAwgA3QUAIeYDAgDfBQAh5wMCAN8FACHsAwEA2wUAIe0DCADdBQAh7gMCAN4FACEIoAMEAAAAAaEDBAAAAASiAwQAAAAEowMEAAAAAaQDBAAAAAGlAwQAAAABpgMEAAAAAacDBACZBQAhDKADAQAAAAGhAwEAAAAEogMBAAAABKMDAQAAAAGkAwEAAAABpQMBAAAAAaYDAQAAAAGnAwEAuAUAIbUDAQAAAAG2AwEAAAABtwMBAAAAAbgDAQAAAAEMoAMBAAAAAaEDAQAAAAWiAwEAAAAFowMBAAAAAaQDAQAAAAGlAwEAAAABpgMBAAAAAacDAQCqBQAhtQMBAAAAAbYDAQAAAAG3AwEAAAABuAMBAAAAAQigAwgAAAABoQMIAAAABKIDCAAAAASjAwgAAAABpAMIAAAAAaUDCAAAAAGmAwgAAAABpwMIAJYFACEIoAMIAAAAAaEDCAAAAAWiAwgAAAAFowMIAAAAAaQDCAAAAAGlAwgAAAABpgMIAAAAAacDCAC6BQAhCKADAgAAAAGhAwIAAAAFogMCAAAABaMDAgAAAAGkAwIAAAABpQMCAAAAAaYDAgAAAAGnAwIAqQUAIQigAwIAAAABoQMCAAAABKIDAgAAAASjAwIAAAABpAMCAAAAAaUDAgAAAAGmAwIAAAABpwMCAJUFACEIoANAAAAAAaEDQAAAAASiA0AAAAAEowNAAAAAAaQDQAAAAAGlA0AAAAABpgNAAAAAAacDQACfBQAhA-8DAABrACDwAwAAawAg8QMAAGsAIAPvAwAAcAAg8AMAAHAAIPEDAABwACAHmAMAAOMFADCZAwAAhgMAEJoDAADjBQAwmwMEAJEFACGvA0AAnQUAIfIDBACRBQAh8wMEAJEFACEKmAMAAOQFADCZAwAA8gIAEJoDAADkBQAwmwMEAJEFACGuAwAAtAXCAyKvA0AAnQUAIbADQACdBQAh9QMAAOUF9QMi9gMBALMFACH4AwAA5gX4AyIHDQAAlQUAIEQAAOoFACBFAADqBQAgoAMAAAD1AwKhAwAAAPUDCKIDAAAA9QMIpwMAAOkF9QMiBw0AAJUFACBEAADoBQAgRQAA6AUAIKADAAAA-AMCoQMAAAD4AwiiAwAAAPgDCKcDAADnBfgDIgcNAACVBQAgRAAA6AUAIEUAAOgFACCgAwAAAPgDAqEDAAAA-AMIogMAAAD4AwinAwAA5wX4AyIEoAMAAAD4AwKhAwAAAPgDCKIDAAAA-AMIpwMAAOgF-AMiBw0AAJUFACBEAADqBQAgRQAA6gUAIKADAAAA9QMCoQMAAAD1AwiiAwAAAPUDCKcDAADpBfUDIgSgAwAAAPUDAqEDAAAA9QMIogMAAAD1AwinAwAA6gX1AyILDAAA7wUAIJgDAADrBQAwmQMAAOECABCaAwAA6wUAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIfUDAADsBfUDIvYDAQDaBQAh-AMAAO0F-AMiBKADAAAA9QMCoQMAAAD1AwiiAwAAAPUDCKcDAADqBfUDIgSgAwAAAPgDAqEDAAAA-AMIogMAAAD4AwinAwAA6AX4AyIEoAMAAADCAwKhAwAAAMIDCKIDAAAAwgMIpwMAALYFwgMiA-8DAAAVACDwAwAAFQAg8QMAABUAIAP1AwAAAPUDAvYDAQAAAAH4AwAAAPgDAgmYAwAA8QUAMJkDAADbAgAQmgMAAPEFADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACG_AwEAswUAIfoDBACRBQAhF5gDAADyBQAwmQMAAMcCABCaAwAA8gUAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIfUDAQCzBQAh9gMBALMFACH4AwEAswUAIfsDAQCzBQAh_AMBAKcFACH9AwEAswUAIf4DIADzBQAh_wMCAJIFACGABAEAswUAIYEEAQCzBQAhggQBALMFACGDBAEAswUAIYQEAAD0BQAghQQAAPQFACCGBAAA9AUAIIcEAAD0BQAgBQ0AAJUFACBEAAD3BQAgRQAA9wUAIKADIAAAAAGnAyAA9gUAIQ8NAACpBQAgRAAA9QUAIEUAAPUFACCgA4AAAAABowOAAAAAAaQDgAAAAAGlA4AAAAABpgOAAAAAAacDgAAAAAHGAwEAAAABxwMBAAAAAcgDAQAAAAHJA4AAAAABygOAAAAAAcsDgAAAAAEMoAOAAAAAAaMDgAAAAAGkA4AAAAABpQOAAAAAAaYDgAAAAAGnA4AAAAABxgMBAAAAAccDAQAAAAHIAwEAAAAByQOAAAAAAcoDgAAAAAHLA4AAAAABBQ0AAJUFACBEAAD3BQAgRQAA9wUAIKADIAAAAAGnAyAA9gUAIQKgAyAAAAABpwMgAPcFACEXmAMAAPgFADCZAwAAtgIAEJoDAAD4BQAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh9QMBANoFACH2AwEA2gUAIfgDAQDaBQAh-wMBANoFACH8AwEA2wUAIf0DAQDaBQAh_gMgAPkFACH_AwIA3wUAIYAEAQDaBQAhgQQBANoFACGCBAEA2gUAIYMEAQDaBQAhhAQAAPoFACCFBAAA-gUAIIYEAAD6BQAghwQAAPoFACACoAMgAAAAAacDIAD3BQAhDKADgAAAAAGjA4AAAAABpAOAAAAAAaUDgAAAAAGmA4AAAAABpwOAAAAAAcYDAQAAAAHHAwEAAAAByAMBAAAAAckDgAAAAAHKA4AAAAABywOAAAAAAQuYAwAA-wUAMJkDAACwAgAQmgMAAPsFADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACG5AwQAkQUAIeoDAAD8BYkEIokEAQCnBQAhigQBAKcFACEHDQAAlQUAIEQAAP4FACBFAAD-BQAgoAMAAACJBAKhAwAAAIkECKIDAAAAiQQIpwMAAP0FiQQiBw0AAJUFACBEAAD-BQAgRQAA_gUAIKADAAAAiQQCoQMAAACJBAiiAwAAAIkECKcDAAD9BYkEIgSgAwAAAIkEAqEDAAAAiQQIogMAAACJBAinAwAA_gWJBCIcmAMAAP8FADCZAwAAnAIAEJoDAAD_BQAwmwMEAJEFACGuAwAAtAXCAyKvA0AAnQUAIbADQACdBQAh1QMBAKcFACHWAwEApwUAIdcDAQCnBQAh2AMBAKcFACHZAwEApwUAIewDAQCnBQAh8gMEALIFACGLBAQAsgUAIYwEBACyBQAhjQQBALMFACGOBAEApwUAIY8EAQCnBQAhkAQBAKcFACGRBAEAswUAIZIEAQCzBQAhkwQBALMFACGVBAAAgAaVBCKWBAEApwUAIZcEQACmBQAhmAQgAPMFACGZBEAApgUAIQcNAACVBQAgRAAAggYAIEUAAIIGACCgAwAAAJUEAqEDAAAAlQQIogMAAACVBAinAwAAgQaVBCIHDQAAlQUAIEQAAIIGACBFAACCBgAgoAMAAACVBAKhAwAAAJUECKIDAAAAlQQIpwMAAIEGlQQiBKADAAAAlQQCoQMAAACVBAiiAwAAAJUECKcDAACCBpUEIgeYAwAAgwYAMJkDAACIAgAQmgMAAIMGADCbAwQAkQUAIb8DAQCzBQAh0gMEAJEFACHTAwQAkQUAIQiYAwAAhAYAMJkDAAD0AQAQmgMAAIQGADCbAwQAkQUAIb8DAQCzBQAh0gMEAJEFACHqAwEApwUAIZoEAQCnBQAhDJgDAACFBgAwmQMAAOABABCaAwAAhQYAMJsDBACRBQAhvwMBALMFACGaBAEApwUAIZsEAQCnBQAhnAQBAKcFACGdBAEApwUAIZ4EAQCnBQAhnwQBAKcFACGgBAEApwUAIQ8UAACJBgAgFQAAiAYAIBYAAIcGACCYAwAAhgYAMJkDAADPAQAQmgMAAIYGADCbAwQA2QUAIb8DAQDaBQAhmgQBANsFACGbBAEA2wUAIZwEAQDbBQAhnQQBANsFACGeBAEA2wUAIZ8EAQDbBQAhoAQBANsFACED7wMAACQAIPADAAAkACDxAwAAJAAgA-8DAAAoACDwAwAAKAAg8QMAACgAIAPvAwAAIAAg8AMAACAAIPEDAAAgACAKmAMAAIoGADCZAwAAyQEAEJoDAACKBgAwmwMEAJEFACGuAwAAtAXCAyKvA0AAnQUAIbADQACdBQAhvwMBALMFACGLBAQAsgUAIaEEAQCnBQAhCZgDAACLBgAwmQMAALUBABCaAwAAiwYAMJsDBACRBQAhrgMAALQFwgMirwNAAJ0FACGwA0AAnQUAIb8DAQCzBQAhoQQBAKcFACEKGQAAjQYAIJgDAACMBgAwmQMAAKQBABCaAwAAjAYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhoQQBANsFACED7wMAADYAIPADAAA2ACDxAwAANgAgCh4BAKcFACGYAwAAjgYAMJkDAACeAQAQmgMAAI4GADCbAwQAkQUAIa4DAAC0BcIDIq8DQACdBQAhsANAAJ0FACG_AwEAswUAIaEEAQCnBQAhCx4BANsFACExAACQBgAgmAMAAI8GADCZAwAAjQEAEJoDAACPBgAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBANoFACGhBAEA2wUAIQPvAwAAAwAg8AMAAAMAIPEDAAADACAKIQAAkwYAIJgDAACRBgAwmQMAAIQBABCaAwAAkQYAMJsDBADZBQAhngMIANwFACGvA0AA4AUAIbEDBADZBQAhswNAAJIGACG0AwEA2wUAIQigA0AAAAABoQNAAAAABaIDQAAAAAWjA0AAAAABpANAAAAAAaUDQAAAAAGmA0AAAAABpwNAAKwFACERBwAAmgYAIBgAAJ0GACAiAACyBgAgLwAA0QYAIDAAANIGACCYAwAAzwYAMJkDAAADABCaAwAAzwYAMJsDBADZBQAhqQMEANkFACGvA0AA4AUAIbADQADgBQAhuQMEANkFACG6AwQA2QUAIbwDAADQBrwDIqkEAAADACCqBAAAAwAgCSsAAJYGACCYAwAAlAYAMJkDAABwABCaAwAAlAYAMJsDBADZBQAhrwNAAOAFACHaAwQA2QUAIeoDAACVBuoDIusDAQDaBQAhBKADAAAA6gMCoQMAAADqAwiiAwAAAOoDCKcDAADWBeoDIhIqAADhBQAgLAAA4gUAIJgDAADYBQAwmQMAAIwDABCaAwAA2AUAMJsDBADZBQAhnwMIANwFACGvA0AA4AUAIbADQADgBQAhvwMBANoFACHlAwgA3QUAIeYDAgDfBQAh5wMCAN8FACHsAwEA2wUAIe0DCADdBQAh7gMCAN4FACGpBAAAjAMAIKoEAACMAwAgFwcAAJoGACArAACWBgAgmAMAAJcGADCZAwAAawAQmgMAAJcGADCbAwQA2QUAIa4DAACZBukDIq8DQADgBQAhsANAAOAFACG5AwQA2QUAIdoDBADZBQAh2wNAAJIGACHcA0AAkgYAId0DAgDeBQAh3gNAAJIGACHfA0AAkgYAIeEDAACYBuEDIuIDAgDfBQAh4wMIANwFACHkAwgA3QUAIeUDCADdBQAh5gMCAN8FACHnAwIA3wUAIQSgAwAAAOEDAqEDAAAA4QMIogMAAADhAwinAwAA0QXhAyIEoAMAAADpAwKhAwAAAOkDCKIDAAAA6QMIpwMAAM4F6QMiKwMAAMsGACAEAADCBgAgBQAAywYAIAYAAMIGACAIAADMBgAgCwAAzQYAIBAAAM4GACAUAACJBgAgHAAAsAYAICYAAJAGACAnAAC9BgAgLQAA4QUAIC4AAL8GACCYAwAAyQYAMJkDAAAHABCaAwAAyQYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIdUDAQDbBQAh1gMBANsFACHXAwEA2wUAIdgDAQDbBQAh2QMBANsFACHsAwEA2wUAIfIDBACtBgAhiwQEAK0GACGMBAQArQYAIY0EAQDaBQAhjgQBANsFACGPBAEA2wUAIZAEAQDbBQAhkQQBANoFACGSBAEA2gUAIZMEAQDaBQAhlQQAAMoGlQQilgQBANsFACGXBEAAkgYAIZgEIAD5BQAhmQRAAJIGACGpBAAABwAgqgQAAAcAIAKoAwQAAAABqQMEAAAAAQkRAACaBgAgGAAAnQYAIJgDAACcBgAwmQMAAGEAEJoDAACcBgAwmwMEANkFACGoAwQA2QUAIakDBADZBQAhrwNAAOAFACEiEQAAmgYAIBIAALgGACATAAC3BgAgFwAAvAYAIBkAAI0GACAcAACwBgAgJgAAkAYAICcAAL0GACAoAAC-BgAgKQAAvwYAIJgDAAC7BgAwmQMAACAAEJoDAAC7BgAwmwMEANkFACGoAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_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_AwEA2gUAIcADAQDbBQAhA-8DAABMACDwAwAATAAg8QMAAEwAIAKpAwQAAAABzAMEAAAAAQkYAACdBgAgGgAAtQYAIJgDAAC0BgAwmQMAADYAEJoDAAC0BgAwmwMEANkFACGpAwQA2QUAIa8DQADgBQAhzAMEANkFACEMGQAAjQYAIJgDAACMBgAwmQMAAKQBABCaAwAAjAYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhoQQBANsFACGpBAAApAEAIKoEAACkAQAgChIAALgGACATAAC3BgAgFAAAiQYAIJgDAAC2BgAwmQMAACgAEJoDAAC2BgAwmwMEANkFACG_AwEA2gUAIdIDBADZBQAh0wMEANkFACENEgAAuAYAIBQAAIkGACAVAACIBgAgmAMAALkGADCZAwAAJAAQmgMAALkGADCbAwQA2QUAIb8DAQDaBQAh0gMEANkFACHqAwEA2wUAIZoEAQDbBQAhqQQAACQAIKoEAAAkACARFAAAiQYAIBUAAIgGACAWAACHBgAgmAMAAIYGADCZAwAAzwEAEJoDAACGBgAwmwMEANkFACG_AwEA2gUAIZoEAQDbBQAhmwQBANsFACGcBAEA2wUAIZ0EAQDbBQAhngQBANsFACGfBAEA2wUAIaAEAQDbBQAhqQQAAM8BACCqBAAAzwEAIAsSAAC4BgAgFAAAiQYAIBUAAIgGACCYAwAAuQYAMJkDAAAkABCaAwAAuQYAMJsDBADZBQAhvwMBANoFACHSAwQA2QUAIeoDAQDbBQAhmgQBANsFACECqAMEAAAAAb8DAQAAAAEgEQAAmgYAIBIAALgGACATAAC3BgAgFwAAvAYAIBkAAI0GACAcAACwBgAgJgAAkAYAICcAAL0GACAoAAC-BgAgKQAAvwYAIJgDAAC7BgAwmQMAACAAEJoDAAC7BgAwmwMEANkFACGoAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIc0DAQDaBQAhzgMBANsFACHPAwEA2wUAIdADAQDbBQAh0QMBANsFACHSAwQA2QUAIdMDBADZBQAh1AMEANkFACHVAwEA2gUAIdYDAQDaBQAh1wMBANsFACHYAwEA2gUAIdkDAQDaBQAhDBIAALgGACATAAC3BgAgFAAAiQYAIJgDAAC2BgAwmQMAACgAEJoDAAC2BgAwmwMEANkFACG_AwEA2gUAIdIDBADZBQAh0wMEANkFACGpBAAAKAAgqgQAACgAIAPvAwAAWQAg8AMAAFkAIPEDAABZACAD7wMAAF0AIPADAABdACDxAwAAXQAgA-8DAABhACDwAwAAYQAg8QMAAGEAIAK_AwEAAAAB-gMEAAAAAQwJAACaBgAgCgAAwgYAIA8AAO8FACCYAwAAwQYAMJkDAAASABCaAwAAwQYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAh-gMEANkFACED7wMAAAcAIPADAAAHACDxAwAABwAgAvIDBAAAAAHzAwQAAAABCQsAAMUGACAOAADGBgAgmAMAAMQGADCZAwAAFQAQmgMAAMQGADCbAwQA2QUAIa8DQADgBQAh8gMEANkFACHzAwQA2QUAIQ4JAACaBgAgCgAAwgYAIA8AAO8FACCYAwAAwQYAMJkDAAASABCaAwAAwQYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAh-gMEANkFACGpBAAAEgAgqgQAABIAIA0MAADvBQAgmAMAAOsFADCZAwAA4QIAEJoDAADrBQAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh9QMAAOwF9QMi9gMBANoFACH4AwAA7QX4AyKpBAAA4QIAIKoEAADhAgAgDAcAAJoGACCYAwAAxwYAMJkDAAAOABCaAwAAxwYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAh6gMAAMgGiQQiiQQBANsFACGKBAEA2wUAIQSgAwAAAIkEAqEDAAAAiQQIogMAAACJBAinAwAA_gWJBCIpAwAAywYAIAQAAMIGACAFAADLBgAgBgAAwgYAIAgAAMwGACALAADNBgAgEAAAzgYAIBQAAIkGACAcAACwBgAgJgAAkAYAICcAAL0GACAtAADhBQAgLgAAvwYAIJgDAADJBgAwmQMAAAcAEJoDAADJBgAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh1QMBANsFACHWAwEA2wUAIdcDAQDbBQAh2AMBANsFACHZAwEA2wUAIewDAQDbBQAh8gMEAK0GACGLBAQArQYAIYwEBACtBgAhjQQBANoFACGOBAEA2wUAIY8EAQDbBQAhkAQBANsFACGRBAEA2gUAIZIEAQDaBQAhkwQBANoFACGVBAAAygaVBCKWBAEA2wUAIZcEQACSBgAhmAQgAPkFACGZBEAAkgYAIQSgAwAAAJUEAqEDAAAAlQQIogMAAACVBAinAwAAggaVBCIrAwAAywYAIAQAAMIGACAFAADLBgAgBgAAwgYAIAgAAMwGACALAADNBgAgEAAAzgYAIBQAAIkGACAcAACwBgAgJgAAkAYAICcAAL0GACAtAADhBQAgLgAAvwYAIJgDAADJBgAwmQMAAAcAEJoDAADJBgAwmwMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAh1QMBANsFACHWAwEA2wUAIdcDAQDbBQAh2AMBANsFACHZAwEA2wUAIewDAQDbBQAh8gMEAK0GACGLBAQArQYAIYwEBACtBgAhjQQBANoFACGOBAEA2wUAIY8EAQDbBQAhkAQBANsFACGRBAEA2gUAIZIEAQDaBQAhkwQBANoFACGVBAAAygaVBCKWBAEA2wUAIZcEQACSBgAhmAQgAPkFACGZBEAAkgYAIakEAAAHACCqBAAABwAgA-8DAAAOACDwAwAADgAg8QMAAA4AIA4JAACaBgAgCgAAwgYAIA8AAO8FACCYAwAAwQYAMJkDAAASABCaAwAAwQYAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAh-gMEANkFACGpBAAAEgAgqgQAABIAIAPvAwAAEgAg8AMAABIAIPEDAAASACAPBwAAmgYAIBgAAJ0GACAiAACyBgAgLwAA0QYAIDAAANIGACCYAwAAzwYAMJkDAAADABCaAwAAzwYAMJsDBADZBQAhqQMEANkFACGvA0AA4AUAIbADQADgBQAhuQMEANkFACG6AwQA2QUAIbwDAADQBrwDIgSgAwAAALwDAqEDAAAAvAMIogMAAAC8AwinAwAAsAW8AyINHgEA2wUAITEAAJAGACCYAwAAjwYAMJkDAACNAQAQmgMAAI8GADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIaEEAQDbBQAhqQQAAI0BACCqBAAAjQEAIAPvAwAAhAEAIPADAACEAQAg8QMAAIQBACAAAAAAAAWuBAQAAAABtQQEAAAAAbYEBAAAAAG3BAQAAAABuAQEAAAAAQWuBAIAAAABtQQCAAAAAbYEAgAAAAG3BAIAAAABuAQCAAAAAQWuBAgAAAABtQQIAAAAAbYECAAAAAG3BAgAAAABuAQIAAAAAQU8AACKDgAgPQAAkA4AIKsEAACLDgAgrAQAAI8OACCxBAAAWwAgBTwAAIgOACA9AACNDgAgqwQAAIkOACCsBAAAjA4AILEEAAA-ACADPAAAig4AIKsEAACLDgAgsQQAAFsAIAM8AACIDgAgqwQAAIkOACCxBAAAPgAgAAAAAAABrgQAAACrAwIBrgQAAACuAwIBrgRAAAAAAQU8AAD_DQAgPQAAhg4AIKsEAACADgAgrAQAAIUOACCxBAAACgAgBTwAAP0NACA9AACDDgAgqwQAAP4NACCsBAAAgg4AILEEAAAiACALPAAA6gYAMD0AAO8GADCrBAAA6wYAMKwEAADsBgAwrQQAAO0GACCuBAAA7gYAMK8EAADuBgAwsAQAAO4GADCxBAAA7gYAMLIEAADwBgAwswQAAPEGADAFIAAA3gYAIJsDBAAAAAGdAwQAAAABngMCAAAAAZ8DCAAAAAECAAAAUgAgPAAA9QYAIAMAAABSACA8AAD1BgAgPQAA9AYAIAE3AACBDgAwCiAAAKgGACAkAACnBgAgmAMAAKYGADCZAwAAUAAQmgMAAKYGADCbAwQAAAABnAMEANkFACGdAwQA2QUAIZ4DAgDfBQAhnwMIANwFACECAAAAUgAgNwAA9AYAIAIAAADyBgAgNwAA8wYAIAiYAwAA8QYAMJkDAADyBgAQmgMAAPEGADCbAwQA2QUAIZwDBADZBQAhnQMEANkFACGeAwIA3wUAIZ8DCADcBQAhCJgDAADxBgAwmQMAAPIGABCaAwAA8QYAMJsDBADZBQAhnAMEANkFACGdAwQA2QUAIZ4DAgDfBQAhnwMIANwFACEEmwMEANgGACGdAwQA2AYAIZ4DAgDZBgAhnwMIANoGACEFIAAA3AYAIJsDBADYBgAhnQMEANgGACGeAwIA2QYAIZ8DCADaBgAhBSAAAN4GACCbAwQAAAABnQMEAAAAAZ4DAgAAAAGfAwgAAAABAzwAAP8NACCrBAAAgA4AILEEAAAKACADPAAA_Q0AIKsEAAD-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AAAAAcMDAAAAwwMCxAOAAAAAAQkRAAD2BgAgIwAA-AYAIJsDBAAAAAGoAwQAAAABqwMAAACrAwKsAwgAAAABrgMAAACuAwKvA0AAAAABsANAAAAAAQIAAABbACA8AACnCAAgAwAAAFsAIDwAAKcIACA9AACmCAAgATcAAJ8NADAOEQAAmgYAIBgAAJ0GACAjAAClBgAgmAMAAKIGADCZAwAAWQAQmgMAAKIGADCbAwQAAAABqAMEANkFACGpAwQA2QUAIasDAACjBqsDIqwDCADcBQAhrgMAAKQGrgMirwNAAOAFACGwA0AA4AUAIQIAAABbACA3AACmCAAgAgAAAKQIACA3AAClCAAgC5gDAACjCAAwmQMAAKQIABCaAwAAowgAMJsDBADZBQAhqAMEANkFACGpAwQA2QUAIasDAACjBqsDIqwDCADcBQAhrgMAAKQGrgMirwNAAOAFACGwA0AA4AUAIQuYAwAAowgAMJkDAACkCAAQmgMAAKMIADCbAwQA2QUAIagDBADZBQAhqQMEANkFACGrAwAAowarAyKsAwgA3AUAIa4DAACkBq4DIq8DQADgBQAhsANAAOAFACEHmwMEANgGACGoAwQA2AYAIasDAADkBqsDIqwDCADaBgAhrgMAAOUGrgMirwNAAOYGACGwA0AA5gYAIQkRAADnBgAgIwAA6QYAIJsDBADYBgAhqAMEANgGACGrAwAA5AarAyKsAwgA2gYAIa4DAADlBq4DIq8DQADmBgAhsANAAOYGACEJEQAA9gYAICMAAPgGACCbAwQAAAABqAMEAAAAAasDAAAAqwMCrAMIAAAAAa4DAAAArgMCrwNAAAAAAbADQAAAAAEKBwAArwcAICIAALMHACAvAACxBwAgMAAAsgcAIJsDBAAAAAGvA0AAAAABsANAAAAAAbkDBAAAAAG6AwQAAAABvAMAAAC8AwICAAAABQAgPAAAswgAIAMAAAAFACA8AACzCAAgPQAAsggAIAE3AACeDQAwDwcAAJoGACAYAACdBgAgIgAAsgYAIC8AANEGACAwAADSBgAgmAMAAM8GADCZAwAAAwAQmgMAAM8GADCbAwQAAAABqQMEANkFACGvA0AA4AUAIbADQADgBQAhuQMEANkFACG6AwQA2QUAIbwDAADQBrwDIgIAAAAFACA3AACyCAAgAgAAALAIACA3AACxCAAgCpgDAACvCAAwmQMAALAIABCaAwAArwgAMJsDBADZBQAhqQMEANkFACGvA0AA4AUAIbADQADgBQAhuQMEANkFACG6AwQA2QUAIbwDAADQBrwDIgqYAwAArwgAMJkDAACwCAAQmgMAAK8IADCbAwQA2QUAIakDBADZBQAhrwNAAOAFACGwA0AA4AUAIbkDBADZBQAhugMEANkFACG8AwAA0Aa8AyIGmwMEANgGACGvA0AA5gYAIbADQADmBgAhuQMEANgGACG6AwQA2AYAIbwDAACRB7wDIgoHAACSBwAgIgAAlgcAIC8AAJQHACAwAACVBwAgmwMEANgGACGvA0AA5gYAIbADQADmBgAhuQMEANgGACG6AwQA2AYAIbwDAACRB7wDIgoHAACvBwAgIgAAswcAIC8AALEHACAwAACyBwAgmwMEAAAAAa8DQAAAAAGwA0AAAAABuQMEAAAAAboDBAAAAAG8AwAAALwDAg8HAADUBwAgHgAA1gcAIB8AANcHACAiAADYBwAgJQAA2QcAIJsDBAAAAAGfAwgAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAbkDBAAAAAG9AwQAAAABvgMEAAAAAb8DAQAAAAHAAwEAAAABAgAAAD4AIDwAAL8IACADAAAAPgAgPAAAvwgAID0AAL4IACABNwAAnQ0AMBQHAACaBgAgGAAAnQYAIB4AAK4GACAfAACuBgAgIgAAsgYAICUAAKUGACCYAwAAsQYAMJkDAAA8ABCaAwAAsQYAMJsDBAAAAAGfAwgA3AUAIakDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAhvQMEAK0GACG-AwQArQYAIb8DAQDaBQAhwAMBANsFACECAAAAPgAgNwAAvggAIAIAAAC8CAAgNwAAvQgAIA6YAwAAuwgAMJkDAAC8CAAQmgMAALsIADCbAwQA2QUAIZ8DCADcBQAhqQMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhuQMEANkFACG9AwQArQYAIb4DBACtBgAhvwMBANoFACHAAwEA2wUAIQ6YAwAAuwgAMJkDAAC8CAAQmgMAALsIADCbAwQA2QUAIZ8DCADcBQAhqQMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhuQMEANkFACG9AwQArQYAIb4DBACtBgAhvwMBANoFACHAAwEA2wUAIQqbAwQA2AYAIZ8DCADaBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAhvQMEALsHACG-AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEPBwAAvAcAIB4AAL4HACAfAAC_BwAgIgAAwAcAICUAAMEHACCbAwQA2AYAIZ8DCADaBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAhvQMEALsHACG-AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEPBwAA1AcAIB4AANYHACAfAADXBwAgIgAA2AcAICUAANkHACCbAwQAAAABnwMIAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvQMEAAAAAb4DBAAAAAG_AwEAAAABwAMBAAAAAQQaAAD0BwAgmwMEAAAAAa8DQAAAAAHMAwQAAAABAgAAADgAIDwAAMsIACADAAAAOAAgPAAAywgAID0AAMoIACABNwAAnA0AMAoYAACdBgAgGgAAtQYAIJgDAAC0BgAwmQMAADYAEJoDAAC0BgAwmwMEAAAAAakDBADZBQAhrwNAAOAFACHMAwQA2QUAIaUEAACzBgAgAgAAADgAIDcAAMoIACACAAAAyAgAIDcAAMkIACAHmAMAAMcIADCZAwAAyAgAEJoDAADHCAAwmwMEANkFACGpAwQA2QUAIa8DQADgBQAhzAMEANkFACEHmAMAAMcIADCZAwAAyAgAEJoDAADHCAAwmwMEANkFACGpAwQA2QUAIa8DQADgBQAhzAMEANkFACEDmwMEANgGACGvA0AA5gYAIcwDBADYBgAhBBoAAPIHACCbAwQA2AYAIa8DQADmBgAhzAMEANgGACEEGgAA9AcAIJsDBAAAAAGvA0AAAAABzAMEAAAAAQM8AACaDQAgqwQAAJsNACCxBAAACgAgAzwAAJgNACCrBAAAmQ0AILEEAADMAQAgAzwAAJYNACCrBAAAlw0AILEEAAAmACADPAAAlA0AIKsEAACVDQAgsQQAACoAIAQ8AADACAAwqwQAAMEIADCtBAAAwwgAILEEAADECAAwBDwAALQIADCrBAAAtQgAMK0EAAC3CAAgsQQAALgIADAEPAAAqAgAMKsEAACpCAAwrQQAAKsIACCxBAAArAgAMAQ8AACcCAAwqwQAAJ0IADCtBAAAnwgAILEEAACgCAAwBDwAAJAIADCrBAAAkQgAMK0EAACTCAAgsQQAAJQIADAEPAAAhAgAMKsEAACFCAAwrQQAAIcIACCxBAAAiAgAMAAAAAAABa4EAgAAAAG1BAIAAAABtgQCAAAAAbcEAgAAAAG4BAIAAAABAa4EAAAA4QMCBa4ECAAAAAG1BAgAAAABtgQIAAAAAbcECAAAAAG4BAgAAAABAa4EAAAA6QMCBTwAAIwNACA9AACSDQAgqwQAAI0NACCsBAAAkQ0AILEEAAAKACAFPAAAig0AID0AAI8NACCrBAAAiw0AIKwEAACODQAgsQQAAIkDACADPAAAjA0AIKsEAACNDQAgsQQAAAoAIAM8AACKDQAgqwQAAIsNACCxBAAAiQMAIAAAAAAAAa4EAAAA6gMCBTwAAIUNACA9AACIDQAgqwQAAIYNACCsBAAAhw0AILEEAACJAwAgAzwAAIUNACCrBAAAhg0AILEEAACJAwAgAAAAAAALPAAA_ggAMD0AAIMJADCrBAAA_wgAMKwEAACACQAwrQQAAIEJACCuBAAAggkAMK8EAACCCQAwsAQAAIIJADCxBAAAggkAMLIEAACECQAwswQAAIUJADALPAAA8ggAMD0AAPcIADCrBAAA8wgAMKwEAAD0CAAwrQQAAPUIACCuBAAA9ggAMK8EAAD2CAAwsAQAAPYIADCxBAAA9ggAMLIEAAD4CAAwswQAAPkIADAEmwMEAAAAAa8DQAAAAAHqAwAAAOoDAusDAQAAAAECAAAAcgAgPAAA_QgAIAMAAAByACA8AAD9CAAgPQAA_AgAIAE3AACEDQAwCSsAAJYGACCYAwAAlAYAMJkDAABwABCaAwAAlAYAMJsDBAAAAAGvA0AA4AUAIdoDBADZBQAh6gMAAJUG6gMi6wMBANoFACECAAAAcgAgNwAA_AgAIAIAAAD6CAAgNwAA-wgAIAiYAwAA-QgAMJkDAAD6CAAQmgMAAPkIADCbAwQA2QUAIa8DQADgBQAh2gMEANkFACHqAwAAlQbqAyLrAwEA2gUAIQiYAwAA-QgAMJkDAAD6CAAQmgMAAPkIADCbAwQA2QUAIa8DQADgBQAh2gMEANkFACHqAwAAlQbqAyLrAwEA2gUAIQSbAwQA2AYAIa8DQADmBgAh6gMAAOgI6gMi6wMBALkHACEEmwMEANgGACGvA0AA5gYAIeoDAADoCOoDIusDAQC5BwAhBJsDBAAAAAGvA0AAAAAB6gMAAADqAwLrAwEAAAABEgcAAOEIACCbAwQAAAABrgMAAADpAwKvA0AAAAABsANAAAAAAbkDBAAAAAHbA0AAAAAB3ANAAAAAAd0DAgAAAAHeA0AAAAAB3wNAAAAAAeEDAAAA4QMC4gMCAAAAAeMDCAAAAAHkAwgAAAAB5QMIAAAAAeYDAgAAAAHnAwIAAAABAgAAAG0AIDwAAIkJACADAAAAbQAgPAAAiQkAID0AAIgJACABNwAAgw0AMBcHAACaBgAgKwAAlgYAIJgDAACXBgAwmQMAAGsAEJoDAACXBgAwmwMEAAAAAa4DAACZBukDIq8DQADgBQAhsANAAOAFACG5AwQA2QUAIdoDBADZBQAh2wNAAJIGACHcA0AAkgYAId0DAgDeBQAh3gNAAJIGACHfA0AAkgYAIeEDAACYBuEDIuIDAgDfBQAh4wMIANwFACHkAwgA3QUAIeUDCADdBQAh5gMCAN8FACHnAwIA3wUAIQIAAABtACA3AACICQAgAgAAAIYJACA3AACHCQAgFZgDAACFCQAwmQMAAIYJABCaAwAAhQkAMJsDBADZBQAhrgMAAJkG6QMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAh2gMEANkFACHbA0AAkgYAIdwDQACSBgAh3QMCAN4FACHeA0AAkgYAId8DQACSBgAh4QMAAJgG4QMi4gMCAN8FACHjAwgA3AUAIeQDCADdBQAh5QMIAN0FACHmAwIA3wUAIecDAgDfBQAhFZgDAACFCQAwmQMAAIYJABCaAwAAhQkAMJsDBADZBQAhrgMAAJkG6QMirwNAAOAFACGwA0AA4AUAIbkDBADZBQAh2gMEANkFACHbA0AAkgYAIdwDQACSBgAh3QMCAN4FACHeA0AAkgYAId8DQACSBgAh4QMAAJgG4QMi4gMCAN8FACHjAwgA3AUAIeQDCADdBQAh5QMIAN0FACHmAwIA3wUAIecDAgDfBQAhEZsDBADYBgAhrgMAAN4I6QMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAh2wNAAIgHACHcA0AAiAcAId0DAgDbCAAh3gNAAIgHACHfA0AAiAcAIeEDAADcCOEDIuIDAgDZBgAh4wMIANoGACHkAwgA3QgAIeUDCADdCAAh5gMCANkGACHnAwIA2QYAIRIHAADfCAAgmwMEANgGACGuAwAA3gjpAyKvA0AA5gYAIbADQADmBgAhuQMEANgGACHbA0AAiAcAIdwDQACIBwAh3QMCANsIACHeA0AAiAcAId8DQACIBwAh4QMAANwI4QMi4gMCANkGACHjAwgA2gYAIeQDCADdCAAh5QMIAN0IACHmAwIA2QYAIecDAgDZBgAhEgcAAOEIACCbAwQAAAABrgMAAADpAwKvA0AAAAABsANAAAAAAbkDBAAAAAHbA0AAAAAB3ANAAAAAAd0DAgAAAAHeA0AAAAAB3wNAAAAAAeEDAAAA4QMC4gMCAAAAAeMDCAAAAAHkAwgAAAAB5QMIAAAAAeYDAgAAAAHnAwIAAAABBDwAAP4IADCrBAAA_wgAMK0EAACBCQAgsQQAAIIJADAEPAAA8ggAMKsEAADzCAAwrQQAAPUIACCxBAAA9ggAMAAAAbgDAQAAAAEAAAAAAAU8AAD7DAAgPQAAgQ0AIKsEAAD8DAAgrAQAAIANACCxBAAAHgAgBTwAAPkMACA9AAD-DAAgqwQAAPoMACCsBAAA_QwAILEEAADeAgAgAzwAAPsMACCrBAAA_AwAILEEAAAeACADPAAA-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_wkAMK0EAACACgAgrgQAAIIJADCvBAAAggkAMLAEAACCCQAwsQQAAIIJADCyBAAAggoAMLMEAACFCQAwCzwAAPQJADA9AAD4CQAwqwQAAPUJADCsBAAA9gkAMK0EAAD3CQAgrgQAALgIADCvBAAAuAgAMLAEAAC4CAAwsQQAALgIADCyBAAA-QkAMLMEAAC7CAAwCzwAAOsJADA9AADvCQAwqwQAAOwJADCsBAAA7QkAMK0EAADuCQAgrgQAAKwIADCvBAAArAgAMLAEAACsCAAwsQQAAKwIADCyBAAA8AkAMLMEAACvCAAwCzwAAOIJADA9AADmCQAwqwQAAOMJADCsBAAA5AkAMK0EAADlCQAgrgQAAKAIADCvBAAAoAgAMLAEAACgCAAwsQQAAKAIADCyBAAA5wkAMLMEAACjCAAwCzwAANkJADA9AADdCQAwqwQAANoJADCsBAAA2wkAMK0EAADcCQAgrgQAAIgIADCvBAAAiAgAMLAEAACICAAwsQQAAIgIADCyBAAA3gkAMLMEAACLCAAwBBgAAOsHACCbAwQAAAABqQMEAAAAAa8DQAAAAAECAAAAYwAgPAAA4QkAIAMAAABjACA8AADhCQAgPQAA4AkAIAE3AADsDAAwAgAAAGMAIDcAAOAJACACAAAAjAgAIDcAAN8JACADmwMEANgGACGpAwQA2AYAIa8DQADmBgAhBBgAAOkHACCbAwQA2AYAIakDBADYBgAhrwNAAOYGACEEGAAA6wcAIJsDBAAAAAGpAwQAAAABrwNAAAAAAQkYAAD3BgAgIwAA-AYAIJsDBAAAAAGpAwQAAAABqwMAAACrAwKsAwgAAAABrgMAAACuAwKvA0AAAAABsANAAAAAAQIAAABbACA8AADqCQAgAwAAAFsAIDwAAOoJACA9AADpCQAgATcAAOsMADACAAAAWwAgNwAA6QkAIAIAAACkCAAgNwAA6AkAIAebAwQA2AYAIakDBADYBgAhqwMAAOQGqwMirAMIANoGACGuAwAA5QauAyKvA0AA5gYAIbADQADmBgAhCRgAAOgGACAjAADpBgAgmwMEANgGACGpAwQA2AYAIasDAADkBqsDIqwDCADaBgAhrgMAAOUGrgMirwNAAOYGACGwA0AA5gYAIQkYAAD3BgAgIwAA-AYAIJsDBAAAAAGpAwQAAAABqwMAAACrAwKsAwgAAAABrgMAAACuAwKvA0AAAAABsANAAAAAAQoYAACwBwAgIgAAswcAIC8AALEHACAwAACyBwAgmwMEAAAAAakDBAAAAAGvA0AAAAABsANAAAAAAboDBAAAAAG8AwAAALwDAgIAAAAFACA8AADzCQAgAwAAAAUAIDwAAPMJACA9AADyCQAgATcAAOoMADACAAAABQAgNwAA8gkAIAIAAACwCAAgNwAA8QkAIAabAwQA2AYAIakDBADYBgAhrwNAAOYGACGwA0AA5gYAIboDBADYBgAhvAMAAJEHvAMiChgAAJMHACAiAACWBwAgLwAAlAcAIDAAAJUHACCbAwQA2AYAIakDBADYBgAhrwNAAOYGACGwA0AA5gYAIboDBADYBgAhvAMAAJEHvAMiChgAALAHACAiAACzBwAgLwAAsQcAIDAAALIHACCbAwQAAAABqQMEAAAAAa8DQAAAAAGwA0AAAAABugMEAAAAAbwDAAAAvAMCDxgAANUHACAeAADWBwAgHwAA1wcAICIAANgHACAlAADZBwAgmwMEAAAAAZ8DCAAAAAGpAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb0DBAAAAAG-AwQAAAABvwMBAAAAAcADAQAAAAECAAAAPgAgPAAA_AkAIAMAAAA-ACA8AAD8CQAgPQAA-wkAIAE3AADpDAAwAgAAAD4AIDcAAPsJACACAAAAvAgAIDcAAPoJACAKmwMEANgGACGfAwgA2gYAIakDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb0DBAC7BwAhvgMEALsHACG_AwEAuQcAIcADAQCJBwAhDxgAAL0HACAeAAC-BwAgHwAAvwcAICIAAMAHACAlAADBBwAgmwMEANgGACGfAwgA2gYAIakDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb0DBAC7BwAhvgMEALsHACG_AwEAuQcAIcADAQCJBwAhDxgAANUHACAeAADWBwAgHwAA1wcAICIAANgHACAlAADZBwAgmwMEAAAAAZ8DCAAAAAGpAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb0DBAAAAAG-AwQAAAABvwMBAAAAAcADAQAAAAESKwAA4ggAIJsDBAAAAAGuAwAAAOkDAq8DQAAAAAGwA0AAAAAB2gMEAAAAAdsDQAAAAAHcA0AAAAAB3QMCAAAAAd4DQAAAAAHfA0AAAAAB4QMAAADhAwLiAwIAAAAB4wMIAAAAAeQDCAAAAAHlAwgAAAAB5gMCAAAAAecDAgAAAAECAAAAbQAgPAAAhQoAIAMAAABtACA8AACFCgAgPQAAhAoAIAE3AADoDAAwAgAAAG0AIDcAAIQKACACAAAAhgkAIDcAAIMKACARmwMEANgGACGuAwAA3gjpAyKvA0AA5gYAIbADQADmBgAh2gMEANgGACHbA0AAiAcAIdwDQACIBwAh3QMCANsIACHeA0AAiAcAId8DQACIBwAh4QMAANwI4QMi4gMCANkGACHjAwgA2gYAIeQDCADdCAAh5QMIAN0IACHmAwIA2QYAIecDAgDZBgAhEisAAOAIACCbAwQA2AYAIa4DAADeCOkDIq8DQADmBgAhsANAAOYGACHaAwQA2AYAIdsDQACIBwAh3ANAAIgHACHdAwIA2wgAId4DQACIBwAh3wNAAIgHACHhAwAA3AjhAyLiAwIA2QYAIeMDCADaBgAh5AMIAN0IACHlAwgA3QgAIeYDAgDZBgAh5wMCANkGACESKwAA4ggAIJsDBAAAAAGuAwAAAOkDAq8DQAAAAAGwA0AAAAAB2gMEAAAAAdsDQAAAAAHcA0AAAAAB3QMCAAAAAd4DQAAAAAHfA0AAAAAB4QMAAADhAwLiAwIAAAAB4wMIAAAAAeQDCAAAAAHlAwgAAAAB5gMCAAAAAecDAgAAAAEbEgAAzQgAIBMAAM4IACAXAADPCAAgGQAA0AgAIBwAANEIACAmAADSCAAgJwAA0wgAICgAANQIACApAADVCAAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQIAAAAiACA8AACRCgAgAwAAACIAIDwAAJEKACA9AACQCgAgATcAAOcMADAhEQAAmgYAIBIAALgGACATAAC3BgAgFwAAvAYAIBkAAI0GACAcAACwBgAgJgAAkAYAICcAAL0GACAoAAC-BgAgKQAAvwYAIJgDAAC7BgAwmQMAACAAEJoDAAC7BgAwmwMEAAAAAagDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhzQMBANoFACHOAwEA2wUAIc8DAQDbBQAh0AMBANsFACHRAwEA2wUAIdIDBADZBQAh0wMEANkFACHUAwQA2QUAIdUDAQDaBQAh1gMBANoFACHXAwEA2wUAIdgDAQDaBQAh2QMBANoFACGmBAAAugYAIAIAAAAiACA3AACQCgAgAgAAAI4KACA3AACPCgAgFpgDAACNCgAwmQMAAI4KABCaAwAAjQoAMJsDBADZBQAhqAMEANkFACGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBANoFACHNAwEA2gUAIc4DAQDbBQAhzwMBANsFACHQAwEA2wUAIdEDAQDbBQAh0gMEANkFACHTAwQA2QUAIdQDBADZBQAh1QMBANoFACHWAwEA2gUAIdcDAQDbBQAh2AMBANoFACHZAwEA2gUAIRaYAwAAjQoAMJkDAACOCgAQmgMAAI0KADCbAwQA2QUAIagDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhzQMBANoFACHOAwEA2wUAIc8DAQDbBQAh0AMBANsFACHRAwEA2wUAIdIDBADZBQAh0wMEANkFACHUAwQA2QUAIdUDAQDaBQAh1gMBANoFACHXAwEA2wUAIdgDAQDaBQAh2QMBANoFACESmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRsSAAD7BwAgEwAA_AcAIBcAAP0HACAZAAD-BwAgHAAA_wcAICYAAIAIACAnAACBCAAgKAAAgggAICkAAIMIACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdMDBADYBgAh1AMEANgGACHVAwEAuQcAIdYDAQC5BwAh1wMBAIkHACHYAwEAuQcAIdkDAQC5BwAhGxIAAM0IACATAADOCAAgFwAAzwgAIBkAANAIACAcAADRCAAgJgAA0ggAICcAANMIACAoAADUCAAgKQAA1QgAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdMDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAEHCgAAngoAIA8AAJ8KACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAECAAAAHgAgPAAAnQoAIAMAAAAeACA8AACdCgAgPQAAnAoAIAE3AADmDAAwDQkAAJoGACAKAADCBgAgDwAA7wUAIJgDAADBBgAwmQMAABIAEJoDAADBBgAwmwMEAAAAAa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIfoDBADZBQAhpwQAAMAGACACAAAAHgAgNwAAnAoAIAIAAACaCgAgNwAAmwoAIAmYAwAAmQoAMJkDAACaCgAQmgMAAJkKADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIfoDBADZBQAhCZgDAACZCgAwmQMAAJoKABCaAwAAmQoAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAh-gMEANkFACEFmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACEHCgAAtQkAIA8AALYJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_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_CgAgJgAAwAoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYwEBAAAAAGNBAEAAAABjgQBAAAAAY8EAQAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlQQAAACVBAKWBAEAAAABlwRAAAAAAZgEIAAAAAGZBEAAAAABAzwAANoMACCrBAAA2wwAILEEAAAKACADAAAACgAgPAAAxgoAID0AAMwKACACAAAACgAgNwAAzAoAIAIAAADICQAgNwAAywoAIBibAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISQEAADOCQAgBQAAzwkAIAYAANAJACAIAADRCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISQDAAC3CgAgBAAAuAoAIAUAAMcKACAGAAC5CgAgCAAAugoAIBAAALwKACAUAAC9CgAgHAAAvwoAICYAAMAKACAnAADBCgAgLQAAvgoAIC4AAMIKACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB7AMBAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQM8AADYDAAgqwQAANkMACCxBAAACgAgAAAAAAABuAMBAAAAAQAAAAAABTwAANMMACA9AADWDAAgqwQAANQMACCsBAAA1QwAILEEAAAKACADPAAA0wwAIKsEAADUDAAgsQQAAAoAIAAAAAAAAAAAAAAFPAAAygwAID0AANEMACCrBAAAywwAIKwEAADQDAAgsQQAACYAIAU8AADIDAAgPQAAzgwAIKsEAADJDAAgrAQAAM0MACCxBAAAzAEAIAs8AADpCgAwPQAA7QoAMKsEAADqCgAwrAQAAOsKADCtBAAA7AoAIK4EAACKCgAwrwQAAIoKADCwBAAAigoAMLEEAACKCgAwsgQAAO4KADCzBAAAjQoAMBsRAADMCAAgEgAAzQgAIBMAAM4IACAZAADQCAAgHAAA0QgAICYAANIIACAnAADTCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABAgAAACIAIDwAAPEKACADAAAAIgAgPAAA8QoAID0AAPAKACABNwAAzAwAMAIAAAAiACA3AADwCgAgAgAAAI4KACA3AADvCgAgEpsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEbEQAA-gcAIBIAAPsHACATAAD8BwAgGQAA_gcAIBwAAP8HACAmAACACAAgJwAAgQgAICgAAIIIACApAACDCAAgmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdMDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRsRAADMCAAgEgAAzQgAIBMAAM4IACAZAADQCAAgHAAA0QgAICYAANIIACAnAADTCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABAzwAAMoMACCrBAAAywwAILEEAAAmACADPAAAyAwAIKsEAADJDAAgsQQAAMwBACAEPAAA6QoAMKsEAADqCgAwrQQAAOwKACCxBAAAigoAMAAAAAAABTwAAMEMACA9AADGDAAgqwQAAMIMACCsBAAAxQwAILEEAADMAQAgCzwAAIYLADA9AACLCwAwqwQAAIcLADCsBAAAiAsAMK0EAACJCwAgrgQAAIoLADCvBAAAigsAMLAEAACKCwAwsQQAAIoLADCyBAAAjAsAMLMEAACNCwAwCzwAAP0KADA9AACBCwAwqwQAAP4KADCsBAAA_woAMK0EAACACwAgrgQAAIoKADCvBAAAigoAMLAEAACKCgAwsQQAAIoKADCyBAAAggsAMLMEAACNCgAwGxEAAMwIACASAADNCAAgFwAAzwgAIBkAANAIACAcAADRCAAgJgAA0ggAICcAANMIACAoAADUCAAgKQAA1QgAIJsDBAAAAAGoAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAECAAAAIgAgPAAAhQsAIAMAAAAiACA8AACFCwAgPQAAhAsAIAE3AADEDAAwAgAAACIAIDcAAIQLACACAAAAjgoAIDcAAIMLACASmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRsRAAD6BwAgEgAA-wcAIBcAAP0HACAZAAD-BwAgHAAA_wcAICYAAIAIACAnAACBCAAgKAAAgggAICkAAIMIACCbAwQA2AYAIagDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhzQMBALkHACHOAwEAiQcAIc8DAQCJBwAh0AMBAIkHACHRAwEAiQcAIdIDBADYBgAh1AMEANgGACHVAwEAuQcAIdYDAQC5BwAh1wMBAIkHACHYAwEAuQcAIdkDAQC5BwAhGxEAAMwIACASAADNCAAgFwAAzwgAIBkAANAIACAcAADRCAAgJgAA0ggAICcAANMIACAoAADUCAAgKQAA1QgAIJsDBAAAAAGoAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAEFEgAA8woAIBQAAPQKACCbAwQAAAABvwMBAAAAAdIDBAAAAAECAAAAKgAgPAAAkQsAIAMAAAAqACA8AACRCwAgPQAAkAsAIAE3AADDDAAwChIAALgGACATAAC3BgAgFAAAiQYAIJgDAAC2BgAwmQMAACgAEJoDAAC2BgAwmwMEAAAAAb8DAQDaBQAh0gMEANkFACHTAwQA2QUAIQIAAAAqACA3AACQCwAgAgAAAI4LACA3AACPCwAgB5gDAACNCwAwmQMAAI4LABCaAwAAjQsAMJsDBADZBQAhvwMBANoFACHSAwQA2QUAIdMDBADZBQAhB5gDAACNCwAwmQMAAI4LABCaAwAAjQsAMJsDBADZBQAhvwMBANoFACHSAwQA2QUAIdMDBADZBQAhA5sDBADYBgAhvwMBALkHACHSAwQA2AYAIQUSAADnCgAgFAAA6AoAIJsDBADYBgAhvwMBALkHACHSAwQA2AYAIQUSAADzCgAgFAAA9AoAIJsDBAAAAAG_AwEAAAAB0gMEAAAAAQM8AADBDAAgqwQAAMIMACCxBAAAzAEAIAQ8AACGCwAwqwQAAIcLADCtBAAAiQsAILEEAACKCwAwBDwAAP0KADCrBAAA_goAMK0EAACACwAgsQQAAIoKADAAAAAAAAs8AACvCwAwPQAAtAsAMKsEAACwCwAwrAQAALELADCtBAAAsgsAIK4EAACzCwAwrwQAALMLADCwBAAAswsAMLEEAACzCwAwsgQAALULADCzBAAAtgsAMAs8AACmCwAwPQAAqgsAMKsEAACnCwAwrAQAAKgLADCtBAAAqQsAIK4EAACKCwAwrwQAAIoLADCwBAAAigsAMLEEAACKCwAwsgQAAKsLADCzBAAAjQsAMAs8AACdCwAwPQAAoQsAMKsEAACeCwAwrAQAAJ8LADCtBAAAoAsAIK4EAACKCgAwrwQAAIoKADCwBAAAigoAMLEEAACKCgAwsgQAAKILADCzBAAAjQoAMBsRAADMCAAgEwAAzggAIBcAAM8IACAZAADQCAAgHAAA0QgAICYAANIIACAnAADTCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHTAwQAAAAB1AMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABAgAAACIAIDwAAKULACADAAAAIgAgPAAApQsAID0AAKQLACABNwAAwAwAMAIAAAAiACA3AACkCwAgAgAAAI4KACA3AACjCwAgEpsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0wMEANgGACHUAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEbEQAA-gcAIBMAAPwHACAXAAD9BwAgGQAA_gcAIBwAAP8HACAmAACACAAgJwAAgQgAICgAAIIIACApAACDCAAgmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRsRAADMCAAgEwAAzggAIBcAAM8IACAZAADQCAAgHAAA0QgAICYAANIIACAnAADTCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHTAwQAAAAB1AMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABBRMAAPIKACAUAAD0CgAgmwMEAAAAAb8DAQAAAAHTAwQAAAABAgAAACoAIDwAAK4LACADAAAAKgAgPAAArgsAID0AAK0LACABNwAAvwwAMAIAAAAqACA3AACtCwAgAgAAAI4LACA3AACsCwAgA5sDBADYBgAhvwMBALkHACHTAwQA2AYAIQUTAADmCgAgFAAA6AoAIJsDBADYBgAhvwMBALkHACHTAwQA2AYAIQUTAADyCgAgFAAA9AoAIJsDBAAAAAG_AwEAAAAB0wMEAAAAAQYUAACUCwAgFQAAkwsAIJsDBAAAAAG_AwEAAAAB6gMBAAAAAZoEAQAAAAECAAAAJgAgPAAAugsAIAMAAAAmACA8AAC6CwAgPQAAuQsAIAE3AAC-DAAwCxIAALgGACAUAACJBgAgFQAAiAYAIJgDAAC5BgAwmQMAACQAEJoDAAC5BgAwmwMEAAAAAb8DAQDaBQAh0gMEANkFACHqAwEA2wUAIZoEAQDbBQAhAgAAACYAIDcAALkLACACAAAAtwsAIDcAALgLACAImAMAALYLADCZAwAAtwsAEJoDAAC2CwAwmwMEANkFACG_AwEA2gUAIdIDBADZBQAh6gMBANsFACGaBAEA2wUAIQiYAwAAtgsAMJkDAAC3CwAQmgMAALYLADCbAwQA2QUAIb8DAQDaBQAh0gMEANkFACHqAwEA2wUAIZoEAQDbBQAhBJsDBADYBgAhvwMBALkHACHqAwEAiQcAIZoEAQCJBwAhBhQAAPwKACAVAAD7CgAgmwMEANgGACG_AwEAuQcAIeoDAQCJBwAhmgQBAIkHACEGFAAAlAsAIBUAAJMLACCbAwQAAAABvwMBAAAAAeoDAQAAAAGaBAEAAAABBDwAAK8LADCrBAAAsAsAMK0EAACyCwAgsQQAALMLADAEPAAApgsAMKsEAACnCwAwrQQAAKkLACCxBAAAigsAMAQ8AACdCwAwqwQAAJ4LADCtBAAAoAsAILEEAACKCgAwAAAAAbgDAQAAAAEAAAAAAAc8AAC2DAAgPQAAvAwAIKsEAAC3DAAgrAQAALsMACCvBAAAQAAgsAQAAEAAILEEAABEACALPAAA3QsAMD0AAOILADCrBAAA3gsAMKwEAADfCwAwrQQAAOALACCuBAAA4QsAMK8EAADhCwAwsAQAAOELADCxBAAA4QsAMLIEAADjCwAwswQAAOQLADALPAAA1AsAMD0AANgLADCrBAAA1QsAMKwEAADWCwAwrQQAANcLACCuBAAAuAgAMK8EAAC4CAAwsAQAALgIADCxBAAAuAgAMLIEAADZCwAwswQAALsIADALPAAAywsAMD0AAM8LADCrBAAAzAsAMKwEAADNCwAwrQQAAM4LACCuBAAAuAgAMK8EAAC4CAAwsAQAALgIADCxBAAAuAgAMLIEAADQCwAwswQAALsIADAPBwAA1AcAIBgAANUHACAeAADWBwAgIgAA2AcAICUAANkHACCbAwQAAAABnwMIAAAAAakDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABuQMEAAAAAb0DBAAAAAG_AwEAAAABwAMBAAAAAQIAAAA-ACA8AADTCwAgAwAAAD4AIDwAANMLACA9AADSCwAgATcAALoMADACAAAAPgAgNwAA0gsAIAIAAAC8CAAgNwAA0QsAIAqbAwQA2AYAIZ8DCADaBgAhqQMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhuQMEANgGACG9AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEPBwAAvAcAIBgAAL0HACAeAAC-BwAgIgAAwAcAICUAAMEHACCbAwQA2AYAIZ8DCADaBgAhqQMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhuQMEANgGACG9AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEPBwAA1AcAIBgAANUHACAeAADWBwAgIgAA2AcAICUAANkHACCbAwQAAAABnwMIAAAAAakDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABuQMEAAAAAb0DBAAAAAG_AwEAAAABwAMBAAAAAQ8HAADUBwAgGAAA1QcAIB8AANcHACAiAADYBwAgJQAA2QcAIJsDBAAAAAGfAwgAAAABqQMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvgMEAAAAAb8DAQAAAAHAAwEAAAABAgAAAD4AIDwAANwLACADAAAAPgAgPAAA3AsAID0AANsLACABNwAAuQwAMAIAAAA-ACA3AADbCwAgAgAAALwIACA3AADaCwAgCpsDBADYBgAhnwMIANoGACGpAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG5AwQA2AYAIb4DBAC7BwAhvwMBALkHACHAAwEAiQcAIQ8HAAC8BwAgGAAAvQcAIB8AAL8HACAiAADABwAgJQAAwQcAIJsDBADYBgAhnwMIANoGACGpAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG5AwQA2AYAIb4DBAC7BwAhvwMBALkHACHAAwEAiQcAIQ8HAADUBwAgGAAA1QcAIB8AANcHACAiAADYBwAgJQAA2QcAIJsDBAAAAAGfAwgAAAABqQMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvgMEAAAAAb8DAQAAAAHAAwEAAAABCRsAAOkLACAcAADqCwAgHQAA6wsAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAaEEAQAAAAECAAAARAAgPAAA6AsAIAMAAABEACA8AADoCwAgPQAA5wsAIAE3AAC4DAAwDwMAAK4GACAbAACvBgAgHAAAsAYAIB0AALAGACCYAwAArAYAMJkDAABAABCaAwAArAYAMJsDBAAAAAGuAwAA7gXCAyKvA0AA4AUAIbADQADgBQAhvwMBAAAAAYsEBACtBgAhoQQBANsFACGkBAAAqwYAIAIAAABEACA3AADnCwAgAgAAAOULACA3AADmCwAgCpgDAADkCwAwmQMAAOULABCaAwAA5AsAMJsDBADZBQAhrgMAAO4FwgMirwNAAOAFACGwA0AA4AUAIb8DAQDaBQAhiwQEAK0GACGhBAEA2wUAIQqYAwAA5AsAMJkDAADlCwAQmgMAAOQLADCbAwQA2QUAIa4DAADuBcIDIq8DQADgBQAhsANAAOAFACG_AwEA2gUAIYsEBACtBgAhoQQBANsFACEGmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACGhBAEAiQcAIQkbAADICwAgHAAAyQsAIB0AAMoLACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhCRsAAOkLACAcAADqCwAgHQAA6wsAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAaEEAQAAAAEEPAAA3QsAMKsEAADeCwAwrQQAAOALACCxBAAA4QsAMAQ8AADUCwAwqwQAANULADCtBAAA1wsAILEEAAC4CAAwBDwAAMsLADCrBAAAzAsAMK0EAADOCwAgsQQAALgIADADPAAAtgwAIKsEAAC3DAAgsQQAAEQAIAAAAAAACzwAAPMLADA9AAD3CwAwqwQAAPQLADCsBAAA9QsAMK0EAAD2CwAgrgQAAMQIADCvBAAAxAgAMLAEAADECAAwsQQAAMQIADCyBAAA-AsAMLMEAADHCAAwBBgAAPMHACCbAwQAAAABqQMEAAAAAa8DQAAAAAECAAAAOAAgPAAA-wsAIAMAAAA4ACA8AAD7CwAgPQAA-gsAIAE3AAC1DAAwAgAAADgAIDcAAPoLACACAAAAyAgAIDcAAPkLACADmwMEANgGACGpAwQA2AYAIa8DQADmBgAhBBgAAPEHACCbAwQA2AYAIakDBADYBgAhrwNAAOYGACEEGAAA8wcAIJsDBAAAAAGpAwQAAAABrwNAAAAAAQQ8AADzCwAwqwQAAPQLADCtBAAA9gsAILEEAADECAAwAAG4AwEAAAABAAAAAAALPAAAhQwAMD0AAIkMADCrBAAAhgwAMKwEAACHDAAwrQQAAIgMACCuBAAArAgAMK8EAACsCAAwsAQAAKwIADCxBAAArAgAMLIEAACKDAAwswQAAK8IADAKBwAArwcAIBgAALAHACAiAACzBwAgMAAAsgcAIJsDBAAAAAGpAwQAAAABrwNAAAAAAbADQAAAAAG5AwQAAAABvAMAAAC8AwICAAAABQAgPAAAjQwAIAMAAAAFACA8AACNDAAgPQAAjAwAIAE3AAC0DAAwAgAAAAUAIDcAAIwMACACAAAAsAgAIDcAAIsMACAGmwMEANgGACGpAwQA2AYAIa8DQADmBgAhsANAAOYGACG5AwQA2AYAIbwDAACRB7wDIgoHAACSBwAgGAAAkwcAICIAAJYHACAwAACVBwAgmwMEANgGACGpAwQA2AYAIa8DQADmBgAhsANAAOYGACG5AwQA2AYAIbwDAACRB7wDIgoHAACvBwAgGAAAsAcAICIAALMHACAwAACyBwAgmwMEAAAAAakDBAAAAAGvA0AAAAABsANAAAAAAbkDBAAAAAG8AwAAALwDAgQ8AACFDAAwqwQAAIYMADCtBAAAiAwAILEEAACsCAAwAAG4AwEAAAABBQcAAJUMACAYAACWDAAgIgAAngwAIC8AALIMACAwAACzDAAgAbgDAQAAAAEHKgAAjAkAICwAAI0JACDlAwAAggcAIOwDAACCBwAg7QMAAIIHACDuAwAAggcAILQEAACOCQAgAbgDAQAAAAEdAwAAlQwAIAQAAKoMACAFAACVDAAgBgAAqgwAIAgAAK8MACALAACsDAAgEAAAsAwAIBQAAMALACAcAACcDAAgJgAAjwwAICcAAKYMACAtAACMCQAgLgAAqAwAINUDAACCBwAg1gMAAIIHACDXAwAAggcAINgDAACCBwAg2QMAAIIHACDsAwAAggcAIPIDAACCBwAgiwQAAIIHACCMBAAAggcAII4EAACCBwAgjwQAAIIHACCQBAAAggcAIJYEAACCBwAglwQAAIIHACCZBAAAggcAILQEAACxDAAgEBEAAJUMACASAACiDAAgEwAAoQwAIBcAAKUMACAZAAD9CwAgHAAAnAwAICYAAI8MACAnAACmDAAgKAAApwwAICkAAKgMACDOAwAAggcAIM8DAACCBwAg0AMAAIIHACDRAwAAggcAINcDAACCBwAgtAQAAKkMACAAAxEAAJUMACAYAACWDAAgIwAAlwwAIAoHAACVDAAgGAAAlgwAIB4AAJoMACAfAACaDAAgIgAAngwAICUAAJcMACC9AwAAggcAIL4DAACCBwAgwAMAAIIHACC0BAAAnwwAIAcDAACaDAAgGwAAmwwAIBwAAJwMACAdAACcDAAgiwQAAIIHACChBAAAggcAILQEAACdDAAgAAABuAMBAAAAAQABuAMBAAAAAQMZAAD9CwAgoQQAAIIHACC0BAAA_gsAIAYSAACiDAAgFAAAwAsAIBUAAL8LACDqAwAAggcAIJoEAACCBwAgtAQAAKQMACALFAAAwAsAIBUAAL8LACAWAAC-CwAgmgQAAIIHACCbBAAAggcAIJwEAACCBwAgnQQAAIIHACCeBAAAggcAIJ8EAACCBwAgoAQAAIIHACC0BAAAwQsAIAG4AwEAAAABAbgDAQAAAAEEEgAAogwAIBMAAKEMACAUAADACwAgtAQAAKMMACAAAAABuAMBAAAAAQABuAMBAAAAAQQJAACVDAAgCgAAqgwAIA8AAK0JACC0BAAAqwwAIAIMAACtCQAgtAQAAK4JACABuAMBAAAAAQAAAbgDAQAAAAEEHgAAggcAIDEAAI8MACChBAAAggcAILQEAACQDAAgAAabAwQAAAABqQMEAAAAAa8DQAAAAAGwA0AAAAABuQMEAAAAAbwDAAAAvAMCA5sDBAAAAAGpAwQAAAABrwNAAAAAAQoDAADsCwAgHAAA6gsAIB0AAOsLACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAGLBAQAAAABoQQBAAAAAQIAAABEACA8AAC2DAAgBpsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAaEEAQAAAAEKmwMEAAAAAZ8DCAAAAAGpAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAbkDBAAAAAG-AwQAAAABvwMBAAAAAcADAQAAAAEKmwMEAAAAAZ8DCAAAAAGpAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAbkDBAAAAAG9AwQAAAABvwMBAAAAAcADAQAAAAEDAAAAQAAgPAAAtgwAID0AAL0MACAMAAAAQAAgAwAAxwsAIBwAAMkLACAdAADKCwAgNwAAvQwAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhiwQEALsHACGhBAEAiQcAIQoDAADHCwAgHAAAyQsAIB0AAMoLACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIYsEBAC7BwAhoQQBAIkHACEEmwMEAAAAAb8DAQAAAAHqAwEAAAABmgQBAAAAAQObAwQAAAABvwMBAAAAAdMDBAAAAAESmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0wMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQsUAAC9CwAgFQAAvAsAIJsDBAAAAAG_AwEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBAEAAAABoAQBAAAAAQIAAADMAQAgPAAAwQwAIAObAwQAAAABvwMBAAAAAdIDBAAAAAESmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQMAAADPAQAgPAAAwQwAID0AAMcMACANAAAAzwEAIBQAAJwLACAVAACbCwAgNwAAxwwAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQsUAACcCwAgFQAAmwsAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQsUAAC9CwAgFgAAuwsAIJsDBAAAAAG_AwEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBAEAAAABoAQBAAAAAQIAAADMAQAgPAAAyAwAIAcSAACSCwAgFAAAlAsAIJsDBAAAAAG_AwEAAAAB0gMEAAAAAeoDAQAAAAGaBAEAAAABAgAAACYAIDwAAMoMACASmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdMDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQMAAADPAQAgPAAAyAwAID0AAM8MACANAAAAzwEAIBQAAJwLACAWAACaCwAgNwAAzwwAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQsUAACcCwAgFgAAmgsAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQMAAAAkACA8AADKDAAgPQAA0gwAIAkAAAAkACASAAD6CgAgFAAA_AoAIDcAANIMACCbAwQA2AYAIb8DAQC5BwAh0gMEANgGACHqAwEAiQcAIZoEAQCJBwAhBxIAAPoKACAUAAD8CgAgmwMEANgGACG_AwEAuQcAIdIDBADYBgAh6gMBAIkHACGaBAEAiQcAISUDAAC3CgAgBAAAuAoAIAUAAMcKACAGAAC5CgAgCwAAuwoAIBAAALwKACAUAAC9CgAgHAAAvwoAICYAAMAKACAnAADBCgAgLQAAvgoAIC4AAMIKACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB7AMBAAAAAfIDBAAAAAGLBAQAAAABjAQEAAAAAY0EAQAAAAGOBAEAAAABjwQBAAAAAZAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAQAAAAGVBAAAAJUEApYEAQAAAAGXBEAAAAABmAQgAAAAAZkEQAAAAAECAAAACgAgPAAA0wwAIAMAAAAHACA8AADTDAAgPQAA1wwAICcAAAAHACADAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACA3AADXDAAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISUDAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhJQMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBQAAL0KACAcAAC_CgAgJgAAwAoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AADYDAAgJQMAALcKACAEAAC4CgAgBQAAxwoAIAgAALoKACALAAC7CgAgEAAAvAoAIBQAAL0KACAcAAC_CgAgJgAAwAoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AADaDAAgGJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYwEBAAAAAGNBAEAAAABjgQBAAAAAY8EAQAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlQQAAACVBAKWBAEAAAABlwRAAAAAAZgEIAAAAAGZBEAAAAABCAkAAM4KACAPAACfCgAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAAB-gMEAAAAAQIAAAAeACA8AADdDAAgJQMAALcKACAFAADHCgAgBgAAuQoAIAgAALoKACALAAC7CgAgEAAAvAoAIBQAAL0KACAcAAC_CgAgJgAAwAoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AADfDAAgAwAAABIAIDwAAN0MACA9AADjDAAgCgAAABIAIAkAALQJACAPAAC2CQAgNwAA4wwAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAh-gMEANgGACEICQAAtAkAIA8AALYJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIfoDBADYBgAhGJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGNBAEAAAABjgQBAAAAAY8EAQAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlQQAAACVBAKWBAEAAAABlwRAAAAAAZgEIAAAAAGZBEAAAAABB5sDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB6gMAAACJBAKJBAEAAAABigQBAAAAAQWbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAESmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_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_DAAgCQAAAOECACA3AAD_DAAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh9QMAAJ0J9QMi9gMBALkHACH4AwAAngn4AyIHmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh9QMAAJ0J9QMi9gMBALkHACH4AwAAngn4AyIDAAAAEgAgPAAA-wwAID0AAIINACAKAAAAEgAgCQAAtAkAIAoAALUJACA3AACCDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACH6AwQA2AYAIQgJAAC0CQAgCgAAtQkAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAh-gMEANgGACERmwMEAAAAAa4DAAAA6QMCrwNAAAAAAbADQAAAAAG5AwQAAAAB2wNAAAAAAdwDQAAAAAHdAwIAAAAB3gNAAAAAAd8DQAAAAAHhAwAAAOEDAuIDAgAAAAHjAwgAAAAB5AMIAAAAAeUDCAAAAAHmAwIAAAAB5wMCAAAAAQSbAwQAAAABrwNAAAAAAeoDAAAA6gMC6wMBAAAAAQwqAACKCQAgmwMEAAAAAZ8DCAAAAAGvA0AAAAABsANAAAAAAb8DAQAAAAHlAwgAAAAB5gMCAAAAAecDAgAAAAHsAwEAAAAB7QMIAAAAAe4DAgAAAAECAAAAiQMAIDwAAIUNACADAAAAjAMAIDwAAIUNACA9AACJDQAgDgAAAIwDACAqAADwCAAgNwAAiQ0AIJsDBADYBgAhnwMIANoGACGvA0AA5gYAIbADQADmBgAhvwMBALkHACHlAwgA3QgAIeYDAgDZBgAh5wMCANkGACHsAwEAiQcAIe0DCADdCAAh7gMCANsIACEMKgAA8AgAIJsDBADYBgAhnwMIANoGACGvA0AA5gYAIbADQADmBgAhvwMBALkHACHlAwgA3QgAIeYDAgDZBgAh5wMCANkGACHsAwEAiQcAIe0DCADdCAAh7gMCANsIACEMLAAAiwkAIJsDBAAAAAGfAwgAAAABrwNAAAAAAbADQAAAAAG_AwEAAAAB5QMIAAAAAeYDAgAAAAHnAwIAAAAB7AMBAAAAAe0DCAAAAAHuAwIAAAABAgAAAIkDACA8AACKDQAgJQMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBAAALwKACAUAAC9CgAgHAAAvwoAICYAAMAKACAnAADBCgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AACMDQAgAwAAAIwDACA8AACKDQAgPQAAkA0AIA4AAACMAwAgLAAA8QgAIDcAAJANACCbAwQA2AYAIZ8DCADaBgAhrwNAAOYGACGwA0AA5gYAIb8DAQC5BwAh5QMIAN0IACHmAwIA2QYAIecDAgDZBgAh7AMBAIkHACHtAwgA3QgAIe4DAgDbCAAhDCwAAPEIACCbAwQA2AYAIZ8DCADaBgAhrwNAAOYGACGwA0AA5gYAIb8DAQC5BwAh5QMIAN0IACHmAwIA2QYAIecDAgDZBgAh7AMBAIkHACHtAwgA3QgAIe4DAgDbCAAhAwAAAAcAIDwAAIwNACA9AACTDQAgJwAAAAcAIAMAAM0JACAEAADOCQAgBQAAzwkAIAYAANAJACAIAADRCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICYAANYJACAnAADXCQAgLgAA2AkAIDcAAJMNACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhJQMAAM0JACAEAADOCQAgBQAAzwkAIAYAANAJACAIAADRCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICYAANYJACAnAADXCQAgLgAA2AkAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIdUDAQCJBwAh1gMBAIkHACHXAwEAiQcAIdgDAQCJBwAh2QMBAIkHACHsAwEAiQcAIfIDBAC7BwAhiwQEALsHACGMBAQAuwcAIY0EAQC5BwAhjgQBAIkHACGPBAEAiQcAIZAEAQCJBwAhkQQBALkHACGSBAEAuQcAIZMEAQC5BwAhlQQAAMoJlQQilgQBAIkHACGXBEAAiAcAIZgEIADLCQAhmQRAAIgHACEGEgAA8woAIBMAAPIKACCbAwQAAAABvwMBAAAAAdIDBAAAAAHTAwQAAAABAgAAACoAIDwAAJQNACAHEgAAkgsAIBUAAJMLACCbAwQAAAABvwMBAAAAAdIDBAAAAAHqAwEAAAABmgQBAAAAAQIAAAAmACA8AACWDQAgCxUAALwLACAWAAC7CwAgmwMEAAAAAb8DAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBAEAAAABngQBAAAAAZ8EAQAAAAGgBAEAAAABAgAAAMwBACA8AACYDQAgJQMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBAAALwKACAcAAC_CgAgJgAAwAoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AACaDQAgA5sDBAAAAAGvA0AAAAABzAMEAAAAAQqbAwQAAAABnwMIAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvQMEAAAAAb4DBAAAAAG_AwEAAAABwAMBAAAAAQabAwQAAAABrwNAAAAAAbADQAAAAAG5AwQAAAABugMEAAAAAbwDAAAAvAMCB5sDBAAAAAGoAwQAAAABqwMAAACrAwKsAwgAAAABrgMAAACuAwKvA0AAAAABsANAAAAAAQabAwQAAAABrgMAAADGAwKvA0AAAAABsANAAAAAAcMDAAAAwwMCxAOAAAAAAQObAwQAAAABqAMEAAAAAa8DQAAAAAEDAAAAKAAgPAAAlA0AID0AAKQNACAIAAAAKAAgEgAA5woAIBMAAOYKACA3AACkDQAgmwMEANgGACG_AwEAuQcAIdIDBADYBgAh0wMEANgGACEGEgAA5woAIBMAAOYKACCbAwQA2AYAIb8DAQC5BwAh0gMEANgGACHTAwQA2AYAIQMAAAAkACA8AACWDQAgPQAApw0AIAkAAAAkACASAAD6CgAgFQAA-woAIDcAAKcNACCbAwQA2AYAIb8DAQC5BwAh0gMEANgGACHqAwEAiQcAIZoEAQCJBwAhBxIAAPoKACAVAAD7CgAgmwMEANgGACG_AwEAuQcAIdIDBADYBgAh6gMBAIkHACGaBAEAiQcAIQMAAADPAQAgPAAAmA0AID0AAKoNACANAAAAzwEAIBUAAJsLACAWAACaCwAgNwAAqg0AIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQsVAACbCwAgFgAAmgsAIJsDBADYBgAhvwMBALkHACGaBAEAiQcAIZsEAQCJBwAhnAQBAIkHACGdBAEAiQcAIZ4EAQCJBwAhnwQBAIkHACGgBAEAiQcAIQMAAAAHACA8AACaDQAgPQAArQ0AICcAAAAHACADAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgHAAA1QkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACA3AACtDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISUDAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgHAAA1QkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhBpsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAaEEAQAAAAECAAAAoQEAIDwAAK4NACAcEQAAzAgAIBIAAM0IACATAADOCAAgFwAAzwgAIBwAANEIACAmAADSCAAgJwAA0wgAICgAANQIACApAADVCAAgmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdMDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAECAAAAIgAgPAAAsA0AIAMAAACkAQAgPAAArg0AID0AALQNACAIAAAApAEAIDcAALQNACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhBpsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhoQQBAIkHACEDAAAAIAAgPAAAsA0AID0AALcNACAeAAAAIAAgEQAA-gcAIBIAAPsHACATAAD8BwAgFwAA_QcAIBwAAP8HACAmAACACAAgJwAAgQgAICgAAIIIACApAACDCAAgNwAAtw0AIJsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRwRAAD6BwAgEgAA-wcAIBMAAPwHACAXAAD9BwAgHAAA_wcAICYAAIAIACAnAACBCAAgKAAAgggAICkAAIMIACCbAwQA2AYAIagDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhzQMBALkHACHOAwEAiQcAIc8DAQCJBwAh0AMBAIkHACHRAwEAiQcAIdIDBADYBgAh0wMEANgGACHUAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEcEQAAzAgAIBIAAM0IACATAADOCAAgFwAAzwgAIBkAANAIACAcAADRCAAgJgAA0ggAICcAANMIACAoAADUCAAgmwMEAAAAAagDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAc0DAQAAAAHOAwEAAAABzwMBAAAAAdADAQAAAAHRAwEAAAAB0gMEAAAAAdMDBAAAAAHUAwQAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAECAAAAIgAgPAAAuA0AICUDAAC3CgAgBAAAuAoAIAUAAMcKACAGAAC5CgAgCAAAugoAIAsAALsKACAQAAC8CgAgFAAAvQoAIBwAAL8KACAmAADACgAgJwAAwQoAIC0AAL4KACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB7AMBAAAAAfIDBAAAAAGLBAQAAAABjAQEAAAAAY0EAQAAAAGOBAEAAAABjwQBAAAAAZAEAQAAAAGRBAEAAAABkgQBAAAAAZMEAQAAAAGVBAAAAJUEApYEAQAAAAGXBEAAAAABmAQgAAAAAZkEQAAAAAECAAAACgAgPAAAug0AIAMAAAAgACA8AAC4DQAgPQAAvg0AIB4AAAAgACARAAD6BwAgEgAA-wcAIBMAAPwHACAXAAD9BwAgGQAA_gcAIBwAAP8HACAmAACACAAgJwAAgQgAICgAAIIIACA3AAC-DQAgmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdMDBADYBgAh1AMEANgGACHVAwEAuQcAIdYDAQC5BwAh1wMBAIkHACHYAwEAuQcAIdkDAQC5BwAhHBEAAPoHACASAAD7BwAgEwAA_AcAIBcAAP0HACAZAAD-BwAgHAAA_wcAICYAAIAIACAnAACBCAAgKAAAgggAIJsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIQMAAAAHACA8AAC6DQAgPQAAwQ0AICcAAAAHACADAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgFAAA0wkAIBwAANUJACAmAADWCQAgJwAA1wkAIC0AANQJACA3AADBDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISUDAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgFAAA0wkAIBwAANUJACAmAADWCQAgJwAA1wkAIC0AANQJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhHBEAAMwIACASAADNCAAgEwAAzggAIBcAAM8IACAZAADQCAAgHAAA0QgAICYAANIIACAnAADTCAAgKQAA1QgAIJsDBAAAAAGoAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDBAAAAAHTAwQAAAAB1AMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABAgAAACIAIDwAAMINACADAAAAIAAgPAAAwg0AID0AAMYNACAeAAAAIAAgEQAA-gcAIBIAAPsHACATAAD8BwAgFwAA_QcAIBkAAP4HACAcAAD_BwAgJgAAgAgAICcAAIEIACApAACDCAAgNwAAxg0AIJsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRwRAAD6BwAgEgAA-wcAIBMAAPwHACAXAAD9BwAgGQAA_gcAIBwAAP8HACAmAACACAAgJwAAgQgAICkAAIMIACCbAwQA2AYAIagDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhzQMBALkHACHOAwEAiQcAIc8DAQCJBwAh0AMBAIkHACHRAwEAiQcAIdIDBADYBgAh0wMEANgGACHUAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEKAwAA7AsAIBsAAOkLACAcAADqCwAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABiwQEAAAAAaEEAQAAAAECAAAARAAgPAAAxw0AIAoDAADsCwAgGwAA6QsAIB0AAOsLACCbAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAGLBAQAAAABoQQBAAAAAQIAAABEACA8AADJDQAgHBEAAMwIACASAADNCAAgEwAAzggAIBcAAM8IACAZAADQCAAgJgAA0ggAICcAANMIACAoAADUCAAgKQAA1QgAIJsDBAAAAAGoAwQAAAABrgMAAADCAwKvA0AAAAABsANAAAAAAb8DAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDBAAAAAHTAwQAAAAB1AMEAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAABAgAAACIAIDwAAMsNACAlAwAAtwoAIAQAALgKACAFAADHCgAgBgAAuQoAIAgAALoKACALAAC7CgAgEAAAvAoAIBQAAL0KACAmAADACgAgJwAAwQoAIC0AAL4KACAuAADCCgAgmwMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAewDAQAAAAHyAwQAAAABiwQEAAAAAYwEBAAAAAGNBAEAAAABjgQBAAAAAY8EAQAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlQQAAACVBAKWBAEAAAABlwRAAAAAAZgEIAAAAAGZBEAAAAABAgAAAAoAIDwAAM0NACAFmwMEAAAAAa8DQAAAAAGwA0AAAAABsQMEAAAAAbIDCAAAAAEEmwMEAAAAAZwDBAAAAAGeAwIAAAABnwMIAAAAAQMAAABAACA8AADHDQAgPQAA0w0AIAwAAABAACADAADHCwAgGwAAyAsAIBwAAMkLACA3AADTDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACGLBAQAuwcAIaEEAQCJBwAhCgMAAMcLACAbAADICwAgHAAAyQsAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhiwQEALsHACGhBAEAiQcAIQMAAABAACA8AADJDQAgPQAA1g0AIAwAAABAACADAADHCwAgGwAAyAsAIB0AAMoLACA3AADWDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACGLBAQAuwcAIaEEAQCJBwAhCgMAAMcLACAbAADICwAgHQAAygsAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhiwQEALsHACGhBAEAiQcAIQMAAAAgACA8AADLDQAgPQAA2Q0AIB4AAAAgACARAAD6BwAgEgAA-wcAIBMAAPwHACAXAAD9BwAgGQAA_gcAICYAAIAIACAnAACBCAAgKAAAgggAICkAAIMIACA3AADZDQAgmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdMDBADYBgAh1AMEANgGACHVAwEAuQcAIdYDAQC5BwAh1wMBAIkHACHYAwEAuQcAIdkDAQC5BwAhHBEAAPoHACASAAD7BwAgEwAA_AcAIBcAAP0HACAZAAD-BwAgJgAAgAgAICcAAIEIACAoAACCCAAgKQAAgwgAIJsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIQMAAAAHACA8AADNDQAgPQAA3A0AICcAAAAHACADAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgFAAA0wkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACA3AADcDQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAISUDAADNCQAgBAAAzgkAIAUAAM8JACAGAADQCQAgCAAA0QkAIAsAALUKACAQAADSCQAgFAAA0wkAICYAANYJACAnAADXCQAgLQAA1AkAIC4AANgJACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhBx4BAAAAAZsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAABvwMBAAAAAaEEAQAAAAECAAAAAQAgPAAA3Q0AIBwRAADMCAAgEgAAzQgAIBMAAM4IACAXAADPCAAgGQAA0AgAIBwAANEIACAnAADTCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQIAAAAiACA8AADfDQAgJQMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBAAALwKACAUAAC9CgAgHAAAvwoAICcAAMEKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AADhDQAgBZsDBAAAAAGeAwgAAAABrwNAAAAAAbMDQAAAAAG0AwEAAAABBZsDBAAAAAGdAwQAAAABrwNAAAAAAbADQAAAAAGyAwgAAAABAwAAAI0BACA8AADdDQAgPQAA5w0AIAkAAACNAQAgHgEAiQcAITcAAOcNACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhBx4BAIkHACGbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIaEEAQCJBwAhAwAAACAAIDwAAN8NACA9AADqDQAgHgAAACAAIBEAAPoHACASAAD7BwAgEwAA_AcAIBcAAP0HACAZAAD-BwAgHAAA_wcAICcAAIEIACAoAACCCAAgKQAAgwgAIDcAAOoNACCbAwQA2AYAIagDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhzQMBALkHACHOAwEAiQcAIc8DAQCJBwAh0AMBAIkHACHRAwEAiQcAIdIDBADYBgAh0wMEANgGACHUAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEcEQAA-gcAIBIAAPsHACATAAD8BwAgFwAA_QcAIBkAAP4HACAcAAD_BwAgJwAAgQgAICgAAIIIACApAACDCAAgmwMEANgGACGoAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG_AwEAuQcAIc0DAQC5BwAhzgMBAIkHACHPAwEAiQcAIdADAQCJBwAh0QMBAIkHACHSAwQA2AYAIdMDBADYBgAh1AMEANgGACHVAwEAuQcAIdYDAQC5BwAh1wMBAIkHACHYAwEAuQcAIdkDAQC5BwAhAwAAAAcAIDwAAOENACA9AADtDQAgJwAAAAcAIAMAAM0JACAEAADOCQAgBQAAzwkAIAYAANAJACAIAADRCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICcAANcJACAtAADUCQAgLgAA2AkAIDcAAO0NACCbAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACHVAwEAiQcAIdYDAQCJBwAh1wMBAIkHACHYAwEAiQcAIdkDAQCJBwAh7AMBAIkHACHyAwQAuwcAIYsEBAC7BwAhjAQEALsHACGNBAEAuQcAIY4EAQCJBwAhjwQBAIkHACGQBAEAiQcAIZEEAQC5BwAhkgQBALkHACGTBAEAuQcAIZUEAADKCZUEIpYEAQCJBwAhlwRAAIgHACGYBCAAywkAIZkEQACIBwAhJQMAAM0JACAEAADOCQAgBQAAzwkAIAYAANAJACAIAADRCQAgCwAAtQoAIBAAANIJACAUAADTCQAgHAAA1QkAICcAANcJACAtAADUCQAgLgAA2AkAIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIdUDAQCJBwAh1gMBAIkHACHXAwEAiQcAIdgDAQCJBwAh2QMBAIkHACHsAwEAiQcAIfIDBAC7BwAhiwQEALsHACGMBAQAuwcAIY0EAQC5BwAhjgQBAIkHACGPBAEAiQcAIZAEAQCJBwAhkQQBALkHACGSBAEAuQcAIZMEAQC5BwAhlQQAAMoJlQQilgQBAIkHACGXBEAAiAcAIZgEIADLCQAhmQRAAIgHACELBwAArwcAIBgAALAHACAiAACzBwAgLwAAsQcAIJsDBAAAAAGpAwQAAAABrwNAAAAAAbADQAAAAAG5AwQAAAABugMEAAAAAbwDAAAAvAMCAgAAAAUAIDwAAO4NACADAAAAAwAgPAAA7g0AID0AAPINACANAAAAAwAgBwAAkgcAIBgAAJMHACAiAACWBwAgLwAAlAcAIDcAAPINACCbAwQA2AYAIakDBADYBgAhrwNAAOYGACGwA0AA5gYAIbkDBADYBgAhugMEANgGACG8AwAAkQe8AyILBwAAkgcAIBgAAJMHACAiAACWBwAgLwAAlAcAIJsDBADYBgAhqQMEANgGACGvA0AA5gYAIbADQADmBgAhuQMEANgGACG6AwQA2AYAIbwDAACRB7wDIgsHAACvBwAgGAAAsAcAIC8AALEHACAwAACyBwAgmwMEAAAAAakDBAAAAAGvA0AAAAABsANAAAAAAbkDBAAAAAG6AwQAAAABvAMAAAC8AwICAAAABQAgPAAA8w0AIBAHAADUBwAgGAAA1QcAIB4AANYHACAfAADXBwAgJQAA2QcAIJsDBAAAAAGfAwgAAAABqQMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvQMEAAAAAb4DBAAAAAG_AwEAAAABwAMBAAAAAQIAAAA-ACA8AAD1DQAgAwAAAAMAIDwAAPMNACA9AAD5DQAgDQAAAAMAIAcAAJIHACAYAACTBwAgLwAAlAcAIDAAAJUHACA3AAD5DQAgmwMEANgGACGpAwQA2AYAIa8DQADmBgAhsANAAOYGACG5AwQA2AYAIboDBADYBgAhvAMAAJEHvAMiCwcAAJIHACAYAACTBwAgLwAAlAcAIDAAAJUHACCbAwQA2AYAIakDBADYBgAhrwNAAOYGACGwA0AA5gYAIbkDBADYBgAhugMEANgGACG8AwAAkQe8AyIDAAAAPAAgPAAA9Q0AID0AAPwNACASAAAAPAAgBwAAvAcAIBgAAL0HACAeAAC-BwAgHwAAvwcAICUAAMEHACA3AAD8DQAgmwMEANgGACGfAwgA2gYAIakDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAhvQMEALsHACG-AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEQBwAAvAcAIBgAAL0HACAeAAC-BwAgHwAAvwcAICUAAMEHACCbAwQA2AYAIZ8DCADaBgAhqQMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhuQMEANgGACG9AwQAuwcAIb4DBAC7BwAhvwMBALkHACHAAwEAiQcAIRwRAADMCAAgEgAAzQgAIBMAAM4IACAXAADPCAAgGQAA0AgAIBwAANEIACAmAADSCAAgKAAA1AgAICkAANUIACCbAwQAAAABqAMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG_AwEAAAABzQMBAAAAAc4DAQAAAAHPAwEAAAAB0AMBAAAAAdEDAQAAAAHSAwQAAAAB0wMEAAAAAdQDBAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAQIAAAAiACA8AAD9DQAgJQMAALcKACAEAAC4CgAgBQAAxwoAIAYAALkKACAIAAC6CgAgCwAAuwoAIBAAALwKACAUAAC9CgAgHAAAvwoAICYAAMAKACAtAAC-CgAgLgAAwgoAIJsDBAAAAAGuAwAAAMIDAq8DQAAAAAGwA0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHsAwEAAAAB8gMEAAAAAYsEBAAAAAGMBAQAAAABjQQBAAAAAY4EAQAAAAGPBAEAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZUEAAAAlQQClgQBAAAAAZcEQAAAAAGYBCAAAAABmQRAAAAAAQIAAAAKACA8AAD_DQAgBJsDBAAAAAGdAwQAAAABngMCAAAAAZ8DCAAAAAEDAAAAIAAgPAAA_Q0AID0AAIQOACAeAAAAIAAgEQAA-gcAIBIAAPsHACATAAD8BwAgFwAA_QcAIBkAAP4HACAcAAD_BwAgJgAAgAgAICgAAIIIACApAACDCAAgNwAAhA4AIJsDBADYBgAhqAMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAhvwMBALkHACHNAwEAuQcAIc4DAQCJBwAhzwMBAIkHACHQAwEAiQcAIdEDAQCJBwAh0gMEANgGACHTAwQA2AYAIdQDBADYBgAh1QMBALkHACHWAwEAuQcAIdcDAQCJBwAh2AMBALkHACHZAwEAuQcAIRwRAAD6BwAgEgAA-wcAIBMAAPwHACAXAAD9BwAgGQAA_gcAIBwAAP8HACAmAACACAAgKAAAgggAICkAAIMIACCbAwQA2AYAIagDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIb8DAQC5BwAhzQMBALkHACHOAwEAiQcAIc8DAQCJBwAh0AMBAIkHACHRAwEAiQcAIdIDBADYBgAh0wMEANgGACHUAwQA2AYAIdUDAQC5BwAh1gMBALkHACHXAwEAiQcAIdgDAQC5BwAh2QMBALkHACEDAAAABwAgPAAA_w0AID0AAIcOACAnAAAABwAgAwAAzQkAIAQAAM4JACAFAADPCQAgBgAA0AkAIAgAANEJACALAAC1CgAgEAAA0gkAIBQAANMJACAcAADVCQAgJgAA1gkAIC0AANQJACAuAADYCQAgNwAAhw4AIJsDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIdUDAQCJBwAh1gMBAIkHACHXAwEAiQcAIdgDAQCJBwAh2QMBAIkHACHsAwEAiQcAIfIDBAC7BwAhiwQEALsHACGMBAQAuwcAIY0EAQC5BwAhjgQBAIkHACGPBAEAiQcAIZAEAQCJBwAhkQQBALkHACGSBAEAuQcAIZMEAQC5BwAhlQQAAMoJlQQilgQBAIkHACGXBEAAiAcAIZgEIADLCQAhmQRAAIgHACElAwAAzQkAIAQAAM4JACAFAADPCQAgBgAA0AkAIAgAANEJACALAAC1CgAgEAAA0gkAIBQAANMJACAcAADVCQAgJgAA1gkAIC0AANQJACAuAADYCQAgmwMEANgGACGuAwAAugfCAyKvA0AA5gYAIbADQADmBgAh1QMBAIkHACHWAwEAiQcAIdcDAQCJBwAh2AMBAIkHACHZAwEAiQcAIewDAQCJBwAh8gMEALsHACGLBAQAuwcAIYwEBAC7BwAhjQQBALkHACGOBAEAiQcAIY8EAQCJBwAhkAQBAIkHACGRBAEAuQcAIZIEAQC5BwAhkwQBALkHACGVBAAAygmVBCKWBAEAiQcAIZcEQACIBwAhmAQgAMsJACGZBEAAiAcAIRAHAADUBwAgGAAA1QcAIB4AANYHACAfAADXBwAgIgAA2AcAIJsDBAAAAAGfAwgAAAABqQMEAAAAAa4DAAAAwgMCrwNAAAAAAbADQAAAAAG5AwQAAAABvQMEAAAAAb4DBAAAAAG_AwEAAAABwAMBAAAAAQIAAAA-ACA8AACIDgAgChEAAPYGACAYAAD3BgAgmwMEAAAAAagDBAAAAAGpAwQAAAABqwMAAACrAwKsAwgAAAABrgMAAACuAwKvA0AAAAABsANAAAAAAQIAAABbACA8AACKDgAgAwAAADwAIDwAAIgOACA9AACODgAgEgAAADwAIAcAALwHACAYAAC9BwAgHgAAvgcAIB8AAL8HACAiAADABwAgNwAAjg4AIJsDBADYBgAhnwMIANoGACGpAwQA2AYAIa4DAAC6B8IDIq8DQADmBgAhsANAAOYGACG5AwQA2AYAIb0DBAC7BwAhvgMEALsHACG_AwEAuQcAIcADAQCJBwAhEAcAALwHACAYAAC9BwAgHgAAvgcAIB8AAL8HACAiAADABwAgmwMEANgGACGfAwgA2gYAIakDBADYBgAhrgMAALoHwgMirwNAAOYGACGwA0AA5gYAIbkDBADYBgAhvQMEALsHACG-AwQAuwcAIb8DAQC5BwAhwAMBAIkHACEDAAAAWQAgPAAAig4AID0AAJEOACAMAAAAWQAgEQAA5wYAIBgAAOgGACA3AACRDgAgmwMEANgGACGoAwQA2AYAIakDBADYBgAhqwMAAOQGqwMirAMIANoGACGuAwAA5QauAyKvA0AA5gYAIbADQADmBgAhChEAAOcGACAYAADoBgAgmwMEANgGACGoAwQA2AYAIakDBADYBgAhqwMAAOQGqwMirAMIANoGACGuAwAA5QauAyKvA0AA5gYAIbADQADmBgAhAg0AJjEGAgYHAAMNACUYAAoiiAEXLwABMIcBJA4DCAMECwMFDAMGDQMIEQQLEwUNACMQHwUUIwocdhQmdwIneBktbh8ueR0BBwADBAkAAwoUAw0ACQ8YBgILAAUOAAcCDBkGDQAIAQwaAAIKGwAPHAALDQAeEQADEgALEwAMFwANGTkRHD8UJlgCJ1wZKGAcKWQdBA0AEBQyChUxDRYnDAQNAA8SAAsULgoVKw0EDQAOEgALEwAMFCwKARQtAAIUMAAVLwADFDUAFTQAFjMAAhgAChoAEgINABMZOhEBGTsABwcAAw0AGxgACh5BFR9LFSJPFyVTGAUDQhUNABYbRRUcRhQdRxQDG0gAHEkAHUoAAiAAFCEAAgIgABQkABkEDQAaEQADGAAKI1QYASNVAAIiVgAlVwABGAAKAhEAAxgACgYZZQAcZgAmZwAnaAAoaQApagACBwADKwAgAw0AIipvHyxzIQErACACKnQALHUACgR6AAZ7AAh8ABB9ABR-AByAAQAmgQEAJ4IBAC1_AC6DAQABIQACAiKKAQAwiQEAATGLAQAABQ0AKUIAKkMAK0QALEUALQAAAAAABQ0AKUIAKkMAK0QALEUALQUNADBCADFDADJEADNFADQAAAAAAAUNADBCADFDADJEADNFADQFDQA3QgA4QwA5RAA6RQA7AAAAAAAFDQA3QgA4QwA5RAA6RQA7BQ0APkIAP0MAQEQAQUUAQgAAAAAABQ0APkIAP0MAQEQAQUUAQgUNAEVCAEZDAEdEAEhFAEkAAAAAAAUNAEVCAEZDAEdEAEhFAEkFDQBMQgBNQwBORABPRQBQAAAAAAAFDQBMQgBNQwBORABPRQBQBQ0AU0IAVEMAVUQAVkUAVwAAAAAABQ0AU0IAVEMAVUQAVkUAVwUNAFpCAFtDAFxEAF1FAF4AAAAAAAUNAFpCAFtDAFxEAF1FAF4ABQ0AYkIAY0MAZEQAZUUAZgAAAAAABQ0AYkIAY0MAZEQAZUUAZgUNAGlCAGpDAGtEAGxFAG0AAAAAAAUNAGlCAGpDAGtEAGxFAG0FDQBwQgBxQwByRABzRQB0AAAAAAAFDQBwQgBxQwByRABzRQB0BQ0Ad0IAeEMAeUQAekUAewAAAAAABQ0Ad0IAeEMAeUQAekUAewUNAH5CAH9DAIABRACBAUUAggEAAAAAAAUNAH5CAH9DAIABRACBAUUAggEFDQCFAUIAhgFDAIcBRACIAUUAiQEAAAAAAAUNAIUBQgCGAUMAhwFEAIgBRQCJAQUNAIwBQgCNAUMAjgFEAI8BRQCQAQAAAAAABQ0AjAFCAI0BQwCOAUQAjwFFAJABBQ0AkwFCAJQBQwCVAUQAlgFFAJcBAAAAAAAFDQCTAUIAlAFDAJUBRACWAUUAlwEFDQCaAUIAmwFDAJwBRACdAUUAngEAAAAAAAUNAJoBQgCbAUMAnAFEAJ0BRQCeAQUNAKEBQgCiAUMAowFEAKQBRQClAQAAAAAABQ0AoQFCAKIBQwCjAUQApAFFAKUBBQ0AqAFCAKkBQwCqAUQAqwFFAKwBAAAAAAAFDQCoAUIAqQFDAKoBRACrAUUArAEFDQCvAUIAsAFDALEBRACyAUUAswEAAAAAAAUNAK8BQgCwAUMAsQFEALIBRQCzAQUNALYBQgC3AUMAuAFEALkBRQC6AQAAAAAABQ0AtgFCALcBQwC4AUQAuQFFALoBBQ0AvQFCAL4BQwC_AUQAwAFFAMEBAAAAAAAFDQC9AUIAvgFDAL8BRADAAUUAwQEFDQDEAUIAxQFDAMYBRADHAUUAyAEAAAAAAAUNAMQBQgDFAUMAxgFEAMcBRQDIAQUNAMsBQgDMAUMAzQFEAM4BRQDPAQAAAAAABQ0AywFCAMwBQwDNAUQAzgFFAM8BBQ0A0gFCANMBQwDUAUQA1QFFANYBAAAAAAAFDQDSAUIA0wFDANQBRADVAUUA1gEyAgEzjAEBNI8BATWQAQE2kQEBOJMBATmVASc6lwEBO5kBJz6aAQE_mwEBQJwBJ0afAShHoAEuSKIBEkmjARJKpgESS6cBEkyoARJNqgESTqwBJ0-uARJQsAEnUbEBElKyARJTswEnVLYBL1W3ATVWuAEVV7kBFVi6ARVZuwEVWrwBFVu-ARVcwAEnXcIBFV7EASdfxQEVYMYBFWHHASdiygE2Y8sBPGTNAQtlzgELZtEBC2fSAQto0wELadUBC2rXASdr2QELbNsBJ23cAQtu3QELb94BJ3DhAT1x4gFDcuMBDHPkAQx05QEMdeYBDHbnAQx36QEMeOsBJ3ntAQx67wEne_ABDHzxAQx98gEnfvUBRH_2AUqAAfcBDYEB-AENggH5AQ2DAfoBDYQB-wENhQH9AQ2GAf8BJ4cBgQINiAGDAieJAYQCDYoBhQINiwGGAieMAYkCS40BigJRjgGLAgOPAYwCA5ABjQIDkQGOAgOSAY8CA5MBkQIDlAGTAieVAZUCA5YBlwInlwGYAgOYAZkCA5kBmgInmgGdAlKbAZ4CWJwBnwIEnQGgAgSeAaECBJ8BogIEoAGjAgShAaUCBKIBpwInowGpAgSkAasCJ6UBrAIEpgGtAgSnAa4CJ6gBsQJZqQGyAl-qAbQCYKsBtQJgrAG4AmCtAbkCYK4BugJgrwG8AmCwAb4CJ7EBwAJgsgHCAiezAcMCYLQBxAJgtQHFAie2AcgCYbcByQJnuAHKAgW5AcsCBboBzAIFuwHNAgW8Ac4CBb0B0AIFvgHSAie_AdQCBcAB1gInwQHXAgXCAdgCBcMB2QInxAHcAmjFAd0CbsYB3wIHxwHgAgfIAeMCB8kB5AIHygHlAgfLAecCB8wB6QInzQHrAgfOAe0CJ88B7gIH0AHvAgfRAfACJ9IB8wJv0wH0AnXUAfUCBtUB9gIG1gH3AgbXAfgCBtgB-QIG2QH7AgbaAf0CJ9sB_wIG3AGBAyfdAYIDBt4BgwMG3wGEAyfgAYcDduEBiAN84gGKAyDjAYsDIOQBjgMg5QGPAyDmAZADIOcBkgMg6AGUAyfpAZYDIOoBmAMn6wGZAyDsAZoDIO0BmwMn7gGeA33vAZ8DgwHwAaADIfEBoQMh8gGiAyHzAaMDIfQBpAMh9QGmAyH2AagDJ_cBqgMh-AGsAyf5Aa0DIfoBrgMh-wGvAyf8AbIDhAH9AbMDigH-AbQDH_8BtQMfgAK2Ax-BArcDH4ICuAMfgwK6Ax-EArwDJ4UCvgMfhgLAAyeHAsEDH4gCwgMfiQLDAyeKAsYDiwGLAscDkQGMAsgDCo0CyQMKjgLKAwqPAssDCpACzAMKkQLOAwqSAtADJ5MC0gMKlALUAyeVAtUDCpYC1gMKlwLXAyeYAtoDkgGZAtsDmAGaAtwDEZsC3QMRnALeAxGdAt8DEZ4C4AMRnwLiAxGgAuQDJ6EC5gMRogLoAyejAukDEaQC6gMRpQLrAyemAu4DmQGnAu8DnwGoAvADHakC8QMdqgLyAx2rAvMDHawC9AMdrQL2Ax2uAvgDJ68C-gMdsAL8AyexAv0DHbIC_gMdswL_Aye0AoIEoAG1AoMEpgG2AoQEHLcChQQcuAKGBBy5AocEHLoCiAQcuwKKBBy8AowEJ70CjgQcvgKQBCe_ApEEHMACkgQcwQKTBCfCApYEpwHDApcErQHEApgEFMUCmQQUxgKaBBTHApsEFMgCnAQUyQKeBBTKAqAEJ8sCogQUzAKkBCfNAqUEFM4CpgQUzwKnBCfQAqoErgHRAqsEtAHSAqwEAtMCrQQC1AKuBALVAq8EAtYCsAQC1wKyBALYArQEJ9kCtgQC2gK4BCfbArkEAtwCugQC3QK7BCfeAr4EtQHfAr8EuwHgAsAEJOECwQQk4gLCBCTjAsMEJOQCxAQk5QLGBCTmAsgEJ-cCygQk6ALMBCfpAs0EJOoCzgQk6wLPBCfsAtIEvAHtAtMEwgHuAtQEF-8C1QQX8ALWBBfxAtcEF_IC2AQX8wLaBBf0AtwEJ_UC3gQX9gLgBCf3AuEEF_gC4gQX-QLjBCf6AuYEwwH7AucEyQH8AugEGf0C6QQZ_gLqBBn_AusEGYAD7AQZgQPuBBmCA_AEJ4MD8gQZhAP0BCeFA_UEGYYD9gQZhwP3BCeIA_oEygGJA_sE0AGKA_wEGIsD_QQYjAP-BBiNA_8EGI4DgAUYjwOCBRiQA4QFJ5EDhgUYkgOIBSeTA4kFGJQDigUYlQOLBSeWA44F0QGXA48F1wE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.mysql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.mysql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/enums.js
var Status = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DISCONTINUED: "DISCONTINUED"
};
var UserType = {
  ADMIN: "ADMIN",
  ADMIN_STAFF: "ADMIN_STAFF",
  KITCHEN: "KITCHEN",
  KITCHEN_STAFF: "KITCHEN_STAFF"
};
var DocumentType = {
  FSSAI: "FSSAI",
  GST: "GST"
};
var Unit = {
  KG: "KG",
  GM: "GM",
  MG: "MG",
  LITER: "LITER",
  ML: "ML",
  ITEM: "ITEM",
  PIECE: "PIECE",
  DOZEN: "DOZEN",
  PAIR: "PAIR",
  TRAY: "TRAY",
  PACKET: "PACKET",
  BOX: "BOX",
  BOTTLE: "BOTTLE",
  CAN: "CAN",
  JAR: "JAR",
  POUCH: "POUCH",
  SACHET: "SACHET",
  BAG: "BAG",
  SACK: "SACK",
  CARTON: "CARTON",
  CONTAINER: "CONTAINER",
  SPOON: "SPOON",
  TSP: "TSP",
  TBSP: "TBSP",
  CUP: "CUP",
  BOWL: "BOWL",
  PLATE: "PLATE",
  SLICE: "SLICE",
  ROLL: "ROLL",
  PORTION: "PORTION",
  SERVING: "SERVING"
};

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/core/helpers/debug.ts
var APP_DEBUG = process.env.APP_DEBUG === "true";
var debug = (...args) => {
  if (!APP_DEBUG) return;
  console.log("[DEBUG]", ...args);
};
var debugError = (...args) => {
  if (!APP_DEBUG) return;
  console.error("[DEBUG ERROR]", ...args);
};
var debugWarn = (...args) => {
  if (!APP_DEBUG) return;
  console.warn("[DEBUG WARN]", ...args);
};
var debugHelper = {
  debug,
  debugError,
  debugWarn
};
var debug_default = debugHelper;

// lib/prisma.ts
var APP_DEBUG2 = process.env.APP_DEBUG === "true";
var PRISMA_QUERY_LOG = process.env.PRISMA_QUERY_LOG === "true";
var globalForPrisma = globalThis;
var envNumber2 = (key, fallback) => {
  const value = Number(getDatabaseEnv(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};
var adapter = new PrismaMariaDb({
  host: getDatabaseHost(),
  port: getDatabasePort(),
  user: getDatabaseEnv("DATABASE_USER"),
  password: getDatabaseEnv("DATABASE_PASSWORD"),
  database: getDatabaseName(),
  connectTimeout: envNumber2("DATABASE_CONNECT_TIMEOUT", 15e3),
  acquireTimeout: envNumber2("DATABASE_ACQUIRE_TIMEOUT", envNumber2("DATABASE_CONNECT_TIMEOUT", 15e3)),
  queryTimeout: envNumber2("DATABASE_QUERY_TIMEOUT", 3e4),
  connectionLimit: envNumber2("DATABASE_CONNECTION_LIMIT", 5)
});
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: PRISMA_QUERY_LOG ? ["query", "info", "warn", "error"] : ["error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
if (APP_DEBUG2) {
  debug_default.debug("\u{1F680} Prisma Client Initialized");
  debug_default.debug("Database:", getDatabaseName(), `(env=${DB_ENV})`);
  debug_default.debug("Host:", `${getDatabaseHost()}:${getDatabasePort()}`);
  debug_default.debug("\u{1F41B} Query Logs:", PRISMA_QUERY_LOG);
}

// src/modules/system/controller.ts
var getHealth = async (req, res) => {
  const database = getDatabaseTarget();
  let databaseStatus = "Connected";
  let databaseError;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = "Disconnected";
    databaseError = error instanceof Error ? error.message : "Database connection failed";
  }
  res.status(200).json({
    status: databaseStatus === "Connected" ? "UP" : "DOWN",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    database: {
      env: database.env,
      host: database.host,
      port: database.port,
      name: database.database,
      status: databaseStatus,
      ...databaseError ? { error: databaseError } : {}
    }
  });
};
var getHello = (req, res) => {
  res.status(200).json({
    status: true,
    message: "Welcome to the Cloud Kitchen API",
    version: "1.0.0"
  });
};
var getSystemInfo = (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: {
      heapUsed: formatBytes(memory.heapUsed),
      heapTotal: formatBytes(memory.heapTotal),
      rss: formatBytes(memory.rss),
      external: formatBytes(memory.external)
    }
  });
};

// src/modules/system/index.ts
var router = Router();
router.get("/hello", getHello);
router.get("/health", getHealth);
router.get("/info", getSystemInfo);
router.use((req, res) => {
  res.status(404).json({
    status: false,
    error: "Endpoint not found",
    requestedPath: req.originalUrl
  });
});
var system_default = router;

// src/modules/kitchen/kitchen.route.ts
import { Router as Router9 } from "express";

// src/modules/kitchen/auth/auth.route.ts
import { Router as Router2 } from "express";
import multer from "multer";

// src/modules/kitchen/auth/auth.controller.ts
import crypto2 from "crypto";
import bcrypt2 from "bcrypt";

// src/modules/kitchen/auth/auth.service.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// src/core/helpers/string.helper.ts
function maskString(value, start = 1, end = 1, maskChar = "*") {
  if (!value || typeof value !== "string") return "";
  if (value.length <= start + end) {
    return maskChar.repeat(value.length);
  }
  return value.slice(0, start) + maskChar.repeat(value.length - start - end) + value.slice(-end);
}
function capitalize(value) {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function toKebabCase(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}
function convertBigInt(input, type = "string") {
  if (type !== "string" && type !== "number") {
    throw new Error("Type must be 'string' or 'number'");
  }
  const seen = /* @__PURE__ */ new WeakMap();
  function _convert(value) {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "bigint") {
      return type === "string" ? value.toString() : Number(value);
    }
    if (Array.isArray(value)) {
      if (seen.has(value)) return seen.get(value);
      const arr = [];
      seen.set(value, arr);
      for (let i = 0; i < value.length; i++) {
        arr[i] = _convert(value[i]);
      }
      return arr;
    }
    if (value && typeof value === "object") {
      if (seen.has(value)) return seen.get(value);
      const obj = {};
      seen.set(value, obj);
      for (const key of Object.keys(value)) {
        obj[key] = _convert(value[key]);
      }
      return obj;
    }
    return value;
  }
  return _convert(input);
}
function toTitleCase(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
var stringHelper = {
  maskString,
  capitalize,
  toKebabCase,
  convertBigInt,
  toTitleCase
};
var string_helper_default = stringHelper;

// src/modules/shared/user/user.repository.ts
var userRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const user = await prisma.user.findUnique(options);
      if (!user) {
        return {
          status: false,
          message: "User not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(user, "number"),
        message: user ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const user = await prisma.user.findFirst(options);
      if (!user) {
        return {
          status: false,
          message: "User not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(user, "number"),
        message: user ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const users = await prisma.user.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(users, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve user records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.user.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count user records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const user = await prisma.user.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(user, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create user"
      };
    }
  },
  // ---------- Create Many Users ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.user.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} User record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create user records"
      };
    }
  },
  // ---------- Delete Many Users ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.user.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} User record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete user records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(user, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update user"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const user = await prisma.user.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(user, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete user"
      };
    }
  }
};
var user_repository_default = userRepo;

// src/modules/kitchen/auth/auth.service.ts
var JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
var loginKitchen = async (data) => {
  try {
    const { username, password } = data;
    debug_default.debug(`[Auth Service] Searching for kitchen: ${username}`);
    const response = await user_repository_default.findFirst({
      where: {
        userType: {
          in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
        },
        OR: [
          { phone: username },
          { email: username }
        ]
      },
      select: {
        id: true,
        kitchenName: true,
        password: true,
        phone: true,
        email: true,
        contactTitle: true,
        contactFirstName: true,
        contactLastName: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        role: true,
        userType: true,
        isOnboardingCompleted: true
      }
    });
    if (!response?.status || !response?.data) {
      debug_default.debugError(`[Auth Service] Kitchen not found: ${username}`);
      throw new Error("Invalid username or password");
    }
    const user = response.data;
    if (user.status !== "ACTIVE") {
      debug_default.debugError(`[Auth Service] Inactive kitchen: ${username}`);
      return {
        status: false,
        message: `Kitchen is ${user.status}`
      };
    }
    if (user.userType === UserType.KITCHEN_STAFF) {
      if (!user.parent || user.parent.userType !== UserType.KITCHEN) {
        debug_default.debugError("[Auth Service] Invalid parent for subuser");
        throw new Error("Invalid username or password");
      }
      if (user.parent.status !== "ACTIVE") {
        throw new Error("Parent kitchen is not active");
      }
    }
    debug_default.debug("[Auth Service] Verifying password with Bcrypt...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      debug_default.debugError("[Auth Service] Password mismatch.");
      throw new Error("Invalid username or password");
    }
    debug_default.debug("[Auth Service] Password verified.");
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    const { password: _, ...userWithoutPassword } = user;
    debug_default.debug("[Auth Service] Token generated successfully.");
    return { status: true, message: "Login successful", data: { kitchen: userWithoutPassword, token } };
  } catch (error) {
    debug_default.debugError(`[Auth Service] Login failed: ${error.message}`);
    throw new Error(
      error.message === "Invalid username or password" ? error.message : "Something went wrong while logging in"
    );
  }
};
var getUserByUsername = async (username, type) => {
  try {
    if (!username || !type) {
      return {
        status: false,
        message: "Username and type are required",
        data: null
      };
    }
    debug_default.debug(`[Auth Service] Fetching user by ${type}: ${username}`);
    const whereCondition = type === "username" ? { username } : type === "email" ? { email: username } : { phone: username };
    const response = await user_repository_default.findFirst({
      where: whereCondition,
      select: {
        id: true,
        email: true,
        phone: true,
        password: true,
        status: true,
        userType: true,
        role: true
      }
    });
    if (!response?.status || !response?.data) {
      return {
        status: false,
        message: "User not found",
        data: null
      };
    }
    return {
      status: true,
      message: "User fetched successfully",
      data: response.data
    };
  } catch (error) {
    debug_default.debugError(`[Auth Service] getUserByUsername failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong",
      data: null
    };
  }
};
var checkUserAvailability = async (identifier) => {
  try {
    if (!identifier) {
      return {
        available: false,
        message: "Invalid value",
        field: null
      };
    }
    const response = await user_repository_default.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      },
      select: {
        email: true,
        phone: true
      }
    });
    const user = response?.data;
    if (user) {
      let field = null;
      if (user.username === identifier) field = "username";
      else if (user.email === identifier) field = "email";
      else if (user.phone === identifier) field = "phone";
      return {
        available: false,
        field,
        message: field ? `${field} already exists` : "Value already exists"
      };
    }
    return {
      available: true,
      field: null,
      message: "Available"
    };
  } catch (error) {
    return {
      available: false,
      field: null,
      message: error.message || "Error checking availability"
    };
  }
};
var getUserByResetToken = async (token) => {
  try {
    if (!token) {
      return {
        status: false,
        message: "Token is required",
        data: null
      };
    }
    debug_default.debug(`[Auth Service] Fetching user by reset token`);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const response = await user_repository_default.findFirst({
      where: {
        resetPasswordToken: hashedToken
      },
      select: {
        id: true,
        password: true,
        resetPasswordExpiresAt: true,
        status: true,
        userType: true
      }
    });
    if (!response?.status || !response?.data) {
      return {
        status: false,
        message: "Invalid token",
        data: null
      };
    }
    const user = response.data;
    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < /* @__PURE__ */ new Date()) {
      return {
        status: false,
        message: "Token expired",
        data: null
      };
    }
    return {
      status: true,
      message: "User fetched successfully",
      data: user
    };
  } catch (error) {
    debug_default.debugError(`[Auth Service] getUserByResetToken failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong",
      data: null
    };
  }
};
var createKitchen = async (data) => {
  const { profilePicture, kitchenName, phone, email, password, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone } = data;
  debug_default.debug(`[Kitchen Service] Checking if user exists: ${email} or ${phone}`);
  const existingUsers = await user_repository_default.findMany({
    where: {
      OR: [
        { phone },
        { email }
      ]
    }
  });
  if (existingUsers.data && existingUsers.data.length > 0) {
    const usedFields = /* @__PURE__ */ new Set([
      ...existingUsers.data.map((user) => user.phone === phone ? "Phone" : null).filter(Boolean),
      ...existingUsers.data.map((user) => user.email === email ? "Email" : null).filter(Boolean)
    ]);
    const errorMessage = usedFields.size > 1 ? `${[...usedFields].join(", ")} already exist` : `${[...usedFields][0]} already exists`;
    debug_default.debugError(`[Kitchen Service] Creation failed: ${errorMessage}`);
    return { status: false, message: errorMessage };
  }
  debug_default.debug("[Kitchen Service] Hashing password...");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  debug_default.debug("[Kitchen Service] Saving new kitchen to database...");
  const createResponse = await user_repository_default.create({
    profilePicture,
    kitchenName,
    phone,
    email,
    contactTitle,
    contactFirstName,
    contactLastName,
    contactEmail,
    contactPhone,
    password: hashedPassword,
    userType: UserType.KITCHEN
  });
  if (!createResponse.status) {
    return { status: false, message: createResponse.message || "Failed to create kitchen" };
  }
  debug_default.debug(`[Kitchen Service] Kitchen created: ID ${createResponse.data.id}`);
  const { password: _, ...userWithoutPassword } = createResponse.data;
  return { status: true, data: userWithoutPassword, message: "Kitchen created successfully" };
};

// src/core/helpers/file.helper.ts
import fs from "fs";
import path2 from "path";
import { v4 as uuidv4 } from "uuid";
function sanitize(value) {
  return value.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
async function saveFile(file, options) {
  debug("----- saveFile START -----");
  debug("Original file path:", file.path);
  debug("Original file name:", file.originalname);
  debug("Options received:", options);
  try {
    const destination = path2.resolve(options.destination);
    debug("Resolved destination path:", destination);
    try {
      await fs.promises.access(destination, fs.constants.F_OK);
      debug("Directory exists.");
    } catch {
      debug("Directory does not exist. Creating...");
      await fs.promises.mkdir(destination, { recursive: true });
      debug("Directory created.");
    }
    const ext = path2.extname(file.originalname);
    debug("File extension:", ext);
    const parts = [];
    if (options.name) {
      const sanitized = sanitize(options.name);
      debug("Sanitized name:", sanitized);
      parts.push(sanitized);
    }
    if (options.unique) {
      const id = uuidv4();
      debug("Generated UUID:", id);
      parts.push(id);
    }
    const filename = `${parts.join("-")}${ext}`;
    debug("Final filename:", filename);
    const savePath = path2.join(destination, filename);
    debug("Full save path:", savePath);
    debug("Moving file...");
    await fs.promises.rename(file.path, savePath);
    debug("File saved successfully!");
    debug("----- saveFile END -----");
    return savePath;
  } catch (error) {
    debugError("File Save Error:", error);
    throw new Error("Failed to save file");
  }
}

// src/modules/kitchen/auth/auth.controller.ts
var login = async (req, res) => {
  debug_default.debug("--- [Login Controller] Start ---");
  try {
    const { username, password } = req.body;
    debug_default.debug(`[Login Controller] Attempting login for username: ${username}`);
    debug_default.debug("[Login Controller] Calling AuthService.loginService...");
    const result = await loginKitchen({
      username,
      password
    });
    if (!result.status) {
      return res.status(401).json({
        status: false,
        message: result.message
      });
    }
    debug_default.debug("[Login Controller] Login successful, sending response.");
    res.status(200).json({
      status: true,
      message: "Login successful",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError(`[Login Controller] Exception caught: ${error.message}`);
    res.status(401).json({
      status: false,
      message: error.message || "Authentication failed"
    });
  } finally {
    debug_default.debug("--- [Login Controller] End ---");
  }
};
var register = async (req, res) => {
  debug_default.debug(`=== CREATE BRAND START ===`);
  try {
    const request = req;
    debug_default.debug("Body:", request.body);
    debug_default.debug("Files:", request.files?.map((f) => ({ fieldname: f.fieldname, originalname: f.originalname })) || "No files");
    const { kitchenName, phone, email, password, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone } = request.body;
    const errors = {};
    const allowedFiles = [{ fieldname: "profilePicture", required: true }];
    const filesToSave = {};
    for (const fileDef of allowedFiles) {
      const filesForField = request.files?.filter((f) => f.fieldname === fileDef.fieldname) || [];
      if (fileDef.required && filesForField.length === 0) {
        errors[fileDef.fieldname] = `${fileDef.fieldname.charAt(0).toUpperCase() + fileDef.fieldname.slice(1)} file is required`;
        debug_default.debugWarn(errors[fileDef.fieldname]);
      } else if (filesForField.length > 0) {
        filesToSave[fileDef.fieldname] = filesForField;
        debug_default.debug(`Files ready for saving for '${fileDef.fieldname}':`, filesForField.map((f) => f.originalname));
      }
    }
    const requiredFields = ["kitchenName", "phone", "email", "password", "contactTitle", "contactFirstName", "contactEmail", "contactPhone"];
    for (const field of requiredFields) {
      if (!request.body[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        debug_default.debugWarn(errors[field]);
      }
    }
    if (email || phone) {
      const [emailCheck, phoneCheck] = await Promise.all([
        email ? checkUserAvailability(email) : Promise.resolve({ available: true, message: "", field: null }),
        phone ? checkUserAvailability(phone) : Promise.resolve({ available: true, message: "", field: null })
      ]);
      if (!emailCheck.available) {
        errors.email = emailCheck.message;
      }
      if (!phoneCheck.available) {
        errors.phone = phoneCheck.message;
      }
    }
    if (Object.keys(errors).length > 0) {
      debug_default.debugWarn("Validation failed. Errors:", errors);
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors
      });
    }
    const uploadedFiles = {};
    for (const fieldname of Object.keys(filesToSave)) {
      for (const file of filesToSave[fieldname]) {
        debug_default.debug(`Saving file '${file.originalname}' for field '${fieldname}'...`);
        const savedPath = await saveFile(file, {
          destination: `uploads/${fieldname}`,
          name: `brand-${fieldname}`,
          unique: true
        });
        uploadedFiles[fieldname] = savedPath;
        debug_default.debug(`File saved: ${savedPath}`);
      }
    }
    debug_default.debug("[Register Controller] Calling AuthService.createKitchenService...");
    const result = await createKitchen({
      profilePicture: uploadedFiles.profilePicture,
      kitchenName,
      phone,
      email,
      password,
      contactTitle,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone
    });
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    res.status(201).json({
      status: true,
      message: "Kitchen created successfully"
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== CREATE BRAND END ===");
  }
};
var forgotPasswordRequest = async (req, res) => {
  debug_default.debug("--- [ForgotPassword] START ---");
  try {
    const { username } = req.body;
    debug_default.debug("[ForgotPassword] Step 1: Input received", { username });
    let type;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const isPhone = /^\+?[0-9]{7,15}$/.test(username);
    if (isEmail) type = "email";
    else if (isPhone) type = "phone";
    else type = "username";
    const allowedTypes = ["email", "phone"];
    if (!allowedTypes.includes(type)) {
      debug_default.debugWarn("[ForgotPassword] Step 2 Failed: Invalid identifier type", { type });
      return res.status(400).json({
        status: false,
        message: "Invalid username. Must be a valid email or phone number."
      });
    }
    debug_default.debug("[ForgotPassword] Step 2: Identifier type detected", { type });
    const result = await getUserByUsername(username, type);
    debug_default.debug("[ForgotPassword] Step 3: User lookup result", {
      found: !!result?.data
    });
    if (!result.status || !result.data) {
      debug_default.debugWarn("[ForgotPassword] Step 3 Failed: User not found");
      return res.status(404).json({
        status: false,
        message: "User does not exist"
      });
    }
    const user = result.data;
    const rawToken = crypto2.randomBytes(32).toString("hex");
    const hashedToken = crypto2.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 1e3 * 60 * 15);
    debug_default.debug("[ForgotPassword] Step 4: Token generated", {
      expiresAt: expiry
    });
    await user_repository_default.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: expiry
    });
    debug_default.debug("[ForgotPassword] Step 5: Token saved to DB", {
      userId: user.id
    });
    const resetLink = `https://yourdomain.com/reset-password?token=${rawToken}`;
    debug_default.debug("[ForgotPassword] Step 6: Reset link created", resetLink);
    debug_default.debug("[ForgotPassword] SUCCESS");
    return res.status(200).json({
      status: true,
      message: "A reset link has been sent.",
      data: {
        resetToken: rawToken,
        resetLink
      }
    });
  } catch (error) {
    debug_default.debugError("[ForgotPassword] ERROR", {
      message: error.message
    });
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  } finally {
    debug_default.debug("--- [ForgotPassword] END ---");
  }
};
var resetPassword = async (req, res) => {
  debug_default.debug("--- [ResetPassword] START ---");
  try {
    const { token, password } = req.body;
    debug_default.debug("[ResetPassword] Step 1: Input received");
    if (!token || !password) {
      debug_default.debugWarn("[ResetPassword] Step 1 Failed: Missing token or password");
      return res.status(400).json({
        status: false,
        message: "Token and password are required"
      });
    }
    const result = await getUserByResetToken(token);
    debug_default.debug("[ResetPassword] Step 2: Token validation result", {
      valid: result.status
    });
    if (!result.status || !result.data) {
      debug_default.debugWarn("[ResetPassword] Step 2 Failed: Invalid or expired token");
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    const user = result.data;
    const hashedPassword = await bcrypt2.hash(password, 10);
    debug_default.debug("[ResetPassword] Step 3: Password hashed");
    await user_repository_default.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null
    });
    debug_default.debug("[ResetPassword] Step 4: Password updated & token cleared", {
      userId: user.id
    });
    debug_default.debug("[ResetPassword] SUCCESS");
    return res.status(200).json({
      status: true,
      message: "Password reset successful"
    });
  } catch (error) {
    debug_default.debugError("[ResetPassword] ERROR", {
      message: error.message
    });
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  } finally {
    debug_default.debug("--- [ResetPassword] END ---");
  }
};

// src/modules/kitchen/auth/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "your_super_secret_key";
var verifyToken = (options = {}) => {
  return async (req, res, next) => {
    debug_default.debug("--- [Auth Middleware] Incoming Request Verification ---");
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      debug_default.debugWarn("[Auth Middleware] Verification Failed: No Bearer token");
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided."
      });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt2.verify(token, JWT_SECRET2);
      debug_default.debug(`[Auth Middleware] JWT Verified for User ID: ${decoded.userId}`);
      debug_default.debug(`[Auth Middleware] Fetching user details from Repo for ID: ${decoded.userId}...`);
      const response = await user_repository_default.findFirst({
        where: {
          id: BigInt(decoded.userId),
          userType: {
            in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
          }
        },
        select: {
          id: true,
          kitchenName: true,
          phone: true,
          email: true,
          contactTitle: true,
          contactFirstName: true,
          contactLastName: true,
          contactEmail: true,
          contactPhone: true,
          status: true,
          role: true,
          userType: true,
          isOnboardingCompleted: true,
          subscriptions: {
            where: {
              status: "ACTIVE"
            },
            select: {
              status: true,
              trialEndDate: true,
              planEndDate: true
            }
          }
        }
      });
      if (!response.status || !response.data) {
        debug_default.debugError(`[Auth Service] Kitchen not found`);
        return res.status(404).json({
          status: false,
          message: "User account no longer exists."
        });
      }
      const user = response.data;
      if (user.status !== "ACTIVE") {
        debug_default.debugError(`[Auth Service] Inactive kitchen: ${user.kitchenName}`);
        return {
          status: false,
          message: `Kitchen is ${user.status}`
        };
      }
      if (user.userType === UserType.KITCHEN_STAFF) {
        if (!user.parent || user.parent.userType !== UserType.KITCHEN) {
          debug_default.debugError("[Auth Service] Invalid parent for staff");
          throw new Error("Invalid username or password");
        }
        if (user.parent.status !== "ACTIVE") {
          throw new Error("Parent kitchen is not active");
        }
        if (user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].trialEndDate && user.subscriptions[0].planEndDate && user.subscriptions[0].trialEndDate < /* @__PURE__ */ new Date() && user.subscriptions[0].planEndDate < /* @__PURE__ */ new Date()) {
          user.isSubscriptionActive = false;
        }
      }
      if (options.checkOnboarding) {
        if (user.userType === UserType.KITCHEN && !user.isOnboardingCompleted) {
          return res.status(403).json({
            status: false,
            message: "Onboarding not completed"
          });
        }
      }
      user.isSubscriptionActive = true;
      debug_default.debug(`[Auth Middleware] User: ${JSON.stringify(user, null, 2)}`);
      if (user.subscriptions && user.subscriptions.length > 0) {
        let isSubscriptionActive = false;
        const sub = user.subscriptions[0];
        const now = /* @__PURE__ */ new Date();
        if (sub.planEndDate) {
          if (new Date(sub.planEndDate) > now) {
            isSubscriptionActive = true;
          }
        } else if (sub.trialEndDate) {
          if (new Date(sub.trialEndDate) > now) {
            isSubscriptionActive = true;
          }
        }
        user.isSubscriptionActive = isSubscriptionActive;
      } else {
        if (options.checkSubscription) {
          throw new Error("No active subscription found");
        }
      }
      const subscription = user.subscriptions[0];
      debug_default.debug(`[Auth Middleware] Subscription: ${JSON.stringify(subscription, null, 2)}`);
      if (subscription && subscription.status !== "ACTIVE") {
        user.isSubscriptionActive = false;
        debug_default.debugError("[Auth Service] No active subscription found");
        if (options.checkSubscription) {
          throw new Error("No active subscription found");
        }
      }
      const { password, subscriptions, ...userSafeData } = user;
      debug_default.debug(`[Auth Middleware] User details: ${JSON.stringify(userSafeData, null, 2)}`);
      req.kitchen = userSafeData;
      debug_default.debug(`[Auth Middleware] \u2705 Success: Kitchen '${req.kitchen?.kitchenName}' verified.`);
      debug_default.debug("--- [Auth Middleware] Passing to Next Handler ---");
      next();
    } catch (error) {
      debug_default.debugError(`[Auth Middleware] \u274C Failed: ${error.message}`);
      return res.status(403).json({
        status: false,
        message: error.message || "Invalid or expired token."
      });
    }
  };
};

// src/modules/kitchen/auth/auth.validation.ts
import { z } from "zod";
var formatZodPath = (path3) => {
  let result = "";
  path3.forEach((p, i) => {
    if (typeof p === "number") {
      result += `[${p}]`;
    } else if (typeof p === "string") {
      if (i === 0) {
        result += p;
      } else {
        result += `.${p}`;
      }
    }
  });
  return result;
};
var loginSchema = z.object({
  username: z.string().trim().min(1, "Username / Email / Phone is required").refine((value) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^\+?[0-9]{7,15}$/.test(value);
    const isUsername = /^[a-zA-Z0-9_]{3,32}$/.test(value);
    return isEmail || isPhone || isUsername;
  }, "Enter a valid username, email, or phone number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(64, "Password is too long")
});
var registerSchema = z.object({
  // ===============================================
  // KITCHEN
  // ===============================================
  kitchenName: z.string().min(1, "Kitchen name cannot be empty"),
  phone: z.string().min(7, "Phone number is too short").max(15, "Phone number is too long").regex(/^\+?[0-9]+$/, "Phone must be a valid number"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(64, "Password is too long"),
  // ===============================================
  // CONTACT PERSON
  // ===============================================
  contactTitle: z.enum(["MR", "MRS", "MS", "DR"], {
    message: "Contact title must be MR, MRS, MS or DR"
  }),
  contactFirstName: z.string().min(1, "Contact first name cannot be empty"),
  contactLastName: z.string().optional(),
  contactEmail: z.string().email("Invalid contact email format"),
  contactPhone: z.string().min(7, "Contact phone is too short").max(15, "Contact phone is too long").regex(/^\+?[0-9]+$/, "Contact phone must be a valid number")
});
var forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required")
});
var resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(64, "Password is too long"),
  confirmPassword: z.string().min(8, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
var validateLogin = (req, res, next) => {
  debug_default.debugWarn("[Zod] Validating login body...");
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath(e.path);
      errors[field] = e.message;
    });
    debug_default.debugWarn("[Zod] Login validation failed:", errors);
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};
var validateRegister = (req, res, next) => {
  debug_default.debugWarn("[Zod] Validating register body...");
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath(e.path);
      errors[field] = e.message;
    });
    debug_default.debugWarn("[Zod] Register validation failed:", errors);
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};
var validateForgotPassword = (req, res, next) => {
  debug_default.debugWarn("[Zod] Validating forgot password body...");
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath(e.path);
      errors[field] = e.message;
    });
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};
var validateResetPassword = (req, res, next) => {
  debug_default.debugWarn("[Zod] Validating reset password body...");
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath(e.path);
      errors[field] = e.message;
    });
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/auth/auth.route.ts
var router2 = Router2({
  mergeParams: true
});
var upload = multer({ dest: "uploads/" });
router2.post(
  "/register",
  upload.any(),
  // parse multipart first so req.body is populated
  validateRegister,
  register
);
router2.post(
  "/login",
  validateLogin,
  login
);
router2.get("/verify", verifyToken(), (req, res) => {
  res.status(200).json({
    status: true,
    message: "Token is valid",
    kitchen: req.kitchen
  });
});
router2.post(
  "/forgot-password",
  validateForgotPassword,
  forgotPasswordRequest
);
router2.post(
  "/reset-password",
  validateResetPassword,
  resetPassword
);
var auth_route_default = router2;

// src/modules/kitchen/onboarding/onboarding.route.ts
import { Router as Router3 } from "express";

// src/modules/kitchen/kitchenDocument.repository.ts
var kitchenDocumentRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const kitchenDocument = await prisma.kitchenDocument.findUnique(options);
      if (!kitchenDocument) {
        return {
          status: false,
          message: "KitchenDocument not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocument, "number"),
        message: kitchenDocument ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const kitchenDocument = await prisma.kitchenDocument.findFirst(options);
      if (!kitchenDocument) {
        return {
          status: false,
          message: "KitchenDocument not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocument, "number"),
        message: kitchenDocument ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const kitchenDocuments = await prisma.kitchenDocument.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocuments, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenDocument records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.kitchenDocument.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count kitchenDocument records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const kitchenDocument = await prisma.kitchenDocument.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocument, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenDocument"
      };
    }
  },
  // ---------- Create Many KitchenDocuments ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.kitchenDocument.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenDocument record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenDocument records"
      };
    }
  },
  // ---------- Delete Many KitchenDocuments ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.kitchenDocument.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenDocument record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenDocument records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const kitchenDocument = await prisma.kitchenDocument.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocument, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update kitchenDocument"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const kitchenDocument = await prisma.kitchenDocument.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenDocument, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenDocument"
      };
    }
  }
};
var kitchenDocument_repository_default = kitchenDocumentRepo;

// src/modules/kitchen/onboarding/onboarding.service.ts
var completeOnboarding = async (data) => {
  try {
    const {
      kitchenId,
      fssaiNumber,
      gstNumber,
      fssaiFile,
      gstFile
    } = data;
    debug_default.debug(`[Onboarding Service] Starting onboarding for kitchenId: ${kitchenId}`);
    debug_default.debug(`[Auth Middleware] Fetching user details from Repo for ID: ${kitchenId}...`);
    const userResponse = await user_repository_default.findFirst({
      where: {
        id: BigInt(kitchenId),
        userType: {
          in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
        }
      },
      select: {
        isOnboardingCompleted: true
      }
    });
    if (!userResponse.status || !userResponse.data) {
      debug_default.debugError(`[Auth Service] Kitchen not found`);
      return {
        status: false,
        message: "User account no longer exists."
      };
    }
    const user = userResponse.data;
    if (user.isOnboardingCompleted) {
      return {
        status: true,
        message: "Onboarding already completed"
      };
    }
    debug_default.debug("[Onboarding Service] Saving FSSAI document...");
    const fssaiResponse = await kitchenDocument_repository_default.create({
      kitchen: {
        connect: { id: BigInt(kitchenId) }
      },
      type: DocumentType.FSSAI,
      documentNumber: fssaiNumber,
      documentFile: fssaiFile
    });
    if (!fssaiResponse.status) {
      debug_default.debugError("[Onboarding Service] Failed to save FSSAI");
      return {
        status: false,
        message: "Failed to save FSSAI document"
      };
    }
    if (gstNumber) {
      debug_default.debug("[Onboarding Service] Saving GST document...");
      const gstResponse = await kitchenDocument_repository_default.create({
        kitchen: {
          connect: { id: BigInt(kitchenId) }
        },
        type: DocumentType.GST,
        documentNumber: gstNumber,
        documentFile: gstFile
      });
      if (!gstResponse.status) {
        debug_default.debugError("[Onboarding Service] Failed to save GST");
        return {
          status: false,
          message: "Failed to save GST document"
        };
      }
    }
    debug_default.debug("[Onboarding Service] Updating user onboarding status...");
    const updateResponse = await user_repository_default.update(
      Number(kitchenId),
      {
        isOnboardingCompleted: true,
        onboardingCompletedAt: /* @__PURE__ */ new Date()
      }
    );
    if (!updateResponse.status) {
      return {
        status: false,
        message: "Failed to update onboarding status"
      };
    }
    debug_default.debug("[Onboarding Service] Onboarding completed successfully");
    return {
      status: true,
      message: "Onboarding completed successfully"
    };
  } catch (error) {
    debug_default.debugError(`[Onboarding Service] Failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong during onboarding"
    };
  }
};

// src/modules/kitchen/onboarding/onboarding.controller.ts
var completeOnboarding2 = async (req, res) => {
  debug_default.debug(`=== CREATE BRAND START ===`);
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    debug_default.debug("Body:", request.kitchen);
    debug_default.debug("Body:", request.body);
    debug_default.debug(
      "Files:",
      request.files?.map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname
      })) || "No files"
    );
    const fssaiNumber = request.body.fssaiNumber;
    const gstNumberRaw = request.body.gstNumber;
    const gstNumber = gstNumberRaw && gstNumberRaw.trim() !== "" ? gstNumberRaw.trim() : void 0;
    const errors = {};
    const files = request.files || [];
    const fssaiFiles = files.filter((f) => f.fieldname === "fssaiFile");
    const gstFiles = files.filter((f) => f.fieldname === "gstFile");
    if (!fssaiNumber) {
      errors.fssaiNumber = "FSSAI number is required";
    }
    if (fssaiFiles.length === 0) {
      errors.fssaiFile = "FSSAI file is required";
    }
    if (gstNumber) {
      const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[0-9A-Z]{1}$/;
      if (!GST_REGEX.test(gstNumber)) {
        errors.gstNumber = "Invalid GST number format";
      }
      if (gstFiles.length === 0) {
        errors.gstFile = "GST file is required when GST number is provided";
      }
    }
    if (Object.keys(errors).length > 0) {
      debug_default.debugWarn("Validation failed:", errors);
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors
      });
    }
    const uploadedFiles = {};
    if (fssaiFiles.length > 0) {
      const file = fssaiFiles[0];
      const savedPath = await saveFile(file, {
        destination: `uploads/fssai`,
        name: `fssai`,
        unique: true
      });
      uploadedFiles.fssaiFile = savedPath;
    }
    if (gstNumber && gstFiles.length > 0) {
      const file = gstFiles[0];
      const savedPath = await saveFile(file, {
        destination: `uploads/gst`,
        name: `gst`,
        unique: true
      });
      uploadedFiles.gstFile = savedPath;
    }
    const result = await completeOnboarding({
      kitchenId: BigInt(kitchenId),
      fssaiNumber,
      gstNumber,
      fssaiFile: uploadedFiles.fssaiFile,
      gstFile: uploadedFiles.gstFile
    });
    if (!result.status) {
      debug_default.debugError("\u274C Controller Error:", result.message);
      return res.status(500).json({
        status: false,
        message: result.message
      });
    }
    return res.status(201).json({
      status: true,
      message: "Onboarding completed successfully"
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== CREATE BRAND END ===");
  }
};

// src/modules/kitchen/onboarding/onboarding.validation.ts
import { z as z2 } from "zod";
var formatZodPath2 = (path3) => {
  let result = "";
  path3.forEach((p, i) => {
    if (typeof p === "number") {
      result += `[${p}]`;
    } else if (typeof p === "string") {
      if (i === 0) {
        result += p;
      } else {
        result += `.${p}`;
      }
    }
  });
  return result;
};
var onboardingSchema = z2.object({
  // FSSAI (required)
  fssaiNumber: z2.string().trim().min(1, "FSSAI number is required").regex(/^[0-9]{14}$/, "FSSAI must be a valid 14-digit number"),
  // GST (optional)
  gstNumber: z2.string().trim().optional().transform((val) => {
    if (!val || val === "") return void 0;
    return val;
  }).refine((val) => {
    if (!val) return true;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[0-9A-Z]{1}$/.test(val);
  }, {
    message: "Invalid GST number format"
  })
});
var validateOnboarding = (req, res, next) => {
  debugWarn("[Zod] Validating onboarding body...");
  const result = onboardingSchema.safeParse(req.body);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath2(e.path);
      errors[field] = e.message;
    });
    debugWarn("[Zod] Onboarding validation failed:", errors);
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/onboarding/onboarding.route.ts
import multer2 from "multer";
var router3 = Router3({
  mergeParams: true
});
var upload2 = multer2({ dest: "uploads/" });
router3.post(
  "/",
  verifyToken(),
  // only logged-in user
  upload2.any(),
  // FSSAI/GST file upload
  validateOnboarding,
  completeOnboarding2
);
var onboarding_route_default = router3;

// src/modules/kitchen/subscription/subscription.route.ts
import { Router as Router4 } from "express";

// src/modules/shared/subscription/subscription.repository.ts
var subscriptionRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const subscription = await prisma.subscription.findUnique(options);
      if (!subscription) {
        return {
          status: false,
          message: "Subscription not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscription, "number"),
        message: subscription ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const subscription = await prisma.subscription.findFirst(options);
      if (!subscription) {
        return {
          status: false,
          message: "Subscription not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscription, "number"),
        message: subscription ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const subscriptions = await prisma.subscription.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscriptions, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve subscription records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.subscription.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count subscription records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const subscription = await prisma.subscription.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscription, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create subscription"
      };
    }
  },
  // ---------- Create Many Subscriptions ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.subscription.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Subscription record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create subscription records"
      };
    }
  },
  // ---------- Delete Many Subscriptions ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.subscription.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Subscription record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete subscription records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscription, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update subscription"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const subscription = await prisma.subscription.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(subscription, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete subscription"
      };
    }
  }
};
var subscription_repository_default = subscriptionRepo;

// src/modules/shared/subscription/kitchenSubscription.repository.ts
var kitchenSubscriptionRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const kitchenSubscription = await prisma.kitchenSubscription.findUnique(options);
      if (!kitchenSubscription) {
        return {
          status: false,
          message: "KitchenSubscription not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscription, "number"),
        message: kitchenSubscription ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const kitchenSubscription = await prisma.kitchenSubscription.findFirst(options);
      if (!kitchenSubscription) {
        return {
          status: false,
          message: "KitchenSubscription not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscription, "number"),
        message: kitchenSubscription ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const kitchenSubscriptions = await prisma.kitchenSubscription.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscriptions, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve kitchenSubscription records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.kitchenSubscription.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count kitchenSubscription records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscription, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenSubscription"
      };
    }
  },
  // ---------- Create Many KitchenSubscriptions ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.kitchenSubscription.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenSubscription record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create kitchenSubscription records"
      };
    }
  },
  // ---------- Delete Many KitchenSubscriptions ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.kitchenSubscription.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} KitchenSubscription record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenSubscription records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscription, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update kitchenSubscription"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const kitchenSubscription = await prisma.kitchenSubscription.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(kitchenSubscription, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete kitchenSubscription"
      };
    }
  }
};
var kitchenSubscription_repository_default = kitchenSubscriptionRepo;

// src/modules/kitchen/subscription/subscription.service.ts
var selectPlanService = async (data) => {
  try {
    const { kitchenId, subscriptionId, billingCycle, duration } = data;
    debug(`[Subscription Service] Selecting plan for kitchenId: ${kitchenId}`);
    const planRes = await subscription_repository_default.findUnique({
      where: { id: subscriptionId }
    });
    if (!planRes.status || !planRes.data) {
      return {
        status: false,
        message: "Subscription plan not found"
      };
    }
    const plan = planRes.data;
    const existing = await kitchenSubscription_repository_default.findFirst({
      where: {
        kitchenId,
        status: "ACTIVE"
      }
    });
    if (existing?.data) {
      return {
        status: false,
        message: "Active subscription already exists"
      };
    }
    const now = /* @__PURE__ */ new Date();
    let trialStartDate = null;
    let trialEndDate = null;
    if (plan.freeTrialDays) {
      trialStartDate = now;
      trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + plan.freeTrialDays);
    }
    const planStartDate = trialEndDate || now;
    const planEndDate = new Date(planStartDate);
    if (billingCycle === "MONTHLY") {
      planEndDate.setMonth(planEndDate.getMonth() + duration);
    } else {
      planEndDate.setFullYear(planEndDate.getFullYear() + duration);
    }
    const pricePaid = billingCycle === "MONTHLY" ? plan.price * duration : (plan.annualPrice || plan.price * 12) * duration;
    const createRes = await kitchenSubscription_repository_default.create({
      kitchen: {
        connect: { id: kitchenId }
      },
      subscription: {
        connect: { id: subscriptionId }
      },
      trialStartDate,
      trialEndDate,
      trialDays: plan.freeTrialDays,
      planStartDate,
      planEndDate,
      billingCycle,
      duration,
      pricePaid,
      originalPrice: pricePaid,
      discountPct: plan.discountPct,
      maxUsers: plan.maxUsers,
      maxBranches: plan.maxBranches,
      status: "ACTIVE"
    });
    if (!createRes.status) {
      return {
        status: false,
        message: createRes.message || "Failed to create subscription"
      };
    }
    debug("[Subscription Service] Plan selected successfully");
    return {
      status: true,
      message: "Subscription activated successfully",
      data: createRes.data
    };
  } catch (error) {
    debugError(`[Subscription Service] Error: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong while selecting plan"
    };
  }
};
var listPlansService = async () => {
  try {
    const response = await subscription_repository_default.findMany({
      orderBy: {
        price: "asc"
      },
      include: {
        features: true
      }
    });
    if (!response.status) {
      return {
        status: false,
        message: response.message || "Failed to fetch subscription plans",
        data: []
      };
    }
    return {
      status: true,
      message: "Subscription plans fetched successfully",
      data: response.data || []
    };
  } catch (error) {
    debugError(`[Subscription Service] Plan list error: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong while fetching plans",
      data: []
    };
  }
};

// src/modules/kitchen/subscription/subscription.controller.ts
var listPlans = async (_req, res) => {
  debug("=== LIST PLANS START ===");
  try {
    const result = await listPlansService();
    if (!result.status) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    debugError("LIST PLANS ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug("=== LIST PLANS END ===");
  }
};
var selectPlan = async (req, res) => {
  debug("=== SELECT PLAN START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const { subscriptionId, billingCycle, duration } = request.body;
    const result = await selectPlanService({
      kitchenId,
      subscriptionId,
      billingCycle,
      duration
    });
    if (!result.status) {
      return res.status(400).json(result);
    }
    return res.status(201).json({
      status: true,
      message: result.message
    });
  } catch (error) {
    debugError("\u274C SELECT PLAN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug("=== SELECT PLAN END ===");
  }
};

// src/modules/kitchen/subscription/subscription.validation.ts
import { z as z3 } from "zod";
var formatZodPath3 = (path3) => {
  let result = "";
  path3.forEach((p, i) => {
    if (typeof p === "number") {
      result += `[${p}]`;
    } else if (typeof p === "string") {
      if (i === 0) {
        result += p;
      } else {
        result += `.${p}`;
      }
    }
  });
  return result;
};
var selectPlanSchema = z3.object({
  subscriptionId: z3.number().int().positive("Subscription ID must be greater than 0"),
  billingCycle: z3.enum(["MONTHLY", "YEARLY"], {
    message: "Billing cycle must be MONTHLY or YEARLY"
  }),
  duration: z3.number().int().positive("Duration must be greater than 0")
});
var validateSelectPlan = (req, res, next) => {
  debugWarn("[Zod] Validating select plan body...");
  const parsedBody = {
    ...req.body,
    subscriptionId: Number(req.body.subscriptionId),
    duration: Number(req.body.duration)
  };
  const result = selectPlanSchema.safeParse(parsedBody);
  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((e) => {
      const field = formatZodPath3(e.path);
      errors[field] = e.message;
    });
    debugWarn("[Zod] Select plan validation failed:", errors);
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/subscription/subscription.route.ts
var router4 = Router4({
  mergeParams: true
});
router4.get(
  "/plans",
  listPlans
);
router4.post(
  "/select",
  verifyToken({ checkOnboarding: true }),
  validateSelectPlan,
  selectPlan
);
var subscription_route_default = router4;

// src/modules/kitchen/branch/branch.route.ts
import { Router as Router8 } from "express";

// src/modules/kitchen/branch/branch.repository.ts
var branchRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const branch = await prisma.branch.findUnique(options);
      if (!branch) {
        return {
          status: false,
          message: "Branch not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(branch, "number"),
        message: branch ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branch record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const branch = await prisma.branch.findFirst(options);
      if (!branch) {
        return {
          status: false,
          message: "Branch not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(branch, "number"),
        message: branch ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branch record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const branchs = await prisma.branch.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchs, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branch records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.branch.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count branch records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const branch = await prisma.branch.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branch, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create branch"
      };
    }
  },
  // ---------- Create Many Branchs ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.branch.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Branch record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create branch records"
      };
    }
  },
  // ---------- Delete Many Branchs ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.branch.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Branch record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete branch records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const branch = await prisma.branch.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branch, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update branch"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const branch = await prisma.branch.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branch, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete branch"
      };
    }
  }
};
var branch_repository_default = branchRepo;

// src/modules/kitchen/branch/branch.service.ts
var resolveCuisineIds = async (tx, cuisines) => {
  if (!Array.isArray(cuisines)) {
    throw new Error("Cuisines must be an array");
  }
  const ids = [
    ...new Set(
      cuisines.filter((c) => c.id).map((c) => Number(c.id)).filter((id) => Number.isFinite(id))
    )
  ];
  const names = [
    ...new Set(
      cuisines.filter((c) => !c.id && c.name).map((c) => c.name.trim().toLowerCase()).filter(Boolean)
    )
  ];
  let existingIds = [];
  if (ids.length > 0) {
    const existing = await tx.cuisine.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    });
    if (existing.length !== ids.length) {
      throw new Error("Some cuisine IDs are invalid");
    }
    existingIds = existing.map((c) => Number(c.id));
  }
  let createdIds = [];
  if (names.length > 0) {
    const created = await Promise.all(
      names.map(
        (name) => tx.cuisine.upsert({
          where: { name },
          update: {},
          create: {
            name: string_helper_default.toTitleCase(name),
            status: Status.PENDING
          }
        })
      )
    );
    createdIds = created.map((c) => Number(c.id));
  }
  return [.../* @__PURE__ */ new Set([...existingIds, ...createdIds])];
};
var BRANCH_UPDATE_FIELDS = /* @__PURE__ */ new Set([
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
var pickBranchUpdateData = (data) => {
  const updateData = {};
  for (const field of BRANCH_UPDATE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updateData[field] = data[field];
    }
  }
  return updateData;
};
var createBranch = async (data) => {
  const { kitchenId, name, addressLine1, addressLine2, landmark, area, pincode, countryId, stateId, cityId, contactTitle, contactFirstName, contactLastName, contactEmail, contactPhone, cuisines } = data;
  debug_default.debug("[Branch Service] Saving new branch to database...");
  debug_default.debug("[Branch Service] Data: ", JSON.stringify(data, null, 2));
  try {
    const result = await prisma.$transaction(async (tx) => {
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
      if (cuisineIds.length > 0) {
        await tx.branchCuisine.createMany({
          data: cuisineIds.map((cid) => ({
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
      data: string_helper_default.convertBigInt(result, "number"),
      message: "Branch created successfully"
    };
  } catch (error) {
    debug_default.debugError("[Branch Service] Error:", error);
    return {
      status: false,
      message: error.message || "Failed to create branch"
    };
  }
};
var getBranches = async (params) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;
    debug_default.debug(`[Cuisine Service] Fetching branches | Page: ${page}`);
    const where = {
      status: Status.ACTIVE
    };
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
    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      branch_repository_default.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          cuisines: {
            include: { cuisine: true }
          }
        }
      }),
      // filtered count
      branch_repository_default.count({ where }),
      // total count for this kitchen active branches
      branch_repository_default.count({
        where: {
          userId: BigInt(filters.kitchenId),
          status: Status.ACTIVE
        }
      })
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
        // 🔥 total records (all)
        filtered,
        // 🔥 after filter
        count: data.length,
        // 🔥 current page items
        totalPages,
        // 🔥 total pages possible
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debug_default.debugError(`[Branche Service] getBranches failed: ${error.message}`);
    return {
      status: false,
      message: "Failed to fetch branches",
      data: [],
      meta: null
    };
  }
};
var getBranchById = async (id) => {
  try {
    debug_default.debug(`[Branch Service] Fetching branch: ${id}`);
    const response = await branch_repository_default.findUnique({
      where: { id },
      include: {
        cuisines: {
          include: { cuisine: true }
        }
      }
    });
    if (!response?.data) {
      return {
        status: false,
        message: "Branch not found"
      };
    }
    return {
      status: true,
      data: response.data
    };
  } catch (error) {
    debug_default.debugError(`[Branch Service] getBranchById failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong"
    };
  }
};
var updateBranch = async (id, data) => {
  try {
    debug_default.debug(`[Branch Service] Updating branch: ${id}`);
    const existing = await branch_repository_default.findUnique({
      where: { id }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "Branch not found"
      };
    }
    const { cuisines } = data;
    const branchData = pickBranchUpdateData(data);
    const updatedBranch = await prisma.$transaction(async (tx) => {
      const branch = Object.keys(branchData).length > 0 ? await tx.branch.update({
        where: { id },
        data: branchData
      }) : await tx.branch.findUnique({
        where: { id }
      });
      if (cuisines !== void 0) {
        const cuisineIds = await resolveCuisineIds(tx, cuisines);
        await tx.branchCuisine.deleteMany({
          where: { branchId: id }
        });
        if (cuisineIds.length > 0) {
          await tx.branchCuisine.createMany({
            data: cuisineIds.map((cid) => ({
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
      message: "Branch updated successfully",
      data: string_helper_default.convertBigInt(updatedBranch, "number")
    };
  } catch (error) {
    debug_default.debugError(`[Branch Service] updateBranch failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong while updating branch"
    };
  }
};
var deleteBranch = async (id) => {
  try {
    debug_default.debug(`[Branch Service] Deleting branch: ${id}`);
    const existing = await branch_repository_default.findUnique({
      where: { id }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "Branch not found"
      };
    }
    const response = await branch_repository_default.update(Number(id), {
      status: Status.INACTIVE
    });
    if (!response.status) {
      return {
        status: false,
        message: "Failed to delete branch"
      };
    }
    return {
      status: true,
      message: "Branch deleted successfully"
    };
  } catch (error) {
    debug_default.debugError(`[Branch Service] deleteBranch failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong while deleting branch"
    };
  }
};
var updateBranchStatus = async (id, status) => {
  try {
    debug_default.debug(`[Branch Service] Updating status: ${id} -> ${status}`);
    const existing = await branch_repository_default.findUnique({
      where: { id: Number(id) }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "Branch not found"
      };
    }
    if (existing.data.status === status) {
      return {
        status: false,
        message: `Branch already ${status}`
      };
    }
    const response = await branch_repository_default.update(Number(id), {
      status
    });
    return {
      status: true,
      message: "Branch status updated successfully",
      data: response.data
    };
  } catch (error) {
    debug_default.debugError(`[Branch Service] updateBranchStatus failed: ${error.message}`);
    return {
      status: false,
      message: "Something went wrong"
    };
  }
};

// src/modules/shared/location/city.repository.ts
var cityRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const city = await prisma.city.findUnique(options);
      if (!city) {
        return {
          status: false,
          message: "City not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(city, "number"),
        message: city ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const city = await prisma.city.findFirst(options);
      if (!city) {
        return {
          status: false,
          message: "City not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(city, "number"),
        message: city ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const citys = await prisma.city.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(citys, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve city records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.city.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count city records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const city = await prisma.city.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(city, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create city"
      };
    }
  },
  // ---------- Create Many Citys ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.city.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} City record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create city records"
      };
    }
  },
  // ---------- Delete Many Citys ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.city.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} City record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete city records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const city = await prisma.city.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(city, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update city"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const city = await prisma.city.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(city, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete city"
      };
    }
  }
};
var city_repository_default = cityRepo;

// src/modules/shared/location/state.repository.ts
var stateRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const state = await prisma.state.findUnique(options);
      if (!state) {
        return {
          status: false,
          message: "State not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(state, "number"),
        message: state ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const state = await prisma.state.findFirst(options);
      if (!state) {
        return {
          status: false,
          message: "State not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(state, "number"),
        message: state ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const states = await prisma.state.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(states, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve state records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.state.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count state records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const state = await prisma.state.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(state, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create state"
      };
    }
  },
  // ---------- Create Many States ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.state.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} State record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create state records"
      };
    }
  },
  // ---------- Delete Many States ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.state.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} State record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete state records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const state = await prisma.state.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(state, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update state"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const state = await prisma.state.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(state, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete state"
      };
    }
  }
};
var state_repository_default = stateRepo;

// src/modules/shared/location/country.repository.ts
var countryRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const country = await prisma.country.findUnique(options);
      if (!country) {
        return {
          status: false,
          message: "Country not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(country, "number"),
        message: country ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const country = await prisma.country.findFirst(options);
      if (!country) {
        return {
          status: false,
          message: "Country not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(country, "number"),
        message: country ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const countrys = await prisma.country.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(countrys, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve country records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.country.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count country records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const country = await prisma.country.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(country, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create country"
      };
    }
  },
  // ---------- Create Many Countrys ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.country.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Country record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create country records"
      };
    }
  },
  // ---------- Delete Many Countrys ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.country.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Country record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete country records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const country = await prisma.country.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(country, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update country"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const country = await prisma.country.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(country, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete country"
      };
    }
  }
};
var country_repository_default = countryRepo;

// src/modules/kitchen/branch/branch.controller.ts
var isCurrentKitchenBranch = (branch, kitchenId) => Number(branch?.userId) === Number(kitchenId);
var branchAccessDenied = (res) => res.status(403).json({
  status: false,
  message: "Branch does not belong to this kitchen"
});
var createBranch2 = async (req, res) => {
  debug_default.debug("=== SELECT PLAN START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const {
      name,
      addressLine1,
      addressLine2,
      landmark,
      area,
      pincode,
      countryId,
      stateId,
      cityId,
      contactTitle,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      cuisines
    } = request.body;
    const errors = {};
    const existing = await branch_repository_default.findFirst({
      where: {
        user: {
          id: kitchenId
        },
        name
      }
    });
    debug_default.debugWarn("existing", JSON.stringify(existing, null, 2));
    if (existing.status) {
      errors.name = "Branch already exists with same name";
    }
    const cityResponse = await city_repository_default.findUnique({
      where: { id: Number(cityId) },
      select: { stateId: true, countryId: true }
    });
    if (!cityResponse.status || !cityResponse.data) {
      errors.cityId = "City not found";
    } else {
      const city = cityResponse.data;
      if (Number(city.stateId) !== Number(stateId)) {
        errors.cityId = "City does not belong to selected state";
      }
      if (Number(city.countryId) !== Number(countryId)) {
        errors.cityId = "City does not belong to selected country";
      }
    }
    const stateResponse = await state_repository_default.findUnique({
      where: { id: Number(stateId) },
      select: { countryId: true }
    });
    if (!stateResponse.status || !stateResponse.data) {
      errors.stateId = "State not found";
    } else {
      const state = stateResponse.data;
      if (Number(state.countryId) !== Number(countryId)) {
        errors.stateId = "State does not belong to selected country";
      }
    }
    const countryResponse = await country_repository_default.findUnique({
      where: { id: Number(countryId) },
      select: { id: true }
    });
    if (!countryResponse.status || !countryResponse.data) {
      errors.countryId = "Country not found";
    }
    if (Object.keys(errors).length > 0) {
      debug_default.debugWarn("Validation failed:", errors);
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors
      });
    }
    debug_default.debugWarn("req.body", JSON.stringify(req.body, null, 2));
    debug_default.debug("[Register Controller] Calling AuthService.createKitchenService...");
    const result = await createBranch({
      kitchenId: request.kitchen.id,
      name,
      addressLine1,
      addressLine2,
      landmark,
      area,
      pincode,
      countryId: Number(countryId),
      stateId: Number(stateId),
      cityId: Number(cityId),
      contactTitle,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      cuisines
    });
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C SELECT PLAN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== SELECT PLAN END ===");
  }
};
var getBranches2 = async (req, res) => {
  debug_default.debug("=== GET BRANCHES START ===");
  const request = req;
  const kitchenId = request.kitchen.id;
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getBranches({
      page: Number(page),
      limit: Number(limit),
      filters: {
        kitchenId
      }
    });
    return res.status(200).json({
      status: true,
      message: "Branches fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== GET BRANCHES END ===");
  }
};
var getBranchById2 = async (req, res) => {
  debug_default.debug("=== GET BRANCH BY ID START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid branch id"
      });
    }
    const result = await getBranchById(BigInt(id));
    if (!result.status) {
      return res.status(404).json({
        status: false,
        message: result.message
      });
    }
    if (!isCurrentKitchenBranch(result.data, kitchenId)) {
      return branchAccessDenied(res);
    }
    return res.status(200).json({
      status: true,
      message: "Branch fetched successfully",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== GET BRANCH BY ID END ===");
  }
};
var updateBranch2 = async (req, res) => {
  debug_default.debug("=== UPDATE BRANCH START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid branch id"
      });
    }
    const existingBranch = await getBranchById(BigInt(id));
    if (!existingBranch.status) {
      return res.status(404).json({
        status: false,
        message: existingBranch.message
      });
    }
    if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
      return branchAccessDenied(res);
    }
    const updateData = {
      ...req.body
    };
    const result = await updateBranch(BigInt(id), updateData);
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "Branch updated successfully",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== UPDATE BRANCH END ===");
  }
};
var deleteBranch2 = async (req, res) => {
  debug_default.debug("=== DELETE BRANCH START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid branch id"
      });
    }
    const existingBranch = await getBranchById(BigInt(id));
    if (!existingBranch.status) {
      return res.status(404).json({
        status: false,
        message: existingBranch.message
      });
    }
    if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
      return branchAccessDenied(res);
    }
    const result = await deleteBranch(BigInt(id));
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "Branch deleted successfully"
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== DELETE BRANCH END ===");
  }
};
var updateBranchStatus2 = async (req, res) => {
  debug_default.debug("=== UPDATE BRANCH STATUS START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid branch id"
      });
    }
    const existingBranch = await getBranchById(BigInt(id));
    if (!existingBranch.status) {
      return res.status(404).json({
        status: false,
        message: existingBranch.message
      });
    }
    if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
      return branchAccessDenied(res);
    }
    const { status } = req.body;
    const result = await updateBranchStatus(BigInt(id), status);
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "Branch status updated",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== TOGGLE BRANCH STATUS END ===");
  }
};

// src/modules/kitchen/branch/ingredient/ingredient.route.ts
import { Router as Router6 } from "express";

// src/modules/kitchen/branch/ingredient/ingredient.repository.ts
var branchIngredientInventoryRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const branchIngredientInventory = await prisma.branchIngredientInventory.findUnique(options);
      if (!branchIngredientInventory) {
        return {
          status: false,
          message: "BranchIngredientInventory not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventory, "number"),
        message: branchIngredientInventory ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branchIngredientInventory record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const branchIngredientInventory = await prisma.branchIngredientInventory.findFirst(options);
      if (!branchIngredientInventory) {
        return {
          status: false,
          message: "BranchIngredientInventory not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventory, "number"),
        message: branchIngredientInventory ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branchIngredientInventory record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const branchIngredientInventorys = await prisma.branchIngredientInventory.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventorys, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve branchIngredientInventory records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.branchIngredientInventory.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count branchIngredientInventory records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const branchIngredientInventory = await prisma.branchIngredientInventory.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventory, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create branchIngredientInventory"
      };
    }
  },
  // ---------- Create Many BranchIngredientInventorys ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.branchIngredientInventory.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} BranchIngredientInventory record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create branchIngredientInventory records"
      };
    }
  },
  // ---------- Delete Many BranchIngredientInventorys ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.branchIngredientInventory.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} BranchIngredientInventory record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete branchIngredientInventory records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const branchIngredientInventory = await prisma.branchIngredientInventory.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventory, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update branchIngredientInventory"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const branchIngredientInventory = await prisma.branchIngredientInventory.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(branchIngredientInventory, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete branchIngredientInventory"
      };
    }
  }
};
var ingredient_repository_default = branchIngredientInventoryRepo;

// src/modules/kitchen/branch/ingredient/ingredient.service.ts
var createIngredient = async (data) => {
  const { kitchenId, branchId, ingredients } = data;
  debug_default.debug("[Ingredient Service] Saving ingredients to inventory...");
  debug_default.debug(
    "[Ingredient Service] Data:",
    JSON.stringify(data, null, 2)
  );
  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!Array.isArray(ingredients)) {
        throw new Error("Ingredients must be an array");
      }
      const ingredientIds = ingredients.filter((i) => i.id).map((i) => Number(i.id));
      const newIngredients = ingredients.filter((i) => !i.id && i.name && i.category).map((i) => ({
        name: i.name.trim().toLowerCase(),
        category: i.category.trim(),
        image: i.image,
        unit: i.unit || Unit.ITEM
      }));
      const uniqueIngredients = Array.from(
        new Map(
          newIngredients.map((i) => [i.name, i])
        ).values()
      );
      const requestedUnitsById = new Map(
        ingredients.filter((i) => i.id).map((i) => [Number(i.id), i.unit || Unit.ITEM])
      );
      const requestedUnitsByName = new Map(
        uniqueIngredients.map((i) => [i.name, i.unit || Unit.ITEM])
      );
      const inventoryItems = [];
      let existingIngredientIds = [];
      if (ingredientIds.length > 0) {
        const existingIngredients = await tx.ingredient.findMany({
          where: {
            id: {
              in: ingredientIds
            }
          },
          select: {
            id: true
          }
        });
        if (existingIngredients.length !== ingredientIds.length) {
          throw new Error("Some ingredient IDs are invalid");
        }
        existingIngredientIds = existingIngredients.map(
          (i) => Number(i.id)
        );
        inventoryItems.push(
          ...existingIngredientIds.map((id) => ({
            id,
            unit: requestedUnitsById.get(id) || Unit.ITEM
          }))
        );
      }
      if (uniqueIngredients.length > 0) {
        const createdIngredients = await Promise.all(
          uniqueIngredients.map(
            (item) => tx.ingredient.upsert({
              where: {
                name: item.name
              },
              update: {},
              create: {
                name: string_helper_default.toTitleCase(item.name),
                category: string_helper_default.toTitleCase(item.category),
                image: item.image,
                status: Status.PENDING
              }
            })
          )
        );
        inventoryItems.push(
          ...createdIngredients.map((i) => ({
            id: Number(i.id),
            unit: requestedUnitsByName.get(String(i.name).trim().toLowerCase()) || Unit.ITEM
          }))
        );
      }
      const finalIngredientIds = inventoryItems.map((item) => item.id);
      if (finalIngredientIds.length > 0) {
        const inventoryPayload = inventoryItems.map((item) => ({
          kitchenId,
          branchId,
          ingredientId: item.id,
          unit: item.unit
        }));
        await tx.branchIngredientInventory.createMany({
          data: inventoryPayload,
          skipDuplicates: true
        });
      }
      return await tx.branchIngredientInventory.findMany({
        where: {
          kitchenId,
          branchId
        },
        include: {
          ingredient: true
        },
        orderBy: {
          id: "desc"
        }
      });
    });
    debug_default.debug(
      "[Ingredient Service] Ingredients saved successfully",
      JSON.stringify(string_helper_default.convertBigInt(result, "number"), null, 2)
    );
    return {
      status: true,
      data: string_helper_default.convertBigInt(result, "number"),
      message: "Ingredients added successfully"
    };
  } catch (error) {
    debug_default.debugError(
      "[Ingredient Service] Error:",
      error
    );
    return {
      status: false,
      message: error.message || "Failed to add ingredients"
    };
  }
};
var getIngredients = async (params) => {
  try {
    const { page, limit, filters } = params;
    debug_default.debug(
      `[Ingredient Service] Fetching ingredients | Page: ${page}`,
      filters
    );
    const skip = (page - 1) * limit;
    debug_default.debug(
      `[Ingredient Service] Fetching Ingredients | Page: ${page}`
    );
    const where = {
      // 🔥 multi-tenant safety
      kitchenId: BigInt(filters.kitchenId),
      branchId: BigInt(filters.branchId)
    };
    if (filters.name) {
      where.ingredient = {
        ...where.ingredient || {},
        name: {
          contains: filters.name.trim()
        }
      };
    }
    if (filters.category) {
      where.ingredient = {
        ...where.ingredient || {},
        category: {
          contains: filters.category.trim()
        }
      };
    }
    const [
      dataRes,
      filteredCountRes,
      totalCountRes
    ] = await Promise.all([
      // ===========================================
      // 🔥 DATA
      // ===========================================
      ingredient_repository_default.findMany({
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
              status: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      }),
      // ===========================================
      // 🔥 FILTERED COUNT
      // ===========================================
      ingredient_repository_default.count({
        where
      }),
      // ===========================================
      // 🔥 TOTAL COUNT
      // ===========================================
      ingredient_repository_default.count({
        where: {
          kitchenId: BigInt(filters.kitchenId),
          branchId: BigInt(filters.branchId)
        }
      })
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
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debug_default.debugError(
      `[Ingredient Service] getIngredients failed: ${error.message}`
    );
    return {
      status: false,
      message: error.message || "Failed to fetch ingredients",
      data: [],
      meta: null
    };
  }
};
var updateInventoryIngredient = async (data) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.branchIngredientInventory.findFirst({
        where: {
          id: BigInt(data.inventoryId),
          kitchenId: BigInt(data.kitchenId),
          branchId: BigInt(data.branchId)
        },
        include: { ingredient: true }
      });
      if (!inventory) {
        throw new Error("Branch inventory ingredient not found");
      }
      if (data.unit) {
        await tx.branchIngredientInventory.update({
          where: { id: inventory.id },
          data: { unit: data.unit }
        });
      }
      const wantsIngredientEdit = Boolean(data.name || data.category || data.image !== void 0);
      if (wantsIngredientEdit) {
        if (inventory.ingredient.status !== Status.PENDING) {
          throw new Error("Only custom ingredients can be edited. Master ingredients can only be removed from branch inventory.");
        }
        const sharedInventoryCount = await tx.branchIngredientInventory.count({
          where: {
            ingredientId: inventory.ingredientId,
            NOT: {
              id: inventory.id
            }
          }
        });
        if (sharedInventoryCount > 0) {
          throw new Error("This custom ingredient is used by another inventory item and cannot be renamed here.");
        }
        await tx.ingredient.update({
          where: { id: inventory.ingredientId },
          data: {
            ...data.name ? { name: string_helper_default.toTitleCase(data.name.trim().toLowerCase()) } : {},
            ...data.category ? { category: string_helper_default.toTitleCase(data.category.trim()) } : {},
            ...data.image !== void 0 ? { image: data.image || null } : {}
          }
        });
      }
      return tx.branchIngredientInventory.findFirst({
        where: { id: inventory.id },
        include: { ingredient: true }
      });
    });
    return {
      status: true,
      data: string_helper_default.convertBigInt(result, "number"),
      message: "Branch inventory ingredient updated successfully"
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || "Failed to update branch inventory ingredient"
    };
  }
};
var deleteInventoryIngredient = async (data) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.branchIngredientInventory.findFirst({
        where: {
          id: BigInt(data.inventoryId),
          kitchenId: BigInt(data.kitchenId),
          branchId: BigInt(data.branchId)
        },
        include: { ingredient: true }
      });
      if (!inventory) {
        throw new Error("Branch inventory ingredient not found");
      }
      const menuUsageCount = await tx.menuItemIngredient.count({
        where: { inventoryItemId: inventory.id }
      });
      if (menuUsageCount > 0) {
        throw new Error("This ingredient is used in menu items. Remove it from menu first.");
      }
      await tx.branchIngredientInventory.delete({
        where: { id: inventory.id }
      });
      const remainingInventoryCount = await tx.branchIngredientInventory.count({
        where: { ingredientId: inventory.ingredientId }
      });
      if (inventory.ingredient.status === Status.PENDING && remainingInventoryCount === 0) {
        await tx.ingredient.delete({
          where: { id: inventory.ingredientId }
        });
      }
      return inventory;
    });
    return {
      status: true,
      data: string_helper_default.convertBigInt(result, "number"),
      message: "Branch inventory ingredient removed successfully"
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || "Failed to remove branch inventory ingredient"
    };
  }
};

// src/modules/kitchen/branch/ingredient/ingredient.controller.ts
var CreateIngredient = async (req, res) => {
  debug_default.debug("=== SELECT PLAN START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({
        status: false,
        message: branchResult.message
      });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Branch does not belong to this kitchen"
      });
    }
    const {
      ingredients
    } = request.body;
    debug_default.debugWarn("req.body", JSON.stringify(req.body, null, 2));
    debug_default.debug("[Register Controller] Calling AuthService.createKitchenService...");
    const result = await createIngredient({
      kitchenId,
      branchId,
      ingredients
    });
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(201).json({
      status: true,
      message: result.message
    });
  } catch (error) {
    debug_default.debugError("\u274C SELECT PLAN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== SELECT PLAN END ===");
  }
};
var getIngredients2 = async (req, res) => {
  debug_default.debug("=== GET INGREDIENTS START ===");
  const request = req;
  const kitchenId = request.kitchen.id;
  const branchId = Number(req.params.branchId);
  const branchResult = await getBranchById(BigInt(branchId));
  if (!branchResult.status) {
    return res.status(404).json({
      status: false,
      message: branchResult.message
    });
  }
  if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
    return res.status(403).json({
      status: false,
      message: "Branch does not belong to this kitchen"
    });
  }
  try {
    const { page = 1, limit = 10, name, category } = req.query;
    const result = await getIngredients({
      page: Number(page),
      limit: Number(limit),
      filters: {
        kitchenId,
        branchId,
        name: name ? String(name) : void 0,
        category: category ? String(category) : void 0
      }
    });
    return res.status(200).json({
      status: true,
      message: "Branches fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== GET INGREDIENTS END ===");
  }
};
var updateInventoryIngredient2 = async (req, res) => {
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const inventoryId = Number(req.params.inventoryId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({ status: false, message: branchResult.message });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({ status: false, message: "Branch does not belong to this kitchen" });
    }
    const result = await updateInventoryIngredient({
      kitchenId,
      branchId,
      inventoryId,
      ...req.body
    });
    if (!result.status) {
      return res.status(400).json({ status: false, message: result.message });
    }
    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  }
};
var deleteInventoryIngredient2 = async (req, res) => {
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const inventoryId = Number(req.params.inventoryId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({ status: false, message: branchResult.message });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({ status: false, message: "Branch does not belong to this kitchen" });
    }
    const result = await deleteInventoryIngredient({
      kitchenId,
      branchId,
      inventoryId
    });
    if (!result.status) {
      return res.status(400).json({ status: false, message: result.message });
    }
    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  }
};

// src/modules/kitchen/branch/ingredient/ingredient.validation.ts
import { z as z4 } from "zod";
var ingredientSchema = z4.object({
  id: z4.coerce.number().positive().optional(),
  name: z4.string().trim().min(1, "Ingredient name is required").optional(),
  category: z4.string().trim().min(1, "Category is required").optional(),
  image: z4.string().url("Image must be a valid URL").optional(),
  unit: z4.nativeEnum(Unit, {
    message: "Unit is required"
  })
}).superRefine((val, ctx) => {
  if (!val.id) {
    if (!val.name) {
      ctx.addIssue({
        code: z4.ZodIssueCode.custom,
        message: "Ingredient name is required if id is not provided",
        path: ["name"]
      });
    }
    if (!val.category) {
      ctx.addIssue({
        code: z4.ZodIssueCode.custom,
        message: "Category is required if id is not provided",
        path: ["category"]
      });
    }
  }
});
var createIngredientSchema = z4.object({
  ingredients: z4.array(ingredientSchema).min(1, "At least one ingredient is required")
});
var validateCreateIngredient = (req, res, next) => {
  const result = createIngredientSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};
var updateInventoryIngredientSchema = z4.object({
  name: z4.string().trim().min(1, "Ingredient name is required").optional(),
  category: z4.string().trim().min(1, "Category is required").optional(),
  image: z4.string().trim().optional().transform((val) => val || void 0),
  unit: z4.nativeEnum(Unit).optional()
}).refine((val) => Object.keys(val).length > 0, {
  message: "At least one field is required"
});
var validateUpdateInventoryIngredient = (req, res, next) => {
  const result = updateInventoryIngredientSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/branch/ingredient/stock/stock.route.ts
import { Router as Router5 } from "express";

// src/modules/kitchen/branch/ingredient/stock/stock.repository.ts
var inventoryStockRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const inventoryStock = await prisma.inventoryStock.findUnique(options);
      if (!inventoryStock) {
        return {
          status: false,
          message: "InventoryStock not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStock, "number"),
        message: inventoryStock ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve inventoryStock record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const inventoryStock = await prisma.inventoryStock.findFirst(options);
      if (!inventoryStock) {
        return {
          status: false,
          message: "InventoryStock not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStock, "number"),
        message: inventoryStock ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve inventoryStock record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const inventoryStocks = await prisma.inventoryStock.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStocks, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve inventoryStock records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.inventoryStock.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count inventoryStock records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const inventoryStock = await prisma.inventoryStock.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStock, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create inventoryStock"
      };
    }
  },
  // ---------- Create Many InventoryStocks ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.inventoryStock.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} InventoryStock record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create inventoryStock records"
      };
    }
  },
  // ---------- Delete Many InventoryStocks ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.inventoryStock.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} InventoryStock record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete inventoryStock records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const inventoryStock = await prisma.inventoryStock.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStock, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update inventoryStock"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const inventoryStock = await prisma.inventoryStock.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(inventoryStock, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete inventoryStock"
      };
    }
  }
};
var stock_repository_default = inventoryStockRepo;

// src/modules/kitchen/branch/ingredient/stock/stock.service.ts
var createStock = async (data) => {
  const {
    kitchenId,
    branchId,
    stocks
  } = data;
  try {
    debug_default.debug(
      "[Stock Service] Create Stock Payload",
      JSON.stringify(data, null, 2)
    );
    const result = await prisma.$transaction(async (tx) => {
      const ingredientIds = stocks.map(
        (item) => BigInt(item.id)
      );
      const inventoryItems = await tx.branchIngredientInventory.findMany({
        where: {
          kitchenId: BigInt(kitchenId),
          branchId: BigInt(branchId),
          ingredientId: {
            in: ingredientIds
          }
        },
        select: {
          id: true,
          ingredientId: true
        }
      });
      const payload = stocks.map((item) => {
        const inventoryItem = inventoryItems.find(
          (inv) => Number(inv.ingredientId) === Number(item.id)
        );
        if (!inventoryItem) {
          return null;
        }
        return {
          inventoryItemId: inventoryItem.id,
          quantity: item.stock,
          expiryDate: item.expireAt ? new Date(item.expireAt) : null
        };
      }).filter(Boolean);
      if (payload.length === 0) {
        throw new Error(
          "No valid mapped ingredients found for this branch"
        );
      }
      await tx.inventoryStock.createMany({
        data: payload
      });
      return await tx.inventoryStock.findMany({
        where: {
          inventoryItem: {
            kitchenId: BigInt(kitchenId),
            branchId: BigInt(branchId)
          }
        },
        include: {
          inventoryItem: {
            include: {
              ingredient: true,
              branch: true
            }
          }
        },
        orderBy: {
          id: "desc"
        }
      });
    });
    return {
      status: true,
      message: "Stocks added successfully",
      data: string_helper_default.convertBigInt(result)
    };
  } catch (error) {
    debug_default.debugError(
      "[Stock Service] createStock Error",
      error
    );
    return {
      status: false,
      message: error.message || "Failed to add stocks"
    };
  }
};
var getStocks = async (params) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;
    debug_default.debug(
      `[Stock Service] Fetching Stocks | Page: ${page}`,
      filters
    );
    const where = {
      inventoryItem: {
        kitchenId: BigInt(filters.kitchenId),
        branchId: BigInt(filters.branchId),
        ingredient: {}
      }
    };
    if (filters.name) {
      where.inventoryItem.ingredient.name = {
        contains: filters.name.trim()
      };
    }
    if (filters.category) {
      where.inventoryItem.ingredient.category = {
        contains: filters.category.trim()
      };
    }
    const [
      dataRes,
      filteredCountRes,
      totalCountRes
    ] = await Promise.all([
      // ===========================================
      // 📄 DATA
      // ===========================================
      stock_repository_default.findMany({
        where,
        select: {
          id: true,
          quantity: true,
          expiryDate: true,
          createdAt: true,
          inventoryItem: {
            select: {
              id: true,
              unit: true,
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  category: true,
                  status: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          id: "desc"
        }
      }),
      // ===========================================
      // 🔢 FILTERED COUNT
      // ===========================================
      stock_repository_default.count({
        where
      }),
      // ===========================================
      // 🔢 TOTAL COUNT
      // ===========================================
      stock_repository_default.count({
        where: {
          inventoryItem: {
            kitchenId: BigInt(filters.kitchenId),
            branchId: BigInt(filters.branchId)
          }
        }
      })
    ]);
    const data = dataRes.data || [];
    const filtered = filteredCountRes.data || 0;
    const total = totalCountRes.data || 0;
    const totalPages = Math.ceil(filtered / limit);
    return {
      status: true,
      data: string_helper_default.convertBigInt(data),
      meta: {
        page,
        limit,
        total,
        filtered,
        count: data.length,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debug_default.debugError(
      `[Stock Service] getStocks failed`,
      error
    );
    return {
      status: false,
      message: error.message || "Failed to fetch stocks",
      data: [],
      meta: null
    };
  }
};

// src/modules/kitchen/branch/ingredient/stock/stock.controller.ts
var createStock2 = async (req, res) => {
  debug_default.debug("=== CREATE STOCK START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({
        status: false,
        message: branchResult.message
      });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Branch does not belong to this kitchen"
      });
    }
    const { stocks } = request.body;
    debug_default.debugWarn(
      "Create Stock Payload",
      JSON.stringify(req.body, null, 2)
    );
    const result = await createStock({
      kitchenId,
      branchId,
      stocks
    });
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C CREATE STOCK ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== CREATE STOCK END ===");
  }
};
var getStocks2 = async (req, res) => {
  debug_default.debug("=== GET STOCKS START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({
        status: false,
        message: branchResult.message
      });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Branch does not belong to this kitchen"
      });
    }
    const {
      page = 1,
      limit = 10,
      name,
      category
    } = req.query;
    const result = await getStocks({
      page: Number(page),
      limit: Number(limit),
      filters: {
        kitchenId,
        branchId,
        name: name ? String(name) : void 0,
        category: category ? String(category) : void 0
      }
    });
    return res.status(200).json({
      status: true,
      message: "Stocks fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debug_default.debugError("\u274C GET STOCKS ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug("=== GET STOCKS END ===");
  }
};

// src/modules/kitchen/branch/ingredient/stock/stock.validation.ts
import { z as z5 } from "zod";
var stockSchema = z5.object({
  // ✅ Required
  id: z5.coerce.number().positive("Id must be a positive number"),
  // ✅ Required
  stock: z5.coerce.number().positive("Stock must be a positive number"),
  // ✅ Optional
  expireAt: z5.coerce.date().optional()
});
var createStockSchema = z5.object({
  stocks: z5.array(stockSchema).min(1, "At least one stock is required")
});
var validateCreateStock = (req, res, next) => {
  const result = createStockSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/branch/ingredient/stock/stock.route.ts
var router5 = Router5({
  mergeParams: true
});
router5.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateCreateStock,
  createStock2
);
router5.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  getStocks2
);
var stock_route_default = router5;

// src/modules/kitchen/branch/ingredient/ingredient.route.ts
var router6 = Router6({
  mergeParams: true
});
router6.use("/stock", stock_route_default);
router6.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateCreateIngredient,
  CreateIngredient
);
router6.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  getIngredients2
);
router6.put(
  "/:inventoryId",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateUpdateInventoryIngredient,
  updateInventoryIngredient2
);
router6.delete(
  "/:inventoryId",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  deleteInventoryIngredient2
);
var ingredient_route_default = router6;

// src/modules/kitchen/branch/menu/menu.route.ts
import { Router as Router7 } from "express";

// src/modules/kitchen/branch/menu/menu.repository.ts
var menuItemRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const menuItem = await prisma.menuItem.findUnique(options);
      if (!menuItem) {
        return {
          status: false,
          message: "MenuItem not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItem, "number"),
        message: menuItem ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuItem record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const menuItem = await prisma.menuItem.findFirst(options);
      if (!menuItem) {
        return {
          status: false,
          message: "MenuItem not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItem, "number"),
        message: menuItem ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuItem record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const menuItems = await prisma.menuItem.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItems, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuItem records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.menuItem.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count menuItem records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const menuItem = await prisma.menuItem.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItem, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create menuItem"
      };
    }
  },
  // ---------- Create Many MenuItems ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.menuItem.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} MenuItem record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create menuItem records"
      };
    }
  },
  // ---------- Delete Many MenuItems ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.menuItem.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} MenuItem record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete menuItem records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const menuItem = await prisma.menuItem.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItem, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update menuItem"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const menuItem = await prisma.menuItem.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuItem, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete menuItem"
      };
    }
  }
};
var menu_repository_default = menuItemRepo;

// src/modules/kitchen/branch/menu/menu.service.ts
var createMenuItem = async (data) => {
  const {
    kitchenId,
    branchId,
    name,
    description,
    price,
    category,
    subCategory,
    ingredients = []
  } = data;
  debug_default.debug(
    "[MenuItem Service] Saving new menuItem..."
  );
  debug_default.debug(
    "[MenuItem Service] Data:",
    JSON.stringify(data, null, 2)
  );
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        let categoryId;
        if (category?.id) {
          categoryId = BigInt(category.id);
        } else if (category?.name) {
          const createdCategory = await tx.menuCategory.upsert({
            where: {
              name: category.name.trim()
            },
            update: {},
            create: {
              name: string_helper_default.toTitleCase(
                category.name.trim()
              ),
              status: Status.PENDING
            }
          });
          categoryId = createdCategory.id;
        }
        let subCategoryId;
        if (subCategory?.id) {
          subCategoryId = BigInt(subCategory.id);
        } else if (subCategory?.name) {
          if (!categoryId) {
            throw new Error(
              "Category is required for sub category"
            );
          }
          const normalizedSubCategoryName = string_helper_default.toTitleCase(
            subCategory.name.trim()
          );
          const existingSubCategory = await tx.menuCategory.findFirst({
            where: {
              name: normalizedSubCategoryName,
              parentId: Number(categoryId)
            }
          });
          if (existingSubCategory) {
            subCategoryId = existingSubCategory.id;
          } else {
            const createdSubCategory = await tx.menuCategory.create({
              data: {
                name: normalizedSubCategoryName,
                parent: {
                  connect: {
                    id: categoryId
                  }
                },
                status: Status.PENDING
              }
            });
            subCategoryId = createdSubCategory.id;
          }
        }
        const menuItem = await tx.menuItem.create({
          data: {
            kitchen: {
              connect: {
                id: BigInt(kitchenId)
              }
            },
            branch: {
              connect: {
                id: BigInt(branchId)
              }
            },
            name,
            description,
            price,
            ...categoryId && {
              category: {
                connect: {
                  id: categoryId
                }
              }
            },
            ...subCategoryId && {
              subCategory: {
                connect: {
                  id: subCategoryId
                }
              }
            }
          }
        });
        if (ingredients.length > 0) {
          const inventoryItems = await tx.branchIngredientInventory.findMany({
            where: {
              kitchenId: BigInt(kitchenId),
              branchId: BigInt(branchId),
              ingredientId: {
                in: ingredients.map(
                  (item) => BigInt(item.id)
                )
              }
            },
            select: {
              id: true,
              ingredientId: true
            }
          });
          const inventoryMap = new Map(
            inventoryItems.map((item) => [
              Number(item.ingredientId),
              item.id
            ])
          );
          await tx.menuItemIngredient.createMany({
            data: ingredients.map(
              (ingredient) => ({
                menuItemId: menuItem.id,
                inventoryItemId: inventoryMap.get(
                  ingredient.id
                ),
                quantityRequired: ingredient.quantity
              })
            ),
            skipDuplicates: true
          });
        }
        return menuItem;
      }
    );
    return {
      status: true,
      data: string_helper_default.convertBigInt(result, "number"),
      message: "MenuItem created successfully"
    };
  } catch (error) {
    debug_default.debugError(
      "[MenuItem Service] Error:",
      error
    );
    return {
      status: false,
      message: error.message || "Failed to create menuItem"
    };
  }
};
var getMenuItemes = async (params) => {
  try {
    const {
      page,
      limit,
      filters
    } = params;
    const skip = (page - 1) * limit;
    debug_default.debug(
      `[MenuItem Service] Fetching menuItems | Page: ${page}`
    );
    const where = {
      kitchenId: BigInt(filters.kitchenId),
      branchId: BigInt(filters.branchId),
      status: Status.ACTIVE
    };
    if (filters.name?.trim()) {
      where.OR = [
        {
          name: {
            contains: filters.name.trim()
          }
        }
        /*
        {
            description: {
                contains: filters.name.trim()
            }
        }
        */
      ];
    }
    if (filters.category?.trim()) {
      where.category = {
        name: {
          contains: filters.category.trim()
        }
      };
    }
    if (filters.categoryId) {
      where.categoryId = BigInt(filters.categoryId);
    }
    if (filters.subCategory?.trim()) {
      where.subCategory = {
        ...where.subCategory || {},
        name: {
          contains: filters.subCategory.trim()
        }
      };
    }
    if (filters.subCategoryId) {
      where.subCategoryId = BigInt(filters.subCategoryId);
    }
    if (filters.status) {
      where.status = filters.status;
    }
    const [
      dataRes,
      filteredCountRes,
      totalCountRes
    ] = await Promise.all([
      menu_repository_default.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          category: true,
          subCategory: true,
          ingredients: {
            include: {
              inventoryItem: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      }),
      // 🔥 FILTERED COUNT
      menu_repository_default.count({
        where
      }),
      // 🔥 TOTAL COUNT
      menu_repository_default.count({
        where: {
          kitchenId: BigInt(
            filters.kitchenId
          ),
          branchId: BigInt(
            filters.branchId
          ),
          status: Status.ACTIVE
        }
      })
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
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debug_default.debugError(
      `[MenuItem Service] getMenuItemes failed: ${error.message}`
    );
    return {
      status: false,
      message: "Failed to fetch menuItems",
      data: [],
      meta: null
    };
  }
};
var getMenuItemById = async (id) => {
  try {
    debug_default.debug(
      `[MenuItem Service] Fetching menuItem: ${id}`
    );
    const response = await menu_repository_default.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        ingredients: {
          include: {
            inventoryItem: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });
    if (!response?.data) {
      return {
        status: false,
        message: "MenuItem not found"
      };
    }
    return {
      status: true,
      data: response.data
    };
  } catch (error) {
    debug_default.debugError(
      `[MenuItem Service] getMenuItemById failed: ${error.message}`
    );
    return {
      status: false,
      message: "Something went wrong"
    };
  }
};
var updateMenuItem = async (id, data) => {
  try {
    debug_default.debug(
      `[MenuItem Service] Updating menuItem: ${id}`
    );
    const existing = await menu_repository_default.findUnique({
      where: { id }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "MenuItem not found"
      };
    }
    const kitchenId = Number(existing.data.kitchenId);
    const branchId = Number(existing.data.branchId);
    const result = await prisma.$transaction(
      async (tx) => {
        let categoryId;
        let subCategoryId;
        if (data.category?.id) {
          categoryId = BigInt(data.category.id);
        } else if (data.category?.name) {
          const category = await tx.menuCategory.upsert({
            where: {
              name: data.category.name.trim()
            },
            update: {},
            create: {
              name: string_helper_default.toTitleCase(
                data.category.name.trim()
              ),
              status: Status.PENDING
            }
          });
          categoryId = category.id;
        }
        if (data.subCategory?.id) {
          subCategoryId = BigInt(
            data.subCategory.id
          );
        } else if (data.subCategory?.name && categoryId) {
          const subCategory = await tx.menuCategory.upsert({
            where: {
              name: data.subCategory.name.trim()
            },
            update: {},
            create: {
              name: string_helper_default.toTitleCase(
                data.subCategory.name.trim()
              ),
              parent: {
                connect: {
                  id: categoryId
                }
              },
              status: Status.PENDING
            }
          });
          subCategoryId = subCategory.id;
        }
        const updatedMenuItem = await tx.menuItem.update({
          where: { id },
          data: {
            ...data.name && {
              name: data.name
            },
            ...data.description !== void 0 && {
              description: data.description
            },
            ...data.price !== void 0 && {
              price: data.price
            },
            ...categoryId && {
              category: {
                connect: {
                  id: categoryId
                }
              }
            },
            ...subCategoryId && {
              subCategory: {
                connect: {
                  id: subCategoryId
                }
              }
            }
          }
        });
        if (Array.isArray(
          data.ingredients
        )) {
          await tx.menuItemIngredient.deleteMany({
            where: {
              menuItemId: id
            }
          });
          if (data.ingredients.length > 0) {
            const inventoryItems = await tx.branchIngredientInventory.findMany({
              where: {
                kitchenId: BigInt(kitchenId),
                branchId: BigInt(branchId),
                ingredientId: {
                  in: data.ingredients.map(
                    (item) => BigInt(
                      item.id
                    )
                  )
                }
              },
              select: {
                id: true,
                ingredientId: true
              }
            });
            const inventoryMap = new Map(
              inventoryItems.map(
                (item) => [
                  Number(
                    item.ingredientId
                  ),
                  item.id
                ]
              )
            );
            await tx.menuItemIngredient.createMany({
              data: data.ingredients.map(
                (ingredient) => ({
                  menuItemId: id,
                  inventoryItemId: inventoryMap.get(
                    ingredient.id
                  ),
                  quantityRequired: ingredient.quantity
                })
              ),
              skipDuplicates: true
            });
          }
        }
        return updatedMenuItem;
      }
    );
    return {
      status: true,
      message: "MenuItem updated successfully",
      data: string_helper_default.convertBigInt(result, "number")
    };
  } catch (error) {
    debug_default.debugError(
      `[MenuItem Service] updateMenuItem failed: ${error.message}`
    );
    return {
      status: false,
      message: "Something went wrong while updating menuItem"
    };
  }
};
var deleteMenuItem = async (id) => {
  try {
    debug_default.debug(
      `[MenuItem Service] Deleting menuItem: ${id}`
    );
    const existing = await menu_repository_default.findUnique({
      where: { id }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "MenuItem not found"
      };
    }
    const response = await menu_repository_default.update(
      Number(id),
      {
        status: Status.INACTIVE
      }
    );
    if (!response.status) {
      return {
        status: false,
        message: "Failed to delete menuItem"
      };
    }
    return {
      status: true,
      message: "MenuItem deleted successfully"
    };
  } catch (error) {
    debug_default.debugError(
      `[MenuItem Service] deleteMenuItem failed: ${error.message}`
    );
    return {
      status: false,
      message: "Something went wrong while deleting menuItem"
    };
  }
};
var updateMenuItemStatus = async (id, status) => {
  try {
    debug_default.debug(
      `[MenuItem Service] Updating status: ${id} -> ${status}`
    );
    const existing = await menu_repository_default.findUnique({
      where: {
        id: Number(id)
      }
    });
    if (!existing?.data) {
      return {
        status: false,
        message: "MenuItem not found"
      };
    }
    if (existing.data.status === status) {
      return {
        status: false,
        message: `MenuItem already ${status}`
      };
    }
    const response = await menu_repository_default.update(
      Number(id),
      { status }
    );
    return {
      status: true,
      message: "MenuItem status updated successfully",
      data: response.data
    };
  } catch (error) {
    debug_default.debugError(
      `[MenuItem Service] updateMenuItemStatus failed: ${error.message}`
    );
    return {
      status: false,
      message: "Something went wrong"
    };
  }
};

// src/modules/shared/menu/category.repository.ts
var menuCategoryRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const menuCategory = await prisma.menuCategory.findUnique(options);
      if (!menuCategory) {
        return {
          status: false,
          message: "MenuCategory not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategory, "number"),
        message: menuCategory ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuCategory record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const menuCategory = await prisma.menuCategory.findFirst(options);
      if (!menuCategory) {
        return {
          status: false,
          message: "MenuCategory not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategory, "number"),
        message: menuCategory ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuCategory record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const menuCategorys = await prisma.menuCategory.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategorys, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve menuCategory records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.menuCategory.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count menuCategory records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const menuCategory = await prisma.menuCategory.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategory, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create menuCategory"
      };
    }
  },
  // ---------- Create Many MenuCategorys ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.menuCategory.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} MenuCategory record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create menuCategory records"
      };
    }
  },
  // ---------- Delete Many MenuCategorys ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.menuCategory.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} MenuCategory record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete menuCategory records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const menuCategory = await prisma.menuCategory.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategory, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update menuCategory"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const menuCategory = await prisma.menuCategory.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(menuCategory, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete menuCategory"
      };
    }
  }
};
var category_repository_default = menuCategoryRepo;

// src/modules/kitchen/branch/menu/menu.controller.ts
var createMenuItem2 = async (req, res) => {
  debug_default.debug("=== CREATE MENU START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({
        status: false,
        message: branchResult.message
      });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Branch does not belong to this kitchen"
      });
    }
    const {
      name,
      description,
      price,
      category,
      subCategory,
      ingredients
    } = request.body;
    const errors = {};
    const existing = await menu_repository_default.findFirst({
      where: {
        kitchenId: BigInt(kitchenId),
        branchId: BigInt(branchId),
        name
      }
    });
    debug_default.debugWarn(
      "existing",
      JSON.stringify(existing, null, 2)
    );
    if (existing.status) {
      errors.name = "Menu item already exists with same name";
    }
    if (category?.id) {
      const categoryResponse = await category_repository_default.findUnique({
        where: {
          id: BigInt(category.id)
        },
        select: {
          id: true
        }
      });
      if (!categoryResponse.status || !categoryResponse.data) {
        errors.category = "Category not found";
      }
    }
    if (subCategory?.id) {
      const subCategoryResponse = await category_repository_default.findUnique({
        where: {
          id: BigInt(subCategory.id)
        },
        select: {
          id: true,
          parentId: true
        }
      });
      if (!subCategoryResponse.status || !subCategoryResponse.data) {
        errors.subCategory = "Sub category not found";
      } else {
        if (!subCategoryResponse.data.parentId) {
          errors.subCategory = "Selected category is not a sub category";
        } else if (category?.id) {
          if (Number(subCategoryResponse.data.parentId) !== Number(category.id)) {
            errors.subCategory = "Sub category does not belong to selected category";
          }
        }
      }
    }
    if (ingredients?.length) {
      const ingredientIds = ingredients.map(
        (item) => Number(item.id)
      );
      const ingredientBigIntIds = ingredientIds.map(
        (id) => BigInt(id)
      );
      const inventoryResponse = await ingredient_repository_default.findMany({
        where: {
          kitchenId: BigInt(kitchenId),
          branchId: BigInt(branchId),
          ingredientId: {
            in: ingredientBigIntIds
          }
        },
        select: {
          ingredientId: true
        }
      });
      const foundIds = new Set(
        inventoryResponse.data.map(
          (item) => Number(item.ingredientId)
        )
      );
      const invalidIngredients = ingredientIds.filter(
        (id) => !foundIds.has(id)
      );
      if (invalidIngredients.length > 0) {
        errors.ingredients = `Invalid ingredient ids: ${invalidIngredients.join(", ")}`;
      }
    }
    if (Object.keys(errors).length > 0) {
      debug_default.debugWarn(
        "Validation failed:",
        errors
      );
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors
      });
    }
    debug_default.debugWarn(
      "req.body",
      JSON.stringify(req.body, null, 2)
    );
    debug_default.debug(
      "[MenuItem Controller] Calling MenuItemService.createMenuItem..."
    );
    const result = await createMenuItem({
      kitchenId,
      branchId,
      name,
      description,
      price,
      category,
      subCategory,
      ingredients
    });
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    debug_default.debugError(
      "\u274C CREATE MENU ERROR:",
      error
    );
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error"
    });
  } finally {
    debug_default.debug(
      "=== CREATE MENU END ==="
    );
  }
};
var getMenuItemes2 = async (req, res) => {
  debug_default.debug("=== GET MENUES START ===");
  const request = req;
  const kitchenId = request.kitchen.id;
  const branchId = Number(req.params.branchId);
  const branchResult = await getBranchById(BigInt(branchId));
  if (!branchResult.status) {
    return res.status(404).json({
      status: false,
      message: branchResult.message
    });
  }
  try {
    const { page = 1, limit = 10, name, category, categoryId, subCategory, subCategoryId } = req.query;
    const result = await getMenuItemes({
      page: Number(page),
      limit: Number(limit),
      filters: {
        kitchenId,
        branchId,
        name: name ? String(name) : void 0,
        category: category ? String(category) : void 0,
        categoryId: categoryId ? Number(categoryId) : void 0,
        subCategory: subCategory ? String(subCategory) : void 0,
        subCategoryId: subCategoryId ? Number(subCategoryId) : void 0
      }
    });
    return res.status(200).json({
      status: true,
      message: "MenuItemes fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== GET MENUES END ===");
  }
};
var getMenuItemById2 = async (req, res) => {
  debug_default.debug("=== GET MENU BY ID START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid menuItem id"
      });
    }
    const result = await getMenuItemById(BigInt(id));
    if (!result.status) {
      return res.status(404).json({
        status: false,
        message: result.message
      });
    }
    if (Number(result.data?.kitchenId) !== Number(kitchenId) || Number(result.data?.branchId) !== Number(branchId)) {
      return res.status(403).json({
        status: false,
        message: "Menu item does not belong to this branch"
      });
    }
    return res.status(200).json({
      status: true,
      message: "MenuItem fetched successfully",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== GET MENU BY ID END ===");
  }
};
var updateMenuItem2 = async (req, res) => {
  debug_default.debug(
    "=== UPDATE MENU START ==="
  );
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const branchResult = await getBranchById(BigInt(branchId));
    if (!branchResult.status) {
      return res.status(404).json({
        status: false,
        message: branchResult.message
      });
    }
    if (Number(branchResult.data?.userId) !== Number(kitchenId)) {
      return res.status(403).json({
        status: false,
        message: "Branch does not belong to this kitchen"
      });
    }
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid menuItem id"
      });
    }
    const {
      name,
      category,
      subCategory,
      ingredients
    } = req.body;
    const errors = {};
    const existingMenuItem = await menu_repository_default.findUnique({
      where: {
        id: BigInt(id)
      },
      select: {
        id: true,
        kitchenId: true,
        branchId: true,
        name: true
      }
    });
    if (!existingMenuItem.status || !existingMenuItem.data) {
      return res.status(404).json({
        status: false,
        message: "MenuItem not found"
      });
    }
    if (Number(existingMenuItem.data.kitchenId) !== Number(kitchenId) || Number(existingMenuItem.data.branchId) !== Number(branchId)) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized access"
      });
    }
    if (name) {
      const duplicateMenuItem = await menu_repository_default.findFirst({
        where: {
          kitchenId: BigInt(kitchenId),
          branchId: BigInt(branchId),
          name,
          NOT: {
            id: BigInt(id)
          }
        },
        select: {
          id: true
        }
      });
      if (duplicateMenuItem.status && duplicateMenuItem.data) {
        errors.name = "Menu item already exists with same name";
      }
    }
    if (category?.id) {
      const categoryResponse = await category_repository_default.findUnique({
        where: {
          id: BigInt(category.id)
        },
        select: {
          id: true
        }
      });
      if (!categoryResponse.status || !categoryResponse.data) {
        errors.category = "Category not found";
      }
    }
    if (subCategory?.id) {
      const subCategoryResponse = await category_repository_default.findUnique({
        where: {
          id: BigInt(subCategory.id)
        },
        select: {
          id: true,
          parentId: true
        }
      });
      if (!subCategoryResponse.status || !subCategoryResponse.data) {
        errors.subCategory = "Sub category not found";
      } else {
        if (!subCategoryResponse.data.parentId) {
          errors.subCategory = "Selected category is not a sub category";
        } else if (category?.id) {
          if (Number(subCategoryResponse.data.parentId) !== Number(category.id)) {
            errors.subCategory = "Sub category does not belong to selected category";
          }
        }
      }
    }
    if (ingredients?.length) {
      const ingredientIds = ingredients.map(
        (item) => Number(item.id)
      );
      const inventoryResponse = await ingredient_repository_default.findMany({
        where: {
          kitchenId: BigInt(kitchenId),
          branchId: BigInt(branchId),
          ingredientId: {
            in: ingredientIds.map(
              (id2) => BigInt(id2)
            )
          }
        },
        select: {
          ingredientId: true
        }
      });
      const foundIds = new Set(
        inventoryResponse.data.map(
          (item) => Number(item.ingredientId)
        )
      );
      const invalidIngredients = ingredientIds.filter(
        (ingredientId) => !foundIds.has(ingredientId)
      );
      if (invalidIngredients.length > 0) {
        errors.ingredients = `Invalid ingredient ids: ${invalidIngredients.join(", ")}`;
      }
    }
    if (Object.keys(errors).length > 0) {
      debug_default.debugWarn(
        "Validation failed:",
        errors
      );
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors
      });
    }
    const updateData = {
      ...req.body
    };
    debug_default.debugWarn(
      "updateData",
      JSON.stringify(updateData, null, 2)
    );
    const result = await updateMenuItem(
      BigInt(id),
      updateData
    );
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "MenuItem updated successfully",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError(
      "\u274C UPDATE MENU ERROR:",
      error
    );
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug(
      "=== UPDATE MENU END ==="
    );
  }
};
var deleteMenuItem2 = async (req, res) => {
  debug_default.debug("=== DELETE MENU START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid menuItem id"
      });
    }
    const existing = await getMenuItemById(BigInt(id));
    if (!existing.status) {
      return res.status(404).json({
        status: false,
        message: existing.message
      });
    }
    if (Number(existing.data?.kitchenId) !== Number(kitchenId) || Number(existing.data?.branchId) !== Number(branchId)) {
      return res.status(403).json({
        status: false,
        message: "Menu item does not belong to this branch"
      });
    }
    const result = await deleteMenuItem(BigInt(id));
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "MenuItem deleted successfully"
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== DELETE MENU END ===");
  }
};
var updateMenuItemStatus2 = async (req, res) => {
  debug_default.debug("=== UPDATE MENU STATUS START ===");
  try {
    const request = req;
    const kitchenId = request.kitchen.id;
    const branchId = Number(req.params.branchId);
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid menuItem id"
      });
    }
    const existing = await getMenuItemById(BigInt(id));
    if (!existing.status) {
      return res.status(404).json({
        status: false,
        message: existing.message
      });
    }
    if (Number(existing.data?.kitchenId) !== Number(kitchenId) || Number(existing.data?.branchId) !== Number(branchId)) {
      return res.status(403).json({
        status: false,
        message: "Menu item does not belong to this branch"
      });
    }
    const { status } = req.body;
    const result = await updateMenuItemStatus(BigInt(id), status);
    if (!result.status) {
      return res.status(400).json({
        status: false,
        message: result.message
      });
    }
    return res.status(200).json({
      status: true,
      message: "MenuItem status updated",
      data: result.data
    });
  } catch (error) {
    debug_default.debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug_default.debug("=== TOGGLE MENU STATUS END ===");
  }
};

// src/modules/kitchen/branch/menu/menu.validation.ts
import { z as z6 } from "zod";
var categorySchema = z6.object({
  id: z6.coerce.number().positive().optional(),
  name: z6.string().trim().min(1).optional()
}).superRefine((val, ctx) => {
  if (!val.id && !val.name) {
    ctx.addIssue({
      code: z6.ZodIssueCode.custom,
      message: "Either category id or name is required",
      path: ["name"]
    });
  }
});
var subCategorySchema = z6.object({
  id: z6.coerce.number().positive().optional(),
  name: z6.string().trim().min(1).optional()
}).superRefine((val, ctx) => {
  if (!val.id && !val.name) {
    ctx.addIssue({
      code: z6.ZodIssueCode.custom,
      message: "Either subCategory id or name is required",
      path: ["name"]
    });
  }
});
var ingredientSchema2 = z6.object({
  id: z6.coerce.number().positive("Ingredient id is required"),
  quantity: z6.coerce.number().positive("Ingredient quantity must be greater than 0")
});
var createMenuItemSchema = z6.object({
  // ===============================================
  // 🏷️ BASIC INFO
  // ===============================================
  name: z6.string().trim().min(1, "Menu item name is required"),
  description: z6.string().trim().optional(),
  price: z6.coerce.number().positive("Price must be greater than 0"),
  // ===============================================
  // 🏷️ CATEGORY
  // ===============================================
  category: categorySchema.optional(),
  // ===============================================
  // 🏷️ SUB CATEGORY
  // ===============================================
  subCategory: subCategorySchema.optional(),
  // ===============================================
  // 🥬 INGREDIENTS
  // ===============================================
  ingredients: z6.array(ingredientSchema2).min(1, "At least one ingredient is required")
});
var updateMenuItemSchema = createMenuItemSchema.partial();
var menuItemIdSchema = z6.object({
  id: z6.coerce.number().positive()
});
var updateMenuItemStatusSchema = z6.object({
  status: z6.nativeEnum(Status, {
    message: "Invalid status value"
  })
});
var validateCreateMenuItem = (req, res, next) => {
  const result = createMenuItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};
var validateUpdateMenuItem = (req, res, next) => {
  const result = updateMenuItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};
var validateMenuItemId = (req, res, next) => {
  const result = menuItemIdSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Invalid menu item id"
    });
  }
  next();
};
var validateMenuItemStatus = (req, res, next) => {
  const result = updateMenuItemStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/branch/menu/menu.route.ts
var router7 = Router7({
  mergeParams: true
});
router7.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateCreateMenuItem,
  createMenuItem2
);
router7.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  getMenuItemes2
);
router7.get(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateMenuItemId,
  getMenuItemById2
);
router7.put(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateMenuItemId,
  validateUpdateMenuItem,
  updateMenuItem2
);
router7.delete(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateMenuItemId,
  deleteMenuItem2
);
router7.patch(
  "/:id/status",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateMenuItemId,
  validateMenuItemStatus,
  updateMenuItemStatus2
);
var menu_route_default = router7;

// src/modules/kitchen/branch/branch.validation.ts
import { z as z7 } from "zod";
var cuisineSchema = z7.object({
  id: z7.coerce.number().positive().optional(),
  name: z7.string().min(1).optional()
}).superRefine((val, ctx) => {
  if (!val.id && !val.name) {
    ctx.addIssue({
      code: z7.ZodIssueCode.custom,
      message: "Either cuisine id or name is required",
      path: ["name"]
    });
  }
  if (!val.id && val.name === "") {
    ctx.addIssue({
      code: z7.ZodIssueCode.custom,
      message: "Cuisine name is required if id is not provided",
      path: ["name"]
    });
  }
});
var createBranchSchema = z7.object({
  // ===============================================
  // 🏷️ BASIC INFO
  // ===============================================
  name: z7.string().min(1, "Branch name is required"),
  // ===============================================
  // 📍 ADDRESS
  // ===============================================
  addressLine1: z7.string().min(1, "Address Line 1 is required"),
  addressLine2: z7.string().optional(),
  landmark: z7.string().optional(),
  area: z7.string().optional(),
  pincode: z7.string().regex(/^[0-9]{6}$/, "Pincode must be a valid 6 digit number"),
  // ===============================================
  // 🌍 LOCATION RELATIONS
  // ===============================================
  countryId: z7.coerce.number().positive("Country is required"),
  stateId: z7.coerce.number().positive("State is required"),
  cityId: z7.coerce.number().positive("City is required"),
  // ===============================================
  // 📞 CONTACT PERSON
  // ===============================================
  contactTitle: z7.enum(["MR", "MRS", "MS", "DR"], {
    message: "Contact title must be MR, MRS, MS or DR"
  }),
  contactFirstName: z7.string().min(1, "Contact first name cannot be empty"),
  contactLastName: z7.string().optional(),
  contactEmail: z7.string().email("Invalid contact email format"),
  contactPhone: z7.string().min(7, "Contact phone is too short").max(15, "Contact phone is too long").regex(/^\+?[0-9]+$/, "Contact phone must be a valid number"),
  cuisines: z7.array(cuisineSchema).min(1, "At least one cuisine is required")
});
var updateBranchSchema = createBranchSchema.partial();
var branchIdSchema = z7.object({
  id: z7.coerce.number().positive()
});
var updateBranchStatusSchema = z7.object({
  status: z7.nativeEnum(Status, {
    message: "Invalid status value"
  })
});
var validateCreateBranch = (req, res, next) => {
  const result = createBranchSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};
var validateUpdateBranch = (req, res, next) => {
  const result = updateBranchSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};
var validateBranchId = (req, res, next) => {
  const result = branchIdSchema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Invalid branch id"
    });
  }
  next();
};
var validateBranchStatus = (req, res, next) => {
  const result = updateBranchStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.body = result.data;
  next();
};

// src/modules/kitchen/branch/branch.route.ts
var router8 = Router8({
  mergeParams: true
});
router8.post(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateCreateBranch,
  createBranch2
);
router8.get(
  "/",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  getBranches2
);
router8.get(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateBranchId,
  getBranchById2
);
router8.put(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateBranchId,
  validateUpdateBranch,
  updateBranch2
);
router8.delete(
  "/:id",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateBranchId,
  deleteBranch2
);
router8.patch(
  "/:id/status",
  verifyToken({ checkOnboarding: true, checkSubscription: true }),
  validateBranchId,
  validateBranchStatus,
  updateBranchStatus2
);
router8.use("/:branchId/ingredient", ingredient_route_default);
router8.use("/:branchId/menu", menu_route_default);
var branch_route_default = router8;

// src/modules/kitchen/kitchen.route.ts
var router9 = Router9({
  mergeParams: true
});
router9.use("/auth", auth_route_default);
router9.use("/onboarding", onboarding_route_default);
router9.use("/subscription", subscription_route_default);
router9.use("/branch", branch_route_default);
var kitchen_route_default = router9;

// src/modules/master/master.route.ts
import { Router as Router12 } from "express";

// src/modules/master/cuisine/cuisine.route.ts
import { Router as Router10 } from "express";

// src/modules/master/cuisine/cuisine.repository.ts
var cuisineRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const cuisine = await prisma.cuisine.findUnique(options);
      if (!cuisine) {
        return {
          status: false,
          message: "Cuisine not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisine, "number"),
        message: cuisine ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve cuisine record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const cuisine = await prisma.cuisine.findFirst(options);
      if (!cuisine) {
        return {
          status: false,
          message: "Cuisine not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisine, "number"),
        message: cuisine ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve cuisine record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const cuisines = await prisma.cuisine.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisines, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve cuisine records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.cuisine.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count cuisine records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const cuisine = await prisma.cuisine.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisine, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create cuisine"
      };
    }
  },
  // ---------- Create Many Cuisines ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.cuisine.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Cuisine record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create cuisine records"
      };
    }
  },
  // ---------- Delete Many Cuisines ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.cuisine.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Cuisine record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete cuisine records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const cuisine = await prisma.cuisine.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisine, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update cuisine"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const cuisine = await prisma.cuisine.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(cuisine, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete cuisine"
      };
    }
  }
};
var cuisine_repository_default = cuisineRepo;

// src/modules/master/cuisine/cuisine.service.ts
var getCuisines = async (params) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;
    debug(`[Cuisine Service] Fetching cuisines | Page: ${page}`);
    const where = {};
    if (filters.name) {
      where.name = {
        contains: filters.name
      };
    }
    if (filters.category) {
      where.category = {
        contains: filters.category
      };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      cuisine_repository_default.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      // filtered count
      cuisine_repository_default.count({ where }),
      // total count (without filter)
      cuisine_repository_default.count()
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
        // 🔥 total records (all)
        filtered,
        // 🔥 after filter
        count: data.length,
        // 🔥 current page items
        totalPages,
        // 🔥 total pages possible
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debugError(`[Cuisine Service] getCuisines failed: ${error.message}`);
    return {
      status: false,
      message: "Failed to fetch cuisines",
      data: [],
      meta: null
    };
  }
};

// src/modules/master/cuisine/cuisine.controller.ts
import { debug as debug2 } from "node:console";
var getCuisines2 = async (req, res) => {
  debug2("=== GET BRANCHES START ===");
  try {
    const { page = 1, limit = 10, name, category, status } = req.validatedQuery;
    const result = await getCuisines({
      page: Number(page),
      limit: Number(limit),
      filters: {
        name,
        category,
        status
      }
    });
    return res.status(200).json({
      status: true,
      message: "Cuisines fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug2("=== GET BRANCHES END ===");
  }
};

// src/modules/master/cuisine/cuisine.validation.ts
import { z as z8 } from "zod";
var getCuisineQuerySchema = z8.object({
  page: z8.coerce.number().positive().default(1),
  limit: z8.coerce.number().positive().max(50).default(10),
  name: z8.string().optional().transform((val) => val ?? ""),
  category: z8.string().optional().transform((val) => val ?? ""),
  status: z8.nativeEnum(Status).optional()
});
var validateGetCuisines = (req, res, next) => {
  const result = getCuisineQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.validatedQuery = result.data;
  next();
};

// src/modules/master/cuisine/cuisine.route.ts
var router10 = Router10({
  mergeParams: true
});
router10.get(
  "/",
  validateGetCuisines,
  getCuisines2
);
var cuisine_route_default = router10;

// src/modules/master/ingredient/ingredient.route.ts
import { Router as Router11 } from "express";

// src/modules/master/ingredient/ingredient.repository.ts
var ingredientRepo = {
  // ---------- Find Admin(Unique) ----------
  async findUnique(options) {
    try {
      if (!options.where) {
        throw new Error("Unique filter (where) is required");
      }
      const ingredient = await prisma.ingredient.findUnique(options);
      if (!ingredient) {
        return {
          status: false,
          message: "Ingredient not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(ingredient, "number"),
        message: ingredient ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve ingredient record"
      };
    }
  },
  // ---------- Find Admin(First Match) ----------
  async findFirst(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required");
      }
      const ingredient = await prisma.ingredient.findFirst(options);
      if (!ingredient) {
        return {
          status: false,
          message: "Ingredient not found"
        };
      }
      return {
        status: true,
        data: string_helper_default.convertBigInt(ingredient, "number"),
        message: ingredient ? "Admin record retrieved successfully" : "Admin not found"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve ingredient record"
      };
    }
  },
  // ---------- Find Multiple Admins ----------
  async findMany(options = {}) {
    try {
      const ngredients = await prisma.ingredient.findMany(options);
      return {
        status: true,
        data: string_helper_default.convertBigInt(ngredients, "number"),
        message: "Admin records retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to retrieve ingredient records"
      };
    }
  },
  // ---------- Count Admins ----------
  async count(options = {}) {
    try {
      const count = await prisma.ingredient.count({
        where: options.where
      });
      return {
        status: true,
        data: count,
        message: "Admin count retrieved successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Unable to count ingredient records"
      };
    }
  },
  // ---------- Create Admin ----------
  async create(data, options = {}) {
    try {
      const ingredient = await prisma.ingredient.create({
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(ingredient, "number"),
        message: "Admin created successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create ingredient"
      };
    }
  },
  // ---------- Create Many Ingredients ----------
  async createMany(options) {
    try {
      if (!options.data || Array.isArray(options.data) && options.data.length === 0) {
        return {
          status: false,
          message: "No data provided for createMany"
        };
      }
      const result = await prisma.ingredient.createMany({
        ...options,
        skipDuplicates: options.skipDuplicates ?? true
        // safe default — skips already-assigned permissions
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Ingredient record(s) created successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to create ingredient records"
      };
    }
  },
  // ---------- Delete Many Ingredients ----------
  async deleteMany(options) {
    try {
      if (!options.where) {
        throw new Error("Filter (where) is required for deleteMany");
      }
      const result = await prisma.ingredient.deleteMany({
        where: options.where
      });
      return {
        status: true,
        data: { count: result.count },
        message: `${result.count} Ingredient record(s) deleted successfully`
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete ingredient records"
      };
    }
  },
  // ---------- Update Admin ----------
  async update(id, data, options = {}) {
    try {
      const ingredient = await prisma.ingredient.update({
        where: { id },
        data,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(ingredient, "number"),
        message: "Admin updated successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to update ingredient"
      };
    }
  },
  // ---------- Delete Admin ----------
  async delete(where, options = {}) {
    try {
      const ingredient = await prisma.ingredient.delete({
        where,
        ...options
      });
      return {
        status: true,
        data: string_helper_default.convertBigInt(ingredient, "number"),
        message: "Admin deleted successfully"
      };
    } catch (err) {
      return {
        status: false,
        message: err.message || "Failed to delete ingredient"
      };
    }
  }
};
var ingredient_repository_default2 = ingredientRepo;

// src/modules/master/ingredient/ingredient.service.ts
var getIngredientes = async (params) => {
  try {
    const { page, limit, filters } = params;
    const skip = (page - 1) * limit;
    debug(`[Ingrediente Service] Fetching ingredientes | Page: ${page}`);
    const where = {};
    if (filters.name) {
      where.name = {
        contains: filters.name
      };
    }
    if (filters.category) {
      where.category = {
        contains: filters.category
      };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    const [dataRes, filteredCountRes, totalCountRes] = await Promise.all([
      ingredient_repository_default2.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      // filtered count
      ingredient_repository_default2.count({ where }),
      // total count (without filter)
      ingredient_repository_default2.count()
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
        // 🔥 total records (all)
        filtered,
        // 🔥 after filter
        count: data.length,
        // 🔥 current page items
        totalPages,
        // 🔥 total pages possible
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    debugError(`[Ingrediente Service] getIngredientes failed: ${error.message}`);
    return {
      status: false,
      message: "Failed to fetch ingredientes",
      data: [],
      meta: null
    };
  }
};

// src/modules/master/ingredient/ingredient.controller.ts
var getIngredientes2 = async (req, res) => {
  debug("=== GET BRANCHES START ===");
  try {
    const { page = 1, limit = 10, name, category, status } = req.validatedQuery;
    const result = await getIngredientes({
      page: Number(page),
      limit: Number(limit),
      filters: {
        name,
        category,
        status
      }
    });
    return res.status(200).json({
      status: true,
      message: "Ingredientes fetched successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    debugError("\u274C Controller Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  } finally {
    debug("=== GET BRANCHES END ===");
  }
};

// src/modules/master/ingredient/ingredient.validation.ts
import { z as z9 } from "zod";
var getIngredienteQuerySchema = z9.object({
  page: z9.coerce.number().positive().default(1),
  limit: z9.coerce.number().positive().max(50).default(10),
  name: z9.string().optional().transform((val) => val ?? ""),
  category: z9.string().optional().transform((val) => val ?? ""),
  status: z9.nativeEnum(Status).optional()
});
var validateGetIngredientes = (req, res, next) => {
  const result = getIngredienteQuerySchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors
    });
  }
  req.validatedQuery = result.data;
  next();
};

// src/modules/master/ingredient/ingredient.route.ts
var router11 = Router11({
  mergeParams: true
});
router11.get(
  "/",
  validateGetIngredientes,
  getIngredientes2
);
var ingredient_route_default2 = router11;

// src/modules/master/master.route.ts
var router12 = Router12({
  mergeParams: true
});
router12.use("/cuisine", cuisine_route_default);
router12.use("/ingredient", ingredient_route_default2);
router12.get("/country", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const countries = await prisma.country.findMany({
      where: search ? {
        name: {
          contains: search
        }
      } : void 0,
      select: {
        id: true,
        name: true,
        iso2: true,
        iso3: true,
        phonecode: true
      },
      orderBy: {
        name: "asc"
      },
      take: Number(req.query.limit || 250)
    });
    return res.status(200).json({
      status: true,
      message: "Countries fetched successfully",
      data: string_helper_default.convertBigInt(countries, "number")
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Unable to fetch countries"
    });
  }
});
router12.get("/state", async (req, res) => {
  try {
    const countryId = req.query.countryId ? BigInt(String(req.query.countryId)) : void 0;
    const states = await prisma.state.findMany({
      where: countryId ? { countryId } : void 0,
      select: {
        id: true,
        name: true,
        countryId: true,
        iso2: true,
        type: true
      },
      orderBy: {
        name: "asc"
      },
      take: Number(req.query.limit || 500)
    });
    return res.status(200).json({
      status: true,
      message: "States fetched successfully",
      data: string_helper_default.convertBigInt(states, "number")
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Unable to fetch states"
    });
  }
});
router12.get("/city", async (req, res) => {
  try {
    const countryId = req.query.countryId ? BigInt(String(req.query.countryId)) : void 0;
    const stateId = req.query.stateId ? BigInt(String(req.query.stateId)) : void 0;
    const cities = await prisma.city.findMany({
      where: {
        ...countryId ? { countryId } : {},
        ...stateId ? { stateId } : {}
      },
      select: {
        id: true,
        name: true,
        stateId: true,
        countryId: true
      },
      orderBy: {
        name: "asc"
      },
      take: Number(req.query.limit || 500)
    });
    return res.status(200).json({
      status: true,
      message: "Cities fetched successfully",
      data: string_helper_default.convertBigInt(cities, "number")
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Unable to fetch cities"
    });
  }
});
var master_route_default = router12;

// src/routes/v1/index.ts
var router13 = Router13({
  mergeParams: true
});
router13.use("/system", system_default);
router13.use("/kitchen", kitchen_route_default);
router13.use("/master", master_route_default);
var v1_default = router13;

// src/index.ts
var SERVER_PORT = Number(process.env.PORT) || 3e3;
var ENV = process.env.NODE_ENV || "development";
var parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};
var requestedClusters = process.env.WEB_CONCURRENCY || process.env.CLUSTERS;
var NUM_CLUSTERS = parsePositiveInt(requestedClusters, 1);
var appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || "https://cloud-kitchen-node-x2ok.onrender.com";
var rawCors = process.env.CORS_ORIGIN || appUrl || "http://127.0.0.1:5173,http://localhost:5173";
var allowAllOrigins = rawCors.trim() === "*";
var normalizeOrigin = (value) => {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
};
var allowedOrigins = allowAllOrigins ? [] : rawCors.split(",").map((origin) => normalizeOrigin(origin)).filter((origin) => Boolean(origin));
var corsOptions = {
  origin(origin, callback) {
    debug_default.debug("CORS request origin:", origin);
    const requestOrigin = normalizeOrigin(origin);
    const isLocalDevOrigin = !!requestOrigin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin);
    if (!requestOrigin || allowAllOrigins || allowedOrigins.includes(requestOrigin) || isLocalDevOrigin) {
      callback(null, true);
      return;
    }
    debug_default.debug(`CORS blocked origin: ${requestOrigin}. Allowed origins: ${allowedOrigins.join(", ")}`);
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
};
if (ENV === "development" || NUM_CLUSTERS <= 1) {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/api/v1", v1_default);
  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
    debug_default.debug(`-----------------------------------------`);
    debug_default.debug(`\u{1F680} Server (DEV) running on http://localhost:${SERVER_PORT}/api/v1/system/hello`);
    debug_default.debug(`\u{1F3E5} Health Check: http://localhost:${SERVER_PORT}/api/v1/system/health`);
    const database = getDatabaseTarget();
    debug_default.debug(`DB Target   : ${database.database} (${database.host}:${database.port}) env=${DB_ENV}`);
    debug_default.debug(`-----------------------------------------`);
  });
} else if (cluster.isMaster) {
  let shutdown = function() {
    debug_default.debug("\u{1F6D1} Master shutting down all workers...");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill("SIGTERM");
    }
    process.exit(0);
  };
  shutdown2 = shutdown;
  debug_default.debug(`\u{1F6E0} Master PID: ${process.pid}`);
  debug_default.debug(`\u{1F680} Forking ${NUM_CLUSTERS} workers...`);
  for (let i = 0; i < NUM_CLUSTERS; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    debug_default.debug(`\u26A0 Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
    cluster.fork();
  });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} else {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/api/v1", v1_default);
  const server = app.listen(SERVER_PORT, () => {
    console.log(`Worker ${process.pid} running on port ${SERVER_PORT}`);
    debug_default.debug(`-----------------------------------------`);
    debug_default.debug(`\u{1F680} Worker PID: ${process.pid} listening on http://localhost:${SERVER_PORT}/api/v1/system/hello`);
    debug_default.debug(`\u{1F3E5} Health Check: http://localhost:${SERVER_PORT}/api/v1/system/health`);
    const database = getDatabaseTarget();
    debug_default.debug(`DB Target   : ${database.database} (${database.host}:${database.port}) env=${DB_ENV}`);
    debug_default.debug(`-----------------------------------------`);
  });
  process.on("SIGTERM", () => {
    debug_default.debug(`\u{1F6D1} Worker PID: ${process.pid} shutting down...`);
    server.close(() => process.exit(0));
  });
}
var shutdown2;

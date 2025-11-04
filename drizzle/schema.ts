import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de planos de assinatura
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priceMonthly: int("price_monthly").notNull(), // em centavos
  maxCampaigns: int("max_campaigns").notNull(),
  maxAdsPerCampaign: int("max_ads_per_campaign").notNull(),
  aiGenerationsPerMonth: int("ai_generations_per_month").notNull(),
  features: text("features"), // JSON string com features
  active: int("active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// Tabela de assinaturas dos usuários
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  planId: int("plan_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: int("cancel_at_period_end").default(0),
  aiGenerationsUsed: int("ai_generations_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// Tabela de contas Meta conectadas
export const metaAccounts = mysqlTable("meta_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  metaUserId: varchar("meta_user_id", { length: 255 }).notNull(),
  accessToken: text("access_token").notNull(), // Criptografado
  tokenExpiresAt: timestamp("token_expires_at"),
  adAccountId: varchar("ad_account_id", { length: 255 }).notNull(),
  adAccountName: varchar("ad_account_name", { length: 255 }),
  businessManagerId: varchar("business_manager_id", { length: 255 }),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MetaAccount = typeof metaAccounts.$inferSelect;
export type InsertMetaAccount = typeof metaAccounts.$inferInsert;

// Tabela de campanhas
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  metaAccountId: int("meta_account_id").notNull(),
  metaCampaignId: varchar("meta_campaign_id", { length: 255 }), // ID da campanha no Meta
  name: varchar("name", { length: 255 }).notNull(),
  objective: varchar("objective", { length: 100 }).notNull(), // LINK_CLICKS, CONVERSIONS, etc
  status: mysqlEnum("status", ["draft", "active", "paused", "deleted"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// Tabela de conjuntos de anúncios (Ad Sets)
export const adSets = mysqlTable("ad_sets", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaign_id").notNull(),
  metaAdSetId: varchar("meta_ad_set_id", { length: 255 }), // ID do ad set no Meta
  name: varchar("name", { length: 255 }).notNull(),
  dailyBudget: int("daily_budget"), // em centavos
  lifetimeBudget: int("lifetime_budget"), // em centavos
  targeting: text("targeting"), // JSON string com targeting
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: mysqlEnum("status", ["draft", "active", "paused", "deleted"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdSet = typeof adSets.$inferSelect;
export type InsertAdSet = typeof adSets.$inferInsert;

// Tabela de criativos
export const creatives = mysqlTable("creatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  metaCreativeId: varchar("meta_creative_id", { length: 255 }), // ID do creative no Meta
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  callToAction: varchar("call_to_action", { length: 100 }),
  linkUrl: varchar("link_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  generatedByAi: int("generated_by_ai").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Creative = typeof creatives.$inferSelect;
export type InsertCreative = typeof creatives.$inferInsert;

// Tabela de anúncios
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  adSetId: int("ad_set_id").notNull(),
  creativeId: int("creative_id").notNull(),
  metaAdId: varchar("meta_ad_id", { length: 255 }), // ID do ad no Meta
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "deleted"]).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;

// Tabela de métricas de anúncios (cache dos insights)
export const adMetrics = mysqlTable("ad_metrics", {
  id: int("id").autoincrement().primaryKey(),
  adId: int("ad_id").notNull(),
  date: timestamp("date").notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  spend: int("spend").default(0), // em centavos
  reach: int("reach").default(0),
  conversions: int("conversions").default(0),
  ctr: int("ctr").default(0), // CTR * 10000 para precisão
  cpc: int("cpc").default(0), // em centavos
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdMetric = typeof adMetrics.$inferSelect;
export type InsertAdMetric = typeof adMetrics.$inferInsert;
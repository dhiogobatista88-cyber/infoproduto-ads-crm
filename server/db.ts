import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  subscriptionPlans,
  userSubscriptions,
  metaAccounts,
  campaigns,
  adSets,
  creatives,
  ads,
  adMetrics,
  type SubscriptionPlan,
  type UserSubscription,
  type MetaAccount,
  type Campaign,
  type AdSet,
  type Creative,
  type Ad,
  type InsertMetaAccount,
  type InsertCampaign,
  type InsertAdSet,
  type InsertCreative,
  type InsertAd,
  type InsertUserSubscription,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Subscription Plans =====

export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, 1));
}

export async function getSubscriptionPlanById(planId: number): Promise<SubscriptionPlan | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).limit(1);
  return result[0];
}

// ===== User Subscriptions =====

export async function getUserSubscription(userId: number): Promise<UserSubscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1);
  return result[0];
}

export async function createUserSubscription(subscription: InsertUserSubscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userSubscriptions).values(subscription);
}

export async function updateUserSubscription(id: number, data: Partial<InsertUserSubscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userSubscriptions).set(data).where(eq(userSubscriptions.id, id));
}

export async function incrementAiGenerations(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const subscription = await getUserSubscription(userId);
  if (!subscription) throw new Error("No active subscription found");
  
  await db
    .update(userSubscriptions)
    .set({ aiGenerationsUsed: subscription.aiGenerationsUsed + 1 })
    .where(eq(userSubscriptions.id, subscription.id));
}

// ===== Meta Accounts =====

export async function getUserMetaAccounts(userId: number): Promise<MetaAccount[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(metaAccounts).where(and(eq(metaAccounts.userId, userId), eq(metaAccounts.active, 1)));
}

export async function getMetaAccountById(id: number): Promise<MetaAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(metaAccounts).where(eq(metaAccounts.id, id)).limit(1);
  return result[0];
}

export async function createMetaAccount(account: InsertMetaAccount): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(metaAccounts).values(account);
  return Number(result[0].insertId);
}

export async function updateMetaAccount(id: number, data: Partial<InsertMetaAccount>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(metaAccounts).set(data).where(eq(metaAccounts.id, id));
}

// ===== Campaigns =====

export async function getUserCampaigns(userId: number): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}

export async function createCampaign(campaign: InsertCampaign): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(campaign);
  return Number(result[0].insertId);
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

// ===== Ad Sets =====

export async function getCampaignAdSets(campaignId: number): Promise<AdSet[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adSets).where(eq(adSets.campaignId, campaignId));
}

export async function getAdSetById(id: number): Promise<AdSet | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adSets).where(eq(adSets.id, id)).limit(1);
  return result[0];
}

export async function createAdSet(adSet: InsertAdSet): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(adSets).values(adSet);
  return Number(result[0].insertId);
}

export async function updateAdSet(id: number, data: Partial<InsertAdSet>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adSets).set(data).where(eq(adSets.id, id));
}

// ===== Creatives =====

export async function getUserCreatives(userId: number): Promise<Creative[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(creatives)
    .where(eq(creatives.userId, userId))
    .orderBy(desc(creatives.createdAt));
}

export async function getCreativeById(id: number): Promise<Creative | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creatives).where(eq(creatives.id, id)).limit(1);
  return result[0];
}

export async function createCreative(creative: InsertCreative): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creatives).values(creative);
  return Number(result[0].insertId);
}

export async function updateCreative(id: number, data: Partial<InsertCreative>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(creatives).set(data).where(eq(creatives.id, id));
}

// ===== Ads =====

export async function getAdSetAds(adSetId: number): Promise<Ad[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ads).where(eq(ads.adSetId, adSetId));
}

export async function getAdById(id: number): Promise<Ad | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ads).where(eq(ads.id, id)).limit(1);
  return result[0];
}

export async function createAd(ad: InsertAd): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ads).values(ad);
  return Number(result[0].insertId);
}

export async function updateAd(id: number, data: Partial<InsertAd>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ads).set(data).where(eq(ads.id, id));
}

// ===== Get All User Ads with Details =====

export async function getUserAdsWithDetails(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      ad: ads,
      adSet: adSets,
      campaign: campaigns,
      creative: creatives,
    })
    .from(ads)
    .innerJoin(adSets, eq(ads.adSetId, adSets.id))
    .innerJoin(campaigns, eq(adSets.campaignId, campaigns.id))
    .innerJoin(creatives, eq(ads.creativeId, creatives.id))
    .where(eq(campaigns.userId, userId))
    .orderBy(desc(ads.createdAt));
  
  return result;
}

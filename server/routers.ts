import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { createMetaApiClient } from "./metaApi";
import * as aiContent from "./aiContent";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== Subscription Management =====
  subscription: router({
    // Get user's current subscription
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getUserSubscription(ctx.user.id);
      if (!subscription) return null;
      
      const plan = await db.getSubscriptionPlanById(subscription.planId);
      return {
        ...subscription,
        plan,
      };
    }),

    // Get all available plans
    getPlans: publicProcedure.query(async () => {
      return db.getAllSubscriptionPlans();
    }),

    // Check if user can use AI generation
    canUseAI: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getUserSubscription(ctx.user.id);
      if (!subscription) return { canUse: false, reason: 'no_subscription' };
      
      const plan = await db.getSubscriptionPlanById(subscription.planId);
      if (!plan) return { canUse: false, reason: 'invalid_plan' };
      
      if (subscription.status !== 'active') {
        return { canUse: false, reason: 'inactive_subscription' };
      }
      
      if (subscription.aiGenerationsUsed >= plan.aiGenerationsPerMonth) {
        return { 
          canUse: false, 
          reason: 'limit_reached',
          used: subscription.aiGenerationsUsed,
          limit: plan.aiGenerationsPerMonth,
        };
      }
      
      return { 
        canUse: true,
        used: subscription.aiGenerationsUsed,
        limit: plan.aiGenerationsPerMonth,
      };
    }),

    // Create Stripe checkout session
    createCheckout: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getSubscriptionPlanById(input.planId);
        if (!plan) throw new Error('Plan not found');
        
        const { createCheckoutSession } = await import('./stripe');
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        const session = await createCheckoutSession({
          planId: plan.id,
          planName: plan.name,
          priceMonthly: plan.priceMonthly,
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
          userName: ctx.user.name || '',
          origin,
        });
        
        return session;
      }),
  }),

  // ===== Meta Account Management =====
  metaAccount: router({
    // Get user's connected Meta accounts
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserMetaAccounts(ctx.user.id);
    }),

    // Connect a new Meta account
    connect: protectedProcedure
      .input(z.object({
        accessToken: z.string(),
        adAccountId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate token and get account info
        const metaClient = createMetaApiClient(input.accessToken);
        const accountInfo = await metaClient.getAdAccount(input.adAccountId);
        
        // Store in database
        const accountId = await db.createMetaAccount({
          userId: ctx.user.id,
          metaUserId: accountInfo.id,
          accessToken: input.accessToken, // TODO: Encrypt this
          adAccountId: input.adAccountId,
          adAccountName: accountInfo.name,
          active: 1,
        });
        
        return { success: true, accountId };
      }),

    // Disconnect a Meta account
    disconnect: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const account = await db.getMetaAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new Error('Account not found or unauthorized');
        }
        
        await db.updateMetaAccount(input.accountId, { active: 0 });
        return { success: true };
      }),
  }),

  // ===== AI Content Generation =====
  ai: router({
    // Generate ad title
    generateTitle: protectedProcedure
      .input(z.object({
        productName: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        targetAudience: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check AI usage limits
        const canUse = await db.getUserSubscription(ctx.user.id);
        if (!canUse) throw new Error('No active subscription');
        
        const title = await aiContent.generateAdTitle({
          name: input.productName,
          description: input.description,
          category: input.category,
          price: input.price,
          targetAudience: input.targetAudience,
        });
        
        await db.incrementAiGenerations(ctx.user.id);
        return { title };
      }),

    // Generate ad description
    generateDescription: protectedProcedure
      .input(z.object({
        productName: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        targetAudience: z.string().optional(),
        benefits: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const canUse = await db.getUserSubscription(ctx.user.id);
        if (!canUse) throw new Error('No active subscription');
        
        const description = await aiContent.generateAdDescription({
          name: input.productName,
          description: input.description,
          category: input.category,
          price: input.price,
          targetAudience: input.targetAudience,
          benefits: input.benefits,
        });
        
        await db.incrementAiGenerations(ctx.user.id);
        return { description };
      }),

    // Generate complete ad copy
    generateComplete: protectedProcedure
      .input(z.object({
        productName: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z.string().optional(),
        targetAudience: z.string().optional(),
        benefits: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const canUse = await db.getUserSubscription(ctx.user.id);
        if (!canUse) throw new Error('No active subscription');
        
        const adCopy = await aiContent.generateCompleteAdCopy({
          name: input.productName,
          description: input.description,
          category: input.category,
          price: input.price,
          targetAudience: input.targetAudience,
          benefits: input.benefits,
          keywords: input.keywords,
        });
        
        await db.incrementAiGenerations(ctx.user.id);
        return adCopy;
      }),
  }),

  // ===== Campaign Management =====
  campaign: router({
    // List user's campaigns
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCampaigns(ctx.user.id);
    }),

    // Get campaign details
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign || campaign.userId !== ctx.user.id) {
          throw new Error('Campaign not found or unauthorized');
        }
        return campaign;
      }),

    // Create new campaign
    create: protectedProcedure
      .input(z.object({
        metaAccountId: z.number(),
        name: z.string(),
        objective: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get Meta account
        const metaAccount = await db.getMetaAccountById(input.metaAccountId);
        if (!metaAccount || metaAccount.userId !== ctx.user.id) {
          throw new Error('Meta account not found or unauthorized');
        }
        
        // Create campaign in Meta
        const metaClient = createMetaApiClient(metaAccount.accessToken);
        const metaCampaign = await metaClient.createCampaign({
          adAccountId: metaAccount.adAccountId,
          name: input.name,
          objective: input.objective,
          status: 'PAUSED',
        });
        
        // Save to database
        const campaignId = await db.createCampaign({
          userId: ctx.user.id,
          metaAccountId: input.metaAccountId,
          metaCampaignId: metaCampaign.id,
          name: input.name,
          objective: input.objective,
          status: 'paused',
        });
        
        return { success: true, campaignId, metaCampaignId: metaCampaign.id };
      }),

    // Update campaign status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['active', 'paused', 'deleted']),
      }))
      .mutation(async ({ ctx, input }) => {
        const campaign = await db.getCampaignById(input.id);
        if (!campaign || campaign.userId !== ctx.user.id) {
          throw new Error('Campaign not found or unauthorized');
        }
        
        if (campaign.metaCampaignId) {
          const metaAccount = await db.getMetaAccountById(campaign.metaAccountId);
          if (metaAccount) {
            const metaClient = createMetaApiClient(metaAccount.accessToken);
            
            if (input.status === 'deleted') {
              await metaClient.deleteCampaign(campaign.metaCampaignId);
            } else {
              await metaClient.updateCampaign(campaign.metaCampaignId, {
                status: input.status.toUpperCase() as 'ACTIVE' | 'PAUSED',
              });
            }
          }
        }
        
        await db.updateCampaign(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  // ===== Ad Management =====
  ad: router({
    // List all user's ads with details
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAdsWithDetails(ctx.user.id);
    }),

    // Create complete ad (creative + ad set + ad)
    create: protectedProcedure
      .input(z.object({
        campaignId: z.number(),
        name: z.string(),
        title: z.string(),
        body: z.string(),
        callToAction: z.string(),
        linkUrl: z.string(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        dailyBudget: z.number().optional(),
        targeting: z.object({
          geoLocations: z.object({
            countries: z.array(z.string()),
          }),
          ageMin: z.number().optional(),
          ageMax: z.number().optional(),
          genders: z.array(z.number()).optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify campaign ownership
        const campaign = await db.getCampaignById(input.campaignId);
        if (!campaign || campaign.userId !== ctx.user.id) {
          throw new Error('Campaign not found or unauthorized');
        }
        
        const metaAccount = await db.getMetaAccountById(campaign.metaAccountId);
        if (!metaAccount) throw new Error('Meta account not found');
        
        const metaClient = createMetaApiClient(metaAccount.accessToken);
        
        // 1. Create Ad Set
        const metaAdSet = await metaClient.createAdSet({
          campaignId: campaign.metaCampaignId!,
          name: `${input.name} - Ad Set`,
          dailyBudget: input.dailyBudget,
          targeting: {
            geo_locations: input.targeting.geoLocations,
            age_min: input.targeting.ageMin,
            age_max: input.targeting.ageMax,
            genders: input.targeting.genders,
          },
        });
        
        const adSetId = await db.createAdSet({
          campaignId: input.campaignId,
          metaAdSetId: metaAdSet.id,
          name: `${input.name} - Ad Set`,
          dailyBudget: input.dailyBudget,
          targeting: JSON.stringify(input.targeting),
          status: 'paused',
        });
        
        // 2. Create Creative
        const creativeId = await db.createCreative({
          userId: ctx.user.id,
          name: `${input.name} - Creative`,
          title: input.title,
          body: input.body,
          callToAction: input.callToAction,
          linkUrl: input.linkUrl,
          imageUrl: input.imageUrl,
          videoUrl: input.videoUrl,
          generatedByAi: 0,
        });
        
        // 3. Create Ad in Meta (simplified - full implementation would need page_id and proper creative setup)
        // For now, we'll store it as draft
        const adId = await db.createAd({
          adSetId,
          creativeId,
          name: input.name,
          status: 'draft',
        });
        
        return { success: true, adId };
      }),

    // Update ad status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['active', 'paused', 'deleted']),
      }))
      .mutation(async ({ ctx, input }) => {
        const ad = await db.getAdById(input.id);
        if (!ad) throw new Error('Ad not found');
        
        const adSet = await db.getAdSetById(ad.adSetId);
        if (!adSet) throw new Error('Ad set not found');
        
        const campaign = await db.getCampaignById(adSet.campaignId);
        if (!campaign || campaign.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        
        if (ad.metaAdId) {
          const metaAccount = await db.getMetaAccountById(campaign.metaAccountId);
          if (metaAccount) {
            const metaClient = createMetaApiClient(metaAccount.accessToken);
            
            if (input.status === 'deleted') {
              await metaClient.deleteAd(ad.metaAdId);
            } else {
              await metaClient.updateAd(ad.metaAdId, {
                status: input.status.toUpperCase() as 'ACTIVE' | 'PAUSED',
              });
            }
          }
        }
        
        await db.updateAd(input.id, { status: input.status });
        return { success: true };
      }),

    // Get ad insights/metrics
    getInsights: protectedProcedure
      .input(z.object({
        id: z.number(),
        datePreset: z.enum(['today', 'yesterday', 'last_7d', 'last_30d', 'lifetime']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const ad = await db.getAdById(input.id);
        if (!ad || !ad.metaAdId) throw new Error('Ad not found');
        
        const adSet = await db.getAdSetById(ad.adSetId);
        if (!adSet) throw new Error('Ad set not found');
        
        const campaign = await db.getCampaignById(adSet.campaignId);
        if (!campaign || campaign.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        
        const metaAccount = await db.getMetaAccountById(campaign.metaAccountId);
        if (!metaAccount) throw new Error('Meta account not found');
        
        const metaClient = createMetaApiClient(metaAccount.accessToken);
        const insights = await metaClient.getAdInsights({
          adId: ad.metaAdId,
          datePreset: input.datePreset || 'lifetime',
        });
        
        return insights.data[0] || {};
      }),
  }),
});

export type AppRouter = typeof appRouter;

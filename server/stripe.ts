/**
 * Stripe Integration Module
 * Handles payment processing and subscription management
 */

import Stripe from 'stripe';
import { ENV } from './_core/env';

if (!ENV.stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(params: {
  planId: number;
  planName: string;
  priceMonthly: number; // in cents
  userId: number;
  userEmail: string;
  userName: string;
  origin: string;
}): Promise<{ url: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Plano ${params.planName}`,
            description: `Assinatura mensal do plano ${params.planName}`,
          },
          unit_amount: params.priceMonthly,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.userEmail,
      customer_name: params.userName,
      plan_id: params.planId.toString(),
    },
    success_url: `${params.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/subscription`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return { url: session.url };
}

/**
 * Handle successful checkout - create or update subscription
 */
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;
  
  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const subscriptionId = session.subscription as string;
  
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return {
    userId: parseInt(userId),
    planId: parseInt(planId),
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: subscription.customer as string,
    status: subscription.status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
  };
}

/**
 * Handle subscription updates (renewal, cancellation, etc.)
 */
export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  return {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
  };
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  
  return {
    cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
  };
}

/**
 * Mercado Pago Integration Module
 * Handles subscription payments and recurring billing using SDK v2
 */

import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { ENV } from './_core/env';

if (!ENV.mercadoPagoAccessToken) {
  console.warn('[MercadoPago] Access token not configured');
}

// Initialize MercadoPago client
const client = ENV.mercadoPagoAccessToken
  ? new MercadoPagoConfig({
      accessToken: ENV.mercadoPagoAccessToken,
      options: {
        timeout: 5000,
      },
    })
  : null;

// Initialize PreApproval API
const preApproval = client ? new PreApproval(client) : null;

export interface CreateSubscriptionParams {
  planId: number;
  planName: string;
  priceMonthly: number; // in BRL (not cents)
  userId: number;
  userEmail: string;
  userName: string;
  origin: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  checkoutUrl: string;
  status: string;
}

/**
 * Create a Mercado Pago subscription
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionResponse> {
  if (!preApproval) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const response = await preApproval.create({
      body: {
        reason: `Assinatura ${params.planName} - Ads Manager AI`,
        external_reference: `user_${params.userId}_plan_${params.planId}`,
        payer_email: params.userEmail,
        back_url: `${params.origin}/subscription/success`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: params.priceMonthly,
          currency_id: 'BRL',
          start_date: new Date().toISOString(),
        },
        status: 'pending',
      },
    });

    if (!response || !response.id) {
      throw new Error('Failed to create subscription');
    }

    return {
      subscriptionId: response.id,
      checkoutUrl: response.init_point || '',
      status: response.status || 'pending',
    };
  } catch (error: any) {
    console.error('[MercadoPago] Error creating subscription:', error);
    throw new Error(error.message || 'Failed to create subscription');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  if (!preApproval) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const response = await preApproval.get({ id: subscriptionId });

    if (!response) {
      throw new Error('Subscription not found');
    }

    return {
      id: response.id,
      status: response.status,
      payerId: response.payer_id,
      nextPaymentDate: response.next_payment_date,
      dateCreated: response.date_created,
      lastModified: response.last_modified,
      autoRecurring: response.auto_recurring,
    };
  } catch (error: any) {
    console.error('[MercadoPago] Error getting subscription:', error);
    throw new Error(error.message || 'Failed to get subscription');
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'authorized' | 'paused' | 'cancelled'
) {
  if (!preApproval) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const response = await preApproval.update({
      id: subscriptionId,
      body: {
        status,
      },
    });

    if (!response) {
      throw new Error('Failed to update subscription');
    }

    return {
      id: response.id,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[MercadoPago] Error updating subscription:', error);
    throw new Error(error.message || 'Failed to update subscription');
  }
}

/**
 * Cancel subscription (sets status to cancelled)
 */
export async function cancelSubscription(subscriptionId: string) {
  return updateSubscriptionStatus(subscriptionId, 'cancelled');
}

/**
 * Pause subscription
 */
export async function pauseSubscription(subscriptionId: string) {
  return updateSubscriptionStatus(subscriptionId, 'paused');
}

/**
 * Resume subscription (reactivate)
 */
export async function resumeSubscription(subscriptionId: string) {
  return updateSubscriptionStatus(subscriptionId, 'authorized');
}

/**
 * Handle webhook notification from Mercado Pago
 */
export async function handleWebhook(body: any) {
  const { type, data } = body;

  console.log('[MercadoPago] Webhook received:', { type, data });

  switch (type) {
    case 'subscription_authorized':
    case 'subscription_preapproval':
      // Subscription was authorized (first payment successful)
      return {
        event: 'subscription_authorized',
        subscriptionId: data.id,
        status: 'authorized',
      };

    case 'subscription_paused':
      // Subscription was paused
      return {
        event: 'subscription_paused',
        subscriptionId: data.id,
        status: 'paused',
      };

    case 'subscription_cancelled':
      // Subscription was cancelled
      return {
        event: 'subscription_cancelled',
        subscriptionId: data.id,
        status: 'cancelled',
      };

    case 'payment':
      // New payment was processed
      return {
        event: 'payment',
        paymentId: data.id,
        subscriptionId: data.preapproval_id,
      };

    default:
      console.log('[MercadoPago] Unhandled webhook type:', type);
      return null;
  }
}

/**
 * Search subscriptions by email
 */
export async function searchSubscriptions(email: string) {
  if (!preApproval) {
    throw new Error('MercadoPago not configured');
  }

  try {
    const response = await preApproval.search({
      options: {
        payer_email: email,
      },
    });

    if (!response || !response.results) {
      return [];
    }

    return response.results;
  } catch (error: any) {
    console.error('[MercadoPago] Error searching subscriptions:', error);
    return [];
  }
}

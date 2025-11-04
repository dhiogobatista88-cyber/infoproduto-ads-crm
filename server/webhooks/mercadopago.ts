/**
 * Mercado Pago Webhook Handler
 * Processes notifications from Mercado Pago about subscription events
 */

import { Request, Response } from 'express';
import { handleWebhook } from '../mercadopago';
import * as db from '../db';

/**
 * Handle Mercado Pago webhook notifications
 * POST /api/webhooks/mercadopago
 */
export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    console.log('[MercadoPago Webhook] Received:', req.body);

    const webhookData = await handleWebhook(req.body);

    if (!webhookData) {
      // Unhandled event type
      return res.status(200).json({ received: true });
    }

    // Process the webhook event
    switch (webhookData.event) {
      case 'subscription_authorized':
        await handleSubscriptionAuthorized(webhookData);
        break;

      case 'subscription_paused':
        await handleSubscriptionPaused(webhookData);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(webhookData);
        break;

      case 'payment':
        await handlePayment(webhookData);
        break;

      default:
        console.log('[MercadoPago Webhook] Unhandled event:', webhookData.event);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[MercadoPago Webhook] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Handle subscription authorized event
 */
async function handleSubscriptionAuthorized(data: any) {
  console.log('[MercadoPago] Subscription authorized:', data.subscriptionId);

  // TODO: Update user subscription status in database
  // Extract user_id and plan_id from external_reference
  // Format: "user_{userId}_plan_{planId}"
  
  // For now, just log the event
  // In production, you would:
  // 1. Parse external_reference to get userId and planId
  // 2. Create or update user_subscriptions record
  // 3. Set status to 'active'
  // 4. Set currentPeriodStart and currentPeriodEnd
}

/**
 * Handle subscription paused event
 */
async function handleSubscriptionPaused(data: any) {
  console.log('[MercadoPago] Subscription paused:', data.subscriptionId);

  // TODO: Update subscription status to 'paused' in database
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(data: any) {
  console.log('[MercadoPago] Subscription cancelled:', data.subscriptionId);

  // TODO: Update subscription status to 'cancelled' in database
}

/**
 * Handle payment event
 */
async function handlePayment(data: any) {
  console.log('[MercadoPago] Payment processed:', {
    paymentId: data.paymentId,
    subscriptionId: data.subscriptionId,
  });

  // TODO: Record payment in database
  // Update subscription currentPeriodEnd
  // Reset AI generations counter if new billing period
}

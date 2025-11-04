/**
 * Subscription Plans Definition
 * Define all subscription products and prices here
 */

export interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in cents
  stripePriceId?: string; // Will be created in Stripe
  maxCampaigns: number;
  maxAdsPerCampaign: number;
  aiGenerationsPerMonth: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionProduct[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para começar a anunciar',
    priceMonthly: 4900, // R$ 49,00
    maxCampaigns: 3,
    maxAdsPerCampaign: 10,
    aiGenerationsPerMonth: 50,
    features: [
      '3 campanhas simultâneas',
      'Até 10 anúncios por campanha',
      '50 gerações de IA por mês',
      'Métricas básicas',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Para quem quer escalar os resultados',
    priceMonthly: 9900, // R$ 99,00
    maxCampaigns: 10,
    maxAdsPerCampaign: 30,
    aiGenerationsPerMonth: 200,
    features: [
      '10 campanhas simultâneas',
      'Até 30 anúncios por campanha',
      '200 gerações de IA por mês',
      'Métricas avançadas',
      'Suporte prioritário',
      'Múltiplas contas Meta',
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    description: 'Solução completa para agências',
    priceMonthly: 19900, // R$ 199,00
    maxCampaigns: 999,
    maxAdsPerCampaign: 999,
    aiGenerationsPerMonth: 1000,
    features: [
      'Campanhas ilimitadas',
      'Anúncios ilimitados',
      '1000 gerações de IA por mês',
      'Métricas avançadas + BI',
      'Suporte 24/7',
      'Múltiplas contas Meta',
      'API de integração',
      'White label (opcional)',
    ],
  },
];

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): SubscriptionProduct | undefined {
  return SUBSCRIPTION_PLANS.find(p => p.id === planId);
}

/**
 * Get plan by price (in cents)
 */
export function getPlanByPrice(priceMonthly: number): SubscriptionProduct | undefined {
  return SUBSCRIPTION_PLANS.find(p => p.priceMonthly === priceMonthly);
}

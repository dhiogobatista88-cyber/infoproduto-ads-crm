import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const PLANS = [
  {
    name: 'Básico',
    description: 'Ideal para começar a anunciar',
    priceMonthly: 4900, // R$ 49,00
    maxCampaigns: 3,
    maxAdsPerCampaign: 10,
    aiGenerationsPerMonth: 50,
    features: JSON.stringify([
      '3 campanhas simultâneas',
      'Até 10 anúncios por campanha',
      '50 gerações de IA por mês',
      'Métricas básicas',
      'Suporte por email',
    ]),
    active: 1,
  },
  {
    name: 'Profissional',
    description: 'Para quem quer escalar os resultados',
    priceMonthly: 9900, // R$ 99,00
    maxCampaigns: 10,
    maxAdsPerCampaign: 30,
    aiGenerationsPerMonth: 200,
    features: JSON.stringify([
      '10 campanhas simultâneas',
      'Até 30 anúncios por campanha',
      '200 gerações de IA por mês',
      'Métricas avançadas',
      'Suporte prioritário',
      'Múltiplas contas Meta',
    ]),
    active: 1,
  },
  {
    name: 'Empresarial',
    description: 'Solução completa para agências',
    priceMonthly: 19900, // R$ 199,00
    maxCampaigns: 999,
    maxAdsPerCampaign: 999,
    aiGenerationsPerMonth: 1000,
    features: JSON.stringify([
      'Campanhas ilimitadas',
      'Anúncios ilimitados',
      '1000 gerações de IA por mês',
      'Métricas avançadas + BI',
      'Suporte 24/7',
      'Múltiplas contas Meta',
      'API de integração',
      'White label (opcional)',
    ]),
    active: 1,
  },
];

async function seedPlans() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('Seeding subscription plans...');

  for (const plan of PLANS) {
    try {
      await connection.execute(
        `INSERT INTO subscription_plans (name, description, price_monthly, max_campaigns, max_ads_per_campaign, ai_generations_per_month, features, active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [plan.name, plan.description, plan.priceMonthly, plan.maxCampaigns, plan.maxAdsPerCampaign, plan.aiGenerationsPerMonth, plan.features, plan.active]
      );
      console.log(`✓ Created plan: ${plan.name}`);
    } catch (error) {
      console.log(`Plan ${plan.name} may already exist, skipping...`);
    }
  }

  await connection.end();
  console.log('Done!');
  process.exit(0);
}

seedPlans().catch((error) => {
  console.error('Error seeding plans:', error);
  process.exit(1);
});

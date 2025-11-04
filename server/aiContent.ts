/**
 * AI Content Generation for Ads
 * Uses LLM to generate ad copy, titles, descriptions, and CTAs
 */

import { invokeLLM } from "./_core/llm";

export interface ProductInfo {
  name: string;
  description?: string;
  category?: string;
  price?: string;
  targetAudience?: string;
  benefits?: string[];
  keywords?: string[];
}

export interface AdCopyResult {
  title: string;
  body: string;
  callToAction: string;
}

/**
 * Generate ad title optimized for Facebook/Instagram
 */
export async function generateAdTitle(productInfo: ProductInfo): Promise<string> {
  const prompt = `Você é um especialista em tráfego pago e copywriting para Facebook e Instagram.

Produto: ${productInfo.name}
${productInfo.description ? `Descrição: ${productInfo.description}` : ''}
${productInfo.category ? `Categoria: ${productInfo.category}` : ''}
${productInfo.price ? `Preço: ${productInfo.price}` : ''}
${productInfo.targetAudience ? `Público-alvo: ${productInfo.targetAudience}` : ''}

Crie um título CURTO e IMPACTANTE para um anúncio do Facebook/Instagram (máximo 40 caracteres).
O título deve:
- Ser chamativo e despertar curiosidade
- Destacar o principal benefício
- Usar linguagem persuasiva
- Ser direto ao ponto

Responda APENAS com o título, sem explicações.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em tráfego pago e copywriting para anúncios de Facebook e Instagram. Crie conteúdo persuasivo, direto e otimizado para conversão.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content.trim() : '';
}

/**
 * Generate ad body/description
 */
export async function generateAdDescription(productInfo: ProductInfo): Promise<string> {
  const benefitsText = productInfo.benefits?.length 
    ? `\nBenefícios: ${productInfo.benefits.join(', ')}` 
    : '';
  
  const keywordsText = productInfo.keywords?.length 
    ? `\nPalavras-chave: ${productInfo.keywords.join(', ')}` 
    : '';

  const prompt = `Você é um especialista em tráfego pago e copywriting para Facebook e Instagram.

Produto: ${productInfo.name}
${productInfo.description ? `Descrição: ${productInfo.description}` : ''}
${productInfo.category ? `Categoria: ${productInfo.category}` : ''}
${productInfo.price ? `Preço: ${productInfo.price}` : ''}
${productInfo.targetAudience ? `Público-alvo: ${productInfo.targetAudience}` : ''}${benefitsText}${keywordsText}

Crie uma descrição persuasiva para o anúncio (máximo 125 caracteres).
A descrição deve:
- Destacar os principais benefícios
- Criar senso de urgência ou escassez (se apropriado)
- Usar linguagem emocional
- Incluir prova social se possível
- Ser clara e objetiva

Responda APENAS com a descrição, sem explicações.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em tráfego pago e copywriting para anúncios de Facebook e Instagram. Crie conteúdo persuasivo, direto e otimizado para conversão.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content.trim() : '';
}

/**
 * Generate call-to-action text
 */
export async function generateCallToAction(productInfo: ProductInfo): Promise<string> {
  const prompt = `Você é um especialista em tráfego pago e copywriting para Facebook e Instagram.

Produto: ${productInfo.name}
${productInfo.category ? `Categoria: ${productInfo.category}` : ''}
${productInfo.targetAudience ? `Público-alvo: ${productInfo.targetAudience}` : ''}

Sugira o melhor tipo de Call-to-Action (CTA) para este anúncio.
Escolha APENAS UMA das opções abaixo que seja mais adequada:

SHOP_NOW - Comprar Agora
LEARN_MORE - Saiba Mais
SIGN_UP - Cadastre-se
DOWNLOAD - Baixar
GET_QUOTE - Solicitar Orçamento
CONTACT_US - Entre em Contato
APPLY_NOW - Inscreva-se
BOOK_TRAVEL - Reservar Viagem
GET_OFFER - Obter Oferta
SUBSCRIBE - Assinar

Responda APENAS com o código do CTA (ex: SHOP_NOW), sem explicações.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em tráfego pago. Escolha o CTA mais adequado baseado no produto e objetivo.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content.trim() : '';
}

/**
 * Generate complete ad copy (title + body + CTA)
 */
export async function generateCompleteAdCopy(productInfo: ProductInfo): Promise<AdCopyResult> {
  const benefitsText = productInfo.benefits?.length 
    ? `\nBenefícios: ${productInfo.benefits.join(', ')}` 
    : '';
  
  const keywordsText = productInfo.keywords?.length 
    ? `\nPalavras-chave: ${productInfo.keywords.join(', ')}` 
    : '';

  const prompt = `Você é um especialista em tráfego pago e copywriting para Facebook e Instagram.

Produto: ${productInfo.name}
${productInfo.description ? `Descrição: ${productInfo.description}` : ''}
${productInfo.category ? `Categoria: ${productInfo.category}` : ''}
${productInfo.price ? `Preço: ${productInfo.price}` : ''}
${productInfo.targetAudience ? `Público-alvo: ${productInfo.targetAudience}` : ''}${benefitsText}${keywordsText}

Crie um anúncio completo com:
1. Título (máximo 40 caracteres) - chamativo e impactante
2. Descrição (máximo 125 caracteres) - persuasiva com benefícios
3. Call-to-Action - escolha o mais adequado entre: SHOP_NOW, LEARN_MORE, SIGN_UP, DOWNLOAD, GET_QUOTE, CONTACT_US, APPLY_NOW, BOOK_TRAVEL, GET_OFFER, SUBSCRIBE

Retorne no formato JSON:
{
  "title": "título aqui",
  "body": "descrição aqui",
  "callToAction": "CTA_CODE"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em tráfego pago e copywriting para anúncios de Facebook e Instagram. Retorne sempre em formato JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ad_copy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { 
              type: "string", 
              description: "Título do anúncio (máximo 40 caracteres)" 
            },
            body: { 
              type: "string", 
              description: "Descrição do anúncio (máximo 125 caracteres)" 
            },
            callToAction: { 
              type: "string", 
              description: "Código do Call-to-Action" 
            },
          },
          required: ["title", "body", "callToAction"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  return JSON.parse(contentStr) as AdCopyResult;
}

/**
 * Generate multiple ad variations for A/B testing
 */
export async function generateAdVariations(
  productInfo: ProductInfo,
  count: number = 3
): Promise<AdCopyResult[]> {
  const variations: AdCopyResult[] = [];

  for (let i = 0; i < count; i++) {
    const variation = await generateCompleteAdCopy(productInfo);
    variations.push(variation);
    
    // Small delay to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return variations;
}

/**
 * Optimize existing ad copy
 */
export async function optimizeAdCopy(
  currentTitle: string,
  currentBody: string,
  productInfo: ProductInfo
): Promise<AdCopyResult> {
  const prompt = `Você é um especialista em tráfego pago e copywriting para Facebook e Instagram.

Produto: ${productInfo.name}

COPY ATUAL:
Título: ${currentTitle}
Descrição: ${currentBody}

Analise e OTIMIZE este anúncio para melhorar a taxa de conversão.
Considere:
- Clareza da mensagem
- Apelo emocional
- Senso de urgência
- Benefícios vs características
- Linguagem persuasiva

Retorne no formato JSON:
{
  "title": "título otimizado",
  "body": "descrição otimizada",
  "callToAction": "CTA_CODE",
  "improvements": "breve explicação das melhorias"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em otimização de anúncios para Facebook e Instagram. Retorne sempre em formato JSON válido.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  const result = JSON.parse(contentStr);
  
  return {
    title: result.title,
    body: result.body,
    callToAction: result.callToAction,
  };
}

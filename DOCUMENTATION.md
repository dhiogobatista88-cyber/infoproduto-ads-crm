# 📚 Documentação - Ads Manager AI

Sistema completo de gestão de anúncios para Facebook e Instagram com IA integrada e pagamentos via **Mercado Pago**.

---

## 🎯 Visão Geral

O **Ads Manager AI** é uma plataforma SaaS que permite a pessoas comuns criar, gerenciar e otimizar anúncios pagos no Facebook e Instagram sem conhecimento técnico. O sistema utiliza Inteligência Artificial para gerar automaticamente títulos, descrições e textos persuasivos para os anúncios.

### Principais Funcionalidades

- ✅ **Integração direta com Meta Business Manager** (Facebook/Instagram Ads)
- ✅ **IA treinada em tráfego pago** para gerar conteúdo otimizado
- ✅ **Preview em tempo real** dos anúncios antes de publicar
- ✅ **Gerenciamento completo**: criar, pausar, ativar e deletar anúncios
- ✅ **Sistema de assinaturas** via **Mercado Pago** (PIX, boleto, cartão)
- ✅ **3 planos disponíveis**: Básico, Profissional e Empresarial
- ✅ **Dashboard intuitivo** com métricas e performance

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- tRPC para comunicação type-safe
- Wouter para roteamento

**Backend:**
- Node.js + Express
- tRPC 11 para API
- MySQL/TiDB (via Drizzle ORM)
- Autenticação OAuth (Manus Auth)

**Integrações:**
- **Meta Marketing API** - Gerenciamento de anúncios
- **Mercado Pago API** - Pagamentos e assinaturas recorrentes
- **OpenAI API** - Geração de conteúdo com IA
- **S3** - Armazenamento de imagens/vídeos

### Estrutura do Banco de Dados

O sistema utiliza 9 tabelas principais:

1. **users** - Usuários do sistema
2. **subscriptionPlans** - Planos de assinatura (Básico, Profissional, Empresarial)
3. **userSubscriptions** - Assinaturas ativas dos usuários
4. **metaAccounts** - Contas do Meta Business Manager conectadas
5. **campaigns** - Campanhas de anúncios
6. **adSets** - Conjuntos de anúncios (targeting e orçamento)
7. **ads** - Anúncios individuais
8. **creatives** - Criativos (imagens, vídeos, textos)
9. **adMetrics** - Métricas e performance dos anúncios

---

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

O sistema requer as seguintes variáveis de ambiente:

#### Variáveis do Sistema (já configuradas automaticamente)
```bash
DATABASE_URL=<mysql_connection_string>
JWT_SECRET=<session_secret>
VITE_APP_ID=<manus_app_id>
OAUTH_SERVER_URL=<manus_oauth_url>
VITE_OAUTH_PORTAL_URL=<manus_portal_url>
OWNER_OPEN_ID=<owner_id>
OWNER_NAME=<owner_name>
VITE_APP_TITLE="Ads Manager AI"
VITE_APP_LOGO=<logo_url>
```

#### Variáveis que você precisa configurar

**Mercado Pago** (obrigatório para pagamentos):
```bash
MERCADOPAGO_ACCESS_TOKEN=<seu_access_token>
```

**Meta Marketing API** (obrigatório para anúncios):
```bash
META_APP_ID=<seu_app_id>
META_APP_SECRET=<seu_app_secret>
META_ACCESS_TOKEN=<seu_access_token>
```

### 2. Como Obter Credenciais do Mercado Pago

#### Passo 1: Criar Conta no Mercado Pago
1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Vá para "Suas Integrações" no menu lateral

#### Passo 2: Criar Aplicação
1. Clique em "Criar aplicação"
2. Escolha um nome (ex: "Ads Manager AI")
3. Selecione o produto: **Assinaturas**
4. Clique em "Criar aplicação"

#### Passo 3: Obter Access Token
1. Na página da aplicação, vá para a aba **"Credenciais"**
2. Você verá duas opções:
   - **Credenciais de teste** (para desenvolvimento)
   - **Credenciais de produção** (para uso real)
3. Copie o **Access Token** (começa com `APP_USR-...`)

#### Passo 4: Configurar Webhook
1. Na mesma página de credenciais, role até "Webhooks"
2. Clique em "Configurar notificações"
3. Adicione a URL do webhook:
   ```
   https://seu-dominio.manus.space/api/webhooks/mercadopago
   ```
4. Selecione os eventos:
   - ✅ Pagamentos
   - ✅ Assinaturas
5. Salve as configurações

#### Passo 5: Adicionar ao Sistema
1. No painel do Manus, vá para **Settings → Secrets**
2. Adicione uma nova secret:
   - **Key**: `MERCADOPAGO_ACCESS_TOKEN`
   - **Value**: Cole o Access Token copiado
3. Salve e reinicie o servidor

### 3. Como Obter Credenciais da Meta (Facebook/Instagram)

#### Passo 1: Criar App no Meta for Developers
1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Faça login com sua conta do Facebook
3. Clique em "Meus Apps" → "Criar App"
4. Escolha o tipo: **Negócios**
5. Preencha:
   - Nome do app: "Ads Manager AI"
   - Email de contato
   - Conta comercial do Business Manager (se tiver)
6. Clique em "Criar App"

#### Passo 2: Adicionar Produto Marketing API
1. No dashboard do app, procure por **"Marketing API"**
2. Clique em "Configurar"
3. Siga o assistente de configuração

#### Passo 3: Obter Credenciais
1. No menu lateral, vá para **"Configurações" → "Básico"**
2. Copie:
   - **ID do App** (META_APP_ID)
   - **Chave Secreta do App** (META_APP_SECRET)

#### Passo 4: Gerar Access Token
1. Vá para **"Ferramentas" → "Explorador da Graph API"**
2. Selecione seu app no dropdown
3. Clique em "Gerar Token de Acesso"
4. Selecione as permissões necessárias:
   - ✅ `ads_management`
   - ✅ `ads_read`
   - ✅ `business_management`
5. Copie o token gerado (META_ACCESS_TOKEN)

**⚠️ IMPORTANTE**: O token gerado expira em 1-2 horas. Para produção, você precisa:
1. Gerar um **Token de Longa Duração** (60 dias)
2. Ou implementar **OAuth** para que cada usuário conecte sua própria conta

#### Passo 5: Adicionar ao Sistema
1. No painel do Manus, vá para **Settings → Secrets**
2. Adicione as secrets:
   - **Key**: `META_APP_ID` | **Value**: ID do App
   - **Key**: `META_APP_SECRET` | **Value**: Chave Secreta
   - **Key**: `META_ACCESS_TOKEN` | **Value**: Access Token
3. Salve e reinicie o servidor

---

## 💰 Sistema de Assinaturas com Mercado Pago

### Planos Disponíveis

| Plano | Preço/Mês | Anúncios | IA Gerações | Campanhas |
|-------|-----------|----------|-------------|-----------|
| **Básico** | R$ 49,00 | 10 | 50 | 3 |
| **Profissional** | R$ 99,00 | 50 | 200 | 10 |
| **Empresarial** | R$ 199,00 | Ilimitado | Ilimitado | Ilimitado |

### Fluxo de Pagamento

1. **Usuário escolhe um plano** na página `/subscription`
2. **Sistema cria assinatura** no Mercado Pago via API
3. **Usuário é redirecionado** para checkout do Mercado Pago
4. **Usuário completa pagamento** (PIX, boleto ou cartão)
5. **Mercado Pago envia webhook** confirmando pagamento
6. **Sistema ativa assinatura** automaticamente
7. **Usuário é redirecionado** para `/subscription/success`

### Métodos de Pagamento Aceitos

- 💳 **Cartão de Crédito** (Visa, Mastercard, Elo, Hipercard, etc)
- 💵 **PIX** (pagamento instantâneo - aprovação imediata)
- 📄 **Boleto Bancário** (vencimento em 3 dias úteis)

### Vantagens do Mercado Pago

- ✅ **Sem conta obrigatória**: Cliente pode pagar sem ter conta no Mercado Pago
- ✅ **PIX integrado**: Método de pagamento mais popular do Brasil
- ✅ **Boleto bancário**: Para quem não tem cartão
- ✅ **Aprovação instantânea**: PIX e cartão aprovam na hora
- ✅ **Tentativas automáticas**: Se o pagamento falhar, tenta novamente
- ✅ **Taxas competitivas**: ~4.99% + R$0.39 por transação

### Renovação Automática

- As assinaturas são renovadas **automaticamente todo mês**
- O Mercado Pago tenta cobrar na data de vencimento
- Se falhar, tenta novamente nos próximos 3 dias
- Usuário pode cancelar a qualquer momento sem multa

---

## 🤖 Sistema de IA para Geração de Conteúdo

### Como Funciona

O sistema utiliza a API da OpenAI (GPT-4) para gerar conteúdo otimizado para anúncios. A IA foi "treinada" (via prompts) com conhecimento de:

- Copywriting persuasivo
- Gatilhos mentais
- Técnicas de vendas
- Boas práticas de tráfego pago
- Formatos de anúncios do Meta

### Tipos de Conteúdo Gerado

1. **Título do Anúncio** (até 40 caracteres)
   - Chamativo e direto
   - Inclui benefício principal
   - Usa gatilhos mentais

2. **Descrição Principal** (até 125 caracteres)
   - Detalha a oferta
   - Destaca diferenciais
   - Inclui call-to-action

3. **Texto do Anúncio** (até 125 caracteres para feed)
   - Contexto completo
   - História ou problema/solução
   - Urgência ou escassez

4. **Call-to-Action** (botão)
   - Sugestões: "Saiba Mais", "Comprar Agora", "Inscreva-se"
   - Baseado no objetivo da campanha

### Processo de Geração

```
Usuário preenche informações do produto
         ↓
Sistema envia para IA com prompt otimizado
         ↓
IA gera 3 variações de cada elemento
         ↓
Usuário escolhe ou edita manualmente
         ↓
Preview em tempo real do anúncio
         ↓
Publicação direta no Meta
```

### Limites por Plano

- **Básico**: 50 gerações/mês
- **Profissional**: 200 gerações/mês
- **Empresarial**: Ilimitado

---

## 📱 Integração com Meta Business Manager

### Pré-requisitos

1. Ter uma **Conta do Facebook Business Manager**
2. Ter uma **Conta de Anúncios** criada
3. Ter **método de pagamento** configurado no Meta
4. Ter uma **Página do Facebook** vinculada

### Como Conectar

1. No dashboard, clique em **"Conectar Conta Meta"**
2. Faça login com sua conta do Facebook
3. Autorize o app a acessar sua conta de anúncios
4. Selecione a conta de anúncios que deseja usar
5. Pronto! Agora você pode criar anúncios

### Estrutura de Anúncios

O Meta organiza anúncios em 3 níveis:

```
Campanha (Campaign)
  └── Conjunto de Anúncios (Ad Set)
      └── Anúncio (Ad)
          └── Criativo (Creative)
```

---

## 🎨 Criação de Anúncios

### Fluxo Completo

#### 1. Informações do Produto
- Nome do produto
- Descrição breve
- Preço (opcional)
- URL de destino
- Categoria

#### 2. Geração com IA
Clique em "Gerar com IA" para:
- Título otimizado
- Descrição persuasiva
- Texto completo do anúncio
- Sugestões de CTA

#### 3. Upload de Mídia
Formatos aceitos:
- Imagens: JPG, PNG (até 5MB)
- Vídeos: MP4, MOV (até 50MB)

#### 4. Configuração da Campanha
- Objetivo (tráfego, conversões, etc)
- Público-alvo (localização, idade, interesses)
- Orçamento diário (mínimo R$ 20,00)
- Duração da campanha

#### 5. Preview
Visualize como ficará no feed do Facebook e Instagram

#### 6. Publicação
Clique em "Publicar Anúncio" e pronto!

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. "Erro ao criar assinatura no Mercado Pago"

**Possíveis causas:**
- Access Token não configurado
- Access Token expirado
- Email do usuário inválido

**Solução:**
1. Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado
2. Gere um novo token no painel do Mercado Pago
3. Certifique-se de que o email do usuário é válido

#### 2. "Webhook não está funcionando"

**Possíveis causas:**
- URL do webhook não configurada
- URL incorreta
- Firewall bloqueando

**Solução:**
1. Acesse o painel do Mercado Pago
2. Vá em Webhooks e configure a URL correta
3. Teste o webhook manualmente
4. Verifique os logs do servidor

#### 3. "Anúncio rejeitado pelo Meta"

**Possíveis causas:**
- Imagem com muito texto (>20%)
- Conteúdo proibido
- URL quebrada

**Solução:**
1. Leia o motivo da rejeição no Meta Ads Manager
2. Corrija o problema
3. Crie um novo anúncio

---

## 📞 Suporte

### Como Obter Ajuda

1. **Documentação** - Leia este documento primeiro
2. **FAQ** - Perguntas frequentes no sistema
3. **Email** - suporte@adsmanagerai.com

---

## 📝 Changelog

### Versão 2.0.0 (Atual - 04/11/2025)
- ✅ **Migração de Stripe para Mercado Pago**
- ✅ Suporte a PIX e boleto bancário
- ✅ Checkout hospedado do Mercado Pago
- ✅ Webhook handler para notificações
- ✅ Página de sucesso de assinatura
- ✅ Melhorias na geração de IA
- ✅ Dashboard redesenhado

### Versão 1.0.0 (Lançamento)
- ✅ Integração com Meta Marketing API
- ✅ Sistema de assinaturas com Stripe
- ✅ Geração de conteúdo com IA
- ✅ Gerenciamento de anúncios
- ✅ Dashboard de métricas

---

## 📄 Licença

© 2025 Ads Manager AI. Todos os direitos reservados.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando:
- React + TypeScript
- Tailwind CSS + shadcn/ui
- tRPC
- **Mercado Pago API**
- Meta Marketing API
- OpenAI API

---

**Última atualização:** 04/11/2025

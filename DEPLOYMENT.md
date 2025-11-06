# 🚀 Guia de Deploy - Ads Manager AI

Este guia explica como fazer deploy do Ads Manager AI no Render.

## Pré-requisitos

- Conta no [Render.com](https://render.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Credenciais do Mercado Pago configuradas
- Credenciais da Meta API (opcional, pode configurar depois)

## Passo 1: Preparar o Repositório

1. Faça push do código para seu repositório Git
2. Certifique-se de que os seguintes arquivos estão no root do projeto:
   - `render.yaml` ✅ (já incluído)
   - `.nvmrc` ✅ (já incluído)
   - `package.json` ✅
   - `pnpm-lock.yaml` ✅

## Passo 2: Criar Serviço no Render

### Opção A: Deploy via render.yaml (Recomendado)

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" → "Blueprint"
3. Selecione seu repositório Git
4. Clique em "Connect"
5. Render lerá automaticamente `render.yaml` e criará:
   - Web Service (Node.js)
   - Database (MySQL)
6. Clique em "Create Resources"

### Opção B: Deploy Manual

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" → "Web Service"
3. Selecione seu repositório Git
4. Preencha os dados:
   - **Name**: `ads-manager-ai`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
5. Clique em "Create Web Service"

## Passo 3: Configurar Variáveis de Ambiente

No painel do Render, vá para **Environment** e adicione:

### Variáveis Obrigatórias

```
DATABASE_URL=<será preenchida automaticamente se usar Blueprint>
JWT_SECRET=<será gerada automaticamente>
NODE_ENV=production
```

### Variáveis do Manus (já configuradas)

```
VITE_APP_ID=<seu app id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=<seu owner id>
OWNER_NAME=<seu nome>
VITE_APP_TITLE=Ads Manager AI
VITE_APP_LOGO=<url da logo>
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=<sua chave>
VITE_FRONTEND_FORGE_API_KEY=<sua chave frontend>
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### Variáveis do Mercado Pago (IMPORTANTE!)

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx...
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx...
```

### Variáveis da Meta (Opcional - configure depois)

```
META_APP_ID=<seu app id>
META_APP_SECRET=<seu app secret>
META_ACCESS_TOKEN=<seu access token>
```

## Passo 4: Configurar Banco de Dados

Se usar o Blueprint, o banco será criado automaticamente. Caso contrário:

1. No Render Dashboard, clique em "New" → "MySQL"
2. Preencha:
   - **Name**: `ads-manager-ai-db`
   - **Database Name**: `ads_manager_ai`
   - **User**: `ads_manager_user`
3. Clique em "Create Database"
4. Copie a `DATABASE_URL` gerada
5. Adicione como variável de ambiente no Web Service

## Passo 5: Executar Migrações do Banco

Após o primeiro deploy bem-sucedido:

1. Acesse o painel do Render
2. Vá para seu Web Service
3. Clique em "Shell" (canto superior direito)
4. Execute:
   ```bash
   pnpm db:push
   ```
5. Aguarde a conclusão

## Passo 6: Configurar Webhook do Mercado Pago

1. Acesse [Painel do Mercado Pago](https://www.mercadopago.com.br/developers)
2. Vá para sua aplicação → **Webhooks**
3. Adicione a URL:
   ```
   https://seu-dominio-render.onrender.com/api/mercadopago/webhook
   ```
4. Selecione os eventos:
   - ✅ Pagamentos
   - ✅ Assinaturas
5. Salve

## Passo 7: Testar o Deploy

1. Acesse `https://seu-dominio-render.onrender.com`
2. Você deve ver a tela de login do Manus
3. Faça login com sua conta
4. Você deve ver o dashboard do Ads Manager AI

## Troubleshooting

### Build falha com erro

**Solução:**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique se a versão do Node.js é 22.13.0 ou superior
3. Limpe o cache: `pnpm store prune`
4. Tente fazer deploy novamente

### Banco de dados não conecta

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Aguarde 2-3 minutos após criar o banco
3. Verifique se o banco está em "Available" status
4. Tente reconectar

### Webhook não funciona

**Solução:**
1. Verifique se a URL está correta (sem barra no final)
2. Verifique se `MERCADOPAGO_ACCESS_TOKEN` está configurado
3. Teste manualmente no painel do Mercado Pago
4. Verifique os logs do Render

### Página de login carrega infinitamente

**Solução:**
1. Verifique se `VITE_APP_ID` e `OAUTH_SERVER_URL` estão corretos
2. Verifique se o backend está respondendo: `curl https://seu-dominio/api/trpc/auth.me`
3. Verifique os logs do Render para erros de conexão

## Monitoramento

Após o deploy:

1. Acesse o Render Dashboard
2. Clique no seu Web Service
3. Vá para "Logs" para monitorar erros
4. Vá para "Metrics" para ver performance

## Atualizações Futuras

Para fazer deploy de novas versões:

1. Faça push das mudanças para seu repositório
2. Render detectará automaticamente e fará rebuild
3. O serviço será reiniciado com a nova versão

---

**Precisa de ajuda?** Consulte a [documentação do Render](https://render.com/docs)

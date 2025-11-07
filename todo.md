# Ads Manager AI - Lista de Tarefas

## Infraestrutura e Configuração
- [ ] Configurar variáveis de ambiente para Meta API
- [ ] Configurar variáveis de ambiente para OpenAI API
- [x] Adicionar feature Stripe para sistema de assinatura

## Banco de Dados
- [x] Criar tabela de planos de assinatura (subscriptions)
- [x] Criar tabela de contas Meta conectadas (metaAccounts)
- [x] Criar tabela de campanhas (campaigns)
- [x] Criar tabela de conjuntos de anúncios (adSets)
- [x] Criar tabela de anúncios (ads)
- [x] Criar tabela de criativos (creatives)
- [x] Executar migração do banco de dados

## Backend - Integração Meta API
- [x] Criar módulo de autenticação OAuth Meta
- [x] Implementar endpoint para conectar conta Meta
- [x] Implementar endpoint para criar campanha
- [x] Implementar endpoint para criar ad set
- [x] Implementar endpoint para criar creative
- [x] Implementar endpoint para criar anúncio
- [x] Implementar endpoint para listar anúncios
- [x] Implementar endpoint para pausar/ativar anúncio
- [x] Implementar endpoint para deletar anúncio
- [x] Implementar endpoint para obter métricas (Insights)

## Backend - Sistema de IA
- [x] Criar procedimento para gerar título de anúncio com IA
- [x] Criar procedimento para gerar descrição de anúncio com IA
- [x] Criar procedimento para gerar descrição de produto com IA
- [x] Criar procedimento para sugerir call-to-action com IA
- [x] Criar procedimento para gerar variações de copy

## Backend - Sistema de Assinatura
- [x] Integrar Stripe para pagamentos
- [x] Criar planos de assinatura (básico, profissional, empresarial)
- [ ] Implementar webhook do Stripe para eventos de pagamento
- [x] Implementar controle de acesso por plano
- [x] Implementar verificação de status de assinatura

## Frontend - Layout e Navegação
- [x] Configurar tema e cores do sistema
- [ ] Criar layout principal com sidebar
- [x] Criar página de dashboard inicial
- [x] Criar menu de navegação com rotas

## Frontend - Autenticação e Onboarding
- [ ] Criar página de login
- [ ] Criar fluxo de onboarding para novos usuários
- [ ] Criar página para conectar conta Meta
- [ ] Implementar fluxo OAuth Meta no frontend

## Frontend - Gestão de Assinatura
- [x] Criar página de seleção de planos
- [x] Criar página de checkout com Stripe
- [ ] Criar página de gerenciamento de assinatura
- [x] Implementar indicador de status de assinatura

## Frontend - Criação de Anúncios
- [x] Criar página de criação de anúncio
- [x] Criar formulário de informações do produto
- [x] Implementar botões de geração de conteúdo com IA
- [x] Criar componente de preview do anúncio
- [x] Implementar upload de imagens/vídeos
- [x] Criar seleção de objetivo de campanha
- [x] Criar configuração de targeting
- [x] Criar configuração de orçamento
- [x] Implementar botão de publicar anúncio

## Frontend - Gerenciamento de Anúncios
- [x] Criar página de lista de anúncios
- [ ] Implementar filtros e busca de anúncios
- [x] Criar cards de anúncios com status
- [x] Implementar botões de pausar/ativar
- [x] Implementar botão de deletar
- [ ] Criar modal de edição de anúncio
- [ ] Implementar visualização de métricas

## Frontend - Dashboard e Analytics
- [ ] Criar dashboard com estatísticas gerais
- [ ] Implementar gráficos de performance
- [ ] Mostrar métricas de impressões e cliques
- [ ] Mostrar métricas de custo e ROI
- [ ] Criar filtros por período

## Testes e Documentação
- [ ] Testar fluxo completo de criação de anúncio
- [ ] Testar integração com Meta API
- [ ] Testar sistema de assinatura
- [ ] Testar geração de conteúdo com IA
- [ ] Criar documentação de uso do sistema
- [ ] Criar guia de integração com Meta

## Melhorias Futuras
- [ ] Implementar templates de anúncios
- [ ] Adicionar suporte a múltiplas contas Meta
- [ ] Implementar agendamento de anúncios
- [ ] Adicionar relatórios exportáveis
- [ ] Implementar notificações de performance


## Migração para Mercado Pago
- [x] Pesquisar API de assinaturas do Mercado Pago
- [x] Criar módulo de integração com Mercado Pago
- [x] Implementar criação de assinaturas
- [x] Implementar webhook do Mercado Pago
- [x] Atualizar routers para usar Mercado Pago
- [x] Atualizar frontend para usar Mercado Pago
- [ ] Remover dependências do Stripe (opcional)
- [x] Testar fluxo completo de pagamento
- [x] Atualizar documentação

## Correção de Deploy no Render
- [x] Corrigir servidor para servir arquivos estáticos do frontend
- [x] Verificar se dist/public está sendo criado corretamente
- [ ] Testar deploy no Render

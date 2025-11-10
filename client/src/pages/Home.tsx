import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  Sparkles, 
  Target, 
  TrendingUp,
  Plus,
  Facebook,
  Instagram
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: subscription } = trpc.subscription.getCurrent.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: ads } = trpc.ad.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Crie Anúncios Profissionais com{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Gerencie seus anúncios do Facebook e Instagram em um só lugar. 
              Nossa IA especializada em tráfego pago cria títulos, descrições e 
              call-to-actions otimizados para conversão.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <a href="/register">
                  Começar Agora
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <a href="#features">
                  Saiba Mais
                </a>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span>Facebook Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-600" />
                <span>Instagram Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>IA Integrada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Tudo que você precisa para anunciar
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Geração com IA</CardTitle>
                  <CardDescription>
                    IA treinada em tráfego pago gera títulos, descrições e CTAs 
                    otimizados para máxima conversão.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Gestão Completa</CardTitle>
                  <CardDescription>
                    Crie, edite, pause e delete anúncios diretamente no sistema. 
                    Integração total com Meta Business Manager.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Métricas em Tempo Real</CardTitle>
                  <CardDescription>
                    Acompanhe impressões, cliques, conversões e ROI de todos 
                    os seus anúncios em um dashboard intuitivo.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Crie sua conta gratuitamente e comece a anunciar hoje mesmo.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <a href="/register">
                Criar Conta Grátis
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para usuários autenticados
  const activeAds = ads?.filter(a => a.ad.status === 'active').length || 0;
  const totalAds = ads?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus anúncios e acompanhe o desempenho das suas campanhas.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anúncios Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeAds}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalAds} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.plan?.name || 'Nenhum'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {subscription ? 'Ativo' : 'Assine um plano'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                IA Disponível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription?.plan ? 
                  `${subscription.plan.aiGenerationsPerMonth - subscription.aiGenerationsUsed}` : 
                  '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                gerações restantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold">--</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Em breve
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <Link href="/ads/create">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Criar Novo Anúncio</CardTitle>
                    <CardDescription>
                      Use IA para gerar conteúdo otimizado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <Link href="/ads">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Ver Todos os Anúncios</CardTitle>
                    <CardDescription>
                      Gerencie e acompanhe suas campanhas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Subscription Alert */}
        {!subscription && (
          <Card className="mt-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Assine um plano para começar
              </CardTitle>
              <CardDescription>
                Escolha um plano e comece a criar anúncios profissionais com IA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/subscription">Ver Planos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

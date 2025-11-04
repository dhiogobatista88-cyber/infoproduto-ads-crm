import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Subscription() {
  const { data: plans, isLoading } = trpc.subscription.getPlans.useQuery();
  const { data: currentSubscription } = trpc.subscription.getCurrent.useQuery();
  
  const createCheckoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      toast.info('Redirecionando para o Mercado Pago...');
      // Redirect to Mercado Pago checkout in the same tab
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleSubscribe = (planId: number) => {
    createCheckoutMutation.mutate({ planId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Escolha seu plano
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Planos e Preços
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio e comece a criar anúncios profissionais com IA
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="max-w-2xl mx-auto mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Assinatura Atual
              </CardTitle>
              <CardDescription>
                Você está no plano <strong>{currentSubscription.plan?.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                    {currentSubscription.status === 'active' ? 'Ativo' : currentSubscription.status}
                  </Badge>
                </div>
                {currentSubscription.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-muted-foreground">Renovação</p>
                    <p className="font-medium">
                      {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan, index) => {
            const features = plan.features ? JSON.parse(plan.features) : [];
            const isPopular = index === 1;
            const isCurrent = currentSubscription?.planId === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPopular ? 'border-2 border-primary shadow-xl scale-105' : ''} ${isCurrent ? 'border-2 border-green-500' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold">
                        R$ {(plan.priceMonthly / 100).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <ul className="space-y-3">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || createCheckoutMutation.isPending}
                    className="w-full"
                    size="lg"
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {createCheckoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : isCurrent ? (
                      'Plano Atual'
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Todos os planos incluem 7 dias de garantia. Cancele quando quiser.
          </p>
          <p className="text-sm text-muted-foreground">
            Dúvidas? Entre em contato com nosso suporte.
          </p>
        </div>
      </div>
    </div>
  );
}

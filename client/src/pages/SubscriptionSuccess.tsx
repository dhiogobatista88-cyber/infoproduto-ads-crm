import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SubscriptionSuccess() {
  useEffect(() => {
    // Show success message
    toast.success('Assinatura confirmada com sucesso!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full border-green-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Pagamento Confirmado!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              O que acontece agora?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Sua assinatura está ativa e você tem acesso a todos os recursos do plano</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Você pode começar a criar anúncios com ajuda da IA imediatamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>A cobrança será renovada automaticamente todo mês</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Você pode cancelar a qualquer momento sem taxas adicionais</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-3">
              Próximos Passos
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Conecte sua conta do Meta Business Manager</li>
              <li>Configure suas campanhas e públicos-alvo</li>
              <li>Crie seu primeiro anúncio com ajuda da IA</li>
              <li>Acompanhe os resultados em tempo real</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/create-ad">
                <ArrowRight className="w-4 h-4 mr-2" />
                Criar Primeiro Anúncio
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/">
                Ir para Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Você receberá um email de confirmação com todos os detalhes da sua assinatura
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

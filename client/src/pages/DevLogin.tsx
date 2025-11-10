import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function DevLogin() {
  const { refresh } = useAuth();
  const devLoginMutation = trpc.auth.devLogin.useMutation({
    onSuccess: () => {
      refresh();
    },
  });

  // Redireciona para a home se já estiver autenticado
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {
    if (isAuthenticated && !loading) {
      window.location.href = "/";
    }
  }, [isAuthenticated, loading]);

  const handleDevLogin = () => {
    devLoginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-2" />
          <CardTitle className="text-2xl">Login de Desenvolvimento</CardTitle>
          <CardDescription>
            Acesso rápido para contornar problemas de OAuth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleDevLogin} 
            className="w-full"
            disabled={devLoginMutation.isPending}
          >
            {devLoginMutation.isPending ? "Entrando..." : "Entrar como Desenvolvedor"}
          </Button>
          {devLoginMutation.isError && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Erro ao tentar login de desenvolvimento. Verifique o console do servidor.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

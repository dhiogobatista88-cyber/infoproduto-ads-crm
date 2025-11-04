import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Pause, Play, Trash2, BarChart3, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdsList() {
  const utils = trpc.useUtils();
  const { data: ads, isLoading } = trpc.ad.list.useQuery();
  
  const updateStatusMutation = trpc.ad.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status do anúncio atualizado!');
      utils.ad.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleStatusChange = (adId: number, newStatus: 'active' | 'paused' | 'deleted') => {
    if (newStatus === 'deleted') {
      if (!confirm('Tem certeza que deseja deletar este anúncio?')) return;
    }
    updateStatusMutation.mutate({ id: adId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Ativo" },
      paused: { variant: "secondary", label: "Pausado" },
      draft: { variant: "outline", label: "Rascunho" },
      deleted: { variant: "destructive", label: "Deletado" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Meus Anúncios
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus anúncios do Facebook e Instagram
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/ads/create">
              <Plus className="w-4 h-4 mr-2" />
              Criar Anúncio
            </Link>
          </Button>
        </div>

        {/* Ads List */}
        {!ads || ads.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>Nenhum anúncio criado ainda</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Comece criando seu primeiro anúncio com ajuda da nossa IA especializada em tráfego pago.
              </CardDescription>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href="/ads/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Anúncio
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            {ads.map((item) => (
              <Card key={item.ad.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{item.ad.name}</CardTitle>
                        {getStatusBadge(item.ad.status)}
                      </div>
                      <CardDescription>
                        Campanha: {item.campaign.name} • {item.campaign.objective}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {item.ad.status === 'active' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusChange(item.ad.id, 'paused')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {item.ad.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleStatusChange(item.ad.id, 'active')}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatusChange(item.ad.id, 'deleted')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Creative Preview */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                        Conteúdo do Anúncio
                      </h4>
                      <div className="space-y-2">
                        {item.creative.title && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Título:</span>
                            <p className="font-medium">{item.creative.title}</p>
                          </div>
                        )}
                        {item.creative.body && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Descrição:</span>
                            <p className="text-sm text-muted-foreground">{item.creative.body}</p>
                          </div>
                        )}
                        {item.creative.callToAction && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">CTA:</span>
                            <Badge variant="outline" className="ml-2">
                              {item.creative.callToAction}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ad Set Info */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                        Configurações
                      </h4>
                      <div className="space-y-2 text-sm">
                        {item.adSet.dailyBudget && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orçamento Diário:</span>
                            <span className="font-medium">
                              R$ {(item.adSet.dailyBudget / 100).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status do Ad Set:</span>
                          {getStatusBadge(item.adSet.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Criado em:</span>
                          <span className="font-medium">
                            {new Date(item.ad.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/ads/${item.ad.id}/insights`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Métricas
                      </Link>
                    </Button>
                    {item.creative.linkUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.creative.linkUrl} target="_blank" rel="noopener noreferrer">
                          Ver Link
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

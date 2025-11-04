import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Sparkles, Loader2, ArrowLeft, Wand2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function CreateAd() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  
  // Product Info
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Generated Content
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [callToAction, setCallToAction] = useState("");
  
  // Ad Config
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dailyBudget, setDailyBudget] = useState("50");
  const [countries, setCountries] = useState("BR");
  
  const { data: canUseAI } = trpc.subscription.canUseAI.useQuery();
  const { data: metaAccounts } = trpc.metaAccount.list.useQuery();
  const { data: campaigns } = trpc.campaign.list.useQuery();
  
  const generateCompleteMutation = trpc.ai.generateComplete.useMutation({
    onSuccess: (data) => {
      setTitle(data.title);
      setBody(data.body);
      setCallToAction(data.callToAction);
      toast.success('Conteúdo gerado com sucesso!');
      setStep(2);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar conteúdo: ${error.message}`);
    },
  });
  
  const createAdMutation = trpc.ad.create.useMutation({
    onSuccess: () => {
      toast.success('Anúncio criado com sucesso!');
      setLocation('/ads');
    },
    onError: (error) => {
      toast.error(`Erro ao criar anúncio: ${error.message}`);
    },
  });

  const handleGenerateContent = () => {
    if (!productName.trim()) {
      toast.error('Por favor, preencha o nome do produto');
      return;
    }
    
    if (!canUseAI?.canUse) {
      toast.error('Você atingiu o limite de gerações de IA ou não tem assinatura ativa');
      return;
    }
    
    generateCompleteMutation.mutate({
      productName,
      description: description || undefined,
      category: category || undefined,
      price: price || undefined,
      targetAudience: targetAudience || undefined,
    });
  };

  const handleCreateAd = () => {
    if (!campaigns || campaigns.length === 0) {
      toast.error('Você precisa criar uma campanha primeiro');
      return;
    }
    
    if (!title || !body || !linkUrl) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const campaignId = campaigns[0].id; // Use first campaign for now
    
    createAdMutation.mutate({
      campaignId,
      name: productName,
      title,
      body,
      callToAction,
      linkUrl,
      imageUrl: imageUrl || undefined,
      dailyBudget: Math.round(parseFloat(dailyBudget) * 100),
      targeting: {
        geoLocations: {
          countries: countries.split(',').map(c => c.trim()),
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/ads">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Criar Novo Anúncio
          </h1>
          <p className="text-muted-foreground">
            Use nossa IA para gerar conteúdo otimizado para conversão
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="font-medium">Produto</span>
            </div>
            <div className="w-16 h-0.5 bg-muted"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium">Conteúdo</span>
            </div>
            <div className="w-16 h-0.5 bg-muted"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="font-medium">Configuração</span>
            </div>
          </div>
        </div>

        {/* Step 1: Product Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
              <CardDescription>
                Preencha os detalhes do produto para a IA gerar o melhor conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  placeholder="Ex: Tênis Esportivo Premium"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os principais detalhes do produto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="Ex: Moda, Eletrônicos"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    placeholder="Ex: R$ 299,90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público-Alvo</Label>
                <Input
                  id="targetAudience"
                  placeholder="Ex: Homens e mulheres de 25-45 anos interessados em fitness"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              {/* AI Usage Info */}
              {canUseAI && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">
                        {canUseAI.canUse ? 'IA Disponível' : 'Limite Atingido'}
                      </p>
                      <p className="text-sm text-purple-700">
                        {canUseAI.canUse && typeof canUseAI.limit === 'number' && typeof canUseAI.used === 'number'
                          ? `Você tem ${canUseAI.limit - canUseAI.used} gerações restantes este mês`
                          : 'Você atingiu o limite mensal de gerações. Faça upgrade do seu plano.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateContent}
                  disabled={!productName || generateCompleteMutation.isPending || !canUseAI?.canUse}
                  className="flex-1"
                  size="lg"
                >
                  {generateCompleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando com IA...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Gerar Conteúdo com IA
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={!productName}
                >
                  Pular
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Ad Content */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Anúncio</CardTitle>
              <CardDescription>
                Revise e edite o conteúdo gerado pela IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Anúncio *</Label>
                <Input
                  id="title"
                  placeholder="Título chamativo e impactante"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={40}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/40 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Descrição *</Label>
                <Textarea
                  id="body"
                  placeholder="Descrição persuasiva do anúncio"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  maxLength={125}
                />
                <p className="text-xs text-muted-foreground">
                  {body.length}/125 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="callToAction">Call-to-Action</Label>
                <Input
                  id="callToAction"
                  placeholder="Ex: SHOP_NOW, LEARN_MORE"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                />
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-3">Preview do Anúncio</p>
                <div className="bg-background rounded-lg p-4 space-y-2">
                  {title && <h3 className="font-bold text-lg">{title}</h3>}
                  {body && <p className="text-sm text-muted-foreground">{body}</p>}
                  {callToAction && (
                    <Button size="sm" className="mt-2">
                      {callToAction.replace(/_/g, ' ')}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!title || !body}
                  className="flex-1"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Anúncio</CardTitle>
              <CardDescription>
                Configure o orçamento e segmentação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="linkUrl">URL de Destino *</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  placeholder="https://seusite.com/produto"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyBudget">Orçamento Diário (R$)</Label>
                <Input
                  id="dailyBudget"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="50.00"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countries">Países (separados por vírgula)</Label>
                <Input
                  id="countries"
                  placeholder="BR, US, PT"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                />
              </div>

              {!metaAccounts || metaAccounts.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Você precisa conectar uma conta do Meta Business Manager antes de criar anúncios.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/settings/meta">Conectar Conta Meta</Link>
                  </Button>
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Você precisa criar uma campanha antes de criar anúncios.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/campaigns/create">Criar Campanha</Link>
                  </Button>
                </div>
              ) : null}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  onClick={handleCreateAd}
                  disabled={
                    !linkUrl || 
                    createAdMutation.isPending ||
                    !metaAccounts?.length ||
                    !campaigns?.length
                  }
                  className="flex-1"
                  size="lg"
                >
                  {createAdMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando Anúncio...
                    </>
                  ) : (
                    'Criar Anúncio'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

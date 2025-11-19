import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sprout, TrendingUp, AlertCircle, Lightbulb, Leaf } from "lucide-react";
import { useState } from "react";
import { buscarDashboardMAPACompleto, type MAPADashboard } from "@/infra/agriculture/mapaService";
import { gerarInsightsMAPA, type MAPAInsightsResponse } from "@/services/mapaInsightsService";

export function MAPAComprehensiveCard() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<MAPADashboard | null>(null);
  const [insights, setInsights] = useState<MAPAInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboard = await buscarDashboardMAPACompleto();
      setData(dashboard);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados do MAPA");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!data) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await gerarInsightsMAPA(data);
      setInsights(result);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar insights");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="palantir-card palantir-glow">
      <CardHeader className="palantir-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-green-500 palantir-icon-glow" />
            <div>
              <CardTitle className="font-mono text-primary">MAPA - Agricultura e Pecuária</CardTitle>
              <CardDescription className="font-mono text-xs">
                Ministério da Agricultura e Pecuária - Dados Abertos Completos
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!data && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground font-mono mb-4">
              Carregue os dados do MAPA para análise agropecuária
            </p>
            <Button 
              onClick={handleFetchData}
              className="palantir-button font-mono"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Carregar Dados MAPA
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded palantir-border">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}

        {data && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5 w-full palantir-border font-mono">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="agrotoxicos">Agrotóxicos</TabsTrigger>
              <TabsTrigger value="organicos">Orgânicos</TabsTrigger>
              <TabsTrigger value="zoneamento">Zoneamento</TabsTrigger>
              <TabsTrigger value="insights">Insights IA</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Agrotóxicos</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.agrotoxicos.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">Registros</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Certificação Orgânica</p>
                  <p className="text-2xl font-bold font-mono text-green-500">{data.certificacaoOrganica.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">{data.certificacaoOrganica.areaTotalCertificada.toFixed(0)} ha</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Zoneamento Agrícola</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.zoneamento.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">Zonas Mapeadas</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Datasets</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.meta.datasetsConsultados.length}</p>
                  <p className="text-xs text-muted-foreground font-mono">Consultados</p>
                </div>
              </div>

              <div className="p-4 bg-card/30 backdrop-blur-sm rounded palantir-border">
                <p className="text-xs text-muted-foreground font-mono mb-2">Datasets Consultados:</p>
                <div className="flex flex-wrap gap-2">
                  {data.meta.datasetsConsultados.map((ds, idx) => (
                    <Badge key={idx} variant="outline" className="font-mono text-xs palantir-border">
                      {ds}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-3">
                  Última coleta: {new Date(data.meta.dataColeta).toLocaleString('pt-BR')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="agrotoxicos" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Por Classe Toxicológica</h4>
                  <div className="space-y-1">
                    {Object.entries(data.agrotoxicos.porClasse)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .map(([classe, qtd]) => (
                        <div key={classe} className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Classe {classe}</span>
                          <span className="text-primary font-semibold">{qtd as number}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Por Cultura</h4>
                  <div className="space-y-1">
                    {Object.entries(data.agrotoxicos.porCultura)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([cultura, qtd]) => (
                        <div key={cultura} className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">{cultura}</span>
                          <span className="text-primary font-semibold">{qtd as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="organicos" className="space-y-4 mt-4">
              <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                <h4 className="font-mono font-semibold mb-2 text-green-500">Certificação Orgânica por Estado</h4>
                <div className="space-y-1">
                  {Object.entries(data.certificacaoOrganica.porEstado)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([uf, qtd]) => (
                      <div key={uf} className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">{uf}</span>
                        <span className="text-green-500 font-semibold">{qtd as number}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                <h4 className="font-mono font-semibold mb-2 text-green-500">Área Total Certificada</h4>
                <p className="text-3xl font-bold font-mono text-green-500">
                  {data.certificacaoOrganica.areaTotalCertificada.toFixed(2)} ha
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Hectares certificados para produção orgânica
                </p>
              </div>
            </TabsContent>

            <TabsContent value="zoneamento" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Por Cultura</h4>
                  <div className="space-y-1">
                    {Object.entries(data.zoneamento.porCultura)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([cultura, qtd]) => (
                        <div key={cultura} className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">{cultura}</span>
                          <span className="text-primary font-semibold">{qtd as number}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Por Estado</h4>
                  <div className="space-y-1">
                    {Object.entries(data.zoneamento.porEstado)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .map(([uf, qtd]) => (
                        <div key={uf} className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">{uf}</span>
                          <span className="text-primary font-semibold">{qtd as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {!insights && !analyzing && (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-primary palantir-icon-glow" />
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    Gere insights estratégicos sobre agricultura e pecuária com IA
                  </p>
                  <Button 
                    onClick={handleAnalyze}
                    className="palantir-button font-mono"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Gerar Insights com IA
                  </Button>
                </div>
              )}

              {analyzing && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 font-mono text-sm text-muted-foreground">
                    Analisando dados agropecuários com IA...
                  </span>
                </div>
              )}

              {insights && (
                <div className="space-y-4">
                  <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h4 className="font-mono font-semibold text-primary">Análise Estratégica do Setor Agropecuário</h4>
                    </div>
                    <div className="prose prose-sm max-w-none font-mono text-sm whitespace-pre-wrap text-foreground">
                      {insights.insights}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Agrotóxicos</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.agrotoxicosTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Orgânicos</p>
                      <p className="text-xl font-bold font-mono text-green-500">
                        {insights.dataAnalyzed.certificacaoOrganicaTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Zoneamento</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.zoneamentoTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Área Certificada</p>
                      <p className="text-xl font-bold font-mono text-green-500">
                        {insights.dataAnalyzed.areaCertificada.toFixed(0)} ha
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

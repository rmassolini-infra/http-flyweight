import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Zap, TrendingUp, AlertCircle, Lightbulb, BarChart3 } from "lucide-react";
import { useState } from "react";
import { buscarDashboardAneelCompleto, type AneelDashboard } from "@/infra/energy/aneelComprehensiveService";
import { gerarInsightsAneel, type AneelInsightsResponse } from "@/services/aneelInsightsService";

export function AneelComprehensiveCard() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<AneelDashboard | null>(null);
  const [insights, setInsights] = useState<AneelInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboard = await buscarDashboardAneelCompleto();
      setData(dashboard);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados da ANEEL");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!data) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await gerarInsightsAneel(data);
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
            <Zap className="w-6 h-6 text-primary palantir-icon-glow" />
            <div>
              <CardTitle className="font-mono text-primary">ANEEL - Dados Completos</CardTitle>
              <CardDescription className="font-mono text-xs">
                Todos os datasets disponíveis da Agência Nacional de Energia Elétrica
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!data && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground font-mono mb-4">
              Carregue os dados completos da ANEEL para análise
            </p>
            <Button 
              onClick={handleFetchData}
              className="palantir-button font-mono"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Carregar Dados ANEEL
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
              <TabsTrigger value="geracao">Geração</TabsTrigger>
              <TabsTrigger value="transmissao">Transmissão</TabsTrigger>
              <TabsTrigger value="tarifas">Tarifas</TabsTrigger>
              <TabsTrigger value="insights">Insights IA</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Geração Distribuída</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.geracaoDistribuida.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">{(data.geracaoDistribuida.potenciaTotal / 1000).toFixed(1)} MW</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Usinas (SIGA)</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.geracao.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">{data.geracao.potenciaTotal.toFixed(0)} MW</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Linhas Transmissão</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.transmissao.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">{data.transmissao.extensaoTotal.toFixed(0)} km</p>
                </div>
                
                <div className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <p className="text-xs text-muted-foreground font-mono">Demandas Ouvidoria</p>
                  <p className="text-2xl font-bold font-mono text-primary">{data.ouvidoria.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-mono">Total registrado</p>
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

            <TabsContent value="geracao" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Geração Distribuída por Fonte</h4>
                  <div className="space-y-1">
                    {Object.entries(data.geracaoDistribuida.porFonte)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([fonte, qtd]) => (
                        <div key={fonte} className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">{fonte}</span>
                          <span className="text-primary font-semibold">{qtd as number}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                  <h4 className="font-mono font-semibold mb-2 text-primary">Estados Líderes</h4>
                  <div className="space-y-1">
                    {Object.entries(data.geracaoDistribuida.porEstado)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
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

            <TabsContent value="transmissao" className="space-y-4 mt-4">
              <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                <h4 className="font-mono font-semibold mb-2 text-primary">Por Concessionária</h4>
                <div className="space-y-1">
                  {Object.entries(data.transmissao.porConcessionaria)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 15)
                    .map(([conc, qtd]) => (
                      <div key={conc} className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground truncate max-w-[200px]">{conc}</span>
                        <span className="text-primary font-semibold">{qtd as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tarifas" className="space-y-4 mt-4">
              <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                <h4 className="font-mono font-semibold mb-2 text-primary">Tarifa Média Nacional</h4>
                <p className="text-3xl font-bold font-mono text-primary">
                  R$ {data.tarifas.mediaNacional.toFixed(4)}/kWh
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Baseado em {data.tarifas.total} registros
                </p>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {!insights && !analyzing && (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-primary palantir-icon-glow" />
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    Gere insights estratégicos com IA a partir dos dados da ANEEL
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
                    Analisando dados com IA...
                  </span>
                </div>
              )}

              {insights && (
                <div className="space-y-4">
                  <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h4 className="font-mono font-semibold text-primary">Análise Estratégica</h4>
                    </div>
                    <div className="prose prose-sm max-w-none font-mono text-sm whitespace-pre-wrap text-foreground">
                      {insights.insights}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">GD Analisada</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.geracaoDistribuidaTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Usinas</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.geracaoTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Transmissão</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.transmissaoTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-card/30 backdrop-blur-sm rounded palantir-border">
                      <p className="text-xs text-muted-foreground font-mono">Ouvidoria</p>
                      <p className="text-xl font-bold font-mono text-primary">
                        {insights.dataAnalyzed.ouvidoriaTotal.toLocaleString()}
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

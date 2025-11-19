import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Database, Brain, TrendingUp, AlertTriangle, Target, Network, Activity } from "lucide-react";
import { useState } from "react";
import { buscarDashboardPalantir, type PalantirDashboard } from "@/infra/gov/palantirService";
import { gerarInteligenciaPalantir, type PalantirIntelligenceResponse } from "@/services/palantirIntelligenceService";
import { Progress } from "@/components/ui/progress";

export function PalantirCard() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<PalantirDashboard | null>(null);
  const [intelligence, setIntelligence] = useState<PalantirIntelligenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const dashboard = await buscarDashboardPalantir();
      clearInterval(progressInterval);
      setProgress(100);
      setData(dashboard);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!data) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await gerarInteligenciaPalantir(data);
      setIntelligence(result);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar inteligência");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="palantir-card palantir-glow">
      <CardHeader className="palantir-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary palantir-icon-glow" />
            <div>
              <CardTitle className="font-mono text-primary flex items-center gap-2">
                PALANTIR INTELLIGENCE
                <Badge variant="outline" className="palantir-border font-mono text-xs">
                  FULL SPECTRUM
                </Badge>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Agregação massiva de dados.gov.br + Análise de inteligência profunda
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!data && !loading && (
          <div className="text-center py-12">
            <Network className="w-16 h-16 mx-auto mb-4 text-primary palantir-icon-glow" />
            <p className="text-sm text-muted-foreground font-mono mb-2">
              Sistema de Inteligência Integrado
            </p>
            <p className="text-xs text-muted-foreground font-mono mb-6">
              Agrega 15.000+ datasets do Portal Brasileiro de Dados Abertos
            </p>
            <Button 
              onClick={handleFetchData}
              className="palantir-button font-mono"
              size="lg"
            >
              <Activity className="w-5 h-5 mr-2" />
              INICIAR AGREGAÇÃO PALANTIR
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                Agregando dados de 8 categorias principais...
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Economia
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Saúde
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Educação
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Segurança
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Meio Ambiente
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Transportes
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Trabalho
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Turismo
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded palantir-border">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}

        {data && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 w-full palantir-border font-mono">
              <TabsTrigger value="overview">Cobertura</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border palantir-corner">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Total Datasets</p>
                  <p className="text-3xl font-bold font-mono text-primary palantir-glow">
                    {data.meta.totalDatasets.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">agregados</p>
                </div>
                
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border palantir-corner">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Categorias</p>
                  <p className="text-3xl font-bold font-mono text-primary">{data.meta.categorias}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">principais</p>
                </div>
                
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border palantir-corner">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Economia</p>
                  <p className="text-3xl font-bold font-mono text-primary">{data.economia.total}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">datasets</p>
                </div>
                
                <div className="p-4 bg-card/50 backdrop-blur-sm rounded palantir-border palantir-corner">
                  <p className="text-xs text-muted-foreground font-mono mb-1">Saúde</p>
                  <p className="text-3xl font-bold font-mono text-primary">{data.saude.total}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">datasets</p>
                </div>
              </div>

              <div className="p-4 bg-card/30 backdrop-blur-sm rounded palantir-border">
                <p className="text-xs text-muted-foreground font-mono mb-2">Coleta realizada:</p>
                <p className="text-sm font-mono">{new Date(data.meta.dataColeta).toLocaleString('pt-BR')}</p>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-3 mt-4">
              {[
                { name: 'Economia', total: data.economia.total, icon: TrendingUp, color: 'text-blue-500' },
                { name: 'Saúde', total: data.saude.total, icon: Activity, color: 'text-red-500' },
                { name: 'Educação', total: data.educacao.total, icon: Brain, color: 'text-purple-500' },
                { name: 'Segurança', total: data.seguranca.total, icon: AlertTriangle, color: 'text-yellow-500' },
                { name: 'Meio Ambiente', total: data.meioAmbiente.total, icon: Target, color: 'text-green-500' },
                { name: 'Transportes', total: data.transportes.total, icon: Network, color: 'text-cyan-500' },
                { name: 'Trabalho', total: data.trabalho.total, icon: TrendingUp, color: 'text-orange-500' },
                { name: 'Turismo', total: data.turismo.total, icon: Target, color: 'text-pink-500' },
              ].map(({ name, total, icon: Icon, color }) => (
                <div key={name} className="p-3 bg-card/50 backdrop-blur-sm rounded palantir-border flex items-center justify-between hover:palantir-glow transition-all">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-mono font-semibold">{name}</span>
                  </div>
                  <Badge variant="outline" className="palantir-border font-mono">
                    {total} datasets
                  </Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-4 mt-4">
              {!intelligence && !analyzing && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-primary palantir-icon-glow" />
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    Gere análise de inteligência Palantir sobre {data.meta.totalDatasets} datasets
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mb-6 max-w-md mx-auto">
                    Sistema avançado identifica correlações não-óbvias, riscos sistêmicos e oportunidades de alto impacto
                  </p>
                  <Button 
                    onClick={handleAnalyze}
                    className="palantir-button font-mono"
                    size="lg"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    GERAR INTELLIGENCE REPORT
                  </Button>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <span className="font-mono text-sm text-muted-foreground mb-2">
                    Processando {data.meta.totalDatasets} datasets...
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Identificando correlações estratégicas e padrões emergentes
                  </span>
                </div>
              )}

              {intelligence && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(intelligence.coverage).filter(([key]) => key !== 'totalDatasets' && key !== 'categorias').map(([key, value]) => (
                      <div key={key} className="p-2 bg-card/30 backdrop-blur-sm rounded palantir-border text-center">
                        <p className="text-xs text-muted-foreground font-mono truncate">{key}</p>
                        <p className="text-lg font-bold font-mono text-primary">{value as number}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-card/50 backdrop-blur-sm rounded palantir-border palantir-corner">
                    <div className="flex items-center gap-2 mb-4">
                      <Network className="w-6 h-6 text-primary" />
                      <h3 className="font-mono font-bold text-lg text-primary">PALANTIR INTELLIGENCE REPORT</h3>
                    </div>
                    <div className="prose prose-sm max-w-none font-mono text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                      {intelligence.intelligence}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono text-center">
                    Report gerado: {new Date(intelligence.timestamp).toLocaleString('pt-BR')} | Cobertura: {intelligence.coverage.totalDatasets} datasets
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

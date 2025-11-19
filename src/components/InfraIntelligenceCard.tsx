import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Database, Brain, TrendingUp, AlertTriangle, Target, Network, Activity } from "lucide-react";
import { useState } from "react";
import { buscarDashboardInfra, type InfraDashboard } from "@/infra/gov/infraService";
import { gerarInteligenciaInfra, type InfraIntelligenceResponse } from "@/services/infraIntelligenceService";
import { Progress } from "@/components/ui/progress";

export function InfraIntelligenceCard() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<InfraDashboard | null>(null);
  const [intelligence, setIntelligence] = useState<InfraIntelligenceResponse | null>(null);
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

      const dashboard = await buscarDashboardInfra();
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
      const result = await gerarInteligenciaInfra(data);
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
                INFRA INTELLIGENCE
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
              INICIAR AGREGAÇÃO INFRA
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="font-mono text-sm text-muted-foreground">
                AGREGANDO DADOS GOVERNAMENTAIS...
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground font-mono">
              Consultando múltiplas fontes de dados abertos brasileiros
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}

        {data && !intelligence && (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview" className="font-mono text-xs">Visão Geral</TabsTrigger>
                <TabsTrigger value="categories" className="font-mono text-xs">Categorias</TabsTrigger>
                <TabsTrigger value="coverage" className="font-mono text-xs">Cobertura</TabsTrigger>
                <TabsTrigger value="sources" className="font-mono text-xs">Fontes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg palantir-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">Total Datasets</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{data.meta.totalDatasets.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg palantir-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">Categorias</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{data.meta.categorias}</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg palantir-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Economia & Desenvolvimento</span>
                    <Badge className="palantir-button">{data.economia.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Saúde Pública</span>
                    <Badge className="palantir-button">{data.saude.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Educação</span>
                    <Badge className="palantir-button">{data.educacao.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Segurança Pública</span>
                    <Badge className="palantir-button">{data.seguranca.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Meio Ambiente</span>
                    <Badge className="palantir-button">{data.meioAmbiente.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Transportes</span>
                    <Badge className="palantir-button">{data.transportes.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Trabalho & Emprego</span>
                    <Badge className="palantir-button">{data.trabalho.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">Turismo</span>
                    <Badge className="palantir-button">{data.turismo.total}</Badge>
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze}
                  className="w-full palantir-button font-mono"
                  size="lg"
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      PROCESSANDO ANÁLISE DE INTELIGÊNCIA...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      GERAR ANÁLISE DE INTELIGÊNCIA PROFUNDA
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="categories" className="mt-4">
                <div className="space-y-4">
                  {Object.entries({
                    "Economia & Desenvolvimento": data.economia.datasets,
                    "Saúde Pública": data.saude.datasets,
                    "Educação": data.educacao.datasets,
                    "Segurança Pública": data.seguranca.datasets,
                    "Meio Ambiente": data.meioAmbiente.datasets,
                    "Transportes": data.transportes.datasets,
                    "Trabalho & Emprego": data.trabalho.datasets,
                    "Turismo": data.turismo.datasets,
                  }).map(([category, datasets]) => (
                    <div key={category} className="p-4 border rounded-lg palantir-border">
                      <h4 className="font-mono text-sm font-semibold mb-2">{category}</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {datasets.length} datasets disponíveis
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="coverage" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg palantir-border">
                    <h4 className="font-mono text-sm font-semibold mb-4">Cobertura Nacional</h4>
                    {data.meta.totalDatasets > 0 ? (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Economia</span>
                            <span className="text-xs font-mono text-primary">
                              {data.economia.total} datasets ({((data.economia.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.economia.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Saúde</span>
                            <span className="text-xs font-mono text-primary">
                              {data.saude.total} datasets ({((data.saude.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.saude.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Educação</span>
                            <span className="text-xs font-mono text-primary">
                              {data.educacao.total} datasets ({((data.educacao.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.educacao.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Segurança</span>
                            <span className="text-xs font-mono text-primary">
                              {data.seguranca.total} datasets ({((data.seguranca.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.seguranca.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Meio Ambiente</span>
                            <span className="text-xs font-mono text-primary">
                              {data.meioAmbiente.total} datasets ({((data.meioAmbiente.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.meioAmbiente.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Transportes</span>
                            <span className="text-xs font-mono text-primary">
                              {data.transportes.total} datasets ({((data.transportes.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.transportes.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Trabalho</span>
                            <span className="text-xs font-mono text-primary">
                              {data.trabalho.total} datasets ({((data.trabalho.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.trabalho.total / data.meta.totalDatasets) * 100} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-mono">Turismo</span>
                            <span className="text-xs font-mono text-primary">
                              {data.turismo.total} datasets ({((data.turismo.total / data.meta.totalDatasets) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(data.turismo.total / data.meta.totalDatasets) * 100} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-mono text-center py-4">
                        Nenhum dado disponível para exibir cobertura
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sources" className="mt-4">
                <div className="p-4 border rounded-lg palantir-border">
                  <h4 className="font-mono text-sm font-semibold mb-4">Fontes de Dados</h4>
                  <div className="space-y-2 text-xs font-mono text-muted-foreground">
                    <p>• Portal Brasileiro de Dados Abertos (dados.gov.br)</p>
                    <p>• IBGE - Instituto Brasileiro de Geografia e Estatística</p>
                    <p>• Ministério da Economia</p>
                    <p>• Ministério da Saúde</p>
                    <p>• Ministério da Educação (MEC)</p>
                    <p>• DNIT - Departamento Nacional de Infraestrutura de Transportes</p>
                    <p>• ANTT - Agência Nacional de Transportes Terrestres</p>
                    <p>• MAPA - Ministério da Agricultura, Pecuária e Abastecimento</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {intelligence && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary palantir-icon-glow" />
                <h3 className="font-mono text-lg font-bold">ANÁLISE DE INTELIGÊNCIA CONCLUÍDA</h3>
              </div>
              <Button 
                onClick={() => setIntelligence(null)}
                variant="outline"
                className="font-mono text-xs"
              >
                Nova Análise
              </Button>
            </div>

            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="analysis" className="font-mono text-xs">Análise Completa</TabsTrigger>
                <TabsTrigger value="metrics" className="font-mono text-xs">Métricas</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4">
                <div className="p-6 border rounded-lg palantir-border space-y-4 max-h-[600px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {intelligence.intelligence}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg palantir-border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">Total Analisado</span>
                    </div>
                    <p className="text-xl font-bold text-primary">{intelligence.coverage.totalDatasets}</p>
                  </div>
                  <div className="p-4 border rounded-lg palantir-border">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-muted-foreground">Categorias</span>
                    </div>
                    <p className="text-xl font-bold text-primary">{intelligence.coverage.categorias}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 border rounded-lg palantir-border space-y-2">
                  <h4 className="font-mono text-sm font-semibold mb-3">Distribuição por Categoria</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span>Economia:</span>
                      <Badge variant="outline">{intelligence.coverage.economia}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Saúde:</span>
                      <Badge variant="outline">{intelligence.coverage.saude}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Educação:</span>
                      <Badge variant="outline">{intelligence.coverage.educacao}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Segurança:</span>
                      <Badge variant="outline">{intelligence.coverage.seguranca}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Meio Ambiente:</span>
                      <Badge variant="outline">{intelligence.coverage.meioAmbiente}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Transportes:</span>
                      <Badge variant="outline">{intelligence.coverage.transportes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Trabalho:</span>
                      <Badge variant="outline">{intelligence.coverage.trabalho}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Turismo:</span>
                      <Badge variant="outline">{intelligence.coverage.turismo}</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

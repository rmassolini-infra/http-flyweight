import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buscarAnaliseInteligentteProfunda, DeepIntelligenceAnalysis } from "@/services/deepIntelligenceService";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Database, Building2, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DeepIntelligence() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DeepIntelligenceAnalysis | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await buscarAnaliseInteligentteProfunda();
      setAnalysis(result);
      toast.success("Análise de inteligência profunda concluída!");
    } catch (error) {
      console.error('Erro:', error);
      toast.error("Erro ao gerar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadge = (impacto: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      alto: "destructive",
      medio: "default",
      baixo: "secondary",
    };
    return <Badge variant={variants[impacto] || "default"}>{impacto.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (prioridade: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      alta: "destructive",
      media: "default",
      baixa: "secondary",
    };
    return <Badge variant={variants[prioridade] || "default"}>{prioridade.toUpperCase()}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="h-10 w-10" />
            Análise de Inteligência Profunda
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise completa e automatizada de todos os dados disponíveis no Portal Brasileiro de Dados Abertos usando IA
          </p>
        </div>
        <Button 
          onClick={handleAnalyze} 
          disabled={loading}
          size="lg"
          className="gap-2"
        >
          {loading ? (
            <>
              <Sparkles className="h-5 w-5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              Iniciar Análise Profunda
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {analysis && !loading && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Datasets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysis.metadata.total_datasets_analyzed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Organizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysis.metadata.total_organizations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysis.metadata.total_categories}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Recursos Médios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analysis.statistics.avgResourcesPerDataset}</div>
                </CardContent>
              </Card>
            </div>

            {analysis.ai_analysis.resumo_executivo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Resumo Executivo (IA)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysis.ai_analysis.resumo_executivo}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Top 10 Organizações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.organizations.top10.map((org, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{org.org}</span>
                        <Badge variant="outline">{org.count} datasets</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Top 10 Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.categories.top20.slice(0, 10).map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{cat.tag}</span>
                        <Badge variant="outline">{cat.count} datasets</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências Identificadas pela IA
                </CardTitle>
                <CardDescription>Principais padrões e direções identificados nos dados</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.ai_analysis.tendencias && analysis.ai_analysis.tendencias.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.ai_analysis.tendencias.map((trend, idx) => (
                      <Alert key={idx}>
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle className="flex items-center gap-2">
                          {trend.titulo}
                          {getImpactBadge(trend.impacto)}
                        </AlertTitle>
                        <AlertDescription>{trend.descricao}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {analysis.ai_analysis.raw_response || 'Nenhuma tendência identificada'}
                  </p>
                )}
              </CardContent>
            </Card>

            {analysis.ai_analysis.lacunas && analysis.ai_analysis.lacunas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Lacunas de Dados
                  </CardTitle>
                  <CardDescription>Áreas que precisam de mais atenção</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.ai_analysis.lacunas.map((gap, idx) => (
                      <Alert key={idx} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="flex items-center gap-2">
                          {gap.area}
                          {getPriorityBadge(gap.prioridade)}
                        </AlertTitle>
                        <AlertDescription>{gap.descricao}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Oportunidades Estratégicas
                </CardTitle>
                <CardDescription>Oportunidades de uso e análise dos dados</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.ai_analysis.oportunidades && analysis.ai_analysis.oportunidades.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.ai_analysis.oportunidades.map((opp, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {opp.titulo}
                            {getImpactBadge(opp.potencial)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{opp.descricao}</p>
                          {opp.datasets_relacionados.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {opp.datasets_relacionados.map((ds, i) => (
                                <Badge key={i} variant="outline">{ds}</Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {analysis.ai_analysis.raw_response || 'Nenhuma oportunidade identificada'}
                  </p>
                )}
              </CardContent>
            </Card>

            {analysis.ai_analysis.recomendacoes && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Empresas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.ai_analysis.recomendacoes.empresas?.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pesquisadores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.ai_analysis.recomendacoes.pesquisadores?.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Desenvolvedores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.ai_analysis.recomendacoes.desenvolvedores?.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Insights Acionáveis
                </CardTitle>
                <CardDescription>Descobertas práticas e ações recomendadas</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.ai_analysis.insights && analysis.ai_analysis.insights.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.ai_analysis.insights.map((insight, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg">{insight.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-muted-foreground">{insight.descricao}</p>
                          <div className="bg-primary/10 p-3 rounded-md">
                            <p className="text-sm font-medium">💡 Ação Sugerida:</p>
                            <p className="text-sm text-muted-foreground">{insight.acao_sugerida}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {analysis.ai_analysis.raw_response || 'Nenhum insight gerado'}
                  </p>
                )}
              </CardContent>
            </Card>

            {analysis.ai_analysis.correlacoes && analysis.ai_analysis.correlacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Correlações Interessantes
                  </CardTitle>
                  <CardDescription>Relações identificadas entre diferentes áreas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.ai_analysis.correlacoes.map((corr, idx) => (
                      <div key={idx} className="border-l-4 border-primary pl-4">
                        <p className="font-medium">
                          {corr.area1} ↔ {corr.area2}
                        </p>
                        <p className="text-sm text-muted-foreground">{corr.relacao}</p>
                        <p className="text-sm text-muted-foreground italic">
                          Potencial: {corr.potencial_analise}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            {analysis.ai_analysis.qualidade && (
              <Card>
                <CardHeader>
                  <CardTitle>Qualidade dos Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Score de Qualidade</span>
                      <span className="text-2xl font-bold">{analysis.ai_analysis.qualidade.score}/100</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${analysis.ai_analysis.qualidade.score}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground">{analysis.ai_analysis.qualidade.analise}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Pontos Fortes</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.ai_analysis.qualidade.pontosFortes.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Pontos Fracos</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.ai_analysis.qualidade.pontosFracos.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Amostra de Datasets</CardTitle>
                <CardDescription>Primeiros 20 datasets analisados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.sample_datasets.slice(0, 20).map((ds, idx) => (
                    <div key={idx} className="border p-3 rounded-md space-y-1">
                      <p className="font-medium text-sm">{ds.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{ds.organization}</Badge>
                        <span>{ds.resources} recursos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!analysis && !loading && (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma análise disponível</h3>
          <p className="text-muted-foreground mb-4">
            Clique no botão "Iniciar Análise Profunda" para começar a análise completa dos dados
          </p>
        </Card>
      )}
    </div>
  );
}

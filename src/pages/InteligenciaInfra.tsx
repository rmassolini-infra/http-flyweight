import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarDashboardAgregado, DashboardAgregado } from "@/services/dashboardService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Brain, TrendingUp, Network, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnaliseCorrelacao {
  titulo: string;
  descricao: string;
  nivel: "alto" | "medio" | "baixo";
  insights: string[];
}

interface AnaliseSetor {
  setor: string;
  municipios: number;
  potenciaTotal: number;
  despesaMedia: number;
  score: number;
}

const InteligenciaInfra = () => {
  const [data, setData] = useState<DashboardAgregado | null>(null);
  const [loading, setLoading] = useState(true);
  const [analises, setAnalises] = useState<AnaliseCorrelacao[]>([]);
  const [analiseSetorial, setAnaliseSetorial] = useState<AnaliseSetor[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await buscarDashboardAgregado();
        setData(result);
        
        // Processar análises
        processarAnalises(result);
        
        toast({
          title: "Análise concluída",
          description: "Dados integrados e processados com sucesso",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao processar análise",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const processarAnalises = (dashboardData: DashboardAgregado) => {
    // Análise de correlação entre energia e desenvolvimento
    const municipiosComGD = dashboardData.municipios.filter(m => m.potenciaGDkW > 0);
    const correlacaoEnergia: AnaliseCorrelacao = {
      titulo: "Correlação Energia Distribuída × Desenvolvimento Regional",
      descricao: "Análise da relação entre geração distribuída e indicadores municipais",
      nivel: municipiosComGD.length > 100 ? "alto" : "medio",
      insights: [
        `${municipiosComGD.length} municípios possuem geração distribuída ativa`,
        `Concentração em ${Math.round((municipiosComGD.length / dashboardData.municipios.length) * 100)}% dos municípios analisados`,
        "Padrão sugere correlação com desenvolvimento econômico regional",
      ],
    };

    // Análise de investimento público
    const totalDespesas = dashboardData.financasPublicas.despesasOrgaoAmostra.reduce(
      (sum, d) => sum + d.valorPago,
      0
    );
    const correlacaoInvestimento: AnaliseCorrelacao = {
      titulo: "Análise de Investimento Público em Infraestrutura",
      descricao: "Padrões de execução orçamentária e eficiência fiscal",
      nivel: totalDespesas > 0 ? "alto" : "baixo",
      insights: [
        `R$ ${(totalDespesas / 1000000000).toFixed(2)} bilhões em despesas analisadas`,
        `${dashboardData.financasPublicas.despesasOrgaoAmostra.length} órgãos em análise`,
        "Identificação de padrões de execução orçamentária",
      ],
    };

    // Análise de datasets disponíveis
    const totalDatasets =
      dashboardData.infraestrutura.datasetsDnit.length +
      dashboardData.infraestrutura.datasetsAntt.length;
    const correlacaoDatasets: AnaliseCorrelacao = {
      titulo: "Disponibilidade de Dados Abertos - Infraestrutura",
      descricao: "Análise da cobertura de dados públicos para planejamento",
      nivel: totalDatasets > 20 ? "alto" : "medio",
      insights: [
        `${totalDatasets} datasets disponíveis para análise`,
        `${dashboardData.infraestrutura.datasetsDnit.length} datasets DNIT (rodovias)`,
        `${dashboardData.infraestrutura.datasetsAntt.length} datasets ANTT (ferrovias)`,
      ],
    };

    setAnalises([correlacaoEnergia, correlacaoInvestimento, correlacaoDatasets]);

    // Análise setorial por UF
    const analiseUF: { [key: string]: AnaliseSetor } = {};
    
    dashboardData.municipios.forEach(m => {
      if (!analiseUF[m.uf]) {
        analiseUF[m.uf] = {
          setor: m.uf,
          municipios: 0,
          potenciaTotal: 0,
          despesaMedia: 0,
          score: 0,
        };
      }
      analiseUF[m.uf].municipios++;
      analiseUF[m.uf].potenciaTotal += m.potenciaGDkW;
    });

    const analiseSetorialArray = Object.values(analiseUF)
      .map(a => ({
        ...a,
        score: (a.potenciaTotal / a.municipios) * 0.7 + (a.municipios * 0.3),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setAnaliseSetorial(analiseSetorialArray);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Processando análise de inteligência...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Erro ao carregar análise</CardTitle>
            <CardDescription>Não foi possível processar os dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMunicipios = data.municipios.length;
  const municipiosComGD = data.municipios.filter(m => m.potenciaGDkW > 0).length;
  const taxaAdocaoGD = ((municipiosComGD / totalMunicipios) * 100).toFixed(1);
  const potenciaMedia = data.municipios.reduce((sum, m) => sum + m.potenciaGDkW, 0) / totalMunicipios;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Brain className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Inteligência Infra</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Plataforma de análise avançada integrando dados de múltiplas fontes públicas brasileiras.
              Análise preditiva, correlações e insights para tomada de decisão estratégica.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fontes Integradas</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(data.meta.fontes).filter(Boolean).length}
              </div>
              <p className="text-xs text-muted-foreground">APIs públicas conectadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura Nacional</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMunicipios}</div>
              <p className="text-xs text-muted-foreground">Municípios analisados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adoção GD</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaAdocaoGD}%</div>
              <p className="text-xs text-muted-foreground">Taxa de geração distribuída</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potência Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{potenciaMedia.toFixed(0)} kW</div>
              <p className="text-xs text-muted-foreground">Por município</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="correlacoes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="correlacoes">Correlações</TabsTrigger>
            <TabsTrigger value="setorial">Análise Setorial</TabsTrigger>
            <TabsTrigger value="insights">Insights Estratégicos</TabsTrigger>
          </TabsList>

          {/* Correlações Tab */}
          <TabsContent value="correlacoes" className="space-y-4">
            <div className="grid gap-4">
              {analises.map((analise, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{analise.titulo}</CardTitle>
                        <CardDescription>{analise.descricao}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          analise.nivel === "alto"
                            ? "default"
                            : analise.nivel === "medio"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        Relevância {analise.nivel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analise.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Análise Setorial Tab */}
          <TabsContent value="setorial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Estados - Score de Desenvolvimento Energético</CardTitle>
                <CardDescription>
                  Ranking baseado em potência instalada e número de municípios com GD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analiseSetorial.map((setor, idx) => (
                    <div
                      key={setor.setor}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{setor.setor}</p>
                          <p className="text-sm text-muted-foreground">
                            {setor.municipios} municípios
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {(setor.potenciaTotal / 1000).toFixed(1)} MW
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Score: {setor.score.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Estratégicos Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Análise Preditiva</AlertTitle>
              <AlertDescription>
                Baseado nos dados integrados de {totalMunicipios} municípios e múltiplas fontes governamentais
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Insights Estratégicos - Governo</CardTitle>
                <CardDescription>Aplicações para gestão pública e tomada de decisão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">Planejamento Energético</h4>
                    <p className="text-sm text-muted-foreground">
                      Identificação de regiões com baixa adoção de geração distribuída para
                      programas de incentivo e expansão da matriz energética descentralizada.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">Transparência Fiscal</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitoramento de execução orçamentária em tempo real para detecção de
                      anomalias e otimização de processos de compras públicas.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">Infraestrutura e Logística</h4>
                    <p className="text-sm text-muted-foreground">
                      Análise integrada de dados rodoviários e ferroviários para planejamento
                      de corredores logísticos e priorização de investimentos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights Estratégicos - Setor Privado</CardTitle>
                <CardDescription>Aplicações para análise de mercado e operações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-semibold mb-2">Análise de Mercado</h4>
                    <p className="text-sm text-muted-foreground">
                      Identificação de oportunidades de expansão em energia renovável com base
                      em dados de municípios e potencial de geração distribuída.
                    </p>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-semibold mb-2">Gestão de Risco</h4>
                    <p className="text-sm text-muted-foreground">
                      Correlação de dados financeiros públicos com indicadores regionais para
                      avaliação de risco em investimentos e financiamentos.
                    </p>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h4 className="font-semibold mb-2">Otimização Logística</h4>
                    <p className="text-sm text-muted-foreground">
                      Análise preditiva de infraestrutura de transporte para planejamento de
                      rotas, armazenagem e distribuição em manufatura e varejo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Meta Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Processado em</p>
                <p className="font-medium">{new Date(data.meta.geradoEm).toLocaleString("pt-BR")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">IBGE</p>
                <p className="font-medium">{data.meta.fontes.ibge ? "✓ Ativo" : "✗ Inativo"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ANEEL</p>
                <p className="font-medium">{data.meta.fontes.aneel ? "✓ Ativo" : "✗ Inativo"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Portal Transparência</p>
                <p className="font-medium">
                  {data.meta.fontes.portalTransparencia ? "✓ Ativo" : "✗ Inativo"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Dados Abertos</p>
                <p className="font-medium">{data.meta.fontes.dadosGov ? "✓ Ativo" : "✗ Inativo"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteligenciaInfra;

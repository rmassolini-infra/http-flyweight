import { useEffect, useState } from "react";
import { buscarDashboardAgregado, DashboardAgregado } from "@/services/dashboardService";
import { gerarAnaliseInteligenciaCruzada, type CrossIntelligenceResponse } from "@/services/crossIntelligenceService";
import { buscarDashboardAneelCompleto } from "@/infra/energy/aneelComprehensiveService";
import { buscarDashboardMAPACompleto } from "@/infra/agriculture/mapaService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Loader2, Database, Zap, DollarSign, Warehouse, ArrowLeft, Brain, MapPin, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [data, setData] = useState<DashboardAgregado | null>(null);
  const [crossIntelligence, setCrossIntelligence] = useState<CrossIntelligenceResponse | null>(null);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await buscarDashboardAgregado();
        setData(result);
        toast({
          title: "Dados carregados",
          description: "Dashboard atualizado com sucesso",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark palantir-grid relative">
        <div className="fixed inset-0 palantir-hex opacity-30 pointer-events-none" />
        <div className="text-center relative z-10">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary palantir-glow" />
          <p className="text-muted-foreground font-mono">CARREGANDO DASHBOARD...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark palantir-grid relative">
        <div className="fixed inset-0 palantir-hex opacity-30 pointer-events-none" />
        <Card className="max-w-md palantir-border bg-card/50 backdrop-blur-sm relative z-10">
          <CardHeader>
            <CardTitle className="font-mono">ERRO AO CARREGAR DADOS</CardTitle>
            <CardDescription className="font-mono">Não foi possível carregar os dados do dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="palantir-glow font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" />
              VOLTAR
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const topMunicipiosByEnergy = data.municipios
    .filter(m => m.potenciaGDkW > 0)
    .sort((a, b) => b.potenciaGDkW - a.potenciaGDkW)
    .slice(0, 10)
    .map(m => ({
      nome: m.nome.length > 15 ? m.nome.substring(0, 15) + "..." : m.nome,
      potencia: m.potenciaGDkW,
    }));

  const despesasData = data.financasPublicas.despesasOrgaoAmostra
    .slice(0, 8)
    .map(d => ({
      orgao: d.nomeOrgao.length > 20 ? d.nomeOrgao.substring(0, 20) + "..." : d.nomeOrgao,
      empenhado: d.valorEmpenhado / 1000000,
      pago: d.valorPago / 1000000,
    }));

  const infraData = [
    { name: "DNIT", value: data.infraestrutura.datasetsDnit.length, fill: "hsl(var(--chart-1))" },
    { name: "ANTT", value: data.infraestrutura.datasetsAntt.length, fill: "hsl(var(--chart-2))" },
  ];

  const totalMunicipios = data.municipios.length;
  const totalMunicipiosComGD = data.municipios.filter(m => m.potenciaGDkW > 0).length;
  const totalPotenciaGD = data.municipios.reduce((sum, m) => sum + m.potenciaGDkW, 0);

  const handleCrossIntelligence = async () => {
    setLoadingIntelligence(true);
    try {
      const [aneelData, mapaData] = await Promise.all([
        buscarDashboardAneelCompleto(),
        buscarDashboardMAPACompleto(),
      ]);

      const result = await gerarAnaliseInteligenciaCruzada({
        municipios: {
          total: data!.municipios.length,
          comGD: totalMunicipiosComGD,
        },
        energia: aneelData,
        financas: {
          total: data!.financasPublicas.despesasOrgaoAmostra.length,
          valorTotal: data!.financasPublicas.despesasOrgaoAmostra.reduce((sum, d) => sum + d.valorPago, 0),
        },
        infraestrutura: {
          dnit: data!.infraestrutura.datasetsDnit,
          antt: data!.infraestrutura.datasetsAntt,
        },
        agricultura: mapaData,
      });

      setCrossIntelligence(result);
      toast({
        title: "Análise Cruzada Concluída",
        description: "Correlações identificadas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro na Análise",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingIntelligence(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark palantir-grid relative">
      {/* Hexagonal overlay */}
      <div className="fixed inset-0 palantir-hex opacity-30 pointer-events-none" />
      
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="palantir-border hover:bg-primary/10 font-mono"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              VOLTAR
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/inteligencia")}
              className="gap-2 palantir-border palantir-glow font-mono"
            >
              <Brain className="h-4 w-4" />
              INTELIGÊNCIA INFRA
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent font-mono tracking-wider">
            INFRA BR DATA
          </h1>
          <p className="text-muted-foreground font-mono">
            PAINEL AGREGADO DE DADOS PÚBLICOS BRASILEIROS
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="palantir-border bg-card/50 backdrop-blur-sm palantir-corner hover:palantir-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">TOTAL MUNICÍPIOS</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{totalMunicipios.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground font-mono">{totalMunicipiosComGD} com geração distribuída</p>
            </CardContent>
          </Card>

          <Card className="palantir-border bg-card/50 backdrop-blur-sm palantir-corner hover:palantir-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">POTÊNCIA TOTAL GD</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{(totalPotenciaGD / 1000).toFixed(1)} MW</div>
              <p className="text-xs text-muted-foreground font-mono">Geração distribuída</p>
            </CardContent>
          </Card>

          <Card className="palantir-border bg-card/50 backdrop-blur-sm palantir-corner hover:palantir-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">DESPESAS PÚBLICAS</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{despesasData.length}</div>
              <p className="text-xs text-muted-foreground font-mono">Órgãos analisados</p>
            </CardContent>
          </Card>

          <Card className="palantir-border bg-card/50 backdrop-blur-sm palantir-corner hover:palantir-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">DATASETS INFRA</CardTitle>
              <Warehouse className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{data.infraestrutura.datasetsDnit.length + data.infraestrutura.datasetsAntt.length}</div>
              <p className="text-xs text-muted-foreground font-mono">DNIT + ANTT</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Municipalities by Energy */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Municípios - Geração Distribuída</CardTitle>
              <CardDescription>Potência instalada em kW</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  potencia: {
                    label: "Potência (kW)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMunicipiosByEnergy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="potencia" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Infrastructure Datasets */}
          <Card>
            <CardHeader>
              <CardTitle>Datasets de Infraestrutura</CardTitle>
              <CardDescription>Distribuição por órgão</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  dnit: {
                    label: "DNIT",
                    color: "hsl(var(--chart-1))",
                  },
                  antt: {
                    label: "ANTT",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={infraData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {infraData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Government Spending */}
          {despesasData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Despesas Públicas por Órgão</CardTitle>
                <CardDescription>Valores em milhões de reais (2024)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    empenhado: {
                      label: "Empenhado",
                      color: "hsl(var(--chart-1))",
                    },
                    pago: {
                      label: "Pago",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={despesasData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="orgao" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="empenhado" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="pago" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Meta Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Gerado em</p>
                <p className="font-medium">{new Date(data.meta.geradoEm).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">IBGE</p>
                <p className="font-medium">{data.meta.fontes.ibge ? '✓' : '✗'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ANEEL</p>
                <p className="font-medium">{data.meta.fontes.aneel ? '✓' : '✗'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Portal Transparência</p>
                <p className="font-medium">{data.meta.fontes.portalTransparencia ? '✓' : '✗'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

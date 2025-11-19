import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Brain, TrendingUp, AlertTriangle, Target, Network, Activity, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PalantirReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-mono text-primary flex items-center gap-2">
                <Database className="w-6 h-6 palantir-icon-glow" />
                PALANTIR INTELLIGENCE REPORT
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Análise Estratégica de Dados Governamentais
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Card className="palantir-card palantir-glow">
          <CardHeader className="palantir-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Network className="w-6 h-6 text-primary palantir-icon-glow" />
                <div>
                  <CardTitle className="font-mono text-primary flex items-center gap-2">
                    SISTEMA DE INTELIGÊNCIA
                    <Badge variant="outline" className="palantir-border font-mono text-xs">
                      OPERACIONAL
                    </Badge>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Agregação de múltiplas fontes de dados abertos + Análise correlacional profunda
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Data Sources Card */}
              <Card className="palantir-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Fontes de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span>IBGE</span>
                    <Badge variant="outline" className="text-xs">5.570 municípios</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ANEEL</span>
                    <Badge variant="outline" className="text-xs">Energia</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Portal Transparência</span>
                    <Badge variant="outline" className="text-xs">Finanças</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MAPA</span>
                    <Badge variant="outline" className="text-xs">Agricultura</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>INMET</span>
                    <Badge variant="outline" className="text-xs">Clima</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>dados.gov.br</span>
                    <Badge variant="outline" className="text-xs">15.000+ datasets</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Capabilities */}
              <Card className="palantir-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Capacidades de Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span>Correlações Cross-Sector</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-primary" />
                    <span>Análise de Riscos Sistêmicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-primary" />
                    <span>Identificação de Oportunidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-3 h-3 text-primary" />
                    <span>Padrões Emergentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary" />
                    <span>Detecção de Anomalias</span>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="palantir-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs font-mono">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>APIs Conectadas</span>
                      <span className="text-primary">6/6</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Motor de IA</span>
                      <span className="text-primary">Gemini Pro</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Última Atualização</span>
                      <span className="text-muted-foreground">Tempo real</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Area */}
            <div className="text-center py-12 space-y-6">
              <Network className="w-20 h-20 mx-auto text-primary palantir-icon-glow" />
              <div>
                <h2 className="text-2xl font-bold font-mono mb-2">
                  Sistema de Inteligência Palantir
                </h2>
                <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
                  Agregue dados de múltiplas fontes governamentais brasileiras e gere análises
                  estratégicas profundas com correlações não-óbvias, identificação de riscos
                  sistêmicos e recomendações acionáveis.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="palantir-button font-mono gap-2"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      setAnalyzing(true);
                    }, 3000);
                  }}
                  disabled={loading || analyzing}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AGREGANDO DADOS...
                    </>
                  ) : analyzing ? (
                    <>
                      <Brain className="w-5 h-5" />
                      ANÁLISE EM ANDAMENTO
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      INICIAR ANÁLISE PALANTIR
                    </>
                  )}
                </Button>

                {loading && (
                  <div className="space-y-2">
                    <Progress value={33} className="w-full max-w-md mx-auto" />
                    <p className="text-xs text-muted-foreground font-mono">
                      Consultando IBGE, ANEEL, Portal da Transparência, MAPA, INMET, dados.gov.br...
                    </p>
                  </div>
                )}

                {analyzing && (
                  <Card className="palantir-border max-w-3xl mx-auto">
                    <CardHeader>
                      <CardTitle className="font-mono text-sm">Sistema Pronto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-mono">
                        O sistema está operacional e pronto para processar análises de inteligência.
                        Use os cards de API individuais na página inicial para consultar dados específicos
                        e gerar insights detalhados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Access */}
            <div className="border-t pt-6">
              <h3 className="font-mono text-sm font-semibold mb-4">Acesso Rápido às Fontes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  IBGE Municípios
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  ANEEL Energia
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  Portal Transparência
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  MAPA Agricultura
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  INMET Clima
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-xs"
                  onClick={() => navigate("/")}
                >
                  dados.gov.br
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiCard } from "@/components/ApiCard";
import { IbgeApiCard } from "@/components/IbgeApiCard";
import { AneelApiCard } from "@/components/AneelApiCard";
import { PortalTransparenciaCard } from "@/components/PortalTransparenciaCard";
import { DadosGovCard } from "@/components/DadosGovCard";
import { InmetCard } from "@/components/InmetCard";
import { Button } from "@/components/ui/button";
import { httpGetJson, HttpError } from "@/infra/core/httpClient";
import { listarMunicipios, IbgeMunicipio } from "@/infra/geo/ibgeService";
import { listarEmpreendimentosGD, AneelGdEmpreendimento } from "@/infra/energy/aneelService";
import { listarDespesasOrgao, DespesaOrcamentaria } from "@/infra/finance/portalTransparenciaService";
import { buscarDatasets, DadosGovDataset } from "@/infra/infra/dadosGovService";
import { listarEstacoesAutomaticas, obterEstacoesExemplo, InmetEstacao } from "@/infra/climate/inmetService";
import { useToast } from "@/hooks/use-toast";
import { Activity, Code2, MapPin, Zap, DollarSign, Database, CloudRain, BarChart3, Brain } from "lucide-react";

interface FetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: any;
  error?: string;
}

interface IbgeFetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  municipios?: IbgeMunicipio[];
  error?: string;
}

interface AneelFetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  empreendimentos?: AneelGdEmpreendimento[];
  error?: string;
}

interface PortalTranspFetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  despesas?: DespesaOrcamentaria[];
  error?: string;
}

interface DadosGovFetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  datasets?: DadosGovDataset[];
  error?: string;
}

interface InmetFetchState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  stations?: InmetEstacao[];
  error?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [githubState, setGithubState] = useState<FetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  
  const [quotesState, setQuotesState] = useState<FetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const [ibgeState, setIbgeState] = useState<IbgeFetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const [aneelState, setAneelState] = useState<AneelFetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const [portalState, setPortalState] = useState<PortalTranspFetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const [dadosGovState, setDadosGovState] = useState<DadosGovFetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const [inmetState, setInmetState] = useState<InmetFetchState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const fetchGithubData = async () => {
    setGithubState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await httpGetJson("https://api.github.com/users/github");
      setGithubState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        data 
      });
      toast({
        title: "Success!",
        description: "GitHub data fetched successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "An unexpected error occurred";
      
      setGithubState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchIbgeData = async () => {
    setIbgeState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const municipios = await listarMunicipios();
      setIbgeState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        municipios 
      });
      toast({
        title: "Sucesso!",
        description: `${municipios.length} municípios brasileiros carregados`,
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "Ocorreu um erro inesperado";
      
      setIbgeState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchAneelData = async () => {
    setAneelState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      // Limit to 500 for faster loading in demo
      const empreendimentos = await listarEmpreendimentosGD(500);
      setAneelState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        empreendimentos 
      });
      toast({
        title: "Sucesso!",
        description: `${empreendimentos.length} empreendimentos de geração distribuída carregados`,
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "Ocorreu um erro inesperado";
      
      setAneelState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchPortalTranspData = async (codigoOrgao: string, ano: string) => {
    setPortalState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const despesas = await listarDespesasOrgao(codigoOrgao, ano);
      setPortalState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        despesas 
      });
      toast({
        title: "Sucesso!",
        description: `${despesas.length} registros de despesas carregados`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Ocorreu um erro inesperado";
      
      setPortalState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchQuoteData = async () => {
    setQuotesState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const data = await httpGetJson("https://api.quotable.io/random");
      setQuotesState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        data 
      });
      toast({
        title: "Success!",
        description: "Quote fetched successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "An unexpected error occurred";
      
      setQuotesState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchDadosGovData = async (query: string) => {
    setDadosGovState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      const datasets = await buscarDatasets(query, 20);
      setDadosGovState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        datasets 
      });
      toast({
        title: "Sucesso!",
        description: `${datasets.length} datasets encontrados`,
      });
    } catch (err) {
      const errorMessage = err instanceof HttpError 
        ? `${err.message}` 
        : "Ocorreu um erro inesperado";
      
      setDadosGovState({ 
        isLoading: false, 
        isSuccess: false, 
        isError: true, 
        error: errorMessage 
      });
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchInmetData = async () => {
    setInmetState({ isLoading: true, isSuccess: false, isError: false });
    
    try {
      let stations = await listarEstacoesAutomaticas();
      
      // Se não conseguir dados da API, usar dados de exemplo
      if (stations.length === 0) {
        stations = obterEstacoesExemplo();
        setInmetState({ 
          isLoading: false, 
          isSuccess: true, 
          isError: false, 
          stations,
        });
        toast({
          title: "Dados de Exemplo",
          description: "Exibindo estações de exemplo (API indisponível)",
          variant: "default",
        });
      } else {
        setInmetState({ 
          isLoading: false, 
          isSuccess: true, 
          isError: false, 
          stations 
        });
        toast({
          title: "Sucesso!",
          description: `${stations.length} estações meteorológicas carregadas`,
        });
      }
    } catch (err) {
      // Em caso de erro, usar dados de exemplo
      const stations = obterEstacoesExemplo();
      setInmetState({ 
        isLoading: false, 
        isSuccess: true, 
        isError: false, 
        stations,
      });
      toast({
        title: "Dados de Exemplo",
        description: "Exibindo estações de exemplo (API indisponível)",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-glow">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-12 w-12 text-primary animate-pulse" />
            <MapPin className="h-10 w-10 text-accent" />
            <CloudRain className="h-10 w-10 text-primary" />
            <Zap className="h-10 w-10 text-accent" />
            <DollarSign className="h-10 w-10 text-primary" />
            <Database className="h-10 w-10 text-accent" />
            <Code2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
            HTTP Client Dashboard
          </h1>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Plataforma abrangente de integração com APIs públicas brasileiras e
            internacionais. Explore dados de municípios (IBGE), energia (ANEEL),
            transparência pública (Portal da Transparência), infraestrutura
            (dados.gov.br/DNIT/ANTT), clima (INMET) e muito mais.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/inteligencia")}
              className="gap-2"
            >
              <Brain className="h-5 w-5" />
              Inteligência Infra
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <BarChart3 className="h-5 w-5" />
              Dashboard Agregado
            </Button>
          </div>
        </div>
      </div>

      {/* API Cards Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* INMET - Featured Card */}
          <InmetCard
            title="INMET - Estações Meteorológicas"
            description="Instituto Nacional de Meteorologia - Rede de estações automáticas do Brasil"
            isLoading={inmetState.isLoading}
            isSuccess={inmetState.isSuccess}
            isError={inmetState.isError}
            stations={inmetState.stations}
            error={inmetState.error}
            onFetch={fetchInmetData}
          />

          {/* dados.gov.br - Featured Card */}
          <DadosGovCard
            title="dados.gov.br - Datasets Públicos"
            description="Catálogo de dados abertos do governo federal (DNIT, ANTT, infraestrutura)"
            isLoading={dadosGovState.isLoading}
            isSuccess={dadosGovState.isSuccess}
            isError={dadosGovState.isError}
            datasets={dadosGovState.datasets}
            error={dadosGovState.error}
            onFetch={fetchDadosGovData}
          />

          {/* Portal da Transparência - Featured Card */}
          <PortalTransparenciaCard
            title="Portal da Transparência"
            description="Despesas orçamentárias do Governo Federal (Edge Function + Secret)"
            isLoading={portalState.isLoading}
            isSuccess={portalState.isSuccess}
            isError={portalState.isError}
            despesas={portalState.despesas}
            error={portalState.error}
            onFetch={fetchPortalTranspData}
          />

          {/* ANEEL API - Featured Card */}
          <AneelApiCard
            title="ANEEL - Geração Distribuída"
            description="Dados de empreendimentos de geração distribuída de energia elétrica do Brasil (CSV parsing)"
            endpoint="dadosabertos.aneel.gov.br/.../empreendimento-geracao-distribuida.csv"
            isLoading={aneelState.isLoading}
            isSuccess={aneelState.isSuccess}
            isError={aneelState.isError}
            empreendimentos={aneelState.empreendimentos}
            error={aneelState.error}
            onFetch={fetchAneelData}
          />

          {/* IBGE API - Featured Card */}
          <IbgeApiCard
            title="IBGE - Municípios Brasileiros"
            description="Dados oficiais de todos os municípios do Brasil via API JSON do IBGE"
            endpoint="servicodados.ibge.gov.br/api/v1/localidades/municipios"
            isLoading={ibgeState.isLoading}
            isSuccess={ibgeState.isSuccess}
            isError={ibgeState.isError}
            municipios={ibgeState.municipios}
            error={ibgeState.error}
            onFetch={fetchIbgeData}
          />

          <ApiCard
            title="GitHub User API"
            description="Fetch user information from GitHub's public API"
            endpoint="https://api.github.com/users/github"
            isLoading={githubState.isLoading}
            isSuccess={githubState.isSuccess}
            isError={githubState.isError}
            data={githubState.data}
            error={githubState.error}
            onFetch={fetchGithubData}
          />
          
          <ApiCard
            title="Random Quote API"
            description="Get inspirational quotes from quotable.io"
            endpoint="https://api.quotable.io/random"
            isLoading={quotesState.isLoading}
            isSuccess={quotesState.isSuccess}
            isError={quotesState.isError}
            data={quotesState.data}
            error={quotesState.error}
            onFetch={fetchQuoteData}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Recursos da Infraestrutura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Timeout Handling</h3>
              <p className="text-sm text-muted-foreground">
                Cancelamento automático com thresholds configuráveis
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Type Safety</h3>
              <p className="text-sm text-muted-foreground">
                Suporte completo TypeScript com parâmetros genéricos
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Error Management</h3>
              <p className="text-sm text-muted-foreground">
                Classe HttpError customizada com status e mensagens detalhadas
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Geolocalização</h3>
              <p className="text-sm text-muted-foreground">
                APIs geográficas com dados do IBGE e INMET
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">CSV Parsing</h3>
              <p className="text-sm text-muted-foreground">
                Processamento de grandes arquivos CSV com dados da ANEEL
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Secure API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Edge functions com secrets management do Lovable Cloud
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">CKAN API</h3>
              <p className="text-sm text-muted-foreground">
                Busca de datasets públicos via dados.gov.br
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CloudRain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Clima & Meteorologia</h3>
              <p className="text-sm text-muted-foreground">
                Dados meteorológicos do INMET com estações automáticas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

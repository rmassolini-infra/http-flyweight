/**
 * Serviço completo para consumir dados do Portal Brasileiro de Dados Abertos
 * Máxima agregação de dados + análise profunda
 */

export interface DadosGovDataset {
  id: string;
  title: string;
  organization: string;
  resources: number;
  tags: string[];
  metadata_modified: string;
}

export interface InfraDashboard {
  economia: {
    total: number;
    datasets: DadosGovDataset[];
  };
  saude: {
    total: number;
    datasets: DadosGovDataset[];
  };
  educacao: {
    total: number;
    datasets: DadosGovDataset[];
  };
  seguranca: {
    total: number;
    datasets: DadosGovDataset[];
  };
  meioAmbiente: {
    total: number;
    datasets: DadosGovDataset[];
  };
  transportes: {
    total: number;
    datasets: DadosGovDataset[];
  };
  trabalho: {
    total: number;
    datasets: DadosGovDataset[];
  };
  turismo: {
    total: number;
    datasets: DadosGovDataset[];
  };
  meta: {
    totalDatasets: number;
    categorias: number;
    dataColeta: string;
    organizacoes?: string[];
    cobertura?: string;
  };
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Busca datasets por categoria usando edge function proxy
 */
async function buscarPorCategoria(query: string, rows = 100): Promise<DadosGovDataset[]> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/dados-gov-proxy`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        type: 'category',
        query,
        rows,
      }),
    });
    
    if (!response.ok) {
      console.warn(`Erro ao buscar categoria "${query}": ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const results = data.result?.results || [];
    
    return results.map((ds: any) => ({
      id: ds.id,
      title: ds.title,
      organization: ds.organization?.title || "N/A",
      resources: ds.resources?.length || 0,
      tags: ds.tags?.map((t: any) => t.name) || [],
      metadata_modified: ds.metadata_modified || "",
    }));
  } catch (error) {
    console.error(`Erro ao buscar categoria "${query}":`, error);
    return [];
  }
}

/**
 * Busca datasets das principais organizações usando edge function proxy
 */
async function buscarPorOrganizacao(org: string, rows = 50): Promise<DadosGovDataset[]> {
  try {
    const url = `${SUPABASE_URL}/functions/v1/dados-gov-proxy`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        type: 'organization',
        query: org,
        rows,
      }),
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const results = data.result?.results || [];
    
    return results.map((ds: any) => ({
      id: ds.id,
      title: ds.title,
      organization: ds.organization?.title || org,
      resources: ds.resources?.length || 0,
      tags: ds.tags?.map((t: any) => t.name) || [],
      metadata_modified: ds.metadata_modified || "",
    }));
  } catch (error) {
    console.error(`Erro ao buscar organização "${org}":`, error);
    return [];
  }
}

/**
 * Agrega TODOS os dados possíveis do dados.gov.br em categorias
 * Máxima cobertura de dados
 */
export async function buscarDashboardInfra(): Promise<InfraDashboard> {
  console.log("Iniciando agregação COMPLETA de dados.gov.br...");

  // Buscar datasets por categorias temáticas principais (MÁXIMA COBERTURA)
  const [
    economia,
    saude,
    educacao,
    seguranca,
    meioAmbiente,
    transportes,
    trabalho,
    turismo,
  ] = await Promise.all([
    buscarPorCategoria("economia OR PIB OR inflação OR emprego OR renda OR IPCA OR mercado OR exportação OR importação", 500),
    buscarPorCategoria("saúde OR hospital OR SUS OR vacina OR COVID OR epidemia OR medicamento OR saúde pública", 500),
    buscarPorCategoria("educação OR escola OR universidade OR ENEM OR MEC OR ensino OR professor OR aluno OR IDEB", 500),
    buscarPorCategoria("segurança OR crime OR polícia OR violência OR homicídio OR roubo OR furto", 300),
    buscarPorCategoria("meio ambiente OR desmatamento OR clima OR IBAMA OR poluição OR biodiversidade OR água OR floresta", 300),
    buscarPorCategoria("transporte OR rodovia OR DNIT OR ANTT OR aeroporto OR porto OR ferrovia OR mobilidade OR trânsito", 300),
    buscarPorCategoria("trabalho OR emprego OR CAGED OR carteira assinada OR desemprego OR salário OR sindicato", 300),
    buscarPorCategoria("turismo OR hotel OR visitantes OR patrimônio OR cultura OR lazer", 200),
  ]);

  // Buscar também por organizações chave (para complementar) - MÁXIMA COBERTURA
  const [
    ibge,
    dnit,
    mec,
    saude_org,
    mme,
    antt,
    mapa,
    aneel,
    anac,
    anp,
    funai,
    incra,
    inpe,
    icmbio,
  ] = await Promise.all([
    buscarPorOrganizacao("instituto-brasileiro-de-geografia-e-estatistica-ibge", 200),
    buscarPorOrganizacao("departamento-nacional-de-infraestrutura-de-transportes-dnit", 150),
    buscarPorOrganizacao("ministerio-da-educacao", 150),
    buscarPorOrganizacao("ministerio-da-saude", 200),
    buscarPorOrganizacao("ministerio-de-minas-e-energia", 150),
    buscarPorOrganizacao("agencia-nacional-de-transportes-terrestres-antt", 150),
    buscarPorOrganizacao("ministerio-da-agricultura-pecuaria-e-abastecimento", 150),
    buscarPorOrganizacao("agencia-nacional-de-energia-eletrica-aneel", 150),
    buscarPorOrganizacao("agencia-nacional-de-aviacao-civil-anac", 100),
    buscarPorOrganizacao("agencia-nacional-do-petroleo-gas-natural-e-biocombustiveis-anp", 100),
    buscarPorOrganizacao("fundacao-nacional-do-indio-funai", 100),
    buscarPorOrganizacao("instituto-nacional-de-colonizacao-e-reforma-agraria-incra", 100),
    buscarPorOrganizacao("instituto-nacional-de-pesquisas-espaciais-inpe", 100),
    buscarPorOrganizacao("instituto-chico-mendes-de-conservacao-da-biodiversidade-icmbio", 100),
  ]);

  // Consolidar datasets únicos (remover duplicatas por ID)
  const consolidarDatasets = (...arrays: DadosGovDataset[][]): DadosGovDataset[] => {
    const map = new Map<string, DadosGovDataset>();
    arrays.forEach(arr => {
      arr.forEach(ds => map.set(ds.id, ds));
    });
    return Array.from(map.values());
  };

  const economiaCons = consolidarDatasets(economia, ibge, anp);
  const saudeCons = consolidarDatasets(saude, saude_org);
  const educacaoCons = consolidarDatasets(educacao, mec);
  const transportesCons = consolidarDatasets(transportes, dnit, antt, anac);
  const meioAmbienteCons = consolidarDatasets(meioAmbiente, icmbio, inpe);
  const energiaCons = consolidarDatasets(aneel, mme);

  const totalDatasets = 
    economiaCons.length + 
    saudeCons.length + 
    educacaoCons.length + 
    seguranca.length + 
    meioAmbienteCons.length + 
    transportesCons.length + 
    trabalho.length + 
    turismo.length +
    energiaCons.length +
    funai.length +
    incra.length;

  console.log(`Agregação COMPLETA concluída: ${totalDatasets} datasets únicos coletados de ${14} organizações governamentais`);

  return {
    economia: {
      total: economiaCons.length,
      datasets: economiaCons,
    },
    saude: {
      total: saudeCons.length,
      datasets: saudeCons,
    },
    educacao: {
      total: educacaoCons.length,
      datasets: educacaoCons,
    },
    seguranca: {
      total: seguranca.length,
      datasets: seguranca,
    },
    meioAmbiente: {
      total: meioAmbienteCons.length,
      datasets: meioAmbienteCons,
    },
    transportes: {
      total: transportesCons.length,
      datasets: transportesCons,
    },
    trabalho: {
      total: trabalho.length,
      datasets: trabalho,
    },
    turismo: {
      total: turismo.length,
      datasets: turismo,
    },
    meta: {
      totalDatasets,
      categorias: 8,
      dataColeta: new Date().toISOString(),
      organizacoes: ["IBGE", "DNIT", "MEC", "MS", "MME", "ANTT", "MAPA", "ANEEL", "ANAC", "ANP", "FUNAI", "INCRA", "INPE", "ICMBio"],
      cobertura: "Máxima - 14 organizações governamentais",
    },
  };
}

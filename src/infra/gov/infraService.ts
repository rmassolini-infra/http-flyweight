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
  };
}

const DADOS_GOV_BASE = "https://dados.gov.br/api/3/action";

/**
 * Busca datasets por categoria usando edge function
 */
async function buscarPorCategoria(query: string, rows = 100): Promise<DadosGovDataset[]> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `${supabaseUrl}/functions/v1/dados-gov-search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ 
        type: 'category',
        query,
        rows 
      }),
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar categoria "${query}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.success ? data.results : [];
  } catch (error) {
    console.error(`Erro ao buscar categoria "${query}":`, error);
    return [];
  }
}

/**
 * Busca datasets das principais organizações usando edge function
 */
async function buscarPorOrganizacao(org: string, rows = 50): Promise<DadosGovDataset[]> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `${supabaseUrl}/functions/v1/dados-gov-search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ 
        type: 'organization',
        org,
        rows 
      }),
    });

    if (!response.ok) {
      console.warn(`Erro ao buscar organização "${org}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.success ? data.results : [];
  } catch (error) {
    console.error(`Erro ao buscar organização "${org}":`, error);
    return [];
  }
}

/**
 * Sincroniza dados do dados.gov.br para o cache
 */
async function sincronizarCache(): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/sync-dados-gov`;

  const categories = [
    { query: "economia OR PIB OR inflação OR emprego OR renda", rows: 150 },
    { query: "saúde OR hospital OR SUS OR vacina OR COVID", rows: 150 },
    { query: "educação OR escola OR universidade OR ENEM OR MEC", rows: 150 },
    { query: "segurança OR crime OR polícia OR violência", rows: 100 },
    { query: "meio ambiente OR desmatamento OR clima OR IBAMA", rows: 100 },
    { query: "transporte OR rodovia OR DNIT OR ANTT OR aeroporto", rows: 100 },
    { query: "trabalho OR emprego OR CAGED OR carteira assinada", rows: 100 },
    { query: "turismo OR hotel OR visitantes OR patrimônio", rows: 80 },
  ];

  const organizations = [
    { org: "instituto-brasileiro-de-geografia-e-estatistica-ibge", rows: 50 },
    { org: "departamento-nacional-de-infraestrutura-de-transportes-dnit", rows: 50 },
    { org: "ministerio-da-educacao", rows: 50 },
    { org: "ministerio-da-saude", rows: 50 },
    { org: "ministerio-de-minas-e-energia", rows: 50 },
    { org: "agencia-nacional-de-transportes-terrestres-antt", rows: 50 },
    { org: "ministerio-da-agricultura-pecuaria-e-abastecimento", rows: 50 },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ categories, organizations, forceSync: true }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao sincronizar cache: ${response.status}`);
  }

  const result = await response.json();
  console.log('Sincronização:', result);
}

/**
 * Agrega TODOS os dados possíveis do dados.gov.br em categorias
 * Máxima cobertura de dados com cache inteligente
 */
export async function buscarDashboardInfra(): Promise<InfraDashboard> {
  console.log("Iniciando agregação de dados.gov.br...");

  // Iniciar sincronização do cache em background (não aguardar)
  sincronizarCache().catch(err => console.warn('Cache sync error:', err));

  // Buscar datasets por categorias temáticas principais
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
    buscarPorCategoria("economia OR PIB OR inflação OR emprego OR renda", 150),
    buscarPorCategoria("saúde OR hospital OR SUS OR vacina OR COVID", 150),
    buscarPorCategoria("educação OR escola OR universidade OR ENEM OR MEC", 150),
    buscarPorCategoria("segurança OR crime OR polícia OR violência", 100),
    buscarPorCategoria("meio ambiente OR desmatamento OR clima OR IBAMA", 100),
    buscarPorCategoria("transporte OR rodovia OR DNIT OR ANTT OR aeroporto", 100),
    buscarPorCategoria("trabalho OR emprego OR CAGED OR carteira assinada", 100),
    buscarPorCategoria("turismo OR hotel OR visitantes OR patrimônio", 80),
  ]);

  // Buscar também por organizações chave (para complementar)
  const [
    ibge,
    dnit,
    mec,
    saude_org,
    mme,
    antt,
    mapa,
  ] = await Promise.all([
    buscarPorOrganizacao("instituto-brasileiro-de-geografia-e-estatistica-ibge", 50),
    buscarPorOrganizacao("departamento-nacional-de-infraestrutura-de-transportes-dnit", 50),
    buscarPorOrganizacao("ministerio-da-educacao", 50),
    buscarPorOrganizacao("ministerio-da-saude", 50),
    buscarPorOrganizacao("ministerio-de-minas-e-energia", 50),
    buscarPorOrganizacao("agencia-nacional-de-transportes-terrestres-antt", 50),
    buscarPorOrganizacao("ministerio-da-agricultura-pecuaria-e-abastecimento", 50),
  ]);

  // Consolidar datasets únicos (remover duplicatas por ID)
  const consolidarDatasets = (...arrays: DadosGovDataset[][]): DadosGovDataset[] => {
    const map = new Map<string, DadosGovDataset>();
    arrays.forEach(arr => {
      arr.forEach(ds => map.set(ds.id, ds));
    });
    return Array.from(map.values());
  };

  const economiaCons = consolidarDatasets(economia, ibge);
  const saudeCons = consolidarDatasets(saude, saude_org);
  const educacaoCons = consolidarDatasets(educacao, mec);
  const transportesCons = consolidarDatasets(transportes, dnit, antt);

  const totalDatasets = 
    economiaCons.length + 
    saudeCons.length + 
    educacaoCons.length + 
    seguranca.length + 
    meioAmbiente.length + 
    transportesCons.length + 
    trabalho.length + 
    turismo.length;

  console.log(`Agregação concluída: ${totalDatasets} datasets únicos coletados`);

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
      total: meioAmbiente.length,
      datasets: meioAmbiente,
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
    },
  };
}

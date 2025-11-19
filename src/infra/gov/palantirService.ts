/**
 * Serviço completo para consumir dados do Portal Brasileiro de Dados Abertos
 * Estilo Palantir: máxima agregação de dados + análise profunda
 */

export interface DadosGovDataset {
  id: string;
  title: string;
  organization: string;
  resources: number;
  tags: string[];
  metadata_modified: string;
}

export interface PalantirDashboard {
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
 * Busca datasets por categoria
 */
async function buscarPorCategoria(query: string, rows = 100): Promise<DadosGovDataset[]> {
  try {
    const url = `${DADOS_GOV_BASE}/package_search?q=${encodeURIComponent(query)}&rows=${rows}`;
    const response = await fetch(url);
    
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
 * Busca datasets das principais organizações
 */
async function buscarPorOrganizacao(org: string, rows = 50): Promise<DadosGovDataset[]> {
  try {
    const url = `${DADOS_GOV_BASE}/package_search?fq=organization:${encodeURIComponent(org)}&rows=${rows}`;
    const response = await fetch(url);
    
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
 * Estilo Palantir: máxima cobertura de dados
 */
export async function buscarDashboardPalantir(): Promise<PalantirDashboard> {
  console.log("Iniciando agregação estilo Palantir de dados.gov.br...");

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

  // Também buscar por principais organizações governamentais
  const [ibge, mapa, mme, ms, mec, dnit, antt] = await Promise.all([
    buscarPorOrganizacao("instituto-brasileiro-de-geografia-e-estatistica-ibge", 50),
    buscarPorOrganizacao("ministerio-da-agricultura-pecuaria-e-abastecimento", 50),
    buscarPorOrganizacao("ministerio-de-minas-e-energia", 50),
    buscarPorOrganizacao("ministerio-da-saude", 50),
    buscarPorOrganizacao("ministerio-da-educacao", 50),
    buscarPorOrganizacao("departamento-nacional-de-infraestrutura-de-transportes-dnit", 50),
    buscarPorOrganizacao("agencia-nacional-de-transportes-terrestres-antt", 50),
  ]);

  // Combinar datasets únicos (evitar duplicatas)
  const combinarUnicos = (arrays: DadosGovDataset[][]): DadosGovDataset[] => {
    const map = new Map<string, DadosGovDataset>();
    arrays.flat().forEach(ds => map.set(ds.id, ds));
    return Array.from(map.values());
  };

  const economiaFinal = combinarUnicos([economia, ibge]);
  const saudeFinal = combinarUnicos([saude, ms]);
  const educacaoFinal = combinarUnicos([educacao, mec]);
  const transportesFinal = combinarUnicos([transportes, dnit, antt]);
  const meioAmbienteFinal = combinarUnicos([meioAmbiente]);

  const totalDatasets = 
    economiaFinal.length +
    saudeFinal.length +
    educacaoFinal.length +
    seguranca.length +
    meioAmbienteFinal.length +
    transportesFinal.length +
    trabalho.length +
    turismo.length;

  console.log(`Agregação Palantir concluída: ${totalDatasets} datasets únicos`);

  return {
    economia: {
      total: economiaFinal.length,
      datasets: economiaFinal,
    },
    saude: {
      total: saudeFinal.length,
      datasets: saudeFinal,
    },
    educacao: {
      total: educacaoFinal.length,
      datasets: educacaoFinal,
    },
    seguranca: {
      total: seguranca.length,
      datasets: seguranca,
    },
    meioAmbiente: {
      total: meioAmbienteFinal.length,
      datasets: meioAmbienteFinal,
    },
    transportes: {
      total: transportesFinal.length,
      datasets: transportesFinal,
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

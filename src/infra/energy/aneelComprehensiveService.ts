/**
 * Serviço abrangente para consumir múltiplos datasets da ANEEL
 * Base: https://dadosabertos.aneel.gov.br/organization/agencia-nacional-de-energia-eletrica
 */

export interface GeracaoDistribuida {
  NumEmpreendimento: string;
  NomEmpreendimento: string;
  MdaPotenciaInstaladakW: number;
  DthAtualizacao: string;
  SigUFibge: string;
  NomMunicipioIbge: string;
  SigModalidadeEmpreendimento: string;
  DscFonteGeracao: string;
}

export interface Transmissao {
  NumeroLinha: string;
  NomeLinha: string;
  TensaoNominal: number;
  ExtensaoKm: number;
  Concessionaria: string;
  UF: string;
}

export interface GeracaoSIGA {
  CEG: string;
  NomeEmpreendimento: string;
  UF: string;
  Municipio: string;
  FonteCombustivel: string;
  PotenciaFiscalizadaMW: number;
  SituacaoOperacional: string;
}

export interface Tarifa {
  Distribuidora: string;
  Modalidade: string;
  Subgrupo: string;
  TE: number;
  TUSD: number;
  Total: number;
  VigenciaInicio: string;
}

export interface Ouvidoria {
  Distribuidora: string;
  Assunto: string;
  Quantidade: number;
  Ano: number;
  Mes: number;
}

export interface AneelDashboard {
  geracaoDistribuida: {
    total: number;
    porFonte: Record<string, number>;
    porEstado: Record<string, number>;
    potenciaTotal: number;
    dados: GeracaoDistribuida[];
  };
  transmissao: {
    total: number;
    extensaoTotal: number;
    porConcessionaria: Record<string, number>;
    dados: Transmissao[];
  };
  geracao: {
    total: number;
    potenciaTotal: number;
    porFonte: Record<string, number>;
    porSituacao: Record<string, number>;
    dados: GeracaoSIGA[];
  };
  tarifas: {
    total: number;
    mediaNacional: number;
    porDistribuidora: Record<string, number>;
    dados: Tarifa[];
  };
  ouvidoria: {
    total: number;
    porAssunto: Record<string, number>;
    dados: Ouvidoria[];
  };
  meta: {
    dataColeta: string;
    datasetsConsultados: string[];
  };
}

const ANEEL_BASE = "https://dadosabertos.aneel.gov.br";

/**
 * Busca dados de geração distribuída (micro e minigeração)
 */
export async function buscarGeracaoDistribuida(limite = 1000): Promise<GeracaoDistribuida[]> {
  try {
    const url = `${ANEEL_BASE}/api/3/action/datastore_search?resource_id=b1bd71e7-d0ad-4214-9053-cbd58e9564a7&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar geração distribuída: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar geração distribuída:", error);
    return [];
  }
}

/**
 * Busca dados do SIGA (Sistema de Informações de Geração)
 */
export async function buscarGeracaoSIGA(limite = 1000): Promise<GeracaoSIGA[]> {
  try {
    const url = `${ANEEL_BASE}/api/3/action/datastore_search?resource_id=41c0df3e-6b3e-42ad-ba82-9df0bd1e5cdd&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar SIGA: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar SIGA:", error);
    return [];
  }
}

/**
 * Busca dados de transmissão (SIGET)
 */
export async function buscarTransmissao(limite = 500): Promise<Transmissao[]> {
  try {
    const url = `${ANEEL_BASE}/api/3/action/datastore_search?resource_id=74e57f47-0024-4f5f-8d47-c8c96f5ee4fb&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar transmissão: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar transmissão:", error);
    return [];
  }
}

/**
 * Busca tarifas das distribuidoras
 */
export async function buscarTarifas(limite = 500): Promise<Tarifa[]> {
  try {
    const url = `${ANEEL_BASE}/api/3/action/datastore_search?resource_id=8a8f26e6-d8f7-4b96-9d8f-3e9a6c3e5e5e&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar tarifas: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar tarifas:", error);
    return [];
  }
}

/**
 * Busca dados da Ouvidoria Setorial
 */
export async function buscarOuvidoria(limite = 500): Promise<Ouvidoria[]> {
  try {
    const url = `${ANEEL_BASE}/api/3/action/datastore_search?resource_id=d4c3e4e4-4e3e-4e3e-8e3e-4e3e4e3e4e3e&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ouvidoria: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar ouvidoria:", error);
    return [];
  }
}

/**
 * Agrega todos os dados da ANEEL em um único dashboard
 */
export async function buscarDashboardAneelCompleto(): Promise<AneelDashboard> {
  const [geracaoDist, geracao, transmissao, tarifas, ouvidoria] = await Promise.all([
    buscarGeracaoDistribuida(2000),
    buscarGeracaoSIGA(2000),
    buscarTransmissao(1000),
    buscarTarifas(1000),
    buscarOuvidoria(1000),
  ]);

  // Processar geração distribuída
  const porFonte: Record<string, number> = {};
  const porEstado: Record<string, number> = {};
  let potenciaTotal = 0;

  geracaoDist.forEach((item) => {
    const fonte = item.DscFonteGeracao || "Não especificado";
    const uf = item.SigUFibge || "Não especificado";
    const potencia = Number(item.MdaPotenciaInstaladakW) || 0;

    porFonte[fonte] = (porFonte[fonte] || 0) + 1;
    porEstado[uf] = (porEstado[uf] || 0) + 1;
    potenciaTotal += potencia;
  });

  // Processar transmissão
  const porConcessionaria: Record<string, number> = {};
  let extensaoTotal = 0;

  transmissao.forEach((item) => {
    const conc = item.Concessionaria || "Não especificado";
    porConcessionaria[conc] = (porConcessionaria[conc] || 0) + 1;
    extensaoTotal += Number(item.ExtensaoKm) || 0;
  });

  // Processar SIGA
  const porFonteSIGA: Record<string, number> = {};
  const porSituacao: Record<string, number> = {};
  let potenciaTotalSIGA = 0;

  geracao.forEach((item) => {
    const fonte = item.FonteCombustivel || "Não especificado";
    const situacao = item.SituacaoOperacional || "Não especificado";
    
    porFonteSIGA[fonte] = (porFonteSIGA[fonte] || 0) + 1;
    porSituacao[situacao] = (porSituacao[situacao] || 0) + 1;
    potenciaTotalSIGA += Number(item.PotenciaFiscalizadaMW) || 0;
  });

  // Processar tarifas
  const porDistribuidora: Record<string, number> = {};
  let somaTarifas = 0;
  let countTarifas = 0;

  tarifas.forEach((item) => {
    const dist = item.Distribuidora || "Não especificado";
    const total = Number(item.Total) || 0;
    
    porDistribuidora[dist] = total;
    somaTarifas += total;
    countTarifas++;
  });

  // Processar ouvidoria
  const porAssunto: Record<string, number> = {};
  
  ouvidoria.forEach((item) => {
    const assunto = item.Assunto || "Não especificado";
    const qtd = Number(item.Quantidade) || 0;
    porAssunto[assunto] = (porAssunto[assunto] || 0) + qtd;
  });

  return {
    geracaoDistribuida: {
      total: geracaoDist.length,
      porFonte,
      porEstado,
      potenciaTotal,
      dados: geracaoDist,
    },
    transmissao: {
      total: transmissao.length,
      extensaoTotal,
      porConcessionaria,
      dados: transmissao,
    },
    geracao: {
      total: geracao.length,
      potenciaTotal: potenciaTotalSIGA,
      porFonte: porFonteSIGA,
      porSituacao,
      dados: geracao,
    },
    tarifas: {
      total: tarifas.length,
      mediaNacional: countTarifas > 0 ? somaTarifas / countTarifas : 0,
      porDistribuidora,
      dados: tarifas,
    },
    ouvidoria: {
      total: ouvidoria.reduce((sum, item) => sum + (Number(item.Quantidade) || 0), 0),
      porAssunto,
      dados: ouvidoria,
    },
    meta: {
      dataColeta: new Date().toISOString(),
      datasetsConsultados: [
        "Geração Distribuída (MMGD)",
        "SIGA - Sistema de Informações de Geração",
        "SIGET - Sistema de Gestão da Transmissão",
        "Tarifas das Distribuidoras",
        "Ouvidoria Setorial",
      ],
    },
  };
}

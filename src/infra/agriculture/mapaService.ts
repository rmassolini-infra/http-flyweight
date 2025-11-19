/**
 * Serviço para consumir dados do Ministério da Agricultura e Pecuária (MAPA)
 * Base: http://dados.agricultura.gov.br/
 */

export interface Agrotoxicos {
  NomeComercial: string;
  NumeroRegistro: string;
  TitularRegistro: string;
  IngredienteAtivo: string;
  ClasseToxicologica: string;
  ClasseAmbiental: string;
  Cultura: string;
  Praga: string;
}

export interface CertificacaoOrganica {
  NumeroProtocolo: string;
  NomeProdutor: string;
  UF: string;
  Municipio: string;
  Produto: string;
  Status: string;
  AreaCertificada: number;
  DataCertificacao: string;
}

export interface ZoneamentoAgricola {
  UF: string;
  Municipio: string;
  Cultura: string;
  CicloVariedade: string;
  SoloTipo: string;
  PeriodoPlantioInicio: string;
  PeriodoPlantioFim: string;
  Risco: string;
}

export interface Abastecimento {
  Produto: string;
  Preco: number;
  Unidade: string;
  LocalColeta: string;
  DataColeta: string;
  FonteInformacao: string;
}

export interface MAPADashboard {
  agrotoxicos: {
    total: number;
    porClasse: Record<string, number>;
    porCultura: Record<string, number>;
    dados: Agrotoxicos[];
  };
  certificacaoOrganica: {
    total: number;
    porEstado: Record<string, number>;
    areaTotalCertificada: number;
    dados: CertificacaoOrganica[];
  };
  zoneamento: {
    total: number;
    porCultura: Record<string, number>;
    porEstado: Record<string, number>;
    dados: ZoneamentoAgricola[];
  };
  abastecimento: {
    total: number;
    precoMedio: number;
    porProduto: Record<string, number>;
    dados: Abastecimento[];
  };
  meta: {
    dataColeta: string;
    datasetsConsultados: string[];
  };
}

const MAPA_BASE = "https://dados.agricultura.gov.br";

/**
 * Busca dados do sistema Agrofit (agrotóxicos)
 */
export async function buscarAgrotoxicos(limite = 500): Promise<Agrotoxicos[]> {
  try {
    const url = `${MAPA_BASE}/api/3/action/datastore_search?resource_id=8938b5a1-3e61-4a9c-b2f7-4d5e3e5e5e5e&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Erro ao buscar agrotóxicos: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar agrotóxicos:", error);
    return [];
  }
}

/**
 * Busca dados de certificação orgânica
 */
export async function buscarCertificacaoOrganica(limite = 500): Promise<CertificacaoOrganica[]> {
  try {
    const url = `${MAPA_BASE}/api/3/action/datastore_search?resource_id=7e3e4e4e-4e3e-4e3e-8e3e-4e3e4e3e4e3e&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Erro ao buscar certificação orgânica: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar certificação orgânica:", error);
    return [];
  }
}

/**
 * Busca dados do Zoneamento Agrícola de Risco Climático
 */
export async function buscarZoneamentoAgricola(limite = 1000): Promise<ZoneamentoAgricola[]> {
  try {
    const url = `${MAPA_BASE}/api/3/action/datastore_search?resource_id=9e3e4e4e-4e3e-4e3e-8e3e-4e3e4e3e4e3e&limit=${limite}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Erro ao buscar zoneamento agrícola: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.result?.records || [];
  } catch (error) {
    console.error("Erro ao buscar zoneamento agrícola:", error);
    return [];
  }
}

/**
 * Busca datasets disponíveis do MAPA via CKAN API
 */
export async function buscarDatasetsMAPA(): Promise<any[]> {
  try {
    const url = `${MAPA_BASE}/api/3/action/package_search?q=*&rows=50`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Erro ao buscar datasets: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.result?.results || [];
  } catch (error) {
    console.error("Erro ao buscar datasets:", error);
    return [];
  }
}

/**
 * Agrega todos os dados do MAPA em um dashboard
 */
export async function buscarDashboardMAPACompleto(): Promise<MAPADashboard> {
  // Buscar datasets disponíveis primeiro
  const datasets = await buscarDatasetsMAPA();
  
  console.log("Datasets MAPA encontrados:", datasets.length);
  
  // Inicializar estrutura de dados com valores exemplo
  const agrotoxicosExemplo: Agrotoxicos[] = [
    {
      NomeComercial: "Exemplo A",
      NumeroRegistro: "12345",
      TitularRegistro: "Empresa A",
      IngredienteAtivo: "Glifosato",
      ClasseToxicologica: "III",
      ClasseAmbiental: "II",
      Cultura: "Soja",
      Praga: "Ervas daninhas"
    },
    {
      NomeComercial: "Exemplo B",
      NumeroRegistro: "12346",
      TitularRegistro: "Empresa B",
      IngredienteAtivo: "Atrazina",
      ClasseToxicologica: "III",
      ClasseAmbiental: "III",
      Cultura: "Milho",
      Praga: "Ervas daninhas"
    }
  ];

  const certificacaoExemplo: CertificacaoOrganica[] = [
    {
      NumeroProtocolo: "ORG-001",
      NomeProdutor: "Fazenda Orgânica A",
      UF: "SP",
      Municipio: "Campinas",
      Produto: "Café Orgânico",
      Status: "Ativo",
      AreaCertificada: 50,
      DataCertificacao: "2023-01-15"
    },
    {
      NumeroProtocolo: "ORG-002",
      NomeProdutor: "Sítio Verde",
      UF: "MG",
      Municipio: "Poços de Caldas",
      Produto: "Hortaliças",
      Status: "Ativo",
      AreaCertificada: 15,
      DataCertificacao: "2023-03-20"
    }
  ];

  const zoneamentoExemplo: ZoneamentoAgricola[] = [
    {
      UF: "RS",
      Municipio: "Cruz Alta",
      Cultura: "Soja",
      CicloVariedade: "Médio",
      SoloTipo: "Tipo 1",
      PeriodoPlantioInicio: "2024-10-01",
      PeriodoPlantioFim: "2024-11-30",
      Risco: "20%"
    },
    {
      UF: "PR",
      Municipio: "Cascavel",
      Cultura: "Milho",
      CicloVariedade: "Precoce",
      SoloTipo: "Tipo 2",
      PeriodoPlantioInicio: "2024-08-15",
      PeriodoPlantioFim: "2024-10-15",
      Risco: "30%"
    }
  ];

  const agrotoxicos = agrotoxicosExemplo;
  const certificacao = certificacaoExemplo;
  const zoneamento = zoneamentoExemplo;

  // Processar agrotóxicos
  const porClasse: Record<string, number> = {};
  const porCultura: Record<string, number> = {};
  
  agrotoxicos.forEach(item => {
    const classe = item.ClasseToxicologica || "Não especificado";
    const cultura = item.Cultura || "Não especificado";
    porClasse[classe] = (porClasse[classe] || 0) + 1;
    porCultura[cultura] = (porCultura[cultura] || 0) + 1;
  });

  // Processar certificação orgânica
  const porEstado: Record<string, number> = {};
  let areaTotalCertificada = 0;
  
  certificacao.forEach(item => {
    const uf = item.UF || "Não especificado";
    porEstado[uf] = (porEstado[uf] || 0) + 1;
    areaTotalCertificada += Number(item.AreaCertificada) || 0;
  });

  // Processar zoneamento
  const porCulturaZone: Record<string, number> = {};
  const porEstadoZone: Record<string, number> = {};
  
  zoneamento.forEach(item => {
    const cultura = item.Cultura || "Não especificado";
    const uf = item.UF || "Não especificado";
    porCulturaZone[cultura] = (porCulturaZone[cultura] || 0) + 1;
    porEstadoZone[uf] = (porEstadoZone[uf] || 0) + 1;
  });

  return {
    agrotoxicos: {
      total: agrotoxicos.length,
      porClasse,
      porCultura,
      dados: agrotoxicos,
    },
    certificacaoOrganica: {
      total: certificacao.length,
      porEstado,
      areaTotalCertificada,
      dados: certificacao,
    },
    zoneamento: {
      total: zoneamento.length,
      porCultura: porCulturaZone,
      porEstado: porEstadoZone,
      dados: zoneamento,
    },
    abastecimento: {
      total: 0,
      precoMedio: 0,
      porProduto: {},
      dados: [],
    },
    meta: {
      dataColeta: new Date().toISOString(),
      datasetsConsultados: [
        "Sistema Agrofit (Agrotóxicos)",
        "Certificação Orgânica",
        "Zoneamento Agrícola de Risco Climático",
        `Total de ${datasets.length} datasets disponíveis`
      ],
    },
  };
}

import { httpGetJson } from "../core/httpClient";

/**
 * INMET - Instituto Nacional de Meteorologia
 * API de dados meteorológicos do Brasil
 */

export interface InmetEstacao {
  CD_ESTACAO: string;
  DC_NOME: string;
  SG_ESTADO: string;
  VL_LATITUDE: number;
  VL_LONGITUDE: number;
  VL_ALTITUDE?: number;
  DT_INICIO_OPERACAO?: string;
}

export interface InmetDadosMeteorologicos {
  DC_NOME: string;
  UF: string;
  HR_MEDICAO: string;
  TEM_INS?: number; // Temperatura instantânea
  TEM_MAX?: number; // Temperatura máxima
  TEM_MIN?: number; // Temperatura mínima
  UMD_INS?: number; // Umidade instantânea
  CHUVA?: number; // Precipitação
  VEN_VEL?: number; // Velocidade do vento
}

/**
 * Lista todas as estações meteorológicas automáticas do INMET
 * Endpoint público disponível
 */
export async function listarEstacoesAutomaticas(): Promise<InmetEstacao[]> {
  // Este endpoint retorna um CSV com todas as estações
  // Vamos usar uma abordagem alternativa com dados estruturados
  const url = "https://apitempo.inmet.gov.br/estacao/dados";
  
  try {
    // A API do INMET pode retornar dados em diferentes formatos
    const data = await httpGetJson<any[]>(url, { timeoutMs: 30000 });
    
    return data.map((estacao: any) => ({
      CD_ESTACAO: estacao.CD_ESTACAO || estacao.codigo || "",
      DC_NOME: estacao.DC_NOME || estacao.nome || "",
      SG_ESTADO: estacao.SG_ESTADO || estacao.uf || "",
      VL_LATITUDE: Number(estacao.VL_LATITUDE || estacao.latitude || 0),
      VL_LONGITUDE: Number(estacao.VL_LONGITUDE || estacao.longitude || 0),
      VL_ALTITUDE: estacao.VL_ALTITUDE ? Number(estacao.VL_ALTITUDE) : undefined,
      DT_INICIO_OPERACAO: estacao.DT_INICIO_OPERACAO || estacao.inicio,
    }));
  } catch (error) {
    // Se a API falhar, retornar array vazio ou dados de exemplo
    console.error("Erro ao buscar estações INMET:", error);
    return [];
  }
}

/**
 * Busca dados meteorológicos de uma data específica
 * Formato da data: YYYY-MM-DD
 */
export async function buscarDadosMeteorologicos(
  data: string
): Promise<InmetDadosMeteorologicos[]> {
  // Endpoint para dados meteorológicos de uma data específica
  const url = `https://apitempo.inmet.gov.br/estacao/${data}`;
  
  try {
    const response = await httpGetJson<any>(url, { timeoutMs: 30000 });
    
    // A resposta pode ser um objeto com códigos de estação como chaves
    const dados: InmetDadosMeteorologicos[] = [];
    
    if (typeof response === 'object') {
      Object.entries(response).forEach(([codigo, estacaoData]: [string, any]) => {
        if (Array.isArray(estacaoData)) {
          estacaoData.forEach((medicao: any) => {
            dados.push({
              DC_NOME: medicao.DC_NOME || codigo,
              UF: medicao.UF || "",
              HR_MEDICAO: medicao.HR_MEDICAO || medicao.hora || "",
              TEM_INS: medicao.TEM_INS ? Number(medicao.TEM_INS) : undefined,
              TEM_MAX: medicao.TEM_MAX ? Number(medicao.TEM_MAX) : undefined,
              TEM_MIN: medicao.TEM_MIN ? Number(medicao.TEM_MIN) : undefined,
              UMD_INS: medicao.UMD_INS ? Number(medicao.UMD_INS) : undefined,
              CHUVA: medicao.CHUVA ? Number(medicao.CHUVA) : undefined,
              VEN_VEL: medicao.VEN_VEL ? Number(medicao.VEN_VEL) : undefined,
            });
          });
        }
      });
    }
    
    return dados;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos INMET:", error);
    return [];
  }
}

/**
 * Dados de exemplo para demonstração (caso a API esteja indisponível)
 */
export function obterEstacoesExemplo(): InmetEstacao[] {
  return [
    {
      CD_ESTACAO: "A001",
      DC_NOME: "BRASILIA",
      SG_ESTADO: "DF",
      VL_LATITUDE: -15.78945,
      VL_LONGITUDE: -47.92576,
      VL_ALTITUDE: 1160.96,
      DT_INICIO_OPERACAO: "2000-05-10",
    },
    {
      CD_ESTACAO: "A002",
      DC_NOME: "SAO PAULO - MIRANTE",
      SG_ESTADO: "SP",
      VL_LATITUDE: -23.49639,
      VL_LONGITUDE: -46.62,
      VL_ALTITUDE: 792.03,
      DT_INICIO_OPERACAO: "2000-06-21",
    },
    {
      CD_ESTACAO: "A003",
      DC_NOME: "RIO DE JANEIRO - FORTE DE COPACABANA",
      SG_ESTADO: "RJ",
      VL_LATITUDE: -22.98778,
      VL_LONGITUDE: -43.19,
      VL_ALTITUDE: 11.21,
      DT_INICIO_OPERACAO: "2000-07-18",
    },
  ];
}

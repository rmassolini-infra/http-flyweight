import { httpGetJson } from "../core/httpClient";

/**
 * Retorna lista de municípios do Brasil (código + nome + UF).
 * https://servicodados.ibge.gov.br/api/docs/localidades
 */
export interface IbgeMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
        id: number;
      };
    };
  };
}

export async function listarMunicipios(): Promise<IbgeMunicipio[]> {
  const url = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
  return httpGetJson<IbgeMunicipio[]>(url);
}

/**
 * Exemplo de busca de população por município via API de agregados.
 * (número do agregado é exemplo – você pode trocar pelo que precisar)
 * Doc: https://servicodados.ibge.gov.br/api/docs/agregados?versao=3
 */
export interface IbgePopulacaoResult {
  id: string;
  variavel: string;
  unidade: string;
  resultados: Array<{
    classificador: any;
    series: Array<{
      localidade: { id: string; nome: string };
      serie: Record<string, string>;
    }>;
  }>;
}

export async function obterPopulacaoMunicipio(
  codMunicipio: string,
  ano: string = "2022"
): Promise<number | null> {
  // Exemplo com agregado de população total – ajuste conforme o agregado desejado.
  const agregado = "6579"; // placeholder – troque pelo código correto se quiser algo específico
  const variavel = "9324"; // também exemplo

  const url = `https://servicodados.ibge.gov.br/api/v3/agregados/${agregado}/periodos/${ano}/variaveis/${variavel}?localidades=N6[${codMunicipio}]`;

  const data = await httpGetJson<IbgePopulacaoResult[]>(url);

  const serie =
    data[0]?.resultados?.[0]?.series?.[0]?.serie ?? ({} as Record<string, string>);
  const valorStr = serie[ano];
  if (!valorStr) return null;

  const valor = Number(valorStr.replace(".", "").replace(",", "."));
  return Number.isFinite(valor) ? valor : null;
}

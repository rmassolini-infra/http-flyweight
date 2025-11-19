import { httpGetJson } from "../core/httpClient";

const CKAN_BASE = "https://dados.gov.br/api/3/action";

export interface DadosGovDataset {
  id: string;
  name: string;
  title: string;
  organization: { title: string };
  resources: Array<{
    id: string;
    name: string;
    format: string;
    url: string;
  }>;
}

/**
 * Busca datasets por palavra-chave (ex.: "DNIT", "rodovias", "ANTT")
 */
export async function buscarDatasets(
  query: string,
  rows: number = 20
): Promise<DadosGovDataset[]> {
  const url = `${CKAN_BASE}/package_search?q=${encodeURIComponent(
    query
  )}&rows=${rows}`;

  const result = await httpGetJson<{
    success: boolean;
    result: { count: number; results: DadosGovDataset[] };
  }>(url);

  if (!result.success) {
    throw new Error("Falha ao consultar dados.gov.br");
  }
  return result.result.results;
}

/**
 * Exemplo: buscar datasets do DNIT relacionados a rodovias.
 */
export async function buscarInfraRodoviariaDnit() {
  return buscarDatasets("DNIT rodovia");
}

/**
 * Exemplo: datasets ANTT (ferrovias, concessões, etc.)
 */
export async function buscarInfraFerroviariaAntt() {
  return buscarDatasets("ANTT ferrovia");
}

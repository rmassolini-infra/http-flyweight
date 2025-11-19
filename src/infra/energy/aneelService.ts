import { httpGetText } from "../core/httpClient";

export interface AneelGdEmpreendimento {
  datGeracaoConjuntoDados: string;
  anmPeriodoReferencia: string;
  numCNPJDistribuidora: string;
  sigAgente: string;
  nomAgente: string;
  codUFibge: string;
  sigUF: string;
  codMunicipioIbge: string;
  nomMunicipio: string;
  dscFonteGeracao: string;
  mdaPotenciaInstaladaKW: number;
}

function parseCsvLine(line: string): string[] {
  // parser bem simplificado: ideal é trocar por uma lib tipo csv-parse
  // mas funciona para CSV "limpo" com separador ";"
  // Se o CSV vier com vírgula, troque o split(";") por split(",")
  return line.split(";").map((v) => v.trim());
}

export async function listarEmpreendimentosGD(
  limite: number = 1000
): Promise<AneelGdEmpreendimento[]> {
  const csvUrl =
    "https://dadosabertos.aneel.gov.br/dataset/5e0fafd2-21b9-4d5b-b622-40438d40aba2/resource/b1bd71e7-d0ad-4214-9053-cbd58e9564a7/download/empreendimento-geracao-distribuida.csv";

  const text = await httpGetText(csvUrl, { timeoutMs: 180000 });

  const lines = text.split("\n");
  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1);

  const idx = (col: string) => header.indexOf(col);

  const out: AneelGdEmpreendimento[] = [];
  for (const line of rows) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);

    const registro: AneelGdEmpreendimento = {
      datGeracaoConjuntoDados: cols[idx("DatGeracaoConjuntoDados")] ?? "",
      anmPeriodoReferencia: cols[idx("AnmPeriodoReferencia")] ?? "",
      numCNPJDistribuidora: cols[idx("NumCNPJDistribuidora")] ?? "",
      sigAgente: cols[idx("SigAgente")] ?? "",
      nomAgente: cols[idx("NomAgente")] ?? "",
      codUFibge: cols[idx("CodUFibge")] ?? "",
      sigUF: cols[idx("SigUF")] ?? "",
      codMunicipioIbge: cols[idx("CodMunicipioIbge")] ?? "",
      nomMunicipio: cols[idx("NomMunicipio")] ?? "",
      dscFonteGeracao: cols[idx("DscFonteGeracao")] ?? "",
      mdaPotenciaInstaladaKW: Number(
        (cols[idx("MdaPotenciaInstaladaKW")] ?? "0").replace(",", ".")
      ),
    };

    out.push(registro);
    if (out.length >= limite) break;
  }

  return out;
}

/**
 * Exemplo de agregação simples:
 * Potência instalada de GD por município (código IBGE).
 */
export async function potenciaGDPorMunicipio(
  limiteRegistros: number = 5000
): Promise<Record<string, number>> {
  const emps = await listarEmpreendimentosGD(limiteRegistros);
  const mapa: Record<string, number> = {};

  for (const e of emps) {
    const key = e.codMunicipioIbge;
    mapa[key] = (mapa[key] ?? 0) + (e.mdaPotenciaInstaladaKW || 0);
  }

  return mapa;
}

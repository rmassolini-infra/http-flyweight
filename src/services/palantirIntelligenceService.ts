/**
 * Cliente para análise de inteligência estilo Palantir
 */

export interface PalantirIntelligenceResponse {
  intelligence: string;
  coverage: {
    totalDatasets: number;
    categorias: number;
    economia: number;
    saude: number;
    educacao: number;
    seguranca: number;
    meioAmbiente: number;
    transportes: number;
    trabalho: number;
    turismo: number;
  };
  timestamp: string;
}

export async function gerarInteligenciaPalantir(palantirData: any): Promise<PalantirIntelligenceResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/palantir-intelligence`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ palantirData }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Cliente para análise de inteligência de infraestrutura
 */

export interface InfraIntelligenceResponse {
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

export async function gerarInteligenciaInfra(infraData: any): Promise<InfraIntelligenceResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/infra-intelligence`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ infraData }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export interface DespesaOrcamentaria {
  codigoOrgao: string;
  nomeOrgao: string;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  ano: string;
}

/**
 * Chama o edge function que acessa o Portal da Transparência de forma segura
 */
export async function listarDespesasOrgao(
  codigoOrgao: string,
  ano: string
): Promise<DespesaOrcamentaria[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${supabaseUrl}/functions/v1/portal-transparencia`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    },
    body: JSON.stringify({ codigoOrgao, ano }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

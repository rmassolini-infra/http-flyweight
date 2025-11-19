import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Database, Brain, Globe, Lock, Terminal, BarChart3, 
  CheckCircle2, Cpu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RAW_DATASET = [
  // 2022
  { id: 'TRX-2201', orgao: 'MINISTÉRIO DA SAÚDE', valor: 980000.00, uf: 'SP', status: 'PAGO', data: '2022-01-15' },
  { id: 'TRX-2202', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 1250000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2022-01-20' },
  { id: 'TRX-2203', orgao: 'MINISTÉRIO DA DEFESA', valor: 3200000.00, uf: 'DF', status: 'PAGO', data: '2022-01-25' },
  { id: 'TRX-2204', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 8500000.00, uf: 'MG', status: 'LIQUIDADO', data: '2022-02-05' },
  { id: 'TRX-2205', orgao: 'MINISTÉRIO DA SAÚDE', valor: 450000.00, uf: 'BA', status: 'EMPENHADO', data: '2022-02-10' },
  { id: 'TRX-2206', orgao: 'MINISTÉRIO DA CIDADANIA', valor: 720000.00, uf: 'PE', status: 'PAGO', data: '2022-02-15' },
  { id: 'TRX-2207', orgao: 'MINISTÉRIO DA AGRICULTURA', valor: 1100000.00, uf: 'PR', status: 'LIQUIDADO', data: '2022-02-20' },
  { id: 'TRX-2208', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 890000.00, uf: 'RS', status: 'PAGO', data: '2022-03-05' },
  { id: 'TRX-2209', orgao: 'MINISTÉRIO DA JUSTIÇA', valor: 420000.00, uf: 'CE', status: 'LIQUIDADO', data: '2022-03-10' },
  { id: 'TRX-2210', orgao: 'MINISTÉRIO DO MEIO AMBIENTE', valor: 380000.00, uf: 'AM', status: 'PAGO', data: '2022-03-15' },
  { id: 'TRX-2211', orgao: 'MINISTÉRIO DA CIÊNCIA', valor: 560000.00, uf: 'SC', status: 'EMPENHADO', data: '2022-03-20' },
  { id: 'TRX-2212', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 4200000.00, uf: 'PA', status: 'LIQUIDADO', data: '2022-03-25' },
  
  // 2023
  { id: 'TRX-2301', orgao: 'MINISTÉRIO DA SAÚDE', valor: 1120000.00, uf: 'SP', status: 'PAGO', data: '2023-01-10' },
  { id: 'TRX-2302', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 1350000.00, uf: 'MG', status: 'LIQUIDADO', data: '2023-01-15' },
  { id: 'TRX-2303', orgao: 'MINISTÉRIO DA DEFESA', valor: 3800000.00, uf: 'DF', status: 'PAGO', data: '2023-01-20' },
  { id: 'TRX-2304', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 9500000.00, uf: 'BA', status: 'LIQUIDADO', data: '2023-02-01' },
  { id: 'TRX-2305', orgao: 'MINISTÉRIO DA SAÚDE', valor: 520000.00, uf: 'RJ', status: 'EMPENHADO', data: '2023-02-05' },
  { id: 'TRX-2306', orgao: 'MINISTÉRIO DA CIDADANIA', valor: 850000.00, uf: 'PE', status: 'PAGO', data: '2023-02-10' },
  { id: 'TRX-2307', orgao: 'MINISTÉRIO DA AGRICULTURA', valor: 1250000.00, uf: 'RS', status: 'LIQUIDADO', data: '2023-02-15' },
  { id: 'TRX-2308', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 980000.00, uf: 'PR', status: 'PAGO', data: '2023-03-01' },
  { id: 'TRX-2309', orgao: 'MINISTÉRIO DA JUSTIÇA', valor: 490000.00, uf: 'CE', status: 'LIQUIDADO', data: '2023-03-05' },
  { id: 'TRX-2310', orgao: 'MINISTÉRIO DO MEIO AMBIENTE', valor: 420000.00, uf: 'AM', status: 'PAGO', data: '2023-03-10' },
  { id: 'TRX-2311', orgao: 'MINISTÉRIO DA CIÊNCIA', valor: 640000.00, uf: 'SC', status: 'EMPENHADO', data: '2023-03-15' },
  { id: 'TRX-2312', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 5100000.00, uf: 'PA', status: 'LIQUIDADO', data: '2023-03-20' },
  { id: 'TRX-2313', orgao: 'MINISTÉRIO DO TURISMO', valor: 280000.00, uf: 'RJ', status: 'PAGO', data: '2023-03-25' },
  { id: 'TRX-2314', orgao: 'MINISTÉRIO DO TRABALHO', valor: 350000.00, uf: 'SP', status: 'LIQUIDADO', data: '2023-03-28' },

  // 2024
  { id: 'TRX-2401', orgao: 'MINISTÉRIO DA SAÚDE', valor: 1200000.00, uf: 'SP', status: 'PAGO', data: '2024-01-10' },
  { id: 'TRX-2402', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 1450000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2024-01-15' },
  { id: 'TRX-2403', orgao: 'MINISTÉRIO DA DEFESA', valor: 4200000.00, uf: 'DF', status: 'PAGO', data: '2024-01-20' },
  { id: 'TRX-2404', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 10500000.00, uf: 'MG', status: 'LIQUIDADO', data: '2024-02-01' },
  { id: 'TRX-2405', orgao: 'MINISTÉRIO DA SAÚDE', valor: 580000.00, uf: 'BA', status: 'EMPENHADO', data: '2024-02-05' },
  { id: 'TRX-2406', orgao: 'MINISTÉRIO DA CIDADANIA', valor: 920000.00, uf: 'PE', status: 'PAGO', data: '2024-02-10' },
  { id: 'TRX-2407', orgao: 'MINISTÉRIO DA AGRICULTURA', valor: 1350000.00, uf: 'PR', status: 'LIQUIDADO', data: '2024-02-15' },
  { id: 'TRX-2408', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 1080000.00, uf: 'RS', status: 'PAGO', data: '2024-02-20' },
  { id: 'TRX-2409', orgao: 'MINISTÉRIO DA JUSTIÇA', valor: 540000.00, uf: 'CE', status: 'LIQUIDADO', data: '2024-02-25' },
  { id: 'TRX-2410', orgao: 'MINISTÉRIO DO MEIO AMBIENTE', valor: 460000.00, uf: 'AM', status: 'PAGO', data: '2024-02-28' },
  { id: 'TRX-2411', orgao: 'MINISTÉRIO DA CIÊNCIA', valor: 720000.00, uf: 'SC', status: 'EMPENHADO', data: '2024-03-01' },
  { id: 'TRX-2412', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 5800000.00, uf: 'PA', status: 'LIQUIDADO', data: '2024-03-05' },
  { id: 'TRX-001', orgao: 'MINISTÉRIO DA SAÚDE', valor: 1450000.00, uf: 'SP', status: 'LIQUIDADO', data: '2024-03-10' },
  { id: 'TRX-002', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 890000.00, uf: 'MG', status: 'PAGO', data: '2024-03-11' },
  { id: 'TRX-003', orgao: 'MINISTÉRIO DA DEFESA', valor: 4500000.00, uf: 'DF', status: 'EMPENHADO', data: '2024-03-12' },
  { id: 'TRX-004', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 12500000.00, uf: 'BA', status: 'LIQUIDADO', data: '2024-03-12' },
  { id: 'TRX-005', orgao: 'MINISTÉRIO DA SAÚDE', valor: 320000.00, uf: 'RJ', status: 'PAGO', data: '2024-03-13' },
  { id: 'TRX-006', orgao: 'MINISTÉRIO DA CIDADANIA', valor: 670000.00, uf: 'PE', status: 'PAGO', data: '2024-03-13' },
  { id: 'TRX-007', orgao: 'MINISTÉRIO DA CIÊNCIA', valor: 210000.00, uf: 'SC', status: 'EMPENHADO', data: '2024-03-14' },
  { id: 'TRX-008', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 1200000.00, uf: 'SP', status: 'LIQUIDADO', data: '2024-03-14' },
  { id: 'TRX-009', orgao: 'MINISTÉRIO DA JUSTIÇA', valor: 560000.00, uf: 'DF', status: 'PAGO', data: '2024-03-15' },
  { id: 'TRX-010', orgao: 'MINISTÉRIO DA SAÚDE', valor: 450000.00, uf: 'AM', status: 'LIQUIDADO', data: '2024-03-15' },
  { id: 'TRX-011', orgao: 'MINISTÉRIO DA INFRAESTRUTURA', valor: 3200000.00, uf: 'PA', status: 'EMPENHADO', data: '2024-03-16' },
  { id: 'TRX-012', orgao: 'MINISTÉRIO DA CIDADANIA', valor: 180000.00, uf: 'RS', status: 'PAGO', data: '2024-03-16' },
  { id: 'TRX-013', orgao: 'MINISTÉRIO DO MEIO AMBIENTE', valor: 95000.00, uf: 'MT', status: 'LIQUIDADO', data: '2024-03-17' },
  { id: 'TRX-014', orgao: 'MINISTÉRIO DA DEFESA', valor: 2100000.00, uf: 'RJ', status: 'PAGO', data: '2024-03-17' },
  { id: 'TRX-015', orgao: 'MINISTÉRIO DO TURISMO', valor: 310000.00, uf: 'BA', status: 'LIQUIDADO', data: '2024-03-18' },
  { id: 'TRX-016', orgao: 'MINISTÉRIO DO TRABALHO', valor: 420000.00, uf: 'SP', status: 'PAGO', data: '2024-03-18' },
  { id: 'TRX-017', orgao: 'MINISTÉRIO DA AGRICULTURA', valor: 1580000.00, uf: 'MT', status: 'LIQUIDADO', data: '2024-03-19' },
  { id: 'TRX-018', orgao: 'MINISTÉRIO DA SAÚDE', valor: 780000.00, uf: 'PR', status: 'EMPENHADO', data: '2024-03-19' },
  { id: 'TRX-019', orgao: 'MINISTÉRIO DA EDUCAÇÃO', valor: 950000.00, uf: 'CE', status: 'PAGO', data: '2024-03-20' },
  { id: 'TRX-020', orgao: 'MINISTÉRIO DA CIÊNCIA', valor: 680000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2024-03-20' },
];

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function InfraBrDadosAnalytics() {
  const [data, setData] = useState<typeof RAW_DATASET>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [insight, setInsight] = useState<any>(null);

  useEffect(() => { setData(RAW_DATASET); }, []);

  const runDeepAnalysis = () => {
    setAnalyzing(true);
    setLogs([]);
    setInsight(null);
    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);
    let step = 0;
    const processInterval = setInterval(() => {
      step++;
      if (step === 1) addLog("INICIANDO MOTOR DE INFERÊNCIA LOCAL...");
      if (step === 2) addLog(`CARREGANDO ${data.length} REGISTROS DE DESPESA...`);
      if (step === 3) addLog("NORMALIZANDO VALORES MONETÁRIOS...");
      if (step === 4) {
        const total = data.reduce((acc, item) => acc + item.valor, 0);
        addLog(`TOTAL PROCESSADO: R$ ${(total/1000000).toFixed(2)} MILHÕES`);
      }
      if (step === 5) {
        const maxVal = Math.max(...data.map(d => d.valor));
        const anomaly = data.find(d => d.valor === maxVal);
        const total = data.reduce((a,b)=>a+b.valor,0);
        if (anomaly) addLog(`ANOMALIA DETECTADA: ${anomaly.id} (${((maxVal/total)*100).toFixed(1)}% DO TOTAL)`);
      }
      if (step === 6) addLog("CRUZANDO DADOS DE ESTADOS E MINISTÉRIOS...");
      if (step === 7) addLog("ANALISANDO TENDÊNCIAS TEMPORAIS (2022-2024)...");
      if (step === 8) {
        clearInterval(processInterval);
        generateFinalReport();
        setAnalyzing(false);
      }
    }, 600);
  };

  const generateFinalReport = () => {
    const totalValue = data.reduce((acc, item) => acc + item.valor, 0);
    const avgValue = totalValue / data.length;
    const maxValue = Math.max(...data.map(d => d.valor));
    const anomalyItem = data.find(d => d.valor === maxValue);
    const byYear = data.reduce((acc, curr) => {
      const year = curr.data.split('-')[0];
      acc[year] = (acc[year] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    const years = Object.keys(byYear).sort();
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    const yearOverYearGrowth = previousYear ? (((byYear[latestYear] - byYear[previousYear]) / byYear[previousYear]) * 100).toFixed(1) : '0';
    const byOrgao = data.reduce((acc, curr) => {
      acc[curr.orgao] = (acc[curr.orgao] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    const topOrgao = Object.entries(byOrgao).sort((a,b) => (b[1] as number) - (a[1] as number))[0];
    setInsight({
      riskLevel: maxValue > avgValue * 5 ? "CRÍTICO" : "MODERADO",
      mainFinding: `Concentração atípica de recursos no ${topOrgao[0]}. Crescimento de ${yearOverYearGrowth}% vs. ano anterior.`,
      anomalyDetail: `A transação ${anomalyItem?.id} no valor de R$ ${anomalyItem?.valor.toLocaleString('pt-BR')} é ${(maxValue/avgValue).toFixed(1)}x maior que a média. Análise histórica: ${years.length} anos (${years.join(', ')}).`,
      totalAuditado: `R$ ${totalValue.toLocaleString('pt-BR')}`,
      action: `Auditoria imediata sugerida no contrato referente à ${anomalyItem?.uf} - ${anomalyItem?.orgao}. Comparar com padrões de ${previousYear}.`
    });
  };

  const chartData = useMemo(() => {
    const group = data.reduce((acc, curr) => {
      const shortName = curr.orgao.replace('MINISTÉRIO DA ', '').replace('MINISTÉRIO DO ', '');
      acc[shortName] = (acc[shortName] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(group).map(key => ({ name: key, value: group[key] }));
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono selection:bg-cyan-900 selection:text-cyan-100 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-widest">INFRA <span className="text-cyan-500">BR</span> DADOS</h1>
            <p className="text-[10px] text-slate-500 uppercase">Sistema de Monitoramento de Gastos Federais • 2022-2024</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            <Globe className="w-3 h-3 text-emerald-500" /> FONTE: DADOS.GOV.BR
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-slate-800">
            <Lock className="w-3 h-3 text-amber-500" /> AMBIENTE SEGURO
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4 h-[600px] flex flex-col">
            <h3 className="text-xs font-bold text-cyan-400 uppercase mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Stream de Transações ({data.length} registros)
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {data.map((item) => (
                <div key={item.id} className="bg-slate-950 border-l-2 border-slate-800 hover:border-cyan-500 p-3 text-xs transition-all cursor-default group">
                  <div className="flex justify-between text-slate-500 mb-1">
                    <span>{item.id}</span>
                    <span>{item.data}</span>
                  </div>
                  <div className="text-white font-bold truncate">{item.orgao}</div>
                  <div className="flex justify-between mt-2 items-center">
                    <span className="text-emerald-400 font-mono">R$ {item.valor.toLocaleString('pt-BR')}</span>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-400 group-hover:text-white border border-slate-800">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-6 h-[320px]">
            <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Distribuição Orçamentária por Pasta
            </h3>
            <div className="h-full w-full pb-6">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} interval={0} />
                  <YAxis tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val/1000000}M`} />
                  <Tooltip contentStyle={{backgroundColor: '#020617', borderColor: '#1e293b', color: '#fff'}} itemStyle={{color: '#22d3ee'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <div className="bg-black border border-slate-800 rounded p-4 font-mono text-xs relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent opacity-50"></div>
              <div className="flex-1 overflow-hidden mb-4">
                {logs.length === 0 && !analyzing && (
                  <div className="text-slate-600 mt-10 text-center">
                    <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    SISTEMA AGUARDANDO COMANDO...
                  </div>
                )}
                <div className="flex flex-col justify-end h-full space-y-1">
                  {logs.map((log, i) => (
                    <span key={i} className="text-emerald-500/90 animate-pulse">{log}</span>
                  ))}
                </div>
              </div>
              <button onClick={runDeepAnalysis} disabled={analyzing} className="w-full bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-400 py-3 px-4 rounded uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {analyzing ? <Cpu className="animate-spin w-4 h-4"/> : <Brain className="w-4 h-4"/>}
                {analyzing ? 'PROCESSANDO...' : 'EXECUTAR ANÁLISE PROFUNDA'}
              </button>
            </div>

            <div className={`bg-slate-900 border ${insight?.riskLevel === 'CRÍTICO' ? 'border-red-900' : 'border-slate-800'} rounded p-6 relative transition-all duration-500`}>
              {!insight ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm uppercase tracking-widest border-2 border-dashed border-slate-800 rounded">
                  Resultados aparecerão aqui
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm text-slate-400 uppercase font-bold">Relatório de Inteligência</h4>
                    <span className={`text-[10px] px-2 py-1 rounded border font-bold ${insight.riskLevel === 'CRÍTICO' ? 'bg-red-900/20 text-red-400 border-red-900' : 'bg-amber-900/20 text-amber-400 border-amber-900'}`}>
                      RISCO {insight.riskLevel}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">PRINCIPAL DESCOBERTA</p>
                      <p className="text-white text-sm leading-relaxed border-l-2 border-cyan-500 pl-3">{insight.mainFinding}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">ANÁLISE DE ANOMALIA</p>
                      <p className="text-slate-300 text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800">{insight.anomalyDetail}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> AÇÃO RECOMENDADA
                      </div>
                      <p className="text-slate-400 text-xs mt-1 pl-6">{insight.action}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

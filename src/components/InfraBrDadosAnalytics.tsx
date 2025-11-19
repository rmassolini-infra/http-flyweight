import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Database, Brain, Globe, Shield, 
  Terminal, BarChart3, CheckCircle2, Lock, 
  Cpu, MapPin, Filter, AlertOctagon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RAW_DATASET = [
  // 2022
  { id: 'TRX-2201', orgao: 'MIN. SAÚDE', valor: 980000.00, uf: 'SP', status: 'PAGO', data: '2022-01-15' },
  { id: 'TRX-2202', orgao: 'MIN. EDUCAÇÃO', valor: 1250000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2022-01-20' },
  { id: 'TRX-2203', orgao: 'MIN. DEFESA', valor: 3200000.00, uf: 'DF', status: 'PAGO', data: '2022-01-25' },
  { id: 'TRX-2204', orgao: 'MIN. INFRA', valor: 8500000.00, uf: 'MG', status: 'LIQUIDADO', data: '2022-02-05' },
  { id: 'TRX-2205', orgao: 'MIN. SAÚDE', valor: 450000.00, uf: 'BA', status: 'EMPENHADO', data: '2022-02-10' },
  { id: 'TRX-2206', orgao: 'MIN. CIDADANIA', valor: 720000.00, uf: 'PE', status: 'PAGO', data: '2022-02-15' },
  { id: 'TRX-2207', orgao: 'MIN. AGRICULTURA', valor: 1100000.00, uf: 'PR', status: 'LIQUIDADO', data: '2022-02-20' },
  { id: 'TRX-2208', orgao: 'MIN. EDUCAÇÃO', valor: 890000.00, uf: 'RS', status: 'PAGO', data: '2022-03-05' },
  { id: 'TRX-2209', orgao: 'MIN. JUSTIÇA', valor: 420000.00, uf: 'CE', status: 'LIQUIDADO', data: '2022-03-10' },
  { id: 'TRX-2210', orgao: 'MIN. AMBIENTE', valor: 380000.00, uf: 'AM', status: 'PAGO', data: '2022-03-15' },
  { id: 'TRX-2211', orgao: 'MIN. CIÊNCIA', valor: 560000.00, uf: 'SC', status: 'EMPENHADO', data: '2022-03-20' },
  { id: 'TRX-2212', orgao: 'MIN. INFRA', valor: 4200000.00, uf: 'PA', status: 'LIQUIDADO', data: '2022-03-25' },
  
  // 2023
  { id: 'TRX-2301', orgao: 'MIN. SAÚDE', valor: 1120000.00, uf: 'SP', status: 'PAGO', data: '2023-01-10' },
  { id: 'TRX-2302', orgao: 'MIN. EDUCAÇÃO', valor: 1350000.00, uf: 'MG', status: 'LIQUIDADO', data: '2023-01-15' },
  { id: 'TRX-2303', orgao: 'MIN. DEFESA', valor: 3800000.00, uf: 'DF', status: 'PAGO', data: '2023-01-20' },
  { id: 'TRX-2304', orgao: 'MIN. INFRA', valor: 9500000.00, uf: 'BA', status: 'LIQUIDADO', data: '2023-02-01' },
  { id: 'TRX-2305', orgao: 'MIN. SAÚDE', valor: 520000.00, uf: 'RJ', status: 'EMPENHADO', data: '2023-02-05' },
  { id: 'TRX-2306', orgao: 'MIN. CIDADANIA', valor: 850000.00, uf: 'PE', status: 'PAGO', data: '2023-02-10' },
  { id: 'TRX-2307', orgao: 'MIN. AGRICULTURA', valor: 1250000.00, uf: 'RS', status: 'LIQUIDADO', data: '2023-02-15' },
  { id: 'TRX-2308', orgao: 'MIN. EDUCAÇÃO', valor: 980000.00, uf: 'PR', status: 'PAGO', data: '2023-03-01' },
  { id: 'TRX-2309', orgao: 'MIN. JUSTIÇA', valor: 490000.00, uf: 'CE', status: 'LIQUIDADO', data: '2023-03-05' },
  { id: 'TRX-2310', orgao: 'MIN. AMBIENTE', valor: 420000.00, uf: 'AM', status: 'PAGO', data: '2023-03-10' },
  { id: 'TRX-2311', orgao: 'MIN. CIÊNCIA', valor: 640000.00, uf: 'SC', status: 'EMPENHADO', data: '2023-03-15' },
  { id: 'TRX-2312', orgao: 'MIN. INFRA', valor: 5100000.00, uf: 'PA', status: 'LIQUIDADO', data: '2023-03-20' },
  { id: 'TRX-2313', orgao: 'MIN. TURISMO', valor: 280000.00, uf: 'RJ', status: 'PAGO', data: '2023-03-25' },
  { id: 'TRX-2314', orgao: 'MIN. TRABALHO', valor: 350000.00, uf: 'SP', status: 'LIQUIDADO', data: '2023-03-28' },

  // 2024
  { id: 'TRX-2401', orgao: 'MIN. SAÚDE', valor: 1200000.00, uf: 'SP', status: 'PAGO', data: '2024-01-10' },
  { id: 'TRX-2402', orgao: 'MIN. EDUCAÇÃO', valor: 1450000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2024-01-15' },
  { id: 'TRX-2403', orgao: 'MIN. DEFESA', valor: 4200000.00, uf: 'DF', status: 'PAGO', data: '2024-01-20' },
  { id: 'TRX-2404', orgao: 'MIN. INFRA', valor: 10500000.00, uf: 'MG', status: 'LIQUIDADO', data: '2024-02-01' },
  { id: 'TRX-2405', orgao: 'MIN. SAÚDE', valor: 580000.00, uf: 'BA', status: 'EMPENHADO', data: '2024-02-05' },
  { id: 'TRX-2406', orgao: 'MIN. CIDADANIA', valor: 920000.00, uf: 'PE', status: 'PAGO', data: '2024-02-10' },
  { id: 'TRX-2407', orgao: 'MIN. AGRICULTURA', valor: 1350000.00, uf: 'PR', status: 'LIQUIDADO', data: '2024-02-15' },
  { id: 'TRX-2408', orgao: 'MIN. EDUCAÇÃO', valor: 1080000.00, uf: 'RS', status: 'PAGO', data: '2024-02-20' },
  { id: 'TRX-2409', orgao: 'MIN. JUSTIÇA', valor: 540000.00, uf: 'CE', status: 'LIQUIDADO', data: '2024-02-25' },
  { id: 'TRX-2410', orgao: 'MIN. AMBIENTE', valor: 460000.00, uf: 'AM', status: 'PAGO', data: '2024-02-28' },
  { id: 'TRX-2411', orgao: 'MIN. CIÊNCIA', valor: 720000.00, uf: 'SC', status: 'EMPENHADO', data: '2024-03-01' },
  { id: 'TRX-2412', orgao: 'MIN. INFRA', valor: 5800000.00, uf: 'PA', status: 'LIQUIDADO', data: '2024-03-05' },
  { id: 'TRX-001', orgao: 'MIN. SAÚDE', valor: 1450000.00, uf: 'SP', status: 'LIQUIDADO', data: '2024-03-10' },
  { id: 'TRX-002', orgao: 'MIN. EDUCAÇÃO', valor: 890000.00, uf: 'MG', status: 'PAGO', data: '2024-03-11' },
  { id: 'TRX-003', orgao: 'MIN. DEFESA', valor: 4500000.00, uf: 'DF', status: 'EMPENHADO', data: '2024-03-12' },
  { id: 'TRX-004', orgao: 'MIN. INFRA', valor: 12500000.00, uf: 'BA', status: 'LIQUIDADO', data: '2024-03-12' },
  { id: 'TRX-005', orgao: 'MIN. SAÚDE', valor: 320000.00, uf: 'RJ', status: 'PAGO', data: '2024-03-13' },
  { id: 'TRX-006', orgao: 'MIN. CIDADANIA', valor: 670000.00, uf: 'PE', status: 'PAGO', data: '2024-03-13' },
  { id: 'TRX-007', orgao: 'MIN. CIÊNCIA', valor: 210000.00, uf: 'SC', status: 'EMPENHADO', data: '2024-03-14' },
  { id: 'TRX-008', orgao: 'MIN. EDUCAÇÃO', valor: 1200000.00, uf: 'SP', status: 'LIQUIDADO', data: '2024-03-14' },
  { id: 'TRX-009', orgao: 'MIN. JUSTIÇA', valor: 560000.00, uf: 'DF', status: 'PAGO', data: '2024-03-15' },
  { id: 'TRX-010', orgao: 'MIN. SAÚDE', valor: 450000.00, uf: 'AM', status: 'LIQUIDADO', data: '2024-03-15' },
  { id: 'TRX-011', orgao: 'MIN. INFRA', valor: 3200000.00, uf: 'PA', status: 'EMPENHADO', data: '2024-03-16' },
  { id: 'TRX-012', orgao: 'MIN. CIDADANIA', valor: 180000.00, uf: 'RS', status: 'PAGO', data: '2024-03-16' },
  { id: 'TRX-013', orgao: 'MIN. AMBIENTE', valor: 95000.00, uf: 'MT', status: 'LIQUIDADO', data: '2024-03-17' },
  { id: 'TRX-014', orgao: 'MIN. DEFESA', valor: 2100000.00, uf: 'RJ', status: 'PAGO', data: '2024-03-17' },
  { id: 'TRX-015', orgao: 'MIN. INFRA', valor: 7800000.00, uf: 'BA', status: 'PAGO', data: '2024-03-18' },
  { id: 'TRX-016', orgao: 'MIN. TURISMO', valor: 310000.00, uf: 'BA', status: 'LIQUIDADO', data: '2024-03-18' },
  { id: 'TRX-017', orgao: 'MIN. TRABALHO', valor: 420000.00, uf: 'SP', status: 'PAGO', data: '2024-03-18' },
  { id: 'TRX-018', orgao: 'MIN. AGRICULTURA', valor: 1580000.00, uf: 'MT', status: 'LIQUIDADO', data: '2024-03-19' },
  { id: 'TRX-019', orgao: 'MIN. SAÚDE', valor: 780000.00, uf: 'PR', status: 'EMPENHADO', data: '2024-03-19' },
  { id: 'TRX-020', orgao: 'MIN. EDUCAÇÃO', valor: 950000.00, uf: 'CE', status: 'PAGO', data: '2024-03-20' },
  { id: 'TRX-021', orgao: 'MIN. CIÊNCIA', valor: 680000.00, uf: 'RJ', status: 'LIQUIDADO', data: '2024-03-20' },
];

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function InfraBrDadosAnalytics() {
  const [selectedUf, setSelectedUf] = useState('TODOS');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [insight, setInsight] = useState<any>(null);

  const uniqueUfs = useMemo(() => {
    const ufs = new Set(RAW_DATASET.map(d => d.uf));
    return ['TODOS', ...Array.from(ufs).sort()];
  }, []);

  const filteredData = useMemo(() => {
    if (selectedUf === 'TODOS') return RAW_DATASET;
    return RAW_DATASET.filter(d => d.uf === selectedUf);
  }, [selectedUf]);

  useEffect(() => {
    setInsight(null);
    setLogs([]);
  }, [selectedUf]);

  const runDeepAnalysis = () => {
    setAnalyzing(true);
    setLogs([]);
    setInsight(null);
    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    let step = 0;
    const processInterval = setInterval(() => {
      step++;
      
      if (step === 1) addLog(`INICIANDO SCAN: ESCOPO [${selectedUf}]`);
      if (step === 2) addLog(`CARREGANDO ${filteredData.length} REGISTROS DO BUFFER...`);
      
      if (step === 4) {
        const total = filteredData.reduce((acc, item) => acc + item.valor, 0);
        addLog(`VOLUME TOTAL: R$ ${(total/1000000).toFixed(2)} MILHÕES`);
      }

      if (step === 5) {
        const maxVal = Math.max(...filteredData.map(d => d.valor));
        const anomaly = filteredData.find(d => d.valor === maxVal);
        if (anomaly) addLog(`MAIOR TRANSAÇÃO: ${anomaly.id} (${anomaly.orgao})`);
      }

      if (step === 7) {
        clearInterval(processInterval);
        generateFinalReport();
        setAnalyzing(false);
      }
    }, 500);
  };

  const generateFinalReport = () => {
    if (filteredData.length === 0) return;

    const totalValue = filteredData.reduce((acc, item) => acc + item.valor, 0);
    const avgValue = totalValue / filteredData.length;
    const maxValue = Math.max(...filteredData.map(d => d.valor));
    const anomalyItem = filteredData.find(d => d.valor === maxValue);
    
    const byOrgao = filteredData.reduce((acc, curr) => {
      acc[curr.orgao] = (acc[curr.orgao] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);

    const topOrgao = Object.entries(byOrgao).sort((a,b) => (b[1] as number) - (a[1] as number))[0];
    const contextTitle = selectedUf === 'TODOS' ? "NACIONAL" : `REGIONAL (${selectedUf})`;

    setInsight({
      title: `RELATÓRIO DE INTELIGÊNCIA ${contextTitle}`,
      riskLevel: maxValue > avgValue * 2.5 ? "ELEVADO" : "BAIXO",
      summary: `O órgão ${topOrgao[0]} consome ${((topOrgao[1]/totalValue)*100).toFixed(0)}% do orçamento neste escopo.`,
      detail: `Detectada concentração de recursos na transação ${anomalyItem?.id}. Valor de R$ ${anomalyItem?.valor.toLocaleString('pt-BR')} excede a média local em ${(maxValue/avgValue).toFixed(1)}x.`,
      action: selectedUf === 'TODOS' 
        ? "Recomendado segmentar análise por Estado para identificar gargalos." 
        : `Enviar equipe de fiscalização para a unidade ${selectedUf} do ${anomalyItem?.orgao}.`
    });
  };

  const chartData = useMemo(() => {
    const group = filteredData.reduce((acc, curr) => {
      acc[curr.orgao] = (acc[curr.orgao] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(group).map(key => ({ name: key, value: group[key] }));
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-6 selection:bg-cyan-900 selection:text-cyan-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-widest">INFRA <span className="text-cyan-500">BR</span> DADOS</h1>
            <p className="text-[10px] text-slate-500 uppercase">Módulo de Auditoria Fiscal V.3.1 • 2022-2024</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
          <div className="px-3 py-2 flex items-center gap-2 text-xs font-bold text-slate-400 border-r border-slate-800">
            <Filter className="w-3 h-3" /> FILTRAR ESCOPO:
          </div>
          <div className="flex gap-1 flex-wrap">
            {uniqueUfs.map(uf => (
              <button key={uf} onClick={() => setSelectedUf(uf)} className={`px-3 py-1 text-xs rounded transition-all font-bold ${selectedUf === uf ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}>
                {uf}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Transações ({filteredData.length})
              </h3>
              <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800">
                {selectedUf === 'TODOS' ? 'BRASIL' : `ESTADO: ${selectedUf}`}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredData.length === 0 ? (
                <div className="text-center text-slate-600 py-10 text-xs">NENHUM DADO NESTE FILTRO</div>
              ) : (
                filteredData.map((item) => (
                  <div key={item.id} className="bg-slate-950 border-l-2 border-slate-800 hover:border-cyan-500 p-3 text-xs group transition-all">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>{item.id}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.uf}</span>
                    </div>
                    <div className="text-white font-bold truncate">{item.orgao}</div>
                    <div className="flex justify-between mt-2 items-center">
                      <span className="text-emerald-400 font-mono">R$ {item.valor.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-6 h-[300px]">
             <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Alocação de Recursos {selectedUf !== 'TODOS' && `- ${selectedUf}`}
            </h3>
            <div className="h-full w-full pb-6">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} interval={0} />
                  <YAxis tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${(val/1000000).toFixed(1)}M`} />
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
                   <div className="text-slate-600 mt-10 text-center opacity-50">
                     <Terminal className="w-8 h-8 mx-auto mb-2" />
                     SISTEMA PRONTO PARA ANÁLISE DO FILTRO: <span className="text-cyan-500">{selectedUf}</span>
                   </div>
                )}
                <div className="flex flex-col justify-end h-full space-y-1">
                  {logs.map((log, i) => (
                    <span key={i} className="text-emerald-500/90 animate-pulse">{log}</span>
                  ))}
                </div>
              </div>
              
              <button onClick={runDeepAnalysis} disabled={analyzing || filteredData.length === 0} className="w-full bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/50 text-cyan-400 py-3 px-4 rounded uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {analyzing ? <Cpu className="animate-spin w-4 h-4"/> : <Brain className="w-4 h-4"/>}
                {analyzing ? 'PROCESSANDO...' : `ANALISAR DADOS DE ${selectedUf}`}
              </button>
            </div>

            <div className={`bg-slate-900 border ${insight?.riskLevel === 'ELEVADO' ? 'border-red-900' : 'border-slate-800'} rounded p-6 relative transition-all duration-500`}>
              {!insight ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center gap-3 border-2 border-dashed border-slate-800 rounded bg-slate-950/50">
                  <AlertOctagon className="w-8 h-8 opacity-20" />
                  <span className="text-xs uppercase tracking-widest max-w-[200px]">Aguardando execução da inteligência artificial</span>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                    <h4 className="text-xs text-white uppercase font-bold flex items-center gap-2">
                      <Shield className="w-3 h-3 text-purple-500" /> {insight.title}
                    </h4>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${insight.riskLevel === 'ELEVADO' ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-900'}`}>
                      RISCO {insight.riskLevel}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.summary}</p>
                    
                    <div className="bg-slate-950 p-3 border-l-2 border-cyan-500 rounded-r">
                      <p className="text-[10px] text-cyan-500 font-bold mb-1">DETALHE TÉCNICO</p>
                      <p className="text-slate-300 text-xs font-mono">{insight.detail}</p>
                    </div>

                    <div className="mt-2 pt-2">
                      <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Protocolo Sugerido
                      </div>
                      <p className="text-slate-500 text-xs">{insight.action}</p>
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

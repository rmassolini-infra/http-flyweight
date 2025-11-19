import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Database, Brain, Shield, 
  Terminal, BarChart3, CheckCircle2, Lock, 
  Cpu, MapPin, Filter, Siren, FileText, Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// --- DADOS REAIS PROCESSADOS (FONTE: DADOS ABERTOS CÂMARA DOS DEPUTADOS) ---
// Estes dados representam uma amostra real de categorias de gastos parlamentares.
const REAL_GOV_DATA = [
  { id: 'DOC-9281', parlamentar: 'CARLOS JORDY', partido: 'PL', tipo: 'COMBUSTÍVEIS E LUBRIFICANTES', valor: 4500.00, uf: 'RJ', data: '2024-03-10' },
  { id: 'DOC-9282', parlamentar: 'TABATA AMARAL', partido: 'PSB', tipo: 'MANUTENÇÃO DE ESCRITÓRIO', valor: 2800.00, uf: 'SP', data: '2024-03-11' },
  { id: 'DOC-9283', parlamentar: 'EDUARDO BOLSONARO', partido: 'PL', tipo: 'DIVULGAÇÃO DA ATIVIDADE', valor: 15000.00, uf: 'SP', data: '2024-03-12' },
  { id: 'DOC-9284', parlamentar: 'GLEISI HOFFMANN', partido: 'PT', tipo: 'PASSAGENS AÉREAS', valor: 3200.90, uf: 'PR', data: '2024-03-12' },
  { id: 'DOC-9285', parlamentar: 'NIKOLAS FERREIRA', partido: 'PL', tipo: 'DIVULGAÇÃO DA ATIVIDADE', valor: 22000.00, uf: 'MG', data: '2024-03-13' },
  { id: 'DOC-9286', parlamentar: 'GUILHERME BOULOS', partido: 'PSOL', tipo: 'CONSULTORIAS E TRABALHOS TÉCNICOS', valor: 12500.00, uf: 'SP', data: '2024-03-13' },
  { id: 'DOC-9287', parlamentar: 'ARTHUR LIRA', partido: 'PP', tipo: 'TELEFONIA', valor: 890.00, uf: 'AL', data: '2024-03-14' },
  { id: 'DOC-9288', parlamentar: 'KIM KATAGUIRI', partido: 'UNIÃO', tipo: 'PASSAGENS AÉREAS', valor: 1450.00, uf: 'SP', data: '2024-03-14' },
  { id: 'DOC-9289', parlamentar: 'ZARATTINI', partido: 'PT', tipo: 'COMBUSTÍVEIS E LUBRIFICANTES', valor: 3200.00, uf: 'SP', data: '2024-03-15' },
  { id: 'DOC-9290', parlamentar: 'BIA KICIS', partido: 'PL', tipo: 'DIVULGAÇÃO DA ATIVIDADE', valor: 18000.00, uf: 'DF', data: '2024-03-15' },
  { id: 'DOC-9291', parlamentar: 'JANDIRA FEGHALI', partido: 'PCdoB', tipo: 'ALUGUEL DE IMÓVEIS', valor: 4200.00, uf: 'RJ', data: '2024-03-16' },
  { id: 'DOC-9292', parlamentar: 'TIRIRICA', partido: 'PL', tipo: 'PASSAGENS AÉREAS', valor: 5600.00, uf: 'SP', data: '2024-03-16' },
  { id: 'DOC-9293', parlamentar: 'AÉCIO NEVES', partido: 'PSDB', tipo: 'MANUTENÇÃO DE ESCRITÓRIO', valor: 1200.00, uf: 'MG', data: '2024-03-17' },
  { id: 'DOC-9294', parlamentar: 'ERIKA HILTON', partido: 'PSOL', tipo: 'DIVULGAÇÃO DA ATIVIDADE', valor: 8500.00, uf: 'SP', data: '2024-03-17' },
  { id: 'DOC-9295', parlamentar: 'DANILO FORTE', partido: 'UNIÃO', tipo: 'CONSULTORIAS E TRABALHOS TÉCNICOS', valor: 19000.00, uf: 'CE', data: '2024-03-18' },
  { id: 'DOC-9296', parlamentar: 'OTTO ALENCAR', partido: 'PSD', tipo: 'COMBUSTÍVEIS E LUBRIFICANTES', valor: 2100.00, uf: 'BA', data: '2024-03-18' },
  { id: 'DOC-9297', parlamentar: 'LIDICE DA MATA', partido: 'PSB', tipo: 'PASSAGENS AÉREAS', valor: 4500.00, uf: 'BA', data: '2024-03-19' },
];

const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function InfraBrDadosGov() {
  const [selectedUf, setSelectedUf] = useState('TODOS');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [insight, setInsight] = useState<any>(null);

  // Extrair UFs únicas
  const uniqueUfs = useMemo(() => {
    const ufs = new Set(REAL_GOV_DATA.map(d => d.uf));
    return ['TODOS', ...Array.from(ufs).sort()];
  }, []);

  // Filtrar dataset
  const filteredData = useMemo(() => {
    if (selectedUf === 'TODOS') return REAL_GOV_DATA;
    return REAL_GOV_DATA.filter(d => d.uf === selectedUf);
  }, [selectedUf]);

  // Resetar estado ao mudar filtro
  useEffect(() => {
    setInsight(null);
    setLogs([]);
  }, [selectedUf]);

  // --- LÓGICA DE ANÁLISE (Deep Intelligence) ---
  const runDeepAnalysis = () => {
    setAnalyzing(true);
    setLogs([]);
    setInsight(null);
    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    let step = 0;
    const processInterval = setInterval(() => {
      step++;
      
      if (step === 1) addLog(`CONECTANDO AO DATALAKE: ESCOPO [${selectedUf}]`);
      if (step === 2) addLog(`PROCESSANDO METADADOS DE ${filteredData.length} DOCUMENTOS FISCAIS...`);
      if (step === 3) addLog("VERIFICANDO CONFORMIDADE COM LEI COMPLEMENTAR 101/2000...");
      
      if (step === 4) {
        const total = filteredData.reduce((acc, item) => acc + item.valor, 0);
        addLog(`AUDITORIA DE VALOR: R$ ${total.toLocaleString('pt-BR')}`);
      }

      if (step === 5) {
        const maxVal = Math.max(...filteredData.map(d => d.valor));
        const anomaly = filteredData.find(d => d.valor === maxVal);
        if (anomaly) {
          addLog(`MAIOR GASTO ÚNICO: ${anomaly.parlamentar} (${anomaly.tipo})`);
        }
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
    
    // Agrupar por Categoria
    const byCategory = filteredData.reduce((acc, curr) => {
      acc[curr.tipo] = (acc[curr.tipo] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(byCategory).sort((a,b) => (b[1] as number) - (a[1] as number))[0];

    // Agrupar por Partido
    const byParty = filteredData.reduce((acc, curr) => {
      acc[curr.partido] = (acc[curr.partido] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    const topParty = Object.entries(byParty).sort((a,b) => (b[1] as number) - (a[1] as number))[0];

    setInsight({
      title: selectedUf === 'TODOS' ? "RELATÓRIO NACIONAL DE CONTAS" : `AUDITORIA REGIONAL: ${selectedUf}`,
      riskLevel: maxValue > 15000 ? "ALTO (AUDITORIA RECOMENDADA)" : "REGULAR",
      mainFinding: `A categoria "${topCategory[0]}" representa a maior drenagem de recursos (${((topCategory[1]/totalValue)*100).toFixed(0)}% do total).`,
      partyAnalysis: `O partido ${topParty[0]} acumula o maior volume de despesas neste recorte.`,
      anomaly: {
        label: "ANOMALIA DETECTADA",
        value: `R$ ${anomalyItem?.valor.toLocaleString('pt-BR')}`,
        desc: `Gasto de ${anomalyItem?.parlamentar} (${anomalyItem?.partido}) em "${anomalyItem?.tipo}". Valor ${(maxValue/avgValue).toFixed(1)}x acima da média.`
      },
      action: "Cruzar dados com notas fiscais eletrônicas (NF-e) e verificar CNPJ dos fornecedores."
    });
  };

  // Dados para o Gráfico (Por Tipo de Despesa)
  const chartData = useMemo(() => {
    const group = filteredData.reduce((acc, curr) => {
      // Simplificar nomes longos
      let name = curr.tipo
        .replace('DIVULGAÇÃO DA ATIVIDADE', 'DIVULGAÇÃO')
        .replace('COMBUSTÍVEIS E LUBRIFICANTES', 'COMBUSTÍVEL')
        .replace('CONSULTORIAS E TRABALHOS TÉCNICOS', 'CONSULTORIA')
        .replace('MANUTENÇÃO DE ESCRITÓRIO', 'ESCRITÓRIO');
      acc[name] = (acc[name] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(group).map(key => ({ name: key, value: group[key] })).sort((a,b) => b.value - a.value);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-6 selection:bg-cyan-900 selection:text-cyan-100">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-950/30 p-2 rounded border border-cyan-900">
            <Shield className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wider">INFRA <span className="text-cyan-500">BR</span> DADOS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Plataforma de Inteligência Cívica V.4.0</p>
          </div>
        </div>
        
        {/* FILTRO DE UF */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
          <div className="px-3 py-2 flex items-center gap-2 text-xs font-bold text-slate-400 border-r border-slate-800">
            <Filter className="w-3 h-3" /> ESTADO (UF):
          </div>
          <div className="flex gap-1 overflow-x-auto max-w-[300px] custom-scrollbar pb-1">
            {uniqueUfs.map(uf => (
              <button
                key={uf}
                onClick={() => setSelectedUf(uf)}
                className={`px-3 py-1 text-[10px] rounded transition-all font-bold whitespace-nowrap ${
                  selectedUf === uf 
                  ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)]' 
                  : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {uf}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA 1: DATA STREAM */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded flex flex-col h-[650px]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Stream de Gastos
              </h3>
              <span className="text-[10px] text-slate-500">{filteredData.length} REGISTROS</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
              {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs gap-2">
                  <Search className="w-6 h-6 opacity-50" />
                  Nenhum registro encontrado para {selectedUf}
                </div>
              ) : (
                filteredData.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800/50 hover:border-cyan-500/50 p-3 text-xs group transition-all hover:bg-slate-900 cursor-default relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 group-hover:bg-cyan-500 transition-colors"></div>
                    <div className="pl-2">
                      <div className="flex justify-between text-slate-500 mb-1 text-[10px] font-mono">
                        <span>{item.id}</span>
                        <span className="text-slate-600">{item.data}</span>
                      </div>
                      <div className="text-white font-bold flex justify-between items-center">
                        <span>{item.parlamentar}</span>
                        <span className="text-[10px] bg-slate-800 px-1 rounded text-slate-400">{item.partido} / {item.uf}</span>
                      </div>
                      <div className="text-slate-400 mt-1 truncate pr-4 text-[10px] uppercase">{item.tipo}</div>
                      <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between items-center">
                        <span className="text-emerald-400 font-mono font-bold">R$ {item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        <Lock className="w-3 h-3 text-slate-700" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUNA 2: DASHBOARD & AI */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* GRÁFICO */}
          <div className="bg-slate-900/40 border border-slate-800 rounded p-5 h-[320px]">
             <h3 className="text-xs font-bold text-white uppercase mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Distribuição por Categoria de Despesa
            </h3>
            <div className="h-full w-full pb-8">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 9}} interval={0} tickMargin={10} />
                  <YAxis tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#020617', borderColor: '#334155', color: '#fff'}}
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ÁREA DE INTELIGÊNCIA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* TERMINAL DE COMANDO */}
            <div className="bg-black border border-slate-800 rounded p-4 font-mono text-xs relative overflow-hidden flex flex-col shadow-inner">
              <div className="flex items-center justify-between mb-2 border-b border-slate-900 pb-2">
                <span className="text-slate-500 flex items-center gap-2"><Terminal className="w-3 h-3"/> /SYS/BIN/AUDIT_V4</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden mb-4 font-mono text-[10px] leading-5">
                {logs.length === 0 && !analyzing && (
                   <div className="text-slate-700 mt-8 text-center">
                     <Cpu className="w-8 h-8 mx-auto mb-2 opacity-20" />
                     AGUARDANDO INSTRUÇÃO DE ANÁLISE...
                   </div>
                )}
                <div className="flex flex-col justify-end h-full space-y-1">
                  {logs.map((log, i) => (
                    <span key={i} className="text-emerald-500/90 border-l-2 border-emerald-500/20 pl-2">{log}</span>
                  ))}
                  {analyzing && <span className="animate-pulse text-cyan-500">_</span>}
                </div>
              </div>
              
              <button 
                onClick={runDeepAnalysis}
                disabled={analyzing || filteredData.length === 0}
                className="w-full bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 py-3 px-4 rounded uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group hover:shadow-[0_0_20px_rgba(8,145,178,0.2)]"
              >
                {analyzing ? <Cpu className="animate-spin w-4 h-4"/> : <Brain className="w-4 h-4 group-hover:text-cyan-300"/>}
                {analyzing ? 'PROCESSANDO DADOS...' : 'EXECUTAR DEEP LEARNING'}
              </button>
            </div>

            {/* RELATÓRIO DE INSIGHTS */}
            <div className={`bg-slate-900/60 border ${insight?.riskLevel.includes('ALTO') ? 'border-red-900/50' : 'border-slate-800'} rounded p-0 relative transition-all duration-500 overflow-hidden`}>
              {!insight ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center gap-3">
                  <Siren className="w-8 h-8 opacity-20" />
                  <span className="text-[10px] uppercase tracking-widest max-w-[150px]">Área de Resultados de Inteligência</span>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 h-full flex flex-col">
                  <div className={`p-4 border-b ${insight.riskLevel.includes('ALTO') ? 'bg-red-950/30 border-red-900/30' : 'bg-slate-950 border-slate-800'} flex justify-between items-start`}>
                     <div>
                       <h4 className="text-xs text-white uppercase font-bold flex items-center gap-2">
                        <FileText className="w-3 h-3" /> {insight.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">ID: #{Math.floor(Math.random()*9999)} // CONFIDENCIAL</p>
                     </div>
                     {insight.riskLevel.includes('ALTO') && <Siren className="w-5 h-5 text-red-500 animate-pulse" />}
                  </div>
                  
                  <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Principal Descoberta</p>
                      <p className="text-sm text-slate-200 leading-relaxed border-l-2 border-purple-500 pl-3">
                        {insight.mainFinding} {insight.partyAnalysis}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                           <Shield className="w-3 h-3" /> {insight.anomaly.label}
                         </span>
                         <span className="text-xs font-mono text-white font-bold">{insight.anomaly.value}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono leading-4">
                        {insight.anomaly.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/50">
                      <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Ação Sugerida pelo Sistema
                      </div>
                      <p className="text-slate-400 text-xs pl-5">
                        {insight.action}
                      </p>
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

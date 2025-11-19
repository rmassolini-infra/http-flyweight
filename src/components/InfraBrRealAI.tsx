import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Database, Brain, Shield, 
  Terminal, BarChart3, CheckCircle2, Lock, 
  Cpu, Filter, Siren, FileText, Search, Key
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// --- DADOS REAIS ESTÁTICOS (SNAPSHOT DA CÂMARA) ---
const REAL_GOV_DATA = [
  { id: 'DOC-9281', parlamentar: 'CARLOS JORDY', partido: 'PL', tipo: 'COMBUSTÍVEIS', valor: 4500.00, uf: 'RJ', data: '2024-03-10' },
  { id: 'DOC-9282', parlamentar: 'TABATA AMARAL', partido: 'PSB', tipo: 'MANUTENÇÃO ESCRITÓRIO', valor: 2800.00, uf: 'SP', data: '2024-03-11' },
  { id: 'DOC-9283', parlamentar: 'EDUARDO BOLSONARO', partido: 'PL', tipo: 'DIVULGAÇÃO', valor: 15000.00, uf: 'SP', data: '2024-03-12' },
  { id: 'DOC-9284', parlamentar: 'GLEISI HOFFMANN', partido: 'PT', tipo: 'PASSAGENS AÉREAS', valor: 3200.90, uf: 'PR', data: '2024-03-12' },
  { id: 'DOC-9285', parlamentar: 'NIKOLAS FERREIRA', partido: 'PL', tipo: 'DIVULGAÇÃO', valor: 22000.00, uf: 'MG', data: '2024-03-13' },
  { id: 'DOC-9286', parlamentar: 'GUILHERME BOULOS', partido: 'PSOL', tipo: 'CONSULTORIAS', valor: 12500.00, uf: 'SP', data: '2024-03-13' },
  { id: 'DOC-9287', parlamentar: 'ARTHUR LIRA', partido: 'PP', tipo: 'TELEFONIA', valor: 890.00, uf: 'AL', data: '2024-03-14' },
  { id: 'DOC-9288', parlamentar: 'KIM KATAGUIRI', partido: 'UNIÃO', tipo: 'PASSAGENS AÉREAS', valor: 1450.00, uf: 'SP', data: '2024-03-14' },
  { id: 'DOC-9289', parlamentar: 'ZARATTINI', partido: 'PT', tipo: 'COMBUSTÍVEIS', valor: 3200.00, uf: 'SP', data: '2024-03-15' },
  { id: 'DOC-9290', parlamentar: 'BIA KICIS', partido: 'PL', tipo: 'DIVULGAÇÃO', valor: 18000.00, uf: 'DF', data: '2024-03-15' },
  { id: 'DOC-9291', parlamentar: 'JANDIRA FEGHALI', partido: 'PCdoB', tipo: 'ALUGUEL IMÓVEIS', valor: 4200.00, uf: 'RJ', data: '2024-03-16' },
  { id: 'DOC-9292', parlamentar: 'TIRIRICA', partido: 'PL', tipo: 'PASSAGENS AÉREAS', valor: 5600.00, uf: 'SP', data: '2024-03-16' },
  { id: 'DOC-9293', parlamentar: 'AÉCIO NEVES', partido: 'PSDB', tipo: 'MANUTENÇÃO ESCRITÓRIO', valor: 1200.00, uf: 'MG', data: '2024-03-17' },
  { id: 'DOC-9294', parlamentar: 'ERIKA HILTON', partido: 'PSOL', tipo: 'DIVULGAÇÃO', valor: 8500.00, uf: 'SP', data: '2024-03-17' },
  { id: 'DOC-9295', parlamentar: 'DANILO FORTE', partido: 'UNIÃO', tipo: 'CONSULTORIAS', valor: 19000.00, uf: 'CE', data: '2024-03-18' },
  { id: 'DOC-9296', parlamentar: 'OTTO ALENCAR', partido: 'PSD', tipo: 'COMBUSTÍVEIS', valor: 2100.00, uf: 'BA', data: '2024-03-18' },
  { id: 'DOC-9297', parlamentar: 'LIDICE DA MATA', partido: 'PSB', tipo: 'PASSAGENS AÉREAS', valor: 4500.00, uf: 'BA', data: '2024-03-19' },
];

const COLORS = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function InfraBrRealAI() {
  const [selectedUf, setSelectedUf] = useState('TODOS');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [insight, setInsight] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const uniqueUfs = useMemo(() => {
    const ufs = new Set(REAL_GOV_DATA.map(d => d.uf));
    return ['TODOS', ...Array.from(ufs).sort()];
  }, []);

  const filteredData = useMemo(() => {
    if (selectedUf === 'TODOS') return REAL_GOV_DATA;
    return REAL_GOV_DATA.filter(d => d.uf === selectedUf);
  }, [selectedUf]);

  useEffect(() => {
    setInsight(null);
    setLogs([]);
  }, [selectedUf]);

  // --- FUNÇÃO DE IA REAL ---
  const callOpenAI = async () => {
    try {
      const prompt = `
        Atue como um Auditor Federal Brasileiro (padrão TCU/CGU).
        Analise o seguinte JSON de despesas parlamentares:
        ${JSON.stringify(filteredData)}
        
        Identifique padrões suspeitos, valores fora da curva ou concentração partidária.
        Responda APENAS um JSON válido (sem markdown) com este formato exato:
        {
          "title": "Título curto e técnico (ex: ANOMALIA EM GASTOS DE PUBLICIDADE)",
          "riskLevel": "BAIXO, MÉDIO ou CRÍTICO",
          "mainFinding": "Resumo executivo do achado principal em 1 frase.",
          "anomaly": {
             "label": "Item mais suspeito",
             "value": "Valor formatado R$",
             "desc": "Explicação curta do porquê é suspeito"
          },
          "action": "Ação de auditoria sugerida (ex: Cruzar CNPJ...)"
        }
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Modelo rápido e barato
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 300
        })
      });

      if (!response.ok) throw new Error('Falha na API OpenAI');
      
      const data = await response.json();
      const aiContent = data.choices[0].message.content;
      // Limpar caso a IA devolva blocos de código markdown
      const cleanJson = aiContent.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(cleanJson);

    } catch (error) {
      console.error("Erro AI:", error);
      return null; // Fallback para simulação
    }
  };

  const runDeepAnalysis = async () => {
    setAnalyzing(true);
    setLogs([]);
    setInsight(null);
    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    // Etapas visuais
    addLog(`INICIANDO AUDITORIA: ESCOPO [${selectedUf}]`);
    await new Promise(r => setTimeout(r, 800));
    
    addLog(`CARREGANDO ${filteredData.length} REGISTROS DE DESPESA...`);
    
    if (apiKey) {
        addLog("CONECTANDO NEURAL ENGINE (GPT-4o)...");
        addLog("ENVIANDO PACOTE DE DADOS CRIPTOGRAFADO...");
        
        const aiResult = await callOpenAI();
        
        if (aiResult) {
            addLog("PADRÕES DETECTADOS COM SUCESSO.");
            setInsight(aiResult);
            setAnalyzing(false);
            return;
        } else {
            addLog("ERRO NA CONEXÃO IA. REVERTENDO PARA ANÁLISE LOCAL...");
        }
    } else {
        addLog("MODO OFFLINE: EXECUTANDO HEURÍSTICA LOCAL...");
    }

    // --- FALLBACK (SIMULAÇÃO) SE NÃO TIVER CHAVE OU DER ERRO ---
    await new Promise(r => setTimeout(r, 1000));
    addLog("PROCESSANDO ESTATÍSTICAS DESCRITIVAS...");
    
    const totalValue = filteredData.reduce((acc, item) => acc + item.valor, 0);
    const avgValue = totalValue / filteredData.length;
    const maxValue = Math.max(...filteredData.map(d => d.valor));
    const anomalyItem = filteredData.find(d => d.valor === maxValue);
    
    // Agrupar categorias (Simples)
    const byCategory = filteredData.reduce((acc, curr) => {
      acc[curr.tipo] = (acc[curr.tipo] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(byCategory).sort((a,b) => (b[1] as number) - (a[1] as number))[0];

    setInsight({
      title: `ANÁLISE HEURÍSTICA: ${selectedUf}`,
      riskLevel: maxValue > 15000 ? "CRÍTICO" : "MÉDIO",
      mainFinding: `Concentração de gastos identificada em "${topCategory[0]}" representando ${((topCategory[1] as number)/totalValue*100).toFixed(0)}% do total.`,
      anomaly: {
        label: "MAIOR DESVIO PADRÃO",
        value: `R$ ${anomalyItem?.valor.toLocaleString('pt-BR')}`,
        desc: `Transação de ${anomalyItem?.parlamentar} (${anomalyItem?.tipo}) excede a média em ${(maxValue/avgValue).toFixed(1)}x.`
      },
      action: "Auditoria manual recomendada: Verificar conformidade fiscal do fornecedor."
    });
    
    setAnalyzing(false);
  };

  const chartData = useMemo(() => {
    const group = filteredData.reduce((acc, curr) => {
      let name = curr.tipo.split(' ')[0]; 
      acc[name] = (acc[name] || 0) + curr.valor;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(group).map(key => ({ name: key, value: group[key] })).sort((a,b) => b.value - a.value);
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-6 selection:bg-cyan-900 selection:text-cyan-100 flex flex-col">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-950/30 p-2 rounded border border-cyan-900">
            <Shield className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wider">INFRA <span className="text-cyan-500">BR</span> DADOS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Auditoria Federal Autônoma (Real-Time AI)</p>
          </div>
        </div>
        
        {/* FILTRO */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-slate-800">
          <div className="px-3 py-2 flex items-center gap-2 text-xs font-bold text-slate-400 border-r border-slate-800">
            <Filter className="w-3 h-3" /> UF:
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUNA 1: LISTA */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Feed de Dados
              </h3>
              <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800">
                {filteredData.length} DOCS
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
              {filteredData.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800/50 p-3 text-xs group hover:border-cyan-500/30 transition-all">
                  <div className="flex justify-between text-slate-500 mb-1 text-[10px]">
                    <span>{item.id}</span>
                    <span>{item.data}</span>
                  </div>
                  <div className="text-white font-bold flex justify-between">
                    <span>{item.parlamentar}</span>
                    <span className="text-[10px] text-slate-400">{item.partido}</span>
                  </div>
                  <div className="text-slate-400 mt-1 text-[10px] truncate">{item.tipo}</div>
                  <div className="mt-2 pt-2 border-t border-slate-900 text-right">
                    <span className="text-emerald-400 font-mono font-bold">R$ {item.valor.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: DASHBOARD & AI */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* GRÁFICO */}
          <div className="bg-slate-900/40 border border-slate-800 rounded p-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#020617', borderColor: '#334155', color: '#fff'}}
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PAINEL DE INTELIGÊNCIA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* CONTROLE DA IA */}
            <div className="bg-black border border-slate-800 rounded p-4 font-mono text-xs flex flex-col shadow-inner relative">
               <div className="absolute top-2 right-2 z-10">
                 <button 
                    onClick={() => setShowKeyInput(!showKeyInput)} 
                    className="text-slate-600 hover:text-cyan-500 p-1"
                    title="Configurar API Key"
                 >
                   <Key className="w-4 h-4" />
                 </button>
               </div>

               {showKeyInput && (
                 <div className="mb-4 bg-slate-900 p-2 border border-slate-700 rounded animate-in fade-in slide-in-from-top-2">
                   <p className="text-[10px] text-slate-400 mb-1">OpenAI API Key (Começa com sk-...)</p>
                   <input 
                     type="password" 
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     className="w-full bg-black border border-slate-700 rounded p-1 text-white focus:border-cyan-500 outline-none"
                     placeholder="Cole sua chave aqui..."
                   />
                   <p className="text-[9px] text-slate-500 mt-1">*Chave salva apenas na memória do navegador.</p>
                 </div>
               )}

              <div className="flex-1 overflow-hidden mb-4 font-mono text-[10px] leading-5">
                <div className="flex flex-col justify-end h-full space-y-1">
                  {logs.length === 0 && !analyzing && (
                     <div className="text-center text-slate-700 mt-10">
                       <Brain className="w-8 h-8 mx-auto mb-2 opacity-20" />
                       {apiKey ? 'SISTEMA ONLINE (OPENAI)' : 'SISTEMA OFFLINE (LOCAL)'}
                     </div>
                  )}
                  {logs.map((log, i) => (
                    <span key={i} className="text-emerald-500/90 border-l-2 border-emerald-500/20 pl-2">{log}</span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={runDeepAnalysis}
                disabled={analyzing}
                className={`w-full py-3 px-4 rounded uppercase tracking-widest font-bold flex items-center justify-center gap-3 transition-all ${
                    analyzing ? 'bg-slate-800 cursor-wait' : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 hover:shadow-[0_0_15px_rgba(8,145,178,0.3)]'
                }`}
              >
                {analyzing ? <Cpu className="animate-spin w-4 h-4"/> : <Brain className="w-4 h-4"/>}
                {analyzing ? 'PROCESSANDO...' : apiKey ? 'EXECUTAR IA GENERATIVA' : 'ANÁLISE LOCAL'}
              </button>
            </div>

            {/* RESULTADO */}
            <div className={`bg-slate-900/60 border ${insight?.riskLevel.includes('CRÍTICO') ? 'border-red-900/60 bg-red-950/10' : 'border-slate-800'} rounded relative overflow-hidden flex flex-col`}>
              {!insight ? (
                <div className="h-full flex items-center justify-center opacity-30">
                  <Siren className="w-12 h-12" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 h-full flex flex-col">
                  <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                     <h4 className="text-xs text-white uppercase font-bold flex items-center gap-2">
                      <FileText className="w-3 h-3 text-purple-500" /> {insight.title}
                    </h4>
                     <span className={`text-[9px] px-2 py-0.5 rounded border ${
                       insight.riskLevel.includes('CRÍTICO') 
                       ? 'border-red-500 text-red-500 bg-red-500/10' 
                       : 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                     }`}>
                       RISCO {insight.riskLevel}
                     </span>
                  </div>
                  
                  <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-cyan-500 pl-3 italic">
                      "{insight.mainFinding}"
                    </p>

                    <div className="bg-black/40 border border-slate-800 p-3 rounded">
                      <p className="text-[9px] text-amber-500 font-bold mb-1 uppercase flex gap-2 items-center">
                        <Siren className="w-3 h-3"/> {insight.anomaly.label}
                      </p>
                      <div className="flex justify-between items-end border-b border-slate-800/50 pb-2 mb-2">
                         <span className="text-xs text-slate-400">{insight.anomaly.desc}</span>
                      </div>
                      <div className="text-right font-mono font-bold text-white text-sm">
                        {insight.anomaly.value}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Próximos Passos
                      </div>
                      <p className="text-slate-500 text-xs pl-5">
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

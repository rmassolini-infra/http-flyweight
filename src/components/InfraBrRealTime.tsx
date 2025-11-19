import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, Database, Brain, Shield, 
  Terminal, Zap, Wifi, Lock, 
  Cpu, Search, Globe, Radio
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Limite de itens na tela para não travar o navegador
const BUFFER_SIZE = 50;

interface StreamItem {
  id: string;
  timestamp: string;
  responsavel: string;
  objeto: string;
  valor: number;
  origem: string;
  delta: number;
}

interface Insight {
  risk: string;
  summary: string;
  anomaly: string;
}

export default function InfraBrRealTime() {
  // Estados do Stream
  const [streamData, setStreamData] = useState<StreamItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [throughput, setThroughput] = useState(0);
  
  // Estados da IA e UI
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // --- ENGINE DE CONEXÃO REAL-TIME (SSE) ---
  useEffect(() => {
    setConnectionStatus('CONNECTING...');
    
    // Conecta ao Stream Público da Wikimedia
    const eventSource = new EventSource('https://stream.wikimedia.org/v2/stream/recentchange');

    eventSource.onopen = () => {
      setConnectionStatus('CONNECTED: STREAMING (PT-BR)');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // FILTRO: Apenas dados em Português (Brasil/Portugal)
        if (data.server_name === 'pt.wikipedia.org' && data.type === 'edit') {
          
          // TRADUÇÃO DE DADOS (WIKI -> GOV SIMULATION)
          const govItem: StreamItem = {
            id: `PROC-${Math.floor(Math.random() * 100000)}`, // ID Fictício
            timestamp: new Date(data.timestamp * 1000).toLocaleTimeString(),
            responsavel: data.user.toUpperCase(),
            objeto: data.title,
            // Transformando bytes em "Reais" para visualização
            valor: Math.abs(data.length?.new || 0) * (Math.random() * 100 + 10),
            origem: 'SIS-FED',
            delta: data.length?.new - data.length?.old
          };

          setStreamData(prev => {
            const newData = [...prev, govItem];
            if (newData.length > BUFFER_SIZE) return newData.slice(newData.length - BUFFER_SIZE);
            return newData;
          });

          // Atualizar métrica de velocidade aleatória para efeito visual
          setThroughput(Math.floor(Math.random() * 500) + 1200);
        }
      } catch (err) {
        console.error("Parse error", err);
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('RECONNECTING...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Auto-scroll no terminal de dados
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamData]);

  // --- LÓGICA DE IA (LOVABLE AI) ---
  const runLiveAnalysis = async () => {
    if (streamData.length === 0) {
      toast({
        title: "Buffer vazio",
        description: "Aguarde dados chegarem antes de analisar.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    setInsight(null);

    // Snapshot dos dados atuais do buffer
    const snapshot = streamData.slice(-15); // Pega os últimos 15 itens

    try {
      console.log("Enviando snapshot para análise...");
      
      const { data, error } = await supabase.functions.invoke('analyze-stream', {
        body: { snapshot }
      });

      if (error) {
        console.error("Erro ao invocar função:", error);
        throw error;
      }

      console.log("Resultado da análise:", data);

      if (data.error) {
        toast({
          title: "Erro na análise",
          description: data.error,
          variant: "destructive"
        });
        
        // Fallback local em caso de erro
        const totalVol = snapshot.reduce((acc, i) => acc + i.valor, 0);
        const biggest = [...snapshot].sort((a,b) => b.valor - a.valor)[0];
        
        setInsight({
          risk: totalVol > 50000 ? "CRÍTICO - SURTO DETECTADO" : "MODERADO",
          summary: `Detectado fluxo intenso de modificações em "${biggest?.objeto || 'Dados Sigilosos'}". Padrão de escrita acelerado sugere intervenção manual não programada.`,
          anomaly: `Transação ${biggest?.id} de R$ ${biggest?.valor.toFixed(2)} realizada por ${biggest?.responsavel}.`
        });
      } else {
        setInsight(data);
        toast({
          title: "Análise concluída",
          description: "IA processou o snapshot com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao analisar:", error);
      toast({
        title: "Erro na análise",
        description: "Falha ao processar dados. Usando análise local.",
        variant: "destructive"
      });
      
      // Fallback local
      const totalVol = snapshot.reduce((acc, i) => acc + i.valor, 0);
      const biggest = [...snapshot].sort((a,b) => b.valor - a.valor)[0];
      
      setInsight({
        risk: totalVol > 50000 ? "CRÍTICO - SURTO DETECTADO" : "MODERADO",
        summary: `Detectado fluxo intenso de modificações em "${biggest?.objeto || 'Dados Sigilosos'}". Padrão de escrita acelerado sugere intervenção manual não programada.`,
        anomaly: `Transação ${biggest?.id} de R$ ${biggest?.valor.toFixed(2)} realizada por ${biggest?.responsavel}.`
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Dados para o gráfico em tempo real
  const chartData = useMemo(() => {
    return streamData.map((d, i) => ({
      timestamp: d.timestamp,
      valor: d.valor,
      index: i
    }));
  }, [streamData]);

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-4 flex flex-col overflow-hidden selection:bg-cyan-900 selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-end border-b border-cyan-900/50 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className={`w-4 h-4 ${connectionStatus.includes('CONNECTED') ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
            <span className="text-[10px] font-bold tracking-widest text-slate-500">{connectionStatus}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2">
            INFRA<span className="text-cyan-500">.LIVE</span>
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-slate-500">DATA THROUGHPUT</div>
          <div className="text-xl font-bold text-white">{throughput} <span className="text-xs text-cyan-600">TX/s</span></div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* --- COLUNA 1: LIVE STREAM (Matrix Style) --- */}
        <div className="lg:col-span-4 flex flex-col border border-cyan-900/30 bg-slate-950/50 rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 animate-pulse"></div>
          
          <div className="p-3 bg-cyan-950/20 border-b border-cyan-900/30 flex justify-between items-center">
            <span className="text-xs font-bold flex items-center gap-2"><Activity className="w-3 h-3"/> FLUXO DE PROCESSOS</span>
            <span className="text-[9px] bg-black px-2 rounded border border-cyan-900 text-cyan-700">PORTUGUÊS (BR/PT)</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth custom-scrollbar">
            {streamData.length === 0 && (
              <div className="text-center mt-20 text-cyan-900 animate-pulse">AGUARDANDO PACOTES DE DADOS...</div>
            )}
            {streamData.map((item, idx) => (
              <div key={idx} className="text-[10px] border-l-2 border-cyan-900 pl-2 py-1 hover:bg-cyan-900/10 transition-colors opacity-80 hover:opacity-100">
                <div className="flex justify-between text-slate-500">
                  <span>{item.timestamp}</span>
                  <span>{item.id}</span>
                </div>
                <div className="text-white truncate font-bold" title={item.objeto}>
                  {item.objeto.length > 25 ? item.objeto.substring(0,25)+'...' : item.objeto}
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-cyan-700 truncate max-w-[120px]">{item.responsavel}</span>
                  <span className={`font-bold ${item.delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    R$ {item.valor.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- COLUNA 2: VISUALIZAÇÃO & IA --- */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Gráfico Real-Time */}
          <div className="h-1/2 border border-cyan-900/30 bg-slate-950/50 rounded p-4 relative">
            <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-500 flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500"/> VOLATILIDADE DO ORÇAMENTO (TEMPO REAL)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#000', borderColor: '#0e7490', color: '#fff'}}
                  itemStyle={{color: '#22d3ee'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  isAnimationActive={false} // Desativar animação suave para parecer "cru" e rápido
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Painel IA */}
          <div className="h-1/2 flex flex-col md:flex-row gap-4">
            
            {/* Controles */}
            <div className="w-full md:w-1/3 bg-black border border-slate-800 rounded p-4 flex flex-col justify-between relative">
               <div className="absolute top-2 right-2">
                 <div className="flex items-center gap-1 text-[9px] text-green-500">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   LOVABLE AI
                 </div>
               </div>

               <div className="space-y-4 mt-6">
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                   <Database className="w-4 h-4" />
                   BUFFER: {streamData.length} / {BUFFER_SIZE}
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                   <Globe className="w-4 h-4" />
                   LATÊNCIA: {Math.floor(Math.random()*40)+20}ms
                 </div>
               </div>

               <button 
                 onClick={runLiveAnalysis}
                 disabled={analyzing || streamData.length === 0}
                 className="mt-4 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all p-3 text-xs font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {analyzing ? <Cpu className="animate-spin w-4 h-4"/> : <Brain className="w-4 h-4"/>}
                 {analyzing ? 'ANALISANDO BUFFER...' : 'ANÁLISE IA GENERATIVA'}
               </button>
            </div>

            {/* Resultado IA */}
            <div className="w-full md:w-2/3 bg-slate-900/30 border border-slate-800 rounded p-4 relative overflow-y-auto custom-scrollbar">
              {!insight ? (
                <div className="h-full flex items-center justify-center opacity-20">
                  <Shield className="w-16 h-16" />
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-bold text-sm">RELATÓRIO DE INTELIGÊNCIA</h4>
                    <span className={`text-[10px] px-2 py-1 font-bold ${insight.risk.includes('CRÍTICO') ? 'bg-red-500 text-white' : 'bg-cyan-900 text-cyan-300'}`}>
                      {insight.risk}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 border-l-2 border-cyan-500 pl-2">
                    {insight.summary}
                  </p>
                  <div className="bg-black/50 p-2 rounded border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Ponto de Anomalia</div>
                    <div className="text-xs font-mono text-cyan-400">
                      {insight.anomaly}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Disclaimer Técnico */}
      <div className="fixed bottom-1 right-2 text-[8px] text-slate-700 z-50 opacity-50">
        DATA SOURCE: WIKIMEDIA EVENTSTREAMS (SIMULATING GOV DATA TRAFFIC)
      </div>
    </div>
  );
}

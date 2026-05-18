import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import MadSignature from '../components/MadSignature';

// Import our new subcomponents
import Ticker from '../components/mercados/Ticker';
import IbovespaCard from '../components/mercados/IbovespaCard';
import BolsasMundiaisCard from '../components/mercados/BolsasMundiaisCard';
import CambioCriptoCard from '../components/mercados/CambioCriptoCard';
import CurvaDICard from '../components/mercados/CurvaDICard';
import MaioresMovimentosCard from '../components/mercados/MaioresMovimentosCard';
import FerramentasCard from '../components/mercados/FerramentasCard';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedStr, setLastUpdatedStr] = useState('...');
  const [currentDateStr, setCurrentDateStr] = useState('...');
  const [currentTimeOnlyStr, setCurrentTimeOnlyStr] = useState('...');
  const [countdown, setCountdown] = useState(180); // 3 minutes countdown
  const [darkMode, setDarkMode] = useState(false);
  const [selic, setSelic] = useState('14,40%');
  const [nextCopom, setNextCopom] = useState('17/06/2026');

  const fetchData = async () => {
    let json: any = null;
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error('API failed');
      json = await res.json();
    } catch (e) {
      console.error('Error fetching market details:', e);
    } finally {
      setLoading(false);
    }

    if (json) {
      setData(json);
      const now = new Date();
      const padding = (n: number) => n.toString().padStart(2, '0');
      setLastUpdatedStr(`${padding(now.getHours())}:${padding(now.getMinutes())}`);
    }

    // Fetch Selic directly from BCB SGS
    try {
      const resSelic = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
      if (resSelic.ok) {
        const dataSelic = await resSelic.json();
        if (dataSelic?.[0]?.valor) {
          setSelic(dataSelic[0].valor.replace('.', ',') + '%');
        }
      }
    } catch (err) {
      console.error('Error fetching Selic Efetiva:', err);
    }

    // Fetch COPOM next meeting date from public/copom.md
    try {
      const resCopom = await fetch('/copom.md');
      if (resCopom.ok) {
        const text = await resCopom.text();
        const lines = text.split('\n');
        let nextDate = 'A definir';
        const now = Date.now();
        for (const line of lines) {
          const match = line.match(/\|\s*([^|]+)\s*\|\s*(\d{2}\/\d{2}\/\d{4})\s*\|/);
          if (match && !match[1].includes('Reunião |')) {
             const dateStr = match[2].trim();
             const [day, month, year] = dateStr.split('/');
             const timestamp = new Date(`${year}-${month}-${day}T23:59:59-03:00`).getTime();
             if (timestamp >= now) {
                nextDate = dateStr;
                break;
             }
          }
        }
        setNextCopom(nextDate);
      }
    } catch (err) {
      console.error('Error fetching COPOM schedule:', err);
    }
  };

  // 1. Initial Fetch and countdown loop
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData();
          return 180; // Reset to 3 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2. Real-time Ticking Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const padding = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${padding(now.getDate())}/${padding(now.getMonth() + 1)}/${now.getFullYear()}`;
      const timeStr = `${padding(now.getHours())}:${padding(now.getMinutes())}:${padding(now.getSeconds())}`;
      setCurrentDateStr(dateStr);
      setCurrentTimeOnlyStr(timeStr);
    };

    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 3. Persist and apply theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('mad-theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('mad-theme', newVal ? 'dark' : 'light');
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newVal;
    });
  };

  // Format countdown as M:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Placeholder data for initial load/fallback
  const fallbackData = {
    stocks: [],
    currencies: null,
    cryptos: null
  };

  const displayData = data ?? fallbackData;
  const ibovStock = displayData.stocks?.find((s: any) => s.symbol === '^BVSP');

  return (
    <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen transition-colors duration-300' : 'bg-[#eef3fd] text-[#04101e] min-h-screen transition-colors duration-300'}>
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
        
        {/* Mockup Container */}
        <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/25 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col font-mono shadow-xl">
          
          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2 md:gap-3 px-2 sm:px-3.5 py-2 bg-[#f5f9ff] dark:bg-slate-950 border-b border-[#004ac6]/35 dark:border-slate-800 w-full overflow-hidden flex-nowrap select-none">
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="flex items-center gap-1 select-none shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="6" fill="#004ac6"/>
                  <path d="M5 21 L5 6 L10 6 L16 16 L22 6 L27 6 L27 21 L23 21 L23 11 L17.5 20 L14.5 20 L9 11 L9 21 Z" fill="#fff"/>
                  <text fontFamily="Arial,sans-serif" fontSize="6.2" fontWeight="700" fill="#fff" y="27">
                    <tspan x="5">m</tspan>
                    <tspan x="14.4">a</tspan>
                    <tspan x="23.3">d</tspan>
                  </text>
                </svg>
                <span className="text-[9px] sm:text-xs md:text-sm lg:text-base font-bold text-[#004ac6] dark:text-[#5ea2ff]">marcus.aleks</span>
              </div>
              <span className="text-[9px] sm:text-xs md:text-sm lg:text-base font-bold tracking-wider text-[#004ac6] dark:text-blue-400 border border-[#004ac6]/40 dark:border-blue-500/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase select-none shrink-0">
                <span className="hidden lg:inline">COTAÇÕES DO MERCADO FINANCEIRO: </span>
                <span className="inline lg:hidden">COTAÇÕES: </span>
                <span className="hidden sm:inline">{currentDateStr} · </span>
                <span>{currentTimeOnlyStr}</span>
              </span>
            </div>

            <div className="flex flex-row items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0 flex-nowrap">
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase select-none">
                  <span className="hidden sm:inline">ATUALIZADO ÀS:</span>
                  <span className="inline sm:hidden">ATT:</span>
                </span>
                <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#04101e] dark:text-slate-300 font-bold uppercase select-none">
                  {lastUpdatedStr}
                </span>
              </div>
              <span 
                onClick={fetchData}
                className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#6a8db0] dark:text-slate-500 border border-[#004ac6]/20 dark:border-slate-800 px-1.5 py-0.5 rounded-full font-bold uppercase cursor-pointer select-none hover:bg-[#004ac6]/05 transition-all shrink-0"
              >
                ↻ {formatCountdown(countdown)}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span className="hidden md:inline text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[#6a8db0] dark:text-slate-500 font-bold uppercase select-none">
                  ESCOLHA:
                </span>
                <button 
                  onClick={toggleTheme}
                  className="bg-transparent border border-[#004ac6]/25 dark:border-slate-800 text-[#294c72] dark:text-slate-400 px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase hover:bg-[#004ac6]/05 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {darkMode ? 'claro ☀️' : 'escuro 🌙'}
                </button>
              </div>
              <Link 
                href="/login" 
                className="bg-slate-900 border border-slate-800 dark:border-slate-700 px-2 py-0.5 rounded text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-wider shrink-0 flex items-center gap-1 select-none"
              >
                <Lock size={8} className="sm:w-2.5 sm:h-2.5" />
                <span className="hidden sm:inline">ACESSO RESTRITO</span>
              </Link>
            </div>
          </div>

          {/* Ticker Banner */}
          <Ticker data={displayData} />

          {/* Dash Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
            
            {/* Column 1: Ibov */}
            <IbovespaCard ibovData={ibovStock} ibovIntraday={displayData.ibovIntraday} />

            {/* Column 2: Bolsas Mundiais */}
            <BolsasMundiaisCard data={displayData} />

            {/* Column 3: Cambio & Cripto */}
            <CambioCriptoCard data={displayData} />

            {/* Column 1: Curva DI (Row 2) */}
            <CurvaDICard data={displayData} selic={selic} nextCopom={nextCopom} />

            {/* Column 2 & 3: Maiores Movimentos (Row 2) */}
            <MaioresMovimentosCard data={displayData} />

          </div>

          {/* Section Divider */}
          <div className="flex items-center gap-2.5 px-2 py-3.5 select-none">
            <div className="flex-1 h-[1px] bg-[#004ac6]/18 dark:bg-slate-800"></div>
            <span className="text-[9px] tracking-widest uppercase text-[#6a8db0] dark:text-slate-500 font-bold">
              Ferramentas · MAD Developers
            </span>
            <div className="flex-1 h-[1px] bg-[#004ac6]/18 dark:bg-slate-800"></div>
          </div>

          {/* Tools Grid */}
          <FerramentasCard />

          {/* Footer Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3.5 py-2.5 border-t border-[#004ac6]/15 dark:border-slate-800 text-[9px] text-[#6a8db0] dark:text-slate-500 bg-[#f5f9ff] dark:bg-slate-950 font-mono">
            <span>
              Fontes: <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-[#004ac6] dark:text-blue-400 hover:underline">brapi.dev</a>
              <span className="px-1 select-none">·</span>
              <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-[#004ac6] dark:text-blue-400 hover:underline">CoinGecko</a>
              <span className="px-1 select-none">·</span>
              <a href="https://economia.awesomeapi.com.br" target="_blank" rel="noopener noreferrer" className="text-[#004ac6] dark:text-blue-400 hover:underline">AwesomeAPI</a>
              <span className="px-1 select-none">·</span>
              Dados com atraso de até 15 min
            </span>
          </div>

        </div>

        {/* Compliance Footer (Outside the mockup frame) */}
        <div className="mt-8 border-t border-[#004ac6]/10 dark:border-slate-900 pt-6 flex justify-center w-full">
          <MadSignature />
        </div>

      </div>
    </div>
  );
}

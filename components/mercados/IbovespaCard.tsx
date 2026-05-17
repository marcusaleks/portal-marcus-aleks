import React from 'react';

type IbovespaCardProps = {
  ibovData: any;
  ibovIntraday?: number[] | null;
};

export default function IbovespaCard({ ibovData, ibovIntraday }: IbovespaCardProps) {
  const isOffline = ibovData?.status === 'offline';
  const isUp = ibovData ? ibovData.regularMarketChangePercent >= 0 : false;
  const price = ibovData ? ibovData.regularMarketPrice : 176453;
  const changePct = ibovData ? ibovData.regularMarketChangePercent : -1.07;
  const changePts = ibovData ? (ibovData.regularMarketChange ?? -1908) : -1908;
  
  const high = ibovData ? (ibovData.regularMarketDayHigh ?? 178500) : 178500;
  const low = ibovData ? (ibovData.regularMarketDayLow ?? 175812) : 175812;
  const prevClose = ibovData ? (ibovData.regularMarketPreviousClose ?? 178361) : 178361;
  const volume = ibovData ? (ibovData.regularMarketVolume ? `R$ ${(ibovData.regularMarketVolume / 1e9).toFixed(1)}B` : 'R$ 11,1B') : 'R$ 11,1B';

  // Determine if stock market is open (standard hours 10h to 18h Brasília, business days)
  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    return day >= 1 && day <= 5 && hour >= 10 && hour < 18;
  };

  // Generate dynamic sparkline coordinates from intraday data
  let sparkPoints = "";
  let fillPoints = "";

  if (ibovIntraday && ibovIntraday.length > 1) {
    const minVal = Math.min(...ibovIntraday);
    const maxVal = Math.max(...ibovIntraday);
    const range = maxVal - minVal || 1; // avoid division by zero
    
    // Map values to X (0 to 260) and Y (42 to 2)
    // We use 42 to 2 so the stroke doesn't get clipped by the SVG borders
    const pointsArray = ibovIntraday.map((val, index) => {
      const x = (index / (ibovIntraday.length - 1)) * 260;
      const y = 42 - ((val - minVal) / range) * 40;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    sparkPoints = pointsArray.join(' ');
    fillPoints = `${sparkPoints} 260,44 0,44`;
  } else {
    // Fallback static sparkline coordinates
    sparkPoints = isUp 
      ? "0,34 26,30 52,27 78,22 104,18 130,23 156,15 182,12 208,8 234,6 260,2"
      : "0,6 26,8 52,12 78,15 104,19 130,23 156,27 182,30 208,34 234,38 260,42";
    fillPoints = `${sparkPoints} 260,44 0,44`;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col justify-between font-mono shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Ibovespa
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-bold">
            {isOffline ? 'Offline' : (isMarketOpen() ? 'Aberto' : 'Fechado')}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOffline ? 'bg-slate-400' : (isMarketOpen() ? 'bg-emerald-500' : 'bg-red-500')}`}></span>
        </div>
      </div>

      <div className="text-2xl font-bold tracking-tight text-[#04101e] dark:text-white leading-none">
        {isOffline ? <span className="text-xl">Aguardando conexão</span> : price.toLocaleString('pt-BR')}
      </div>

      <div className="flex items-center gap-2 mt-1.5">
        {isOffline ? (
           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
             Sem dados
           </span>
        ) : (
          <>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
              {isUp ? '+' : ''}{changePct.toFixed(2)}%
            </span>
            <span className={`text-xs font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
              {isUp ? '+' : ''}{changePts.toLocaleString('pt-BR')} pts
            </span>
          </>
        )}
      </div>

      <div className="my-2 h-11 shrink-0">
        <svg viewBox="0 0 260 44" preserveAspectRatio="none" className="w-full h-11 block">
          <polyline 
            points={sparkPoints} 
            fill="none" 
            stroke={isUp ? "#009e5f" : "#cc2222"} 
            strokeWidth="1.5" 
            strokeLinejoin="round" 
            strokeLinecap="round"
          />
          <polyline 
            points={fillPoints} 
            fill={isUp ? "#009e5f" : "#cc2222"} 
            fillOpacity="0.06" 
            stroke="none"
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <div className="bg-[#e4eefb] dark:bg-slate-800/40 rounded p-1.5">
          <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5">Máx. dia</div>
          <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{high.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-[#e4eefb] dark:bg-slate-800/40 rounded p-1.5">
          <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5">Mín. dia</div>
          <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{low.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-[#e4eefb] dark:bg-slate-800/40 rounded p-1.5">
          <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5">Fech. ant.</div>
          <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{prevClose.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-[#e4eefb] dark:bg-slate-800/40 rounded p-1.5">
          <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5">Volume</div>
          <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{volume}</div>
        </div>
      </div>
    </div>
  );
}

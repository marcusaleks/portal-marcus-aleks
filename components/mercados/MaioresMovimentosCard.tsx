import React from 'react';

type MovementItem = {
  ticker: string;
  name: string;
  price?: string;
  change: string;
  isUp: boolean;
};

type MaioresMovimentosCardProps = {
  data: any;
};

const defaultAltas: MovementItem[] = [
  { ticker: 'BRAV3', name: 'Brava Energia', price: 'R$ 18,50', change: '+2,36%', isUp: true },
  { ticker: 'PETR3', name: 'Petrobras ON', price: 'R$ 38,10', change: '+1,58%', isUp: true },
  { ticker: 'RECV3', name: 'PetroReconcavo', price: 'R$ 21,30', change: '+0,83%', isUp: true },
  { ticker: 'PETR4', name: 'Petrobras PN', price: 'R$ 35,45', change: '+0,91%', isUp: true },
  { ticker: 'PRIO3', name: 'PRIO', price: 'R$ 48,90', change: '+0,22%', isUp: true }
];

const defaultQuedas: MovementItem[] = [
  { ticker: 'CSAN3', name: 'Cosan', price: 'R$ 12,30', change: '-7,10%', isUp: false },
  { ticker: 'CSNA3', name: 'CSN', price: 'R$ 11,20', change: '-6,00%', isUp: false },
  { ticker: 'USIM5', name: 'Usiminas', price: 'R$ 6,80', change: '-5,56%', isUp: false },
  { ticker: 'VALE3', name: 'Vale', price: 'R$ 61,40', change: '-2,09%', isUp: false },
  { ticker: 'BRAP4', name: 'Bradespar PN', price: 'R$ 19,80', change: '-2,54%', isUp: false }
];

export default function MaioresMovimentosCard({ data }: MaioresMovimentosCardProps) {
  let maioresAltas = defaultAltas;
  let maioresQuedas = defaultQuedas;

  // Real-time stock sorting if BRAPI data exists
  const otherStocks = data.stocks?.filter((s: any) => s.symbol !== '^BVSP') || [];

  if (otherStocks.length > 0) {
    const isOffline = otherStocks.some(s => s.status === 'offline');
    if (isOffline) {
      maioresAltas = defaultAltas.map(s => ({ ...s, change: 'Sem Conexão', isUp: true }));
      maioresQuedas = defaultQuedas.map(s => ({ ...s, change: 'Sem Conexão', isUp: true }));
    } else {
      const sortedStocks = [...otherStocks].sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent);
      
      // Map Top 5 Gainers
      maioresAltas = sortedStocks.slice(0, 5).map(s => ({
        ticker: s.symbol,
        name: s.longName ?? s.shortName ?? 'Ativo',
        price: `R$ ${s.regularMarketPrice?.toFixed(2).replace('.', ',')}`,
        change: `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2).replace('.', ',')}%`,
        isUp: s.regularMarketChangePercent >= 0
      }));

      // Map Top 5 Losers
      const reverseSorted = [...otherStocks].sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent);
      maioresQuedas = reverseSorted.slice(0, 5).map(s => ({
        ticker: s.symbol,
        name: s.longName ?? s.shortName ?? 'Ativo',
        price: `R$ ${s.regularMarketPrice?.toFixed(2).replace('.', ',')}`,
        change: `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2).replace('.', ',')}%`,
        isUp: s.regularMarketChangePercent >= 0
      }));
    }
  }

  const renderItem = (item: MovementItem, idx: number) => (
    <div key={idx} className="flex items-center w-full py-1.5 border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs font-bold text-[#04101e] dark:text-slate-200 leading-tight block truncate">{item.ticker}</span>
        <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold uppercase tracking-wider block mt-0.5 truncate">{item.name}</span>
      </div>
      <div className="text-right text-xs font-bold text-[#04101e] dark:text-slate-200 px-1 w-[30%] flex-shrink-0">
        {item.price || '--'}
      </div>
      <div className={`text-right text-xs font-bold pl-1 w-[25%] flex-shrink-0 ${item.isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
        {item.change}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Maiores Movimentos · Ibovespa
        </span>
        {otherStocks.some((s: any) => s.status === 'offline') && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Dados de fallback — sem conexão com BRAPI">
            Dados offline
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest pb-1 border-b border-[#004ac6]/12 dark:border-slate-800 mb-1">
            ↑ Maiores Altas
          </div>
          <div className="flex flex-col">{maioresAltas.map(renderItem)}</div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-red-600 dark:text-red-500 uppercase tracking-widest pb-1 border-b border-[#004ac6]/12 dark:border-slate-800 mb-1">
            ↓ Maiores Quedas
          </div>
          <div className="flex flex-col">{maioresQuedas.map(renderItem)}</div>
        </div>
      </div>
    </div>
  );
}

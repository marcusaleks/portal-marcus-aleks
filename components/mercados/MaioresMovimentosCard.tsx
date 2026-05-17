import React from 'react';

type MovementItem = {
  ticker: string;
  name: string;
  change: string;
  isUp: boolean;
};

type MaioresMovimentosCardProps = {
  data: any;
};

const defaultAltas: MovementItem[] = [
  { ticker: 'BRAV3', name: 'Brava Energia', change: '+2,36%', isUp: true },
  { ticker: 'PETR3', name: 'Petrobras ON', change: '+1,58%', isUp: true },
  { ticker: 'RECV3', name: 'PetroReconcavo', change: '+0,83%', isUp: true },
  { ticker: 'PETR4', name: 'Petrobras PN', change: '+0,91%', isUp: true },
  { ticker: 'PRIO3', name: 'PRIO', change: '+0,22%', isUp: true }
];

const defaultQuedas: MovementItem[] = [
  { ticker: 'CSAN3', name: 'Cosan', change: '-7,10%', isUp: false },
  { ticker: 'CSNA3', name: 'CSN', change: '-6,00%', isUp: false },
  { ticker: 'USIM5', name: 'Usiminas', change: '-5,56%', isUp: false },
  { ticker: 'VALE3', name: 'Vale', change: '-2,09%', isUp: false },
  { ticker: 'BRAP4', name: 'Bradespar PN', change: '-2,54%', isUp: false }
];

export default function MaioresMovimentosCard({ data }: MaioresMovimentosCardProps) {
  let maioresAltas = defaultAltas;
  let maioresQuedas = defaultQuedas;

  // Real-time stock sorting if BRAPI data exists
  const otherStocks = data.stocks?.filter((s: any) => s.symbol !== '^BVSP') || [];

  if (otherStocks.length > 0) {
    const sortedStocks = [...otherStocks].sort((a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent);
    
    // Map Top 5 Gainers
    maioresAltas = sortedStocks.slice(0, 5).map(s => ({
      ticker: s.symbol,
      name: s.longName ?? s.shortName ?? 'Ativo',
      change: `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2).replace('.', ',')}%`,
      isUp: s.regularMarketChangePercent >= 0
    }));

    // Map Top 5 Losers
    const reverseSorted = [...otherStocks].sort((a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent);
    maioresQuedas = reverseSorted.slice(0, 5).map(s => ({
      ticker: s.symbol,
      name: s.longName ?? s.shortName ?? 'Ativo',
      change: `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2).replace('.', ',')}%`,
      isUp: s.regularMarketChangePercent >= 0
    }));
  }

  const renderItem = (item: MovementItem, idx: number) => (
    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[#04101e] dark:text-slate-200">{item.ticker}</span>
        <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold max-w-[120px] truncate">{item.name}</span>
      </div>
      <span className={`text-xs font-bold ${item.isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
        {item.change}
      </span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Maiores Movimentos · Ibovespa
        </span>
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

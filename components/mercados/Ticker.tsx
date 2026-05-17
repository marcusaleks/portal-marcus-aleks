import React from 'react';

type TickerItem = {
  name: string;
  value: string;
  change: string;
  isUp: boolean;
};

type TickerProps = {
  data: {
    stocks: any[];
    currencies: any;
    cryptos: any;
  };
};

export default function Ticker({ data }: TickerProps) {
  // 1. Gather all items to showcase in the ticker
  const ibovStock = data.stocks?.find(s => s.symbol === '^BVSP');
  const items: TickerItem[] = [];

  if (ibovStock) {
    const isOffline = ibovStock.status === 'offline';
    items.push({
      name: 'IBOV',
      value: isOffline ? '--' : ibovStock.regularMarketPrice.toLocaleString('pt-BR'),
      change: isOffline ? 'Sem Conexão' : `${ibovStock.regularMarketChangePercent >= 0 ? '+' : ''}${ibovStock.regularMarketChangePercent.toFixed(2)}%`,
      isUp: isOffline ? true : ibovStock.regularMarketChangePercent >= 0
    });
  } else {
    items.push({ name: 'IBOV', value: '176.453', change: '-1,07%', isUp: false });
  }

  // Apenas as 18 ações e FIIs solicitados serão exibidos no Ticker

  // Append other stocks to make it long
  const otherStocks = data.stocks?.filter(s => s.symbol !== '^BVSP') || [];
  otherStocks.forEach(s => {
    const isOffline = s.status === 'offline';
    items.push({
      name: s.symbol,
      value: isOffline ? '--' : `R$ ${s.regularMarketPrice.toFixed(2)}`,
      change: isOffline ? 'Sem Conexão' : `${s.regularMarketChangePercent >= 0 ? '+' : ''}${s.regularMarketChangePercent.toFixed(2)}%`,
      isUp: isOffline ? true : s.regularMarketChangePercent >= 0
    });
  });

  // Duplicate items array to make infinite loop smooth
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-[#f5f9ff] dark:bg-slate-950 border-b border-[#004ac6]/15 dark:border-slate-800 py-2.5 overflow-hidden relative select-none">
      <div className="animate-marquee flex gap-0 whitespace-nowrap items-center w-max">
        {repeatedItems.map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-6 border-r border-[#004ac6]/15 dark:border-slate-800 font-mono text-xs"
          >
            <span className="text-[#6a8db0] dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              {item.name}
            </span>
            <span className="text-[#04101e] dark:text-slate-200 font-bold">
              {item.value}
            </span>
            <span className={`font-semibold ${item.isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

type IndexItem = {
  name: string;
  symbol: string;
  points: string;
  change: string;
  isUp: boolean;
};

type BolsasMundiaisCardProps = {
  data: any;
};

export default function BolsasMundiaisCard({ data }: BolsasMundiaisCardProps) {
  const getIndexData = (key: string, defaultName: string, defaultSymbol: string, fallbackPrice: number, fallbackChange: number): IndexItem => {
    const item = data?.globalIndices?.[key];
    const priceVal = item ? item.price : fallbackPrice;
    const changeVal = item ? item.pctChange : fallbackChange;
    
    const isOffline = item?.status === 'offline';
    const formattedPrice = isOffline ? '--' : (priceVal >= 1000
      ? Math.floor(priceVal).toLocaleString('pt-BR')
      : priceVal.toFixed(2).replace('.', ','));
      
    const formattedChange = isOffline ? 'Sem Conexão' : `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2).replace('.', ',')}%`;
    
    return {
      name: defaultName,
      symbol: defaultSymbol,
      points: formattedPrice,
      change: formattedChange,
      isUp: isOffline ? true : changeVal >= 0
    };
  };

  const usIndices: IndexItem[] = [
    getIndexData('DOW', 'Dow Jones', 'DJI', 42512, 0.45),
    getIndexData('SP500', 'S&P 500', 'SPX', 5812, 0.67),
    getIndexData('NASDAQ', 'Nasdaq', 'COMP', 18234, 1.12),
    getIndexData('RUSSELL', 'Russell 2000', 'RUT', 2048, -0.23)
  ];

  // Try to find real EWZ from BRAPI stocks if available
  const ewzStock = data?.stocks?.find((s: any) => s.symbol === 'EWZ' || s.symbol === 'EWZ11');
  const ewzIsOffline = ewzStock?.status === 'offline';
  const ewzPoints = ewzIsOffline ? '--' : (ewzStock ? ewzStock.regularMarketPrice.toFixed(2).replace('.', ',') : '28,21');
  const ewzChangePct = ewzStock ? ewzStock.regularMarketChangePercent : -3.02;
  const ewzChange = ewzIsOffline ? 'Sem Conexão' : `${ewzChangePct >= 0 ? '+' : ''}${ewzChangePct.toFixed(2).replace('.', ',')}%`;

  usIndices.push({
    name: 'EWZ Brasil',
    symbol: 'NYSE',
    points: ewzPoints,
    change: ewzChange,
    isUp: ewzIsOffline ? true : ewzChangePct >= 0
  });

  const globalIndices: IndexItem[] = [
    getIndexData('FTSE', 'FTSE 100', 'Londres', 8234, 0.23),
    getIndexData('DAX', 'DAX', 'Frankfurt', 18923, 0.45),
    getIndexData('NIKKEI', 'Nikkei 225', 'Tóquio', 38456, -1.23),
    getIndexData('HANGSENG', 'Hang Seng', 'Hong Kong', 22123, -0.89)
  ];

  const renderRow = (item: IndexItem, idx: number) => (
    <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
      <td className="py-1.5 pr-1 pl-0.5 text-left">
        <span className="text-[#04101e] dark:text-slate-200 font-bold block text-xs leading-tight">
          {item.name}
        </span>
        <span className="text-[#6a8db0] dark:text-slate-500 text-[9px] uppercase tracking-wider block mt-0.5">
          {item.symbol}
        </span>
      </td>
      <td className="py-1.5 px-1 text-right text-xs font-bold text-[#04101e] dark:text-slate-200 align-middle">
        {item.points}
      </td>
      <td className={`py-1.5 pl-1 pr-0.5 text-right text-xs font-bold align-middle ${item.isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
        {item.change}
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Bolsas Mundiais
        </span>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pr-1 pl-0.5 w-[45%]">
              Índice
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 px-1 w-[30%]">
              Pontos
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 pl-1 pr-0.5 w-[25%]">
              Var.%
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3} className="text-[#004ac6] dark:text-blue-400 text-[8px] font-bold tracking-wider uppercase pt-2 pb-1 pl-0.5 text-left">
              Estados Unidos
            </td>
          </tr>
          {usIndices.map(renderRow)}
          <tr>
            <td colSpan={3} className="text-[#004ac6] dark:text-blue-400 text-[8px] font-bold tracking-wider uppercase pt-2 pb-1 pl-0.5 text-left">
              Global
            </td>
          </tr>
          {globalIndices.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}

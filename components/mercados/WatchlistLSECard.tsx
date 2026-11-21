type LSEItem = {
  symbol: string;
  name: string;
  preco: string;
  change: string;
  isUp: boolean;
  isOffline: boolean;
};

type WatchlistLSECardProps = {
  data: any;
};

export default function WatchlistLSECard({ data }: WatchlistLSECardProps) {
  const getLSEData = (
    key: string,
    symbol: string,
    fallbackName: string,
    fallbackPrice: number,
    fallbackChange: number
  ): LSEItem => {
    const item = data?.lseUsd?.[key];
    const priceVal = item ? item.price : fallbackPrice;
    const changeVal = item ? item.pctChange : fallbackChange;
    const name = item?.name ?? fallbackName;

    const isOffline = item?.status === 'offline';
    const formattedPrice = isOffline ? '--' : `$ ${priceVal.toFixed(2).replace('.', ',')}`;
    const formattedChange = isOffline ? 'Sem Conexão' : `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2).replace('.', ',')}%`;

    return {
      symbol,
      name,
      preco: formattedPrice,
      change: formattedChange,
      isUp: isOffline ? true : changeVal >= 0,
      isOffline,
    };
  };

  const papeis: LSEItem[] = [
    getLSEData('IB01', 'IB01', 'iShares $ Treasury Bond 0-1yr UCITS ETF', 122.68, 0),
    getLSEData('VDTA', 'VDTA', 'Vanguard USD Treasury Bond UCITS ETF', 27.06, 0),
    getLSEData('VDPA', 'VDPA', 'Vanguard USD Corporate Bond UCITS ETF', 60.37, 0),
    getLSEData('TIP5', 'TIP5', 'iShares $ TIPS 0-5 UCITS ETF', 4.75, 0),
    getLSEData('IT29', 'IT29', 'iShares iBonds Dec 2029 Term $ Treasury UCITS ETF', 109.46, 0),
  ];

  const isLSEOffline = data?.lseUsdOffline ?? false;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Watchlist LSE/USD
        </span>
        {isLSEOffline && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Dados de fallback — sem conexão com Yahoo Finance">
            Dados offline
          </span>
        )}
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pr-1 pl-0.5 w-[45%]">
              ETF
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 px-1 w-[30%]">
              Preço
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 pl-1 pr-0.5 w-[25%]">
              Var.%
            </th>
          </tr>
        </thead>
        <tbody>
          {papeis.map((item, idx) => (
            <tr key={item.symbol ?? idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
              <td className="py-2 pr-1 pl-0.5 text-left">
                <span className="text-[#04101e] dark:text-slate-200 font-bold block text-xs leading-tight">
                  {item.symbol}
                </span>
                <span className="text-[#6a8db0] dark:text-slate-500 text-[9px] tracking-wider block mt-0.5 truncate" title={item.name}>
                  {item.name}
                </span>
              </td>
              <td className="py-2 px-1 text-right text-xs font-bold text-[#04101e] dark:text-slate-200 align-middle">
                {item.preco}
              </td>
              <td className={`py-2 pl-1 pr-0.5 text-right text-xs font-bold align-middle ${
                item.isOffline
                  ? 'text-amber-600 dark:text-amber-400'
                  : item.isUp
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-red-600 dark:text-red-500'
              }`}>
                {item.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { pctAlertClass } from '../../lib/pctAlert';

type MetalItem = {
  name: string;
  unidade: string;
  preco: string;
  change: string;
  changeVal: number;
  isUp: boolean;
  isOffline: boolean;
};

type MetaisCardProps = {
  data: any;
};

export default function MetaisCard({ data }: MetaisCardProps) {
  const getMetalData = (
    key: string,
    name: string,
    unidade: string,
    fallbackPrice: number,
    fallbackChange: number
  ): MetalItem => {
    const item = data?.metals?.[key];
    const priceVal = item ? item.price : fallbackPrice;
    const changeVal = item ? item.pctChange : fallbackChange;

    const isOffline = item?.status === 'offline';
    const formattedPrice = isOffline
      ? '--'
      : `$ ${priceVal >= 1000 ? Math.floor(priceVal).toLocaleString('pt-BR') : priceVal.toFixed(2).replace('.', ',')}`;

    const formattedChange = isOffline ? 'Sem Conexão' : `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2).replace('.', ',')}%`;

    return {
      name,
      unidade,
      preco: formattedPrice,
      change: formattedChange,
      changeVal: isOffline ? 0 : changeVal,
      isUp: isOffline ? true : changeVal >= 0,
      isOffline,
    };
  };

  const metais: MetalItem[] = [
    getMetalData('OURO', 'Ouro', 'XAU/USD · oz', 2650.0, 0.35),
    getMetalData('PRATA', 'Prata', 'XAG/USD · oz', 31.2, 0.52),
    getMetalData('COBRE', 'Cobre', 'USD/lb', 4.25, 0.18),
    getMetalData('PETROLEO_WTI', 'Petróleo (WTI)', 'USD/barril', 71.5, -0.67),
  ];

  const isMetalsOffline = data?.metalsOffline ?? false;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Metais & Commodities
        </span>
        {isMetalsOffline && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Dados de fallback — sem conexão com Yahoo Finance">
            Dados offline
          </span>
        )}
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 pr-1 pl-0.5 w-[45%]">
              Commodity
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
          {metais.map((item, idx) => (
            <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
              <td className="py-2 pr-1 pl-0.5 text-left">
                <span className="text-[#04101e] dark:text-slate-200 font-bold block text-xs leading-tight">
                  {item.name}
                </span>
                <span className="text-[#6a8db0] dark:text-slate-500 text-[9px] uppercase tracking-wider block mt-0.5">
                  {item.unidade}
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
              } ${item.isOffline ? '' : pctAlertClass(item.changeVal)}`}>
                {item.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

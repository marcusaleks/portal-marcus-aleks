type BancoCentralItem = {
  pais: string;
  banco: string;
  taxa_str: string | null;
  data: string | null;
  tipo: 'oficial_diaria' | 'proxy_mensal';
  status: 'live' | 'offline';
};

type BancosCentraisCardProps = {
  bancos: BancoCentralItem[] | null;
  loading: boolean;
};

const FALLBACK_BANCOS: BancoCentralItem[] = [
  { pais: 'EUA', banco: 'Federal Reserve', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
  { pais: 'Zona do Euro', banco: 'BCE (depósito)', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
  { pais: 'Reino Unido', banco: 'Bank of England', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
  { pais: 'Japão', banco: 'Bank of Japan', taxa_str: null, data: null, tipo: 'proxy_mensal', status: 'offline' },
  { pais: 'China', banco: 'PBoC', taxa_str: null, data: null, tipo: 'proxy_mensal', status: 'offline' },
];

export default function BancosCentraisCard({ bancos, loading }: BancosCentraisCardProps) {
  const items = bancos ?? FALLBACK_BANCOS;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Bancos Centrais · Taxas Básicas
        </span>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 w-[45%]">
              Banco Central
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[35%]">
              Taxa
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[20%]">
              Fonte
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
              <td className="py-2.5 text-left text-[11px] text-[#294c72] dark:text-slate-400 font-bold">
                {item.banco}
                <span className="block text-[9px] text-[#6a8db0] dark:text-slate-500 font-medium normal-case">
                  {item.pais}
                </span>
              </td>
              <td className="py-2.5 text-right text-xs font-bold">
                {loading ? (
                  <span className="text-[#6a8db0] dark:text-slate-500 animate-pulse">...</span>
                ) : item.status === 'offline' || !item.taxa_str ? (
                  <span className="text-amber-600 dark:text-amber-400" title="Indisponível">—</span>
                ) : (
                  <span className="text-[#04101e] dark:text-slate-200">{item.taxa_str}</span>
                )}
              </td>
              <td className="py-2.5 text-right">
                <span
                  className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
                    item.tipo === 'proxy_mensal'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                      : 'text-[#6a8db0] dark:text-slate-500'
                  }`}
                  title={
                    item.tipo === 'proxy_mensal'
                      ? 'Proxy mensal (OCDE) — não é a taxa-alvo oficial do banco central, atualização mensal com defasagem'
                      : 'Série diária oficial'
                  }
                >
                  {item.tipo === 'proxy_mensal' ? 'proxy' : 'D0'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

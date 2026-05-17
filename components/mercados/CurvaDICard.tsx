import React from 'react';

type DIItem = {
  label: string;
  yesterday: string;
  today: string;
  var: string;
};

type CurvaDICardProps = {
  data: any;
  selic?: string;
  nextCopom?: string;
};

export default function CurvaDICard({ data, selic = '14,40%', nextCopom = '17/06/2026' }: CurvaDICardProps) {
  const diCurve: DIItem[] = data.diCurve ?? [
    { label: 'DI 1 ano', yesterday: '14,01%', today: '14,16%', var: '+15 p.b.' },
    { label: 'DI 2 anos', yesterday: '14,22%', today: '14,40%', var: '+18 p.b.' },
    { label: 'DI 5 anos', yesterday: '14,50%', today: '14,75%', var: '+25 p.b.' },
    { label: 'DI 10 anos', yesterday: '14,88%', today: '15,16%', var: '+28 p.b.' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Curva DI · Juros Futuros
        </span>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr className="border-b border-[#004ac6]/12 dark:border-slate-800">
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-left pb-1.5 w-[35%]">
              Vencimento
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[22%]">
              Ontem
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[22%]">
              Hoje
            </th>
            <th className="text-[9px] text-[#6a8db0] dark:text-slate-400 font-bold uppercase tracking-wider text-right pb-1.5 w-[21%]">
              Var.
            </th>
          </tr>
        </thead>
        <tbody>
          {diCurve.map((item, idx) => (
            <tr key={idx} className="border-b border-[#004ac6]/08 dark:border-slate-800/40 last:border-none">
              <td className="py-2.5 text-left text-[11px] text-[#294c72] dark:text-slate-400 font-bold">
                {item.label}
              </td>
              <td className="py-2.5 text-right text-xs text-[#6a8db0] dark:text-slate-500 font-medium">
                {item.yesterday}
              </td>
              <td className="py-2.5 text-right text-xs text-[#04101e] dark:text-slate-200 font-bold">
                {item.today}
              </td>
              <td className="py-2.5 text-right text-xs text-emerald-600 dark:text-emerald-500 font-bold">
                {item.var}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Divider */}
      <div className="border-t border-[#004ac6]/12 dark:border-slate-800 my-2"></div>

      {/* Selic & Copom Info */}
      <div className="flex items-center justify-between mt-1 px-1.5">
        <div>
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase block tracking-wider font-bold mb-0.5 select-none">
            Selic Efetiva
          </span>
          <span className="text-[13px] font-black text-[#004ac6] dark:text-blue-400">
            {selic}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 uppercase block tracking-wider font-bold mb-0.5 select-none">
            Reunião Copom
          </span>
          <span className="text-[11px] font-bold text-[#294c72] dark:text-slate-300">
            {nextCopom}
          </span>
        </div>
      </div>
    </div>
  );
}

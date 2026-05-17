import React from 'react';

type CambioCriptoCardProps = {
  data: any;
};

export default function CambioCriptoCard({ data }: CambioCriptoCardProps) {
  const currencies = data.currencies ?? {
    USD: { bid: '5.74', pctChange: '0.41', high: '5.75', low: '5.71' },
    EUR: { bid: '6.52', pctChange: '0.18', high: '6.54', low: '6.49' },
    GBP: { bid: '7.63', pctChange: '0.23', high: '7.65', low: '7.60' }
  };

  const cryptos = data.cryptos ?? {
    BTC: { usd: '104234', brl: '598142', pctChange: '2.45' },
    ETH: { usd: '2923', brl: '16778', pctChange: '1.23' },
    BNB: { usd: '623', brl: '3576', pctChange: '0.89' },
    XRP: { usd: '2.45', brl: '14.06', pctChange: '-1.23' },
    SOL: { usd: '178', brl: '1021', pctChange: '3.45' }
  };

  const renderCurrency = (flag: string, name: string, rate: any) => {
    const isUp = parseFloat(rate.pctChange) >= 0;
    const bidValue = parseFloat(rate.bid).toFixed(2).replace('.', ',');
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-[#004ac6]/10 dark:border-slate-800/40 last:border-none">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{flag}</span>
          <div>
            <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">{name}</div>
            <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold">
              H: {parseFloat(rate.high).toFixed(2).replace('.', ',')} · L: {parseFloat(rate.low).toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-[#04101e] dark:text-slate-200">R$ {bidValue}</div>
          <span className={`text-[10px] font-bold block ${isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
            {isUp ? '+' : ''}{rate.pctChange}%
          </span>
        </div>
      </div>
    );
  };

  const renderCrypto = (symbol: string, name: string, cryptoData: any) => {
    const isUp = parseFloat(cryptoData.pctChange) >= 0;
    const usdVal = parseFloat(cryptoData.usd).toLocaleString('en-US');
    const brlVal = parseFloat(cryptoData.brl).toLocaleString('pt-BR');
    
    return (
      <div className="grid grid-cols-[22px_minmax(0,1fr)_auto_auto] items-center gap-1.5 py-1.5 border-b border-[#004ac6]/10 dark:border-slate-800/40 last:border-none">
        <div className="w-5 h-5 rounded-full bg-[#e4eefb] dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-[#004ac6] dark:text-blue-400 shrink-0 select-none">
          {symbol}
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#04101e] dark:text-slate-200 truncate">{name}</div>
          <div className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold uppercase">{symbol}</div>
        </div>
        <div className="text-right pr-2">
          <div className="text-[11px] font-bold text-[#04101e] dark:text-slate-200">$ {usdVal}</div>
          <div className="text-[9px] text-[#294c72] dark:text-slate-500 font-semibold">R$ {brlVal}</div>
        </div>
        <div className={`text-right min-w-[44px] text-xs font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
          {isUp ? '+' : ''}{parseFloat(cryptoData.pctChange).toFixed(2).replace('.', ',')}%
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#004ac6]/16 dark:border-slate-800 rounded-lg p-3.5 flex flex-col font-mono shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Câmbio
        </span>
      </div>

      <div className="flex flex-col mb-3">
        {renderCurrency('🇺🇸', 'USD / BRL', currencies.USD)}
        {renderCurrency('🇪🇺', 'EUR / BRL', currencies.EUR)}
        {renderCurrency('🇬🇧', 'GBP / BRL', currencies.GBP)}
      </div>

      <div className="h-[1px] bg-[#004ac6]/12 dark:bg-slate-800 my-2"></div>

      <div className="flex items-center justify-between mb-2 mt-1">
        <span className="text-[10px] letter-spacing-[0.1em] uppercase text-[#6a8db0] dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <span className="inline-block w-2.5 h-[2px] bg-[#004ac6] dark:bg-blue-500 rounded-sm"></span>
          Criptomoedas
        </span>
        <span className="text-[9px] text-[#6a8db0] dark:text-slate-500 font-semibold uppercase">USD · BRL</span>
      </div>

      <div className="flex flex-col">
        {renderCrypto('BTC', 'Bitcoin', cryptos.BTC)}
        {renderCrypto('ETH', 'Ethereum', cryptos.ETH)}
        {renderCrypto('BNB', 'BNB', cryptos.BNB)}
        {renderCrypto('XRP', 'Ripple', cryptos.XRP)}
        {renderCrypto('SOL', 'Solana', cryptos.SOL)}
      </div>
    </div>
  );
}

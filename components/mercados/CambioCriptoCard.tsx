import React from 'react';

// Bandeiras em SVG para compatibilidade perfeita com Windows
const USFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-[18px] h-[18px] shrink-0">
    <path fill="#EEE" d="M32 5H4C1.791 5 0 6.791 0 9v18c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4V9c0-2.209-1.791-4-4-4z"/>
    <path fill="#DD2E44" d="M36 10v2H0v-2c0-1.104.896-2 2-2h32c1.104 0 2 .896 2 2zm0 6H0v4h36v-4zm0 8H0v4h36v-4z"/>
    <path fill="#3B88C3" d="M19 5H4C1.791 5 0 6.791 0 9v11h19V5z"/>
    <circle fill="#FFF" cx="3" cy="8" r="1"/><circle fill="#FFF" cx="7" cy="8" r="1"/><circle fill="#FFF" cx="11" cy="8" r="1"/><circle fill="#FFF" cx="15" cy="8" r="1"/><circle fill="#FFF" cx="5" cy="11" r="1"/><circle fill="#FFF" cx="9" cy="11" r="1"/><circle fill="#FFF" cx="13" cy="11" r="1"/><circle fill="#FFF" cx="3" cy="14" r="1"/><circle fill="#FFF" cx="7" cy="14" r="1"/><circle fill="#FFF" cx="11" cy="14" r="1"/><circle fill="#FFF" cx="15" cy="14" r="1"/><circle fill="#FFF" cx="5" cy="17" r="1"/><circle fill="#FFF" cx="9" cy="17" r="1"/><circle fill="#FFF" cx="13" cy="17" r="1"/>
  </svg>
);

const EUFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-[18px] h-[18px] shrink-0">
    <path fill="#003399" d="M32 5H4C1.791 5 0 6.791 0 9v18c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4V9c0-2.209-1.791-4-4-4z"/>
    <path fill="#FFCC00" d="M18 10.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm0 16c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm-5.5-2.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm11 0c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zM9 20c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm18 0c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zM7.5 14.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm21 0c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm-16-4c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5zm11 0c-.276 0-.5-.224-.5-.5s.224-.5.5-.5.5.224.5.5-.224.5-.5.5z"/>
  </svg>
);

const UKFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-[18px] h-[18px] shrink-0">
    <path fill="#00247D" d="M32 5H4C1.791 5 0 6.791 0 9v18c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4V9c0-2.209-1.791-4-4-4z"/>
    <path fill="#FFF" d="M32 5h-1.378l-6.84 5.361L18 5h-4l-5.782 5.361L1.378 5H0v1.082l6.983 5.474L0 17.525V21h1.378l6.84-5.361L18 21h4l5.782-5.361L34.622 21H36v-1.082l-6.983-5.474L36 8.475V5z"/>
    <path fill="#CF142B" d="M21.5 29H32L21 20.375V18.5l15 11.75V31h-2.5L20 20.375V18.5L32 27.875V25l-15-11.75v1.875zm-7-24H4l11 8.625V15.5L0 3.75V2h2.5L16 12.625V14.5L4 5.125V8l15 11.75V17.875z"/>
    <path fill="#FFF" d="M21 5v9h15v8H21v9h-6v-9H0v-8h15V5z"/>
    <path fill="#CF142B" d="M19 5v11h17v4H19v11h-2V20H0v-4h17V5z"/>
  </svg>
);

type CambioCriptoCardProps = {
  data: any;
};

export default function CambioCriptoCard({ data }: CambioCriptoCardProps) {
  const isOffline = !data.currencies && !data.cryptos;

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

  const renderCurrency = (flag: React.ReactNode, name: string, rate: any) => {
    const isUp = parseFloat(rate.pctChange) >= 0;
    const bidValue = parseFloat(rate.bid).toFixed(2).replace('.', ',');
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-[#004ac6]/10 dark:border-slate-800/40 last:border-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center">{flag}</span>
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
            {isUp ? '+' : ''}{parseFloat(rate.pctChange).toFixed(2).replace('.', ',')}%
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
        {isOffline && (
          <span className="text-[9px] font-bold text-amber-500/80 dark:text-amber-400/70 uppercase tracking-wider" title="Dados de fallback — sem conexão com AwesomeAPI">
            Dados offline
          </span>
        )}
      </div>

      <div className="flex flex-col mb-3">
        {renderCurrency(<USFlag />, 'USD / BRL', currencies.USD)}
        {renderCurrency(<EUFlag />, 'EUR / BRL', currencies.EUR)}
        {renderCurrency(<UKFlag />, 'GBP / BRL', currencies.GBP)}
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
        {cryptos.XMR && renderCrypto('XMR', 'Monero', cryptos.XMR)}
      </div>
    </div>
  );
}

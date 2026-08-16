import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

async function fetchYahooIndex(symbol: string, defaultPrice: number, defaultChange: number) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`, {
      headers: YAHOO_HEADERS,
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const result = data?.chart?.result?.[0]?.meta;
    if (!result) throw new Error();
    const price = result.regularMarketPrice ?? defaultPrice;
    const previousClose = result.previousClose ?? result.chartPreviousClose ?? (price / (1 + defaultChange / 100));
    const pctChange = previousClose ? ((price - previousClose) / previousClose) * 100 : defaultChange;
    return { price, pctChange };
  } catch {
    return { price: defaultPrice, pctChange: defaultChange, status: 'offline' };
  }
}

async function fetchYahooCurrency(symbol: string, defaultBid: number, defaultChange: number) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`, {
      headers: YAHOO_HEADERS,
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const result = data?.chart?.result?.[0]?.meta;
    if (!result) throw new Error();
    const bid = result.regularMarketPrice ?? defaultBid;
    const previousClose = result.previousClose ?? result.chartPreviousClose ?? defaultBid;
    const pctChange = previousClose ? ((bid - previousClose) / previousClose) * 100 : defaultChange;
    const high = result.regularMarketDayHigh ?? bid;
    const low = result.regularMarketDayLow ?? bid;
    return {
      bid: bid.toFixed(4),
      pctChange: pctChange.toFixed(2),
      high: high.toFixed(4),
      low: low.toFixed(4),
      status: 'live' as const
    };
  } catch {
    return {
      bid: defaultBid.toFixed(2),
      pctChange: defaultChange.toFixed(2),
      high: defaultBid.toFixed(2),
      low: defaultBid.toFixed(2),
      status: 'offline' as const
    };
  }
}

async function fetchYahooIntraday(symbol: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=15m`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result || !result.indicators?.quote?.[0]?.close) return null;
    
    // Extrai apenas os preços de fechamento, removendo os nulls
    const closeArray = result.indicators.quote[0].close.filter((v: number | null) => v !== null);
    
    // Insere o fechamento anterior no início para que o gráfico reflita a queda/alta desde o D-1
    if (result.meta?.chartPreviousClose) {
      closeArray.unshift(result.meta.chartPreviousClose);
    }
    
    return closeArray;
  } catch {
    return null;
  }
}

function loadCurvaDI() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'curva_di.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      asOf: null,
      items: [
        { label: 'DI 1 ano', vertice_du: 252, taxa: 0, taxa_str: '--' },
        { label: 'DI 2 anos', vertice_du: 504, taxa: 0, taxa_str: '--' },
        { label: 'DI 5 anos', vertice_du: 1260, taxa: 0, taxa_str: '--' },
        { label: 'DI 10 anos', vertice_du: 2520, taxa: 0, taxa_str: '--' },
      ]
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BRAPI_TOKEN;
  const symbols = [
    '^BVSP', 'AXIA3', 'BBAS3', 'BBDC3', 'BBSE3', 'CMIG4', 'CSMG3',
    'ISAE4', 'ITSA4', 'ITUB4', 'MXRF11', 'PETR4', 'PMLL11', 'ROMI3', 
    'VALE3', 'VISC11', 'VIVT3', 'XPML11'
  ];

  const DEFAULT_STOCK_METADATA: Record<string, { name: string; price: number; changePercent: number; logo: string }> = {
    '^BVSP': { name: 'Ibovespa', price: 128452.12, changePercent: -1.07, logo: '' },
    'AXIA3': { name: 'Axia Value FIP', price: 14.22, changePercent: 0.45, logo: 'https://icons.brapi.dev/icons/AXIA3.svg' },
    'BBAS3': { name: 'Banco do Brasil SA', price: 27.65, changePercent: 1.88, logo: 'https://icons.brapi.dev/icons/BBAS3.svg' },
    'BBDC3': { name: 'Banco Bradesco SA ON', price: 12.45, changePercent: -0.56, logo: 'https://icons.brapi.dev/icons/BBDC3.svg' },
    'BBSE3': { name: 'BB Seguridade ON', price: 33.12, changePercent: 0.12, logo: 'https://icons.brapi.dev/icons/BBSE3.svg' },
    'CMIG4': { name: 'Cemig PN', price: 11.20, changePercent: -1.15, logo: 'https://icons.brapi.dev/icons/CMIG4.svg' },
    'CSMG3': { name: 'Copasa ON', price: 21.80, changePercent: 2.34, logo: 'https://icons.brapi.dev/icons/CSMG3.svg' },
    'ISAE4': { name: 'Isa Energia PN', price: 10.15, changePercent: -0.22, logo: 'https://icons.brapi.dev/icons/ISAE4.svg' },
    'ITSA4': { name: 'Itausa PN', price: 10.45, changePercent: 0.58, logo: 'https://icons.brapi.dev/icons/ITSA4.svg' },
    'ITUB4': { name: 'Itau Unibanco PN', price: 39.70, changePercent: -1.73, logo: 'https://icons.brapi.dev/icons/ITUB4.svg' },
    'MXRF11': { name: 'Maxi Renda FII', price: 10.12, changePercent: 0.10, logo: 'https://icons.brapi.dev/icons/MXRF11.svg' },
    'PETR4': { name: 'Petrobras PN', price: 45.47, changePercent: 1.04, logo: 'https://icons.brapi.dev/icons/PETR4.svg' },
    'PMLL11': { name: 'Polo Malls FII', price: 98.50, changePercent: -0.45, logo: 'https://icons.brapi.dev/icons/PMLL11.svg' },
    'ROMI3': { name: 'Indústrias Romi ON', price: 11.85, changePercent: -2.34, logo: 'https://icons.brapi.dev/icons/ROMI3.svg' },
    'VALE3': { name: 'Vale SA ON', price: 83.50, changePercent: 0.76, logo: 'https://icons.brapi.dev/icons/VALE3.svg' },
    'VISC11': { name: 'Vinci Shopping FII', price: 118.20, changePercent: 0.25, logo: 'https://icons.brapi.dev/icons/VISC11.svg' },
    'VIVT3': { name: 'Telefonica Brasil ON', price: 51.40, changePercent: -0.78, logo: 'https://icons.brapi.dev/icons/VIVT3.svg' },
    'XPML11': { name: 'XP Malls FII', price: 112.45, changePercent: 0.65, logo: 'https://icons.brapi.dev/icons/XPML11.svg' }
  };

  try {
    const responseLogs: any[] = [];
    const results: any[] = [];
    console.log("[BRAPI FETCH LOG] Starting sequential fetch of", symbols.length, "symbols...");
    for (const symbol of symbols) {
      try {
        const url = `https://brapi.dev/api/quote/${encodeURIComponent(symbol)}`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(3000),
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`[BRAPI FETCH LOG] ${symbol} Status:`, res.status, res.statusText);
        responseLogs.push({ symbol, status: res.status, statusText: res.statusText });
        if (res.ok) {
          const data = await res.json();
          if (data?.results?.[0]) {
            results.push(data.results[0]);
          }
        } else {
          const errText = await res.text();
          console.error(`[BRAPI FETCH LOG] ${symbol} Error body:`, errText);
          const meta = DEFAULT_STOCK_METADATA[symbol];
          if (meta) {
            results.push({
              symbol: symbol,
              shortName: symbol,
              longName: meta.name,
              currency: 'BRL',
              regularMarketPrice: meta.price,
              regularMarketDayHigh: meta.price,
              regularMarketDayLow: meta.price,
              regularMarketDayRange: `${meta.price.toFixed(2)} - ${meta.price.toFixed(2)}`,
              regularMarketChange: meta.price * (meta.changePercent / 100),
              regularMarketChangePercent: meta.changePercent,
              regularMarketTime: null,
              marketCap: 5000000000,
              regularMarketVolume: 120000,
              regularMarketPreviousClose: meta.price / (1 + meta.changePercent / 100),
              regularMarketOpen: meta.price,
              logourl: meta.logo,
              status: 'offline'
            });
          }
        }
      } catch (err: any) {
        console.error(`[BRAPI FETCH LOG] ${symbol} catch error:`, err);
        responseLogs.push({ symbol, error: err.message || err.toString() });
        const meta = DEFAULT_STOCK_METADATA[symbol];
        if (meta) {
          results.push({
            symbol: symbol,
            shortName: symbol,
            longName: meta.name,
            currency: 'BRL',
            regularMarketPrice: meta.price,
            regularMarketDayHigh: meta.price,
            regularMarketDayLow: meta.price,
            regularMarketDayRange: `${meta.price.toFixed(2)} - ${meta.price.toFixed(2)}`,
            regularMarketChange: meta.price * (meta.changePercent / 100),
            regularMarketChangePercent: meta.changePercent,
            regularMarketTime: new Date().toISOString(),
            marketCap: 5000000000,
            regularMarketVolume: 120000,
            regularMarketPreviousClose: meta.price / (1 + meta.changePercent / 100),
            regularMarketOpen: meta.price,
            logourl: meta.logo,
            status: 'offline'
          });
        }
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log("[BRAPI FETCH LOG] Finished fetching. Total successful stocks:", results.length);
    const brapiPromise = Promise.resolve(results);

    const coinGeckoPromise = fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,solana,monero&vs_currencies=usd,brl&include_24hr_change=true',
      { signal: AbortSignal.timeout(8000) }
    ).then(r => r.ok ? r.json() : null).catch(() => null);

    const ibovIntradayPromise = fetchYahooIntraday('^BVSP');

    const yahooPromise = Promise.all([
      fetchYahooIndex('^DJI', 42512.44, 0.45).then(data => ({ key: 'DOW', ...data })),
      fetchYahooIndex('^GSPC', 5812.23, 0.67).then(data => ({ key: 'SP500', ...data })),
      fetchYahooIndex('^IXIC', 18234.55, 1.12).then(data => ({ key: 'NASDAQ', ...data })),
      fetchYahooIndex('^RUT', 2048.11, -0.23).then(data => ({ key: 'RUSSELL', ...data })),
      fetchYahooIndex('^FTSE', 8234.12, 0.23).then(data => ({ key: 'FTSE', ...data })),
      fetchYahooIndex('^GDAXI', 18923.45, 0.45).then(data => ({ key: 'DAX', ...data })),
      fetchYahooIndex('^N225', 38456.22, -1.23).then(data => ({ key: 'NIKKEI', ...data })),
      fetchYahooIndex('^HSI', 22123.88, -0.89).then(data => ({ key: 'HANGSENG', ...data })),
      fetchYahooIndex('EWZ', 28.21, -3.02).then(data => ({ key: 'EWZ', ...data }))
    ]);

    const currencyPromise = Promise.all([
      fetchYahooCurrency('BRL=X', 5.74, 0.41).then(data => ({ key: 'USD', ...data })),
      fetchYahooCurrency('EURBRL=X', 6.52, 0.18).then(data => ({ key: 'EUR', ...data })),
      fetchYahooCurrency('GBPBRL=X', 7.63, 0.23).then(data => ({ key: 'GBP', ...data }))
    ]);

    // Resolve all promises
    const [stocks, globalIndices, currencyResults, geckoData, ibovIntraday] = await Promise.all([
      brapiPromise,
      yahooPromise,
      currencyPromise,
      coinGeckoPromise,
      ibovIntradayPromise
    ]);

    // Build consolidated globalIndices map
    const globalMap = globalIndices.reduce((acc: any, cur: any) => {
      acc[cur.key] = { price: cur.price, pctChange: cur.pctChange, status: cur.status };
      return acc;
    }, {});

    // Build consolidated currency map
    const currencyMap = currencyResults.reduce((acc: any, cur: any) => {
      const { key, ...rest } = cur;
      acc[key] = rest;
      return acc;
    }, {});

    const currenciesOffline = currencyResults.every(c => c.status === 'offline');

    // Build cripto payload from CoinGecko
    const fmt = (n: number | undefined, fallback: string) => n != null ? Math.round(n).toString() : fallback;
    const fmtSmall = (n: number | undefined, fallback: string) => n != null ? n.toFixed(4) : fallback;
    const fmtPct = (n: number | undefined, fallback: string) => n != null ? n.toFixed(2) : fallback;

    const cryptos = {
      BTC: {
        usd: fmt(geckoData?.bitcoin?.usd, '76000'),
        brl: fmt(geckoData?.bitcoin?.brl, '379000'),
        pctChange: fmtPct(geckoData?.bitcoin?.usd_24h_change, '0.00'),
        status: geckoData?.bitcoin ? 'live' : 'offline'
      },
      ETH: {
        usd: fmt(geckoData?.ethereum?.usd, '2100'),
        brl: fmt(geckoData?.ethereum?.brl, '10500'),
        pctChange: fmtPct(geckoData?.ethereum?.usd_24h_change, '0.00'),
        status: geckoData?.ethereum ? 'live' : 'offline'
      },
      BNB: {
        usd: fmt(geckoData?.binancecoin?.usd, '635'),
        brl: fmt(geckoData?.binancecoin?.brl, '3175'),
        pctChange: fmtPct(geckoData?.binancecoin?.usd_24h_change, '0.00'),
        status: geckoData?.binancecoin ? 'live' : 'offline'
      },
      XRP: {
        usd: fmtSmall(geckoData?.ripple?.usd, '1.35'),
        brl: fmtSmall(geckoData?.ripple?.brl, '6.75'),
        pctChange: fmtPct(geckoData?.ripple?.usd_24h_change, '0.00'),
        status: geckoData?.ripple ? 'live' : 'offline'
      },
      SOL: {
        usd: fmt(geckoData?.solana?.usd, '85'),
        brl: fmt(geckoData?.solana?.brl, '425'),
        pctChange: fmtPct(geckoData?.solana?.usd_24h_change, '0.00'),
        status: geckoData?.solana ? 'live' : 'offline'
      },
      XMR: {
        usd: fmtSmall(geckoData?.monero?.usd, '170.00'),
        brl: fmt(geckoData?.monero?.brl, '850'),
        pctChange: fmtPct(geckoData?.monero?.usd_24h_change, '0.00'),
        status: geckoData?.monero ? 'live' : 'offline'
      }
    };

    const cryptosOffline = Object.values(cryptos).every(c => c.status === 'offline');

    const responseData = {
      timestamp: new Date().toISOString(),
      ibovIntraday,
      stocks,
      globalIndices: globalMap,
      currenciesOffline,
      cryptosOffline,
      currencies: currencyMap,
      cryptos,
      diCurve: loadCurvaDI()
    };

    res.status(200).json(responseData);
  } catch {
    res.status(502).json({ error: 'Upstream error' });
  }
}

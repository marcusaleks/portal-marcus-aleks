import type { NextApiRequest, NextApiResponse } from 'next';

async function fetchYahooIndex(symbol: string, defaultPrice: number, defaultChange: number) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const result = data?.chart?.result?.[0]?.meta;
    if (!result) throw new Error();
    const price = result.regularMarketPrice ?? defaultPrice;
    const previousClose = result.previousClose ?? (price / (1 + defaultChange / 100));
    const pctChange = previousClose ? ((price - previousClose) / previousClose) * 100 : defaultChange;
    return { price, pctChange };
  } catch {
    return {
      price: defaultPrice,
      pctChange: defaultChange,
      status: 'offline'
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
    const closeArray = result.indicators.quote[0].close;
    return closeArray.filter((v: number | null) => v !== null);
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BRAPI_TOKEN;
  const symbols = [
    '^BVSP', 'AXIA6', 'BBAS3', 'BBDC3', 'BBSE3', 'CMIG4', 'CSMG3', 
    'ISAE4', 'ITSA4', 'ITUB4', 'MXRF11', 'PETR4', 'PMLL11', 'ROMI3', 
    'VALE3', 'VISC11', 'VIVT3', 'XPML11'
  ];

  const DEFAULT_STOCK_METADATA: Record<string, { name: string; price: number; changePercent: number; logo: string }> = {
    '^BVSP': { name: 'Ibovespa', price: 128452.12, changePercent: -1.07, logo: '' },
    'AXIA6': { name: 'Axia Value FIP', price: 14.22, changePercent: 0.45, logo: 'https://icons.brapi.dev/icons/AXIA6.svg' },
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
        const url = `https://brapi.dev/api/quote/${encodeURIComponent(symbol)}?token=${token}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
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

    const awesomeApiUrl = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL,XRP-BRL,SOL-BRL,BTC-USD,ETH-USD,SOL-USD,XRP-USD,BNB-BRL,BNB-USD';
    const awesomePromise = fetch(awesomeApiUrl, { signal: AbortSignal.timeout(5000) })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    const coinGeckoPromise = fetch('https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd,brl&include_24hr_change=true', { signal: AbortSignal.timeout(5000) })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    const ibovIntradayPromise = fetchYahooIntraday('^BVSP');

    const yahooPromise = Promise.all([
      fetchYahooIndex('^DJI', 42512.44, 0.45).then(data => ({ key: 'DOW', ...data })),
      fetchYahooIndex('^GSPC', 5812.23, 0.67).then(data => ({ key: 'SP500', ...data })),
      fetchYahooIndex('^IXIC', 18234.55, 1.12).then(data => ({ key: 'NASDAQ', ...data })),
      fetchYahooIndex('^RUT', 2048.11, -0.23).then(data => ({ key: 'RUSSELL', ...data })),
      fetchYahooIndex('^FTSE', 8234.12, 0.23).then(data => ({ key: 'FTSE', ...data })),
      fetchYahooIndex('^GDAXI', 18923.45, 0.45).then(data => ({ key: 'DAX', ...data })),
      fetchYahooIndex('^N225', 38456.22, -1.23).then(data => ({ key: 'NIKKEI', ...data })),
      fetchYahooIndex('^HSI', 22123.88, -0.89).then(data => ({ key: 'HANGSENG', ...data }))
    ]);

    // 4. Resolve all promises
    const [stocks, currencies, globalIndices, geckoData, ibovIntraday] = await Promise.all([
      brapiPromise,
      awesomePromise,
      yahooPromise,
      coinGeckoPromise,
      ibovIntradayPromise
    ]);

    // Build consolidated globalIndices map
    const globalMap = globalIndices.reduce((acc: any, cur: any) => {
      acc[cur.key] = { price: cur.price, pctChange: cur.pctChange, status: cur.status };
      return acc;
    }, {});

    // Build consolidated payload
    const responseData = {
      timestamp: new Date().toISOString(),
      ibovIntraday: ibovIntraday,
      stocks: stocks,
      globalIndices: globalMap,
      currencies: currencies ? {
        USD: {
          bid: currencies.USDBRL?.bid ?? '5.74',
          pctChange: currencies.USDBRL?.pctChange ?? '0.41',
          high: currencies.USDBRL?.high ?? '5.75',
          low: currencies.USDBRL?.low ?? '5.71'
        },
        EUR: {
          bid: currencies.EURBRL?.bid ?? '6.52',
          pctChange: currencies.EURBRL?.pctChange ?? '0.18',
          high: currencies.EURBRL?.high ?? '6.54',
          low: currencies.EURBRL?.low ?? '6.49'
        },
        GBP: {
          bid: currencies.GBPBRL?.bid ?? '7.63',
          pctChange: currencies.GBPBRL?.pctChange ?? '0.23',
          high: currencies.GBPBRL?.high ?? '7.65',
          low: currencies.GBPBRL?.low ?? '7.60'
        }
      } : {
        USD: { bid: '5.74', pctChange: '0.41', high: '5.75', low: '5.71' },
        EUR: { bid: '6.52', pctChange: '0.18', high: '6.54', low: '6.49' },
        GBP: { bid: '7.63', pctChange: '0.23', high: '7.65', low: '7.60' }
      },
      cryptos: currencies ? {
        BTC: {
          usd: currencies.BTCUSD?.bid ?? '104234',
          brl: currencies.BTCBRL?.bid ?? '598142',
          pctChange: currencies.BTCUSD?.pctChange ?? '2.45'
        },
        ETH: {
          usd: currencies.ETHUSD?.bid ?? '2923',
          brl: currencies.ETHBRL?.bid ?? '16778',
          pctChange: currencies.ETHUSD?.pctChange ?? '1.23'
        },
        BNB: {
          usd: currencies.BNBUSD?.bid ?? '623',
          brl: currencies.BNBBRL?.bid ?? '3576',
          pctChange: currencies.BNBUSD?.pctChange ?? '0.89'
        },
        XRP: {
          usd: currencies.XRPUSD?.bid ?? '2.45',
          brl: currencies.XRPBRL?.bid ?? '14.06',
          pctChange: currencies.XRPUSD?.pctChange ?? '-1.23'
        },
        SOL: {
          usd: currencies.SOLUSD?.bid ?? '178',
          brl: currencies.SOLBRL?.bid ?? '1021',
          pctChange: currencies.SOLUSD?.pctChange ?? '3.45'
        },
        XMR: {
          usd: geckoData?.monero?.usd?.toString() ?? '392.82',
          brl: geckoData?.monero?.brl?.toString() ?? '1995.71',
          pctChange: geckoData?.monero?.usd_24h_change?.toString() ?? '1.65'
        }
      } : {
        BTC: { usd: '104234', brl: '598142', pctChange: '2.45' },
        ETH: { usd: '2923', brl: '16778', pctChange: '1.23' },
        BNB: { usd: '623', brl: '3576', pctChange: '0.89' },
        XRP: { usd: '2.45', brl: '14.06', pctChange: '-1.23' },
        SOL: { usd: '178', brl: '1021', pctChange: '3.45' },
        XMR: { usd: '392.82', brl: '1995.71', pctChange: '1.65' }
      },
      diCurve: [
        { label: 'DI 1 ano', yesterday: '14,01%', today: '14,16%', var: '+15 p.b.' },
        { label: 'DI 2 anos', yesterday: '14,22%', today: '14,40%', var: '+18 p.b.' },
        { label: 'DI 5 anos', yesterday: '14,50%', today: '14,75%', var: '+25 p.b.' },
        { label: 'DI 10 anos', yesterday: '14,88%', today: '15,16%', var: '+28 p.b.' }
      ]
    };

    res.status(200).json(responseData);
  } catch {
    res.status(502).json({ error: 'Upstream error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: 'https://www.bleepingcomputer.com/feed/', category: 'security' },
  { url: 'https://infomoney.com.br/feed/', category: 'finance' },
  { url: 'https://moneyreport.com.br/feed/', category: 'finance' },
];

type NewsItem = {
  title: string;
  summary: string;
  link: string;
  date: string;
  category: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  try {
    const results = await Promise.allSettled(
      FEEDS.map(feed => parser.parseURL(feed.url).then(data => ({ data, category: feed.category })))
    );

    const items: NewsItem[] = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const { data, category } = result.value;

      for (const item of (data.items || []).slice(0, 10)) {
        if (!item.title || !item.link) continue;
        items.push({
          title: item.title.trim(),
          summary: item.contentSnippet?.trim() || item.summary?.trim() || '',
          link: item.link,
          date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : '',
          category,
        });
      }
    }

    items.sort((a, b) => {
      const da = a.date ? new Date(a.date.split('/').reverse().join('-')).getTime() : 0;
      const db = b.date ? new Date(b.date.split('/').reverse().join('-')).getTime() : 0;
      return db - da;
    });

    res.status(200).json(items);
  } catch {
    res.status(500).json([]);
  }
}

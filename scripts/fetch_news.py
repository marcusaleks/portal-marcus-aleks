import feedparser
import json
import os
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

# Fontes redundantes e altamente estáveis
FEEDS = {
    'finance': [
        'https://news.google.com/rss/search?q=mercado+financeiro+b3&hl=pt-BR&gl=BR&ceid=BR:pt-419',
        'https://finance.yahoo.com/news/rssindex'
    ],
    'intel': [
        'https://www.bleepingcomputer.com/feed/',
        'https://thehackernews.com/rss.xml'
    ]
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, urls in FEEDS.items():
        print(f"--- Iniciando categoria: {category} ---")
        for url in urls:
            try:
                response = requests.get(url, headers=HEADERS, timeout=20)
                feed = feedparser.parse(response.content)
                
                if len(feed.entries) > 0:
                    print(f"Sucesso! {len(feed.entries)} notícias encontradas em: {url}")
                    for entry in feed.entries[:5]:
                        try:
                            # Tenta traduzir título e resumo
                            title_pt = translator.translate(entry.title)
                            raw_summary = entry.get('summary', entry.get('description', 'Acesse o link para detalhes.'))
                            summary_pt = translator.translate(raw_summary[:200])
                            
                            all_news[category].append({
                                'title': title_pt,
                                'summary': summary_pt + "...",
                                'link': entry.link,
                                'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                            })
                        except: continue
                    break # Se conseguiu notícias desta URL, pula para a próxima categoria
            except Exception as e:
                print(f"Erro na fonte {url}: {e}")

    # Garante que o arquivo não fique vazio se as fontes falharem totalmente
    if not all_news['finance'] and not all_news['intel']:
        all_news['intel'].append({
            'title': 'Sistema de Radar em Manutenção',
            'summary': 'As fontes de dados estão temporariamente indisponíveis. Tentando reconexão...',
            'link': '#',
            'date': datetime.now().strftime("%d/%m/%Y %H:%M")
        })

    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    print("Processo finalizado.")

if __name__ == "__main__":
    fetch_and_translate()

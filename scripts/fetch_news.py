import feedparser
import json
import os
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

FEEDS = {
    'finance': 'https://www.reuters.com/arc/outboundfeeds/rss/news/business/',
    'intel': 'https://www.occrp.org/en?format=feed&type=rss'
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, url in FEEDS.items():
        print(f"--- Iniciando categoria: {category} ---")
        try:
            response = requests.get(url, headers=HEADERS, timeout=20)
            print(f"Status da resposta para {category}: {response.status_code}")
            
            feed = feedparser.parse(response.content)
            print(f"Entradas encontradas no feed: {len(feed.entries)}")
            
            for i, entry in enumerate(feed.entries[:5]):
                try:
                    print(f"Traduzindo item {i+1}: {entry.title[:50]}...")
                    title_pt = translator.translate(entry.title)
                    all_news[category].append({
                        'title': title_pt,
                        'link': entry.link,
                        'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                    })
                except Exception as e:
                    print(f"Erro ao traduzir item {i+1}: {e}")
        except Exception as e:
            print(f"Erro de conexão em {category}: {e}")

    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    print("Arquivo news.json salvo com sucesso.")

if __name__ == "__main__":
    fetch_and_translate()

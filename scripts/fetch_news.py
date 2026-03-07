import feedparser
import json
import os
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

# Fontes estáveis de notícias (RSS)
FEEDS = {
    'finance': 'https://www.reuters.com/arc/outboundfeeds/rss/news/business/',
    'intel': 'https://www.occrp.org/en?format=feed&type=rss'
}

# Identificação para evitar bloqueios de servidores
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, url in FEEDS.items():
        print(f"Buscando: {category}...")
        try:
            # Faz o download manual para contornar bloqueios
            response = requests.get(url, headers=HEADERS, timeout=15)
            feed = feedparser.parse(response.content)
            
            print(f"Encontradas {len(feed.entries)} notícias.")
            
            for entry in feed.entries[:5]:
                try:
                    title_pt = translator.translate(entry.title)
                    # Tenta pegar o resumo de diferentes campos possíveis
                    raw_summary = entry.get('summary', entry.get('description', 'Acesse o link para ler.'))
                    summary_pt = translator.translate(raw_summary[:250])
                    
                    all_news[category].append({
                        'title': title_pt,
                        'summary': summary_pt + "...",
                        'link': entry.link,
                        'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                    })
                except:
                    continue
        except Exception as e:
            print(f"Erro em {category}: {e}")

    # Salva o arquivo final
    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    fetch_and_translate()

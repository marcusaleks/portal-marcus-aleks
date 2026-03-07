import feedparser
import json
import os
import re
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

FEEDS = {
    'finance': ['https://news.google.com/rss/search?q=mercado+financeiro+b3&hl=pt-BR&gl=BR&ceid=BR:pt-419'],
    'intel': ['https://www.bleepingcomputer.com/feed/']
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def clean_text(html_content):
    """Remove agressivamente tags HTML e entidades de texto."""
    if not html_content:
        return ""
    # Remove tags HTML completas
    text = re.sub(r'<[^>]+>', ' ', html_content)
    # Remove entidades como &nbsp; &amp; &quot;
    text = re.sub(r'&[a-z0-9]+;', ' ', text)
    # Normaliza espaços em branco e quebras de linha
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, urls in FEEDS.items():
        for url in urls:
            try:
                response = requests.get(url, headers=HEADERS, timeout=20)
                feed = feedparser.parse(response.content)
                
                for entry in feed.entries[:5]:
                    # Limpa o título e o resumo ANTES de traduzir
                    raw_title = entry.get('title', '')
                    raw_summary = entry.get('summary', entry.get('description', ''))
                    
                    clean_title = clean_text(raw_title)
                    clean_summary = clean_text(raw_summary)

                    # Traduz apenas o texto já limpo
                    try:
                        title_pt = translator.translate(clean_title)
                        # Limita o resumo para não quebrar o layout do card
                        summary_pt = translator.translate(clean_summary[:300])
                        
                        all_news[category].append({
                            'title': title_pt,
                            'summary': summary_pt + "...",
                            'link': entry.link,
                            'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                        })
                    except:
                        continue
            except Exception as e:
                print(f"Erro em {url}: {e}")

    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    print("Dados higienizados e salvos.")

if __name__ == "__main__":
    fetch_and_translate()

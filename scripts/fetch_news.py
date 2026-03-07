import feedparser
import json
import os
import re
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

FEEDS = {
    'finance': [
        'https://news.google.com/rss/search?q=mercado+financeiro+b3&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    ],
    'intel': [
        'https://www.bleepingcomputer.com/feed/',
    ]
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def clean_html(raw_html):
    """Remove todas as tags HTML e limpa espaços extras."""
    # Remove tudo entre < e >
    clean_text = re.sub(r'<[^>]+>', '', raw_html)
    # Remove entidades como &nbsp; ou &amp;
    clean_text = re.sub(r'&[a-z]+;', '', clean_text)
    return " ".join(clean_text.split())

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, urls in FEEDS.items():
        print(f"--- Processando: {category} ---")
        for url in urls:
            try:
                response = requests.get(url, headers=HEADERS, timeout=20)
                feed = feedparser.parse(response.content)
                
                if len(feed.entries) > 0:
                    for entry in feed.entries[:5]:
                        try:
                            title_pt = translator.translate(entry.title)
                            
                            # Captura o resumo bruto
                            raw_summary = entry.get('summary', entry.get('description', ''))
                            # Limpa o HTML antes de traduzir (para economizar processamento e evitar erros)
                            clean_summary = clean_html(raw_summary)
                            
                            # Se o resumo for muito curto ou apenas o link, pega os primeiros 150 caracteres
                            summary_pt = translator.translate(clean_summary[:250])
                            
                            all_news[category].append({
                                'title': title_pt,
                                'summary': summary_pt + "...",
                                'link': entry.link,
                                'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                            })
                        except: continue
                    break 
            except Exception as e:
                print(f"Erro: {e}")

    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    print("Dashboard higienizado com sucesso.")

if __name__ == "__main__":
    fetch_and_translate()

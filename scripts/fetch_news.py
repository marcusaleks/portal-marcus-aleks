import feedparser
import json
import os
import requests
from datetime import datetime
from deep_translator import GoogleTranslator

# Fontes alternativas mais estáveis para automação
FEEDS = {
    'finance': 'https://search.cnbc.com/rs/search/view.xml?partnerId=2000&keywords=business',
    'intel': 'https://therecord.media/feed'
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_and_translate():
    translator = GoogleTranslator(source='auto', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, url in FEEDS.items():
        print(f"--- Iniciando categoria: {category} ---")
        try:
            response = requests.get(url, headers=HEADERS, timeout=20)
            print(f"Status da resposta: {response.status_code}")
            
            feed = feedparser.parse(response.content)
            print(f"Notícias encontradas: {len(feed.entries)}")
            
            for entry in feed.entries[:5]:
                try:
                    title_pt = translator.translate(entry.title)
                    raw_summary = entry.get('summary', entry.get('description', 'Clique no link para ler a matéria completa.'))
                    summary_pt = translator.translate(raw_summary[:200])
                    
                    all_news[category].append({
                        'title': title_pt,
                        'summary': summary_pt + "...",
                        'link': entry.link,
                        'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                    })
                except Exception as e:
                    print(f"Erro no item: {e}")
                    continue
        except Exception as e:
            print(f"Erro de conexão em {category}: {e}")

    # AQUI ESTAVA O ERRO: Corrigido para exist_ok
    os.makedirs('public/data', exist_ok=True) 
    
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)
    print("Arquivo news.json atualizado com sucesso.")

if __name__ == "__main__":
    fetch_and_translate()

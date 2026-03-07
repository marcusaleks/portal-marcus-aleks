import feedparser
import json
import os
from datetime import datetime
from deep_translator import GoogleTranslator

# Configurações de Fontes (Financeiro e Intel OSINT)
FEEDS = {
    'finance': 'https://www.reutersagency.com/feed/?best-topics=business&post_type=best',
    'intel': 'https://www.occrp.org/en/announcements?format=feed' # Foco em Crime Organizado e Corrupção
}

def fetch_and_translate():
    translator = GoogleTranslator(source='en', target='pt')
    all_news = {'finance': [], 'intel': []}

    for category, url in FEEDS.items():
        feed = feedparser.parse(url)
        # Pegamos apenas as 5 notícias mais recentes de cada categoria
        for entry in feed.entries[:5]:
            try:
                title_pt = translator.translate(entry.title)
                summary_pt = translator.translate(entry.summary[:200]) # Resumo curto
                
                all_news[category].append({
                    'title': title_pt,
                    'summary': summary_pt + "...",
                    'link': entry.link,
                    'date': datetime.now().strftime("%d/%m/%Y %H:%M")
                })
            except:
                continue

    # Salva o resultado em um arquivo JSON que o site vai ler
    os.makedirs('public/data', exist_ok=True)
    with open('public/data/news.json', 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    fetch_and_translate()

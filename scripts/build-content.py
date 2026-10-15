#!/usr/bin/env python3
"""Regenerate the progressively enhanced media index from assets/content.json."""
from pathlib import Path
from html import escape
from datetime import date
import json,re
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'assets/content.json').read_text())
labels={'podcast':'Podcast','writing':'Writing','speaking':'Speaking'}
arrow='<svg class="arrow-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M5 15 15 5M5 5h10v10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ids=set();cards=[]
for item in items:
    assert item['id'] not in ids,'Duplicate content ID'
    ids.add(item['id']);assert item['type'] in labels,'Unsupported content type'
    if item.get('url'):assert item['url'].startswith('https://'),'Content URLs must use HTTPS'
    display_date=(date.fromisoformat(item['date']+'-01').strftime('%B %Y') if item.get('date_precision')=='month' else date.fromisoformat(item['date']).strftime('%b %-d, %Y')) if item.get('date') else item.get('location','')
    search=escape((item['title']+' '+item['description']+' '+item['source']).lower(),quote=True)
    title=escape(item['title'])
    if item.get('url'):title=f'<a href="{escape(item["url"])}" target="_blank" rel="noopener noreferrer">{title}</a>'
    art=f'<div class="media-art"><div class="art-fallback" aria-hidden="true"><span>{labels[item["type"]]}</span><strong>{escape(item.get("art_title",item["source"]))}</strong><i></i></div>'
    if item.get('image'):
        fit=' contain' if item.get('image_fit')=='contain' else ''
        position=escape(item.get('image_position','50% 50%'),quote=True)
        art+=f'<img class="media-image{fit}" src="{escape(item["image"],quote=True)}" alt="{escape(item.get("image_alt",item["source"]),quote=True)}" style="object-position:{position}" loading="lazy">'
    art+='</div>'
    end=arrow if item.get('url') else '<span class="appearance-note">In person</span>'
    cards.append(f'''<article class="media-card" data-type="{item['type']}" data-search="{search}">{art}<div class="card-top"><span class="type-label">{labels[item['type']]}</span><span>{escape(display_date)}</span></div><h2>{title}</h2><p>{escape(item['description'])}</p><div class="media-bottom"><span>{escape(item['source'])}</span><span aria-hidden="true">{end}</span></div></article>''')
page=root/'insights.html';text=page.read_text()
text=re.sub(r'(<div class="media-grid">).*?(</div><div class="empty-state")',lambda m:m[1]+''.join(cards)+m[2],text,flags=re.S)
text=re.sub(r'(<p class="result-count" aria-live="polite">).*?(</p>)',lambda m:m[1]+f'{len(items)} items'+m[2],text)
page.write_text(text);print(f'Built {len(items)} media entries.')

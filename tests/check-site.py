from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.links=[];self.h1=0
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if t=='h1':self.h1+=1
        if t in ['a','link','script','img']:
            url=a.get('href') or a.get('src')
            if url:self.links.append(url)
        if t=='img':assert a.get('alt') or (a.get('alt')=='' and a.get('aria-hidden')=='true'),'Image must have descriptive alt or be explicitly decorative'
        if a.get('target')=='_blank':assert 'noopener' in a.get('rel',''),'External tab needs noopener'
pages={}
for path in root.glob('*.html'):
    page=Page();page.feed(path.read_text());pages[path.name]=page
    assert len(page.ids)==len(set(page.ids)),f'Duplicate IDs: {path}'
for filename,page in pages.items():
    for link in page.links:
        url=urlsplit(link)
        if url.scheme or url.netloc:continue
        target=unquote(url.path) or filename
        assert (root/target).exists(),f'Missing local file: {filename}: {link}'
        if url.fragment and target in pages:assert url.fragment in pages[target].ids,f'Missing anchor: {link}'
for filename in ['index.html','insights.html']:assert pages[filename].h1==1
items=json.loads((root/'assets/content.json').read_text())
assert len(items)>=4 and len({x['id'] for x in items})==len(items)
assert 'Download Speaker Kit' not in (root/'index.html').read_text()
assert 'data-netlify="true"' in (root/'index.html').read_text()
assert 'assets/styles.css' in (root/'index.html').read_text()
print('PASS: local links, legacy targets, anchors, IDs, image alt text, H1s, external-tab safety, content records, form markup.')

# Every public media destination has a separately keyboard-reachable arrow.
from html.parser import HTMLParser
class MediaArrowParser(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='a' and 'media-arrow-link' in attrs.get('class','').split(): self.links.append(attrs)
arrow_parser=MediaArrowParser()
arrow_parser.feed((root/'insights.html').read_text())
records=json.loads((root/'assets/content.json').read_text())
assert len(arrow_parser.links)==sum(bool(x.get('url')) for x in records)
assert all(x.get('href','').startswith('https://') and x.get('aria-label','').startswith('Open ') for x in arrow_parser.links)
print('PASS: all public media arrows are named, keyboard-reachable links.')

from pathlib import Path
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit,unquote
import json,re
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

sms_path=root/'sms'/'index.html'
sms_html=unescape(sms_path.read_text())
sms=Page();sms.feed(sms_html)
assert sms.h1==1,'SMS page needs one H1'
assert len(sms.ids)==len(set(sms.ids)),'Duplicate IDs on SMS page'
for anchor in ['terms','privacy']:
    assert anchor in sms.ids,f'SMS page missing #{anchor}'
for phrase in [
    'Reply STOP to opt out, HELP for help.',
    'Msg & data rates may apply',
    'Message frequency varies, usually a few messages per month per person.',
    'No mobile information is shared with third parties or affiliates for their marketing.',
    'STOPALL, UNSUBSCRIBE, CANCEL, END or QUIT',
]:
    assert phrase in sms_html,f'SMS page missing required text: {phrase}'
assert '608' not in sms_html and '299-9876' not in sms_html and '2999876' not in sms_html
assert not re.search(r'(?:\+?1[\s.-]*)?(?:\(\d{3}\)|\d{3})[\s.-]*\d{3}[\s.-]*\d{4}', sms_html),'SMS page still publishes a phone number'
for link in sms.links:
    url=urlsplit(link)
    if url.scheme or url.netloc:continue
    target=(sms_path.parent/unquote(url.path)).resolve()
    assert target.exists(),f'Missing local file from SMS page: {link}'
redirects=(root/'_redirects').read_text()
for line in redirects.splitlines():
    rule=line.split('#',1)[0].strip()
    if not rule:continue
    source=rule.split()[0]
    assert source not in ['/sms','/sms/','/sms/*','/*'],f'Redirect would block /sms/: {line}'
print('PASS: /sms/ policy text, #terms, #privacy, and no blocking redirect.')

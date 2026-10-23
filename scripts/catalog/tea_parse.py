# TEA-League「ミニ四駆歴史年表(1982年〜1999年)」から「〇〇が発売」を年月つきで拾う
import re, json
ls = open('tea.txt', encoding='utf-8').read().split('\n')
year = None; month = None; out = []
for l in ls:
    m = re.fullmatch(r'(19\d\d)年', l)
    if m: year = int(m.group(1)); month = None; continue
    m = re.fullmatch(r'(\d{1,2})月', l)
    if m and year: month = int(m.group(1)); continue
    if not (year and month and l.startswith('・') and '発売' in l): continue
    body = l[1:]
    body = re.split(r'が(?:同時)?発売|を発売|発売開始', body)[0]
    body = re.sub(r'^.*?(ミニ四駆|レーサーミニ四駆|スーパーミニ四駆|フルカウルミニ四駆|エアロミニ四駆|マイティミニ四駆|リアルミニ四駆|ワイルドミニ四駆|トラッキンミニ四駆|コミカルミニ四駆)(シリーズ)?(第\S+弾)?(の)?', '', body)
    for name in re.split(r'[、,]|と(?=[^ぁ-ん])', body):
        name = name.strip(' 「」『』')
        if 2 <= len(name) <= 40:
            out.append({'d': f'{year}-{month:02d}', 'n': name, 'line': l[:80]})
json.dump(out, open('tea.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(out))
for x in out[:60]: print(x['d'], x['n'])

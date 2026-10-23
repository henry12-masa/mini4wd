# ミニ四駆の全車種名簿を作る。
#  - 「ミニ四駆一覧」の表(シリーズ・品番・車種名・シャーシ・限定)
#  - 「フルカウルミニ四駆」「エアロミニ四駆」の発売年月
#  - タミヤ公式の商品ページの発売日(PRO・REV・新品番・限定品だけ。旧品番は再販日なので使わない)
# 出力: cars.json [{s:シリーズslug, no:品番, n:車種名, c:シャーシ, d:YYYY-MM, l:限定なら1, src:日付の出典}]
import json, re, html, unicodedata

def clean(s):
    s = html.unescape(s).replace('　', ' ')
    s = re.sub(r'\[\d+\]|\[注 ?\d+\]', '', s)
    return re.sub(r'\s+', ' ', s).strip()

ns = {}
src = open('tparse.py', encoding='utf-8').read()
exec(src[:src.index('out={}')], ns)
P = ns['P']

SERIES = [
    ('レーザーミニ四駆', 'laser'), ('レーサーミニ四駆', 'racer'), ('スーパーミニ四駆', 'super'), ('フルカウルミニ四駆', 'fullcowl'),
    ('リアルミニ四駆', 'real'), ('エアロミニ四駆', 'aero'), ('マイティミニ四駆', 'mighty'), ('ミニ四駆PRO', 'pro'),
    ('ミニ四駆REV', 'rev'), ('コミカルミニ四駆', 'comical'), ('ワイルドミニ四駆', 'wild'), ('トラッキンミニ四駆', 'truckin'),
    ('干支ミニ四駆', 'eto'), ('コラボレーション', 'collab'),
]
def series_of(heads):
    for k, v in SERIES:
        if k in heads: return v
    return None

# ---- 1. ミニ四駆一覧の表
cars = []
p = P(); p.feed(open('p_ミニ四駆一覧.html', encoding='utf-8').read())
for tb in p.tables:
    rows = tb['rows']
    if not rows: continue
    heads = ' / '.join(h for _, h in tb['heading'])
    s = series_of(heads)
    if not s: continue
    hdr = [clean(c['t']) for c in rows[0]]
    if s == 'eto':
        ni = hdr.index('ベース車種'); yi = hdr.index('年')
    elif s == 'collab':
        ni = hdr.index('商品名'); yi = None
    else:
        if '車種名' not in hdr: continue
        ni = hdr.index('車種名'); yi = None
    noi = hdr.index('No.') if 'No.' in hdr else (hdr.index('Vol.') if 'Vol.' in hdr else None)
    ci = hdr.index('シャーシ') if 'シャーシ' in hdr else None
    limited = 1 if re.search(r'限定|メモリアル|完成車', heads) else 0
    if s in ('eto', 'collab'): limited = 1
    kind = 'memorial' if 'メモリアル' in heads else ('complete' if '完成車' in heads else '')
    for r in rows[1:]:
        cells = [clean(c['t']) for c in r]
        if len(cells) <= ni or not cells[ni]: continue
        name = cells[ni]
        if s == 'eto':
            y = re.match(r'(\d{4})', cells[yi])
            name = f"干支ミニ四駆 {cells[1]}年 ({name})" if len(cells) > 1 else name
        no = cells[noi] if noi is not None and len(cells) > noi else ''
        chassis = cells[ci] if ci is not None and len(cells) > ci else ''
        car = {'s': s, 'no': no if not kind else '', 'n': name, 'c': chassis, 'd': '', 'l': limited, 'src': ''}
        if s == 'eto' and y: car['d'] = y.group(1); car['src'] = 'wiki'
        cars.append(car)

# ---- 2. フルカウル・エアロの発売年月
def norm(t):
    t = unicodedata.normalize('NFKC', t).lower()
    t = re.sub(r'[\s・\-‐－.()（）/／\'’]', '', t)
    return t.replace('jr', 'jr')

dated = {}
for f in ['p_フルカウルミニ四駆.html', 'p_エアロミニ四駆.html']:
    s = open(f, encoding='utf-8').read()
    t = re.sub(r'<(style|script)[\s\S]*?</\1>', '', s)
    for li in re.findall(r'<li[^>]*>([\s\S]*?)</li>', t):
        txt = clean(re.sub(r'<[^>]+>', '', li))
        m = re.match(r'^(?:[\d-]+/)?([^（(]+?)（.*?(\d{4})年(\d{1,2})月発売', txt)
        if m:
            dated[norm(m.group(1))] = f"{m.group(2)}-{int(m.group(3)):02d}"
for c in cars:
    if c['s'] in ('fullcowl', 'aero') and not c['d']:
        d = dated.get(norm(c['n']))
        if d: c['d'] = d; c['src'] = 'wiki'

# ---- 3. タミヤ公式「発売月製品一覧」(いちばん古い月を初出とする)
import glob, os
PARTS = re.compile(r'(^HG |ローラー|モーター|ギヤ|ギア|プレート|ステー|ホイール|タイヤ|ベアリング|シャフト|バッテリー|電池|ガイドブック|ステッカー|マスダンパー|スペーサー|ビス|ナット|ブレーキ|ターミナル|スイッチ|工具|ドライバー|充電|サーキット|コース|パーツ|ウエイト|ダンパー|スキッド|バンパー|クリップ|ピニオン|ボールリンク|カラーシャーシ|強化シャーシ|シャーシセット|ボディセット|ボディパーツ|スタビ|ジョイント|グリス|オイル|メンテナンス|ピット|ラック|バッグ|ケース|Tシャツ|キャップ|フィギュア|クリアボディ|ポリカボディ単品)')
monthly = {}
for f in sorted(glob.glob('months/*.html')):
    ym = os.path.basename(f)[:6]
    t = open(f, encoding='utf-8', errors='replace').read()
    t = html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)[\s\S]*?</>', '', t)))
    t = re.sub(r'\s+', ' ', t)
    for it, name, price in re.findall(r'ITEM (\d{5}) (.+?) ([\d,]+)円', t):
        name = re.sub(r'\s*発売日：.*$', '', name).strip()
        name = re.sub(r'^1/32\s*', '', name)
        d = f"{ym[:4]}-{ym[4:]}"
        if it not in monthly or d < monthly[it]['d']:
            monthly[it] = {'item': it, 'n': name, 'd': d}
def car_key(n):
    # 「（VSシャーシ）」「（タイプ3シャーシ仕様）」などは別の商品(再販・仕様違い)なので、シャーシ表記も含めて比べる
    return norm(n)
def car_key_loose(n):
    return norm(re.sub(r'[（(][^）)]*シャーシ[^）)]*[）)]', '', n))
wiki_keys = {}
for c in cars:
    wiki_keys.setdefault(car_key(c['n']), []).append(c)
    if 'シャーシ' not in c['n']:
        wiki_keys.setdefault(car_key_loose(c['n']), []).append(c)
hits = 0; added = 0
for it, m in sorted(monthly.items(), key=lambda x: x[1]['d']):
    key = car_key(m['n'])
    if key not in wiki_keys:
        lk = car_key_loose(m['n'])
        if lk in wiki_keys and not any('シャーシ' in c['n'] for c in wiki_keys[lk]):
            key = lk
    is_car = key in wiki_keys or (('シャーシ' in m['n']) and not PARTS.search(m['n']))
    if not is_car: continue
    if key in wiki_keys:
        for c in wiki_keys[key]:
            c.setdefault('item', it)
            if not c['d'] or m['d'] < c['d']:
                c['d'] = m['d']; c['src'] = f'tamiya-month:{it}'; hits += 1
    else:
        ch = re.search(r'[（(]\s*([^）)]*?)\s*シャーシ', m['n'])
        n = int(it)
        s_ = 'pro' if 18600 <= n < 18700 else ('rev' if 18700 <= n < 18800 else ('racer' if 18000 <= n < 18200 else ('fullcowl' if 19400 <= n < 19500 else 'special')))
        car = {'s': s_, 'no': '', 'n': m['n'], 'c': ch.group(1).strip() if ch else '', 'd': m['d'], 'l': 1 if n >= 94000 else 0, 'src': f'tamiya-month:{it}', 'item': it}
        cars.append(car); wiki_keys.setdefault(key, []).append(car); added += 1
print('monthly items', len(monthly), 'matched', hits, 'added', added)

# ---- 4. TEA-League の年表(1982〜1999年)で残りを埋め、出典どうしの食い違いを記録する
tea = json.load(open('tea.json', encoding='utf-8'))
tea_by = {}
for t in tea:
    k = car_key(t['n'])
    if k and (k not in tea_by or t['d'] < tea_by[k]): tea_by[k] = t['d']
conflicts = []; tea_hits = 0
for c in cars:
    td = tea_by.get(car_key(c['n']))
    if not td: continue
    if c['d'] and c['d'][:7] != td:
        conflicts.append(f"{c['n']}: {c['d']} ({c['src']}) / TEA {td}")
    if not c['d'] or td < c['d']:
        c['d'] = td; c['src'] = 'tea'; tea_hits += 1
# 手で確かめた初出(タミヤの月別一覧に再販の月しか載っていないもの)
MANUAL = {
    'アバンテJr.': ('1988-12', 'tea'),
    'ダッシュ1号 皇帝エンペラー（タイプ3シャーシ仕様）': ('1990-01', 'tea'),
    # ウィキペディア「ミニ四駆」(1982年7月13日発売)とTEA年表
    'フォード・レインジャー4×4': ('1982-07', 'wiki'),
    'シボレーピックアップ4×4': ('1982-07', 'wiki'),
    '日産 サファリ': ('1982-11', 'tea'),
    'ホンダ シティターボ': ('1984-02', 'tea'),
    '三菱 パジェロ ワゴン 2000 ターボXL': ('1984-03', 'tea'),
    'モンスタービートルJr.': ('1987-05', 'tea'),
    'サニーシャトル': ('1990-12', 'tea'),
    'ジョリージョーカー': ('1990-12', 'tea'),
}
for c in cars:
    if c['n'] in MANUAL:
        c['d'], c['src'] = MANUAL[c['n']]
for c in cars:
    if c['s'] in ('eto', 'collab'): c['s'] = 'special'
open('conflicts.txt', 'w', encoding='utf-8').write(chr(10).join(conflicts))
print('tea filled', tea_hits, 'conflicts', len(conflicts))

cars = [c for c in cars if not (c['d'] and c['d'] > '2026-10')]  # 未発売(発売予定)は除く
json.dump(cars, open('cars.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
from collections import Counter
print('cars', len(cars), 'dated', sum(1 for c in cars if c['d']), 'tamiya hits', hits, 'tamiya added', added)
print(Counter(c['s'] for c in cars))
print(Counter((c['s'], bool(c['d'])) for c in cars))

// タミヤ公式「発売月製品一覧」(data/catalog/tamiya-monthly.json、monthly.mjs で取得)のうち、
// 全車種名簿(raw.json)に入っていない商品を、限定・特別仕様の車(extra-cars.json)と
// グレードアップパーツなどの商品(parts.json)に分ける。
//   node scripts/catalog/monthly-split.mjs
// 日付は商品名に「発売日:YYYY年M月」があればそれを、なければ一覧に最初に載った月を使う。
import { readFileSync, writeFileSync } from "node:fs";
import { coreName } from "../../data/kit-key.mjs";
import { isPartItem } from "../../data/catalog/roster.mjs";

const dir = new URL("../../data/catalog/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, dir), "utf8"));
const monthly = read("tamiya-monthly.json");
const raw = read("raw.json");

const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, "&");

// 品番ごとに、いちばん古い掲載月と商品名
const first = new Map();
for (const ym of Object.keys(monthly).sort()) {
	for (const [item, name] of monthly[ym]) {
		if (!first.has(item)) first.set(item, { item, ym: `${ym.slice(0, 4)}-${ym.slice(4)}`, name: decode(name) });
	}
}

const LAST = "2026-10"; // これより後は発売前なので載せない
const known = new Set(raw.map((r) => r.item).filter((it) => it && !isPartItem(it)));
const rawKeys = new Set(raw.map((r) => coreName(r.n)));
const looseKey = (n) => coreName(n.replace(/[（(][^）)]*[）)]/g, ""));
const rawLoose = new Set(raw.map((r) => looseKey(r.n)));
const PREFIX = /^(レーサー|スーパー|フルカウル|エアロ|ワイルド|コミカル|マイティ)?ミニ四駆(PRO|REV)?\s+/;
// 年月の空いている名簿の行。名前の読み(「XX(ダブルエックス)」など)の有無を吸収して突き合わせる
const undated = raw.filter((r) => !r.d && !r.item);
function matchUndated(name, pool = undated) {
	const a = coreName(name.replace(PREFIX, ""));
	const b = looseKey(name.replace(PREFIX, ""));
	// 近い一致から順に試し、候補がちょうど1つに絞れたときだけ使う
	const tiers = [
		(r) => coreName(r.n) === a || coreName(r.n) === b,
		(r) => looseKey(r.n) === b,
		(r) => { const k = coreName(r.n); return k.startsWith(a) && k.length - a.length <= 8 && /^[ァ-ヶー]+$/.test(k.slice(a.length)); },
	];
	for (const t of tiers) {
		const hits = pool.filter(t);
		if (hits.length === 1) return hits[0];
		if (hits.length > 1) return null;
	}
	return null;
}

function parse({ item, ym, name }) {
	const m = name.match(/発売日[:：]\s*(?:【[^】]*】)?\s*(\d{4})年\s*(\d{1,2})月/);
	const date = m ? `${m[1]}-${m[2].padStart(2, "0")}` : ym;
	const clean = name
		.replace(/\s*発売日[:：].*$/, "")
		.replace(/^1\/32\s*/, "")
		.replace(/\s+/g, " ")
		.trim();
	return { item, date, exact: !!m, name: clean, orig: name };
}

const NOT_CAR = /サーキット|セット|ボディパーツ|ステッカー|ガイドブック|バッグ|ケース|ボード|ラック|ピット|Tシャツ|フィギュア|モーター|ローラー|タイヤ|ホイール|ギヤ|ギア|シャフト|ステー|プレート|ダンパー|ベアリング|ビス|ナット|スタビ|バッテリー|電池|充電|ウエイト|グリス|オイル|ターミナル|ブレーキ|スキッド|バンパー|カバー|キャップ|ボディのみ/;
function isCar(p) {
	if (NOT_CAR.test(p.name) && !/スペシャルキット/.test(p.name)) return false;
	return /^1\/32/.test(p.orig) || /スペシャル|スぺシャル|プレミアム|メモリアル|[(（][^)）]*シャーシ[^)）]*[)）]|\(MS\)|\(AR\)|（MS）|（AR）/.test(p.name);
}

// パーツの分類(上から順に最初に当たったもの)
const CATS = [
	["motor", "モーター", /モーター/],
	["roller", "ローラー・スタビ", /ローラー|スタビ|ボールスタビ/],
	["tire", "タイヤ・ホイール", /タイヤ|ホイール/],
	["gear", "ギヤ・シャフト・ベアリング", /ギヤ|ギア|シャフト|ベアリング|ピニオン|カウンター|クラウン|軸受/],
	["stay", "ステー・プレート", /ステー|プレート|スキッド|バンパー|ブレーキ|ボールリンク|サイドマスダンパー|リヤブレーキ/],
	["damper", "マスダンパー・ウエイト", /マスダンパー|ダンパー|ウエイト|おもり/],
	["chassis", "シャーシ・ボディ", /シャーシ|ボディ|カウル|ギヤカバー|ターミナル|スイッチ|カバー/],
	["power", "電池・充電", /電池|バッテリー|充電|パワーチャンプ|ネオチャンプ/],
	["course", "コース・サーキット", /サーキット|コース|レーンチェンジ|セクション|スロープ|フェンス/],
	["tools", "工具・メンテナンス・ビス", /ビス|ナット|スペーサー|ワッシャー|ドライバー|工具|グリス|オイル|メンテナンス|リーマー|ドリル|ピンセット|ニッパー|ヤスリ|クリーナー|チェッカー|ゲージ/],
	["goods", "グッズ・ガイドブック", /ガイド|ブック|バッグ|ケース|ボックス|ボード|ラック|ピット|Tシャツ|キャップ|ステッカー|フィギュア|タオル|ポーチ|ストラップ|スタンド|ディスプレイ/],
	["other", "その他", /./],
];
const catOf = (name) => CATS.find(([, , re]) => re.test(name))[0];

const limitedItem = (item) => Number(item) >= 94000;
const extraCars = [];
// 名簿の中の重複: ウィキペディア由来の年月なしの行と、タミヤの一覧から足した行(同じ車種で表記違い)をまとめる
const merges = [];
for (const r of raw.filter((x) => x.item && x.d && !x.no && String(x.src).startsWith("tamiya-month"))) {
	const hit = matchUndated(r.n, undated.filter((u) => u !== r && !!u.l === !!r.l));
	if (hit && !merges.some((m) => m.n === hit.n)) merges.push({ n: hit.n, d: r.d, item: r.item, src: r.src, from: r.n, drop: r.item });
}
const dateFixes = [];
const parts = [];
let skippedOld = 0;
for (const f of [...first.values()].sort((a, b) => a.item.localeCompare(b.item))) {
	if (known.has(f.item)) continue;
	const p = parse(f);
	if (p.date > LAST) continue;
	// 発売日の書かれた商品、限定品(94000番台〜)、PRO・REV・派生シリーズの品番だけ、一覧の月を初出として使う
	const n = Number(p.item);
	const reliable = p.exact || limitedItem(p.item) || (n >= 18600 && n < 18800) || (n >= 17700 && n < 18000);
	const hit = matchUndated(p.name);
	if (hit) {
		// 名簿にある(年月が空いている)車種。信頼できる日付なら埋める
		// 限定品の品番は、限定でない名簿の行(元の商品)には当てない
		if (reliable && (hit.l || !limitedItem(p.item)) && !dateFixes.some((x) => x.n === hit.n) && !merges.some((x) => x.n === hit.n)) dateFixes.push({ n: hit.n, d: p.date, item: p.item, src: `tamiya-month:${p.item}`, from: p.name });
		continue;
	}
	const family = n >= 17700 && n < 18000;
	if (family || (isCar(p) && n >= 18600)) {
		if (rawKeys.has(coreName(p.name)) || rawLoose.has(looseKey(p.name))) continue;
		// 旧品番(〜18599)は一覧の月が再販の月のことがあるので、発売日の書かれていないものは年月を空ける
		if (!reliable) skippedOld++;
		const ch = p.name.match(/[（(]\s*([^）)]*?)\s*シャーシ/) || p.name.match(/[（(](MS|AR|MA|VZ|FM-A|スーパーXX|スーパーII)[)）]/);
		extraCars.push({
			s: family ? "family" : limitedItem(p.item) ? "special" : n >= 18700 && n < 18800 ? "rev" : n >= 18600 && n < 18700 ? "pro" : "special",
			no: "",
			n: p.name,
			c: ch ? ch[1].trim() : "",
			d: reliable ? p.date : "",
			l: limitedItem(p.item) ? 1 : 0,
			src: reliable ? `tamiya-month:${p.item}` : "",
			item: p.item,
		});
	} else {
		parts.push({ item: p.item, n: p.name, d: p.date, exact: p.exact ? 1 : 0, l: limitedItem(p.item) ? 1 : 0, cat: catOf(p.name) });
	}
}

// 月別一覧にないが、今もタミヤのカタログにある商品(scripts/catalog/items.mjs で商品ページから取得)。発売年月は分からない
let fromItems = 0;
try {
	const items = read("tamiya-items.json");
	const have = new Set([...parts.map((p) => p.item), ...known]);
	for (const [item, title] of Object.entries(items)) {
		if (!title || have.has(item)) continue;
		const n = decode(title).replace(/^ミニ四駆(グレードアップパーツ|特別企画)?\s*/, "").replace(/\s+/g, " ").trim();
		parts.push({ item, n, d: "", exact: 0, l: limitedItem(item) ? 1 : 0, cat: catOf(n) });
		fromItems++;
	}
} catch {}

writeFileSync(new URL("extra-cars.json", dir), JSON.stringify(extraCars, null, 0).replace(/\},\{/g, "},\n{"));
writeFileSync(new URL("date-fixes.json", dir), JSON.stringify([...merges, ...dateFixes], null, 0).replace(/\},\{/g, "},\n{"));
writeFileSync(new URL("parts.json", dir), JSON.stringify({ cats: CATS.map(([slug, label]) => ({ slug, label })), parts }, null, 0).replace(/\},\{/g, "},\n{"));
console.log(`商品ページから足したパーツ ${fromItems}点`);
const byCat = {};
for (const p of parts) byCat[p.cat] = (byCat[p.cat] || 0) + 1;
console.log(`重複をまとめた ${merges.length}台 / 名簿の年月を埋めた ${dateFixes.length}台 / 限定・特別仕様の車 ${extraCars.length}台(年月なし ${skippedOld}) / パーツなど ${parts.length}点`, byCat);

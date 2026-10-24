// data/catalog/raw.json(全車種名簿)を、サイトが読む形に分割して public/catalog-data/ に書き出す。
//   public/catalog-data/index.json           シリーズごとの件数と年ごとの件数
//   public/catalog-data/<シリーズ>/<年>.json  その年に初出の車種 [[初出年月, 車種名, シャーシ, 限定なら1, 厳選slug], ...]
//   年月の分からない車種は <シリーズ>/0.json にまとめる(ページでは「年不明」と表示)。
//   public/catalog-data/parts/index.json     パーツなどの分類ごとの件数
//   public/catalog-data/parts/<分類>.json     [[発売年月, 商品名, 品番, 限定なら1, 発売日の明記があれば1], ...]
// 名簿の組み立て(追加分・年月の補い・重複のまとめ)は data/catalog/roster.mjs。
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { loadParts, loadRoster } from "../data/catalog/roster.mjs";
import { games } from "../data/catalog.mjs";
import { GRADES } from "../data/taxonomies.mjs";
import { coreName } from "../data/kit-key.mjs";

const raw = loadRoster();
// 名簿の更新日(日本時間)
const TODAY = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const OUT = new URL("../public/catalog-data/", import.meta.url);

// 名簿だけに出すシリーズ(厳選マシンの絞り込みには出さない)
const SERIES_LABELS = { ...GRADES, family: "派生シリーズ(DRX・楽しいトレインなど)" };
const ORDER = Object.keys(SERIES_LABELS);
const SHORT = Object.fromEntries(Object.entries(SERIES_LABELS).map(([k, v]) => [k, v.replace(/ミニ四駆|・/g, "").trim() || v]));

// 厳選マシンの索引: 車種名のキー
const curated = new Map();
for (const g of games) curated.set(coreName(g.title), g);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const index = [];
let linked = 0;
for (const slug of ORDER) {
	const list = raw.filter((k) => k.s === slug).sort((a, b) => (a.d || "9999").localeCompare(b.d || "9999") || a.n.localeCompare(b.n, "ja"));
	if (!list.length) continue;
	const byYear = new Map();
	for (const k of list) {
		const year = k.d ? k.d.slice(0, 4) : "0";
		const hit = curated.get(coreName(k.n));
		const row = [k.d || "", k.n, k.c || "", k.l ? 1 : 0];
		if (hit) { row.push(hit.slug); linked++; }
		if (!byYear.has(year)) byYear.set(year, []);
		byYear.get(year).push(row);
	}
	mkdirSync(new URL(`${slug}/`, OUT), { recursive: true });
	const years = [];
	for (const [year, rows] of [...byYear].sort(([a], [b]) => (a === "0" ? 1 : b === "0" ? -1 : a.localeCompare(b)))) {
		writeFileSync(new URL(`${slug}/${year}.json`, OUT), JSON.stringify(rows));
		years.push([Number(year), rows.length]);
	}
	index.push({ slug, label: SERIES_LABELS[slug], short: SHORT[slug], count: list.length, dl: list.filter((k) => k.l).length, years });
}
const total = index.reduce((n, p) => n + p.count, 0);
writeFileSync(new URL("index.json", OUT), JSON.stringify({ updated: TODAY, total, grades: index }));
// パーツなど
const { cats, parts } = loadParts();
mkdirSync(new URL("parts/", OUT), { recursive: true });
const partIndex = [];
for (const { slug, label } of cats) {
	const list = parts.filter((p) => p.cat === slug).sort((a, b) => a.d.localeCompare(b.d) || a.item.localeCompare(b.item));
	if (!list.length) continue;
	writeFileSync(new URL(`parts/${slug}.json`, OUT), JSON.stringify(list.map((p) => [p.d, p.n, p.item, p.l, p.exact])));
	partIndex.push({ slug, label, count: list.length, dl: list.filter((p) => p.l).length, from: list[0].d.slice(0, 4), to: list.at(-1).d.slice(0, 4) });
}
writeFileSync(new URL("parts/index.json", OUT), JSON.stringify({ updated: TODAY, total: parts.length, cats: partIndex }));
console.log(`パーツなど: ${parts.length}点 / ${partIndex.length}分類`);
console.log(`全車種名簿: ${total}車種 / ${index.length}シリーズ(厳選マシンへのリンク ${linked}件 / 厳選${games.length}台)`);

// data/catalog/raw.json(全車種名簿)を、サイトが読む形に分割して public/catalog-data/ に書き出す。
//   public/catalog-data/index.json           シリーズごとの件数と年ごとの件数
//   public/catalog-data/<シリーズ>/<年>.json  その年に初出の車種 [[初出年月, 車種名, シャーシ, 限定なら1, 厳選slug], ...]
//   年月の分からない車種は <シリーズ>/0.json にまとめる(ページでは「年不明」と表示)。
// data/catalog/additions.json は、元の資料に載っていない車種を手で足す分。
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { games } from "../data/catalog.mjs";
import { GRADES } from "../data/taxonomies.mjs";
import { coreName } from "../data/kit-key.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(`../data/catalog/${name}`, import.meta.url), "utf8"));
const raw = [...read("raw.json"), ...read("additions.json")];
const OUT = new URL("../public/catalog-data/", import.meta.url);

const ORDER = Object.keys(GRADES);
const SHORT = Object.fromEntries(Object.entries(GRADES).map(([k, v]) => [k, v.replace(/ミニ四駆|・/g, "").trim() || v]));

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
	index.push({ slug, label: GRADES[slug], short: SHORT[slug], count: list.length, dl: list.filter((k) => k.l).length, years });
}
const total = index.reduce((n, p) => n + p.count, 0);
writeFileSync(new URL("index.json", OUT), JSON.stringify({ updated: "2026-10-24", total, grades: index }));
console.log(`全車種名簿: ${total}車種 / ${index.length}シリーズ(厳選マシンへのリンク ${linked}件 / 厳選${games.length}台)`);

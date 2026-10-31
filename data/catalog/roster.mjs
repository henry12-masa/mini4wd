// 全車種名簿を組み立てる。build-catalog / check-years / find-kit が共通で使う。
//   raw.json         ウィキペディア+タミヤ公式の月別一覧から作った名簿(scripts/catalog/extract.py)
//   additions.json   元の資料にない車種を手で足す分
//   extra-cars.json  月別一覧にだけある限定車・派生シリーズ(scripts/catalog/monthly-split.mjs)
//   date-fixes.json  年月の空いた行を月別一覧で埋める分と、表記違いの重複をまとめる分(同上)
//   official-fixes.json  元の資料の年月・シャーシが公式の月別一覧と違うものを、公式に合わせて上書きする分(override)
import { readFileSync } from "node:fs";

/** グレードアップパーツの品番(15xxx)。名簿の元データに紛れたものは、パーツ名簿のほうに回す */
export const isPartItem = (item) => /^15\d{3}$/.test(item ?? "");

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));

export function loadRoster() {
	const fixes = [...read("date-fixes.json"), ...read("official-fixes.json")];
	const drop = new Set(fixes.map((f) => f.drop).filter(Boolean));
	const byName = new Map(fixes.map((f) => [f.n, f]));
	const rows = [...read("raw.json"), ...read("additions.json"), ...read("extra-cars.json")]
		.filter((r) => !(r.item && drop.has(r.item) && !byName.has(r.n)))
		.filter((r) => !isPartItem(r.item));
	return rows.map((r) => {
		const f = byName.get(r.n);
		if (f?.override) return { ...r, d: f.d ?? r.d, c: f.c ?? r.c, src: f.src, item: r.item || f.item };
		return f && !r.d ? { ...r, d: f.d, src: f.src, item: r.item || f.item } : r;
	});
}

/** パーツなどの商品名簿 { cats: [{slug, label}], parts: [{item, n, d, exact, l, cat}] } */
export function loadParts() {
	return read("parts.json");
}

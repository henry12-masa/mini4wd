// 全車種名簿を組み立てる。build-catalog / check-years / find-kit が共通で使う。
//   raw.json         ウィキペディア+タミヤ公式の月別一覧から作った名簿(scripts/catalog/extract.py)
//   additions.json   元の資料にない車種を手で足す分
//   extra-cars.json  月別一覧にだけある限定車・派生シリーズ(scripts/catalog/monthly-split.mjs)
//   date-fixes.json  年月の空いた行を月別一覧で埋める分と、表記違いの重複をまとめる分(同上)
//   official-fixes.json  元の資料の年月・シャーシが公式の月別一覧と違うものを、公式に合わせて上書きする分(override)
//   web-dates.json   月別一覧に載らない限定車・完成車などの年月を、ほかの資料で埋める分(年月の空いた行だけ)。
//                    src が出典: fandom は英語版ファンWiki「Mini 4WD Wiki」の記事名、news は報道記事、shop は販売店の商品ページ、atwiki は日本語のファンWiki。
//                    remove は、公式名の行(品番)と同じ車種が表記違いで重複している行で、名簿から外す
import { readFileSync } from "node:fs";

/** グレードアップパーツの品番(15xxx)。名簿の元データに紛れたものは、パーツ名簿のほうに回す */
export const isPartItem = (item) => /^15\d{3}$/.test(item ?? "");

const read = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), "utf8"));

export function loadRoster() {
	const web = read("web-dates.json");
	const removed = new Set(web.filter((f) => f.remove).map((f) => f.n));
	const fixes = [...read("date-fixes.json"), ...read("official-fixes.json"), ...web.filter((f) => !f.remove)];
	const drop = new Set(fixes.map((f) => f.drop).filter(Boolean));
	const byName = new Map(fixes.map((f) => [f.n, f]));
	const rows = [...read("raw.json"), ...read("additions.json"), ...read("extra-cars.json")]
		.filter((r) => !(r.item && drop.has(r.item) && !byName.has(r.n)))
		.filter((r) => !isPartItem(r.item))
		.filter((r) => !(removed.has(r.n) && !r.item && !r.d));
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

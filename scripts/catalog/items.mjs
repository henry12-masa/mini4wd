// タミヤ公式の商品ページ(products/<品番>/index.html)から、月別一覧にない品番の商品名を取る。
// 今もカタログにある商品だけページがある(発売日は載っていない)。1秒に1件。
//   node scripts/catalog/items.mjs 15001-15560 18001-18110 ...
import { existsSync, readFileSync, writeFileSync } from "node:fs";
const file = new URL("../../data/catalog/tamiya-items.json", import.meta.url);
const out = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
const UA = { "User-Agent": "Mozilla/5.0 (personal fan site research; 1 req/s)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const items = process.argv.slice(2).flatMap((a) => {
	const [from, to = from] = a.split("-").map(Number);
	return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
});
for (const it of items) {
	if (it in out) continue;
	let title = null;
	try {
		const r = await fetch(`https://www.tamiya.com/japan/products/${it}/index.html`, { headers: UA });
		if (r.ok) {
			const html = new TextDecoder(/shift_jis/i.test(r.headers.get("content-type") || "") ? "shift_jis" : "utf-8").decode(await r.arrayBuffer());
			const m = html.match(/<title>([^<|]+)/);
			title = m ? m[1].replace(/^タミヤ\s*/, "").trim() : null;
		}
	} catch {}
	out[it] = title;
	writeFileSync(file, JSON.stringify(out, null, 0).replace(/,"/g, ',\n"'));
	await sleep(1000);
}
console.log("found", Object.values(out).filter(Boolean).length, "of", Object.keys(out).length);

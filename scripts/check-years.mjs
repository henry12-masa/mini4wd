// マシンデータの初出年月を、全車種名簿(data/catalog/raw.json)と照合する。
// 使い方: node scripts/check-years.mjs data/kits-*.mjs
// 名簿の年月はタミヤ公式「発売月製品一覧」(いちばん古い月)と、ウィキペディアのフルカウル・エアロの記事による。
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { coreName as core } from "../data/kit-key.mjs";

const raw = [
	...JSON.parse(readFileSync(new URL("../data/catalog/raw.json", import.meta.url), "utf8")),
	...JSON.parse(readFileSync(new URL("../data/catalog/additions.json", import.meta.url), "utf8")),
];
let bad = 0, miss = 0, ok = 0, nodate = 0;
for (const file of process.argv.slice(2)) {
	const list = (await import(pathToFileURL(resolve(file)).href)).default;
	for (const kit of list) {
		const c = core(kit.title);
		const exact = raw.filter((r) => core(r.n) === c);
		const cands = exact.length ? exact : raw.filter((r) => core(r.n).startsWith(c) || (c.startsWith(core(r.n)) && core(r.n).length >= 4));
		if (!cands.length) { miss++; console.log(`?? ${kit.slug} 「${kit.title}」${kit.released} 名簿に見つからない`); continue; }
		const dated = cands.filter((r) => r.d);
		if (!dated.length) { nodate++; console.log(`-- ${kit.slug} 「${kit.title}」${kit.released} 名簿に年月がない(別の出典を確認すること)`); continue; }
		if (dated.some((r) => r.d === kit.released)) { ok++; continue; }
		bad++; console.log(`NG ${kit.slug} 「${kit.title}」掲載${kit.released} / 名簿 ${dated.slice(0, 4).map((r) => `${r.d} ${r.n}${r.src ? ` (${r.src})` : ""}`).join(" | ")}`);
	}
}
console.log(`一致 ${ok} / 年月が違う ${bad} / 名簿に年月なし ${nodate} / 名簿で見つからない ${miss}`);

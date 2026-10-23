// マシンデータの書き方。解説本文は4つの見出しで組み立てる。
export const SECTIONS = ["どんなマシン", "走らせどころ", "ミニ四駆史の中で", "こんな人におすすめ"];

/**
 * k(slug, 車種名, 品番, 初出年月"YYYY-MM", シャーシ(空白区切り), シリーズ, 推し度, ひとこと紹介, 一言, [本文4段落], Amazon検索語?)
 * 初出年月はタミヤ公式「発売月製品一覧」由来の名簿(data/catalog/raw.json)と scripts/check-years.mjs で照合する。
 */
export const k = (slug, title, model, released, chassis, grade, tier, summary, note, parts, amazonQuery = "") => ({
	slug,
	title,
	model,
	released,
	year: Number(released.slice(0, 4)),
	scale: "1/32",
	grades: grade.split(" "),
	series: chassis.split(" "),
	tier,
	summary,
	note,
	body: parts.map((text, i) => `## ${SECTIONS[i]}\n${text}`).join("\n\n"),
	amazonQuery,
});

// 年代・シリーズ・シャーシ・推し度の定義。seed/seed.json は scripts/build-seed.mjs がここから生成する。
// 内部のタクソノミー名は grade = シリーズ、series = シャーシ(組み継ぐと共通のコードを使うため)。

// 年代は「初出の発売年」で自動判定する(from〜to を含む)
export const ERAS = [
	{ slug: "dawn", label: "誕生(1982〜1985)", short: "誕生", from: 1982, to: 1985,
		lead: "1982年7月、フォード・レインジャー4×4から始まった。悪路を走る四駆の模型で、コミカルミニ四駆やワイルドミニ四駆の時代。" },
	{ slug: "boom1", label: "第1次ブーム(1986〜1992)", short: "第1次", from: 1986, to: 1992,
		lead: "1986年のレーサーミニ四駆と『ダッシュ!四駆郎』。スピードを競う遊びが生まれ、ジャパンカップが始まった。" },
	{ slug: "boom2", label: "第2次ブーム(1993〜1999)", short: "第2次", from: 1993, to: 1999,
		lead: "スーパーミニ四駆、フルカウル、エアロ。『爆走兄弟レッツ&ゴー!!』とともに社会現象になった時代。" },
	{ slug: "pro", label: "PROと再始動(2000〜2011)", short: "PRO", from: 2000, to: 2011,
		lead: "ブームが去ったあと、2005年のミニ四駆PROで再び走り出した。大人が戻ってくる準備の時代。" },
	{ slug: "boom3", label: "REVと第3次ブーム(2012〜2019)", short: "第3次", from: 2012, to: 2019,
		lead: "30周年のミニ四駆REVとARシャーシ。かつての子どもたちが大人になって、コースに帰ってきた。" },
	{ slug: "now", label: "現行(2020〜)", short: "現行", from: 2020, to: 2100,
		lead: "VZシャーシやFM-Aシャーシ、40周年の記念モデル。新旧のマシンが同じコースを走る今のミニ四駆。" },
];

// シリーズ
export const GRADES = {
	comical: "コミカル・ミニ四駆",
	wild: "ワイルドミニ四駆",
	racer: "レーサーミニ四駆",
	truckin: "トラッキンミニ四駆",
	super: "スーパーミニ四駆",
	fullcowl: "フルカウルミニ四駆",
	real: "リアルミニ四駆",
	aero: "エアロミニ四駆",
	mighty: "マイティミニ四駆",
	pro: "ミニ四駆PRO",
	rev: "ミニ四駆REV",
	laser: "レーザーミニ四駆",
	special: "限定・特別企画",
};

// シャーシ
export const SERIES = {
	type1: "タイプ1",
	type2: "タイプ2",
	type3: "タイプ3",
	type4: "タイプ4",
	type5: "タイプ5",
	zero: "ゼロ",
	super1: "スーパー1",
	super2: "スーパーII",
	fm: "FM",
	superfm: "スーパーFM",
	fma: "FM-A",
	supertz: "スーパーTZ",
	supertzx: "スーパーTZ-X",
	superx: "スーパーX",
	superxx: "スーパーXX",
	vs: "VS",
	vz: "VZ",
	ms: "MS",
	ma: "MA",
	ar: "AR",
	other: "その他",
};

export const TIERS = {
	essential: "定番",
	recommended: "推し",
	deep: "通好み",
};

export function eraForYear(year) {
	return ERAS.find((e) => year >= e.from && year <= e.to);
}

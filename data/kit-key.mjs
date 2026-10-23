// 車種名の表記ゆれを吸収した比較用のキー(シャーシ表記・スケール・記号を外す)。
// 全車種名簿と厳選マシンを突き合わせるときに使う。
export const coreName = (t) =>
	t.normalize("NFKC").toLowerCase()
		.replace(/^1\/32\s*/, "")
		.replace(/[(（][^)）]*(シャーシ|chassis)[^)）]*[)）]/g, "")
		.replace(/jr\.?/g, "jr")
		.replace(/[\s・:：\-－―‐~〜!！?？'’"「」『』()（）\[\]【】.,、。&＆/]/g, "");

/** 名簿のシリーズ表記 = サイトのシリーズslug(そのまま使う) */
export const GRADE_OF_RAW = Object.fromEntries(
	["comical", "wild", "racer", "truckin", "super", "fullcowl", "real", "aero", "mighty", "pro", "rev", "laser", "special"].map((s) => [s, s]),
);

/** 名簿のシャーシ表記 → サイトのシャーシslug */
export const CHASSIS_OF_RAW = {
	"タイプ1": "type1", "タイプ2": "type2", "タイプ3": "type3", "タイプ4": "type4", "タイプ5": "type5", "ゼロ": "zero",
	"スーパー1": "super1", "スーパーII": "super2", "スーパー2": "super2", "FM": "fm", "スーパーFM": "superfm", "FM-A": "fma",
	"スーパーTZ": "supertz", "スーパーTZ-X": "supertzx", "スーパーX": "superx", "スーパーXX": "superxx",
	"VS": "vs", "VZ": "vz", "MS": "ms", "MA": "ma", "AR": "ar",
};

// 特集記事と「このサイトについて」。本文中の [[slug]] はマシン詳細ページへのリンク(『車種名』表記)になる。
import { games } from "./catalog.mjs";

const titles = new Map(games.map((g) => [g.slug, g.title]));
let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

function block(style, text, mentions) {
	const children = [];
	const markDefs = [];
	const re = /\[\[([a-z0-9-]+)\]\]/g;
	let last = 0;
	let m;
	while ((m = re.exec(text))) {
		if (m.index > last) children.push({ _type: "span", _key: key(), text: text.slice(last, m.index), marks: [] });
		const slug = m[1];
		if (!titles.has(slug)) throw new Error(`存在しないマシン: ${slug}`);
		mentions.add(slug);
		const linkKey = key();
		markDefs.push({ _type: "link", _key: linkKey, href: `/kits/${slug}` });
		children.push({ _type: "span", _key: key(), text: `『${titles.get(slug)}』`, marks: [linkKey] });
		last = m.index + m[0].length;
	}
	if (last < text.length) children.push({ _type: "span", _key: key(), text: text.slice(last), marks: [] });
	return { _type: "block", _key: key(), style, markDefs, children };
}

// "## 見出し" は h2、"> " は引用、それ以外は段落
function doc(source) {
	const mentions = new Set();
	const content = source
		.trim()
		.split(/\n\s*\n/)
		.map((para) => para.trim())
		.map((para) => {
			if (para.startsWith("## ")) return block("h2", para.slice(3), mentions);
			if (para.startsWith("> ")) return block("blockquote", para.slice(2), mentions);
			return block("normal", para.replace(/\n/g, ""), mentions);
		});
	return { content, mentions: [...mentions] };
}

const feature = (slug, title, excerpt, category, tags, source) => ({
	slug, title, excerpt, category, tags, ...doc(source),
});

export const features = [
	feature("first-machine", "はじめてのミニ四駆:最初の1台の選び方",
		"何を買えばいいか迷ったら。シャーシの選び方と、最初に走らせたいマシンをまとめました。",
		"guide", ["beginner", "chassis"], `
ミニ四駆は、店に並ぶマシンの種類が多く、どれを選べばいいか迷ってしまいます。ここでは、初めての人や久しぶりに戻ってきた人が「走らせてよかった」と思えるように、最初の1台の選び方をまとめました。

## まずはシャーシで選ぶ

ミニ四駆は、ボディの下にある「シャーシ」で性格が大きく変わります。今買えるマシンで迷ったら、改造の自由度が高いVZシャーシの[[neo-vqs]]や、整備しやすいMAシャーシの[[blast-arrow]]が入口になります。剛性の高いARシャーシなら[[aero-avante]]が定番です。

## 思い出の1台から始めてもいい

子どものころに走らせたマシンがあるなら、それを選ぶのがいちばんです。[[magnum-saber]]や[[cyclone-magnum]]は、今のシャーシで「プレミアム」として復刻されたものもあります。『ダッシュ!四駆郎』の世代なら[[dash1-emperor]]、さらにさかのぼれば[[hotshot-jr]]があります。

## 走らせる場所と電池

ミニ四駆は単3電池2本で走ります。家で走らせるならコースを用意するか、模型店やイベントのコースに持ち込むと、ほかのレーサーと一緒に走らせられます。

## 次の1台へ

1台走らせたら、違うシャーシのマシンを試してみてください。同じコースでも走り方がまったく違い、シャーシの個性がよくわかります。
`),
	feature("chassis-history", "シャーシの歴史:タイプ1からVZ・FM-A・MAまで",
		"ミニ四駆の進化は、シャーシの進化でもあります。節目になったマシンとともに、シャーシの移り変わりをたどります。",
		"history", ["chassis"], `
ミニ四駆は、ボディの下の「シャーシ」が時代ごとに作り直されてきました。シャーシが変わると、速さも、改造のしやすさも大きく変わります。ここでは、新しいシャーシを初めて採用したマシンをたどります。

## オフロードからオンロードへ

初期のレーサーミニ四駆は、[[hotshot-jr]]のようにタイプ1シャーシを使っていました。オフロードを意識した、重心の高いシャーシです。1988年の[[avante-jr]]で登場したタイプ2シャーシは、モーターを横に寝かせて置く配置を取り入れ、この形がのちの多くのシャーシに受け継がれていきます。

## 低く、速く

1990年の[[dash0-horizon]]で登場したゼロシャーシは、プロペラシャフトを車軸より下に通し、地上高を大きく下げました。同じ年の[[crimson-glory]]は、モーターを前に置くFMシャーシを初めて採用しています。

## 第2次ブームのシャーシ

スーパー1シャーシは[[magnum-saber]]などフルカウルミニ四駆の多くに使われ、第2次ブームを支えました。[[brocken-gigant]]でスーパーFM、[[cyclone-magnum]]でスーパーTZ、[[max-breaker]]でスーパーXが登場し、[[blazing-max]]で登場したVSシャーシは、今も愛用する人が多いシャーシになりました。

## PROとREV

2005年の[[nitro-thunder]]で登場したMSシャーシは、両側に軸の出たモーターを車体の中央に置く、まったく新しい方式でした。2012年の[[aero-avante]]で登場したARシャーシは、VS以来の完全新設計のシャフトドライブのシャーシです。さらにMAシャーシの[[blast-arrow]]、フロントモーターが21年ぶりに帰ってきたFM-Aシャーシの[[rowdy-bull]]、VSの流れをくむVZシャーシの[[neo-vqs]]と、今も新しいシャーシが生まれています。
`),
	feature("mini4wd-history", "ミニ四駆の歩み:1982年から今まで",
		"40年を超えるミニ四駆の歴史を、3度のブームとともにたどります。",
		"history", ["boom1", "boom2"], `
ミニ四駆は1982年に生まれ、3度のブームを経て今も新しいマシンが出続けています。節目になったマシンを古い順に並べてみます。

## 誕生:悪路を走る四駆の模型

最初のミニ四駆は、1982年7月の[[ford-ranger-4x4]]でした。子どもでも作れて、どこでもよく走る四駆の模型として、接着剤のいらないスナップフィットで作られました。1987年には大きなタイヤで悪路を走る[[monster-beetle-jr]]からワイルドミニ四駆も始まります。

## 第1次ブーム:レーサーミニ四駆と四駆郎

1986年、RCカーを小さくしたレーサーミニ四駆が登場します。最初に店頭に並んだのは[[hornet-jr]]、シリーズ第1弾は[[hotshot-jr]]でした。『月刊コロコロコミック』で人気を集めた[[super-dragon-jr]]などのドラゴン三兄弟、そして漫画『ダッシュ!四駆郎』の[[dash1-emperor]]が、第1次ブームを大きく盛り上げました。

## 第2次ブーム:レッツ&ゴー!!

1990年代には、漫画・アニメ『爆走兄弟レッツ&ゴー!!』とともに第2次ブームが訪れます。1994年の[[magnum-saber]]と[[sonic-saber]]から始まったフルカウルミニ四駆は社会現象になり、[[cyclone-magnum]]や[[hurricane-sonic]]が子どもたちの憧れになりました。1997年末からはエアロミニ四駆の[[max-breaker]]が続きます。

## PROと第3次ブーム

ブームが去ったあと、2005年に[[nitro-thunder]]からミニ四駆PROが始まりました。2010年には[[magnum-saber-premium]]など往年のマシンの復刻も進み、2012年、30周年の[[aero-avante]]とともに、かつての子どもたちが大人になってコースに帰ってくる第3次ブームを迎えます。

## 今のミニ四駆

今は[[neo-vqs]]などVZシャーシのマシンや、[[supra-gr]]のような実在の車のマシンも登場しています。40年以上前のマシンと最新のマシンが、同じコースを走れるのがミニ四駆の面白さです。
`),
	feature("letsgo-machines", "『爆走兄弟レッツ&ゴー!!』のマシン:マグナムとソニックの系譜",
		"第2次ブームを作ったレッツ&ゴーのマシンを、豪と烈の系譜を中心にたどります。",
		"guide", ["boom2"], `
『爆走兄弟レッツ&ゴー!!』は、兄弟が2台のマシンで競い合う物語でした。2台のマシンを主人公に据えたこの作品とともに、フルカウルミニ四駆は第2次ブームの主役になりました。

## 豪のマグナム

弟の星馬豪のマシンは、[[magnum-saber]]から始まり、[[victory-magnum]]、スーパーTZシャーシの[[cyclone-magnum]]、[[beat-magnum]]と「マグナム」の名を受け継いでいきます。

## 烈のソニック

兄の星馬烈のマシンは、[[sonic-saber]]から[[vanguard-sonic]]、[[hurricane-sonic]]、[[buster-sonic]]へと続きます。豪のマシンと対になるように、同じ時期に代替わりしていきました。

## ライバルたちのマシン

鷹羽リョウの[[tridagger-x]]、沖田カイの[[beak-spider]]、近藤ゲンの[[brocken-gigant]]、土方レイの[[ray-stinger]]。WGPでは[[diospada]]や[[berg-kaiser]]など、世界のチームのマシンも登場しました。

## MAXの時代へ

物語が『レッツ&ゴー!!MAX』に移ると、マシンはエアロミニ四駆になります。[[max-breaker]]、[[shadow-breaker-z3]]、そしてVSシャーシを初めて使った[[blazing-max]]。リョウのマシンも[[rising-trigger]]へと受け継がれました。
`),
	feature("dash-yonkuro", "『ダッシュ!四駆郎』のマシン:ダッシュ軍団をたどる",
		"第1次ブームを作ったダッシュ!四駆郎のマシンを、ダッシュ軍団を中心に紹介します。",
		"guide", ["boom1"], `
1987年に『月刊コロコロコミック』で連載が始まった『ダッシュ!四駆郎』は、ミニ四駆の第1次ブームを大きく盛り上げました。

## ダッシュ1号 エンペラー

主人公・日ノ丸四駆郎の[[dash1-emperor]]は、コロコロコミックの読者が応募したデザインコンテストのグランプリ作品から生まれました。2008年には[[dash1-emperor-ms]]としてミニ四駆PROのシャーシでもよみがえっています。

## ダッシュ軍団

[[dash2-burning-sun]]、[[dash3-shooting-star]]と、ダッシュ軍団のマシンが次々とミニ四駆になりました。1990年の[[dash0-horizon]]は、ゼロシャーシを初めて採用したマシンでもあります。

## 同じ時代のレーサーミニ四駆

同じころには、[[avante-jr]]や[[thunder-shot-jr]]、ドラゴン三兄弟の[[fire-dragon-jr]]など、RCカーをもとにしたレーサーミニ四駆も人気を集めました。
`),
];

export const aboutPage = (() => {
	const { content } = doc(`
「走り継ぐ」は、1982年の最初のミニ四駆から最新のマシンまで、いま走らせたいミニ四駆をシリーズ・シャーシ・年代で横断できるキュレーションサイトです。

## 編集方針

点数やランキングはつけません。それぞれのマシンに、どんなマシンかを伝える「ひとこと紹介」と、いま走らせたい理由を伝える「キュレーターの一言」を添えています。推し度は「定番」「推し」「通好み」の3段階です。

## 年代の区切り

年代はマシンが初めて発売された年で分けています。再販や復刻の時期ではありません。

## 全車種名簿と発売年月について

全車種名簿の車種の一覧は、日本語版ウィキペディア「ミニ四駆一覧」「フルカウルミニ四駆」「エアロミニ四駆」をもとにしています(CC BY-SA 4.0)。初出の年月は、タミヤ公式サイトの「発売月製品一覧」を優先し、載っていないものはウィキペディアの記事やミニ四駆情報サイトTEA-Leagueの歴史年表で補っています。資料によって1〜2か月ずれることがあります。年月が確かめられない車種は「年不明」にまとめています。

## シャーシとシリーズの説明について

シャーシガイドの説明は、日本語版ウィキペディア「ミニ四駆」の記事の内容をもとに、当サイトでまとめ直したものです。

## 情報について

誤りに気づいたら、ぜひ教えてください。当サイトはファンによる非公式のサイトで、株式会社タミヤとは関係ありません。「ミニ四駆」は株式会社タミヤの登録商標です。
`);
	return {
		id: "about",
		slug: "about",
		status: "published",
		data: { title: "このサイトについて", content },
	};
})();

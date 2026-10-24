// タミヤ公式「発売月製品一覧」(ミニ四駆)を1982年7月から全月取得する
import { writeFileSync, existsSync, readFileSync } from "node:fs";
const UA = { "User-Agent": "Mozilla/5.0 (personal fan site research; 1 req/s)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dec = new TextDecoder("shift_jis");
const text = (s) => s.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const out = existsSync("monthly.json") ? JSON.parse(readFileSync("monthly.json", "utf8")) : {};
for (let y = 1982; y <= 2026; y++) for (let m = 1; m <= 12; m++) {
  const key = `${y}${String(m).padStart(2, "0")}`;
  if (key < "198207" || key > "202612" || out[key]) continue;
  let all = [];
  for (let page = 1; page <= 5; page++) {
    let s = "";
    for (let i = 0; i < 4; i++) { try { const r = await fetch(`https://www.tamiya.com/japan/newitems_month/list.html?current=${key}&genre_item=30&page=${page}`, { headers: UA }); s = dec.decode(await r.arrayBuffer()); break; } catch { await sleep(3000); } }
    const t = text(s);
    const found = [...t.matchAll(/ITEM (\d{5}) (.+?) ([\d,]+)円/g)].map((x) => [x[1], x[2].trim()]);
    const fresh = found.filter(([it]) => !all.some(([a]) => a === it));
    all.push(...fresh);
    await sleep(1100);
    if (fresh.length < 20) break;
  }
  out[key] = all;
  if (all.length) console.error(key, all.length);
  writeFileSync("monthly.json", JSON.stringify(out));
}
console.log("months", Object.keys(out).length, "items", Object.values(out).reduce((n, a) => n + a.length, 0));

const url = "https://unotrips.com/meta/leh_tour_package/_next/static/chunks/0r7~nbls8q_4w.js";
const t = await fetch(url).then((r) => r.text());
console.log("check", t.includes("\u2713"), t.includes("\uD83C\uDDEE\uD83C\uDDF3"), t.includes("\u2605"));
console.log("mojibake", /\u00e2|\u00f0\u0178/.test(t));

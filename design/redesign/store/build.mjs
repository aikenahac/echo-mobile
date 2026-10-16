// Builds store.html: the approved r6 mockup with English faker people,
// plus App Store panels that clone its screens.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
const { me, people: p, bios, handleOnly, city } = data;
const skill = path.join(os.homedir(), ".claude/skills/app-designer-pro/assets");

let html = fs.readFileSync("../mockup.html", "utf8");

const swaps = [
  // full names first
  ["Neža Kovač", me.name], ["neza.kovac@gmail.com", me.email], ["neza.reads", me.user],
  ["Luka Novak", p.luka.name], ["Ana Zupan", p.ana.name], ["@anazee", `@${p.ana.user}`],
  ["Maja Horvat", p.maja.name], ["Tine Kralj", p.tine.name],
  ["Anamarija Kos", p.anamarija.name], ["@anamarija.k", `@${p.anamarija.user}`],
  ["Hana Šuštar", p.hana.name], ["@hana.reads", `@${p.hana.user}`],
  ["Anže Petek", p.anze.name], ["@anze.p", `@${p.anze.user}`],
  ["ana_bere", handleOnly],
  ["Reads in Slovene and English. Mostly Russians.", bios.ana],
  ["Bookseller in Ljubljana. Ask me about translated fiction.", bios.hana],
  ["Ljubljana", city],
];
for (const [from, to] of swaps) {
  if (!html.includes(from)) console.warn(`not found: ${from}`);
  html = html.split(from).join(to);
}
// the handle-only row has no avatar letter that matches its first letter
html = html.replace(`<div class="av">A</div><div style="flex:1;min-width:0"><div class="nm">${handleOnly}`,
  `<div class="av">${handleOnly[0].toUpperCase()}</div><div style="flex:1;min-width:0"><div class="nm">${handleOnly}`);

// assets: the mockup lives one folder up
html = html.replaceAll('../covers/', '../../covers/')
  .replace('href="kit/device.css"', `href="file://${skill}/device.css"`)
  .replace('src="kit/device.js"', `src="file://${skill}/device.js"`)
  .replace("<title>Echo — mockups</title>", "<title>Echo store set</title>");

const panels = [
  ["01-log-the-page", "library", "Log the page<br>you stopped on."],
  ["02-friends", "friends", "See what friends<br>are reading."],
  ["03-rate-review", "detail-james", "Say what you<br>thought of it."],
  ["04-search", "search", "Find any book<br>in seconds."],
  ["05-collections", "collection-detail", "Shelves you name<br>yourself."],
  ["06-profile", "profile", "A whole year of<br>reading, counted."],
  ["07-dark", "library-dark", "As good at<br>midnight."],
];
const css = `
<style>
  .panel[data-store="appstore"] { background: var(--field); color: var(--ink); }
  .panel[data-store="appstore"][data-ground="ink"] { background: #170B11; color: var(--field); }
  .panel[data-store="appstore"] > h3 { position:absolute; z-index:2; left:0; right:0; top:62px; margin:0; padding:0 30px; text-align:left;
    font-family: var(--disp); font-stretch: 62%; font-weight: 900; font-size: 58px; line-height: .95; letter-spacing: -.8px; word-spacing: .14em; }
  .panel[data-store="appstore"] > .dv { position:absolute; left:0; right:0; top:226px; display:flex; justify-content:center; }
  .panel[data-store="appstore"] .device { --device-scale: 1; box-shadow: 0 0 0 var(--rim) var(--frame), inset 0 0 0 1px rgba(255,255,255,.07), 0 40px 80px -30px rgba(70,8,36,.65); }

  .panel[data-store="play"] { background: var(--field); color: var(--ink); font-family: var(--sf); }
  .panel[data-store="play"][data-ground="ink"] { background: #170B11; color: var(--field); }
  .panel[data-store="play"] > h3 { position:absolute; z-index:2; left:0; right:0; top:34px; margin:0; padding:0 20px;
    font-family: var(--disp); font-stretch: 62%; font-weight: 900; font-size: 40px; line-height: .95; letter-spacing: -.5px; word-spacing: .14em; }
  .panel[data-store="play"] > .pw { zoom:1; display:block; height:auto; align-self:auto; padding:0; background:none; position:absolute; left:19px; width:322px; top:128px; bottom:0; overflow:hidden;
    border-radius: 26px 26px 0 0; box-shadow: 0 0 0 1px rgba(23,11,17,.18), 0 30px 60px -20px rgba(70,8,36,.6); }
  .panel[data-store="play"][data-ground="ink"] > .pw { box-shadow: 0 0 0 1px rgba(255,232,241,.16), 0 30px 60px -20px rgba(0,0,0,.8); }
  .panel[data-store="play"] > .pw::before, .panel[data-store="play"] > .pw::after { display:none; }
  .panel[data-store="play"] > .pw > .screen { zoom: .8; position: relative; top: -58px; margin: 0; }
  .panel[data-store="feature"] { background: var(--field); color: var(--ink); }
  .panel[data-store="feature"] > .fg { position:absolute; inset:0; display:flex; align-items:center; gap:28px; padding:0 0 0 72px; }
  .panel[data-store="feature"] svg { width:128px; height:128px; flex:none; }
  .panel[data-store="feature"] b { display:block; font-family: var(--disp); font-stretch:62%; font-weight:900; font-size:84px; line-height:.9; letter-spacing:-1px; }
  .panel[data-store="feature"] span { display:block; margin-top:10px; font-family: var(--disp); font-stretch:62%; font-weight:800; font-size:26px; letter-spacing:.2px; word-spacing:.14em; }

  .panel[data-store="ipad"] { width: 688px; height: 917px; background: var(--field); color: var(--ink); font-family: var(--sf); }
  .panel[data-store="ipad"][data-ground="ink"] { background: #170B11; color: var(--field); }
  .panel[data-store="ipad"] > h3 { position:absolute; z-index:2; left:0; right:0; top:84px; margin:0; padding:0 64px;
    font-family: var(--disp); font-stretch: 62%; font-weight: 900; font-size: 78px; line-height: .95; letter-spacing: -1px; white-space: nowrap; word-spacing: .14em; }
  .panel[data-store="ipad"] > .dv { position:absolute; left:0; right:0; top:340px; display:flex; justify-content:center; }
  .panel[data-store="ipad"] .device { --device-scale: 1.4; box-shadow: 0 0 0 var(--rim) var(--frame), inset 0 0 0 1px rgba(255,255,255,.07), 0 40px 80px -30px rgba(70,8,36,.65); }
</style>`;
const body = panels.map(([name, clone, cap]) => `
<section class="panel" data-store="appstore" data-name="${name}"${name.endsWith("dark") ? ' data-ground="ink"' : ""}>
  <h3>${cap}</h3>
  <div class="dv"><div class="device"><section class="screen" data-clone="${clone}"></section></div></div>
</section>`).join("\n");

const play = panels.map(([name, clone, cap]) => `
<section class="panel" data-store="play" data-name="${name}"${name.endsWith("dark") ? ' data-ground="ink"' : ""}>
  <h3>${cap}</h3>
  <div class="pw device"><section class="screen" data-clone="${clone}"></section></div>
</section>`).join("\n");
const feature = `
<section class="panel" data-store="feature" data-name="graphic"><div class="fg">
  <svg viewBox="0 0 344 344"><path d="M178 0h70v226l-35-30-35 30z" fill="#B3165A"/><path d="M124 0h70v250l-35-30-35 30z" fill="#170B11"/></svg>
  <div><b>Echo</b><span>Every page, counted.</span></div></div></section>`;
const ipad = panels.map(([name, clone, cap]) => `
<section class="panel" data-store="ipad" data-name="ipad-${name}"${name.endsWith("dark") ? ' data-ground="ink"' : ""}>
  <h3>${cap}</h3>
  <div class="dv"><div class="device"><section class="screen" data-clone="${clone}"></section></div></div>
</section>`).join("\n");
const all = body + play + feature + ipad;
html = html.replace("</head>", css + "\n</head>").replace('<script src="file://', `<div style="display:flex;gap:24px;padding:24px;flex-wrap:wrap">${all}\n</div>\n<script src="file://`);
fs.writeFileSync("store.html", html);
console.log("store.html written");

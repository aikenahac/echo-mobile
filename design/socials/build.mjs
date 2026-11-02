// Builds socials.html: the store set's app screens (so the phones clone the
// approved design) plus the Instagram stages. Run from design/socials:
//   node build.mjs && node ~/.claude/skills/app-designer-pro/scripts/shoot.mjs socials.html --out shots/r1 --only post-1-log,post-2-echo,post-3-finished,story
import fs from "node:fs";

let html = fs.readFileSync("../redesign/store/store.html", "utf8");

// drop the store panels, keep the screens they clone from
const start = html.indexOf('<div style="display:flex;gap:24px;padding:24px;flex-wrap:wrap">');
const end = html.indexOf('<script src="file://', start);
html = html.slice(0, start) + "%STAGES%\n" + html.slice(end);
html = html.replaceAll("../../covers/", "../covers/").replace("<title>Echo store set</title>", "<title>Echo socials</title>");

const PIRANESI = "../covers/9781635575637.jpg";
const mark = (s = "") => `<svg class="mark" viewBox="0 0 344 344" ${s}><path d="M178 0h70v226l-35-30-35 30z" fill="#B3165A"/><path d="M124 0h70v250l-35-30-35 30z" fill="#170B11"/></svg>`;
const star = `<svg viewBox="0 0 24 24"><use href="#star"/></svg>`;

const css = `
<style>
  .stage { --paper:#FBF7F8; --field:#FF6BA8; --ink:#170B11; --pink-ink:#B3165A; --ink-2:#6B5560;
           background: var(--field); color: var(--ink); font-family: var(--sf); }
  .stage[data-ground="paper"] { background: var(--paper); }
  .stage > .brand { position:absolute; left:88px; top:46px; display:flex; align-items:center; gap:6px; }
  .stage > .brand .mark { width:30px; height:30px; margin-left:-6px; }
  .stage > .brand b { font-family: var(--disp); font-stretch:62%; font-weight:900; font-size:26px; line-height:1; letter-spacing:-.3px; }
  .stage > h2 { position:absolute; left:88px; top:92px; margin:0; font-family: var(--disp); font-stretch:62%; font-weight:900;
                font-size:44px; line-height:.92; letter-spacing:-.6px; word-spacing:.12em; }
  .stage > p { position:absolute; margin:0; font-size:17px; line-height:22px; letter-spacing:-.2px; }

  /* stage-only class names (s-*) so nothing leaks into the cloned app screens */
  .s-bk { position:absolute; aspect-ratio:2/3; border-radius:2px 4px 4px 2px; overflow:hidden;
          box-shadow: 0 1px 1px rgba(23,11,17,.16), 0 26px 34px -16px rgba(70,8,36,.62); }
  .s-bk img { display:block; width:100%; height:100%; object-fit:cover; }
  .s-bk::after { content:""; position:absolute; inset:0; background: linear-gradient(90deg, rgba(0,0,0,.16) 0, rgba(255,255,255,.16) 2.5%, rgba(0,0,0,.06) 5%, transparent 9%); }
  .s-stamp { position:absolute; z-index:2; border:5px solid var(--ink); outline:4px solid var(--paper); background:var(--paper); color:var(--ink);
             font-family: var(--disp); font-stretch:62%; font-weight:900; font-size:46px; line-height:1; letter-spacing:1px;
             padding:7px 14px 4px; transform: rotate(-7deg); white-space:nowrap; }
  .s-num { position:absolute; font-family: var(--disp); font-stretch:62%; font-weight:900; line-height:.8; letter-spacing:-.03em;
           font-variant-numeric: lining-nums tabular-nums; text-shadow: .035em .035em 0 var(--pink-ink); }
  .s-of { position:absolute; font-size:19px; font-weight:600; letter-spacing:-.3px; }
  .s-of span { display:block; font-weight:400; color:rgba(23,11,17,.74); font-size:16px; margin-top:2px; }
  .s-stars { position:absolute; display:flex; gap:6px; }
  .s-stars svg { width:30px; height:30px; fill: var(--ink); }
  .s-pill { position:absolute; display:flex; align-items:center; gap:8px; height:40px; padding:0 18px; border-radius:20px;
            background: var(--ink); color: var(--field); font-size:16px; font-weight:600; letter-spacing:-.2px; white-space:nowrap; }
  .s-pill svg { width:18px; height:18px; stroke: currentColor; stroke-width:2.2; fill:none; stroke-linecap:round; }
  .s-free { position:absolute; font-size:15px; font-weight:700; letter-spacing:-.2px; white-space:nowrap; }
  .s-dvw { position:absolute; display:flex; justify-content:center; }
  .s-dvw > .device { box-shadow: 0 0 0 var(--rim) var(--frame), inset 0 0 0 1px rgba(255,255,255,.07), 0 40px 70px -24px rgba(70,8,36,.7); }

  /* 1 · log the page */
  [data-name="post-1-log"] .s-bk { left:92px; top:214px; width:150px; transform: rotate(-3deg); }
  [data-name="post-1-log"] .s-num { left:260px; top:240px; font-size:158px; }
  [data-name="post-1-log"] .s-of { left:264px; top:390px; }
  [data-name="post-1-log"] .s-pill { left:264px; top:456px; }

  /* 2 · the ad */
  [data-name="post-2-echo"] > h2 { font-size:57px; }
  [data-name="post-2-echo"] > p { left:88px; top:284px; width:180px; }
  [data-name="post-2-echo"] .s-free { left:88px; top:436px; font-size:14px; }
  [data-name="post-2-echo"] .s-dvw { left:286px; top:88px; }
  [data-name="post-2-echo"] .device { --device-scale:.45; }

  /* 3 · finished */
  [data-name="post-3-finished"] .s-bk { left:204px; top:194px; width:148px; transform: rotate(2deg); }
  [data-name="post-3-finished"] .s-stamp { left:168px; top:318px; }
  [data-name="post-3-finished"] .s-stars { left:88px; top:440px; }
  [data-name="post-3-finished"] > p { left:88px; top:480px; color: var(--ink-2); font-size:16px; }
  [data-name="post-3-finished"] .s-drain { position:absolute; left:0; right:0; bottom:0; height:12px; background: var(--field); }

  /* story (540 x 960; Instagram covers roughly the top 125 and bottom 170) */
  [data-name="story"] > .brand { top:132px; left:40px; }
  [data-name="story"] > h2 { top:176px; left:40px; font-size:72px; }
  [data-name="story"] > p { left:40px; top:322px; width:420px; font-size:18px; line-height:23px; }
  [data-name="story"] .s-free { left:40px; top:382px; font-size:16px; }
  [data-name="story"] .s-dvw { left:40px; top:430px; }
  [data-name="story"] .device { --device-scale:.62; }
  [data-name="story"] .s-side { position:absolute; left:328px; top:500px; width:150px; transform: rotate(6deg); z-index:3; }
  [data-name="story"] .s-side .s-bk { position:relative; width:150px; }
  [data-name="story"] .s-side .s-stamp { left:-14px; top:150px; font-size:38px; }
  [data-name="story"] .s-stars { left:326px; top:744px; }
  [data-name="story"] .s-stars svg { width:26px; height:26px; }
</style>`;

const stages = `
<div style="display:flex;gap:24px;padding:24px;flex-wrap:wrap;align-items:flex-start">
<section class="stage" data-size="1:1" data-name="post-1-log">
  <h2>Log the page<br>you stopped on.</h2>
  <div class="s-bk"><img src="${PIRANESI}"></div>
  <div class="s-num">168</div>
  <div class="s-of">of 245 pages<span>Piranesi · 77 to go</span></div>
  <div class="s-pill"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>Next page</div>
</section>

<section class="stage" data-size="1:1" data-name="post-2-echo">
  <div class="brand">${mark()}<b>Echo</b></div>
  <h2>Every<br>page,<br>counted.</h2>
  <p>A reading tracker. Log your page, see what friends are reading.</p>
  <div class="s-free">Free on iPhone and Android</div>
  <div class="s-dvw"><div class="device"><section class="screen" data-clone="library"></section></div></div>
</section>

<section class="stage" data-size="1:1" data-name="post-3-finished" data-ground="paper">
  <h2>The last page<br>gets a stamp.</h2>
  <div class="s-bk"><img src="${PIRANESI}"></div>
  <div class="s-stamp">FINISHED</div>
  <div class="s-stars">${star.repeat(5)}</div>
  <p>Rate it, then see what your friends thought.</p>
  <div class="s-drain"></div>
</section>

<section class="stage" data-size="9:16" data-name="story">
  <div class="brand">${mark()}<b>Echo</b></div>
  <h2>Every page,<br>counted.</h2>
  <p>Log where you stopped, rate what you finish and see what friends are reading.</p>
  <div class="s-free">Free on iPhone and Android</div>
  <div class="s-dvw"><div class="device"><section class="screen" data-clone="library"></section></div></div>
  <div class="s-side"><div class="s-bk"><img src="../covers/9780385550369.jpg"></div><div class="s-stamp">FINISHED</div></div>
  <div class="s-stars">${star.repeat(5)}</div>
</div>`;

html = html.replace("</head>", css + "\n</head>").replace("%STAGES%", stages);
fs.writeFileSync("socials.html", html);
console.log("socials.html written");

import { ReportData } from './types';

import * as fs from 'fs';
import * as path from 'path';

function fontCss(embed: boolean): string {
  if (!embed) return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;
  const dir = path.join(__dirname, '..', 'fonts');
  const face = (family: string, file: string, weight: number) => {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) return '';
    const b64 = fs.readFileSync(p).toString('base64');
    return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
  };
  return '<style>' + [face('IBM Plex Sans', 'sans-400.woff2', 400), face('IBM Plex Sans', 'sans-500.woff2', 500), face('IBM Plex Sans', 'sans-600.woff2', 600), face('IBM Plex Mono', 'mono-400.woff2', 400), face('IBM Plex Mono', 'mono-500.woff2', 500)].join('') + '</style>';
}

export function renderHtml(data: ReportData): string {
  const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
  const themeAttr = (data.options.theme === 'auto' ? '' : ` data-theme="${data.options.theme}"`) + ` data-palette="${data.options.palette}"`;
  return `<!doctype html>
<html lang="en"${themeAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(data.title)}</title>
${fontCss(data.options.embedFonts)}
<style>${CSS}${data.options.accent ? `:root{--accent:${data.options.accent}!important}` : ''}${data.options.customCss}</style>
</head>
<body>
<div id="app"></div>
<script id="rl-data" type="application/json">${json}</script>
<script>${JS}</script>
</body>
</html>`;
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

const CSS = String.raw`
/* ---------- palettes: each defines light + dark ---------- */
:root{
  --radius:6px; --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --sans:'IBM Plex Sans',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --pass:#1FA971; --fail:#E5405E; --skip:#8B95A5; --flaky:#E39B12;
  --pass-bg:#DDF5EA; --fail-bg:#FDE3E8; --skip-bg:#EDF0F4; --flaky-bg:#FBEFD2; --flaky-ink:#8A5A00;
  /* lab (default): cool paper + violet */
  --bg:#F3F4F9; --surface:#FFFFFF; --surface-2:#EBEDF5; --line:#DADEEA; --ink:#141A2E; --ink-2:#4B5370; --ink-3:#7E869E; --accent:#5B4DE0; --accent-ink:#fff;
}
:root[data-palette=ocean]{ --bg:#F1F6F7; --surface:#FFFFFF; --surface-2:#E6EFF1; --line:#D3E0E4; --ink:#0F2430; --ink-2:#3F5A66; --ink-3:#6F8894; --accent:#0E8FA6 }
:root[data-palette=ember]{ --bg:#F8F4EF; --surface:#FFFFFF; --surface-2:#F0E9E0; --line:#E2D8CB; --ink:#231C16; --ink-2:#5C5148; --ink-3:#8D8177; --accent:#E0521B }
:root[data-palette=mono]{ --bg:#F4F4F4; --surface:#FFFFFF; --surface-2:#EBEBEB; --line:#DCDCDC; --ink:#161616; --ink-2:#4F4F4F; --ink-3:#848484; --accent:#161616 }

/* dark tokens per palette */
:root[data-theme=dark], :root:not([data-theme=light]) { color-scheme:light }
@media (prefers-color-scheme:dark){ :root:not([data-theme=light]){ --_dark:1 } }
:root[data-theme=dark]{ --_dark:1 }
@media (prefers-color-scheme:dark){
  :root:not([data-theme=light]){ --bg:#0B0F1D; --surface:#121729; --surface-2:#1A2036; --line:#252C45; --ink:#E9ECF7; --ink-2:#AAB1CB; --ink-3:#737B99; --accent:#8B7CFF; --accent-ink:#0B0F1D; --pass:#3DD68C; --fail:#FF6B85; --flaky:#F5B62E; --skip:#5F6882; --pass-bg:#10301F; --fail-bg:#3A1A23; --skip-bg:#1E2436; --flaky-bg:#3A2B0B; --flaky-ink:#F5B62E; color-scheme:dark }
  :root:not([data-theme=light])[data-palette=ocean]{ --bg:#07161B; --surface:#0D2027; --surface-2:#132A33; --line:#1E3942; --ink:#E4F1F4; --ink-2:#9DB8C0; --ink-3:#6A8A93; --accent:#2FC4DA }
  :root:not([data-theme=light])[data-palette=ember]{ --bg:#15100C; --surface:#1E1712; --surface-2:#292019; --line:#3A2E24; --ink:#F3EBE2; --ink-2:#C2B4A5; --ink-3:#8C7E70; --accent:#FF7A38 }
  :root:not([data-theme=light])[data-palette=mono]{ --bg:#0E0E0E; --surface:#161616; --surface-2:#1F1F1F; --line:#2C2C2C; --ink:#F2F2F2; --ink-2:#B3B3B3; --ink-3:#7A7A7A; --accent:#F2F2F2; --accent-ink:#0E0E0E }
}
:root[data-theme=dark]{ --bg:#0B0F1D; --surface:#121729; --surface-2:#1A2036; --line:#252C45; --ink:#E9ECF7; --ink-2:#AAB1CB; --ink-3:#737B99; --accent:#8B7CFF; --accent-ink:#0B0F1D; --pass:#3DD68C; --fail:#FF6B85; --flaky:#F5B62E; --skip:#5F6882; --pass-bg:#10301F; --fail-bg:#3A1A23; --skip-bg:#1E2436; --flaky-bg:#3A2B0B; --flaky-ink:#F5B62E; color-scheme:dark }
:root[data-theme=dark][data-palette=ocean]{ --bg:#07161B; --surface:#0D2027; --surface-2:#132A33; --line:#1E3942; --ink:#E4F1F4; --ink-2:#9DB8C0; --ink-3:#6A8A93; --accent:#2FC4DA }
:root[data-theme=dark][data-palette=ember]{ --bg:#15100C; --surface:#1E1712; --surface-2:#292019; --line:#3A2E24; --ink:#F3EBE2; --ink-2:#C2B4A5; --ink-3:#8C7E70; --accent:#FF7A38 }
:root[data-theme=dark][data-palette=mono]{ --bg:#0E0E0E; --surface:#161616; --surface-2:#1F1F1F; --line:#2C2C2C; --ink:#F2F2F2; --ink-2:#B3B3B3; --ink-3:#7A7A7A; --accent:#F2F2F2; --accent-ink:#0E0E0E }
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 var(--sans)}
button,input,select{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0;padding:0}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* top nav */
.nav{position:sticky;top:0;z-index:5;background:var(--surface);border-bottom:1px solid var(--line);padding:0 28px;display:flex;gap:2px;align-items:center}
.nav button{padding:12px 14px;font-size:13px;color:var(--ink-2);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;gap:7px;align-items:center}
.nav button:hover{color:var(--ink)} .nav button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--accent)}
.nav .cnt{font:11px var(--mono);padding:1px 6px;border-radius:999px;background:var(--surface-2);color:var(--ink-3)}
.nav .cnt.bad{background:var(--fail-bg);color:var(--fail)}
.nav .mini-verdict{margin-left:auto;font-size:12px;color:var(--ink-3);display:none}
.view{display:none} .view.on{display:block}
.view-pad{max-width:1400px;margin:0 auto;padding:22px 28px 40px}
.view-pad .grid{margin-top:0}
.main{margin-top:16px}
.list{top:64px;max-height:calc(100vh - 76px)}
/* api table */
.apitbl{width:100%;border-collapse:collapse;font-size:13px}
.apitbl th{text-align:left;font-weight:600;color:var(--ink-2);padding:8px 10px;border-bottom:1px solid var(--line);font-size:12px;position:sticky;top:44px;background:var(--surface)}
.apitbl td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:middle}
.apitbl tr:hover td{background:var(--surface-2)} .apitbl tr{cursor:pointer}
.apitbl .u{font:12px var(--mono);max-width:520px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.apitbl .t{color:var(--ink-3);font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.api-stats{display:flex;gap:16px;margin-bottom:14px;font-size:13px;color:var(--ink-2)} .api-stats b{color:var(--ink);font-variant-numeric:tabular-nums}
.api-stats .bad b{color:var(--fail)}
@media (max-width:700px){.nav{overflow-x:auto;padding:0 12px} .nav button{padding:10px 10px;white-space:nowrap}}
@media print{.nav{display:none} .view{display:block!important}}

/* verdict row with donut */
.vrow{display:flex;align-items:center;gap:32px;flex-wrap:wrap}
.vrow .vleft{flex:1;min-width:280px}
.vrow .donut{gap:14px} .vrow .donut svg{width:96px;height:96px}
.vrow .donut .c{font-size:17px} .vrow .donut .cl{font-size:8px}
.vrow .donut .legend{font-size:12px;gap:2px 8px}
/* breakdown tabs */
.bk-tabs{display:flex;gap:2px;flex-wrap:wrap;margin:-4px 0 14px}
.bk-tabs button{padding:5px 10px;font-size:12px;border-radius:999px;color:var(--ink-2)}
.bk-tabs button:hover{background:var(--surface-2)} .bk-tabs button[aria-selected=true]{background:var(--ink);color:var(--bg)}
.dim .row{grid-template-columns:110px 1fr 56px}
.attn .proj{font:10px var(--mono);color:var(--ink-3);background:var(--surface-2);padding:1px 5px;border-radius:3px;margin-left:6px}
.card.tight{padding:14px 20px}

/* outcome stripe above header */
.stripe{display:flex;height:4px} .stripe i{display:block;height:100%}
.hdr{border-top:0}
.hdr .ctl{display:flex;gap:6px;align-items:center}
.hdr select.pal{padding:6px 8px;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);font-size:12px;color:var(--ink-2)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border:1px solid var(--line);border-radius:var(--radius);font-size:12px;color:var(--ink-2);background:var(--surface)}
.btn:hover{border-color:var(--accent);color:var(--ink)} .btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn.done{border-color:var(--pass);color:var(--pass)}
/* verdict */
.verdict .big{font-variant-numeric:tabular-nums;font-size:40px;letter-spacing:-.03em}
.verdict .big small{font-size:18px;font-weight:500;color:var(--ink-3);letter-spacing:0;margin-left:2px}
.pills{margin-top:18px}
.pill[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)} .pill[aria-pressed=true] .n{color:var(--bg)}
/* cards: status rail on left */
.card{position:relative;box-shadow:none}
.card.warn-rail::before,.card.fail-rail::before{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:0 2px 2px 0;background:var(--fail)}
.card.warn-rail::before{background:var(--flaky)}
.card h2{letter-spacing:.01em}
.badge.flaky{color:var(--flaky-ink)}
/* donut with gaps */
.donut svg circle{stroke-linecap:butt}
/* failure clusters */
.clu{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.clu li{border:1px solid var(--line);border-left:3px solid var(--fail);border-radius:var(--radius);padding:8px 10px}
.clu .msg{font:12px/1.45 var(--mono);white-space:pre-wrap;word-break:break-word;color:var(--ink);max-height:3em;overflow:hidden}
.clu .who{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.clu .who button{font-size:11px;padding:2px 7px;border-radius:999px;background:var(--fail-bg);color:var(--fail)} .clu .who button:hover{outline:1px solid var(--fail)}
.clu .n{font-size:12px;color:var(--ink-3);margin-left:auto}
.clu .top{display:flex;gap:8px;align-items:baseline}
/* detail actions */
.detail .actions{display:flex;gap:6px;margin-left:auto}
.detail .titlebar{display:flex;align-items:flex-start;gap:10px}
.kbd{font:11px var(--mono);border:1px solid var(--line);border-radius:3px;padding:0 4px;color:var(--ink-3)}
.hint-kbd{font-size:11px;color:var(--ink-3);padding:8px 12px;border-top:1px solid var(--line)}
/* toast */
.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:8px 14px;border-radius:999px;font-size:13px;z-index:20}
/* print */
@media print{ .hdr .ctl,.tools,.strip-cap,.hint-kbd,.detail .actions{display:none} .main{grid-template-columns:1fr} .list{position:static;max-height:none;border:0} .items{overflow:visible} body{background:#fff} .card{break-inside:avoid} }

/* ---------- header ---------- */
.hdr{display:flex;align-items:center;gap:16px;padding:14px 28px;border-bottom:1px solid var(--line);background:var(--surface)}
.hdr img{height:28px}
.hdr h1{font-size:16px;font-weight:600;margin:0}
.hdr .hmeta{display:flex;gap:6px;flex-wrap:wrap;margin-left:8px}
.chip{font:12px/1 var(--mono);padding:5px 8px;border-radius:4px;background:var(--surface-2);color:var(--ink-2)}
.chip b{color:var(--ink);font-weight:500}
.hdr .spacer{flex:1}
.hdr .when{color:var(--ink-3);font-size:12px}
.tbtn{width:32px;height:32px;border-radius:var(--radius);border:1px solid var(--line);display:grid;place-items:center;color:var(--ink-2)}
.tbtn:hover{background:var(--surface-2)}

/* ---------- summary ---------- */
.sum{padding:28px 28px 20px;max-width:1400px;margin:0 auto}
.verdict{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.verdict .big{font-size:34px;font-weight:600;letter-spacing:-.02em;line-height:1.1}
.verdict .big.ok{color:var(--pass)} .verdict .big.bad{color:var(--fail)}
.verdict .sub{font-size:15px;color:var(--ink-2)}
.pills{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font-size:13px;color:var(--ink-2)}
.pill .n{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums}
.pill .dot{width:8px;height:8px;border-radius:50%}
.pill[aria-pressed=true]{border-color:var(--ink);color:var(--ink)}
.pill:hover{background:var(--surface-2)}

/* run strip: the hero */
.strip{margin-top:22px;display:grid;grid-template-columns:repeat(auto-fill,14px);gap:3px}
.cell{width:14px;height:20px;border-radius:3px;background:var(--skip);transition:transform .08s}
.cell.passed{background:var(--pass)} .cell.failed,.cell.timedOut,.cell.interrupted{background:var(--fail)} .cell.flaky{background:var(--flaky)}
.cell:hover{transform:scaleY(1.25)} .cell.dim{opacity:.18}
.strip-cap{margin-top:8px;font-size:12px;color:var(--ink-3)}

/* widgets row */
.widgets{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-top:22px}
@media (max-width:900px){.widgets{grid-template-columns:1fr}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:18px 20px}
.card h2{font-size:11.5px;font-weight:600;margin:0 0 14px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
.tl{width:100%;height:auto;display:block}
.tl rect.r{rx:2}
.tl .lane{fill:var(--surface-2)}
.tl text{font:11px var(--mono);fill:var(--ink-3)}
.slow{list-style:none;margin:0;padding:0}
.slow li{display:flex;gap:10px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}
.slow li:first-child{border-top:0}
.slow .bar{height:6px;border-radius:3px;background:var(--accent);opacity:.7}
.slow .t{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.slow .d{font:12px var(--mono);color:var(--ink-3)}
.slow button{text-align:left;width:100%;display:flex;gap:10px;align-items:center}
.slow button:hover .t{color:var(--accent)}
.proj{display:flex;flex-direction:column;gap:8px}
.proj .row{display:flex;align-items:center;gap:10px;font-size:13px}
.proj .name{width:110px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.proj .bar{flex:1;height:10px;display:flex;border-radius:3px;overflow:hidden;background:var(--skip-bg)}
.proj .bar i{display:block;height:100%}
.section{margin-top:16px}
.section .body{color:var(--ink-2)}

/* ---------- main split ---------- */
.main{display:grid;grid-template-columns:380px 1fr;max-width:1400px;margin:8px auto 40px;padding:0 28px;gap:16px;min-height:60vh}
@media (max-width:900px){.main{grid-template-columns:1fr}}
.list{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);display:flex;flex-direction:column;overflow:hidden;position:sticky;top:12px;max-height:calc(100vh - 24px)}
.tools{padding:10px;border-bottom:1px solid var(--line);display:flex;gap:8px;flex-wrap:wrap}
.tools input{flex:1;min-width:120px;padding:7px 10px;border:1px solid var(--line);border-radius:var(--radius);background:var(--bg)}
.tools select{padding:7px 8px;border:1px solid var(--line);border-radius:var(--radius);background:var(--bg)}
.items{overflow:auto;flex:1}
.file{padding:10px 12px 4px;font:12px var(--mono);color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:sticky;top:0;background:var(--surface)}
.item{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:8px 12px;border-left:3px solid transparent}
.item:hover{background:var(--surface-2)}
.item[aria-current=true]{background:var(--surface-2);border-left-color:var(--accent)}
.item .st{width:10px;height:10px;border-radius:50%;margin-top:5px;flex:none}
.st.passed{background:var(--pass)} .st.failed,.st.timedOut,.st.interrupted{background:var(--fail)} .st.skipped{background:var(--skip)} .st.flaky{background:var(--flaky)}
.item .tt{flex:1;min-width:0}
.item .tt .p{font-size:11px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item .tt .n{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.item .d{font:11px var(--mono);color:var(--ink-3);margin-top:3px}
.empty{padding:40px 20px;text-align:center;color:var(--ink-3)}

/* ---------- detail ---------- */
.detail{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px;min-width:0}
.crumb{font-size:12px;color:var(--ink-3)} .crumb span+span::before{content:" / ";color:var(--line)}
.detail h3{font-size:20px;font-weight:600;margin:6px 0 10px;letter-spacing:-.01em}
.badges{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.badge{font-size:12px;padding:3px 9px;border-radius:999px;font-weight:500}
.badge.passed{background:var(--pass-bg);color:var(--pass)} .badge.failed,.badge.timedOut,.badge.interrupted{background:var(--fail-bg);color:var(--fail)}
.badge.skipped{background:var(--skip-bg);color:var(--ink-2)} .badge.flaky{background:var(--flaky-bg);color:#9A6A00}
.badge.tag{background:var(--surface-2);color:var(--ink-2);font-family:var(--mono)}
.loc{font:12px var(--mono);color:var(--ink-3)}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:16px}
.tab{padding:8px 12px;font-size:13px;color:var(--ink-2);border-bottom:2px solid transparent;margin-bottom:-1px}
.tab[aria-selected=true]{color:var(--ink);border-bottom-color:var(--accent)}
.detail h4{font-size:13px;font-weight:600;color:var(--ink-2);margin:20px 0 8px}
.err{background:var(--fail-bg);border-left:3px solid var(--fail);padding:12px 14px;border-radius:0 var(--radius) var(--radius) 0;font:12.5px/1.55 var(--mono);white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.err+.err{margin-top:10px}
.err details{margin-top:8px} .err summary{cursor:pointer;color:var(--ink-2);font-family:var(--sans);font-size:12px}
.err .stack{color:var(--ink-2);margin-top:6px}
.steps{list-style:none;margin:0;padding:0}
.steps ul{list-style:none;margin:0;padding-left:18px;border-left:1px solid var(--line)}
.step{display:flex;gap:8px;align-items:center;padding:4px 6px;border-radius:4px;font-size:13px}
.step:hover{background:var(--surface-2)}
.step .tw{width:14px;color:var(--ink-3);font-size:10px;text-align:center;flex:none}
.step .cat{font:11px var(--mono);color:var(--ink-3);background:var(--surface-2);padding:1px 5px;border-radius:3px}
.step .t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.step .d{font:11px var(--mono);color:var(--ink-3)}
.step.bad{color:var(--fail)} .step.bad .t{font-weight:500}
.step .e{font:12px var(--mono);color:var(--fail);padding:2px 0 6px 28px;white-space:pre-wrap}
li.collapsed>ul{display:none}
.att{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.att figure{margin:0;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--surface-2)}
.att img{width:100%;display:block;aspect-ratio:16/10;object-fit:cover;cursor:zoom-in}
.att figcaption{font:11px var(--mono);padding:6px 8px;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.att .file{padding:12px;position:static;background:none}
.att .file a{font:12px var(--mono)}
.txt{background:var(--surface-2);padding:10px 12px;border-radius:var(--radius);font:12px/1.5 var(--mono);white-space:pre-wrap;max-height:260px;overflow:auto}
.lb{position:fixed;inset:0;background:rgba(0,0,0,.85);display:grid;place-items:center;z-index:10;cursor:zoom-out}
.lb img{max-width:95vw;max-height:95vh;border-radius:4px}
.kv{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:13px}
.kv dt{color:var(--ink-3)} .kv dd{margin:0}

/* overview grid */
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:22px;align-items:start}
.grid>.card{grid-column:span 4;min-width:0}
.grid>.card.w6{grid-column:span 6} .grid>.card.w8{grid-column:span 8} .grid>.card.w12{grid-column:span 12}
@media (max-width:1100px){.grid>.card,.grid>.card.w6,.grid>.card.w8{grid-column:span 6}}
@media (max-width:760px){.grid>.card,.grid>.card.w6,.grid>.card.w8,.grid>.card.w12{grid-column:span 12}}
.card h2 .hint{font-weight:400;color:var(--ink-3);margin-left:8px;text-transform:none;letter-spacing:0;font-size:12px}
/* donut */
.donut{display:flex;align-items:center;gap:18px}
.donut svg{width:132px;height:132px;flex:none}
.donut .legend{display:grid;grid-template-columns:auto auto auto;gap:4px 10px;font-size:13px;align-items:center}
.donut .legend .dot{width:10px;height:10px;border-radius:2px}
.donut .legend .n{font-variant-numeric:tabular-nums;font-weight:600;text-align:right}
.donut .legend .pc{color:var(--ink-3);font:12px var(--mono)}
.donut .legend button{display:contents} .donut .legend button:hover span{color:var(--accent)}
.donut .c{font-size:22px;font-weight:600;fill:var(--ink)} .donut .cl{font-size:10px;fill:var(--ink-3)}
/* stacked bars (dimensions) */
.dim{display:flex;flex-direction:column;gap:9px}
.dim .row{display:grid;grid-template-columns:76px 1fr 44px;gap:10px;align-items:center;font-size:13px;width:100%;text-align:left;border-radius:4px;padding:2px 4px;margin:-2px -4px}
.dim .row:hover{background:var(--surface-2)}
.dim .row[aria-pressed=true]{background:var(--surface-2);outline:1px solid var(--line)}
.dim .k{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dim .bar{height:14px;display:flex;border-radius:3px;overflow:hidden;background:var(--skip-bg)}
.dim .bar i{display:block;height:100%}
.dim .n{font:12px var(--mono);color:var(--ink-3);text-align:right}
.dim .n b{color:var(--fail);font-weight:600}
.legend-inline{display:flex;gap:12px;font-size:11px;color:var(--ink-3);margin-top:10px}
.legend-inline span::before{content:"";display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;background:var(--c)}
/* histogram */
.hist{display:flex;align-items:flex-end;gap:6px;height:110px;padding-top:6px}
.hist .b{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px}
.hist .b i{display:block;width:100%;border-radius:3px 3px 0 0;background:var(--accent);opacity:.75;min-height:2px}
.hist .b i.slow{background:var(--flaky)}
.hist .b .l{font:10px var(--mono);color:var(--ink-3);white-space:nowrap}
.hist .b .v{font:11px var(--mono);color:var(--ink-2)}
/* attention */
.attn{list-style:none;margin:0;padding:0}
.attn li{border-top:1px solid var(--line)} .attn li:first-child{border-top:0}
.attn button{width:100%;text-align:left;padding:8px 0;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}
.attn button:hover .t{color:var(--accent)}
.attn .t{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.attn .m{font:11px var(--mono);color:var(--ink-3)}
.attn .sev{font-size:11px;padding:2px 7px;border-radius:999px;font-weight:600;background:var(--fail-bg);color:var(--fail);white-space:nowrap}
.attn .ok{color:var(--pass);font-size:13px;padding:6px 0}
/* tags */
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tags button{display:inline-flex;align-items:center;gap:6px;font:12px var(--mono);padding:4px 8px;border:1px solid var(--line);border-radius:4px;background:var(--surface)}
.tags button:hover{border-color:var(--accent)}
.tags .bar{width:40px;height:5px;border-radius:3px;background:var(--skip-bg);display:flex;overflow:hidden}
.tags .bar i{display:block;height:100%}
/* meta chips in detail */
.metas{display:flex;flex-wrap:wrap;gap:6px;margin:-8px 0 18px}
.meta{display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:4px 9px;border:1px solid var(--line);border-radius:4px;background:var(--surface-2)}
.meta .k{color:var(--ink-3)} .meta .v{font-weight:500}
.meta.priority .v,.meta.severity .v{color:var(--fail)}
.meta.priority.low .v,.meta.severity.low .v{color:var(--ink)}

/* videos, traces, visual compare */
.vids{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.vids figure{margin:0;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:#000}
.vids video{width:100%;display:block;max-height:420px;background:#000}
.vids figcaption{font:11px var(--mono);padding:6px 8px;color:var(--ink-2);background:var(--surface-2)}
.trace-card{border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;display:flex;flex-direction:column;gap:8px;font-size:13px}
.trace-how{color:var(--ink-2);font-size:12px} .trace-how code{font:12px var(--mono);background:var(--surface-2);padding:1px 5px;border-radius:3px}
.trace-card .dl{align-self:flex-start;font-size:12px;padding:6px 10px;border:1px solid var(--accent);border-radius:var(--radius);text-decoration:none}
.trace-card .dl:hover{background:var(--accent);color:#fff}
.cmp-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:12px}
.cmp-slider{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);background:var(--surface-2);user-select:none}
.cmp-slider img{width:100%;display:block}
.cmp-top{position:absolute;inset:0 auto 0 0;overflow:hidden;width:50%} .cmp-top img{width:auto;height:100%;max-width:none}
.cmp-slider{aspect-ratio:auto}
.cmp-handle{position:absolute;top:0;bottom:0;width:2px;background:var(--accent);left:50%;pointer-events:none}
.cmp-handle::after{content:"⇔";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--accent);color:#fff;border-radius:999px;width:26px;height:26px;display:grid;place-items:center;font-size:13px}
.cmp input[type=range]{width:100%;margin:8px 0 0;accent-color:var(--accent)}
.cmp-cap{display:flex;justify-content:space-between;font:11px var(--mono);color:var(--ink-3)}
.cmp-side{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.cmp-side figure,.cmp-one{margin:0;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--surface-2)}
.cmp-side img,.cmp-one img{width:100%;display:block;cursor:zoom-in}
.cmp-side figcaption{font:11px var(--mono);padding:5px 8px;color:var(--ink-2)}

/* project block */
.hdr .proj-blk{display:flex;flex-direction:column;line-height:1.25}
.hdr .proj-blk h1{font-size:15px}
.hdr .proj-blk .sub{font-size:12px;color:var(--ink-3)} .hdr .proj-blk .sub a{color:var(--ink-3)}
/* trend */
.trend svg{width:100%;height:auto;display:block} .trend text{font:10px var(--mono);fill:var(--ink-3)}
.trend .grid line{stroke:var(--line)} .trend .pass{fill:none;stroke:var(--pass);stroke-width:2}
.trend .fail{fill:none;stroke:var(--fail);stroke-width:1.5;stroke-dasharray:3 3}
.trend .pt{fill:var(--surface);stroke:var(--pass);stroke-width:2} .trend .now{fill:var(--accent);stroke:var(--accent)}
.trend .dur{fill:var(--accent);opacity:.18}
.trend-cap{display:flex;gap:14px;font-size:11px;color:var(--ink-3);margin-top:8px}
/* workers */
.wk{display:flex;flex-direction:column;gap:8px}
.wk .row{display:grid;grid-template-columns:36px 1fr 120px;gap:10px;align-items:center;font-size:12px}
.wk .k{font:12px var(--mono);color:var(--ink-3)} .wk .bar{height:12px;display:flex;border-radius:3px;overflow:hidden;background:var(--skip-bg)} .wk .bar i{display:block;height:100%}
.wk .n{font:11px var(--mono);color:var(--ink-3);text-align:right}
.wk-sum{font-size:13px;color:var(--ink-2);margin-bottom:10px}
/* list: group toggle + folder tree */
.tools .seg{display:inline-flex;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
.tools .seg button{padding:6px 10px;font-size:12px;color:var(--ink-2)} .tools .seg button[aria-pressed=true]{background:var(--surface-2);color:var(--ink)}
.folder{display:flex;align-items:center;gap:6px;padding:8px 12px 4px;font:12px var(--mono);color:var(--ink-2);width:100%;text-align:left}
.folder .cnt{margin-left:auto;display:flex;gap:6px} .folder .cnt b{color:var(--fail)} .folder .cnt span{color:var(--ink-3)}
.folder .tw{font-size:9px;color:var(--ink-3)}
.folder+.folder,.folder+.file{margin-left:0}
.tree-indent{padding-left:14px;border-left:1px solid var(--line);margin-left:16px}
.file-row{display:flex;align-items:center;gap:6px;padding:6px 12px 2px;font:12px var(--mono);color:var(--ink-3);width:100%;text-align:left}
.file-row .mini{display:flex;gap:2px;margin-left:auto} .file-row .mini i{width:6px;height:6px;border-radius:50%;display:block}
/* links in meta */
.meta a{color:var(--accent);text-decoration:none;font-weight:500} .meta a:hover{text-decoration:underline}
.meta a::after{content:"↗";font-size:10px;margin-left:3px;color:var(--ink-3)}
/* logs */
.logs{background:var(--surface-2);border-radius:var(--radius);padding:8px 0;font:12px/1.55 var(--mono);max-height:320px;overflow:auto}
.logs .ln{display:grid;grid-template-columns:78px 1fr;gap:12px;padding:1px 12px}
.logs .ln:hover{background:var(--surface)} .logs .ts{color:var(--ink-3)} .logs .lm{white-space:pre-wrap;word-break:break-word}
.logs .ln.err .lm{color:var(--fail)} .logs .ln.warn .lm{color:#9A6A00}
/* data tables */
.tbl-wrap{overflow:auto;border:1px solid var(--line);border-radius:var(--radius);max-height:360px}
table.tbl{border-collapse:collapse;font-size:12.5px;width:100%;min-width:100%}
.tbl th{position:sticky;top:0;background:var(--surface-2);text-align:left;font-weight:600;padding:7px 10px;border-bottom:1px solid var(--line);white-space:nowrap}
.tbl td{padding:6px 10px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:12px;white-space:nowrap;max-width:360px;overflow:hidden;text-overflow:ellipsis}
.tbl tr:last-child td{border-bottom:0} .tbl td.mask{color:var(--ink-3);letter-spacing:1px}
.kv2{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;font-size:13px;border:1px solid var(--line);border-radius:var(--radius);padding:10px 12px}
.kv2 dt{color:var(--ink-3)} .kv2 dd{margin:0;font-family:var(--mono);font-size:12px;word-break:break-all}
.mask-note{font-size:11px;color:var(--ink-3);margin-top:6px}
/* api panel */
.api{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:10px;overflow:hidden}
.api-head{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--surface-2);cursor:pointer;width:100%;text-align:left}
.api-head .m{font:11px/1 var(--mono);font-weight:600;padding:4px 7px;border-radius:3px;color:#fff;background:var(--ink-3)}
.api-head .m.GET{background:#2A7FBF} .api-head .m.POST{background:var(--pass)} .api-head .m.PUT,.api-head .m.PATCH{background:#C77D14} .api-head .m.DELETE{background:var(--fail)}
.api-head .u{flex:1;font:12px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.api-head .sc{font:12px var(--mono);font-weight:600} .api-head .sc.ok{color:var(--pass)} .api-head .sc.bad{color:var(--fail)} .api-head .sc.warn{color:#9A6A00}
.api-head .d{font:11px var(--mono);color:var(--ink-3)}
.api-body{display:grid;grid-template-columns:1fr 1fr;gap:0}
@media (max-width:900px){.api-body{grid-template-columns:1fr}}
.api-col{padding:10px 12px;min-width:0} .api-col+.api-col{border-left:1px solid var(--line)}
.api-col h5{margin:0 0 6px;font-size:11px;font-weight:600;color:var(--ink-3)}
.api-col pre{margin:0 0 10px;background:var(--surface-2);padding:8px 10px;border-radius:4px;font:11.5px/1.5 var(--mono);white-space:pre-wrap;word-break:break-all;max-height:260px;overflow:auto}
.api.collapsed .api-body{display:none}
/* bdd */
.step .kw{font-weight:600;color:var(--accent);margin-right:4px} .step .kw.and{color:var(--ink-3)}
.badge.scenario{background:var(--surface-2);color:var(--ink-2)}
.tools .dims{display:flex;gap:6px;flex-wrap:wrap;width:100%}
.tools .dims select{flex:1;min-width:90px}
`;

const JS = String.raw`
(function(){
const data = JSON.parse(document.getElementById('rl-data').textContent);
const $ = (s,el=document)=>el.querySelector(s);
const h = (tag, attrs={}, ...kids)=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v);}for(const k of kids.flat(Infinity)){if(k==null)continue;e.append(k.nodeType?k:document.createTextNode(k));}return e;};
const ms = n => n<1000? Math.round(n)+'ms' : n<60000 ? (n/1000).toFixed(1)+'s' : Math.floor(n/60000)+'m '+Math.round((n%60000)/1000)+'s';
const isFail = s => s==='failed'||s==='timedOut'||s==='interrupted';
const colorOf = k => k==='passed'?'var(--pass)':k==='flaky'?'var(--flaky)':k==='skipped'?'var(--skip)':'var(--fail)';
const bucket = t => isFail(t.outcome)?'failed':t.outcome;
const label = {passed:'Passed',failed:'Failed',flaky:'Flaky',skipped:'Skipped',timedOut:'Timed out',interrupted:'Interrupted'};

const state = { q:'', status:'all', project:'all', dims:{}, selected:null, retry:null, group:'file', open:{}, view:'overview' };
const DIMS = data.options.dimensions.filter(d=>data.tests.some(t=>t.meta[d]));
const dimValues = d => { const vals=[...new Set(data.tests.map(t=>t.meta[d]).filter(Boolean))]; const order=(data.options.dimensionOrder[d]||[]).map(x=>x.toLowerCase()); return vals.sort((a,b)=>{ const ia=order.indexOf(a.toLowerCase()), ib=order.indexOf(b.toLowerCase()); if(ia>-1||ib>-1) return (ia===-1?99:ia)-(ib===-1?99:ib); return a.localeCompare(b); }); };
const rank = t => { const p=(t.meta.priority||'').toUpperCase(), sv=(t.meta.severity||'').toLowerCase(); const po=data.options.dimensionOrder.priority.indexOf(p), so=data.options.dimensionOrder.severity.map(x=>x.toLowerCase()).indexOf(sv); return (po===-1?9:po)*10+(so===-1?9:so); };
const params = new URLSearchParams(location.hash.slice(1));
if(params.get('t')) { state.selected = params.get('t'); state.view='tests'; }
if(params.get('view')) state.view = params.get('view');

try{ const p=localStorage.getItem('rl-palette'); if(p) document.documentElement.setAttribute('data-palette',p); const th=localStorage.getItem('rl-theme'); if(th) document.documentElement.setAttribute('data-theme',th); }catch(e){}
const app = $('#app');
app.append(stripe(), header(), nav(),
  h('div',{class:'view','data-view':'overview'}, summary()),
  h('div',{class:'view','data-view':'tests'}, main()),
  h('div',{class:'view','data-view':'failures'}, h('div',{class:'view-pad'}, failuresView())),
  h('div',{class:'view','data-view':'api'}, h('div',{class:'view-pad'}, apiView())),
  h('div',{class:'view','data-view':'timeline'}, h('div',{class:'view-pad'}, timelineView())));
select(state.selected || firstInteresting(), true);
showView(state.view);
window.addEventListener('keydown', e=>{
  if(e.key==='Escape'){const lb=$('.lb'); if(lb) lb.remove(); return;}
  const tag=(e.target.tagName||'').toLowerCase(); if(tag==='input'||tag==='select'||tag==='textarea') return;
  if(e.key==='/'){ e.preventDefault(); showView('tests'); $('.tools input').focus(); return; }
  const vk={'1':'overview','2':'tests','3':'failures','4':'api','5':'timeline'}[e.key]; if(vk&&document.querySelector('.nav button[data-view='+vk+']')){ showView(vk); return; }
  if(e.key==='f'){ state.status=state.status==='failed'?'all':'failed'; refresh(); return; }
  if(e.key==='j'||e.key==='k'){ const ids=[...document.querySelectorAll('.item')].map(i=>i.dataset.id); if(!ids.length) return; let i=ids.indexOf(state.selected); i=e.key==='j'?Math.min(ids.length-1,i+1):Math.max(0,i-1); select(ids[i]); }
});

/* ---------- header ---------- */
function setHash(){ const p=new URLSearchParams(); if(state.view!=='overview') p.set('view',state.view); if(state.selected&&state.view==='tests') p.set('t',state.selected); const hs=p.toString(); history.replaceState(null,'',hs?'#'+hs:location.pathname+location.search); }
function showView(v){
  state.view=v; document.querySelectorAll('.view').forEach(el=>el.classList.toggle('on',el.dataset.view===v));
  document.querySelectorAll('.nav button[data-view]').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===v));
  setHash(); try{window.scrollTo(0,0);}catch(e){}
}
function nav(){
  const s=data.stats, f=s.failed+s.timedOut+s.interrupted, apiN=data.tests.reduce((a,t)=>a+t.results.reduce((b,r)=>b+r.api.length,0),0);
  const tabs=[['overview','Overview',null],['tests','Tests',s.total],['failures','Failures',f+s.flaky,f>0],['api','API',apiN],['timeline','Timeline',null]].filter(t=>t[0]!=='api'||apiN>0);
  return h('nav',{class:'nav'}, tabs.map(([v,l,n,bad])=>h('button',{'data-view':v,'aria-selected':state.view===v,onclick:()=>showView(v)}, l, n!=null?h('span',{class:'cnt'+(bad?' bad':'')},n):null)));
}
function failuresView(){
  const bad=data.tests.filter(t=>isFail(t.outcome)||t.outcome==='flaky');
  if(!bad.length) return h('div',{class:'card'}, h('div',{style:'font-size:18px;color:var(--pass);font-weight:600'},'No failures.'), h('div',{style:'color:var(--ink-3);margin-top:6px'},'Every test that ran passed on the first attempt.'));
  const cl=failureClusters();
  const grid=h('div',{class:'grid'});
  if(cl.length) grid.append(h('div',{class:'card w6 fail-rail'}, h('h2',{},'Failure clusters', h('span',{class:'hint'},cl.length+' distinct error'+(cl.length>1?'s':''))), clustersView(cl)));
  if(DIMS.length) grid.append(h('div',{class:'card w6 fail-rail'}, h('h2',{},'Needs attention', h('span',{class:'hint'},'ranked by priority and severity')), attention()));
  const rows=[...bad].sort((a,b)=>rank(a)-rank(b)||b.duration-a.duration);
  grid.append(h('div',{class:'card w12'}, h('h2',{},rows.length+' failed or flaky tests'), h('table',{class:'apitbl'},
    h('thead',{}, h('tr',{}, ['','Test','Spec','Priority','Owner','Ticket','Attempts',''].map(x=>h('th',{},x)))),
    h('tbody',{}, rows.map(t=>{ const e=t.results[t.results.length-1].errors[0]; return h('tr',{onclick:()=>select(t.id)},
      h('td',{}, h('span',{class:'st '+t.outcome,style:'display:inline-block'})), h('td',{}, h('div',{},t.title), h('div',{class:'t',title:e?e.message:''}, e? e.message.split('\n')[0].slice(0,110):'')),
      h('td',{class:'t'},t.file.split('/').pop()+(data.projects.length>1?' · '+t.project:'')), h('td',{},[t.meta.priority,t.meta.severity].filter(Boolean).join(' · ')), h('td',{},t.meta.owner||''), h('td',{},t.meta.story||t.meta.issue||''), h('td',{},t.results.length), h('td',{class:'t'},ms(t.duration))); })))));
  return grid;
}
function apiView(){
  const calls=[]; for(const t of data.tests) for(const r of t.results) for(const c of r.api) calls.push({c,t,r});
  if(!calls.length) return h('div',{class:'card'},'No API calls recorded. Use api() or recordApi() from reporting-labs inside your tests.');
  const bad=calls.filter(x=>(x.c.status||0)>=400).length, avg=Math.round(calls.reduce((a,x)=>a+(x.c.duration||0),0)/calls.length), slow=calls.filter(x=>(x.c.duration||0)>1000).length;
  calls.sort((a,b)=>((b.c.status||0)>=400)-((a.c.status||0)>=400)||(b.c.duration||0)-(a.c.duration||0));
  const byHost=new Map(); for(const x of calls){ try{ const hst=new URL(x.c.url).host; byHost.set(hst,(byHost.get(hst)||0)+1);}catch(e){} }
  return h('div',{}, h('div',{class:'api-stats'}, h('span',{},h('b',{},calls.length),' calls'), h('span',{class:bad?'bad':''},h('b',{},bad),' failed (4xx/5xx)'), h('span',{},h('b',{},ms(avg)),' avg'), h('span',{},h('b',{},slow),' over 1s'), h('span',{},h('b',{},byHost.size),' host'+(byHost.size===1?'':'s'))),
    h('div',{class:'card w12'}, h('table',{class:'apitbl'}, h('thead',{}, h('tr',{}, ['Method','URL','Status','Time','Test'].map(x=>h('th',{},x)))),
      h('tbody',{}, calls.map(({c,t})=>{ const st=c.status||0, cls=st>=400?'bad':st>=300?'warn':'ok'; return h('tr',{onclick:()=>select(t.id)},
        h('td',{}, h('span',{class:'m '+c.method.toUpperCase(),style:'font:11px var(--mono);font-weight:600;padding:3px 6px;border-radius:3px;color:#fff;background:'+({GET:'#2A7FBF',POST:'var(--pass)',PUT:'#C77D14',PATCH:'#C77D14',DELETE:'var(--fail)'}[c.method.toUpperCase()]||'var(--ink-3)')},c.method.toUpperCase())),
        h('td',{class:'u',title:c.url},c.url), h('td',{}, h('span',{class:'sc '+cls,style:'font:12px var(--mono);font-weight:600;color:'+(cls==='bad'?'var(--fail)':cls==='warn'?'var(--flaky-ink)':'var(--pass)')},st||'—')), h('td',{class:'t'},c.duration!=null?ms(c.duration):'—'), h('td',{class:'t',title:t.title},t.title)); })))));
}
function timelineView(){
  return h('div',{class:'grid'}, h('div',{class:'card w12'}, h('h2',{},'Timeline by worker'), timeline()), h('div',{class:'card w6'}, h('h2',{},'Workers'), workers()), h('div',{class:'card w6'}, h('h2',{},'Duration spread'), histogram()));
}
function stripe(){
  const s=data.stats, f=s.failed+s.timedOut+s.interrupted, tot=s.total||1;
  return h('div',{class:'stripe','aria-hidden':'true'}, [['passed',s.passed],['flaky',s.flaky],['failed',f],['skipped',s.skipped]].filter(x=>x[1]).map(([k,n])=>h('i',{style:'width:'+(n/tot*100)+'%;background:'+colorOf(k)})));
}
function isDark(){ return getComputedStyle(document.documentElement).getPropertyValue('--_dark').trim()==='1'; }
function copyText(txt,btn,done){ const ok=()=>{ if(btn){ const o=btn.textContent; btn.textContent=done||'Copied'; btn.classList.add('done'); setTimeout(()=>{btn.textContent=o;btn.classList.remove('done');},1400);} };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok,()=>fallback()); else fallback();
  function fallback(){ const ta=h('textarea',{style:'position:fixed;opacity:0'},txt); document.body.append(ta); ta.select(); try{document.execCommand('copy');ok();}catch(e){} ta.remove(); } }
function summaryMarkdown(){
  const s=data.stats, f=s.failed+s.timedOut+s.interrupted, ran=s.total-s.skipped, rate=ran?Math.round(s.passed/ran*100):0;
  const meta=Object.entries(data.metadata).map(([k,v])=>k+': '+v).join(' · ');
  const lines=['*'+data.title+'* — '+(f?':red_circle:':':large_green_circle:')+' '+rate+'% passed ('+s.passed+'/'+ran+')'+(f?', '+f+' failed':'')+(s.flaky?', '+s.flaky+' flaky':'')+(s.skipped?', '+s.skipped+' skipped':'')+' · '+ms(data.duration)+(meta?' · '+meta:'')];
  const bad=data.tests.filter(t=>isFail(t.outcome)).sort((a,b)=>rank(a)-rank(b)).slice(0,10);
  if(bad.length){ lines.push('Failures:'); for(const t of bad) lines.push('• '+[t.meta.priority,t.meta.severity].filter(Boolean).join('/')+(t.meta.priority||t.meta.severity?' ':'')+t.title+(t.meta.owner?' ('+t.meta.owner+')':'')+(t.meta.story?' '+t.meta.story:'')); if(f>bad.length) lines.push('… and '+(f-bad.length)+' more'); }
  return lines.join('\n');
}
function header(){
  const html = document.documentElement;
  const toggle = h('button',{class:'tbtn',title:'Toggle light/dark','aria-label':'Toggle theme',onclick:()=>{
    const next=isDark()?'light':'dark'; html.setAttribute('data-theme', next); try{localStorage.setItem('rl-theme',next);}catch(e){}
  }}, '◐');
  const pal = h('select',{class:'pal','aria-label':'Palette',onchange:e=>{ html.setAttribute('data-palette',e.target.value); try{localStorage.setItem('rl-palette',e.target.value);}catch(e){} }},
    [['lab','Lab'],['ocean','Ocean'],['ember','Ember'],['mono','Mono']].map(([v,l])=>h('option',{value:v,selected:html.getAttribute('data-palette')===v},l)));
  const copy = h('button',{class:'btn',onclick:e=>copyText(summaryMarkdown(),e.currentTarget,'Copied for Slack')}, 'Copy summary');
  return h('header',{class:'hdr'},
    data.options.logo ? h('img',{src:data.options.logo,alt:''}) : null,
    data.options.project ? h('div',{class:'proj-blk'}, h('h1',{}, data.title),
      h('div',{class:'sub'}, [data.options.project.name, data.options.project.version?'v'+data.options.project.version:null, data.options.project.team].filter(Boolean).join(' · '),
        data.options.project.url? [' · ', h('a',{href:data.options.project.url,target:'_blank',rel:'noopener'}, data.options.project.url.replace(/^https?:\/\//,''))] : null))
    : h('h1',{}, data.title),
    h('div',{class:'hmeta'}, Object.entries(data.metadata).map(([k,v])=>h('span',{class:'chip'}, k+' ', h('b',{},v)))),
    h('div',{class:'spacer'}),
    h('span',{class:'when'}, new Date(data.startTime).toLocaleString()+' · '+ms(data.duration)+' · '+data.workers+' worker'+(data.workers===1?'':'s')),
    h('div',{class:'ctl'}, copy, pal, toggle));
}

/* ---------- summary ---------- */
function summary(){
  const s = data.stats;
  const failed = s.failed+s.timedOut+s.interrupted;
  const ran = s.total - s.skipped;
  const ok = failed===0;
  const rate = ran? Math.round(s.passed/ran*100):0;
  const parts=[]; if(failed)parts.push(failed+' failed'); if(s.flaky)parts.push(s.flaky+' flaky'); if(s.skipped)parts.push(s.skipped+' skipped');
  const el = h('section',{class:'sum'},
    h('div',{class:'vrow'},
      h('div',{class:'vleft'},
        h('div',{class:'verdict'},
          h('div',{class:'big '+(ok?'ok':'bad')}, ok? ['All '+s.passed, h('small',{},'passed')] : [rate+'%', h('small',{},'passed')]),
          h('div',{class:'sub'}, ok? (parts.length? parts.join(', ') : 'Nothing to worry about.') : s.passed+' of '+ran+' — '+parts.join(', '))),
        h('div',{class:'pills'},
          pill('all','All',s.total,null), pill('passed','Passed',s.passed,'var(--pass)'),
          pill('failed','Failed',failed,'var(--fail)'), pill('flaky','Flaky',s.flaky,'var(--flaky)'),
          pill('skipped','Skipped',s.skipped,'var(--skip)'))),
      data.options.widgets.outcome && data.tests.length ? donut() : null));
  if(data.options.widgets.runStrip && data.tests.length){
    const strip = h('div',{class:'strip',id:'strip'}, data.tests.map(t=>h('button',{class:'cell '+t.outcome,'data-id':t.id,title:t.title+' · '+label[t.outcome]+' · '+ms(t.duration),'aria-label':t.title,onclick:()=>select(t.id)})));
    el.append(strip, h('div',{class:'strip-cap'}, 'Every test in run order. Hover for details, click to open.'));
  }
  const W=data.options.widgets, g=[];
  const hasFail=data.tests.some(t=>isFail(t.outcome)||t.outcome==='flaky');
  if(W.attention && hasFail) g.push(h('div',{class:'card w6 fail-rail'}, h('h2',{},'Needs attention', h('span',{class:'hint'},'ranked by priority · severity')), attention()));
  const clusters=failureClusters(); if(clusters.length) g.push(h('div',{class:'card w6 fail-rail'}, h('h2',{},'Failure clusters', h('span',{class:'hint'},clusters.length+' root cause'+(clusters.length>1?'s':'')+' · '+clusters.reduce((a,c)=>a+c.tests.length,0)+' failures')), clustersView(clusters.slice(0,4)), clusters.length>4?h('button',{class:'btn',style:'margin-top:10px',onclick:()=>showView('failures')},'All '+clusters.length+' clusters'):null));
  if(W.dimensions) g.push(h('div',{class:'card w8'}, h('h2',{},'Breakdown', h('span',{class:'hint'},'click a row to filter')), breakdown()));
  if(W.slowest) g.push(h('div',{class:'card'}, h('h2',{},'Slowest tests'), slowest()));
  if(data.history.length>1) g.push(h('div',{class:'card w12'}, h('h2',{},'Trend', h('span',{class:'hint'},'last '+data.history.length+' runs')), trend()));
  if(g.length) el.append(h('div',{class:'grid'}, g));
  for(const sec of data.options.sections) el.append(h('div',{class:'card section'}, h('h2',{},sec.title), h('div',{class:'body',html:sec.html})));
  return el;
}
function pill(key,text,n,color){
  return h('button',{class:'pill','aria-pressed':state.status===key,'data-k':key,onclick:()=>{state.status=key;refresh();if(key!=='all')showView('tests');}},
    color? h('span',{class:'dot',style:'background:'+color}) : null, text, h('span',{class:'n'},n));
}

function donut(){
  const s=data.stats, failed=s.failed+s.timedOut+s.interrupted, total=s.total||1;
  const parts=[['passed',s.passed],['failed',failed],['flaky',s.flaky],['skipped',s.skipped]].filter(p=>p[1]>0);
  const R=54, C=2*Math.PI*R; let off=0, arcs='';
  const gap=parts.length>1?3:0;
  for(const [k,n] of parts){ const len=n/total*C; arcs+='<circle r="'+R+'" cx="66" cy="66" fill="none" stroke="'+colorOf(k)+'" stroke-width="18" stroke-dasharray="'+Math.max(0,len-gap)+' '+(C-Math.max(0,len-gap))+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 66 66)"><title>'+label[k]+': '+n+'</title></circle>'; off+=len; }
  const ran=s.total-s.skipped, rate=ran?Math.round(s.passed/ran*100):0;
  const svg=h('div',{html:'<svg viewBox="0 0 132 132">'+arcs+'<text class="c" x="66" y="64" text-anchor="middle">'+rate+'%</text><text class="cl" x="66" y="80" text-anchor="middle">pass rate</text></svg>'}).firstChild;
  return h('div',{class:'donut'}, svg, h('div',{class:'legend'}, parts.map(([k,n])=>h('button',{onclick:()=>{state.status=k;refresh();showView('tests');}}, h('span',{class:'dot',style:'background:'+colorOf(k)}), h('span',{},label[k]), h('span',{class:'n'},n)))));
}
function attention(){
  const bad=data.tests.filter(t=>isFail(t.outcome)||t.outcome==='flaky').sort((a,b)=>rank(a)-rank(b)||(isFail(b.outcome)-isFail(a.outcome))||b.duration-a.duration);
  if(!bad.length) return h('div',{class:'ok'},'No failures. Ship it.');
  const groups=new Map(); for(const t of bad){ const k=t.file+'::'+t.path.join('/')+'::'+t.title; const g=groups.get(k)||{t,projects:[]}; g.projects.push(t.project); groups.set(k,g); }
  const rows=[...groups.values()].slice(0,7);
  return h('ul',{class:'attn'}, rows.map(({t,projects})=>h('li',{}, h('button',{onclick:()=>select(t.id)},
    h('span',{class:'sev',style:t.outcome==='flaky'?'background:var(--flaky-bg);color:var(--flaky-ink)':''}, [t.meta.priority,t.meta.severity].filter(Boolean).join(' · ')||label[t.outcome]),
    h('span',{class:'t'}, t.title, data.projects.length>1? h('span',{class:'proj'}, projects.length>1? projects.length+' projects' : projects[0]) : null),
    h('span',{class:'m'}, t.meta.owner||t.meta.feature||'')))), groups.size>rows.length? h('li',{}, h('button',{onclick:()=>showView('failures')}, h('span',{}), h('span',{class:'t',style:'color:var(--accent)'},'+'+(groups.size-rows.length)+' more in Failures'), h('span',{}))) : null);
}
function dimension(d){
  const vals=dimValues(d), keys=['passed','flaky','failed','skipped'];
  const rows=vals.map(v=>{ const ts=data.tests.filter(t=>t.meta[d]===v), n=ts.length||1, cnt={}; for(const k of keys) cnt[k]=ts.filter(t=>bucket(t)===k).length;
    return h('button',{class:'row','aria-pressed':state.dims[d]===v,title:ts.length+' tests',onclick:()=>{state.dims[d]=state.dims[d]===v?null:v;refresh();showView('tests');}},
      h('span',{class:'k'},v), h('span',{class:'bar'}, keys.map(k=>h('i',{style:'width:'+(cnt[k]/n*100)+'%;background:'+colorOf(k),title:label[k]+' '+cnt[k]}))),
      h('span',{class:'n'}, cnt.failed? h('b',{},cnt.failed+' ✕ ') : null, ts.length)); });
  const untagged=data.tests.filter(t=>!t.meta[d]).length;
  return h('div',{}, h('div',{class:'dim'}, rows), h('div',{class:'legend-inline'}, keys.map(k=>h('span',{style:'--c:'+colorOf(k)},label[k])), untagged?h('span',{style:'--c:transparent;margin-left:auto'},untagged+' without '+d):null));
}
function histogram(){
  const ds=data.tests.filter(t=>t.outcome!=='skipped').map(t=>t.duration); if(!ds.length) return h('div',{class:'empty'},'No timings');
  const edges=[0,250,500,1000,2000,5000,10000,30000,Infinity], lbl=['<250ms','250–500ms','0.5–1s','1–2s','2–5s','5–10s','10–30s','>30s'];
  const counts=edges.slice(0,-1).map((e,i)=>ds.filter(x=>x>=e&&x<edges[i+1]).length), max=Math.max(...counts,1);
  const last=counts.map((c,i)=>c?i:-1).filter(i=>i>-1).pop();
  return h('div',{class:'hist'}, counts.slice(0,last+1).map((c,i)=>h('div',{class:'b',title:c+' tests '+lbl[i]}, h('span',{class:'v'},c||''), h('i',{class:i>=4?'slow':'',style:'height:'+Math.max(2,c/max*70)+'px'}), h('span',{class:'l'},lbl[i]))));
}
function tagsChart(){
  const m=new Map(); for(const t of data.tests) for(const g of t.tags){ if(/[:=]/.test(g)||/^@P[0-4]$/i.test(g)) continue; const e=m.get(g)||{n:0,f:0}; e.n++; if(isFail(t.outcome)) e.f++; m.set(g,e); }
  const list=[...m.entries()].sort((a,b)=>b[1].f-a[1].f||b[1].n-a[1].n).slice(0,24);
  return h('div',{class:'tags'}, list.map(([g,e])=>h('button',{onclick:()=>{ const inp=document.querySelector('.tools input'); inp.value=g; state.q=g.toLowerCase(); refresh(); showView('tests'); }}, g, h('span',{class:'bar'}, h('i',{style:'width:'+((e.n-e.f)/e.n*100)+'%;background:var(--pass)'}), h('i',{style:'width:'+(e.f/e.n*100)+'%;background:var(--fail)'})), h('span',{style:'color:var(--ink-3)'},e.n))));
}

function breakdown(){
  const tabs=[...DIMS.map(d=>[d,d[0].toUpperCase()+d.slice(1),()=>dimension(d)])];
  if(data.tests.length>1) tabs.push(['file','Spec file',byFile]);
  if(data.projects.length>1&&data.options.widgets.projects) tabs.push(['project','Project',projects]);
  if(data.options.widgets.tags&&data.tests.some(t=>t.tags.length)) tabs.push(['tags','Tags',tagsChart]);
  if(!tabs.length) return h('div',{class:'empty'},'Add meta({ priority, severity, owner, feature }) to your tests to see breakdowns here.');
  let cur=tabs[0][0]; const bar=h('div',{class:'bk-tabs'}), body=h('div',{});
  const render=()=>{ body.innerHTML=''; body.append(tabs.find(t=>t[0]===cur)[2]()); bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.k===cur)); };
  for(const [k,l] of tabs) bar.append(h('button',{'data-k':k,onclick:()=>{cur=k;render();}},l));
  render(); return h('div',{}, bar, body);
}
function errorSignature(msg){
  return (msg||'').split('\n')[0].replace(/\d+(\.\d+)?(ms|s)\b/g,'N').replace(/\b\d{2,}\b/g,'N').replace(/["'][^"']{0,60}["']/g,'"…"').replace(/\s+/g,' ').trim().slice(0,160);
}
function failureClusters(){
  const m=new Map();
  for(const t of data.tests){ if(!isFail(t.outcome)) continue; const r=t.results[t.results.length-1]; const e=r&&r.errors[0]; const sig=errorSignature(e?e.message:'(no error message)'); const c=m.get(sig)||{sig,sample:e?e.message.split('\n').slice(0,2).join('\n'):'(no error message)',tests:[]}; c.tests.push(t); m.set(sig,c); }
  return [...m.values()].sort((a,b)=>b.tests.length-a.tests.length);
}
function clustersView(cl){
  return h('ul',{class:'clu'}, cl.map(c=>h('li',{}, h('div',{class:'top'}, h('div',{class:'msg',title:c.sample},c.sample), h('span',{class:'n'},c.tests.length+' test'+(c.tests.length>1?'s':''))),
    h('div',{class:'who'}, c.tests.slice(0,8).map(t=>h('button',{onclick:()=>select(t.id)}, t.title+(data.projects.length>1?' · '+t.project:''))), c.tests.length>8?h('span',{class:'n'},'+'+(c.tests.length-8)):null))));
}
function trend(){
  const H=data.history, W=760, HT=170, padL=34, padR=12, padT=12, padB=26, n=H.length;
  const x=i=>padL+(n===1?0:i/(n-1))*(W-padL-padR), y=v=>padT+(1-v/100)*(HT-padT-padB);
  const rate=e=>{ const ran=e.total-e.skipped; return ran?Math.round(e.passed/ran*100):0; };
  const failPct=e=>{ const ran=e.total-e.skipped; return ran?Math.round(e.failed/ran*100):0; };
  const maxD=Math.max(...H.map(e=>e.duration),1);
  let svg='<g class="grid">'; for(const v of [0,25,50,75,100]) svg+='<line x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(padL-6)+'" y="'+(y(v)+3)+'" text-anchor="end">'+v+'%</text>'; svg+='</g>';
  svg+=H.map((e,i)=>'<rect class="dur" x="'+(x(i)-6)+'" y="'+(y(0)-(e.duration/maxD)*(HT-padT-padB)*0.5)+'" width="12" height="'+((e.duration/maxD)*(HT-padT-padB)*0.5)+'" rx="2"><title>'+ms(e.duration)+'</title></rect>').join('');
  svg+='<polyline class="fail" points="'+H.map((e,i)=>x(i)+','+y(failPct(e))).join(' ')+'"/>';
  svg+='<polyline class="pass" points="'+H.map((e,i)=>x(i)+','+y(rate(e))).join(' ')+'"/>';
  svg+=H.map((e,i)=>'<circle class="pt'+(i===n-1?' now':'')+'" cx="'+x(i)+'" cy="'+y(rate(e))+'" r="3.5"><title>'+new Date(e.time).toLocaleString()+(e.label?' · '+e.label:'')+' · '+rate(e)+'% pass · '+e.failed+' failed · '+ms(e.duration)+'</title></circle>').join('');
  const step=Math.max(1,Math.ceil(n/8));
  svg+=H.map((e,i)=>(i%step===0||i===n-1)?'<text x="'+x(i)+'" y="'+(HT-6)+'" text-anchor="middle">'+(e.label||new Date(e.time).toLocaleDateString(undefined,{month:'short',day:'numeric'}))+'</text>':'').join('');
  return h('div',{class:'trend'}, h('div',{html:'<svg viewBox="0 0 '+W+' '+HT+'">'+svg+'</svg>'}).firstChild,
    h('div',{class:'trend-cap'}, h('span',{style:'color:var(--pass)'},'— pass rate'), h('span',{style:'color:var(--fail)'},'- - fail rate'), h('span',{style:'color:var(--accent)'},'▮ duration'), h('span',{style:'margin-left:auto'}, 'this run: '+rate(H[n-1])+'% · '+ms(H[n-1].duration))));
}
function workers(){
  const lanes=[]; for(let i=0;i<data.workers;i++) lanes.push({i,tests:0,fail:0,ms:0});
  for(const t of data.tests) for(const r of t.results){ const l=lanes[r.workerIndex]; if(!l) continue; l.tests++; l.ms+=r.duration; if(isFail(r.status)) l.fail++; }
  const max=Math.max(...lanes.map(l=>l.ms),1), busy=lanes.reduce((a,l)=>a+l.ms,0);
  const util=data.duration? Math.round(busy/(data.duration*data.workers)*100):0;
  return h('div',{}, h('div',{class:'wk-sum'}, data.workers+' parallel worker'+(data.workers===1?'':'s')+' · '+util+'% busy · wall clock '+ms(data.duration)+' vs '+ms(busy)+' of test time'),
    h('div',{class:'wk'}, lanes.map(l=>h('div',{class:'row'}, h('span',{class:'k'},'w'+l.i), h('span',{class:'bar'}, h('i',{style:'width:'+((l.ms-0)/max*100)+'%;background:'+(l.fail?'var(--fail)':'var(--pass)'),title:ms(l.ms)})), h('span',{class:'n'}, l.tests+' runs'+(l.fail?' · '+l.fail+' ✕':'')+' · '+ms(l.ms))))));
}
function byFile(){
  const m=new Map(); for(const t of data.tests){ const e=m.get(t.file)||{n:0,f:0,fl:0,ms:0}; e.n++; e.ms+=t.duration; if(isFail(t.outcome)) e.f++; if(t.outcome==='flaky') e.fl++; m.set(t.file,e); }
  const list=[...m.entries()].sort((a,b)=>b[1].f-a[1].f||b[1].n-a[1].n);
  return h('div',{class:'dim'}, list.map(([f,e])=>h('button',{class:'row',title:f+' · '+ms(e.ms),onclick:()=>{ const inp=document.querySelector('.tools input'); inp.value=f; state.q=f.toLowerCase(); refresh(); showView('tests'); }},
    h('span',{class:'k',style:'font:12px var(--mono)'},f.split('/').pop()), h('span',{class:'bar'}, h('i',{style:'width:'+((e.n-e.f-e.fl)/e.n*100)+'%;background:var(--pass)'}), h('i',{style:'width:'+(e.fl/e.n*100)+'%;background:var(--flaky)'}), h('i',{style:'width:'+(e.f/e.n*100)+'%;background:var(--fail)'})),
    h('span',{class:'n'}, e.f?h('b',{},e.f+' ✕ '):null, e.n))));
}
function timeline(){
  const W=900, laneH=18, pad=44, gap=6;
  const t0=data.startTime, t1=Math.max(...data.tests.flatMap(t=>t.results.map(r=>r.startTime+r.duration)), t0+1);
  const span=t1-t0, H=data.workers*(laneH+gap)+24;
  const x = t => pad+ (t-t0)/span*(W-pad-8);
  let s='';
  for(let i=0;i<data.workers;i++){ const y=i*(laneH+gap)+2; s+='<rect class="lane" x="'+pad+'" y="'+y+'" width="'+(W-pad-8)+'" height="'+laneH+'" rx="2"/><text x="0" y="'+(y+13)+'">w'+i+'</text>'; }
  for(const t of data.tests) for(const r of t.results){
    const y=r.workerIndex*(laneH+gap)+2, x0=x(r.startTime), w=Math.max(2,x(r.startTime+r.duration)-x0);
    const c = isFail(r.status)?'var(--fail)': r.status==='skipped'?'var(--skip)': (t.outcome==='flaky'?'var(--flaky)':'var(--pass)');
    s+='<rect class="r" data-id="'+t.id+'" x="'+x0+'" y="'+(y+3)+'" width="'+w+'" height="'+(laneH-6)+'" fill="'+c+'" style="cursor:pointer"><title>'+escape(t.title)+' (retry '+r.retry+') · '+ms(r.duration)+'</title></rect>';
  }
  const ticks=4; for(let i=0;i<=ticks;i++){ const t=t0+span*i/ticks; s+='<text x="'+x(t)+'" y="'+(H-4)+'" text-anchor="'+(i===ticks?'end':i===0?'start':'middle')+'">'+ms(t-t0)+'</text>'; }
  const svg=h('div',{html:'<svg class="tl" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>'});
  svg.addEventListener('click',e=>{const id=e.target.getAttribute('data-id'); if(id) select(id);});
  return svg;
}
function slowest(){
  const top=[...data.tests].filter(t=>t.outcome!=='skipped').sort((a,b)=>b.duration-a.duration).slice(0,6);
  const max=top[0]?top[0].duration:1;
  return h('ul',{class:'slow'}, top.map(t=>h('li',{}, h('button',{onclick:()=>select(t.id)},
    h('span',{class:'bar',style:'width:'+Math.max(4,Math.round(t.duration/max*70))+'px'}), h('span',{class:'t'},t.title), h('span',{class:'d'},ms(t.duration))))));
}
function projects(){
  return h('div',{class:'proj'}, data.projects.map(p=>{
    const ts=data.tests.filter(t=>t.project===p), n=ts.length||1;
    const cnt=k=>ts.filter(t=>k==='failed'?isFail(t.outcome):t.outcome===k).length;
    return h('div',{class:'row'}, h('span',{class:'name',title:p},p),
      h('span',{class:'bar'}, ['passed','flaky','failed'].map(k=>h('i',{style:'width:'+(cnt(k)/n*100)+'%;background:var(--'+(k==='failed'?'fail':k==='passed'?'pass':'flaky')+')'}))),
      h('span',{class:'d',style:'font:11px var(--mono);color:var(--ink-3)'}, cnt('passed')+'/'+ts.length));
  }));
}

/* ---------- main ---------- */
function main(){
  const projSel = h('select',{onchange:e=>{state.project=e.target.value;refresh();}}, h('option',{value:'all'},'All projects'), data.projects.map(p=>h('option',{value:p},p)));
  return h('div',{class:'main'},
    h('aside',{class:'list'},
      h('div',{class:'tools'}, h('input',{type:'search',placeholder:'Search tests, tags, files…',oninput:e=>{state.q=e.target.value.toLowerCase();refresh();}}), data.projects.length>1?projSel:null,
        h('div',{class:'seg'}, [['file','Spec files'],['folder','Folders'],['flat','Flat']].map(([k,l])=>h('button',{'data-g':k,'aria-pressed':state.group===k,onclick:()=>{state.group=k;refresh();}},l))),
        DIMS.length? h('div',{class:'dims'}, DIMS.map(d=>h('select',{'data-dim':d,onchange:e=>{state.dims[d]=e.target.value||null;refresh();}}, h('option',{value:''},'Any '+d), dimValues(d).map(v=>h('option',{value:v},v))))) : null),
      h('div',{class:'items',id:'items'}),
      h('div',{class:'hint-kbd'}, h('span',{class:'kbd'},'j'),' / ',h('span',{class:'kbd'},'k'),' next / prev · ',h('span',{class:'kbd'},'f'),' failed only · ',h('span',{class:'kbd'},'/'),' search · ',h('span',{class:'kbd'},'1'),'–',h('span',{class:'kbd'},'5'),' switch view')),
    h('section',{class:'detail',id:'detail'}));
}
function visible(){
  return data.tests.filter(t=>{
    if(state.project!=='all'&&t.project!==state.project) return false;
    for(const d of DIMS) if(state.dims[d]&&t.meta[d]!==state.dims[d]) return false;
    if(state.status==='failed'? !isFail(t.outcome) : state.status!=='all'&&t.outcome!==state.status) return false;
    if(state.q){ const hay=(t.path.join(' ')+' '+t.title+' '+t.file+' '+t.tags.join(' ')+' '+t.project+' '+Object.values(t.meta).join(' ')).toLowerCase(); if(!hay.includes(state.q)) return false; }
    return true;
  });
}
function refresh(){
  document.querySelectorAll('.pill').forEach(p=>p.setAttribute('aria-pressed',p.dataset.k===state.status));
  document.querySelectorAll('.dim .row').forEach(r=>{ const card=r.closest('.card'); const d=card.querySelector('h2').textContent.replace(/^By /,''); r.setAttribute('aria-pressed', state.dims[d]===r.querySelector('.k').textContent); });
  document.querySelectorAll('select[data-dim]').forEach(sel=>{ sel.value=state.dims[sel.dataset.dim]||''; });
  const vis=visible(), ids=new Set(vis.map(t=>t.id));
  document.querySelectorAll('.cell').forEach(c=>c.classList.toggle('dim',!ids.has(c.dataset.id)));
  const box=$('#items'); box.innerHTML='';
  if(!vis.length){ box.append(h('div',{class:'empty'},'No tests match. Clear the search or pick another filter.')); return; }
  document.querySelectorAll('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===state.group));
  const item=t=>h('button',{class:'item','data-id':t.id,'aria-current':state.selected===t.id,onclick:()=>select(t.id)},
      h('span',{class:'st '+t.outcome}),
      h('span',{class:'tt'}, t.path.length?h('div',{class:'p'},t.path.join(' › ')):null, h('div',{class:'n'},t.title), h('div',{class:'d'}, ms(t.duration)+(t.results.length>1?' · '+t.results.length+' attempts':'')+(data.projects.length>1?' · '+t.project:''))));
  const counts=ts=>{ const f=ts.filter(t=>isFail(t.outcome)).length; return h('span',{class:'cnt'}, f?h('b',{},f+' ✕'):null, h('span',{},ts.length)); };
  if(state.group==='flat'){ for(const t of vis) box.append(item(t)); }
  else if(state.group==='file'){
    let lastFile=null;
    for(const t of vis){ if(t.file!==lastFile){ box.append(h('div',{class:'file'},t.file)); lastFile=t.file; } box.append(item(t)); }
  } else {
    // folder tree
    const root={dirs:new Map(),files:new Map()};
    for(const t of vis){ const parts=t.file.split('/'); const fname=parts.pop(); let node=root; for(const p of parts){ if(!node.dirs.has(p)) node.dirs.set(p,{dirs:new Map(),files:new Map()}); node=node.dirs.get(p); } if(!node.files.has(fname)) node.files.set(fname,[]); node.files.get(fname).push(t); }
    const allTests=n=>[...n.files.values()].flat().concat([...n.dirs.values()].flatMap(allTests));
    const render=(node,path,depth)=>{
      const out=[];
      for(const [name,child] of [...node.dirs.entries()].sort()){ const key=path+name+'/'; const open=state.open[key]!==false; const ts=allTests(child);
        out.push(h('button',{class:'folder',style:'padding-left:'+(12+depth*14)+'px',onclick:()=>{state.open[key]=!open;refresh();}}, h('span',{class:'tw'},open?'▾':'▸'), '📁 '+name, counts(ts)));
        if(open) out.push(...render(child,key,depth+1)); }
      for(const [name,ts] of [...node.files.entries()].sort()){ const key=path+name; const open=state.open[key]!==false;
        out.push(h('button',{class:'file-row',style:'padding-left:'+(12+depth*14)+'px',onclick:()=>{state.open[key]=!open;refresh();}}, h('span',{class:'tw'},open?'▾':'▸'), name, h('span',{class:'mini'}, ts.map(t=>h('i',{style:'background:'+colorOf(bucket(t))})))));
        if(open) for(const t of ts){ const el=item(t); el.style.paddingLeft=(24+depth*14)+'px'; out.push(el); } }
      return out;
    };
    for(const el of render(root,'',0)) box.append(el);
  }
}
function firstInteresting(){ const f=data.tests.find(t=>isFail(t.outcome))||data.tests.find(t=>t.outcome==='flaky')||data.tests[0]; return f&&f.id; }

/* ---------- detail ---------- */
function select(id, quiet){
  const t=data.tests.find(x=>x.id===id); if(!t) return;
  state.selected=id; state.retry=t.results.length-1; if(!quiet){ if(state.view!=='tests') showView('tests'); else setHash(); } refresh(); renderDetail(t);
  const it=document.querySelector('.item[data-id="'+id+'"]'); if(it&&it.scrollIntoView) it.scrollIntoView({block:'nearest'});
}
function renderDetail(t){
  const d=$('#detail'); d.innerHTML='';
  d.append(h('div',{class:'crumb'}, [t.file, ...t.path.map(p=>data.bdd&&!/^Feature:/i.test(p)?'Feature: '+p:p)].map(p=>h('span',{},p))),
    h('div',{class:'titlebar'}, h('h3',{},t.title), h('div',{class:'actions'},
      h('button',{class:'btn',onclick:e=>copyText(location.href.split('#')[0]+'#t='+t.id,e.currentTarget,'Link copied')},'Copy link'),
      (()=>{ const r=t.results[t.results.length-1]; const e=r&&r.errors[0]; return e? h('button',{class:'btn',onclick:ev=>copyText(t.title+'\n'+t.file+':'+t.line+'\n\n'+e.message,ev.currentTarget,'Error copied')},'Copy error') : null; })())),
    h('div',{class:'badges'}, h('span',{class:'badge '+t.outcome},label[t.outcome]), data.bdd?h('span',{class:'badge scenario'},'Scenario'):null, t.tags.map(g=>h('span',{class:'badge tag'},g)), data.projects.length>1?h('span',{class:'badge tag'},t.project):null, h('span',{class:'loc'}, t.file+':'+t.line+' · '+ms(t.duration))));
  const metaKeys=Object.keys(t.meta);
  const linkFor=(k,v)=>{ const tpl=data.options.links[k]||data.options.links['*']; if(tpl) return tpl.replace('{id}',encodeURIComponent(v)); if(/^https?:\/\//.test(v)) return v; return null; };
  if(metaKeys.length) d.append(h('div',{class:'metas'}, metaKeys.map(k=>{ const v=t.meta[k], low=/^(P[3-4]|low|minor|trivial|normal|medium)$/i.test(v), href=linkFor(k,v); return h('span',{class:'meta '+k+(low?' low':'')}, h('span',{class:'k'},k), href? h('a',{href,target:'_blank',rel:'noopener'},v) : h('span',{class:'v'},v)); })));
  const otherAnn=t.annotations.filter(a=>!DIMS.includes(a.type.toLowerCase()));
  if(otherAnn.length) d.append(h('h4',{},'Annotations'), h('dl',{class:'kv'}, otherAnn.map(a=>[h('dt',{},a.type),h('dd',{},a.description||'')])));
  if(t.results.length>1){
    d.append(h('div',{class:'tabs'}, t.results.map((r,i)=>h('button',{class:'tab','aria-selected':state.retry===i,onclick:()=>{state.retry=i;renderDetail(t);}}, (i===0?'Attempt 1':'Retry '+i)+' · '+(label[r.status]||r.status)))));
  }
  const r=t.results[state.retry]; if(!r){ d.append(h('p',{class:'empty'},'This test did not run.')); return; }
  const body=h('div',{});
  if(r.errors.length){ body.append(h('h4',{},'Error'), ...r.errors.map(e=>h('div',{class:'err'}, e.message, e.stack&&e.stack!==e.message? h('details',{}, h('summary',{},'Stack trace'), h('div',{class:'stack'},e.stack)) : null))); }
  if(r.steps.length){ body.append(h('h4',{},data.bdd?'Scenario steps':'Steps'), stepTree(r.steps)); }
  if(r.logs.length){ const t0=r.startTime; body.append(h('h4',{},'Log'), h('div',{class:'logs'}, r.logs.map(l=>h('div',{class:'ln'+(/\b(error|fail|exception)\b/i.test(l.msg)?' err':/\bwarn/i.test(l.msg)?' warn':'')}, h('span',{class:'ts'},'+'+ms(Math.max(0,l.t-t0))), h('span',{class:'lm'},l.msg))))); }
  for(const b of r.data){ body.append(h('h4',{},b.name), dataBlock(b)); }
  if(r.api.length){ body.append(h('h4',{},r.api.length+' API call'+(r.api.length>1?'s':'')), ...r.api.map(apiPanel)); body.append(h('div',{class:'mask-note'},'Secrets and auth headers are masked as ****')); }
  const imgs=r.attachments.filter(a=>a.src&&a.contentType.startsWith('image/'));
  const vids=r.attachments.filter(a=>a.src&&a.contentType.startsWith('video/'));
  const traces=r.attachments.filter(a=>a.src&&(a.name==='trace'||/\.zip$/.test(a.src)));
  const files=r.attachments.filter(a=>a.src&&!imgs.includes(a)&&!vids.includes(a)&&!traces.includes(a));
  const texts=r.attachments.filter(a=>a.text!=null);
  // visual comparison sets: <name>-expected / -actual / -diff
  const cmp=new Map();
  for(const a of imgs){ const m=a.name.match(/^(.*)-(expected|actual|diff)(\.\w+)?$/); if(m){ const set=cmp.get(m[1])||{}; set[m[2]]=a; cmp.set(m[1],set); } }
  const plainImgs=imgs.filter(a=>!/-(expected|actual|diff)(\.\w+)?$/.test(a.name));
  for(const [name,set] of cmp) if(set.expected&&set.actual) body.append(h('h4',{},'Visual comparison · '+name), compare(set)); else for(const k of Object.keys(set)) plainImgs.push(set[k]);
  if(vids.length){ body.append(h('h4',{},vids.length>1?'Videos':'Video'), h('div',{class:'vids'}, vids.map(a=>h('figure',{}, h('video',{src:a.src,controls:'',preload:'metadata',playsinline:''}), h('figcaption',{}, a.name, a.size?h('span',{},' · '+kb(a.size)):null, ' · ', h('a',{href:a.src,download:''},'download')))))); }
  if(plainImgs.length){ body.append(h('h4',{},plainImgs.length>1?'Screenshots':'Screenshot'), h('div',{class:'att'}, plainImgs.map(a=>h('figure',{}, h('img',{src:a.src,alt:a.name,loading:'lazy',onclick:()=>lightbox(a.src)}), h('figcaption',{},a.name))))); }
  if(traces.length){ body.append(h('h4',{},'Trace'), h('div',{class:'trace'}, traces.map(a=>h('div',{class:'trace-card'},
    h('div',{}, h('b',{},a.name), a.size?h('span',{style:'color:var(--ink-3)'},' · '+kb(a.size)):null),
    h('div',{class:'trace-how'}, 'Open with ', h('code',{},'npx playwright show-trace '+a.src), ' or drop the file on ', h('a',{href:'https://trace.playwright.dev',target:'_blank',rel:'noopener'},'trace.playwright.dev')),
    h('a',{class:'dl',href:a.src,download:''},'Download trace'))))); }
  if(files.length){ body.append(h('h4',{},'Files'), h('div',{class:'att'}, files.map(a=>h('figure',{}, h('div',{class:'file'}, h('a',{href:a.src,download:''},a.name), h('div',{style:'font-size:11px;color:var(--ink-3)'},a.contentType+(a.size?' · '+kb(a.size):''))))))); }
  for(const a of texts) body.append(h('h4',{},a.name), h('pre',{class:'txt'},a.text));
  if(r.stdout.length) body.append(h('h4',{},'Console output'), h('pre',{class:'txt'},r.stdout.join('')));
  if(r.stderr.length) body.append(h('h4',{},'Console errors'), h('pre',{class:'txt'},r.stderr.join('')));
  if(!body.children.length) body.append(h('p',{style:'color:var(--ink-3)'}, r.status==='skipped'?'Skipped — nothing was executed.':'Passed with no steps or attachments recorded.'));
  d.append(body);
}
function stepTree(steps){
  return h('ul',{class:'steps'}, steps.map(s=>{
    const bad=!!s.error, kids=s.steps.length>0;
    const li=h('li',{class:kids&&!hasError(s)?'collapsed':''});
    const row=h('div',{class:'step'+(bad?' bad':'')},
      h('span',{class:'tw'}, kids? '▸' : ''), data.bdd?null:h('span',{class:'cat'},s.category), gherkin(s.title), h('span',{class:'d'},ms(s.duration)));
    if(kids){ row.style.cursor='pointer'; row.addEventListener('click',()=>{li.classList.toggle('collapsed'); row.querySelector('.tw').textContent=li.classList.contains('collapsed')?'▸':'▾';}); if(!li.classList.contains('collapsed')) row.querySelector('.tw').textContent='▾'; }
    li.append(row); if(bad) li.append(h('div',{class:'e'},s.error)); if(kids) li.append(stepTree(s.steps));
    return li;
  }));
}
function gherkin(title){ const m=data.bdd&&title.match(/^(Given|When|Then|And|But)\b\s*(.*)$/); if(!m) return h('span',{class:'t',title},title); return h('span',{class:'t',title}, h('span',{class:'kw'+(/^(And|But)$/.test(m[1])?' and':'')},m[1]), m[2]); }
function hasError(s){ return !!s.error || s.steps.some(hasError); }
function dataBlock(b){
  if(b.kind==='table') return h('div',{}, h('div',{class:'tbl-wrap'}, h('table',{class:'tbl'}, h('thead',{}, h('tr',{}, b.columns.map(c=>h('th',{},c)))), h('tbody',{}, b.rows.map(r=>h('tr',{}, r.map(c=>h('td',{class:c==='****'?'mask':'',title:c},c))))))), h('div',{class:'mask-note'}, b.rows.length+' rows · sensitive columns masked'));
  if(b.kind==='kv') return h('dl',{class:'kv2'}, b.kv.map(([k,v])=>[h('dt',{},k),h('dd',{class:v==='****'?'mask':''},v)]));
  return h('pre',{class:'txt'},b.text);
}
function apiPanel(c){
  const st=c.status||0, cls=st>=500||st>=400?'bad':st>=300?'warn':'ok';
  const wrap=h('div',{class:'api collapsed'});
  const head=h('button',{class:'api-head',onclick:()=>wrap.classList.toggle('collapsed')}, h('span',{class:'m '+c.method.toUpperCase()},c.method.toUpperCase()), h('span',{class:'u',title:c.url},c.url), st?h('span',{class:'sc '+cls},st):null, c.duration!=null?h('span',{class:'d'},ms(c.duration)):null);
  const pre=v=>v==null?null:h('pre',{}, typeof v==='string'?v:JSON.stringify(v,null,2));
  const col=(title,headers,bodyv)=>h('div',{class:'api-col'}, h('h5',{},title), headers&&Object.keys(headers).length? [h('h5',{},'Headers'), pre(headers)] : null, bodyv!=null? [h('h5',{},'Body'), pre(bodyv)] : h('div',{style:'font-size:12px;color:var(--ink-3)'},'no body'));
  wrap.append(head, h('div',{class:'api-body'}, col('Request',c.requestHeaders,c.requestBody), col('Response',c.responseHeaders,c.responseBody)));
  if(cls==='bad') wrap.classList.remove('collapsed');
  return wrap;
}
function kb(n){ return n<1024?n+' B':n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB'; }
function compare(set){
  const wrap=h('div',{class:'cmp'});
  const tabs=h('div',{class:'cmp-tabs'});
  const stage=h('div',{class:'cmp-stage'});
  const views={
    slider:()=>{ const s=h('div',{class:'cmp-slider'}, h('img',{src:set.expected.src,alt:'expected'}), h('div',{class:'cmp-top'}, h('img',{src:set.actual.src,alt:'actual'})), h('div',{class:'cmp-handle'}));
      const rng=h('input',{type:'range',min:0,max:100,value:50,'aria-label':'Compare'}); const upd=()=>{ s.querySelector('.cmp-top').style.width=rng.value+'%'; s.querySelector('.cmp-handle').style.left=rng.value+'%'; }; rng.addEventListener('input',upd); upd();
      return h('div',{}, s, rng, h('div',{class:'cmp-cap'}, h('span',{},'expected'), h('span',{},'actual'))); },
    side:()=>h('div',{class:'cmp-side'}, ['expected','actual','diff'].filter(k=>set[k]).map(k=>h('figure',{}, h('img',{src:set[k].src,alt:k,onclick:()=>lightbox(set[k].src)}), h('figcaption',{},k)))),
    diff:()=>set.diff? h('figure',{class:'cmp-one'}, h('img',{src:set.diff.src,alt:'diff',onclick:()=>lightbox(set.diff.src)})) : h('p',{style:'color:var(--ink-3)'},'No diff image attached.'),
  };
  let cur='slider';
  const render=()=>{ stage.innerHTML=''; stage.append(views[cur]()); tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===cur)); };
  for(const [v,l] of [['slider','Slider'],['side','Side by side'],['diff','Diff']]) tabs.append(h('button',{class:'tab','data-v':v,onclick:()=>{cur=v;render();}},l));
  wrap.append(tabs,stage); render(); return wrap;
}
function lightbox(src){ const lb=h('div',{class:'lb',onclick:()=>lb.remove()}, h('img',{src})); document.body.append(lb); }
function escape(s){ return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
})();
`;

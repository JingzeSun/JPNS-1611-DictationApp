const fs = require('fs');
const vm = require('vm');

const [sourceFile, outputFile] = process.argv.slice(2);
if (!sourceFile || !outputFile) {
  throw new Error('Usage: node build_vocab_summary.js <practice-html> <summary-html>');
}

const source = fs.readFileSync(sourceFile, 'utf8');
const script = source.split('<script>')[1].split('</script>')[0];
const start = script.indexOf('const items =');
const end = script.indexOf('const names =');
if (start < 0 || end < 0) throw new Error('Could not locate the embedded vocabulary data.');

const sandbox = {};
vm.runInNewContext(script.slice(start, end) + '\nthis.result = items;', sandbox);
const items = sandbox.result;

const groups = [
  {
    key: 'core',
    no: '01',
    title: 'Script 高频词',
    subtitle: 'Slides 中明确出现的 Hiragana reading / writing practice 与复习词。建议优先掌握。'
  },
  {
    key: 'dialogue',
    no: '02',
    title: '对话与课内词汇',
    subtitle: 'Communication slides、Lesson 1–2 对话、购物及点餐表达。'
  },
  {
    key: 'sentences',
    no: '03',
    title: '句子听写',
    subtitle: '从问候、自我介绍、时间、购物与点餐对话中整理的完整句型。'
  },
  {
    key: 'numbers',
    no: '04',
    title: '数字、时间与年龄',
    subtitle: '包含 0–100、百位、千位、时间和年龄中的特殊读法。'
  },
  {
    key: 'supplement',
    no: '05',
    title: '假名覆盖补充词',
    subtitle: '用常见词补齐 slides 词表未覆盖的基础假名、浊音与半浊音。'
  }
];

const escape = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function renderEntry(item, index) {
  const longClass = [...item.kana].length >= 9 ? ' long' : '';
  return `<article class="entry${longClass}">
    <span class="index">${String(index + 1).padStart(2, '0')}</span>
    <div class="wordline"><span class="kana">${escape(item.kana)}</span><span class="romaji">${escape(item.romaji)}</span></div>
    <div class="meaning">${escape(item.meaning)}</div>
    <div class="source">${escape(item.source)}</div>
  </article>`;
}

function renderGroup(group) {
  const groupItems = items.filter(item => item.deck === group.key);
  return `<section class="chapter ${group.key}">
    <header class="chapter-head">
      <div class="chapter-no">${group.no}</div>
      <div><h2>${group.title}</h2><p>${group.subtitle}</p></div>
      <div class="chapter-count">${groupItems.length}<small>条</small></div>
    </header>
    <div class="entries">${groupItems.map(renderEntry).join('')}</div>
  </section>`;
}

const uniqueCount = new Set(items.map(item => item.kana)).size;
const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JPNS1611 Hiragana Vocabulary and Sentence Study Guide</title>
  <style>
    @page { size: A4; margin: 13mm 12mm 15mm; }
    :root { --navy:#12365b; --blue:#236ba6; --pale:#eaf2f8; --gold:#e9ad29; --ink:#142335; --muted:#647184; --line:#d9e1e8; }
    * { box-sizing: border-box; }
    html { background:#dfe6ec; }
    body { margin:0; color:var(--ink); background:white; font-family:"Segoe UI","Microsoft YaHei","Noto Sans CJK SC",sans-serif; }
    .cover { min-height:268mm; padding:20mm 17mm; position:relative; overflow:hidden; page-break-after:always; background:linear-gradient(145deg,#f9f5e9 0 42%,#eef5fa 100%); }
    .cover:before { content:""; position:absolute; width:150mm; height:150mm; border-radius:50%; right:-70mm; top:-70mm; background:rgba(35,107,166,.11); }
    .cover:after { content:"あ"; position:absolute; right:13mm; bottom:-21mm; font:900 118mm/1 "Yu Mincho","Yu Gothic",sans-serif; color:rgba(18,54,91,.055); }
    .course { color:var(--blue); font-size:10pt; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
    .rule { width:22mm; height:2.2mm; margin:10mm 0 9mm; border-radius:3mm; background:var(--gold); }
    h1 { margin:0; max-width:145mm; color:var(--navy); font-size:34pt; line-height:1.08; letter-spacing:.01em; }
    .jp-title { margin:5mm 0 0; color:var(--blue); font:700 20pt/1.3 "Yu Mincho","Yu Gothic",sans-serif; letter-spacing:.09em; }
    .intro { width:130mm; margin-top:13mm; color:var(--muted); font-size:11pt; line-height:1.85; }
    .stats { display:grid; grid-template-columns:repeat(3,1fr); width:150mm; margin-top:17mm; border:1px solid rgba(18,54,91,.14); border-radius:5mm; overflow:hidden; background:rgba(255,255,255,.72); }
    .stat { padding:7mm 6mm; border-right:1px solid rgba(18,54,91,.12); }
    .stat:last-child { border-right:0; }
    .stat strong { display:block; color:var(--navy); font-size:24pt; line-height:1; }
    .stat span { display:block; margin-top:2mm; color:var(--muted); font-size:8.5pt; }
    .guide { position:absolute; left:17mm; right:17mm; bottom:18mm; padding-top:6mm; border-top:1px solid rgba(18,54,91,.18); color:var(--muted); font-size:8.5pt; line-height:1.65; }
    .guide b { color:var(--navy); }
    .chapter { page-break-before:always; }
    .chapter-head { display:grid; grid-template-columns:18mm 1fr 20mm; gap:5mm; align-items:center; min-height:25mm; margin-bottom:7mm; padding:5mm 6mm; border-radius:4mm; background:var(--navy); color:white; }
    .chapter-no { color:var(--gold); font-size:22pt; font-weight:900; }
    .chapter h2 { margin:0; font-size:19pt; line-height:1.15; }
    .chapter-head p { margin:1.5mm 0 0; color:#d9e8f3; font-size:8.2pt; line-height:1.45; }
    .chapter-count { text-align:right; font-size:21pt; font-weight:900; }
    .chapter-count small { display:block; font-size:7pt; font-weight:600; color:#d9e8f3; }
    .dialogue .chapter-head { background:#1a6075; }
    .sentences .chapter-head { background:#704a68; }
    .numbers .chapter-head { background:#61512b; }
    .supplement .chapter-head { background:#44566c; }
    .entries { columns:2; column-gap:8mm; column-rule:1px solid #e6ebef; }
    .entry { position:relative; min-height:24mm; padding:3mm 2mm 3mm 9mm; border-bottom:1px solid var(--line); break-inside:avoid; page-break-inside:avoid; }
    .index { position:absolute; left:0; top:4mm; color:#9aa6b4; font-size:7.5pt; font-variant-numeric:tabular-nums; }
    .wordline { display:flex; align-items:baseline; gap:3mm; }
    .kana { color:var(--navy); font:800 17pt/1.25 "Yu Mincho","Yu Gothic","Noto Sans JP",sans-serif; letter-spacing:.04em; }
    .romaji { color:var(--blue); font-size:8.5pt; font-weight:700; }
    .entry.long .wordline { display:block; }
    .entry.long .kana { display:block; font-size:14pt; white-space:nowrap; letter-spacing:.01em; }
    .entry.long .romaji { display:block; margin-top:.8mm; font-size:7.5pt; }
    .sentences .entry { min-height:28mm; }
    .sentences .entry .wordline { display:block; }
    .sentences .entry .kana { display:block; font-size:12.5pt; white-space:normal; line-height:1.45; }
    .sentences .entry .romaji { display:block; margin-top:.8mm; font-size:7.2pt; line-height:1.35; }
    .meaning { margin-top:1mm; font-size:8.7pt; line-height:1.4; }
    .source { margin-top:1mm; color:#8591a0; font-size:6.8pt; letter-spacing:.02em; }
    @media screen {
      body { width:210mm; margin:8mm auto; box-shadow:0 15px 50px rgba(20,35,53,.18); }
      .chapter { padding:13mm 12mm 15mm; }
    }
    @media print {
      html, body { background:white; }
      .chapter { padding:0; }
    }
  </style>
</head>
<body>
  <section class="cover">
    <div class="course">JPNS1611 · JAPANESE 1 · WEEK 1–4</div>
    <div class="rule"></div>
    <h1>平假名字词与句子总表</h1>
    <div class="jp-title">ひらがな・ことば・ぶん</div>
    <p class="intro">根据当前文件夹中的 Week 1–4 Script 与 Communication tutorial slides 整理。按课程用途分为高频读写词、对话词汇、句子听写、数字表达及假名覆盖补充词，便于集中复习和查阅。</p>
    <div class="stats">
      <div class="stat"><strong>${items.length}</strong><span>学习条目</span></div>
      <div class="stat"><strong>${uniqueCount}</strong><span>不同平假名答案</span></div>
      <div class="stat"><strong>46 / 46</strong><span>基础平假名覆盖</span></div>
    </div>
    <div class="guide"><b>阅读说明：</b>每个条目依次列出平假名、课程式罗马字、中文释义和 slides 来源。长音罗马字沿用课程常见写法，如 <i>oo / ee / uu</i>。片假名专用外来词没有强行改写成平假名。</div>
  </section>
  ${groups.map(renderGroup).join('')}
</body>
</html>`;

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`Wrote ${items.length} entries to ${outputFile}`);

const fs = require('fs');
const vm = require('vm');

const [htmlFile, csvFile] = process.argv.slice(2);
if (!htmlFile || !csvFile) {
  throw new Error('Usage: node export_hiragana_csv.js <html-file> <csv-file>');
}

const html = fs.readFileSync(htmlFile, 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const start = script.indexOf('const items =');
const end = script.indexOf('const names =');
if (start < 0 || end < 0) throw new Error('Could not locate the embedded dictation data.');

const sandbox = {};
vm.runInNewContext(script.slice(start, end) + '\nthis.result = items;', sandbox);
const deckNames = {
  core: 'Script 高频',
  dialogue: '对话与课内词汇',
  sentences: '句子听写',
  katakana: '片假名单词 A–TO',
  grammar: 'Lecture 核心句式',
  numbers: '数字、时间与年龄',
  supplement: '补全假名的常见词'
};

const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const rows = [
  ['编号', '题库', '来源', '中文提示', 'Romaji', '日语答案'],
  ...sandbox.result.map((item, index) => [
    index + 1,
    deckNames[item.deck] || item.deck,
    item.source,
    item.meaning,
    item.romaji,
    item.kana
  ])
];

fs.writeFileSync(csvFile, '\ufeff' + rows.map(row => row.map(quote).join(',')).join('\r\n'), 'utf8');
console.log(`Wrote ${sandbox.result.length} rows to ${csvFile}`);

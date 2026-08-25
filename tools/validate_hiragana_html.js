const fs = require('fs');
const vm = require('vm');

const file = process.argv[2];
if (!file) throw new Error('Usage: node validate_hiragana_html.js <html-file>');

const html = fs.readFileSync(file, 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
new vm.Script(script);

const start = script.indexOf('const items =');
const end = script.indexOf('const names =');
if (start < 0 || end < 0) throw new Error('Could not locate the embedded dataset.');

const sandbox = {};
vm.runInNewContext(script.slice(start, end) + '\nthis.result = items;', sandbox);
const items = sandbox.result;

const basic = [...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'];
const voiced = [...'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ'];
const body = items.map(x => x.kana).join('');
const missingBasic = basic.filter(x => !body.includes(x));
const missingVoiced = voiced.filter(x => !body.includes(x));
const deckCounts = Object.fromEntries(['core','dialogue','sentences','numbers','supplement'].map(deck => [deck, items.filter(x => x.deck === deck).length]));
const duplicates = items.reduce((m, x) => m.set(x.kana, (m.get(x.kana) || 0) + 1), new Map());
const duplicateAnswers = [...duplicates].filter(([, count]) => count > 1).length;

console.log(JSON.stringify({
  syntax: 'ok',
  total: items.length,
  uniqueAnswers: new Set(items.map(x => x.kana)).size,
  duplicateAnswers,
  deckCounts,
  basicCoverage: `${basic.length - missingBasic.length}/${basic.length}`,
  missingBasic,
  voicedCoverage: `${voiced.length - missingVoiced.length}/${voiced.length}`,
  missingVoiced,
  hasSmallTsu: body.includes('っ'),
  hasSmallY: ['ゃ','ゅ','ょ'].every(x => body.includes(x))
}, null, 2));

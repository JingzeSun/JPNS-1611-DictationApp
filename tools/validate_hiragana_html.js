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
const expectedKatakana = [...'アイウエオカキクケコサシスセソタチツテト'];
const body = items.map(item => item.kana).join('');
const katakanaAnswers = items.filter(item => item.deck === 'katakana').map(item => item.kana);
const missingBasic = basic.filter(char => !body.includes(char));
const missingVoiced = voiced.filter(char => !body.includes(char));
const missingKatakana = expectedKatakana.filter(char => !katakanaAnswers.includes(char));
const extraKatakana = katakanaAnswers.filter(char => !expectedKatakana.includes(char));
const deckOrder = ['core', 'dialogue', 'sentences', 'katakana', 'grammar', 'numbers', 'supplement'];
const deckCounts = Object.fromEntries(deckOrder.map(deck => [deck, items.filter(item => item.deck === deck).length]));
const duplicates = items.reduce((map, item) => map.set(item.kana, (map.get(item.kana) || 0) + 1), new Map());
const duplicateAnswers = [...duplicates].filter(([, count]) => count > 1).length;
const badGrammarAnswers = items
  .filter(item => item.deck === 'grammar' && /(^|[^A-Za-z])[NXY]([^A-Za-z]|$)/.test(item.kana))
  .map(item => item.kana);
const ids = items.map(item => item.id);
const sequentialIds = ids.every((id, index) => id === index + 1);

const report = {
  syntax: 'ok',
  total: items.length,
  uniqueAnswers: new Set(items.map(item => item.kana)).size,
  duplicateAnswers,
  deckCounts,
  basicCoverage: `${basic.length - missingBasic.length}/${basic.length}`,
  missingBasic,
  voicedCoverage: `${voiced.length - missingVoiced.length}/${voiced.length}`,
  missingVoiced,
  katakanaCoverage: `${expectedKatakana.length - missingKatakana.length}/${expectedKatakana.length}`,
  missingKatakana,
  extraKatakana,
  grammarAnswersAreWritable: badGrammarAnswers.length === 0,
  badGrammarAnswers,
  sequentialIds,
  hasSmallTsu: body.includes('っ'),
  hasSmallY: ['ゃ', 'ゅ', 'ょ'].every(char => body.includes(char))
};

console.log(JSON.stringify(report, null, 2));
if (missingBasic.length || missingVoiced.length || missingKatakana.length || extraKatakana.length || badGrammarAnswers.length || !sequentialIds) {
  process.exitCode = 1;
}

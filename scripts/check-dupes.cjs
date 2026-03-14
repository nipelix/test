const data = JSON.parse(require('fs').readFileSync('data/countries.json','utf8'));
const names = data.map(c => c.name);
const dupes = names.filter((n, i) => names.indexOf(n) !== i);
console.log('Duplicate names:', [...new Set(dupes)]);
const codes = data.map(c => c.code);
const codeDupes = codes.filter((c, i) => codes.indexOf(c) !== i);
console.log('Duplicate codes:', [...new Set(codeDupes)]);

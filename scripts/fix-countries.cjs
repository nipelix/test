const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/countries.json', 'utf8'));

// Remove duplicate Montenegro (keep the first one at index 32, remove index 120)
const seen = new Set();
const unique = [];
for (const c of data) {
  const key = c.name;
  if (seen.has(key)) {
    console.log('Removing duplicate:', c.name, 'id:', c.id);
    continue;
  }
  seen.add(key);
  unique.push(c);
}

// Re-assign sequential IDs and fix melbet/upgaming/globalbahis
unique.forEach((c, i) => {
  c.id = i + 1;
  c.melbet = [c.id];
  c.upgaming = [c.id];
  c.globalbahis = [c.id];
});

fs.writeFileSync('data/countries.json', JSON.stringify(unique, null, 2));
console.log('Fixed! Total:', unique.length);

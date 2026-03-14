const fs = require('fs');

// Build country ID mapping from countries.json
const countries = JSON.parse(fs.readFileSync('data/countries.json', 'utf8'));
const countryIdByOldId = {};

// The leagues were generated with hardcoded IDs based on assumed positions
// We need to check which IDs actually exist
const existingIds = new Set(countries.map(c => c.id));
console.log('Country IDs range: 1 to', countries.length);

// Find International
const intl = countries.find(c => c.code === 'INT');
console.log('International ID:', intl ? intl.id : 'NOT FOUND');

// Fix leagues - replace countryId 110 with actual International ID
const leagues = JSON.parse(fs.readFileSync('data/leagues.json', 'utf8'));

let fixed = 0;
let missing = new Set();

for (const league of leagues) {
  if (league.countryId === 110 && intl) {
    league.countryId = intl.id;
    fixed++;
  }
  if (!existingIds.has(league.countryId)) {
    missing.add(league.countryId);
  }
}

console.log('Fixed 110->International:', fixed);
console.log('Missing country IDs in leagues:', [...missing]);

// Remove leagues with missing country IDs
const validLeagues = leagues.filter(l => existingIds.has(l.countryId));
console.log('Removed', leagues.length - validLeagues.length, 'leagues with missing country IDs');

// Re-assign sequential IDs
validLeagues.forEach((l, i) => {
  l.id = i + 1;
  l.melbet = [l.id];
  l.upgaming = [l.id];
  l.globalbahis = [l.id];
});

fs.writeFileSync('data/leagues.json', JSON.stringify(validLeagues, null, 2));
console.log('Final leagues count:', validLeagues.length);

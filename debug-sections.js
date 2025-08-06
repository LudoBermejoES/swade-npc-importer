// Debug script to understand how sections are processed
const { getSections } = require('./dist/statBlockParser/getSections.js');
const {
  getListStat,
  ListType,
} = require('./dist/statBlockParser/getListsStats.js');
const {
  getAbilityList,
  AbilityType,
} = require('./dist/statBlockParser/getAbilities.js');

const superHeroStatBlock = `
Captain Thunder
A mighty superhero with control over electricity and storm.

Attributes: Agility d8, Smarts d8, Spirit d10, Strength d12+2, Vigor d10
Skills: Athletics d10, Fighting d10, Flying d8, Notice d8
Pace: 6; Parry: 7; Toughness: 12 (3)
Edges: Combat Reflexes, Level Headed
Super Powers: Flight, Super Attribute (Strength), Toughness, Attack (Ranged, Electricity)
Power Points: 30
Gear: Costume (+3 Armor)
`;

console.log('=== DEBUGGING SUPER POWERS PARSING ===\n');

// Step 1: Get sections
const sections = getSections(superHeroStatBlock);
console.log('1. Sections found:');
sections.forEach((section, index) => {
  console.log(`   [${index}] "${section}"`);
});

// Step 2: Find lines that might match Powers or Super Powers
console.log('\n2. Lines containing "Powers":');
const powerLines = sections.filter(s => s.includes('Powers'));
powerLines.forEach((line, index) => {
  console.log(`   [${index}] "${line}"`);
});

// Step 3: Test Powers parsing
console.log('\n3. Testing Powers parsing:');
try {
  const powers = getListStat(sections, ListType.Powers);
  console.log('   Powers result:', powers);
} catch (error) {
  console.log('   Powers error:', error.message);
}

// Step 4: Test Super Powers parsing
console.log('\n4. Testing Super Powers parsing:');
try {
  const superPowers = getAbilityList(sections, AbilityType.SuperPowers);
  console.log('   Super Powers result:', superPowers);
} catch (error) {
  console.log('   Super Powers error:', error.message);
}

console.log('\n=== END DEBUG ===');

const fs=require('node:fs'),assert=require('node:assert/strict');
const sw=fs.readFileSync('sw.js','utf8'),readme=fs.readFileSync('README.md','utf8'),updates=JSON.parse(fs.readFileSync('updates.json','utf8'));
const match=sw.match(/const CACHE='aegis-(\d+)-/);
assert.ok(match,'Service worker cache must include release version aegis-NN-*');
const version='v'+match[1];
assert.equal(updates.version,version,'updates.json version must match service worker release');
assert.ok(updates.releases?.length,'updates.json needs release entries');
assert.equal(updates.releases[0].version,version,'Newest changelog entry must match deployed release');
assert.ok(readme.split('\n')[0].includes('('+version+')'),'README heading must reflect deployed release');
const seen=new Set();
for(const entry of updates.releases){assert.match(entry.version,/^v\d+$/);assert.ok(!seen.has(entry.version),'Duplicate release '+entry.version);seen.add(entry.version);assert.ok(entry.date&&entry.title&&entry.changes?.length,'Incomplete release '+entry.version)}
console.log('Release metadata aligned:',version,'('+updates.releases.length+' entries)');

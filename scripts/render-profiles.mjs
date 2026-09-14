#!/usr/bin/env node
// Writes .codex/agents/*.toml from team/roles.json. The catalogue is the source; the profile
// is the derived artifact. Run after changing a mission, then review the diff.
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { renderProfile, profileName } from '../src/profiles.mjs';

const root = new URL('../', import.meta.url);
const target = new URL('.codex/agents/', root);
const roles = JSON.parse(readFileSync(new URL('team/roles.json', root), 'utf8'));

const expected = new Set(roles.map(profileName));
for (const existing of readdirSync(target))
  if (!expected.has(existing)) rmSync(new URL(existing, target));

for (const role of roles) {
  writeFileSync(new URL(profileName(role), target), renderProfile(role), 'utf8');
  console.log('escrito: .codex/agents/' + profileName(role));
}

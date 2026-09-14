#!/usr/bin/env node
// Supervisor side. This is the only file allowed to run git, because the judged party must
// not collect the facts about itself: src/ stays pure and only evaluates what arrives here.
//
// It observes and never concludes. Anything it cannot see becomes an absent field, never a
// favourable default — an empty approvals list means "not observed", not "nobody approved".
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
const usage = 'uso: node scripts/observe.mjs <base> <head> [--collector github-actions|local-hook]';

function parse(argv) {
  const positional = [];
  let collector = 'local-hook';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--collector') { collector = argv[++i]; continue; }
    if (argv[i].startsWith('--')) throw new Error(usage);
    positional.push(argv[i]);
  }
  if (positional.length !== 2 || !['github-actions', 'local-hook'].includes(collector)) throw new Error(usage);
  return { base: positional[0], head: positional[1], collector };
}

try {
  const { base, head, collector } = parse(process.argv.slice(2));

  const baseSha = git('rev-parse', base + '^{commit}');
  const headSha = git('rev-parse', head + '^{commit}');
  const range = baseSha + '..' + headSha;
  const changedPaths = git('diff', '--name-only', '--no-renames', baseSha, headSha)
    .split('\n').map(line => line.trim()).filter(Boolean);

  // Declarations are commit trailers, not a mutable file: a change carries its own statement
  // that it touches the control surface, and the statement is as auditable as the diff.
  const body = git('log', '--format=%B%x00', range);
  const declarations = [...new Set([...body.matchAll(/^Control-Surface:\s*(\S+)\s*$/gim)].map(m => m[1]))]
    .map(adr => ({ adr, present: existsSync(adr) }));

  const repository = process.env.GITHUB_REPOSITORY ??
    (git('config', '--get', 'remote.origin.url').match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/)?.[1] ?? '');

  const observation = {
    collector,
    repository,
    baseSha,
    headSha,
    changedPaths,
    declarations,
    author: process.env.OBSERVED_AUTHOR ?? git('log', '-1', '--format=%ae', headSha),
    approvals: (process.env.OBSERVED_APPROVALS ?? '').split(',').map(s => s.trim()).filter(Boolean),
    checks: (process.env.OBSERVED_CHECKS ?? '').split(',').map(s => s.trim()).filter(Boolean)
      .map(entry => {
        const [name, result, evidenceRef] = entry.split(':');
        return { name, result: result ?? 'unknown', evidenceRef: evidenceRef || 'observed:' + name };
      })
  };
  console.log(JSON.stringify(observation, null, 2));
} catch (error) {
  console.error(error.message.startsWith('uso:') ? error.message : 'Falha ao observar o repositório: ' + error.message);
  process.exitCode = 1;
}

import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validatePlan, planWaves, converge } from './policy.mjs';
import { simulate } from './demo.mjs';

async function json(path) {
  if ((await stat(path)).size > 1_000_000) throw new Error('arquivo excede 1 MB');
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch { throw new Error('JSON inválido ou ilegível'); }
}
try {
  const [command, path, ...extra] = process.argv.slice(2);
  if (extra.length || !['validate','plan','converge','simulate'].includes(command) ||
      (command !== 'simulate' && !path) || (command === 'simulate' && path))
    throw new Error('uso: node src/cli.mjs validate|plan|converge <plano.json> OU node src/cli.mjs simulate');
  const policy = await json(new URL('../team/policy.json', import.meta.url));
  const roles = await json(new URL('../team/roles.json', import.meta.url));
  const plan = await json(path ?? fileURLToPath(new URL('../examples/plan.json', import.meta.url)));
  const result = command === 'validate' ? validatePlan(plan, policy, roles)
    : command === 'plan' ? planWaves(plan, policy, roles)
    : command === 'converge' ? converge(plan, policy, roles) : simulate(plan, policy, roles);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.code ? 'Falha ao ler arquivo de entrada/configuração.' : error.message);
  process.exitCode = 1;
}


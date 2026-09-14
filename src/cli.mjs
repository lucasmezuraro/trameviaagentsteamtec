import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validatePlan, planWaves, converge } from './policy.mjs';
import { guard, gateCandidate, CLEAR } from './gate.mjs';
import { simulate } from './demo.mjs';

const USAGE = [
  'uso:',
  '  node src/cli.mjs validate|plan|converge <plano.json>',
  '  node src/cli.mjs simulate',
  '  node src/cli.mjs guard <observacao.json>',
  '  node src/cli.mjs gate <observacao.json> <plano.json> <TASK-ID>'
].join('\n');

const ARITY = {validate:1, plan:1, converge:1, simulate:0, guard:1, gate:3};

async function json(path) {
  if ((await stat(path)).size > 1_000_000) throw new Error('arquivo excede 1 MB');
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch { throw new Error('JSON inválido ou ilegível'); }
}
try {
  const [command, ...args] = process.argv.slice(2);
  if (!Object.hasOwn(ARITY, command ?? '') || args.length !== ARITY[command]) throw new Error(USAGE);
  const policy = await json(new URL('../team/policy.json', import.meta.url));
  const roles = await json(new URL('../team/roles.json', import.meta.url));
  const plan = async (path) => json(path ?? fileURLToPath(new URL('../examples/plan.json', import.meta.url)));

  let result;
  if (command === 'validate') result = validatePlan(await plan(args[0]), policy, roles);
  else if (command === 'plan') result = planWaves(await plan(args[0]), policy, roles);
  else if (command === 'converge') result = converge(await plan(args[0]), policy, roles);
  else if (command === 'simulate') result = simulate(await plan(), policy, roles);
  else if (command === 'guard') result = guard(await json(args[0]), policy);
  else result = gateCandidate(await json(args[0]), await plan(args[1]), args[2], policy, roles);

  console.log(JSON.stringify(result, null, 2));
  // A gate that only reports is a gate nobody obeys: refusal has to cost an exit code.
  if ((command === 'guard' || command === 'gate') && result.status !== CLEAR) process.exitCode = 1;
} catch (error) {
  console.error(error.code ? 'Falha ao ler arquivo de entrada/configuração.' : error.message);
  process.exitCode = 1;
}

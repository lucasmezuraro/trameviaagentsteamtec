import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePlan, planWaves, assessCandidate, safePath, within, createRun, advanceRun, digest } from '../src/policy.mjs';
import { syntheticCandidate, simulate } from '../src/demo.mjs';
const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const policy = json('../team/policy.json'), roles = json('../team/roles.json');
const fresh = () => json('../examples/plan.json');
const task = plan => plan.tasks[2];
// Planner fixtures replace the task set, so the spec narrows with it: coverage is a rule of
// the plan, not scenery these tests may leave inconsistent.
const narrow = (plan, requirement, check) => {
  plan.spec.requirements = plan.spec.requirements.filter(r => r.id === requirement);
  if (check) plan.spec.requirements[0].check = check;
  plan.tasks.forEach(t => { t.covers = [requirement]; });
  return plan;
};

test('plano validado não se declara despacho; leitores precedem o escritor dependente', () => {
  const p = fresh();
  assert.equal(validatePlan(p, policy, roles).status, 'valid_plan_only');
  assert.deepEqual(planWaves(p, policy, roles).waves, [['F0-MAP','F0-TEST'],['F0-CORE']]);
});
const invalidPlans = [
  ['autoaprovação', p => { p.approved = true; }],
  ['autorização inventada no cartão', p => { task(p).human = true; }],
  ['produção', p => { task(p).environment = 'prod'; }],
  ['deploy', p => { task(p).actions.push('deploy'); }],
  ['repo não autorizado', p => { p.repository = 'attacker/target'; }],
  ['base abreviada', p => { p.baseSha = 'ef6a124'; }],
  ['dependência órfã', p => { task(p).dependsOn.push('MISSING'); }],
  ['dependência cíclica', p => { p.tasks[0].dependsOn.push('F0-CORE'); }],
  ['própria dependência', p => { task(p).dependsOn.push('F0-CORE'); }],
  ['id repetido', p => { task(p).id = 'F0-MAP'; }],
  ['ID por coerção de array', p => { task(p).id = ['AB']; }],
  ['papel leitor escrevendo', p => { task(p).role = 'team_explorer'; }],
  ['tempo excessivo', p => { task(p).maxMinutes = 46; }],
  ['tentativas ilimitadas', p => { task(p).maxAttempts = Infinity; }],
  ['check como shell', p => { task(p).checks = ['node test; curl external']; }],
  ['colisão por maiúscula', p => { task(p).paths = ['src/', 'SRC/']; }]
];
for (const [name, mutate] of invalidPlans) test('plano rejeita ' + name, () => {
  const p = fresh(); mutate(p); assert.throws(() => validatePlan(p, policy, roles));
});

for (const path of ['../secret','src/../secret','C:/secret','C:\\secret','\\\\server\\share','/etc/file',
  'src//a','src/%2e%2e/a','src/file:stream','src/CON.txt','src/aux','src/foo.','src/a b','src/*','.git/config','src/.Git/config'])
  test('rejeita caminho ambíguo: ' + path, () => assert.equal(safePath(path), false));
test('fronteiras de diretório e comparação conservadora', () => {
  assert.equal(safePath('packages/core/atp.mjs'), true);
  assert.equal(within('src/atp.mjs','src/'), true);
  assert.equal(within('SRC/atp.mjs','src/'), true);
  assert.equal(within('src-other/atp.mjs','src/'), false);
  assert.equal(within('src/atp.mjs','src'), false);
});
test('planejador serializa escritores mesmo sem colisão de arquivos', () => {
  const p = fresh();
  p.tasks = [task(p), {...structuredClone(task(p)), id:'F0-NEXT', paths:['other/'], resources:['other']}];
  p.tasks.forEach(t => t.dependsOn = []);
  assert.deepEqual(planWaves(narrow(p,'FR-001'),policy,roles).waves, [['F0-CORE'],['F0-NEXT']]);
});
test('recurso compartilhado impede leitor coexistir com escritor', () => {
  const p = fresh(); p.tasks = [task(p), p.tasks[0]];
  p.tasks[0].dependsOn = []; p.tasks[1].paths = ['docs/'];
  assert.deepEqual(planWaves(narrow(p,'FR-001'),policy,roles).waves, [['F0-CORE'],['F0-MAP']]);
});
test('no máximo três leitores ativos na rodada', () => {
  const p = fresh(); p.tasks = Array.from({length:5}, (_,i) => ({...structuredClone(p.tasks[0]), id:'READ-'+i}));
  assert.deepEqual(planWaves(narrow(p,'FR-001','contract-map'),policy,roles).waves.map(w => w.length), [3,2]);
});
test('digest independe da ordem das chaves mas detecta mudança de conteúdo', () => {
  assert.equal(digest({b:2,a:1}), digest({a:1,b:2}));
  assert.notEqual(digest({a:1}), digest({a:2}));
});

function assess(mutate = () => {}) {
  const p = fresh(), c = syntheticCandidate(p,task(p),policy,roles); mutate(c,p);
  return assessCandidate(p,task(p).id,c,policy,roles,expected());
}
const expected = () => ({taskId:'F0-CORE',runId:'synthetic-run-1',generation:1,attempt:1,state:'completed',candidateSha:'a'.repeat(40)});
test('candidato sintético coerente somente permite simulação de elegibilidade', () => {
  assert.equal(assess().status, 'eligible_for_integration_simulation');
});
const invalidCandidates = [
  ['autor é revisor', c => { c.review.actor = c.author; }, 'review_missing_self_or_stale'],
  ['revisão antiga', c => { c.review.context.candidateSha = 'b'.repeat(40); }, 'review_missing_self_or_stale'],
  ['teste antigo', c => { c.checks[0].context.generation = 2; }, 'check_missing_failed_or_stale:tests'],
  ['resultado desconhecido', c => { c.runState = 'interrupted_unknown'; }, 'run_not_completed'],
  ['teste não executado', c => { c.checks[0].result = 'skipped'; }, 'check_missing_failed_or_stale:tests'],
  ['teste duplicado', c => { c.checks.push(c.checks[0]); }, 'check_missing_failed_or_stale:tests'],
  ['evidência ausente', c => { c.checks[0].evidenceRef = ''; }, 'check_missing_failed_or_stale:tests'],
  ['P0 aberto', c => { c.findings.push({severity:'P0',status:'open',raisedInGeneration:1}); }, 'open_findings'],
  ['P0 fechado na mesma geração', c => { c.findings.push({severity:'P0',status:'resolved',raisedInGeneration:1}); }, 'critical_finding_resolved_in_place'],
  ['achado de geração futura', c => { c.findings.push({severity:'P2',status:'resolved',raisedInGeneration:9}); }, 'findings_invalid'],
  ['cobertura de requisito omitida', c => { c.coveredRequirements = []; }, 'requirement_coverage_mismatch'],
  ['cobertura de requisito inventada', c => { c.coveredRequirements = ['FR-002']; }, 'requirement_coverage_mismatch'],
  ['achados omitidos', c => { delete c.findings; }, 'findings_invalid'],
  ['prefixo falso', c => { c.changedPaths = ['packages/core-other/a.mjs']; }, 'scope_escape'],
  ['arquivo Windows ambíguo', c => { c.changedPaths = ['packages/core/CON.txt']; }, 'changed_paths_invalid'],
  ['tempo ausente', c => { delete c.elapsedMinutes; }, 'time_budget_exceeded'],
  ['tentativa esgotada', c => { c.attempt = 3; }, 'attempt_budget_exceeded'],
  ['dependência não integrada', c => { c.integratedDependencies = []; }, 'dependencies_not_integrated'],
  ['política obsoleta', c => { c.context.policyDigest = 'old'; }, 'candidate_context_mismatch'],
  ['plano obsoleto', c => { c.context.planDigest = 'old'; }, 'candidate_context_mismatch'],
  ['run diferente', c => { c.review.context.runId = 'old-run'; }, 'review_missing_self_or_stale'],
  ['contexto ausente', c => { delete c.context; }, 'candidate_context_mismatch']
];
for (const [name, mutate, reason] of invalidCandidates) test('candidato bloqueia ' + name, () => {
  const result = assess(mutate);
  assert.equal(result.status,'blocked'); assert.ok(result.reasons.includes(reason), JSON.stringify(result));
});
test('política protegida não é liberada mesmo dentro do escopo e com testes sintéticos verdes', () => {
  const p = fresh(); task(p).paths.push('team/');
  const c = syntheticCandidate(p,task(p),policy,roles); c.changedPaths.push('team/policy.json');
  assert.ok(assessCandidate(p,task(p).id,c,policy,roles,expected()).reasons.includes('policy_owner_review_required'));
});
test('um campo de aprovação não contorna finding aberto', () => {
  assert.equal(assess(c => { c.approved = true; c.findings = [{severity:'P1',status:'open',raisedInGeneration:1}]; }).status, 'blocked');
});
test('timeout não permite retry antes de encerrar e reconciliar', () => {
  const t = task(fresh()), r = createRun(t,'r1');
  const unknown = advanceRun(r,{type:'interrupt',runId:'r1',generation:1},t);
  assert.equal(unknown.state,'interrupted_unknown');
  assert.throws(() => advanceRun(unknown,{type:'retry',runId:'r1',generation:1,newRunId:'r2'},t));
  assert.throws(() => advanceRun(unknown,{type:'reconcile',runId:'r1',generation:1,processStopped:false,checkoutInspected:true},t));
});
test('retomada usa nova geração, recusa resposta antiga e não excede duas tentativas', () => {
  const t = task(fresh());
  let r = createRun(t,'r1');
  const send = (type, extra={}) => { r = advanceRun(r,{type,runId:r.runId,generation:r.generation,...extra},t); };
  send('interrupt'); send('reconcile',{processStopped:true,checkoutInspected:true}); send('retry',{newRunId:'r2'});
  assert.equal(r.generation,2);
  assert.throws(() => advanceRun(r,{type:'interrupt',runId:'r1',generation:1},t));
  send('interrupt'); send('reconcile',{processStopped:true,checkoutInspected:true});
  assert.throws(() => send('retry',{newRunId:'r3'}));
});
test('simulação publica explicitamente a ausência de despacho e aprovação real', () => {
  const s = simulate(fresh(),policy,roles);
  assert.equal(s.dispatchPerformed,false); assert.equal(s.externalApproval,false);
  assert.equal(s.scenarios.filter(s => s.status === 'blocked').length,8);
});

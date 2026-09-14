import { fail, object, nonempty, integer, unique, keys, list, digest } from './schema.mjs';
import { validateSpec, coverage, coverageGaps } from './spec.mjs';

const sha = (value) => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
// Canonical JSON identifies content only; it does not authenticate its author.
export { digest };

export function safePath(path) {
  if (typeof path !== 'string' || !path || path.length > 240 || path.startsWith('/') ||
      !/^[A-Za-z0-9._/-]+$/.test(path)) return false;
  const parts = path.replace(/\/$/, '').split('/');
  return parts.every(part => part && part !== '.' && part !== '..' && part.toLowerCase() !== '.git' &&
    (!/^\.env(?:\.|$)/i.test(part) || part.toLowerCase() === '.env.example') &&
    !part.endsWith('.') && !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part));
}
export function within(path, scope) {
  // Conservative case-insensitive comparison for cross-platform plans.
  const p = path.toLowerCase(), s = scope.toLowerCase();
  return p === s || (s.endsWith('/') && p.startsWith(s));
}
export const overlap = (a, b) => a.replace(/\/$/,'').toLowerCase() === b.replace(/\/$/,'').toLowerCase() || within(a, b) || within(b, a);
export const isWriter = (task) => task.actions.some(a => a === 'edit' || a === 'test');

export function validatePlan(plan, policy, roles) {
  keys(plan, ['version', 'repository', 'baseSha', 'policyDigest', 'spec', 'tasks'], 'plano');
  if (plan.version !== 2 || !policy.repositories.includes(plan.repository) || !sha(plan.baseSha))
    fail('versão, repositório ou base inválidos');
  // The plan is bound to the governance version it was authorized under. Changing policy or
  // roles invalidates plans in flight instead of silently widening what they may do.
  if (plan.policyDigest !== digest(policy)) fail('plano fixado em outra versão de política');
  const spec = validateSpec(plan.spec);
  if (!Array.isArray(plan.tasks) || !integer(plan.tasks.length, policy.maxTasks)) fail('quantidade de tarefas inválida');
  const ids = plan.tasks.map(t => t?.id);
  if (!unique(ids)) fail('IDs duplicados');
  for (const task of plan.tasks) {
    keys(task, ['id','objective','role','dependsOn','paths','resources','actions','environment','covers','checks','maxAttempts','maxMinutes'], 'tarefa');
    if (typeof task.id !== 'string' || !/^[A-Z][A-Z0-9-]{1,39}$/.test(task.id) || !nonempty(task.objective)) fail('ID ou objetivo inválido');
    const role = roles.find(r => r.id === task.role);
    if (!role) fail('papel desconhecido');
    for (const name of ['paths','resources','actions','covers','checks']) list(task[name], name);
    list(task.dependsOn, 'dependências', {empty:true});
    if (task.dependsOn.some(d => !ids.includes(d) || d === task.id)) fail('dependência ausente ou própria');
    if (!task.paths.every(safePath) || !unique(task.paths.map(p => p.toLowerCase()))) fail('caminho inseguro ou ambíguo');
    if (!task.resources.every(r => /^[a-z][a-z0-9-]{0,59}$/.test(r))) fail('recurso inválido');
    if (!task.checks.every(c => /^[a-z][a-z0-9-]{0,59}$/.test(c))) fail('check deve ser identificador, não comando');
    if (!task.covers.every(c => spec.requirements.includes(c))) fail('tarefa cobre requisito inexistente: ' + task.id);
    if (!task.actions.every(a => policy.actions.includes(a)) || !policy.environments.includes(task.environment))
      fail('ação ou ambiente proibido');
    if (isWriter(task) && role.sandbox !== 'workspace-write') fail('papel de leitura não pode escrever/testar');
    if (!integer(task.maxAttempts, policy.maxAttempts) || !integer(task.maxMinutes, policy.maxMinutes))
      fail('orçamento excede política');
  }
  const gaps = coverageGaps(plan.spec, plan.tasks);
  if (gaps.length) fail('lacuna de cobertura: ' + gaps.map(g => g.kind + '(' + g.subject + ')').join('; '));
  const resolved = new Set();
  while (resolved.size < ids.length) {
    const ready = plan.tasks.filter(t => !resolved.has(t.id) && t.dependsOn.every(d => resolved.has(d)));
    if (!ready.length) fail('ciclo de dependências');
    ready.forEach(t => resolved.add(t.id));
  }
  return {status:'valid_plan_only', planDigest:digest(plan), specDigest:digest(plan.spec),
    policyDigest:digest(policy), rolesDigest:digest(roles)};
}

// Reporting counterpart of the coverage rule: it describes drift without blocking, so a
// spec can be inspected before it is authorized. It never states that work happened.
export function converge(plan, policy, roles) {
  let planStatus = 'valid_plan_only';
  try { validatePlan(plan, policy, roles); }
  catch (error) { planStatus = 'blocked: ' + error.message; }
  const spec = object(plan) && object(plan.spec) ? plan.spec : {requirements: []};
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : [];
  const usable = Array.isArray(spec.requirements) && spec.requirements.every(r => object(r) && nonempty(r.id));
  const rows = usable ? coverage(spec, tasks) : [];
  const gaps = usable ? coverageGaps(spec, tasks) : [];
  return {status:'coverage_report_only', planStatus, requirements:rows, gaps,
    metrics:{requirements:rows.length, tasks:tasks.length,
      evidenced:rows.filter(r => r.evidenced).length, gaps:gaps.length}};
}

export function planWaves(plan, policy, roles) {
  validatePlan(plan, policy, roles);
  const done = new Set(), waves = [];
  while (done.size < plan.tasks.length) {
    const selected = [];
    for (const task of plan.tasks) {
      if (done.has(task.id) || !task.dependsOn.every(d => done.has(d)) || selected.length >= policy.maxActive) continue;
      if (isWriter(task) && selected.filter(isWriter).length >= policy.maxWriters) continue;
      if (selected.some(other => (isWriter(task) || isWriter(other)) &&
          (task.paths.some(a => other.paths.some(b => overlap(a,b))) ||
           task.resources.some(r => other.resources.includes(r))))) continue;
      selected.push(task);
    }
    if (!selected.length) fail('política não permite progresso');
    waves.push(selected.map(t => t.id));
    selected.forEach(t => done.add(t.id));
  }
  return {status:'hypothetical_waves_not_dispatch', waves};
}

export function createRun(task, runId) {
  if (!object(task) || typeof task.id !== 'string' || !/^[A-Z][A-Z0-9-]{1,39}$/.test(task.id) ||
      !integer(task.maxAttempts,2)) fail('tarefa de run inválida');
  if (!nonempty(runId)) fail('run_id inválido');
  return {taskId:task.id, runId, generation:1, attempt:1, state:'running'};
}
// Synthetic protocol: supplied facts are not observations of actual processes.
export function advanceRun(run, event, task) {
  keys(run, ['taskId','runId','generation','attempt','state'], 'run');
  if (!nonempty(run.runId) || !integer(run.generation,100000) || !integer(run.attempt,task.maxAttempts)) fail('run inválido');
  if (!object(event)) fail('evento inválido');
  const fields = {interrupt:[],complete:[],reconcile:['processStopped','checkoutInspected'],retry:['newRunId']};
  if (typeof event.type !== 'string' || !Object.hasOwn(fields,event.type)) fail('tipo de evento inválido');
  keys(event, ['type','runId','generation',...fields[event.type]], 'evento');
  if (task.id !== run.taskId) fail('tarefa de run diferente');
  if (event.runId !== run.runId || event.generation !== run.generation) fail('evento de run/geração obsoleto');
  if (event.type === 'interrupt' && run.state === 'running')
    return {...run, state:'interrupted_unknown'};
  if (event.type === 'complete' && run.state === 'running')
    return {...run, state:'completed'};
  if (event.type === 'reconcile' && run.state === 'interrupted_unknown') {
    if (event.processStopped !== true || event.checkoutInspected !== true) fail('escritor ainda pode estar ativo');
    return {...run, state:'blocked'};
  }
  if (event.type === 'retry' && run.state === 'blocked') {
    if (run.attempt >= task.maxAttempts) fail('tentativas esgotadas');
    if (!nonempty(event.newRunId) || event.newRunId === run.runId) fail('novo run_id obrigatório');
    return {...run, runId:event.newRunId, generation:run.generation+1, attempt:run.attempt+1, state:'running'};
  }
  fail('transição proibida');
}

export function assessCandidate(plan, taskId, candidate, policy, roles, expectedRun) {
  validatePlan(plan, policy, roles);
  const task = plan.tasks.find(t => t.id === taskId);
  if (!task) fail('tarefa ausente');
  const reasons = [];
  const reject = (condition, reason) => { if (condition) reasons.push(reason); };
  if (!object(candidate)) return {status:'blocked', reasons:['candidate_missing']};
  const c = candidate;
  const context = c.context;
  try {
    keys(c, ['context','author','runState','attempt','elapsedMinutes','changedPaths','integratedDependencies','coveredRequirements','checks','review','findings'], 'candidato');
    keys(context, ['taskId','repository','baseSha','candidateSha','planDigest','policyDigest','rolesDigest','runId','generation'], 'contexto');
    if (!Array.isArray(c.checks) || !Array.isArray(c.findings)) fail('evidência inválida');
    for (const check of c.checks) keys(check, ['name','context','result','evidenceRef'], 'check');
    keys(c.review, ['context','actor','result','evidenceRef'], 'revisão');
    for (const finding of c.findings) keys(finding, ['severity','status','raisedInGeneration'], 'achado');
  } catch { reasons.push('candidate_schema_invalid'); }
  reject(!object(expectedRun) || expectedRun.taskId !== taskId || expectedRun.runId !== context?.runId ||
    expectedRun.generation !== context?.generation || expectedRun.candidateSha !== context?.candidateSha ||
    expectedRun.attempt !== c.attempt || expectedRun.state !== 'completed', 'current_run_mismatch');
  if (!object(context) || context.taskId !== taskId || context.repository !== plan.repository ||
      context.baseSha !== plan.baseSha || !sha(context.candidateSha) || context.planDigest !== digest(plan) ||
      context.policyDigest !== digest(policy) || context.rolesDigest !== digest(roles) || !nonempty(context.runId) || !integer(context.generation, 100000))
    reasons.push('candidate_context_mismatch');
  reject(!nonempty(c.author), 'author_missing');
  reject(c.runState !== 'completed', 'run_not_completed');
  reject(!Number.isFinite(c.elapsedMinutes) || c.elapsedMinutes < 0 || c.elapsedMinutes > task.maxMinutes, 'time_budget_exceeded');
  reject(!integer(c.attempt, task.maxAttempts), 'attempt_budget_exceeded');
  reject(!Array.isArray(c.integratedDependencies) ||
    task.dependsOn.some(d => !c.integratedDependencies.includes(d)), 'dependencies_not_integrated');
  // Traceability is declared by the candidate and confronted with the authorized plan;
  // a partial or invented claim of coverage blocks instead of being interpreted.
  reject(!Array.isArray(c.coveredRequirements) || !c.coveredRequirements.every(nonempty) ||
    !unique(c.coveredRequirements) || c.coveredRequirements.length !== task.covers.length ||
    !task.covers.every(id => c.coveredRequirements.includes(id)), 'requirement_coverage_mismatch');
  const changed = c.changedPaths;
  if (!Array.isArray(changed) || !changed.every(p => safePath(p) && !p.endsWith('/')) ||
      !unique(changed.map(p => p.toLowerCase()))) reasons.push('changed_paths_invalid');
  else {
    reject(changed.length > 0 && !task.actions.includes('edit'), 'unexpected_write');
    reject(changed.some(p => !task.paths.some(s => within(p,s))), 'scope_escape');
    reject(changed.some(p => policy.protectedPaths.some(s => within(p,s))), 'policy_owner_review_required');
  }
  const matches = (e) => object(context) && object(e) && object(e.context) && digest(e.context) === digest(context);
  // Checks that refute a requirement this task claims are required even if the task card
  // forgot to list them; the requirement, not the card, is the source of the obligation.
  const fromRequirements = plan.spec.requirements.filter(r => task.covers.includes(r.id)).map(r => r.check)
    .filter(check => task.checks.includes(check));
  const required = [...new Set([...policy.requiredChecks, ...task.checks, ...fromRequirements])];
  for (const check of required.filter(k => k !== 'review')) {
    const records = Array.isArray(c.checks) ? c.checks.filter(e => object(e) && e.name === check) : [];
    reject(records.length !== 1 || !matches(records[0]) || records[0].result !== 'passed' || !nonempty(records[0].evidenceRef),
      'check_missing_failed_or_stale:' + check);
  }
  const review = c.review;
  reject(!matches(review) || review.result !== 'passed' || !nonempty(review.actor) ||
    review.actor === c.author || !nonempty(review.evidenceRef), 'review_missing_self_or_stale');
  if (!Array.isArray(c.findings) || c.findings.some(f => !object(f) || !['P0','P1','P2'].includes(f.severity) ||
      !['open','resolved'].includes(f.status) || !integer(f.raisedInGeneration, 100000) ||
      f.raisedInGeneration > (object(context) ? context.generation : 0))) reasons.push('findings_invalid');
  else {
    reject(c.findings.some(f => f.status === 'open'), 'open_findings');
    // A blocking finding is settled by a new candidate, never by reinterpreting it in place.
    reject(c.findings.some(f => f.severity === 'P0' && f.status === 'resolved' &&
      f.raisedInGeneration >= context.generation), 'critical_finding_resolved_in_place');
  }
  return {status:reasons.length ? 'blocked' : 'eligible_for_integration_simulation', reasons};
}

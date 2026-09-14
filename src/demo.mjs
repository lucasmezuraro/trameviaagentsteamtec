import { assessCandidate, createRun, advanceRun, digest } from './policy.mjs';

// Synthetic facts only. No repository, test runner, reviewer or process is contacted.
export function syntheticCandidate(plan, task, policy, roles) {
  const context = {
    taskId:task.id, repository:plan.repository, baseSha:plan.baseSha,
    candidateSha:'a'.repeat(40), planDigest:digest(plan), policyDigest:digest(policy), rolesDigest:digest(roles),
    runId:'synthetic-run-1', generation:1
  };
  return {
    context, author:'synthetic-author', runState:'completed', attempt:1, elapsedMinutes:12,
    changedPaths:['packages/core/atp.mjs'], integratedDependencies:[...task.dependsOn],
    coveredRequirements:[...task.covers],
    checks:[...new Set([...policy.requiredChecks, ...task.checks])].filter(k => k !== 'review')
      .map(name => ({name, context:{...context}, result:'passed', evidenceRef:'synthetic:check/'+name})),
    review:{context:{...context}, actor:'synthetic-reviewer', result:'passed', evidenceRef:'synthetic:review'},
    findings:[]
  };
}
export function simulate(plan, policy, roles) {
  const task = plan.tasks.find(t => t.id === 'F0-CORE');
  const candidate = syntheticCandidate(plan, task, policy, roles);
  const expectedRun = {taskId:task.id, runId:'synthetic-run-1', generation:1, attempt:1, state:'completed', candidateSha:'a'.repeat(40)};
  const scenarios = [
    ['candidato coerente', () => {}],
    ['revisor é o autor', c => { c.review.actor = c.author; }],
    ['revisão do commit anterior', c => { c.review.context.candidateSha = 'b'.repeat(40); }],
    ['tentativa de alterar política', c => { c.changedPaths.push('team/policy.json'); }],
    ['teste obrigatório falhou', c => { c.checks[0].result = 'failed'; }],
    ['dependência não integrada', c => { c.integratedDependencies = []; }],
    ['tempo esgotado', c => { c.elapsedMinutes = 46; }],
    ['requisito do cartão não rastreado', c => { c.coveredRequirements = []; }],
    ['achado P0 fechado no próprio candidato', c => { c.findings = [{severity:'P0', status:'resolved', raisedInGeneration:1}]; }]
  ].map(([name, mutate]) => {
    const c = structuredClone(candidate); mutate(c);
    return {name, ...assessCandidate(plan, task.id, c, policy, roles, expectedRun)};
  });
  const run = createRun(task, 'synthetic-run-1');
  const stopped = advanceRun(run, {type:'interrupt', runId:run.runId, generation:1}, task);
  scenarios.push({name:'timeout impede retry até reconciliação', status:stopped.state});
  return {mode:'offline_simulation', dispatchPerformed:false, externalApproval:false, scenarios};
}

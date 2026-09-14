// Gate layer: evaluates an observation of a real change, collected by the supervisor,
// against the policy and against an authorized plan. It stays pure — it never runs git,
// never reads the repository and never contacts a provider. The separation is deliberate:
// whoever is being judged does not get to collect the facts about itself.
//
// Nothing here authenticates anyone. Every fact the collector could not observe is listed
// as unverified instead of being assumed in favour of the change. A clear result therefore
// says "nothing refutable was refuted", never "this is approved".
import { fail, nonempty, unique, keys, list } from './schema.mjs';
import { validatePlan, safePath, within } from './policy.mjs';

const SHA = /^[a-f0-9]{40}$/;
const ADR = /^docs\/adr\/\d{4}-[a-z0-9-]+\.md$/;
const COLLECTORS = ['github-actions', 'local-hook', 'fixture'];

export const CLEAR = 'clear_on_observable_facts';

export function validateObservation(observation) {
  keys(observation, ['collector','repository','baseSha','headSha','changedPaths','declarations','author','approvals','checks'], 'observação');
  if (!COLLECTORS.includes(observation.collector)) fail('coletor desconhecido');
  if (!nonempty(observation.repository)) fail('repositório ausente');
  if (!SHA.test(observation.baseSha) || !SHA.test(observation.headSha)) fail('SHA abreviado ou ausente');
  if (observation.baseSha === observation.headSha) fail('base e candidato iguais: nada a avaliar');
  // Zero changed paths is a fact, not a malformed observation: a range can legitimately
  // touch nothing, and calling that "invalid" would hide it behind a schema error.
  if (!Array.isArray(observation.changedPaths) || observation.changedPaths.length > 5000 ||
      !observation.changedPaths.every(p => safePath(p) && !p.endsWith('/')) ||
      !unique(observation.changedPaths.map(p => p.toLowerCase()))) fail('caminhos observados inválidos');
  if (!Array.isArray(observation.declarations)) fail('declarações inválidas');
  for (const declaration of observation.declarations) {
    keys(declaration, ['adr','present'], 'declaração');
    if (typeof declaration.adr !== 'string' || !ADR.test(declaration.adr)) fail('declaração não aponta um ADR: ' + declaration.adr);
    if (typeof declaration.present !== 'boolean') fail('presença do ADR precisa ser observada, não suposta');
  }
  if (typeof observation.author !== 'string') fail('autor inválido');
  list(observation.approvals, 'aprovações', { empty: true });
  if (!Array.isArray(observation.checks)) fail('checks inválidos');
  for (const check of observation.checks) {
    keys(check, ['name','result','evidenceRef'], 'check');
    if (!/^[a-z][a-z0-9-]{0,59}$/.test(check.name)) fail('check deve ser identificador, não comando');
    if (!['passed','failed','skipped','unknown'].includes(check.result)) fail('resultado de check inválido');
    if (!nonempty(check.evidenceRef)) fail('check sem referência de evidência');
  }
  if (!unique(observation.checks.map(c => c.name))) fail('check duplicado: qual deles vale?');
  return true;
}

const touches = (paths, scopes) => paths.filter(path => scopes.some(scope => within(path, scope)));

// An approval only counts when the collector could name who gave it and that person is not
// the author. A local hook can never establish this, so it reports the fact as unverifiable.
function reviewState(observation) {
  const independent = observation.approvals.filter(actor => actor !== observation.author);
  if (observation.collector === 'local-hook') return { verified: false, note: 'review_not_observable_locally' };
  if (!independent.length) return { verified: false, note: 'review_not_observed' };
  return { verified: true, note: null };
}

// Guard protects this repository's own control surface. It is the only rule here that bites
// without an authorized plan, because changing the rules must be harder than obeying them.
export function guard(observation, policy) {
  const reasons = [], unverified = [];
  try { validateObservation(observation); }
  catch (error) { return { status: 'blocked', reasons: ['observation_invalid: ' + error.message], unverified: [], controlSurface: [] }; }

  if (!policy.repositories.includes(observation.repository)) reasons.push('repository_not_authorized');
  const controlSurface = touches(observation.changedPaths, policy.protectedPaths);
  const declared = observation.declarations.filter(d => d.present);
  if (controlSurface.length) {
    if (!observation.declarations.length) reasons.push('control_surface_without_declaration');
    else if (!declared.length) reasons.push('declared_adr_missing');
  }
  for (const check of observation.checks)
    if (check.result === 'failed') reasons.push('check_failed:' + check.name);

  const review = reviewState(observation);
  if (!review.verified) unverified.push(review.note);
  unverified.push('sandbox_isolation', 'actor_identity');
  if (controlSurface.length && declared.length) unverified.push('adr_content_not_read');
  return { status: reasons.length ? 'blocked' : CLEAR, reasons, unverified, controlSurface };
}

// Gate confronts the observation with the plan that authorized the work. It is the
// non-synthetic sibling of assessCandidate: same questions, facts collected instead of supplied.
export function gateCandidate(observation, plan, taskId, policy, roles) {
  const reasons = [], unverified = [];
  try { validateObservation(observation); }
  catch (error) { return { status: 'blocked', reasons: ['observation_invalid: ' + error.message], unverified: [], task: null }; }
  try { validatePlan(plan, policy, roles); }
  catch (error) { return { status: 'blocked', reasons: ['plan_invalid: ' + error.message], unverified: [], task: null }; }

  const task = plan.tasks.find(t => t.id === taskId);
  if (!task) return { status: 'blocked', reasons: ['task_not_in_plan'], unverified: [], task: null };

  if (observation.repository !== plan.repository) reasons.push('repository_mismatch');
  if (observation.baseSha !== plan.baseSha) reasons.push('base_mismatch');
  if (observation.changedPaths.length && !task.actions.includes('edit')) reasons.push('unexpected_write');
  const escaped = observation.changedPaths.filter(path => !task.paths.some(scope => within(path, scope)));
  if (escaped.length) reasons.push('scope_escape:' + escaped.slice(0, 5).join(','));

  const controlSurface = touches(observation.changedPaths, policy.protectedPaths);
  if (controlSurface.length && !observation.declarations.some(d => d.present)) reasons.push('policy_owner_review_required');

  const fromRequirements = plan.spec.requirements
    .filter(r => task.covers.includes(r.id) && task.checks.includes(r.check)).map(r => r.check);
  const required = [...new Set([...policy.requiredChecks, ...task.checks, ...fromRequirements])].filter(name => name !== 'review');
  for (const name of required) {
    const record = observation.checks.find(c => c.name === name);
    if (!record) reasons.push('check_not_observed:' + name);
    else if (record.result !== 'passed') reasons.push('check_not_passed:' + name);
  }

  const review = reviewState(observation);
  if (review.verified) {
    if (roles.find(r => r.id === task.role)?.sandbox !== 'workspace-write' && observation.changedPaths.length)
      reasons.push('read_only_role_wrote');
  } else unverified.push(review.note);
  // The plan says which requirements this work owes; the observation cannot prove they were
  // met, only that the checks able to refute them ran. Say exactly that.
  unverified.push('requirements_met', 'sandbox_isolation', 'actor_identity');
  return { status: reasons.length ? 'blocked' : CLEAR, reasons, unverified, task: task.id, covers: [...task.covers] };
}

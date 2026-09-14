// Spec layer adapted from github/spec-kit (spec-template and analyze): the requirement
// exists before the plan and stays traceable to the evidence that would refute it.
// This module states intent and detects gaps. It does not dispatch, approve or execute.
import { fail, keys, list, nonempty, unique, integer, object } from './schema.mjs';

const REQUIREMENT = /^FR-\d{3}$/;
const CRITERION = /^SC-\d{3}$/;
const IDENTIFIER = /^[a-z][a-z0-9-]{0,59}$/;

// Stems of words that describe a wish instead of an observable outcome, plus the
// placeholders spec-kit leaves behind. Written without diacritics; text is folded first.
const VAGUE = ['rapid', 'escalav', 'robust', 'otimiz', 'adequad', 'eficien', 'flexiv', 'amigav',
  'intuitiv', 'performat', 'moderno', 'melhor', 'razoav', 'etc', 'needs clarification', 'tbd', 'a definir'];

const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function observable(text, label) {
  const folded = fold(text);
  const hit = VAGUE.find(stem => new RegExp('(^|[^a-z])' + stem).test(folded));
  if (hit) fail('enunciado não observável em ' + label + ': termo vago "' + hit + '"');
}

// A spec that still carries an open question must not reach the plan. The gate is the
// point of the clarify step: an agent may act alone only where nothing was left implicit.
export function validateSpec(spec) {
  keys(spec, ['clarifications', 'requirements', 'successCriteria'], 'spec');
  list(spec.clarifications, 'dúvidas', { empty: true });
  if (spec.clarifications.length) fail('dúvida aberta bloqueia o plano: ' + spec.clarifications.length + ' pendência(s)');
  if (!Array.isArray(spec.successCriteria) || !integer(spec.successCriteria.length, 60)) fail('critérios: lista inválida');
  if (!Array.isArray(spec.requirements) || !integer(spec.requirements.length, 60)) fail('requisitos: lista inválida');

  for (const criterion of spec.successCriteria) {
    keys(criterion, ['id', 'statement', 'measure'], 'critério');
    if (typeof criterion.id !== 'string' || !CRITERION.test(criterion.id) ||
        !nonempty(criterion.statement) || !nonempty(criterion.measure)) fail('critério inválido');
    if (!/\d/.test(criterion.measure)) fail('critério sem grandeza mensurável: ' + criterion.id);
    observable(criterion.statement + ' ' + criterion.measure, criterion.id);
  }
  const criteria = spec.successCriteria.map(c => c.id);
  if (!unique(criteria)) fail('critérios duplicados');

  for (const requirement of spec.requirements) {
    keys(requirement, ['id', 'statement', 'criterion', 'check'], 'requisito');
    if (typeof requirement.id !== 'string' || !REQUIREMENT.test(requirement.id) ||
        !nonempty(requirement.statement)) fail('requisito inválido');
    if (!criteria.includes(requirement.criterion)) fail('requisito sem critério existente: ' + requirement.id);
    if (typeof requirement.check !== 'string' || !IDENTIFIER.test(requirement.check))
      fail('evidência deve ser identificador, não comando: ' + requirement.id);
    observable(requirement.statement, requirement.id);
  }
  const requirements = spec.requirements.map(r => r.id);
  if (!unique(requirements)) fail('requisitos duplicados');

  const claimed = new Set(spec.requirements.map(r => r.criterion));
  const orphans = criteria.filter(id => !claimed.has(id));
  if (orphans.length) fail('critério sem requisito: ' + orphans.join(', '));
  return { requirements, criteria };
}

// Coverage is reported, never inferred: a requirement is only evidenced when some task
// that claims it also declares the check able to refute it.
export function coverage(spec, tasks) {
  return spec.requirements.map(requirement => {
    const owners = tasks.filter(task => Array.isArray(task?.covers) && task.covers.includes(requirement.id));
    return {
      requirement: requirement.id,
      criterion: requirement.criterion,
      check: requirement.check,
      tasks: owners.map(task => task.id),
      evidenced: owners.some(task => Array.isArray(task.checks) && task.checks.includes(requirement.check))
    };
  });
}

export function coverageGaps(spec, tasks) {
  const declared = new Set(spec.requirements.map(r => r.id));
  const gaps = [];
  for (const row of coverage(spec, tasks)) {
    if (!row.tasks.length) gaps.push({ severity: 'P0', kind: 'requirement_without_task', subject: row.requirement });
    else if (!row.evidenced) gaps.push({ severity: 'P0', kind: 'requirement_without_evidence', subject: row.requirement });
  }
  for (const task of tasks) {
    if (!object(task) || !Array.isArray(task.covers)) continue;
    if (!task.covers.length) gaps.push({ severity: 'P1', kind: 'task_without_requirement', subject: task.id });
    for (const id of task.covers)
      if (!declared.has(id)) gaps.push({ severity: 'P0', kind: 'unknown_requirement', subject: task.id + ' → ' + id });
  }
  return gaps;
}

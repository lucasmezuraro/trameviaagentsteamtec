import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePlan, converge, digest } from '../src/policy.mjs';
import { validateSpec, coverage, coverageGaps, observable } from '../src/spec.mjs';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const policy = json('../team/policy.json'), roles = json('../team/roles.json');
const fresh = () => json('../examples/plan.json');
const spec = () => fresh().spec;

test('o plano de exemplo está fixado na política vigente', () => {
  assert.equal(fresh().policyDigest, digest(policy));
});
test('plano da versão anterior não passa a valer por omissão', () => {
  const p = fresh(); p.version = 1;
  assert.throws(() => validatePlan(p, policy, roles));
});
test('mudança de política invalida plano em voo em vez de ampliar o que ele pode fazer', () => {
  const widened = {...policy, actions:[...policy.actions, 'deploy']};
  assert.throws(() => validatePlan(fresh(), widened, roles), /outra versão de política/);
});

const invalidSpecs = [
  ['dúvida aberta bloqueia o despacho', s => { s.clarifications.push('qual é o teto por variação?'); }],
  ['requisito vago não é observável', s => { s.requirements[0].statement = 'O cálculo deve ser eficiente'; }],
  ['marcador do gerador não sobrevive à revisão', s => { s.requirements[0].statement = 'Publicar quota [NEEDS CLARIFICATION: qual teto?]'; }],
  ['lista aberta esconde requisito', s => { s.requirements[0].statement = 'Reduzir quota, saldo, etc'; }],
  ['critério sem grandeza não é mensurável', s => { s.successCriteria[0].measure = 'nenhuma venda acima do disponível'; }],
  ['critério vago', s => { s.successCriteria[0].statement = 'A loja fica mais rápida'; }],
  ['requisito aponta critério inexistente', s => { s.requirements[0].criterion = 'SC-404'; }],
  ['critério sem requisito', s => { s.successCriteria.push({id:'SC-002', statement:'Sem dono', measure:'1 vez'}); }],
  ['requisito duplicado', s => { s.requirements[1].id = 'FR-001'; }],
  ['identificador fora do padrão', s => { s.requirements[0].id = 'REQ-1'; }],
  ['evidência como comando', s => { s.requirements[0].check = 'node --test; curl externo'; }],
  ['campo desconhecido no requisito', s => { s.requirements[0].approved = true; }],
  ['espec vazia', s => { s.requirements = []; }]
];
for (const [name, mutate] of invalidSpecs) test('spec rejeita ' + name, () => {
  const s = spec(); mutate(s); assert.throws(() => validateSpec(s));
});
test('spec coerente devolve apenas os identificadores declarados', () => {
  assert.deepEqual(validateSpec(spec()), {requirements:['FR-001','FR-002'], criteria:['SC-001']});
});
test('termo vago é detectado sem depender de acento ou caixa', () => {
  assert.throws(() => observable('Resposta RÁPIDA', 'X'), /termo vago/);
  assert.throws(() => observable('sistema robusto', 'X'), /termo vago/);
  assert.doesNotThrow(() => observable('reduz a quota até caber no saldo', 'X'));
});
test('palavra que apenas contém o radical não é falso positivo', () => {
  assert.doesNotThrow(() => observable('o pedido inclui um prazo', 'X'));
});

const invalidPlans = [
  ['tarefa sem requisito', p => { p.tasks[2].covers = []; }],
  ['tarefa cobre requisito inexistente', p => { p.tasks[2].covers = ['FR-404']; }],
  ['requisito sem tarefa', p => { p.spec.requirements.push({id:'FR-003', statement:'O cálculo deve registrar a origem do saldo', criterion:'SC-001', check:'ledger-trace'}); }],
  ['requisito sem evidência declarada', p => { p.tasks[2].checks = ['outra-coisa']; }],
  ['cobertura duplicada na mesma tarefa', p => { p.tasks[2].covers = ['FR-001','FR-001']; }]
];
for (const [name, mutate] of invalidPlans) test('plano rejeita ' + name, () => {
  const p = fresh(); mutate(p); assert.throws(() => validatePlan(p, policy, roles));
});

test('cobertura relata a tarefa e a evidência de cada requisito', () => {
  const p = fresh();
  assert.deepEqual(coverage(p.spec, p.tasks)[0],
    {requirement:'FR-001', criterion:'SC-001', check:'quota-invariant', tasks:['F0-MAP','F0-CORE'], evidenced:true});
});
test('requisito coberto sem o check que o refutaria conta como lacuna', () => {
  const p = fresh(); p.tasks[2].checks = ['outra-coisa'];
  assert.deepEqual(coverageGaps(p.spec, p.tasks).map(g => g.kind), ['requirement_without_evidence']);
});
test('converge relata a lacuna em vez de lançar, e não afirma que houve trabalho', () => {
  const p = fresh(); p.tasks[2].covers = [];
  const report = converge(p, policy, roles);
  assert.equal(report.status, 'coverage_report_only');
  assert.match(report.planStatus, /^blocked: /);
  assert.ok(report.gaps.some(g => g.kind === 'task_without_requirement'));
  assert.equal(report.metrics.requirements, 2);
});
test('converge sobrevive a plano estruturalmente quebrado', () => {
  const report = converge({version:2}, policy, roles);
  assert.equal(report.status, 'coverage_report_only');
  assert.deepEqual(report.metrics, {requirements:0, tasks:0, evidenced:0, gaps:0});
});
test('o digest da spec muda quando o requisito muda', () => {
  const p = fresh(), before = validatePlan(p, policy, roles).specDigest;
  p.spec.requirements[0].statement += ' e registrar o componente limitante';
  assert.notEqual(validatePlan(p, policy, roles).specDigest, before);
});

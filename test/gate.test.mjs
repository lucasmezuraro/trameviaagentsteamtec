import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { guard, gateCandidate, validateObservation, CLEAR } from '../src/gate.mjs';
import { renderProfile, profileName } from '../src/profiles.mjs';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const policy = json('../team/policy.json'), roles = json('../team/roles.json');
const plan = () => json('../examples/plan.json');
const fresh = () => json('../examples/observation.json');
const self = (mutate = () => {}) => {
  const observation = {...fresh(), repository:'lucasmezuraro/trameviaagentsteamtec', changedPaths:['README.md']};
  mutate(observation);
  return observation;
};

test('observação coerente sobre arquivo comum não é bloqueada', () => {
  const result = guard(self(), policy);
  assert.equal(result.status, CLEAR, JSON.stringify(result));
  assert.deepEqual(result.controlSurface, []);
});
test('resultado limpo nunca se declara aprovado', () => {
  assert.equal(CLEAR, 'clear_on_observable_facts');
});

const invalidObservations = [
  ['campo desconhecido', o => { o.approved = true; }],
  ['SHA abreviado', o => { o.baseSha = 'ef6a124'; }],
  ['base igual ao candidato', o => { o.headSha = o.baseSha; }],
  ['coletor inventado', o => { o.collector = 'trust-me'; }],
  ['caminho fora da árvore', o => { o.changedPaths = ['../outro/a.mjs']; }],
  ['diretório como caminho alterado', o => { o.changedPaths = ['src/']; }],
  ['caminho duplicado por caixa', o => { o.changedPaths = ['README.md','readme.md']; }],
  ['declaração que não é ADR', o => { o.declarations = [{adr:'confie-em-mim', present:true}]; }],
  ['presença do ADR suposta', o => { o.declarations = [{adr:'docs/adr/0002-x.md', present:'sim'}]; }],
  ['check como comando', o => { o.checks = [{name:'node --test; curl x', result:'passed', evidenceRef:'r'}]; }],
  ['check sem evidência', o => { o.checks = [{name:'tests', result:'passed', evidenceRef:''}]; }],
  ['check duplicado', o => { o.checks = [...o.checks, o.checks[0]]; }],
  ['resultado de check inventado', o => { o.checks[0].result = 'provavelmente'; }]
];
for (const [name, mutate] of invalidObservations) test('observação rejeita ' + name, () => {
  assert.throws(() => validateObservation(self(mutate)));
  assert.equal(guard(self(mutate), policy).status, 'blocked');
});

test('superfície de controle sem declaração é bloqueada', () => {
  const result = guard(self(o => { o.changedPaths = ['src/policy.mjs']; }), policy);
  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.includes('control_surface_without_declaration'));
  assert.deepEqual(result.controlSurface, ['src/policy.mjs']);
});
test('declarar um ADR que não existe na árvore não libera', () => {
  const result = guard(self(o => {
    o.changedPaths = ['team/policy.json'];
    o.declarations = [{adr:'docs/adr/0099-inexistente.md', present:false}];
  }), policy);
  assert.ok(result.reasons.includes('declared_adr_missing'));
});
test('declaração presente libera a superfície, mas o conteúdo do ADR fica não verificado', () => {
  const result = guard(self(o => {
    o.changedPaths = ['.github/workflows/ci.yml'];
    o.declarations = [{adr:'docs/adr/0002-portoes-executaveis-e-missoes.md', present:true}];
  }), policy);
  assert.equal(result.status, CLEAR);
  assert.ok(result.unverified.includes('adr_content_not_read'));
});
test('cada diretório novo da superfície protegida é reconhecido', () => {
  for (const path of ['scripts/observe.mjs','hooks/pre-push','procedures/exploration.md'])
    assert.deepEqual(guard(self(o => { o.changedPaths = [path]; }), policy).controlSurface, [path]);
});
test('repositório fora da política é bloqueado mesmo com tudo o resto correto', () => {
  assert.ok(guard(self(o => { o.repository = 'attacker/target'; }), policy).reasons.includes('repository_not_authorized'));
});
test('check falho bloqueia e diz qual', () => {
  assert.ok(guard(self(o => { o.checks[0].result = 'failed'; }), policy).reasons.includes('check_failed:tests'));
});
test('hook local não consegue observar revisão e admite isso', () => {
  const result = guard(self(o => { o.collector = 'local-hook'; }), policy);
  assert.ok(result.unverified.includes('review_not_observable_locally'));
  assert.ok(result.unverified.includes('actor_identity'));
});
test('aprovação do próprio autor não conta como revisão observada', () => {
  const result = guard(self(o => { o.author = 'a@b.invalid'; o.approvals = ['a@b.invalid']; }), policy);
  assert.ok(result.unverified.includes('review_not_observed'));
});

test('candidato observado dentro do cartão passa nos fatos observáveis', () => {
  const result = gateCandidate(fresh(), plan(), 'F0-CORE', policy, roles);
  assert.equal(result.status, CLEAR, JSON.stringify(result));
  assert.deepEqual(result.covers, ['FR-001']);
});
test('gate nunca afirma que o requisito foi atendido', () => {
  assert.ok(gateCandidate(fresh(), plan(), 'F0-CORE', policy, roles).unverified.includes('requirements_met'));
});
const invalidCandidates = [
  ['base diferente da autorizada', o => { o.baseSha = 'c'.repeat(40); }, 'base_mismatch'],
  ['outro repositório', o => { o.repository = 'lucasmezuraro/trameviaagentsteamtec'; }, 'repository_mismatch'],
  ['escrita fora do escopo do cartão', o => { o.changedPaths = ['packages/outro/a.mjs']; }, 'scope_escape:packages/outro/a.mjs'],
  ['prefixo falso do diretório permitido', o => { o.changedPaths = ['packages/core-other/a.mjs']; }, 'scope_escape:packages/core-other/a.mjs'],
  ['check exigido não observado', o => { o.checks = o.checks.filter(c => c.name !== 'quota-invariant'); }, 'check_not_observed:quota-invariant'],
  ['check exigido pulado', o => { o.checks.find(c => c.name === 'scope').result = 'skipped'; }, 'check_not_passed:scope']
];
for (const [name, mutate, reason] of invalidCandidates) test('gate bloqueia ' + name, () => {
  const observation = fresh(); mutate(observation);
  const result = gateCandidate(observation, plan(), 'F0-CORE', policy, roles);
  assert.equal(result.status, 'blocked');
  assert.ok(result.reasons.includes(reason), JSON.stringify(result));
});
test('gate bloqueia tarefa que não está no plano autorizado', () => {
  assert.deepEqual(gateCandidate(fresh(), plan(), 'F0-INVENTADA', policy, roles).reasons, ['task_not_in_plan']);
});
test('gate recusa plano inválido antes de julgar o candidato', () => {
  const broken = plan(); broken.spec.clarifications.push('falta decidir o teto');
  assert.match(gateCandidate(fresh(), broken, 'F0-CORE', policy, roles).reasons[0], /^plan_invalid: /);
});
test('papel de leitura que escreveu é bloqueado quando a revisão foi observada', () => {
  const observation = {...fresh(), collector:'github-actions'};
  const result = gateCandidate(observation, plan(), 'F0-MAP', policy, roles);
  assert.ok(result.reasons.includes('unexpected_write'));
});

test('perfis do host são exatamente o que o catálogo gera', () => {
  const target = new URL('../.codex/agents/', import.meta.url);
  assert.deepEqual(readdirSync(target).sort(), roles.map(profileName).sort());
  for (const role of roles)
    assert.equal(readFileSync(new URL(profileName(role), target), 'utf8').replace(/\r\n/g, '\n'),
      renderProfile(role), role.id + ': perfil fora de sincronia; rode scripts/render-profiles.mjs');
});
test('toda missão é completa e aponta um procedimento existente', () => {
  for (const role of roles) {
    for (const field of ['mission','entry','output','done','stop','forbidden'])
      assert.ok(typeof role[field] === 'string' && role[field].trim().length > 20, role.id + '.' + field);
    assert.match(role.procedure, /^procedures\/[a-z-]+\.md$/);
    assert.ok(existsSync(new URL('../' + role.procedure, import.meta.url)), role.procedure);
    assert.ok(Array.isArray(role.skills) && role.skills.length, role.id + '.skills ausente');
    for (const skill of role.skills)
      assert.ok(existsSync(new URL('../.agents/skills/' + skill + '/SKILL.md', import.meta.url)),
        role.id + ': skill ausente: ' + skill);
    assert.ok(['read-only','workspace-write'].includes(role.sandbox));
  }
  assert.equal(roles.filter(r => r.sandbox === 'workspace-write').length, 1, 'mais de um papel com escrita');
});
test('papéis mantêm cobertura mínima para os riscos do MVP', () => {
  const required = {
    team_explorer: ['tramevia-architecture-discovery','tramevia-data-tenancy','tramevia-integration-reliability'],
    team_test_designer: ['tramevia-quality-assurance','tramevia-data-tenancy','tramevia-integration-reliability','tramevia-resilience-recovery'],
    team_implementer: ['tramevia-node-web','tramevia-data-tenancy','tramevia-integration-reliability','tramevia-ci-cd-supply-chain'],
    team_security_reviewer: ['tramevia-security-review','tramevia-data-tenancy','tramevia-integration-reliability','tramevia-ci-cd-supply-chain'],
    team_delivery_reviewer: ['tramevia-quality-assurance','tramevia-security-review','tramevia-resilience-recovery','tramevia-ci-cd-supply-chain']
  };
  for (const [roleId, skills] of Object.entries(required)) {
    const role = roles.find(item => item.id === roleId);
    assert.ok(role, roleId + ': papel ausente');
    for (const skill of skills)
      assert.ok(role.skills.includes(skill), roleId + ': skill essencial ausente: ' + skill);
  }
});
test('texto de missão com aspas quebraria o perfil e é recusado na geração', () => {
  assert.throws(() => renderProfile({...roles[0], mission:'faça "tudo"'}), /aspas/);
});

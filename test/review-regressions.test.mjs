import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { assessCandidate, createRun, advanceRun, overlap, planWaves, safePath } from '../src/policy.mjs';
import { syntheticCandidate } from '../src/demo.mjs';
const json = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const policy = json('../team/policy.json'), roles = json('../team/roles.json'), plan = json('../examples/plan.json');
const task = plan.tasks[2];
const expected = {taskId:task.id,runId:'synthetic-run-1',generation:1,attempt:1,state:'completed',candidateSha:'a'.repeat(40)};
const fresh = () => syntheticCandidate(plan,task,policy,roles);
const assess = (c, e=expected, r=roles) => assessCandidate(plan,task.id,c,policy,r,e);
test('pacote antigo internamente coerente falha contra o run atual', () => {
  const e = {...expected,runId:'run-2',generation:2,attempt:2};
  assert.ok(assess(fresh(),e).reasons.includes('current_run_mismatch'));
});
test('run atual precisa vir separadamente; candidato não prova sua vigência', () => {
  assert.equal(assessCandidate(plan,task.id,fresh(),policy,roles).status,'blocked');
});
test('SHA do candidato precisa coincidir com o observado pelo supervisor', () => {
  assert.ok(assess(fresh(),{...expected,candidateSha:'b'.repeat(40)}).reasons.includes('current_run_mismatch'));
});
test('processo observado como unknown não é completado por alegação do autor', () => {
  assert.ok(assess(fresh(),{...expected,state:'interrupted_unknown'}).reasons.includes('current_run_mismatch'));
});
test('mudança de catálogo invalida candidato mesmo sem mudar policy.json', () => {
  const r = structuredClone(roles); r[0].sandbox = 'workspace-write';
  assert.ok(assess(fresh(),expected,r).reasons.includes('candidate_context_mismatch'));
});
for (const [name, mutation] of [
  ['check nulo', c => { c.checks = [null]; }],
  ['review nulo', c => { c.review = null; }],
  ['finding nulo', c => { c.findings = [null]; }],
  ['aprovação extra', c => { c.approved = true; }],
  ['campo extra no check', c => { c.checks[0].approved = true; }],
  ['campo extra no contexto', c => { c.context.authorized = true; }]
]) test('evidência malformada bloqueia sem exceção: '+name, () => {
  const c = fresh(); mutation(c);
  const result = assess(c); assert.equal(result.status,'blocked');
  assert.ok(result.reasons.includes('candidate_schema_invalid'));
});
test('tentativa nula não pode renovar orçamento por coerção', () => {
  const r = {...createRun(task,'r1'),state:'blocked',attempt:null};
  assert.throws(() => advanceRun(r,{type:'retry',runId:'r1',generation:1,newRunId:'r2'},task));
});
test('evento desconhecido ou campo extra não muda estado', () => {
  const r = createRun(task,'r1');
  assert.throws(() => advanceRun(r,{type:['complete'],runId:'r1',generation:1},task));
  assert.throws(() => advanceRun(r,{type:'complete',runId:'r1',generation:1,approved:true},task));
  assert.throws(() => createRun({id:['AB'],maxAttempts:2},'r1'));
});
test('arquivo e diretório homônimos disputam reserva, prefixo diferente não', () => {
  assert.equal(overlap('src','src/'),true);
  assert.equal(overlap('src','src-other/'),false);
  const p = structuredClone(plan);
  p.tasks = [p.tasks[2],p.tasks[0]]; p.tasks[0].dependsOn = [];
  p.tasks[0].paths = ['src/']; p.tasks[1].paths = ['src'];
  p.tasks[0].resources = ['writer']; p.tasks[1].resources = ['reader'];
  assert.deepEqual(planWaves(p,policy,roles).waves,[['F0-CORE'],['F0-MAP']]);
});
test('catálogo e perfis Codex permanecem alinhados', () => {
  assert.equal(readdirSync(new URL('../.codex/agents/',import.meta.url)).length, roles.length);
  for (const role of roles) {
    const profile = readFileSync(new URL('../.codex/agents/'+role.id+'.toml',import.meta.url),'utf8');
    assert.ok(profile.includes('name = "'+role.id+'"'));
    assert.ok(profile.includes('sandbox_mode = "'+role.sandbox+'"'));
    assert.ok(profile.includes('developer_instructions = """'));
    assert.ok(profile.includes('description = "'));
    assert.ok(!/^model\s*=/m.test(profile),'herdar modelo da sessão');
  }
});
test('nomes convencionais de ambiente real ficam fora do escopo; exemplo pode entrar', () => {
  assert.equal(safePath('.env'),false);
  assert.equal(safePath('apps/web/.ENV.production'),false);
  assert.equal(safePath('.env.example'),true);
});
test('links locais dos documentos apontam para arquivos existentes', () => {
  const root = new URL('../',import.meta.url);
  const paths = ['README.md',...readdirSync(new URL('docs/',root)).filter(p=>p.endsWith('.md')).map(p=>'docs/'+p)];
  for (const path of paths) {
    const url = new URL(path,root), body=readFileSync(url,'utf8');
    for (const match of body.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      assert.ok(existsSync(new URL(match[1].split('#')[0],url)),path+': '+match[1]);
    }
  }
});

// Reproduções de auditoria: executa apenas módulos locais e fixtures em memória.
// Não é suíte de aceitação: `reproduced` significa lacuna presente, não sistema aprovado.
// Uso: node docs/evidence/maturity-probes.mjs
import {readFileSync} from 'node:fs';
import {guard, gateCandidate, CLEAR} from '../../src/gate.mjs';
import {validatePlan, assessCandidate, digest} from '../../src/policy.mjs';
import {syntheticCandidate} from '../../src/demo.mjs';
const json = path => JSON.parse(readFileSync(new URL('../../' + path, import.meta.url), 'utf8'));
const policy = json('team/policy.json'), roles = json('team/roles.json');
const plan = () => json('examples/plan.json');
const observation = () => json('examples/observation.json');
const results = [];

const skillsObservation = {...observation(), repository:'lucasmezuraro/trameviaagentsteamtec',
  changedPaths:['.agents/skills/tramevia-security-review/SKILL.md'], declarations:[], checks:[]};
const skillGuard = guard(skillsObservation, policy);
results.push({id:'M01', defect:'skill_without_control_surface', reproduced:skillGuard.status === CLEAR && skillGuard.controlSurface.length === 0, actual:skillGuard});

// O conteúdo de SKILL.md sequer é argumento da API. Não adulteramos o arquivo real.
const skillsBefore = {name:'tramevia-security-review', content:'limite inicial'};
const skillsAfter = {...skillsBefore, content:'limite diferente'};
results.push({id:'M02', defect:'skill_content_not_bound_to_plan',
  reproduced:digest(skillsBefore) !== digest(skillsAfter) && validatePlan(plan(),policy,roles).status === 'valid_plan_only',
  actual:{contentChanged:true, rolesDigestUnchanged:true, planStatus:validatePlan(plan(),policy,roles).status},
  limitation:'Demonstra a ausência do conteúdo na entrada do validador; não ensaia o host.'});

// Um leitor declara o check do requisito; o escritor pode omiti-lo de sua entrega.
const p = plan();
p.tasks[0].checks.push('quota-invariant');
p.tasks[2].checks = ['unrelated-check'];
const task = p.tasks[2], candidate = syntheticCandidate(p,task,policy,roles);
const expected = {taskId:task.id,runId:'synthetic-run-1',generation:1,attempt:1,state:'completed',candidateSha:'a'.repeat(40)};
const assessed = assessCandidate(p,task.id,candidate,policy,roles,expected);
const obs = observation();
obs.checks = obs.checks.filter(check => check.name !== 'quota-invariant');
obs.checks.push({name:'unrelated-check',result:'passed',evidenceRef:'fixture:unrelated'});
const gated = gateCandidate(obs,p,task.id,policy,roles);
results.push({id:'M03',defect:'writer_requirement_check_can_be_omitted',
  reproduced:assessed.status === 'eligible_for_integration_simulation' && gated.status === CLEAR,
  actual:{plan:validatePlan(p,policy,roles).status,writerChecks:task.checks,assessed:assessed.status,gated:gated.status}});

// O texto numérico é uma heurística, não um oráculo semântico.
const vague = plan();
vague.spec.successCriteria[0].measure = 'banana 1';
let accepted = false;
try { accepted = validatePlan(vague,policy,roles).status === 'valid_plan_only'; } catch {}
results.push({id:'M04',defect:'numeric_text_is_not_measurable_acceptance',reproduced:accepted,
  actual:{measure:vague.spec.successCriteria[0].measure,accepted},limitation:'Limitação da heurística; requer revisão semântica independente.'});

const o = {...observation(), approvals:[], collector:'github-actions'};
const clear = gateCandidate(o,plan(),'F0-CORE',policy,roles);
results.push({id:'M05',limitation:'clear_is_not_integration_authorization',
  reproduced:clear.status === CLEAR && clear.unverified.includes('review_not_observed'),actual:clear});

console.log(JSON.stringify({mode:'audit_counterexamples_only',target:'65ace38dd1977755dda42291c0f52252df8f7186',
  acceptancePassed:false,results},null,2));

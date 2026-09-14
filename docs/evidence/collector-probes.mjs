// Auditoria do coletor real em repositório temporário inteiramente sintético.
// Não toca no Git do produto/time, não acessa rede e não remove diretórios.
// Uso: node docs/evidence/collector-probes.mjs
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const fixture = mkdtempSync(join(tmpdir(),'tramevia-maturity-'));
const git = (...args) => execFileSync('git',args,{cwd:fixture,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
git('init','--quiet');
git('config','user.name','Synthetic audit fixture');
git('config','user.email','audit@example.invalid');
git('config','commit.gpgsign','false');
writeFileSync(join(fixture,'README.md'),'synthetic base\n');
git('add','README.md'); git('commit','--quiet','-m','synthetic base');
const base = git('rev-parse','HEAD');
mkdirSync(join(fixture,'src'));
writeFileSync(join(fixture,'src','example.mjs'),'// synthetic control surface\n');
git('add','src/example.mjs');
const adr = 'docs/adr/0099-synthetic-audit.md';
git('commit','--quiet','-m','synthetic candidate','-m','Control-Surface: '+adr);
const head = git('rev-parse','HEAD');
let adrInHead = true;
try { git('cat-file','-e',head+':'+adr); } catch { adrInHead = false; }
mkdirSync(join(fixture,'docs','adr'),{recursive:true});
writeFileSync(join(fixture,adr),'# Untracked synthetic ADR\n');
const expectedRef = 'https://github.com/example/repo/actions/runs/123';
const collector = fileURLToPath(new URL('../../scripts/observe.mjs',import.meta.url));
const observed = JSON.parse(execFileSync(process.execPath,[collector,base,head,'--collector','local-hook'],{
  cwd:fixture,encoding:'utf8',env:{...process.env,GITHUB_REPOSITORY:'lucasmezuraro/trameviaagentsteamtec',
    OBSERVED_AUTHOR:'synthetic-author',OBSERVED_APPROVALS:'',OBSERVED_CHECKS:'tests:passed:'+expectedRef}
}));
console.log(JSON.stringify({mode:'collector_audit_only',acceptancePassed:false,fixture,
  results:[
    {id:'M06',defect:'untracked_adr_counted_as_candidate_content',reproduced:!adrInHead && observed.declarations[0]?.present === true,
      actual:{adrInHead,observedPresent:observed.declarations[0]?.present}},
    {id:'M07',defect:'evidence_url_truncated',reproduced:observed.checks[0]?.evidenceRef !== expectedRef,
      actual:{expected:expectedRef,observed:observed.checks[0]?.evidenceRef}}
  ]},null,2));

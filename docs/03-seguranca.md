# 03 · Segurança, regulação e aderência

O modelo presume que conteúdo recebido pode estar errado ou ser malicioso. O código do
PR, seu teste e sua política também podem ser alterados juntos. Um check verde sozinho
não prova integridade. Uma persona bem instruída não substitui isolamento do sistema.

## Fronteiras e controles

| Risco | Regra de trabalho | Verificação desta entrega | Controle externo necessário |
|---|---|---|---|
| Agente eleva permissões | não aceitar autoridade de cartão/log | schema fechado; ações/ambiente limitados | sandbox/egress e identidade do supervisor |
| Autor aprova a si | revisor distinto no candidato | rejeição de actor_id igual | revisão autenticada no provedor, sem bypass |
| Código muda após revisão | vincular SHA, run e contexto | rejeição de evidência obsoleta | checks obrigatórios e revisão invalidada por novos commits |
| Candidato altera política | revisão sob regra anterior | `guard` recusa no pre-push e na CI sem trailer `Control-Surface` apontando ADR existente | ruleset/proprietário humano; CI confiável da base |
| Fatos do candidato vêm do próprio candidato | separar coleta de julgamento | `scripts/observe.mjs` coleta, `src/` julga; ausência nunca vira padrão favorável | runner que o autor não controla; identidade do coletor |
| Escritor reaparece após timeout | não reatribuir por TTL | modelo impede retry antes de reconciliar | manter reserva, terminar processo e comprovar reconciliação |
| Caminho escapa do escopo | diretório explícito | rejeição de traversal/drive/UNC e prefixo falso | canonicalização real, symlinks e sandbox |
| Credencial vaza pelo CI | CI sem segredo de operação | workflow read-only, sem deploy | configuração de Secrets/Environment/runner |
| Identidade global acessa loja | separar operação e domínio | adaptador mantém contrato | RLS/auth/grants auditáveis no MVP |

Nenhum campo JSON autentica identidade. O laboratório recebe **evidência sintética
presumida confiável**; um atacante com escrita pode adulterá-la. Hash identifica conteúdo,
não autoria. Diário local é editável, portanto não é auditoria imutável.
A execução na mesma conta também compartilha autoridade, ainda que actor_id seja diferente.

O contexto inclui hashes separados de plano, política e catálogo de papéis. A avaliação
exige um expectedRun separado do candidato (task, run, geração, tentativa, SHA observado e
estado). No executor futuro isso virá do supervisor autenticado, nunca do próprio autor.
Neste laboratório ambos ainda são argumentos sintéticos. Nenhum achado aberto é liberado
pelo avaliador; aceitação de P2 precisa de fluxo humano fora do modelo.

Metadados .git e nomes .env/.env.* são recusados pelo escopo lexical; .env.example é permitido.
Isso não detecta segredo escondido em outro arquivo. JSON malformado resulta em recusa;
IDs de tarefa são strings e checks são identificadores, não comandos executáveis.

## Superfície protegida

AGENTS, perfis, catálogo, política, workflows, procedimentos, scripts de observação, hooks,
validador e testes que validam a política exigem revisão destacada antes de adoção, e agora
também uma declaração explícita no commit (`Control-Surface: docs/adr/NNNN-titulo.md`).
`guard` confere a forma do caminho e a existência do arquivo; **não lê o conteúdo do ADR**.
Declarar mal continua possível — fica no histórico, com autor e data, o que torna a fraude
cara em vez de impossível. O pre-push é conveniência do autor: quem edita o hook pode apagá-lo
e `--no-verify` o ignora. O que segura é a mesma avaliação na CI. Não usar apenas a versão modificada do validador
para provar a mudança. Rodar a política da base confiável em executor separado, comparar
diff completo e obter decisão do dono da política. O próprio CLI não instala esse executor.

No GitHub: proteger branch de integração/default contra push direto e force; exigir checks
e revisão; invalidar aprovação com novos commits; restringir bypass; manter administradores
e integradores identificados. Disponibilidade depende de plano/visibilidade e será conferida
na ativação. CODEOWNERS sozinho não seria bloqueio; não foi criado arquivo fingindo enforcement.

## Execução e dados

- Sem servidores, túneis ou runners self-hosted no PC. CLI puro e revisão de arquivos bastam.
- Sandbox read-only é solicitado nos perfis leitores; verificar modo efetivo em tarefa de ensaio.
- Worktree isola arquivos de trabalho, não rede, processos, credenciais nem todos os metadados Git.
- Banco efêmero de teste recebe dados sintéticos e credencial descartável. Nenhuma cópia PROD.
- CI de PR não recebe chave Nuvemshop, secret de sessão ou token de deploy.
- Shell executa somente comandos construídos pelo executor confiável. IDs de check no cartão
  nunca são interpolados como comandos. O laboratório não executa comando fornecido por entrada.
- MCP/connector novo exige avaliação da capacidade, origem e dados acessíveis antes de concessão.
- Varredura de segredos é uma camada futura; .gitignore não detecta segredo dentro de um .md.
- Acesso operacional real usa identidade do ator, permissão mínima e revogação. Suporte do
  fundador à lojista preserva sua identidade; não “entrar como ela”.

## Regulação e evolução das regras

Aqui “regulação” é governança do time. Não constitui certificação jurídica, LGPD ou
segurança absoluta. Para dados pessoais futuros: mapear finalidade, controlador/operador,
retencão, exclusão e obrigação aplicável no documento dono do produto, com revisão específica.
Nesta fundação não são necessários dados de clientes, emails nem prompts integrais.

Alteração de política: problema → contraexemplo → proposta de versão → testes negativos →
revisão externa à autoria → decisão do responsável → adoção explícita na próxima tarefa.
Tarefas em execução conservam política fixada; mudança de segurança pode interrompê-las,
mas não ampliar suas permissões silenciosamente.

P0 (escape, segredo, tenant, escrita insegura) bloqueia a frente afetada. P1 (correção,
evidência, restauração, compatibilidade) bloqueia integração. P2 exige registro de risco
e responsável; não vira exceção automática nem é ocultado no resumo.

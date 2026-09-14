# 09 · Auditoria de maturidade e primeiro comando

Data: 2026-09-14. Alvo: `65ace38dd1977755dda42291c0f52252df8f7186` (`main`),
que integrou o conteúdo de `4c942669249c6ff08af427eb94f61892cddbe5ab` pelo PR #3.
O diff entre essas duas árvores é vazio. Auditoria registrada em branch própria.

## Parecer

**Ainda não aprovado para execução autônoma sem supervisão.** O repositório é uma fundação
de trabalho supervisionado: papéis, procedimentos, skills e um laboratório útil de validação.
Isso não comprova que um pedido livre percorra sozinho especificação, despacho, correção,
revisão, integração e retomada. Há defeitos reproduzíveis nos controles e falta comprovar o
primeiro ciclo real no host do time.

Minha avaliação anterior sobre skills exige uma correção: mudar a associação de skills em
`roles.json` invalida o plano; mudar somente o texto de `SKILL.md` não invalida. Os métodos
escritos também não provam que RLS, autenticação, restore ou CI/CD do produto estejam seguros.

## Evidência examinada

- Leitura de AGENTS, README, docs/01 a 05, guia de skills, adaptador Tramevia, templates,
  catálogo/política, oito skills, cinco perfis gerados, CLI, avaliadores, coletor, hook e CI.
- Suíte existente: **151 testes aprovados localmente**. Ela testa predominantemente modelos,
  schemas, fixtures e sincronia de arquivos; não executa um ciclo de agentes no produto.
- GitHub confirmou `success` na [CI da main](https://github.com/lucasmezuraro/trameviaagentsteamtec/actions/runs/34861348175)
  no SHA alvo e na [CI do PR #3](https://github.com/lucasmezuraro/trameviaagentsteamtec/actions/runs/34861236778).
- API pública de branch: `protected: false`, `protection.enabled: false`, checks obrigatórios
  vazios. Consulta complementar a `/rules/branches/main` retornou `[]`. São observações de
  2026-09-14; não foi testado push/merge proibido nem alterada configuração remota.
- Revisão adicional em leitura de coletor/gates/CI por subagente. A auditoria principal
  reproduziu os cenários listados abaixo; não houve ensaio do perfil nativo `team_*` no host.

## Resultado por eixo

| Eixo pedido | Estado observado | Evidência que falta para elevar a confiança |
|---|---|---|
| Maturidade | Fundação supervisionada, com bloqueios abertos | ciclo real T1/T2 e controles T3 |
| Delimitação | Boa nos contratos; parcial na aplicação | escopo físico/realpath, skill protegida e teste por entrega |
| Coordenação | Coordenador e responsáveis definidos | reserva de escritor e passagem de dependência observadas |
| Orquestração | Rodadas hipotéticas; despacho feito pela sessão | rota de entrada, invocação real e registro durável de estado |
| Inteligência | Métodos técnicos pertinentes | avaliação de decisões em tarefas reais; quantidade de skills não mede acerto |
| Segurança | Regras restritivas, enforcement incompleto | base confiável para gates, branch protegida e ensaio de permissões |
| Correção | Recusas úteis, mas contraexemplos escapam | fechar M01/M02/M03/M06 e testar integração dos componentes |
| Testabilidade | Boa no laboratório | testar coletor, host, runner e comportamentos do MVP |
| Objetividade | FR/SC/checks estruturados | oráculo semântico; números e palavras isoladas são insuficientes |
| Lógica/coerência | Separações úteis; garantias exageradas em alguns documentos | reconciliar textos com enforcement e distinguir plano de execução |
| Previsibilidade | Limites de rodadas/tempo/tentativa declarados | medir e interromper execução real; reconciliar cancelamentos |
| Observabilidade | SHA/handoff/modelo de eventos previstos | preservar URL e SHA testado; coletar eventos e custo efetivos |

## Achados que bloqueiam ampliar autonomia

### M10 · P1 — Main sem proteção efetiva observada

As duas APIs públicas retornaram proteção desativada e nenhuma regra efetiva para `main`.
Portanto, a existência de CI/revisor não torna checks e revisão obrigatórios para integrar.
O laboratório não instala isso e um resultado verde não corrige a configuração.

**Critério de fechamento:** ruleset/proteção ativo que imponha revisão, checks e restrições
de bypass, observado por API e validado por tentativa negativa controlada. Não provocar
push indevido em `main` como demonstração improvisada.

### M08 · P1 — Avaliador da CI pode ser alterado pela própria candidata

`.github/workflows/ci.yml:38-64` executa `scripts/observe.mjs`, `src/cli.mjs` e a política
da árvore em checkout. Rodar em máquina do provedor não torna imutável esse código. Um
candidato pode modificar o avaliador/workflow que o julga. A documentação reconhece a
necessidade de base confiável, mas não a implementa; certos comentários afirmam enforcement
mais forte do que existe.

**Critério de fechamento:** coletor/avaliador obtidos de referência confiável separada da
candidata e revisão obrigatória para mudanças de governança. Manter o ensaio de código não
confiável sem credenciais privilegiadas. Proteção externa e desenho do runner são complementares.

### M01/M02 · P1 — Governança das skills incompleta

`team/policy.json:20` omite `.agents/` de `protectedPaths`. Uma observação que altera apenas
`SKILL.md`, sem ADR, retorna `clear_on_observable_facts` e `controlSurface: []`.
`src/policy.mjs:25-31` recebe e verifica somente o catálogo JSON; conteúdo das skills e dos
procedimentos não participa de `rolesDigest`. A mudança desses textos mantém o plano válido.

**Critério de fechamento:** proteger o pacote de skills e fixar um manifesto com hashes dos
arquivos efetivamente usados (incluindo procedimentos/referências/scripts aplicáveis),
coletado da base confiável. Testes devem alterar conteúdo mantendo o mesmo nome e exigir
invalidação. Proteger diretório não substitui fixar conteúdo, e hash não autentica autoridade.

### M03 · P1 — Implementador pode omitir o check que refuta seu requisito

`src/policy.mjs:180-182` e `src/gate.mjs:104-106` só exigem o check do requisito se ele já
aparecer em `task.checks`. A cobertura global aceita que outro cartão o declare. Reproduzido:
o explorador declara `quota-invariant`; o escritor cobre FR-001 mas declara somente
`unrelated-check`. Plano, candidato sintético e gate passam sem resultado do invariante
na entrega do escritor. O revisor humano ainda pode detectar o problema; o código não exige.

**Critério de fechamento:** checks de requisitos afetados pelo escritor obrigatórios no SHA
da entrega, ou tarefa de verificação posterior explicitamente vinculada a esse SHA antes de
qualquer elegibilidade. Um plano de testes do leitor não pode substituir execução dos testes.

### M06 · P1 — ADR conferido no diretório atual em vez do SHA observado

`scripts/observe.mjs:38` usa `existsSync(adr)`. Ensaio em repositório temporário: commit
declara um ADR ausente de sua árvore; criar esse arquivo como untracked faz o coletor emitir
`present: true`. Isso também afeta a observação de outra revisão no mesmo checkout.

**Critério de fechamento:** validar o caminho e verificar o blob por `headSha:path` na árvore
Git observada; testar ausência, arquivo untracked, arquivo somente na base e tipo inadequado.

### M07/M09 · P2 — Proveniência da evidência incompleta

`scripts/observe.mjs:54` divide todo `OBSERVED_CHECKS` por `:`. A própria URL enviada pela
CI vira `evidenceRef: "https"`, reproduzido executando o coletor. Além disso, o checkout
padrão do PR testa o merge ref, enquanto `ci.yml:48` observa o head da branch. Testar o merge
é útil, mas falta registrar explicitamente qual SHA passou e sua relação com o candidato.

**Critério de fechamento:** transporte estruturado para checks, preservação integral da URL,
`testedSha`/`candidateSha` explícitos e verificação da relação. Rejeitar evidência reutilizada
de outra revisão. Referência: [checkout no SHA fixado](https://raw.githubusercontent.com/actions/checkout/11d5960a326750d5838078e36cf38b85af677262/README.md).

## Limites que não devem ser confundidos com bugs novos

- **M04:** o filtro semântico é heurístico. `measure: "banana 1"` passa: há um dígito e não há
  palavra bloqueada. O validador garante forma/ligação, não mensurabilidade ou adequação real.
  Revisão independente de requisito continua necessária.
- **M05:** `gate` pode retornar `clear_on_observable_facts` com `review_not_observed`.
  Isso é documentado. É inseguro convertê-lo em autorização de merge; um supervisor deverá
  exigir evidências externas faltantes antes de avançar.
- As funções do laboratório não fazem dispatch, criam checkout, impõem tempo de processo,
  debitam custo, persistem fila ou restauram checkpoints. `docs/05` já registra esse limite.
- Declarar a skill no texto do perfil orienta o modelo; não mede carregamento nem prova que
  ele aplicou o método. O formato do perfil é compatível com a documentação consultada, mas
  o catálogo de perfis desta sessão não expôs os cinco `team_*`. Portanto, não houve T1 nativo.
- Skills de segurança/QA são procedimentos, não implementações de scanners, banco, autenticação,
  rede ou controles do fornecedor. Também não há corpus de tarefas medindo aderência dos agentes.

## O que acontecerá no primeiro comando

Um pedido como “implemente login seguro” pode ser conduzido por uma sessão Codex que abra o
repositório correto e carregue suas instruções. Ainda dependerá da interpretação do coordenador
para escolher especialistas, preparar contratos, confirmar checkout e cobrar revisão. O CLI
disponível aceita planos JSON e observações; não recebe intenção livre nem inicia o ciclo.

Para este checkout, o primeiro ciclo recomendado deve demonstrar:

1. **Entrada:** selecionar repo/projeto, SHA e papel nativo disponíveis; registrar capacidades
   efetivas. Se um perfil não foi descoberto, explicar a ausência e não simular sua execução.
2. **Preparação:** transformar o objetivo em requisito verificável, mapear impacto e dúvidas;
   escolher somente skills aplicáveis. Não bloquear descoberta porque ainda falta especificação
   de implementação: separar cartão de investigação de cartão de escrita.
3. **Plano:** vincular governança confiável, escopo, dependências, checks e orçamento. Validar
   sem anunciar despacho e reservar o único escritor por mecanismo observado.
4. **Execução supervisionada:** tarefa pequena em checkout isolado, evidência de teste, SHA,
   estado e encerramento; bloquear antes de qualquer efeito fora do cartão.
5. **Revisão:** outro agente examina o candidato; mudança solicitada gera nova evidência no
   novo SHA. O coordenador confronta findings, requisitos e testes de cada entrega.
6. **Integração:** checks/revisão impostos pelo provedor, política confiável e árvore verificada.
   Incidente, limite ou evidência desconhecida impedem avanço automático.
7. **Retomada:** provocar interrupção controlada em tarefa sintética, preservar reserva,
   confirmar processo encerrado e reconciliar antes de nova tentativa.

**Comando inicial útil após corrigir os bloqueios:** “Conduza T1/T2 para uma tarefa sintética
delimitada: confirme a descoberta dos perfis, produza o cartão e os critérios de aceite,
execute um escritor e um revisor, e entregue SHAs e evidências de cada transição.” O sucesso
precisa ser observado; este texto não constitui uma prova antecipada.

## Prioridade de evolução

1. Corrigir M01/M02/M03/M06, fonte confiável da CI e proveniência M07/M09; acrescentar regressões
   que falhem na base. Atualizar as promessas documentais ao comportamento realmente entregue.
2. Ativar proteção externa de integração com revisão de governança e checks obrigatórios.
3. Executar T1/T2 no host real com um caso simples, um caso devolvido pelo revisor e uma
   interrupção controlada. Registrar resultado e limitações de cada um.
4. Medir ao menos dez tarefas: acerto no roteamento, escapes de escopo, evidência obsoleta,
   retrabalho, tempo/custo conhecidos e recuperação. Esses dados orientam ampliar autonomia.
5. Considerar executor hospedado persistente quando o uso exigir; mais skills ou agentes
   permanentes não resolvem os controles ausentes acima.

## Como reproduzir

```sh
node --test
node docs/evidence/maturity-probes.mjs
node docs/evidence/collector-probes.mjs
```

Os probes imprimem `reproduced: true` quando a lacuna ainda existe; **não** são teste de
aceitação que aprova o defeito e não foram incorporados aos 151 testes de regressão. O segundo
cria somente um repositório temporário com dados sintéticos e informa seu caminho. Nenhum
serviço, porta, conta, segredo ou dado de cliente é necessário. Após corrigir o código, converter
esses contraexemplos em regressões com resultado esperado de recusa.

Fontes de host consultadas: [subagentes Codex](https://learn.chatgpt.com/pt-BR/docs/agent-configuration/subagents)
e [skills Codex](https://learn.chatgpt.com/docs/build-skills). Configuração de arquivos e operação
observada são evidências diferentes. Esta auditoria registra diagnóstico; não corrige os gates,
não configura proteção remota e não atesta aplicação/MVP em produção.

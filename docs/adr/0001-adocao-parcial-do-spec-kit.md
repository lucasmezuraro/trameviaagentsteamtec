# ADR 0001 · Adoção parcial do spec-kit como camada de requisito

Data: 2026-09-14. Estado: aceito para o laboratório e para os cartões; não altera portões
de produção nem concede autoridade nova a nenhum papel.

## Contexto

O time já tinha modelo de autoridade, topologia, orçamento e estados de run. Faltava a
camada anterior a tudo isso: **o requisito**. O cartão pedia um "objetivo observável" em
texto livre e nada conferia se o trabalho entregue correspondia ao que foi pedido. Na
prática, um especialista podia executar dentro do escopo, passar na revisão e ainda assim
entregar outra coisa — porque não existia nada contra o que confrontar a entrega.

[github/spec-kit](https://github.com/github/spec-kit) trata exatamente esse trecho:
especificação antes do plano, requisitos numerados, critérios mensuráveis, marcação
explícita do que ficou em aberto e checagem de cobertura entre spec, plano e tarefas.

Ele **não** trata autoridade, isolamento, identidade, orçamento, interrupção, recuperação
ou comunicação, e não executa nada: gera markdown e confia no agente. Nesses pontos o
modelo deste repositório é mais forte e permanece como está.

## Decisão

Adotar do spec-kit o que é mecanizável e subordiná-lo à política existente.

### Adotado

| Origem | Como entrou aqui | Onde se prova |
|---|---|---|
| `spec-template`: requisitos FR-### e critérios SC-### | bloco `spec` obrigatório no plano | `src/spec.mjs`, `validateSpec` |
| critério de sucesso mensurável | `measure` precisa conter grandeza | teste "critério sem grandeza" |
| `[NEEDS CLARIFICATION]` como portão | `clarifications` não vazio bloqueia o plano | teste "dúvida aberta bloqueia o despacho" |
| `analyze`: detecção de ambiguidade | léxico de termos vagos sobre enunciado e critério | `observable` |
| `analyze`: lacunas de cobertura | requisito sem tarefa, sem evidência, e tarefa órfã | `coverageGaps` |
| `analyze`: constituição é inegociável | plano fixado em `policyDigest`; achado P0 não fecha na própria geração | `validatePlan`, `assessCandidate` |
| `converge` | comando de relatório de deriva, sem bloquear | `node src/cli.mjs converge` |

Três consequências de desenho merecem registro:

- **A evidência pertence ao requisito, não ao cartão.** `FR-00x.check` nomeia o teste capaz
  de refutá-lo. Um requisito coberto por tarefa que não declara esse check é lacuna, não
  cobertura. O cartão pode esquecer; o requisito não deixa.
- **O plano é fixado na versão de governança que o autorizou.** Alterar `team/policy.json`
  ou os papéis invalida planos em voo em vez de ampliar silenciosamente o que eles podem
  fazer. É a regra "constituição é inegociável" transformada em comparação de digest.
- **Achado P0 se resolve com novo candidato.** Marcar `resolved` na mesma geração em que foi
  levantado é reinterpretação, e passa a bloquear. Ajuste exige nova geração.

### Recusado, com motivo

| Recusado | Motivo |
|---|---|
| `/speckit.implement` | executa a lista de tarefas sozinho; colide com `maxWriters: 1`, com A1 supervisionado e com "especialistas não se autodelegam" |
| constituição como arquivo próprio | criaria segunda fonte de verdade ao lado de AGENTS.md e `team/policy.json`, sem nada que a valide (D05) |
| CLI `specify` e diretório `.specify/` | acopla a fundação a um scaffolding externo em evolução rápida; o contrato aqui é JSON validado, não markdown confiado |
| `/speckit.taskstoissues` | despacho real continua sendo do coordenador; entra junto com o executor da onda T5, não antes |
| proibir vocabulário de implementação no requisito | regra do spec-kit que gera falso positivo demais em requisito de domínio; fica como julgamento da revisão |
| severidades CRITICAL/HIGH/MEDIUM/LOW | o repositório já usa P0/P1/P2; duas escalas para a mesma coisa confundem mais do que informam |

## Consequências

- O plano passa à versão 2. Plano versão 1 não passa a valer por omissão: é rejeitado.
- Toda tarefa declara `covers`, e todo candidato declara `coveredRequirements`; divergência
  entre o declarado e o plano autorizado bloqueia.
- O laboratório ganhou `src/schema.mjs` para as primitivas estruturais compartilhadas.
  `src/policy.mjs` depende de `src/spec.mjs`, nunca o contrário.
- Escrever a especificação virou trabalho real antes do primeiro cartão. Esse é o custo
  aceito: menos retrabalho depois, mais recusa antes.

## Limites desta decisão

Nada aqui autentica revisor, autor, aprovação ou execução. `converge` compara o que o plano
declara com o que o plano declara — não lê o repositório do produto, não roda teste e não
observa processo. Confrontar a especificação com o código realmente existente depende do
executor da onda T5 e continua pendente.

O léxico de termos vagos é heurística. Ele recusa enunciado provavelmente inútil; não
garante que o enunciado aceito seja bom. Revisão humana continua sendo o oráculo.

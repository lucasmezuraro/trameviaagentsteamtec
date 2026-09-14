# Especificação · Executor T5

Primeiro uso real da camada de requisito ([ADR 0001](../../docs/adr/0001-adocao-parcial-do-spec-kit.md))
sobre o próprio time. Escrita antes de qualquer cartão, como manda `docs/02`.

- ID / projeto: T5-EXEC / trameviaagentsteamtec
- Documento dono e revisão fixada: `docs/05-ativacao-e-backlog.md` em 65ace38dd1977755dda42291c0f52252df8f7186
- Solicitante e data: proprietário, 2026-09-14

## Resultado pretendido

Um cartão já validado é executado até virar candidato **sem sessão humana aberta**, e cada
transição da execução deixa evidência que alguém consegue conferir depois.

Hoje isso não existe: o laboratório julga candidatos sintéticos e a execução real depende de
uma sessão de chat aberta. Por isso o time é supervisionado, não autônomo — e é esse o único
buraco que separa as duas coisas.

## Fatia 1 — contrato do executor

Esta fatia define **como o executor se comporta**, não onde ele roda. Ela é inteiramente
verificável offline e não depende de nenhuma decisão pendente, por isso pode começar.

### Critérios de sucesso

| ID | Enunciado | Medida |
|---|---|---|
| SC-001 | Nenhum recurso é reservado para trabalho que a política não autoriza | 0 execução iniciada em 100% dos cartões com plano inválido |
| SC-002 | Uma execução interrompida nunca libera tentativa sem reconciliação | 0 retomada liberada em 100 interrupções ensaiadas |
| SC-003 | Toda transição de execução deixa rastro conferível | 1 evento durável por transição, com sequência monotônica por run |

### Requisitos funcionais

| ID | O sistema deve… | Critério | Evidência |
|---|---|---|---|
| FR-001 | recusar o cartão cujo plano não valide na política vigente, antes de reservar qualquer recurso | SC-001 | `invalid-card-refused` |
| FR-002 | registrar um evento durável por transição de run, com sequência monotônica por run, recusando evento repetido ou de geração obsoleta | SC-003 | `monotonic-event-log` |
| FR-003 | encerrar o processo do especialista ao atingir o limite de tempo do cartão e marcar o run como interrompido sem resultado conhecido | SC-002 | `timeout-interrupts` |
| FR-004 | recusar nova tentativa enquanto o run interrompido não tiver processo encerrado e checkout reconciliado | SC-002 | `retry-requires-reconcile` |
| FR-005 | obter a identidade do supervisor de fonte externa ao candidato e recusar a execução quando ela não for verificável | SC-001 | `unverified-supervisor-refused` |

FR-005 é o requisito que decide se o resto vale alguma coisa. Sem identidade externa, um
executor autônomo é um agente aprovando a si mesmo com mais passos.

### Fora do escopo desta fatia

Escolha de hospedagem, fila durável, execução em várias máquinas, credencial por tarefa,
contabilidade de tokens e qualquer acesso a DEV/HOM/PROD. Entram na fatia 2, e só depois das
decisões abaixo.

### Premissas

- O executor consome cartão **já validado**; ele não é o lugar onde a política é reinterpretada.
- A observação de fatos continua separada do julgamento: o executor coleta, `src/` avalia.
- O contrato pode ser exercido offline com processos sintéticos; comprovar cancelamento real
  de processo remoto é ensaio da fatia 2.

## Fatia 2 — hospedagem e orçamento

**Bloqueada.** As dúvidas abaixo são decisão do fundador, não do especialista, e enquanto
existirem o plano da fatia 2 é recusado pelo validador — de propósito.

- [ ] Onde o executor roda sem sessão aberta, e quem paga essa conta?
- [ ] Qual fonte de identidade autentica o supervisor: GitHub (revisão obrigatória), OIDC de
      provedor, ou outra?
- [ ] Qual é o teto de gasto por cartão, por dia e por loja, e o que acontece ao atingi-lo:
      para, degrada ou avisa?
- [ ] Onde o evento durável é armazenado, por quanto tempo, e quem pode lê-lo?

Cada uma dessas respostas muda o desenho. Responder por suposição para destravar a execução
é exatamente o que `procedures/implementation.md` proíbe.

## Como conferir

```sh
node src/cli.mjs validate specs/t5-executor/slice-1-contract.json
node src/cli.mjs converge specs/t5-executor/slice-1-contract.json
node src/cli.mjs validate specs/t5-executor/slice-2-hosting.json   # recusa esperada
```

Os dois planos estão fixados nos digests de política e de papéis vigentes em
65ace38. Mudar qualquer um dos dois invalida ambos, e é isso que deve acontecer: um
plano autorizado sob outra governança não continua valendo por inércia.

A fatia 1 valida, escalona em duas rodadas (`T5-MAP` + `T5-ORACLE`, depois `T5-CONTRACT`) e
mostra cobertura completa: 5 requisitos, 5 evidenciados, 0 lacuna. A fatia 2 é recusada com
`dúvida aberta bloqueia o plano: 4 pendência(s)`. É o portão funcionando sobre conteúdo real, não sobre
fixture: o que pode começar é decidido pela regra, não pela pressa.

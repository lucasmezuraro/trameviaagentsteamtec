# 06 · Revisão e decisões da fundação

2026-09-14. Origem: novo remoto vazio trameviaagentsteamtec. Contexto de produto lido no
checkout Tramevia em ef6a1242c9a57d09eb1c675b4cb1bed5368a8a0c. Comparação do peer do
produto: quatro commits locais exclusivos e dois do peer após fetch. Nenhuma integração
dessas histórias foi feita; nenhum aceite de outro agente de produto foi presumido.

## Decisões

- D01: time centralizado, especialistas temporários, um escritor. Reduz colisão e custo;
  evolução para múltiplos escritores exige isolamento e coordenação de recursos comprovados.
- D02: laboratório puro sem I/O externo. Torna os contratos testáveis agora; não contém
  processos reais nem autentica revisores. Executor persistente permanece backlog.
- D03: domínio mora no repo do produto; o time referencia revisão fixada. Evita duas
  especificações divergentes de ATP/auth/restore.
- D04: revisão e release são etapas distintas. Agentes produzem candidato; operação real
  exige outra identidade e portões do ambiente.
- D05: política versionada e adoção explícita. Uma mudança não pode atestar sua própria autoridade.
- D06: requisito antes do plano, adotado em parte do spec-kit e subordinado à política
  existente. O que entrou, o que foi recusado e por quê está no
  [ADR 0001](adr/0001-adocao-parcial-do-spec-kit.md). A autonomia cresce porque o agente
  passa a ter contra o que se conferir; não porque ganhou permissão nova.

## Achados incorporados

| ID | Problema revisto | Tratamento |
|---|---|---|
| R01 P0 | instrução confundida com isolamento | matriz de enforcement e ensaio no host pendente |
| R02 P0 | cartão com autoaprovação | schema fechado, sem campos de autorização; evidência sintética declarada |
| R03 P0 | revisão/teste antigo | contexto completo de candidato e rejeição de stale evidence |
| R04 P0 | timeout libera escritor vivo | modelo impede retry antes da reconciliação; reserva efetiva depende do executor |
| R05 P0 | mudança no validador contorna regra | superfície protegida e revisão sob regra-base confiável |
| R06 P1 | caminhos e recursos colidem | sintaxe restrita, fronteira de diretório e bloqueio por recurso |
| R07 P1 | worktree nasce de uma instrução | criação/verificação explícita; escritor serial inicial |
| R08 P1 | ff-only em branches divergentes | branch de integração, teste/revisão do novo SHA |
| R09 P1 | “pronto” significa “implantado” | estados e resultados separados; CLI só simula elegibilidade |
| R10 P1 | autonomia sem fim | limites de tarefas, duração e tentativas; budget real ainda externo |
| R11 P1 | migração de teste proibida junto com real | permitir descartável hospedada no cartão; negar operação real |
| R12 P2 | log local chamado de auditoria | autoria real e armazenamento externo pendentes; sem alegar imutabilidade |

Revisão independente de desenho realizada por subagente de leitura nesta tarefa.
Isso é revisão técnica auxiliar, não aprovação humana de governança ou de produção.
Validações executadas e limitações finais serão registradas ao concluir a fundação.

## Segunda revisão: código do laboratório

O revisor de leitura reproduziu oito lacunas: candidato antigo integralmente coerente,
catálogo fora do digest, ID aceito por coerção de array, evidência malformada, retomada
com tentativa nula, escopo em .git, colisão arquivo/diretório e descrição exagerada de
reserva após timeout. As correções incluem expectedRun separado, rolesDigest, tipos e
schema fechado, rejeição de metadados/ambiente, comparação de reserva e texto preciso.
Ensaios negativos estão em test/review-regressions.test.mjs.

## Terceira revisão: a camada que faltava antes do plano

A fundação sabia dizer quem podia agir, com que limite e sobre quais arquivos, mas não
sabia dizer **contra o quê** conferir a entrega. O cartão pedia "objetivo observável" em
texto livre; nada impedia um candidato de passar em escopo, teste e revisão e ainda assim
resolver outro problema. O spec-kit foi avaliado para esse trecho e adotado em parte.

Cinco lacunas fechadas, todas com ensaio negativo em test/spec-driven.test.mjs:

| ID | Lacuna | Tratamento |
|---|---|---|
| R13 P0 | entrega sem requisito contra o qual se refutar | bloco `spec` obrigatório; requisito aponta a evidência que o derruba |
| R14 P0 | dúvida implícita virava suposição do implementador | dúvida em aberto rejeita o plano inteiro |
| R15 P0 | mudança de política ampliava plano já autorizado | plano fixado em `policyDigest`; mudar governança invalida o plano em voo |
| R16 P1 | requisito sem tarefa e tarefa sem requisito passavam despercebidos | lacunas de cobertura bloqueiam, e `converge` relata sem bloquear |
| R17 P1 | achado P0 podia ser fechado por reinterpretação no mesmo candidato | fechar exige nova geração |

Limite honesto: `converge` confronta o plano consigo mesmo. Confrontar a especificação com
o código que existe de fato é trabalho do executor da onda T5 e continua pendente. O léxico
de termos vagos é heurística: recusa enunciado provavelmente inútil, não certifica o aceito.

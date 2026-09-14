# Tramevia · Time técnico de agentes

Uma equipe pequena de agentes para transformar requisitos em mudanças verificáveis,
com autonomia limitada por tarefa e responsabilidade humana pela operação.

**Estado: fundação operacional v0.1; execução supervisionada.** Este repositório contém
perfis Codex, contratos de trabalho, um laboratório executável de políticas e CI.
O laboratório valida planos e simula decisões; não inicia modelos, não controla
processos, não autentica aprovações e não faz deploy. Nenhum serviço ou porta local é necessário.

## Comece por aqui

1. Abra [o mapa visual](docs/mapa-operacional.html) no navegador.
2. Leia [o modelo de equipe](docs/01-modelo-operacional.md) e
   [o fluxo de entrega](docs/02-workflow.md).
3. Confira [segurança e limites reais](docs/03-seguranca.md).
4. Escreva a [especificação](templates/spec.md) antes do primeiro cartão; sem requisito
   numerado e sem dúvida resolvida, nenhum plano é válido ([ADR 0001](docs/adr/0001-adocao-parcial-do-spec-kit.md)).
5. Execute o laboratório abaixo; a massa é sintética.
6. Instale o portão local (uma vez) e siga
   [a ativação progressiva](docs/05-ativacao-e-backlog.md) para a primeira tarefa real.

```sh
node --test
node src/cli.mjs validate examples/plan.json
node src/cli.mjs converge examples/plan.json
node src/cli.mjs plan examples/plan.json
node src/cli.mjs simulate
```

Sobre uma mudança real, o supervisor observa e o modelo julga — nesta ordem, e em processos
separados ([ADR 0002](docs/adr/0002-portoes-executaveis-e-missoes.md)):

```sh
git config core.hooksPath hooks
node scripts/observe.mjs origin/main HEAD --collector local-hook > observation.json
node src/cli.mjs guard observation.json
node src/cli.mjs gate examples/observation.json examples/plan.json F0-CORE
```

`guard` recusa mudança na superfície de controle sem um `Control-Surface: docs/adr/NNNN-*.md`
no commit. Ele sai com código 1 e a mesma avaliação roda na CI, onde o autor não é dono do
runner. Nenhum resultado se chama "aprovado": o sucesso é `clear_on_observable_facts` e vem
acompanhado do que **não** foi verificado.

Node.js 22 ou 24; nenhuma dependência npm, chave de API ou conta de hospedagem.
A execução local é só CLI/testes puros. Testes futuros que precisarem de Postgres,
Redis ou servidor web deverão usar ambiente efêmero hospedado.

## O que já existe e o que falta

A [auditoria de maturidade](docs/09-auditoria-de-maturidade.md) de 2026-09-14 identificou
lacunas reproduzíveis em skills, coleta e checks de requisitos. A CI passou, mas a main foi
observada sem proteção efetiva. O time ainda não está aprovado para operação sem supervisão.

| Entrega | Situação |
|---|---|
| Papéis, escopo, transferência de contexto e incidentes | Contratos versionados |
| Missões com entrada, conclusão e parada + procedimento por papel | Declaradas em `team/roles.json`, com `procedures/` e teste de completude |
| Perfis em `.codex/agents` | Gerados do catálogo com teste de sincronia; descoberta/sandbox ainda precisam de ensaio no host |
| Superfície de controle protegida por portão | Recusa efetiva no pre-push e na CI; declaração por trailer de commit |
| DAG, limites, escopo e revisão de candidato | Modelo executável com testes negativos |
| Requisito, critério mensurável e cobertura até a evidência | Validado no plano; confronto com o código real depende do executor (T5) |
| GitHub Actions | Workflow definido; execução remota só se comprova no GitHub |
| Despacho real contínuo, identidades e orçamento de API | Não implementados; portões em docs/05 |
| Proteções de branch e aprovação de release | Configuração externa pendente |
| MVP Tramevia e escrita Nuvemshop | Outro repositório; este time não habilita operação de loja |

## Mapa do repositório

- [AGENTS.md](AGENTS.md): entrada obrigatória para qualquer agente.
- [Catálogo](team/roles.json): responsabilidade dos cinco especialistas; coordenador é a sessão principal.
- [Política](team/policy.json): limites do laboratório, não um firewall.
- [Operação e observabilidade](docs/04-observabilidade-e-recuperacao.md): eventos, métricas, retomada e backups.
- [Revisão e decisões](docs/06-revisao-e-decisoes.md): achados e limites da fundação.
- [Adaptador Tramevia](projects/tramevia.md): contratos do produto e sequência de adoção.
- [Procedimentos](procedures/): o passo a passo de cada missão, carregado por quem a executa.
- [Skills técnicas](docs/08-habilidades-tecnicas.md): método versionado para descoberta,
  Node/web, qualidade e segurança, vinculado a cada papel.
- [Especificação](templates/spec.md), [cartão](templates/task.md), [handoff](templates/handoff.md), [incidente](templates/incident.md).
- Decisões arquiteturais: [ADR 0001](docs/adr/0001-adocao-parcial-do-spec-kit.md) (requisito antes do plano)
  [ADR 0002](docs/adr/0002-portoes-executaveis-e-missoes.md) (portões que recusam e missões delimitadas)
  e [ADR 0003](docs/adr/0003-skills-tecnicas-e-governanca-de-papeis.md) (skills por papel e planos fixados ao catálogo).
- [Fontes](docs/07-fontes.md): documentação primária e data de consulta.
- [Registro de entrega](docs/21-colaboracao.md): base, revisão, validações e pendências.
- [Auditoria de maturidade](docs/09-auditoria-de-maturidade.md): primeiro comando, achados,
  evidências e critérios para ampliar autonomia.

Autonomia cresce por evidência. Mais agentes e mais tokens não substituem um contrato
pequeno, uma revisão com contraexemplo e testes sobre o commit que será integrado.

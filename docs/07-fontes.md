# 07 · Fontes e premissas

Consultas em 2026-09-14. O desenho da equipe é uma decisão deste projeto; não é apresentado
como recomendação universal ou certificação de fornecedor.

- [OpenAI: subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents):
  perfis TOML em .codex/agents; name, description e developer_instructions; sandbox_mode
  como configuração; limite de threads. Modelos não foram fixados: herdam a escolha do usuário.
- [OpenAI: AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) e
  [skills](https://learn.chatgpt.com/docs/build-skills): instruções de projeto em camadas e
  skills em `.agents/skills/` com `SKILL.md` foram conferidas em 2026-09-14. A descoberta no
  host continua pendente de ensaio, não é presumida por existir no repositório.
- [OpenAI: rules](https://learn.chatgpt.com/docs/agent-configuration/rules) e
  [hooks](https://learn.chatgpt.com/docs/hooks): ambos dependem de host/projeto confiável;
  hooks são guardrails e não conseguem desfazer efeito já ocorrido. Não foram usados como
  prova de isolamento nesta fundação.
- [OpenAI: worktrees](https://learn.chatgpt.com/pt-BR/docs/environments/git-worktrees):
  checkout separado e restrição de branch; não equivale a ambiente hospedado.
- [OpenAI: segurança](https://learn.chatgpt.com/docs/security):
  referência para verificar sandbox e permissões no ensaio do host.
- [GitHub: segurança de Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions):
  permissões mínimas e fixação de actions por SHA.
- [NIST SSDF](https://csrc.nist.gov/projects/ssdf): referência consultada em 2026-09-14 para
  práticas de desenvolvimento seguro orientadas por risco; adaptações neste repositório não são
  certificação NIST nem checklist completo.
- [GitHub: uso seguro de Actions](https://docs.github.com/en/actions/reference/security/secure-use):
  referência consultada em 2026-09-14 para menor privilégio, SHA de actions, conteúdo não
  confiável e artefatos. Atestação e SBOM dependem de permissões/plano e não foram ativados.
- [GitHub: branches protegidas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches):
  referência para ativação de checks/revisões, sujeita à disponibilidade na conta.
- [github/spec-kit](https://github.com/github/spec-kit): README, `templates/spec-template.md`
  e `templates/commands/analyze.md` consultados em 2026-09-14. Origem do requisito numerado,
  do critério mensurável, do portão de dúvida aberta e das categorias de lacuna. Nada do
  pacote foi instalado ou executado: as regras foram reimplementadas e testadas aqui, e o
  que foi recusado está no [ADR 0001](adr/0001-adocao-parcial-do-spec-kit.md).

Actions checkout v4 e setup-node v4 tiveram referências consultadas por git ls-remote.
O workflow fixa os SHAs observados. Isso identifica o código executado, não constitui
auditoria completa da action ou garantia de manutenção. Atualizações precisam de revisão.

Preços, cotas, visibilidade/plano GitHub, instalação efetiva dos perfis, isolamento do host
e executor contínuo não foram certificados. Conferir antes de contratação ou ativação.


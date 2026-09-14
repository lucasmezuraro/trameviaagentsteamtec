# 07 · Fontes e premissas

Consultas em 2026-09-14. O desenho da equipe é uma decisão deste projeto; não é apresentado
como recomendação universal ou certificação de fornecedor.

- [OpenAI: subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents):
  perfis TOML em .codex/agents; name, description e developer_instructions; sandbox_mode
  como configuração; limite de threads. Modelos não foram fixados: herdam a escolha do usuário.
- [OpenAI: worktrees](https://learn.chatgpt.com/pt-BR/docs/environments/git-worktrees):
  checkout separado e restrição de branch; não equivale a ambiente hospedado.
- [OpenAI: segurança](https://learn.chatgpt.com/docs/security):
  referência para verificar sandbox e permissões no ensaio do host.
- [GitHub: segurança de Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions):
  permissões mínimas e fixação de actions por SHA.
- [GitHub: branches protegidas](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches):
  referência para ativação de checks/revisões, sujeita à disponibilidade na conta.

Actions checkout v4 e setup-node v4 tiveram referências consultadas por git ls-remote.
O workflow fixa os SHAs observados. Isso identifica o código executado, não constitui
auditoria completa da action ou garantia de manutenção. Atualizações precisam de revisão.

Preços, cotas, visibilidade/plano GitHub, instalação efetiva dos perfis, isolamento do host
e executor contínuo não foram certificados. Conferir antes de contratação ou ativação.


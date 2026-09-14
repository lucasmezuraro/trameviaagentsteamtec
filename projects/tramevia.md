# Adaptador · MVP Tramevia

Fonte de contexto: lucasmezuraro/tramevia, revisão local completa
`ef6a1242c9a57d09eb1c675b4cb1bed5368a8a0c`. Essa revisão foi lida no checkout do produto;
disponibilidade no remoto não foi presumida. Confira a revisão acessível antes do primeiro
cartão real. Não copiar contratos do produto para este repositório como segunda autoridade.

## Leitura e precedência

Leia integralmente AGENTS.md e CLAUDE.md do produto, docs/20, ADR 0001 e documento da frente.
Correções aceitas nos ADRs prevalecem sobre legados indicados. Docs/29 e ADR 0004/0005
governam release; docs/31 e ADR 0007 governam recuperação; docs/32 é o modelo de agentes
anterior a esta fundação. Evoluir sua adoção em mudança separada, sem copiar por cima.
Propostas não aceitas do peer não alteram automaticamente a arquitetura.

## Restrições que o cartão conserva

- Loja nova em shadow, variação unmanaged; piloto unitário com teto baixo.
- Ledger imutável, inteiros e quota antes de publicação; ATP individual não é quota global.
- RLS/FK por tenant, sessão e identidade de suporte distintas; ações auditáveis pelo ator real.
- Inbox/outbox e serialização transacional antes de escrita; chave local não prova idempotência remota.
- Timeout de escrita externa vira unknown, sem repetir PUT antigo ou rollback cego.
- Restore inicia em RECOVERY_HOLD, invalida acessos e retoma somente a shadow por ato humano.
- Nenhum servidor/túnel no PC; integração de serviços em ambiente hospedado descartável.
- F1 leitura/cálculo pode avançar; F1.5/F2 dependem de garantias e ensaios reais da integração.

## Primeiras fatias

| Ordem | Cartão real a preparar | Papel principal | Aceite |
|---|---|---|---|
| 1 | Verificar base e fechar spike de versões/adapter | explorer | fontes atuais, compatibilidade e ADR aplicável |
| 2 | F0 monorepo e CI sem segredos | implementer + delivery | build/test e fronteiras de módulos |
| 3 | Schema e massa sintética | implementer + test | migração em banco efêmero, sem dados de loja |
| 4 | RLS, FKs compostas e roles | implementer + security | tentativa cross-tenant, pool reutilizado e ledger imutável |
| 5 | Auth, sessão e suporte | implementer + security | revogação, autorização por ação e ator separado |
| 6 | Receita guiada e ATP explicável em sombra | implementer + test | conta didática e invariantes; sem escrita remota |
| 7 | Exercício de recuperação | test + operador autorizado | perda e retomada medidas; shadow como retorno |

São fatias propostas, não trabalho executado no aplicativo. A aprovação desta estrutura
não libera escrita Nuvemshop nem resolve as divergências Git existentes no produto.


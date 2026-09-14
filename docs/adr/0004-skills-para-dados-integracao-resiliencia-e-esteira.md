# ADR 0004 · Skills para dados, integração, resiliência e esteira

**Status:** aceito para a fundação operacional.
**Data:** 2026-09-14.

## Contexto

O ADR 0003 associou skills a exploração, Node/web, qualidade e revisão de segurança. A revisão
do adaptador do MVP mostrou quatro riscos ainda pouco específicos: isolamento e evolução de
dados multi-tenant; efeitos de API/webhook; perda/retomada; e a cadeia que transforma código em
artefato. São áreas com modos de falha próprios, que não devem depender de lembrar de um prompt
genérico.

## Decisão

1. Criar skills locais e autocontidas para dados/tenant, integração confiável, resiliência e
   recuperação, e CI/CD/cadeia de suprimentos.
2. Associá-las somente aos papéis que precisam desenhar, testar, implementar ou revisar tais
   riscos. Nenhum novo papel recebe permissão de escrita, rede, segredo, deploy ou operação.
3. Cada skill exige um resultado observável: invariantes e contraexemplos, máquina de estados,
   ensaio de recuperação ou mapa de permissões/artefatos. O que não puder ser ensaiado vira
   lacuna explícita.
4. Como a lista de skills faz parte de `team/roles.json`, a alteração muda `rolesDigest` e
   invalida planos existentes. O exemplo é regenerado com o digest novo; cartões reais devem ser
   replanejados, não adaptados em silêncio.

## Consequências

- O time passa a ter método específico para os principais contratos do piloto: RLS/ledger,
  inbox/outbox e timeout `unknown`, `RECOVERY_HOLD`, e CI com menor privilégio/artefato
  identificável.
- A esteira não ativa atestação, SBOM, OIDC, banco hospedado ou integração externa apenas por
  existir uma skill. Cada capacidade exige decisão de fornecedor, plano, permissão e evidência.
- A revisão ganha menos repetição e maior precisão: segurança foca fronteira de confiança,
  QA foca contraexemplo e o papel de entrega confronta artefato, ambiente e critérios.

## Limites

Skills orientam ações no repositório. Elas não certificam fornecedor, conformidade, backup,
segurança ou disponibilidade, nem conseguem verificar configuração remota sem um ensaio
autorizado. Proteção de branch, identidades, ambientes e contas continuam controles externos.

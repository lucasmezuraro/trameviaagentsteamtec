# 08 · Skills técnicas por papel

Cada perfil é gerado de `team/roles.json` e declara as skills aplicáveis à sua missão. As
skills vivem em `.agents/skills/`: o Codex as descobre no repositório e o perfil aponta seus
nomes com `$skill`. O catálogo é a fonte de verdade; após mudar papéis, rode
`node scripts/render-profiles.mjs` e confira o diff dos TOML gerados.

| Papel | Skills | Resultado exigido |
|---|---|---|
| Exploração | arquitetura, dados/tenant e integração | fatos no commit-base, fronteiras e dúvidas explícitas |
| Qualidade | QA, dados/tenant, integração e recuperação | matriz com oráculos e contraexemplos |
| Implementação | Node/web, QA, dados/tenant, integração e CI/CD | mudança pequena, testes no SHA e handoff |
| Segurança | segurança, dados/tenant, integração e CI/CD | achados reproduzíveis ou lacunas de evidência |
| Revisão de entrega | QA, segurança, recuperação e CI/CD | confronto requisito/diff/evidência no mesmo SHA |

## Cobertura que foi acrescentada

| Skill | Lacuna que fecha | Papéis que a usam |
|---|---|---|
| `tramevia-data-tenancy` | RLS, FKs compostas, migração, ledger, auditoria e restore de dados | exploração, QA, implementação e segurança |
| `tramevia-integration-reliability` | Webhook/API, inbox/outbox, idempotência, `unknown` e reconciliação | exploração, QA, implementação e segurança |
| `tramevia-resilience-recovery` | Eventos, incidentes, backup, ensaio de restore e `RECOVERY_HOLD` | QA e revisão de entrega |
| `tramevia-ci-cd-supply-chain` | Permissões da CI, actions, dependências, artefatos, promoção e rollback | implementação, segurança e revisão de entrega |

## O que a associação faz

Ela carrega a disciplina adequada quando a missão começa: descoberta não vira implementação,
implementação verifica o stack real antes de usar Node/Next/JavaScript, QA prepara casos que
refutam defeitos e segurança percorre as fronteiras de confiança. Skill é instrução versionada,
não ferramenta, credencial, permissão de rede ou autorização de escopo.

As quatro novas skills cobrem os riscos que o adaptador do MVP já havia identificado e que uma
skill genérica de Node ou de security review não detalhava: isolamento de dados, efeito remoto,
retomada e cadeia da esteira. Não foi criado um papel de deploy: as habilidades permanecem
acopladas a papéis existentes, em leitura quando for revisão, e sem poder de operação externa.

O plano está ligado tanto a `policyDigest` quanto a `rolesDigest`. Alterar papel, missão ou
associação de skills no JSON muda o digest do catálogo e recusa planos anteriores. Alterar
somente conteúdo de `SKILL.md` ou procedimento não muda esse digest. A
[auditoria de maturidade](09-auditoria-de-maturidade.md) registra essa lacuna e a ausência de
`.agents/` na superfície protegida atual. A versão do plano é 3; ela ainda não fixa todo o
conteúdo instrucional do agente.

## Qualidade e segurança sem promessas vazias

Não existe validação "100%" honesta: há ambiente indisponível, integrações não ensaiadas e
comportamentos que só aparecem em produção. A matriz de QA obriga a declarar os eixos
aplicáveis e a razão de cada ausência. A revisão de segurança exige reprodução para achado e
declara explicitamente o que não foi comprovado. O portão recusa lacuna estrutural; ele não
certifica segurança nem substitui revisão humana.

Para o MVP Tramevia, o adaptador em `projects/tramevia.md` continua sendo a fonte de limites:
sem servidor/túnel no computador, sem segredo ou dado real na massa, integração externa apenas
em ambiente hospedado e descartável autorizado pelo cartão.

## Adoção gradual

1. Use as skills em um cartão de leitura e confira se a descoberta do host carregou o perfil.
2. Use QA para desenhar a matriz antes do primeiro código e acrescente apenas checks que o
   runner realmente pode executar.
3. Submeta autenticação, tenant, integrações, CI e recuperação à revisão de segurança antes
   de integrar.
4. Só depois de evidência remota configure controles externos, como proteção de branch e
   aprovação obrigatória. Regras e hooks nativos do Codex são complementos de host confiável;
   não são uma prova de isolamento por estarem versionados aqui.

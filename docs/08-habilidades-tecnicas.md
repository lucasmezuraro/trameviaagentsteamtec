# 08 · Skills técnicas por papel

Cada perfil é gerado de `team/roles.json` e declara as skills aplicáveis à sua missão. As
skills vivem em `.agents/skills/`: o Codex as descobre no repositório e o perfil aponta seus
nomes com `$skill`. O catálogo é a fonte de verdade; após mudar papéis, rode
`node scripts/render-profiles.mjs` e confira o diff dos TOML gerados.

| Papel | Skills | Resultado exigido |
|---|---|---|
| Exploração | `tramevia-architecture-discovery` | fatos no commit-base, fronteiras e dúvidas explícitas |
| Qualidade | `tramevia-quality-assurance` | matriz com oráculos e contraexemplos |
| Implementação | `tramevia-node-web`, `tramevia-quality-assurance` | mudança pequena, testes no SHA e handoff |
| Segurança | `tramevia-security-review` | achados reproduzíveis ou lacunas de evidência |
| Revisão de entrega | qualidade + segurança | confronto requisito/diff/evidência no mesmo SHA |

## O que a associação faz

Ela carrega a disciplina adequada quando a missão começa: descoberta não vira implementação,
implementação verifica o stack real antes de usar Node/Next/JavaScript, QA prepara casos que
refutam defeitos e segurança percorre as fronteiras de confiança. Skill é instrução versionada,
não ferramenta, credencial, permissão de rede ou autorização de escopo.

O plano agora está ligado tanto a `policyDigest` quanto a `rolesDigest`. Se uma mudança altera
papel, missão ou skill, o digest do catálogo muda e planos já preparados são recusados. Isso
impede que um plano antigo herde silenciosamente uma capacidade nova. A versão do plano é 3.

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

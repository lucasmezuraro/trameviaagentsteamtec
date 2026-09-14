# ADR 0003 · Skills técnicas e governança de papéis

**Status:** aceito para a fundação operacional.  
**Data:** 2026-09-14.

## Contexto

Os perfis delimitavam responsabilidade, mas ainda não diziam qual método técnico o agente
deveria aplicar a uma fatia Node/Next/JavaScript, a um ensaio de qualidade ou a uma revisão de
segurança. Instruções genéricas elevam a chance de respostas inconsistentes, principalmente
em autenticação, isolamento de tenant, integração servidor-servidor e exposição de dados.

O repositório já trata `team/roles.json` como catálogo e gera os perfis Codex. Um plano fixava
a política, porém não fixava o catálogo de papéis, apesar de a mudança deste catálogo poder
alterar o comportamento de uma tarefa já planejada.

## Decisão

1. As skills versionadas ficam em `.agents/skills/`, com `SKILL.md` autocontida e descoberta
   pelo Codex no projeto. Cada papel declara sua lista de skills em `team/roles.json`; o
   gerador inclui os nomes no perfil derivado.
2. O implementador recebe disciplina Node/web e QA; o especialista de qualidade recebe uma
   matriz de aceitação por contraexemplo; segurança recebe método de revisão de autenticação,
   autorização, dados, integração, rede e recuperação. O revisor de entrega usa qualidade e
   segurança para confrontar o candidato.
3. Skill não amplia permissões. Sandbox, cartão, política, procedimento e revisão continuam
   tendo precedência. Nenhuma skill concede execução externa, acesso a segredo, conta,
   infraestrutura, deploy ou integração Nuvemshop.
4. O plano passa à versão 3 e exige `rolesDigest`, calculado do catálogo inteiro. Alterar
   missão, sandbox, limites ou skills invalida plano em voo. O candidato já confrontava o
   digest de papéis; agora a autorização do plano também o confronta.

## Consequências

- Há uma associação auditável entre papel e método, e teste que assegura que o perfil gerado
  permanece alinhado ao catálogo.
- Mudanças de skill/papel exigem regenerar perfis, atualizar o digest do exemplo e refazer
  qualquer plano real. Esta é uma recusa deliberada, não uma migração automática.
- A linguagem de "100% seguro" ou "tudo validado" é proibida como conclusão. O resultado é
  evidência delimitada, achado reproduzível ou lacuna explícita.

## Limites

O repositório não prova que o host descobriu uma skill, aplicou sandbox, executou hook ou
conferiu revisão humana. Essas propriedades dependem de configuração confiável do host e
proteções externas. As skills ajudam a tornar a execução consistente; não substituem teste em
ambiente hospedado, revisão humana ou controles do provedor.

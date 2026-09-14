---
name: tramevia-ci-cd-supply-chain
description: Projetar, implementar ou revisar CI/CD e cadeia de suprimentos do Tramevia. Use para workflows, dependências, artefatos, permissões, ambientes, releases e evidência de proveniência.
---

# CI/CD e cadeia de suprimentos

Esta skill melhora o desenho da esteira; não concede segredo, token, permissão de repositório,
aprovação, deploy ou alteração de configuração de provedor.

1. Separe build/teste de ações privilegiadas. PR de origem não confiável não recebe segredo,
   token de escrita, deploy ou checkout de código não confiável em contexto privilegiado.
2. Dê a cada job a menor permissão necessária. Fixe actions e workflows externos em SHA completo
   verificado, evite interpolar conteúdo de issue/PR em shell e trate artefato como dado não
   confiável até ser validado.
3. Fixe runtime e dependências por lockfile; registre origem, versão e resultado do build. Toda
   atualização de dependência, action, workflow ou regra de gate recebe revisão como superfície
   de controle.
4. Faça o fluxo promover o mesmo artefato verificável entre ambientes, com checks específicos
   por etapa. Não reconstrua um artefato diferente e o chame de homologado. Proveniência/SBOM ou
   atestação entram somente se plano, permissão e plano do GitHub permitirem.
5. Para release e rollback, declare gatilho, responsável, artefato, configuração versionada,
   observação pós-release e retorno seguro. Rollback de aplicação não desfaz migração ou efeito
   externo sem plano próprio.

Devolva mapa de permissões, dependências, artefatos e gates, com verificações que a CI realmente
executa. Pare diante de secret, credencial, configuração remota ou deploy sem autorização.

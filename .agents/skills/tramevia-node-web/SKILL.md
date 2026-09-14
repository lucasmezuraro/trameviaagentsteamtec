---
name: tramevia-node-web
description: Implementar ou revisar uma fatia Node.js, TypeScript, JavaScript, Next.js ou React do Tramevia com escopo pequeno, contratos explícitos e evidência no SHA candidato.
---

# Entrega Node e web

Use esta skill para uma tarefa de implementação já autorizada no cartão. Ela não concede
acesso a produção, Nuvemshop, credenciais, banco real, portas locais ou deploy.

1. Confirme no repositório real o runtime, lockfile, scripts, framework e convenções. Não
   suponha versão de Node, Next.js, TypeScript ou biblioteca e não acrescente dependência ou
   serviço sem requisito, justificativa e escopo no cartão.
2. Delimite contratos nas fronteiras: entrada validada no servidor, tipos de domínio separados
   da interface, erros previsíveis e dados mínimos. Nunca trate dados do navegador, rota,
   webhook ou fila como identidade/autorização.
3. Para páginas e APIs, autorize cada ação no servidor e por tenant; não envie segredo, token,
   dado de outro tenant ou regra de decisão para bundle cliente. Prefira dados de exemplo para
   telas didáticas.
4. Escreva primeiro o teste que falha pela razão certa. Cubra o caminho de sucesso, o erro mais
   provável e a fronteira de autorização ou consistência indicada pelo cartão.
5. Faça a menor alteração que satisfaz o teste. Execute somente checks declarados, no SHA que
   será entregue, e registre versão, resultado, limitações e itens não observados no handoff.

Pare se precisar mudar contrato externo, abrir porta, usar segredo, chamar serviço externo,
alterar escopo ou decidir comportamento de segurança. Encaminhe esses pontos ao coordenador e
ao revisor de segurança; não os contorne com variável de ambiente, feature flag ou mock.

---
name: tramevia-security-review
description: Revisar mudanças do Tramevia que afetam autenticação, autorização, dados, integrações, infraestrutura ou automação, com ameaças explícitas, reprodução e limites de evidência.
---

# Revisão de segurança baseada em evidência

Use em leitura sobre o SHA candidato e a política da base confiável. Esta skill não é pentest,
certificação, aprovação humana nem autorização para escanear, explorar, chamar fornecedores ou
acessar segredos.

1. Declare ativos, atores, fronteiras de confiança e o dano plausível. Percorra cada fluxo:
   entrada externa, sessão/identidade, autorização por ação e tenant, segredo, persistência,
   fila/webhook, egress e recuperação.
2. Para login e sessão, procure validação no servidor, expiração/revogação, proteção contra
   fixação e reutilização, cookies e redirecionamentos seguros quando existirem, e autorização
   independente para toda ação sensível. Identidade de suporte nunca substitui a do cliente;
   ações precisam registrar o ator real.
3. Para integração entre servidores, confirme contrato de origem, autenticação/verificação de
   mensagem, validade temporal, deduplicação e falha segura. Não aceite `tenantId`, papel,
   URL de retorno ou preço vindo do cliente como fato confiável.
4. Para dados e segredos, procure vazamento em bundle, log, erro, teste, artefato, backup e
   variável de ambiente. Segredos não entram em código, fixture, comentário, URL ou saída de
   comando; dados de cliente não entram na massa de testes.
5. Para rede e infraestrutura, procure listener, túnel, proxy, SSRF, egress amplo, permissões
   excessivas, dependência não fixada e endpoint administrativo exposto. O MVP não abre porta
   no computador do operador; qualquer ambiente hospedado é decisão explícita fora desta skill.
6. Para retomada, procure restauração que reative acesso, publicação ou integração antes de
   validação humana. Restore deve iniciar em retenção segura e preservar trilha auditável.

Devolva achados P0/P1/P2 com reprodução mínima, consequência, SHA e controle que falhou. Se
não houver evidência suficiente, declare a lacuna; nunca conclua que o sistema está seguro ou
que todos os eixos foram validados.

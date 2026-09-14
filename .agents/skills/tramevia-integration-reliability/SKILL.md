---
name: tramevia-integration-reliability
description: Projetar, implementar ou testar integrações confiáveis do Tramevia com Nuvemshop, filas, webhooks e APIs. Use para contratos externos, inbox/outbox, idempotência, retry, reconciliação e estados unknown.
---

# Integrações confiáveis

Esta skill trabalha sobre contrato documentado e ambiente autorizado. Ela não permite chamar
Nuvemshop, criar app, usar token, abrir porta ou executar escrita remota fora do cartão.

1. Fixe versão e origem do contrato externo. Declare evento/rota, autenticação, campos
   confiáveis, limite de taxa, timeout, resposta, efeito remoto e como obter suporte do
   fornecedor. Campo não documentado é dúvida, não base de decisão.
2. Faça a entrada ser verificável e repetível: valide origem e mensagem conforme o contrato,
   preserve corpo necessário para auditoria sem segredo, deduplique por identidade do evento e
   aplique autorização/tenant antes de persistir efeito.
3. Separe intenção local do efeito externo com inbox/outbox transacional. Uma chave local não
   prova que o fornecedor não executou; timeout, conexão interrompida e resposta ambígua viram
   `unknown`, nunca retry cego nem rollback remoto inventado.
4. Defina estados, orçamento de tentativa, backoff, fila de falha e reconciliação de leitura.
   Uma escrita só pode ser repetida depois de provar idempotência no contrato ou reconciliar o
   estado remoto.
5. Nos testes, simule sucesso, duplicata, reordenação, atraso, limite, falha parcial e timeout.
   A primeira fatia do MVP fica em shadow e numa variação unmanaged; publicação é decisão
   posterior, com evidência do ambiente hospedado.

Devolva máquina de estados, tabela de efeitos e ensaios que refutam duplicidade/perda. Pare
quando faltar contrato, ambiente autorizado ou decisão de efeito remoto.

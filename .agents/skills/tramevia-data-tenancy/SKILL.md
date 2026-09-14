---
name: tramevia-data-tenancy
description: Projetar, implementar ou revisar dados multi-tenant, migrações e trilhas de auditoria do Tramevia. Use quando houver schema, Postgres, RLS, ledger, retenção, exportação ou restauração.
---

# Dados, tenant e migrações

Use a skill apenas para o risco declarado no cartão. Ela não autoriza conexão a banco real,
migração de produção, consulta de dado de cliente, exportação ou restauração.

1. Liste o proprietário de cada registro, a chave de tenant, o ator que altera, a finalidade,
   prazo de retenção e o caminho de leitura/escrita. Sem essa tabela, não trate isolamento como
   provado.
2. Imponha isolamento em mais de uma camada quando o produto o exigir: autorização no servidor,
   chave/foreign key que preserva tenant, e política RLS testada com pool reutilizado. Filtro na
   interface não é isolamento.
3. Para regra financeira ou ATP, use valores inteiros, restrições verificáveis, ledger imutável
   e transação que preserve o invariante. Registre o ator real e o motivo; suporte não se passa
   pelo administrador da loja.
4. Trate migração como mudança reversível somente quando a reversão for demonstrada. Ensaios
   usam banco efêmero hospedado, schema descartável e massa sintética. Prepare compatibilidade,
   rollback lógico, verificação pós-migração e plano de recuperação antes de alterar produção.
5. Para backup/exportação/restore, minimize dados, separe acesso, verifique integridade e
   inicie em retenção segura. Restore não reativa sessão, publicação ou integração por conta
   própria.

Devolva modelo de dados, invariantes, contraexemplos cross-tenant e evidência de migração ou
lacuna. Pare diante de dado real, decisão de retenção ou operação de banco não autorizada.

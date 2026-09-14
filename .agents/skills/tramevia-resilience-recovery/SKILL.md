---
name: tramevia-resilience-recovery
description: Desenhar ou revisar observabilidade, incidentes, backup, restauração e retomada segura do Tramevia. Use para falhas, filas, checkpoints, recuperação, SLO/RPO/RTO e provas operacionais.
---

# Resiliência e recuperação

Skill para desenho e evidência. Não inicia restore, altera backup, acessa produção, captura PII
ou declara RPO/RTO sem exercício medido.

1. Descreva o estado que pode falhar, o último ponto durável, o proprietário, o sinal de
   detecção e a ação segura inicial. Telemetria usa IDs, SHA e referências saneadas; nunca
   prompt bruto, cookie, token, chave ou dado de loja.
2. Defina falhas explicitamente: processo interrompido, execução desconhecida, evidência
   ausente, fila atrasada, dependência indisponível, dado corrompido e resultado externo
   incerto. "Continuar" exige reconciliação; retomar uma tarefa não revive autorização antiga.
3. Para backup, determine dados incluídos/excluídos, destino independente, acesso separado,
   integridade, retenção, responsável e custo. Git e artefato de CI não são backup completo por
   definição.
4. Para restauração, ensaie em cópia isolada: validar integridade e versão, restaurar,
   executar checks, reconciliar pendências e medir perda/tempo. O produto retorna primeiro a
   `RECOVERY_HOLD`; sessões, publicações e efeitos externos só retornam com ato humano.
5. Registre incidente, linha do tempo, impacto, evidência, correção e contramedida. Um ensaio
   que não mede o resultado é descoberta, não prova de recuperação.

Devolva runbook e cenário verificável, com RPO/RTO medidos ou marcados como desconhecidos.
Pare quando exigir acesso operacional ou decisão de continuidade do negócio.

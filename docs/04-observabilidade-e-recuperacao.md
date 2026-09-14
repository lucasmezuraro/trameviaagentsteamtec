# 04 · Operação observável e continuidade

## O que acompanhar

O fundador precisa saber: qual objetivo está sendo trabalhado, por quem, há quanto tempo,
o que foi comprovado, o que bloqueia e qual decisão cabe a ele. Conversa longa e contagem
de mensagens não medem avanço. O mapa HTML desta entrega é didático, sem telemetria real.

Evento mínimo do futuro executor:

```json
{
  "event_id": "unique-event-id",
  "occurred_at": "2026-09-14T12:00:00Z",
  "task_id": "F0-01",
  "run_id": "run-02",
  "generation": 2,
  "actor_id": "authenticated-subject",
  "role": "implementer",
  "kind": "candidate",
  "repository": "lucasmezuraro/tramevia",
  "base_sha": "full-sha",
  "candidate_sha": "full-sha",
  "plan_digest": "sha256",
  "policy_digest": "sha256",
  "roles_digest": "sha256",
  "result": "recorded",
  "reason_code": "tests_completed",
  "evidence_ref": "sanitized-artifact-reference",
  "usage": null
}
```

Exemplo de contrato, não evento já coletado. Supervisor autentica ator, emite sequência
monotônica por run e rejeita evento repetido/geração obsoleta antes de mudar estado.
Não guardar raciocínio interno, prompts brutos, chaves, cookies ou dados de loja.

| Indicador | Cálculo | Uso |
|---|---|---|
| Lead time | integrado - tarefa preparada | identificar espera; exibir distribuição, não promessa |
| Tempo bloqueado | soma dos intervalos blocked/unknown | dependências e decisões faltantes |
| Retrabalho | candidatos devolvidos / candidatos revisados | qualidade do cartão/teste; não punir achados |
| Taxa de falha | runs failed / runs encerrados | separar infraestrutura de comportamento |
| Custo por entrega | consumo confirmado dos runs / entregas integradas | desconhecido continua desconhecido |
| Aderência | tarefas com evidências completas / tarefas avaliadas | numerador auditável; sem inferir segurança total |
| Falhas escapadas | defeitos descobertos após integração | revisar oráculo e arquitetura |
| Fila envelhecida | idade por tarefa pronta | reduzir WIP e resolver gargalo |

Não inventar duração restante ou tokens exatos. Inicialmente observar dez tarefas e
definir metas a partir da amostra, discriminando complexidade; não alegar SLO já atingido.
Duração de 45 minutos e duas tentativas no laboratório são tetos didáticos configuráveis,
não garantia de consumo da API. Executor real precisará impor orçamento antes de dispatch.

## Detecção e resposta

| Cenário | Resposta imediata | Retomada |
|---|---|---|
| Modelo/host desconectou | marcar interrupted_unknown; conservar posse do escritor | comprovar encerramento, conferir diff, novo run |
| Teste falhou | preservar diagnóstico e candidato | correção delimitada; novo SHA e revisão |
| Git divergiu | parar integração | branch de reconciliação e testes no resultado |
| Evidência sumiu | candidato deixa de ser elegível | reexecutar ensaio, não reconstruir “aprovado” de memória |
| Limite/custo esgotou | parar novas ferramentas e entregar handoff | novo orçamento/escopo autorizado |
| Segredo exposto | interromper, informar responsável e restringir artefato | revogar/rotacionar; apagar log não desfaz exposição |
| Provedor respondeu com resultado incerto | registrar unknown | consulta/reconciliação; sem repetir efeito não idempotente |
| Runner reiniciou | carregar checkpoint sem autorizações ativas | revalidar política, permissões, dependências e candidato |

Uma pausa não revoga efeitos já enviados. Cancelamento de CI evita custo, mas não é padrão
adequado para cancelar migrations/deploy em andamento. Não há execução contínua nesta versão.

## Backup do time e restauração

Código/config/contratos: Git remoto + cópia independente a estabelecer. Branch local
não enviada pode ser perdida. Artefatos/checkpoints reais futuros ficam fora do checkout,
em armazenamento com acesso separado e checksum; credenciais nunca integram a cópia.

Metas propostas para primeira operação: RPO de trabalho commitado/publicado igual ao
último push confirmado; checkpoint de execução a cada transição durável; RTO a definir
após um exercício medido. GitHub Actions/artifacts têm retenção finita; não presumir backup
independente. Primeira ativação deve fixar destino, retenção, chave, responsável e custo.

Ensaio: clone novo → valide integridade/versão → execute testes → recupere cartão e último
handoff → confira commits/artefatos → marque runs anteriores encerrados/unknown → revalide
acessos e dependências → crie novo run. Aprovações e leases não são restaurados como ativos.
Registre tempo/perdas reais e use templates/incident.md.

Backup do time não substitui backup do banco/ledger do produto. A recuperação Tramevia
continua regida por ADR 0007: RECOVERY_HOLD, reconciliação e retorno humano a shadow.

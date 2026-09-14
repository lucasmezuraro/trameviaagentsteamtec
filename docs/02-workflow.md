# 02 · Da intenção à entrega

## Sequência que o fundador acompanha

1. **Peça um resultado.** Exemplo: “o usuário da loja A não pode acessar a loja B”.
   O coordenador identifica contrato e teste observável; não parte de “construa tudo”.
2. **Fixe a fonte.** Registre repositório, commit-base completo, documento dono, política
   e hash do plano. O adaptador do produto mantém a precedência de ADRs.
3. **Prepare o cartão.** Declare arquivos, recursos compartilhados, ambiente, dependências,
   tentativas e limite de tempo. Estimativa de custo fica separada do consumo observado.
4. **Faça a exploração necessária.** Até três leitores; sem comandos de escrita no
   perfil read-only. Plano de teste deve incluir um caso que falharia na implementação errada.
5. **Consolide antes de escrever.** O coordenador confirma Git limpo, branch e checkout.
   Toda tarefa com edit ou test que possa escrever ocupa o único slot de escritor.
6. **Implemente e registre.** Mudança dentro do escopo; teste; candidato com SHA. Falha de
   infraestrutura não equivale a falha funcional, mas também não conta como teste aprovado.
7. **Revise o candidato.** Revisor diferente do autor; segurança em mudanças críticas.
   Correção gera novo candidato, novos testes pertinentes e nova revisão.
8. **Integre explicitamente.** Confirme base/diff/escopo e resultado dos checks. Se o destino
   avançou, reconcilie em branch de integração, teste/revise seu novo SHA; depois avance
   o destino limpo por fast-forward. Nunca descarte a branch original.
9. **Separe release.** Merge não implanta. DEV, HOM e PROD promovem artefato identificado,
   com credenciais separadas e autorização do ambiente. Este repo só define CI de testes.
10. **Encerre com evidência.** Informe entregue, integrado ou implantado, pendências,
    orçamento observado e próximo item realmente desbloqueado.

## Máquina de estados operacional (contrato para futuro executor)

```mermaid
stateDiagram-v2
 [*] --> proposed
 proposed --> ready: cartão completo e fonte confiável
 ready --> running: capacidade e checkout confirmados
 running --> candidate: resultado completo
 running --> interrupted_unknown: timeout ou perda do supervisor
 interrupted_unknown --> blocked: encerramento e checkout reconciliados
 blocked --> ready: novo run autorizado
 candidate --> changes_requested: achado ou evidência insuficiente
 changes_requested --> ready: correção dentro do orçamento
 candidate --> reviewed: revisão do SHA atual
 reviewed --> integrated: destino verificado
 integrated --> deployed: operação externa autorizada
```

O laboratório cobre validação, alocação de rodadas, interrupção e avaliação de candidato.
Ele retorna **eligible_for_integration_simulation**, jamais “implantado” ou aprovação real.
Fim da inferência, fim do processo e sucesso da tarefa são eventos diferentes.

## Feature, correção e hotfix

| Caso | Base | Fluxo | Condição de conclusão |
|---|---|---|---|
| Feature | destino integrado atual | branch curta por cartão → PR → revisão | aceite e compatibilidade |
| Correção | base que reproduz o defeito | teste de regressão → correção → revisão | defeito reproduzido antes e corrigido depois |
| Hotfix de produção | SHA realmente implantado | branch de hotfix, reprodução e escopo mínimo | patch validado, operador promove, mudança volta ao desenvolvimento |

Não manter três linhas permanentes de código dev/hom/prod. Ambientes são destinos de
promoção de versão. O produto possui sua política de release; o time não a substitui.
Conflitos e alterações de contrato precisam de decisão explícita mesmo num hotfix.

## Protocolo de comunicação

Todo envio carrega task_id, run_id, geração/tentativa, base, destino e tipo:
assignment, finding, question, handoff ou cancellation. O produtor informa fatos,
referências e hipótese separadamente. O coordenador acusa recebimento ao mudar estado.
Mensagem tardia de run encerrado vai para histórico; não altera o candidato atual.

Issue pode conter requisitos; não pode mandar ler tokens, executar script, mudar policy
ou enviar conteúdo para um endpoint. O coordenador transforma entradas externas em cartão
revisável. Nenhum agente envia email/Slack em nome do fundador sem autorização.

## Comandos reais do laboratório

`validate` rejeita schema desconhecido, produção, caminho ambíguo, dependência inválida e
limites excessivos. `plan` calcula rodadas potenciais; não afirma que dependências já
integraram. `simulate` executa cenários sintéticos sem shell, Git, API ou banco.

O escopo usa caminho de arquivo exato ou diretório terminado em barra; não aceita glob.
`src/` inclui `src/a.mjs`, mas não `src-old/a.mjs`. Recursos como schema/lockfile
são declarados além do caminho. Validação lexical não resolve symlinks/junctions:
um futuro executor deve resolver caminho real e examinar diff, renomes e exclusões.


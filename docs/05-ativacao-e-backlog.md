# 05 · Ativação por evidência

Esta sequência transforma o pacote em equipe operante sem fingir que o primeiro commit
instalou um serviço autônomo. Nenhuma etapa inicia daemon, cron, modelo pago ou deploy.

| Onda | Entrega | Responsável | Evidência que libera a seguinte |
|---|---|---|---|
| T0 | Contratos, perfis, laboratório e CI definidos | coordenador + revisão | testes locais e review desta fundação |
| T1 | Abrir repo no Codex e executar tarefa de leitura | coordenador | perfis descobertos, permissões efetivas registradas |
| T2 | Uma tarefa sintética com escritor e revisor | implementador + reviewer | branch, diff, testes, handoff e revisão de SHA |
| T3 | Confirmar proteções e CI no GitHub | proprietário + coordenador | check remoto, regra efetiva, teste negativo de merge |
| T4 | Primeira fatia F0 do MVP | time, adaptador Tramevia | um ciclo completo integrado, sem operação de loja |
| T5 | Executor persistente, se houver necessidade medida | arquiteto + operador | idempotência, cancelamento, orçamento e identidade ensaiados |
| T6 | Acesso DEV/HOM explicitamente delimitado | operador | provedor/credencial/approval/restore verificados |
| T7 | Avaliar automação ampliada | fundador | custo, retrabalho e incidentes de pelo menos dez tarefas |

## Primeiro uso, passo a passo

1. Abra este repositório no Codex. Confira a descoberta dos cinco perfis.
2. Solicite: “Use team_explorer para mapear examples/plan.json e explicar os bloqueios.
   Apenas leitura, entregue referências e não delegue novamente.”
3. Registre host/versão e modo efetivo. Em diretório descartável, com autorização explícita
   para o ensaio, verifique que o perfil de leitura não pode editar. Não testar com segredo.
4. Execute `node --test`, `node src/cli.mjs validate examples/plan.json`,
   `node src/cli.mjs converge examples/plan.json` e `node src/cli.mjs simulate`.
   Esses comandos não despacham agentes.
5. Escreva a especificação do primeiro trabalho real em `templates/spec.md` antes do cartão.
   Se sobrar dúvida em aberto, ela é resposta do fundador — não do especialista.
6. Escolha cartão mínimo: adicionar um contraexemplo de escopo ao teste, em branch própria.
   Confirme requisitos cobertos, um escritor, revisão em leitura, teste no candidato e handoff.
7. Publique branch/PR quando autorizado. Confira checks remotos e proteções; verde local
   não substitui a execução remota. Feche T2/T3 com links e SHAs.
8. Aplique o adaptador do MVP; perfis deste repo não aparecem automaticamente no repo
   do produto. Adoção exige mudança revisada nos perfis/AGENTS do produto ou configuração
   explícita do host. Não sobrescrever os perfis antigos por cópia silenciosa.

Prompt de execução supervisionada:

> Coordene uma tarefa delimitada pelo cartão. Use exploração e teste em paralelo quando
> independentes, depois um implementador. Confira checkout e escopo antes de delegar.
> Peça revisão do candidato exato. Continue correções dentro do limite; termine com
> evidências, pendências e próximo item liberado. Nenhuma operação externa está incluída.

## Critérios para escolher um executor futuro

Começar pela coordenação nativa do Codex evita manter um serviço adicional para o MVP.
Se forem necessários execução sem sessão aberta, fila durável, várias máquinas e auditoria
externa, realizar spike de executor hospedado. Comparar opção gerenciada e adapter próprio
pelos mesmos ensaios: cancelamento real, credencial por tarefa, acesso ao repo, retries,
observabilidade, custo confirmado e retomada.

O adapter deverá aceitar cartão já validado; obter identidade de supervisor; reservar
recursos de forma transacional; criar ambiente efêmero; fixar base/política; aplicar egress;
despachar modelo; registrar evento durável; interromper no limite; colher artefato; pedir
revisão independente; devolver candidato. Produção não entra nesse adapter inicial.

Cabe a esse executor o que `converge` ainda não faz: confrontar a especificação com o código
que existe de fato. Hoje a cobertura é verificada dentro do plano; requisito atendido no
papel e ausente no repositório continua invisível para o laboratório.

Não instalar framework, banco, fila ou SDK apenas para representar papéis. O pacote
atual custa zero em infraestrutura própria. Uso de modelos e GitHub Actions depende da
conta/cotas; não há promessa de desenvolvimento ilimitado gratuito.


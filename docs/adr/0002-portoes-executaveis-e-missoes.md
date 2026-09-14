# ADR 0002 · Portões executáveis e missões delimitadas

Data: 2026-09-14. Estado: aceito. Não concede autoridade nova a nenhum papel; transforma
parte das regras escritas em recusa automática e estreita o que cada missão pode fazer.

## Contexto

Até aqui, **100% das regras do time eram texto**. O modelo em `src/` sabia avaliar um
candidato, mas só recebia evidência sintética: quem estava sendo julgado também fornecia os
fatos sobre si mesmo. O achado R01 já registrava a confusão entre instrução e isolamento, e
o `docs/03` já dizia em voz alta que "uma persona bem instruída não substitui isolamento".

Faltavam duas coisas diferentes, que costumam ser confundidas:

1. **Enforcement** — alguma coisa, fora do alcance do agente, que recuse a mudança.
2. **Delimitação de missão** — cada papel saber onde começa, onde termina e quando devolver.
   Os perfis diziam a atribuição, mas não a condição de entrada, a de conclusão nem a de
   parada; e mandavam "leia README, docs/01, 02, 03 integralmente antes de agir", que é caro,
   frágil e não escala.

## Decisão

### 1. Separar quem observa de quem julga

`scripts/observe.mjs` é o único arquivo que roda git. Ele **observa e não conclui**:
coleta base, candidato, caminhos alterados, declarações e checks, e nada mais. `src/` continua
puro (D02) e apenas avalia a observação recebida. A separação é o ponto: o julgado não coleta
os fatos sobre si mesmo.

O que o coletor não consegue ver vira campo ausente, nunca um padrão favorável. Lista de
aprovações vazia significa "não observado", não "ninguém precisou aprovar".

### 2. Dois portões, com fronteiras diferentes

| Portão | Pergunta | Onde vale |
|---|---|---|
| `guard` | esta mudança mexe na superfície de controle sem declarar? | este repositório, hoje, na CI e no pre-push |
| `gate` | este candidato observado cabe no cartão que o plano autorizou? | repositório do produto, quando houver plano |

`gate` é o irmão não sintético de `assessCandidate`: mesmas perguntas, fatos coletados em vez
de fornecidos.

### 3. A declaração é um trailer de commit

Mudança que toca `AGENTS.md`, `team/`, `.codex/`, `.github/`, `src/`, `test/`, `scripts/`,
`hooks/` ou `procedures/` exige no histórico:

```
Control-Surface: docs/adr/NNNN-titulo.md
```

O ADR precisa existir na árvore. Escolhemos trailer em vez de arquivo de declaração porque o
trailer é por mudança, é imutável depois do commit e fica ao lado do diff que ele justifica —
um arquivo precisaria ser zerado a cada entrega e diria respeito a nada em particular.

### 4. Nenhum resultado se chama "aprovado"

O status de sucesso é `clear_on_observable_facts`, e todo resultado traz uma lista
`unverified`. Identidade do ator, isolamento efetivo do sandbox e "o requisito foi atendido"
nunca entram na lista de verificados, porque nada aqui consegue observá-los.

### 5. Missão delimitada em cinco campos, e procedimento em vez de leitura total

`team/roles.json` passa a declarar, por papel: `mission`, `entry`, `output`, `done`, `stop`,
`forbidden` e `procedure`. `procedures/*.md` carrega o passo a passo de cada missão — pequeno,
específico e carregado por quem vai executá-la, no lugar de "leia a documentação inteira".

Os perfis em `.codex/agents/` passam a ser **artefato derivado** do catálogo, gerado por
`scripts/render-profiles.mjs`. Duas descrições da mesma missão divergem, e a que o agente
carrega é justamente a que ninguém revisou. Um teste regenera e falha em qualquer diferença.

## Consequências

- `team/policy.json` vai para a versão 2: três diretórios novos na superfície protegida.
  Isso muda o `policyDigest` e, por construção, invalida todo plano fixado na versão anterior.
- Esta mudança se submete à própria regra: o commit que a introduz carrega o trailer
  apontando este ADR.
- Editar uma missão exige regenerar os perfis; esquecer quebra o build, que é o objetivo.
- O `pre-push` é conveniência do autor, não controle: quem edita o hook pode apagá-lo e
  `--no-verify` o ignora. O que segura é o mesmo avaliador rodando na CI, onde o autor não é
  dono do runner.

## Limites desta decisão

`guard` não lê o conteúdo do ADR declarado: confere que o caminho tem forma de ADR e que o
arquivo existe. Declarar mal continua possível; fica no histórico, com autor e data, que é o
que torna a fraude cara em vez de impossível.

A CI ainda roda com `contents: read` e sem consultar a API de revisões: aprovação humana
continua não observada e, portanto, não verificada. Fechar esse ponto depende de proteção de
branch e revisão obrigatória configuradas no GitHub — ato do proprietário, fora do código.

Nada aqui torna o time autônomo. Continua não havendo despacho, execução ou orçamento medido;
o portão apenas garante que, quando alguém agir, sair do combinado custe uma recusa.

# Procedimento · Implementação

Missão: transformar um cartão delimitado em um candidato pequeno, testado e revisável.
Único papel com escrita, e um por rodada.

## Entrada obrigatória

Cartão preparado com requisitos cobertos, commit-base, escopo de arquivos e recursos,
orçamento e critério de parada. Slot de escritor reservado pelo coordenador.

## Passos

1. Confirme árvore limpa, branch própria e checkout no commit-base. "Use uma worktree" não
   cria uma worktree; verifique.
2. Escreva primeiro o teste que falha pelo motivo certo. Se ele passa antes da mudança, ele
   não está testando o requisito.
3. Faça a menor mudança que faz esse teste passar, dentro do escopo declarado.
4. Se for preciso tocar arquivo fora do escopo: **pare e devolva**. Registre a necessidade
   no handoff. Ampliar escopo em silêncio é o defeito mais caro deste papel.
5. Se a mudança tocar a superfície de controle (AGENTS, `team/`, `.codex/`, `.github/`,
   `src/`, `test/`, `scripts/`, `hooks/`, `procedures/`), declare no commit:
   `Control-Surface: docs/adr/NNNN-titulo.md`. O ADR precisa existir.
6. Rode os checks do cartão no SHA que você vai entregar, não em um anterior.
7. Preencha o handoff incluindo o que **não** foi verificado. Omitir limitação é pior que
   não ter testado.

## Devolve

Candidato com SHA, diff dentro do escopo, resultado dos checks e handoff.

## Pare quando

For preciso sair do escopo, o orçamento acabar, a autoridade ficar incerta ou aparecer
decisão de produto.

## Erro clássico que este procedimento evita

Terminar a tarefa "quase toda" e chamar de pronto. Candidato é um estado verificável, não um
grau de satisfação: ou o diff cabe no escopo e os checks passaram no SHA entregue, ou não.

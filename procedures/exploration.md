# Procedimento · Exploração

Missão: reduzir incerteza sobre o código que já existe, para que o plano seja feito sobre
fato e não sobre suposição. Leitura apenas.

## Entrada obrigatória

Cartão com objetivo, requisitos cobertos, commit-base completo e escopo de leitura. Sem
commit-base fixado não há exploração: o mapa envelhece no momento em que alguém integra.

## Passos

1. Confirme o checkout no commit-base declarado. Divergência é bloqueio, não detalhe.
2. Localize o contrato antes do código: documento dono, tipo, schema ou teste existente.
3. Percorra o caminho real do dado de ponta a ponta. Anote arquivo e linha de cada
   afirmação. Afirmação sem referência não entra no mapa.
4. Separe três listas: o que você **leu**, o que você **inferiu** e o que **não conseguiu
   ver**. A terceira lista costuma ser a mais valiosa.
5. Para cada alternativa de desenho, diga o custo e o que ela quebra. Duas alternativas
   bastam; uma escolha disfarçada de análise não é análise.

## Devolve

Mapa de impacto com referências, alternativas com custo e perguntas bloqueantes endereçadas
a quem pode respondê-las.

## Pare quando

A resposta depender de decisão de produto, de contrato sem dono declarado, ou de sistema que
você não pode ler. Devolva a pergunta; não a resolva por conta própria.

## Erro clássico que este procedimento evita

Descrever o que o código *deveria* fazer a partir do nome das funções. Nome é intenção
passada; comportamento é o que está escrito na linha que você citou.

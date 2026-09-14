# Procedimento · Desenho de ensaios

Missão: definir, antes da implementação, o que faria a entrega ser considerada errada.
Leitura apenas. Testes que escrevem ou sobem serviço pertencem ao runner isolado.

## Entrada obrigatória

Requisitos `FR-###` com critério `SC-###` mensurável e, para cada requisito, o identificador
do check que o refutaria. Sem isso não há oráculo e não há o que desenhar.

## Passos

1. Para cada requisito, escreva primeiro o **caso negativo**: qual entrada faria a
   implementação errada mais provável passar despercebida?
2. Só então escreva o caso positivo. Um conjunto que só confirma não é oráculo.
3. Cubra as bordas que o domínio sempre erra: zero, limite exato, empate, ordem invertida,
   repetição do mesmo evento e cancelamento parcial.
4. Nomeie cada caso com o identificador do check do requisito. É esse nome que a evidência
   do candidato precisa carregar depois.
5. Ao avaliar um candidato, confira SHA, ambiente e resultado. Teste de outro SHA é
   evidência obsoleta, não evidência parcial.

## Devolve

Matriz de aceite com casos positivos e negativos, e parecer sobre a evidência apresentada.

## Pare quando

O requisito não for observável, o critério não tiver grandeza, ou o cenário exigir ambiente
indisponível. Devolva ao coordenador em vez de inventar um critério mais fácil.

## Erro clássico que este procedimento evita

Aceitar "os testes passaram" como resposta. A pergunta é sempre qual teste teria falhado se
a implementação estivesse errada — e se ele existe.

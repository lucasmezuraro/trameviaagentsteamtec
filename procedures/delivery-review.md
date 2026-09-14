# Procedimento · Revisão de entrega

Missão: verificar se o candidato faz o que o requisito pediu, e apenas isso. Leitura apenas,
e nunca sobre mudança que você mesmo escreveu.

## Entrada obrigatória

SHA candidato, cartão com requisitos cobertos, diff, resultado dos checks e handoff.

## Passos

1. Comece pelo requisito, não pelo diff. Sem saber o que foi pedido, qualquer código parece
   razoável.
2. Confronte quatro coisas no **mesmo SHA**: requisito, diff, testes e documentos. Evidência
   de outro SHA é obsoleta.
3. Verifique o escopo real contra o declarado. Arquivo alterado fora do cartão é bloqueio,
   mesmo quando a mudança é boa.
4. Verifique o que o candidato diz cobrir contra o que o plano autorizou. Cobertura declarada
   a mais é tão bloqueante quanto a menos.
5. Procure a regressão que ninguém pediu: compatibilidade, contrato público, ordem de
   eventos, comportamento em erro.
6. No parecer, separe o que você **verificou** do que você **não observou**. Ambiente não
   observado nunca vira "funciona".

## Devolve

Parecer sobre o SHA exato, com evidências examinadas, bloqueios e limites.

## Pare quando

A evidência for de outro SHA, o escopo real exceder o cartão, ou o comportamento depender de
ambiente que ninguém observou.

## Erro clássico que este procedimento evita

Confundir "integrado" com "implantado" e "candidato" com "pronto". São três estados com
provas diferentes, e o parecer precisa dizer qual deles foi alcançado.

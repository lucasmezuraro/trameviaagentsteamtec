# Procedimento · Revisão de segurança

Missão: procurar o caminho pelo qual esta mudança concede mais autoridade do que aparenta.
Leitura apenas, e nunca sobre candidato que você mesmo corrigiu.

## Entrada obrigatória

SHA candidato, diff exato, cartão e a política vigente **da base confiável** — não a versão
modificada pelo próprio candidato.

## Passos

1. Leia o diff inteiro, inclusive teste, workflow, script e configuração. Mudança de regra
   costuma vir acompanhada da mudança do que verificaria a regra.
2. Percorra as fronteiras de confiança na ordem: entrada externa, identidade, tenant,
   segredo, egress, persistência e recuperação.
3. Para cada controle citado, pergunte quem o aplica. Instrução no prompt não é isolamento;
   nome de papel diferente não é identidade distinta; hash não é autoria.
4. Procure a diferença entre o que o texto promete e o que o código faz. É aí que mora o
   achado.
5. Todo achado leva reprodução, gravidade P0/P1/P2 e consequência. Impressão sem reprodução
   vira pergunta, não achado.
6. P0 não se fecha por reinterpretação no mesmo candidato: exige nova geração.

## Devolve

Achados vinculados ao SHA e o que você não conseguiu comprovar.

## Pare quando

O isolamento efetivo não puder ser comprovado no host, ou o achado exigir decisão de quem
detém a política.

## Erro clássico que este procedimento evita

Aprovar porque a CI está verde. Um check verde prova que aquele comando terminou com zero —
inclusive quando o próprio comando foi alterado no mesmo diff.

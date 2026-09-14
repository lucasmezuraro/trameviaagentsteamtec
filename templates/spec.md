# Especificação

Preenchida antes do plano e antes de qualquer cartão. Descreve o resultado observável,
não a implementação. Se algo ficou implícito, ele vai para "Dúvidas abertas" — e enquanto
houver uma linha ali, nenhum plano derivado desta especificação é válido.

- ID / projeto:
- Documento dono e revisão fixada:
- Solicitante e data:

## Resultado pretendido

Uma frase sobre o que passa a ser verdade quando isto estiver pronto. Sem tecnologia.

## Critérios de sucesso

Cada critério precisa de uma grandeza; "ficar melhor" não é critério.

| ID | Enunciado | Medida |
|---|---|---|
| SC-001 | | |

## Requisitos funcionais

Cada requisito aponta um critério e nomeia **o teste capaz de refutá-lo**. Esse
identificador é o que amarra requisito → tarefa → evidência do candidato.

| ID | Enunciado (o sistema deve…) | Critério | Evidência |
|---|---|---|---|
| FR-001 | | SC-001 | |

## Fora do escopo

O que foi pedido e não será feito, com motivo. Declarar reduz retrabalho de revisão.

## Premissas

Decisões tomadas na ausência de informação. Cada premissa errada é um risco conhecido;
premissa não escrita é um defeito futuro sem dono.

## Dúvidas abertas

Enquanto existir qualquer item aqui, `validate` rejeita o plano. Resolver é ato de quem
tem autoridade sobre o contrato, não do especialista que encontrou a dúvida.

- [ ]

---

O bloco `spec` de `examples/plan.json` é a forma executável deste documento; o texto acima
acrescenta contexto e não concede permissão. Conferir com `node src/cli.mjs converge`.
Termos vagos (rápido, robusto, eficiente, adequado, "etc") são recusados pelo validador.

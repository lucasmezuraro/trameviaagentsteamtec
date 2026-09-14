---
name: tramevia-quality-assurance
description: Projetar e avaliar evidências de qualidade do Tramevia com matriz de aceitação, casos que refutam comportamento incorreto e cobertura de segurança, resiliência e acessibilidade quando aplicável.
---

# Qualidade orientada por refutação

O objetivo não é prometer cobertura total. O objetivo é tornar explícito qual comportamento
errado cada ensaio detecta e qual risco ainda não foi observado.

1. Converta cada `FR-###` e `SC-###` do cartão em caso observável, oráculo, dado de teste e
   evidência esperada. Sem critério mensurável, devolva dúvida aberta.
2. Para cada fluxo, comece pelo contraexemplo: entrada inválida, limite, repetição, ordem
   invertida, timeout, erro parcial ou ator sem autorização. Depois descreva o caso positivo.
3. Avalie os eixos aplicáveis e registre os não aplicáveis com motivo: funcional, autorização
   e isolamento de tenant, integridade/concorrência/idempotência, recuperação, privacidade,
   acessibilidade, compatibilidade e orçamento de desempenho.
4. Exija massa sintética, determinística e sem credenciais ou dados de clientes. Uma integração
   real só entra em ambiente hospedado e descartável quando o cartão autorizar.
5. Ao revisar evidência, confronte SHA, base, ambiente, versão de dependência, resultado e
   oráculo. Check verde de outro SHA, sem oráculo, ou não executado é lacuna, não aprovação.

Devolva uma matriz que mostre requisito, risco, caso negativo, caso positivo, check, evidência
e limitação. Achado bloqueante deve ter reprodução mínima e gravidade; hipótese vira pergunta.

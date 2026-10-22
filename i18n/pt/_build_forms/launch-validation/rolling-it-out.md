---
layout: default
title: Implementação gradual
parent: Validação no lançamento
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Implementação gradual
{: .no_toc }

Passar uma instância para enforce, e as limitações conhecidas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Implementação gradual

`enforce` é a predefinição. Numa instância com scripts ou outros sistemas que lançam formulários por
REST, chegue lá por passos, observando o registo antes de recusar seja o que for:

1. Defina `LAUNCH_VALIDATION=log` para toda a instância (antes de atualizar, numa atualização).
2. Funcione neste modo durante algum tempo e reveja o registo: os avisos `would refuse` indicam lançamentos
   que violam as regras; os avisos `extravars differ` indicam formulários que calculam algo
   de forma diferente no servidor (um carimbo temporal, dados externos). Decida para cada formulário se isso
   importa.
3. Mude esses formulários para `launchValidation: enforce`. Quem chamava com valores inválidos ou
   extravars inventadas recebe agora um `422` com o motivo.
4. Quando todos os formulários se comportarem como esperado, remova `LAUNCH_VALIDATION` (ou defina-a como `enforce`) para toda a instância.

---

## Limitações

A validação no lançamento ainda não abrange tudo:

- **Os formulários com assistente** não podem ser relançados com alterações, e uma tarefa de assistente lançada antes da 7.0
  não pode ser relançada com `enforce` (não guardava os valores dos seus passos). O servidor MCP
  não pode lançar formulários com assistente.
- **A resolução de marcadores** no navegador ainda usa a sua própria cópia do código do servidor; em
  casos-limite raros (`__undefined__`, aspas dentro de expressões) os dois podem resolver um
  marcador de forma diferente. `log` revela essas diferenças.
- **As expressões `runLocal`** são executadas no motor JavaScript do navegador, no navegador, e numa
  sandbox no servidor; o mesmo código produz o mesmo resultado, exceto quando depende
  do fuso horário ou do idioma do navegador.

---

## Formulários com assistente

Um [assistente](../forms/wizard.html) é verificado passo a passo: o navegador envia os valores de
cada passo, e o servidor verifica cada passo que o utilizador submeteria com o seu próprio subformulário.

- Um passo é deixado de fora quando é `optional` e o utilizador o saltou, ou quando o seu `when` é falso.
- Um passo lê os passos anteriores através de `$(__parent__.<step>.<field>)`, com os seus valores verificados.
- Os erros indicam o passo e o campo, como `<step>.<field>`.
- Com `enforce`, as extravars são construídas no servidor, cada passo sob o seu `defaultModel`.
- Os campos de ficheiro não são suportados num assistente.

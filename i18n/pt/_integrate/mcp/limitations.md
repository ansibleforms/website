---
layout: default
title: Limitações
parent: Servidor MCP
nav_order: 3
translated_from: 619aa0f8cd31ac0038d76dd8e6f75a0a9dffe089
---

# Limitações
{: .no_toc }

As expressões executadas no servidor, e o que o servidor MCP não faz
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Expressões runLocal

As expressões `runLocal`, os campos `local` / `credential` / `html` e as predefinições `evalDefault` são
avaliados no servidor, num contexto V8 separado: sem `process`, `require`, rede nem
temporizadores, sem compilação de strings em código, com um limite de tempo de 2 segundos, e apenas com as funções
auxiliares que o navegador oferece (`fnArray`, `fnGetNumberedName`, `fnToTable`, ...).

Isto protege contra expressões com erros ou descontroladas. Não é uma sandbox para código hostil,
nem precisa de ser: o código vem da definição do formulário, nunca de quem chama o MCP,
e cada valor que quem chama envia é substituído como um literal JavaScript.

Uma expressão que usa uma API do navegador (`window`, `document`, `fetch`) não pode ser executada aqui e
devolve `status: error`.

As expressões do lado do servidor (sem `runLocal`) passam pelas mesmas
regras de [`EXPRESSION_SANITIZER`](../customization) que no navegador.

---

## Limitações

Alguns formulários e campos ainda não podem ser usados através do servidor MCP:

- Os **formulários wizard** ainda não podem ser lançados. Os seus passos podem ser resolvidos com `subform`.
- Os **campos de ficheiro** não podem ser preenchidos; um formulário cujo campo de ficheiro tenha um valor é recusado.
- **Linhas de lista** (e um campo `yaml` com um subform, que é uma dessas linhas): cada linha que
  envia, exceto uma que tenha o `deleteMarker` da lista, é resolvida através do seu subform com
  os valores do formulário como `__parent__` e depois validada. Isto inclui listas aninhadas, onde
  `__parent__.__parent__` chega ao formulário. Envie linhas simples, ou seja, os valores brutos dos campos do
  subform. As linhas que falham são listadas por campo de lista em `rowErrors`
  (`vms[1].disks[0].size (missing)` na mensagem). São aceites no máximo 500 linhas por chamada,
  somando todos os níveis.
- Um enum deixado em `__auto__` nunca é preenchido com a sua primeira opção; quem chama tem de escolher.
- Cada pedido MCP cria uma entrada no registo de auditoria (ação "Pedido MCP (agente de IA)"); a
  tarefa propriamente dita é registada em nome do utilizador, como em qualquer outro lançamento.

---
layout: default
title: Palavras-passe
parent: Validação no lançamento
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Palavras-passe
{: .no_toc }

Como os campos de palavra-passe são validados, guardados e mantidos fora das APIs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Um campo de palavra-passe é validado como qualquer outro campo. O seu valor, no entanto, fica no servidor e nunca é devolvido a
um cliente.

---

## Onde fica uma palavra-passe

O servidor guarda a palavra-passe com a tarefa, nas suas extravars:

* Uma **aprovação** pode então continuar a tarefa com a palavra-passe que o utilizador introduziu.
* Um **relançamento tal como foi executado** pode reutilizá-la, quando a validação no lançamento não é `enforce`.

A palavra-passe guardada só é usada no servidor.

---

## O que as APIs devolvem

Nenhuma API devolve alguma vez uma palavra-passe:

* Uma tarefa lida através da API REST ou do `get_job` do servidor MCP oculta todos os campos `password` do seu formulário, também dentro
  de linhas de listas e de subformulários YAML.
* `MASK_EXTRAVARS_REGEX` (predefinição `password|secret|token`) oculta também todas as extravars cujo nome corresponda, para
  segredos que não são campos de palavra-passe.

---

## O que um relançamento recebe

Para preencher antecipadamente um relançamento, o navegador recebe os dados em bruto do formulário da tarefa. Esses dados nunca contêm uma palavra-passe, nem sequer dentro
de linhas de listas ou de subformulários YAML, pelo que o utilizador introduz de novo a palavra-passe.

Um campo de palavra-passe que as dependências do formulário ocultem não é necessário e não tem de ser introduzido de novo.

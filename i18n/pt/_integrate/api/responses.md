---
layout: default
title: Respostas e erros
parent: API REST
nav_order: 3
translated_from: 2687f844abe74f8c0e76c8685a1bd57151edc933
---

# Respostas e erros
{: .no_toc }

O formato de uma resposta e os códigos de estado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

As respostas são JSON simples, e o código de estado HTTP indica se uma chamada teve sucesso.

---

## Respostas

Uma chamada bem-sucedida devolve o próprio objeto, ou uma lista com o seu tamanho:

```json
{ "count": 2, "records": [ { "id": 41 }, { "id": 42 } ] }
```

Um erro devolve uma mensagem, e detalhes quando existem:

```json
{ "error": "The form data is not valid", "details": [ ... ] }
```

---

## Códigos de estado

O código de estado indica o que correu mal:

| Código | Significado |
|---|---|
| `200` | A chamada teve sucesso |
| `400` | O pedido está mal formado, por exemplo uma renovação de token sem refresh token, ou um carregamento sem ficheiro |
| `401` | O token falta, está errado ou expirou: inicie sessão ou renove-o |
| `403` | As funções do utilizador não permitem a chamada (incluindo aprovar a sua própria tarefa, a menos que a sua aprovação defina `allowSelf: true` ou que seja administrador), ou a conta tem primeiro de fazer algo (ver abaixo) |
| `404` | O objeto não existe |
| `409` | O pedido está incompleto (um lançamento sem dados), ou o objeto não está num estado que permita a ação |
| `422` | A [validação do lançamento](../launch-validation/) recusou os valores do formulário; `details` indica porquê |
| `429` | Demasiados pedidos aos endpoints de início de sessão e de token, ou demasiados inícios de sessão falhados (consulte [Autenticação](authentication.html)) |
| `500` | O servidor falhou; o registo do servidor tem o motivo |

Numa tarefa, um `409` significa que está no estado errado para a ação: abortar uma tarefa que não está em execução (ou cujo abortar já foi pedido),
relançar uma tarefa que ainda está em execução, ou aprovar ou rejeitar uma tarefa que já não aguarda uma aprovação.

---

## Um 403 com um código

Algumas respostas `403` trazem um `code`, para algo que o utilizador tem de fazer no navegador antes de qualquer outra chamada funcionar:

```json
{ "error": "...", "code": "password_change_required" }
```

| Código | O que fazer |
|---|---|
| `password_change_required` | O utilizador iniciou sessão com a palavra-passe predefinida pública: altere-a primeiro no perfil |
| `disclaimer_required` | O aviso legal está ativado e o utilizador ainda não aceitou a sua versão atual: aceite-o no navegador |

Um token de API de longa duração (consulte [Autenticação](authentication.html#long-lived-tokens)) nunca é retido pelo aviso legal.

---
layout: default
title: Expressões
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Expressões
{: .no_toc }

Calcular valores de campos com JavaScript, no navegador ou no servidor
{: .fs-6 .fw-300 }

---

Para autores de formulários: preencha campos de forma dinâmica com JavaScript, calculados no navegador ou obtidos no servidor.

O atributo `expression` de um campo de formulário permite criar formulários dinâmicos com expressões JavaScript.

---

## Introdução

O atributo `expression` está disponível em vários tipos de campo:
- campo `enum` - para preencher as opções da lista pendente de forma dinâmica
- campo `expression` - para obter ou gerar qualquer tipo de dados
- campo `html` - para construir o seu conteúdo HTML
- campos `yaml` e `list` - para preencher os seus dados

As expressões JavaScript são avaliadas no **lado do servidor** (predefinição) ou no **lado do cliente**, conforme a propriedade do campo `runLocal`.
Um campo `html`, e os tipos de campo `local`, `local_out` e `credential`, executam sempre a sua expressão no navegador, independentemente
do que diga `runLocal`.

- **No lado do servidor** (`runLocal: false`, a predefinição) - funções predefinidas que obtêm dados de APIs, ficheiros e bases de dados.
- **No lado do cliente** (`runLocal: true`) - O código tira partido de todo o motor JavaScript na sandbox do navegador para cálculos, transformações e manipulações.

---

## Questões de segurança

Como as expressões são avaliadas com a função JavaScript `eval`, a injeção de código é uma preocupação a ter em conta:

- **As expressões do lado do servidor** passam primeiro por um sanitizador: cada chamada tem de ser uma função `fn.` ou `fnc.`, e são recusadas as várias linhas,
  `;`, os template literals, `process.env` e as formas de escapar de `eval` (`import`, `require`, `constructor`, ...).
- **As expressões do lado do cliente** são avaliadas na sandbox do navegador e podem ser consideradas seguras.

O rigor do sanitizador depende de
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Valor | Expressões do lado do servidor |
|---|---|
| `strict` (predefinição) | chamadas `fn.` e `fnc.`, e métodos sobre o seu resultado, como `fn.fnTime().format('YYYY')` |
| `paranoid` | só chamadas diretas `fn.` e `fnc.`, sem métodos sobre o seu resultado |
| `off` | todas as expressões do lado do servidor são recusadas; só funcionam as expressões `runLocal` |
| `legacy` | as regras da 6.2.1, que permitiam a qualquer utilizador autenticado executar código no servidor; só para uma atualização, e só no ambiente real (não a partir da página de definições) |

Um valor vazio ou desconhecido equivale a `strict`. Uma alteração aplica-se à expressão seguinte, sem reiniciar.

---

## Nesta secção

Cada tema tem a sua própria página:

| Página | O que abrange |
|---|---|
| [Marcadores](placeholders.html) | Referir outro campo, uma constante ou o utilizador com `$(...)` |
| [Expressões locais](local.html) | JavaScript que é executado na sandbox do navegador |
| [Expressões remotas](remote.html) | Funções do lado do servidor para datas, redes, ficheiros, SSH e nomes numerados |
| [APIs REST](rest-apis.html) | Chamar APIs REST com autenticação básica, por token ou personalizada |
| [Credenciais](credentials.html) | Ler uma credencial guardada |
| [Ordenação](sorting.html) | Ordenar arrays com um objeto de ordenação |
| [Consultas jq](jq.html) | Remodelar dados com jq |

---
layout: default
title: Marcadores
parent: Expressões
nav_order: 0.5
translated_from: 5544c0ca0fe71364116c2f176fa945cced931f96
---

# Marcadores
{: .no_toc }

Referir outro campo, uma constante ou o utilizador atual com `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## O que é um marcador

Um marcador é uma referência escrita como `$(reference)`. É substituído por um valor antes de o texto que o contém ser usado.

Os marcadores funcionam no `expression`, no `query` e no `default` (avaliado com `evalDefault`) de um campo, e no seu `label`,
`help` e `placeholder`. Um campo que contém um marcador depende do campo que este indica: espera até esse campo ter um
valor e é avaliado de novo sempre que esse valor muda. É assim que se constroem as listas pendentes em cascata.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: CMDB            # a database of Connections > Databases
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## O que um marcador pode referir

Um marcador indica um campo do formulário, ou um destes, que todos os formulários têm:

| Referência | O que contém |
|---|---|
| `$(field)` | o valor de outro campo do formulário |
| `$(name)`, uma constante | uma [constante](../config/constants.html) do `config.yaml`, ou um valor dos `varsFiles` do formulário |
| `$(__user__)` | o utilizador com sessão iniciada: `username`, `type`, `groups`, `roles` |
| `$(__repository__)` | o repositório a partir do qual o formulário é lido (desde 7.8.0): o seu `name`, e o seu `path`, a sua pasta no servidor |
| `$(__parent__.field)` | num [subformulário](../forms/subform.html) (uma linha de lista, um passo de um wizard), um valor do formulário pai |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: "fn.fnReadYamlFile('$(__repository__.path)/extra_vars/my_defined_variables.yml', '.my_list')"
```

Com `__repository__` um formulário lê um ficheiro guardado no seu repositório sem indicar o repositório nem a sua pasta. Os
seus [subformulários](../forms/subform.html) (linhas de uma lista, passos de um wizard) leem o do formulário, e um formulário
que não está em nenhum repositório (a pasta local de formulários) lê `name` e `path` vazios. Uma expressão do servidor obtém-no
do formulário que o servidor carregou, nunca do navegador. `__user__` e `__repository__` são reservados: nenhum campo de um
formulário pode ter esses nomes.

---

## Aceder a uma parte de um valor

A notação de ponto e de índice lê uma parte de um valor, desde que o caminho só contenha letras, dígitos, `_`, `-`, `.` e `[n]`:

| Marcador | Sobre | Devolve |
|---|---|---|
| `$(field)` | um campo text, number ou password | o valor |
| `$(field)` | um enum de registos | a `placeholderColumn` do registo selecionado, ou então a sua primeira coluna |
| `$(field.col)` | um enum de registos | essa coluna do registo selecionado |
| `$(field)` | um enum com `multiple: true` | a coluna escolhida de cada registo selecionado, como array |
| `$(field)` | uma expression, list ou constante | o valor completo (uma lista devolve as suas linhas) |
| `$(field.a.b)`, `$(f[0].x)` | uma expression, list ou constante | essa parte do objeto ou do array |

Definir `placeholderColumn: "*"` num enum faz com que `$(field)` devolva o registo selecionado completo em vez de uma coluna.

```yaml
- name: city
  type: enum
  dbConfig: CMDB
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## Como o valor é inserido

A forma como um valor é inserido no texto depende do sítio onde está o marcador.

| Onde | Exemplo | Passa a ser |
|---|---|---|
| uma expressão, fora de aspas | `$(count) + 1` | um literal JavaScript: um número continua a ser um número, um texto passa a ser uma string entre aspas, um objeto ou array um literal |
| uma expressão, a totalidade de uma string entre aspas | `fn.fnLs('$(dir)')` | o mesmo literal, aspas incluídas, para que um valor com uma aspa não consiga escapar |
| uma expressão, dentro de uma string mais longa | `'$(dir)/vars'` | o texto, escapado para essa string |
| uma consulta, uma etiqueta, um texto de ajuda | `where city='$(city)'` | o texto |

Um campo cujos marcadores ainda não possam ser todos resolvidos não é avaliado; com `ignoreIncomplete: true`, um valor em falta é
inserido como `undefined`.

### Backticks e `${` num valor

A partir da 7.3.0, o valor de um campo não pode ser executado como código quando o servidor o insere numa expressão (expressões remotas, validação
no lançamento, MCP e chat). Um backtick ou `${` no valor é escrito como um escape unicode (`\u0060`, `\u0024{`), pelo que continua a ser
texto mesmo dentro de um template literal. As expressões do lado do servidor recusam por completo os template literals; para esses use `runLocal`.

Uma expressão `runLocal` avaliada no navegador insere o valor como diz a tabela acima, sem esse escape, por isso não coloque
aí um marcador dentro de um template literal.

---

## Ver também

Páginas e entradas das FAQ relacionadas:

- [Expressões locais](local.html) e [Expressões remotas](remote.html): onde se usa a maioria dos marcadores
- [FAQ: Listas pendentes em cascata](../faq.html#cascaded-dropdowns) e [Marcadores de campos](../faq.html#field-placeholders): mais exemplos
- [FAQ: Como acedo aos dados do formulário pai dentro de um subformulário?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)

---
layout: default
title: Placeholders
parent: Expressions
nav_order: 0.5
---

# Placeholders
{: .no_toc }

Reference another field, a constant or the current user with `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## What a placeholder is

A placeholder is a reference written as `$(reference)`. It is replaced by a value before the text that holds it is used.

Placeholders work in a field's `expression`, `query` and `default` (evaluated with `evalDefault`), and in its `label`,
`help` and `placeholder`. A field that holds a placeholder depends on the field it names: it waits until that field has a
value, and is evaluated again each time that value changes. This is how cascaded dropdowns are built.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## What a placeholder can reference

A placeholder names a field of the form, or one of these, which every form has:

| Reference | What it holds |
|---|---|
| `$(field)` | the value of another field of the form |
| `$(name)`, a constant | a [constant](../config/constants.html) of `config.yaml`, or a value from the form's `varsFiles` |
| `$(__user__)` | the signed-in user: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | in a [subform](../forms/subform.html) (a list row, a wizard step), a value of the parent form |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Reaching into a value

Dot and index notation read part of a value, as long as the path holds only letters, digits, `_`, `-`, `.` and `[n]`:

| Placeholder | On | Gives |
|---|---|---|
| `$(field)` | a text, number or password field | the value |
| `$(field)` | an enum of records | the `placeholderColumn` of the selected record, else its first column |
| `$(field.col)` | an enum of records | that column of the selected record |
| `$(field)` | an enum with `multiple: true` | the chosen column of every selected record, as an array |
| `$(field)` | an expression, list or constant | the whole value (a list gives its rows) |
| `$(field.a.b)`, `$(f[0].x)` | an expression, list or constant | that part of the object or array |

Setting `placeholderColumn: "*"` on an enum makes `$(field)` give the whole selected record instead of one column.

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
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

## How the value is written in

How a value is written into the text depends on where the placeholder sits.

| Where | Example | Becomes |
|---|---|---|
| an expression, outside quotes | `$(count) + 1` | a JavaScript literal: a number stays a number, a text becomes a quoted string, an object or array a literal |
| an expression, the whole of a quoted string | `fn.fnLs('$(dir)')` | the same literal, the quotes included, so a value with a quote in it cannot break out |
| an expression, inside a longer string | `'$(dir)/vars'` | the text, escaped for that string |
| a query, a label, a help text | `where city='$(city)'` | the text |

A field whose placeholders cannot all be resolved yet is not evaluated; with `ignoreIncomplete: true` a missing value is
written in as `undefined` instead.

### Backticks and `${` in a value

From 7.3.0 a field value cannot run as code when the server writes it into an expression (remote expressions, launch
validation, MCP and chat). A backtick or `${` in the value is written as a unicode escape (`\u0060`, `\u0024{`), so it stays
text even inside a template literal. Server-side expressions refuse template literals altogether; use `runLocal` for those.

A `runLocal` expression evaluated in the browser writes the value in as the table above says, without that escape, so do not put
a placeholder inside a template literal there.

---

## See also

Related pages and FAQ entries:

- [Local expressions](local.html) and [Remote expressions](remote.html): where most placeholders are used
- [FAQ: Cascaded Dropdowns](../faq.html#cascaded-dropdowns) and [Field Placeholders](../faq.html#field-placeholders): more examples
- [FAQ: How do I access parent form data inside a subform?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)

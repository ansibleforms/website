---
layout: default
title: Marcadores
parent: Expresiones
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Marcadores
{: .no_toc }

Haz referencia a otro campo, una constante o el usuario actual con `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qué es un marcador

Un marcador es una referencia escrita como `$(reference)`. Se sustituye por un valor antes de usar el texto que lo contiene.

Los marcadores funcionan en `expression`, `query` y `default` (evaluado con `evalDefault`) de un campo, y en su `label`,
`help` y `placeholder`. Un campo que contiene un marcador depende del campo al que hace referencia: espera hasta que ese campo tenga un
valor, y se vuelve a evaluar cada vez que ese valor cambia. Así se construyen los desplegables en cascada.

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

## A qué puede hacer referencia un marcador

Un marcador nombra un campo del formulario, o uno de estos, que tiene todo formulario:

| Referencia | Qué contiene |
|---|---|
| `$(field)` | el valor de otro campo del formulario |
| `$(name)`, una constante | una [constante](../config/constants.html) de `config.yaml`, o un valor de los `varsFiles` del formulario |
| `$(__user__)` | el usuario que ha iniciado sesión: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | en un [subformulario](../forms/subform.html) (una fila de lista, un paso de un wizard), un valor del formulario padre |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Acceder a una parte de un valor

La notación de punto e índice lee una parte de un valor, siempre que la ruta solo contenga letras, dígitos, `_`, `-`, `.` y `[n]`:

| Marcador | Sobre | Devuelve |
|---|---|---|
| `$(field)` | un campo text, number o password | el valor |
| `$(field)` | un enum de registros | la `placeholderColumn` del registro seleccionado, o si no su primera columna |
| `$(field.col)` | un enum de registros | esa columna del registro seleccionado |
| `$(field)` | un enum con `multiple: true` | la columna elegida de cada registro seleccionado, como array |
| `$(field)` | una expression, list o constante | el valor completo (una lista devuelve sus filas) |
| `$(field.a.b)`, `$(f[0].x)` | una expression, list o constante | esa parte del objeto o array |

Si pones `placeholderColumn: "*"` en un enum, `$(field)` devuelve el registro seleccionado completo en lugar de una columna.

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

## Cómo se inserta el valor

La forma en que un valor se inserta en el texto depende de dónde esté el marcador.

| Dónde | Ejemplo | Se convierte en |
|---|---|---|
| una expresión, fuera de comillas | `$(count) + 1` | un literal JavaScript: un número sigue siendo un número, un texto pasa a ser una cadena entre comillas, un objeto o array un literal |
| una expresión, toda una cadena entre comillas | `fn.fnLs('$(dir)')` | el mismo literal, comillas incluidas, de modo que un valor con una comilla no puede escaparse |
| una expresión, dentro de una cadena más larga | `'$(dir)/vars'` | el texto, escapado para esa cadena |
| una consulta, una etiqueta, un texto de ayuda | `where city='$(city)'` | el texto |

Un campo cuyos marcadores aún no se pueden resolver todos no se evalúa; con `ignoreIncomplete: true`, un valor que falta se
inserta en cambio como `undefined`.

### Backticks y `${` en un valor

Desde 7.3.0, un valor de campo no puede ejecutarse como código cuando el servidor lo inserta en una expresión (expresiones remotas, validación
del lanzamiento, MCP y chat). Un backtick o `${` en el valor se escribe como escape unicode (`\u0060`, `\u0024{`), así que sigue siendo
texto incluso dentro de un template literal. Las expresiones del lado del servidor rechazan por completo los template literals; usa `runLocal` para ellos.

Una expresión `runLocal` evaluada en el navegador inserta el valor como indica la tabla anterior, sin ese escape, así que no pongas
un marcador dentro de un template literal en ese caso.

---

## Ver también

Páginas relacionadas y entradas de las FAQ:

- [Expresiones locales](local.html) y [Expresiones remotas](remote.html): donde se usan la mayoría de los marcadores
- [FAQ: Desplegables en cascada](../faq.html#cascaded-dropdowns) y [Marcadores de campo](../faq.html#field-placeholders): más ejemplos
- [FAQ: ¿Cómo accedo a los datos del formulario padre dentro de un subformulario?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)

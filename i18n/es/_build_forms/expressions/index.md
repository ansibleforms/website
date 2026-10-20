---
layout: default
title: Expresiones
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Expresiones
{: .no_toc }

Calcula valores de campos con JavaScript, en el navegador o en el servidor
{: .fs-6 .fw-300 }

---

Para autores de formularios: rellena campos de forma dinámica con JavaScript, calculados en el navegador u obtenidos en el servidor.

El atributo `expression` de un campo de formulario te permite crear formularios dinámicos con expresiones JavaScript.

---

## Introducción

El atributo `expression` está disponible en varios tipos de campo:
- campo `enum`: para rellenar las opciones del desplegable de forma dinámica
- campo `expression`: para obtener o generar cualquier tipo de datos
- campo `html`: para construir su contenido HTML
- campos `yaml` y `list`: para rellenar sus datos

Las expresiones JavaScript se evalúan en el **lado del servidor** (por defecto) o en el **lado del cliente**, según la propiedad `runLocal` del campo.
Un campo `html`, y los tipos de campo `local`, `local_out` y `credential`, siempre ejecutan su expresión en el navegador, diga lo que diga
`runLocal`.

- **En el lado del servidor** (`runLocal: false`, el valor por defecto): funciones predefinidas que obtienen datos de APIs, archivos y bases de datos.
- **En el lado del cliente** (`runLocal: true`): el código aprovecha todo el motor JavaScript en el sandbox del navegador para cálculos, transformaciones y manipulaciones.

---

## Consideraciones de seguridad

Como las expresiones se evalúan con la función `eval` de JavaScript, la inyección de código es un riesgo potencial:

- **Las expresiones del lado del servidor** pasan antes por un saneador: cada llamada debe ser una función `fn.` o `fnc.`, y se rechazan las líneas múltiples,
  `;`, los template literals, `process.env` y las formas de escapar de `eval` (`import`, `require`, `constructor`, ...).
- **Las expresiones del lado del cliente** se evalúan en el sandbox del navegador y se pueden considerar seguras.

El grado de rigor del saneador depende de
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Valor | Expresiones del lado del servidor |
|---|---|
| `strict` (por defecto) | llamadas `fn.` y `fnc.`, y métodos sobre su resultado, como `fn.fnTime().format('YYYY')` |
| `paranoid` | solo llamadas directas `fn.` y `fnc.`, sin métodos sobre su resultado |
| `off` | se rechaza toda expresión del lado del servidor; solo funcionan las expresiones `runLocal` |
| `legacy` | las reglas de 6.2.1, que permitían a cualquier usuario autenticado ejecutar código en el servidor; solo para una actualización, y solo en el entorno real (no desde la página de ajustes) |

Un valor vacío o desconocido equivale a `strict`. Un cambio se aplica a la siguiente expresión, sin reiniciar.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Marcadores](placeholders.html) | Haz referencia a otro campo, una constante o el usuario con `$(...)` |
| [Expresiones locales](local.html) | JavaScript que se ejecuta en el sandbox del navegador |
| [Expresiones remotas](remote.html) | Funciones del lado del servidor para fechas, redes, archivos, SSH y nombres numerados |
| [APIs REST](rest-apis.html) | Llama a APIs REST con autenticación básica, por token o personalizada |
| [Credenciales](credentials.html) | Lee una credencial almacenada |
| [Ordenación](sorting.html) | Ordena arrays con un objeto de ordenación |
| [Consultas jq](jq.html) | Transforma datos con jq |

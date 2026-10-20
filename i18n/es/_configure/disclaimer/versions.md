---
layout: default
title: Versiones
parent: Aviso legal
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versiones
{: .no_toc }

La página de una versión, y cómo cambiar su texto como corrección o volver a pedírselo a todos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La página de una versión

Desde la 7.3.0 cada versión tiene su propia página, en `/settings/disclaimer/<version>`, con dos pestañas:

| Pestaña | Qué contiene |
|---|---|
| **Detalles** | El título, el texto y el texto de la casilla, y el interruptor **Habilitado**, que se guarda al momento |
| **Aceptaciones** | Quién aceptó esta versión, consulta [Aceptaciones](acceptances.html) |

**Vista previa** muestra el diálogo tal como lo verán los usuarios, y **Eliminar** borra la versión junto con sus aceptaciones. El cuadro
de búsqueda sobre las pestañas busca en ambas a la vez: los campos que coinciden en **Detalles** y las filas que coinciden en **Aceptaciones**.

---

## Cambiar el texto

**Guardar** sobre un título, un texto o un texto de la casilla modificados que los usuarios ya aceptaron pregunta **¿Volver a pedirlo a todos?**:

| Respuesta | Qué ocurre |
|---|---|
| **Pedirlo a todos de nuevo** | Se borran las aceptaciones de esta versión, y cada usuario vuelve a aceptarla en su siguiente petición |
| **Mantener como corrección** | El texto se reescribe, por ejemplo para corregir una errata, y las aceptaciones siguen contando: no se vuelve a pedir a nadie |

Una versión que nadie ha aceptado todavía se guarda sin preguntar. Para conservar el texto aceptado, [añade una versión nueva](general.html#adding-a-version) y habilítala.

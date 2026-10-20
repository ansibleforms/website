---
layout: default
title: Enlaces
parent: Apariencia
nav_order: 5
translated_from: b17adbc1210baac2cf6786f7b0cef5e18fea8ae1
---

# Enlaces
{: .no_toc }

Los enlaces de la cabecera, los integrados y los tuyos
{: .fs-6 .fw-300 }

**Enlaces** define los enlaces de la cabecera, para todos los usuarios con sesión iniciada, en dos pestañas.

**Integrados** tiene el interruptor **Diseñador**, guardado en [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) y aplicado
sin reiniciar. Desactivado, el diseñador desaparece para todos: su enlace, su página y su API.

**Personalizados** contiene tus propios enlaces, como una wiki, un runbook o un portal de soporte. **Añadir enlace** añade una fila con estos campos:

| Campo | Significado |
|---|---|
| **Icono** | El icono delante de la etiqueta, elegido de una lista |
| **Etiqueta** | El texto del enlace |
| **Dirección** | Un sitio (`https://…`) o una página de la aplicación (`/forms/all`) |
| **Nueva pestaña** | Abre el enlace en una pestaña nueva del navegador |

Los botones de una fila la mueven: **→** mete el enlace dentro del enlace de encima, que entonces se abre como un menú en la cabecera,
**←** lo vuelve a sacar a la cabecera, y las flechas arriba y abajo lo mueven (un menú con los enlaces que contiene).
Un menú no necesita dirección propia.

La cabecera contiene como máximo 5 de tus enlaces después de los integrados, y como máximo 10 dentro de cada menú.

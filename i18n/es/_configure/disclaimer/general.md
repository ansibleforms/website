---
layout: default
title: General
parent: Aviso legal
nav_order: 1
translated_from: 5545e95acf978130082fcb459c917894e7a5286a
---

# General
{: .no_toc }

La lista de versiones, cómo añadir una y cómo habilitar la que aceptan los usuarios
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

Desde la 7.3.0, **Configuración > Acceso > Aviso legal** es una lista de las versiones del aviso legal, una por cada texto tal como se aceptó:

| Columna | Significado |
|---|---|
| **Habilitado** | Si es la versión que aceptan los usuarios; como mucho hay una habilitada |
| **Versión** | Su número, contando desde 1 |
| **Título** | El título de su diálogo |
| **Publicado por** | Quién la añadió |
| **Publicado** | Cuándo |
| **Aceptaciones** | Cuántos usuarios la aceptaron |

Un clic en una fila, o **Editar** en su menú, abre la [página de la versión](versions.html). El menú también ofrece **Activar** o **Desactivar**, y **Eliminar**.

---

## Añadir una versión

**Añadir aviso** abre un diálogo para una versión nueva, con el número siguiente, que no queda habilitada hasta que la habilites:

| Campo | Significado |
|---|---|
| **Título** | El título del diálogo, como Condiciones de uso |
| **Texto** | Lo que aceptan los usuarios, como mucho 20000 caracteres. Texto plano: se conservan los saltos de línea. |
| **Casilla** | Lo que marcan los usuarios antes de poder aceptar, al principio "He leído y acepto estas condiciones." |

Los tres son obligatorios. La versión habilitada hasta entonces sigue siendo la que aceptan los usuarios, así que puedes preparar un texto nuevo con antelación.

---

## Habilitar una versión

**Activar** en el menú de una fila, o el interruptor **Habilitado** en la página de la versión, convierte esa versión en la que aceptan
los usuarios y deshabilita las demás.

A los usuarios que ya aceptaron esa versión no se les vuelve a pedir, así que puedes volver a habilitar una versión anterior sin pedírsela a todos.
**Desactivar** en la versión habilitada desactiva el aviso legal hasta que se habilite otra versión; las versiones y las aceptaciones se conservan.
Eliminar una versión elimina también sus aceptaciones, y eliminar la habilitada desactiva el aviso legal.

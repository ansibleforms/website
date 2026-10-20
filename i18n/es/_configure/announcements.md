---
layout: default
title: Anuncios
nav_order: 1
has_children: true
has_toc: false
permalink: /announcements.html
translated_from: 9569cbdaa1c1d1d215f521f21023566e3a4df572
---

# Anuncios
{: .no_toc }

Mensajes bajo la cabecera para todos, como una ventana de mantenimiento, cada uno desde su inicio hasta su fin
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: informa a todos los usuarios de una ventana de mantenimiento o de un incidente, en **Configuración > Apariencia > Anuncios**.

La página necesita la opción de rol `showSettings` o `showAppearanceSettings`. Desde la 7.3.0 es una sola lista, y cada anuncio
tiene su propia página y su interruptor Habilitado.

---

## En esta sección

| Página | Qué cubre |
|---|---|
| [General](announcements/general.html) | El interruptor Habilitado de cada anuncio, que sustituyó al interruptor de todos ellos |
| [Lista](announcements/list.html) | Los anuncios que no han terminado, sus columnas y la página de un anuncio |
| [Añadir uno](announcements/adding-one.html) | El asistente de dos pasos: el mensaje y, después, cuándo se muestra |


---

## Dónde se muestran

Los anuncios se muestran como una línea bajo la cabecera de cada página, para todos los usuarios que han iniciado sesión, cada uno con el color de su tipo.

Se pueden mostrar varios habilitados a la vez, el más reciente primero. La página de inicio de sesión y un formulario incrustado en otro sitio no muestran ninguno.

Cada uno tiene un botón de cierre. Un anuncio cerrado sigue cerrado en esa pestaña del navegador hasta que se cierra la pestaña, o
hasta que cambia su mensaje o su fecha de fin. Un anuncio guardado llega a la vez a todos los navegadores abiertos; uno que
alcanza su fecha de inicio o de fin se muestra u oculta en ellos en menos de un minuto.

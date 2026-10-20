---
layout: default
title: Aviso legal
nav_order: 7
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: a22b56db001904583c51e6bd28f1281737f32a32
---

# Aviso legal
{: .no_toc }

Condiciones que cada usuario acepta una vez antes de usar la aplicación, registrando quién aceptó qué versión y cuándo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: pide a todos los usuarios que acepten unas condiciones de uso, en **Configuración > Acceso > Aviso legal**, con la opción de rol `showSettings`.

Desde la 7.3.0 la página lista todas las versiones del aviso legal, y cada versión se abre en una página propia con sus aceptaciones.
Hasta la 7.2, la página tenía en su lugar tres pestañas (**General**, **Versiones** y **Aceptaciones**); la actualización conserva todas las versiones.

---

## En esta sección

| Página | Qué trata |
|---|---|
| [General](disclaimer/general.html) | La lista de versiones, añadir una y habilitar la que aceptan los usuarios |
| [Versiones](disclaimer/versions.html) | La página de una versión, y cambiar su texto como corrección o para todos de nuevo |
| [Aceptaciones](disclaimer/acceptances.html) | Quién aceptó qué versión, y volver a pedirlo a usuarios elegidos |


---

## Qué ven los usuarios

Con una versión habilitada, todo usuario que inicia sesión la recibe en un diálogo antes que nada, admins incluidos:

1. Leen su título y su texto.
2. Marcan la casilla y pulsan **Aceptar**. **Rechazar**, en rojo, cierra su sesión en su lugar.

Desde la 7.3.0 la página detrás del diálogo se ve desenfocada hasta que responden.

Un usuario acepta cada versión una vez: no se le vuelve a preguntar en su siguiente inicio de sesión, solo cuando llega una versión nueva, cuando
un admin guarda un texto cambiado con [Pedirlo a todos de nuevo](disclaimer/versions.html#changing-the-text), o cuando un admin usa
[Volver a pedir](disclaimer/acceptances.html#asking-users-again) sobre su aceptación.

Hasta que aceptan, la API responde a cada llamada de su sesión con el estado `403` y el código `disclaimer_required`,
salvo las llamadas bajo `/api/v2/disclaimer` y `/api/v2/profile`, y los eventos en directo que sigue el navegador.
A un [token de API](profile/api-token.html) nunca se le pregunta, ya que un script no tiene a nadie que haga clic.

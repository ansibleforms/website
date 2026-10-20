---
layout: default
title: Valores predeterminados
parent: Apariencia
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Valores predeterminados
{: .no_toc }

El tema, el idioma, la zona horaria y el formato de fecha para los usuarios que no han elegido ninguno
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Los valores predeterminados

**Valores predeterminados** define cómo se ve la aplicación para un usuario que no ha elegido nada en sus
[preferencias](../profile/preferences.html); lo que elige el propio usuario siempre tiene prioridad:

| Campo | Opciones | Sin elección |
|---|---|---|
| **Tema predeterminado** | Seguir el navegador, Claro, Oscuro o Color, con uno de 12 colores para Color | Seguir el navegador (Claro hasta la 7.2) |
| **Idioma predeterminado** | Los idiomas de la aplicación, guardado en [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Inglés |
| **Vista de formularios predeterminada** | Mosaicos o Lista, para la página de formularios | Mosaicos |
| **Zona horaria predeterminada** | UTC, la del navegador de cada usuario o cualquier zona por su nombre | UTC |
| **Formato de fecha predeterminado** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`, mostrado con la fecha de hoy | `YYYY-MM-DD` |

El idioma es una variable de entorno y se aplica sin reiniciar. Con
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) a `0`, la página lo muestra en solo lectura.

Desde la 7.3.0 la página está en las dos pestañas de las preferencias del perfil, **Apariencia** (tema, idioma y vista de formularios) y **Fecha y
hora** (zona horaria y formato de fecha, con una vista previa de la hora actual), y su cuadro de búsqueda lista las coincidencias bajo el nombre de cada pestaña.

---

## Seguir el navegador

Desde la 7.3.0 **Seguir el navegador** muestra a cada usuario el tema claro u oscuro que pide su navegador, y cambia con él.

Es el valor predeterminado cuando no se elige ningún tema, así que una instalación nueva sigue al navegador. Al pasar el puntero por uno de los colores de
**Color**, la aplicación se previsualiza en ese color; el tema que tenías vuelve cuando el puntero sale, y no se guarda nada hasta pulsar **Guardar**.

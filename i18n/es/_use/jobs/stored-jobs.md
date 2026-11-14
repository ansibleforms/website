---
layout: default
title: Trabajos almacenados
parent: Trabajos
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: 90ae6acdb80d10401ea24f37de675b9a2901bdf9
---

# Trabajos almacenados
{: .no_toc }

Guarda los datos de un formulario para volver a cargarlos más tarde
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Trabajos guardados

Los trabajos guardados conservan los valores de un formulario para que puedas volver a cargarlos, en lugar de rellenar los mismos campos cada vez.

Para guardar, rellena el formulario, abre el desplegable junto a **Enviar** y elige **Almacén**. En **Guardar datos del formulario**,
escribe un **Nombre**, una **Descripción** opcional y una fecha en **Expira en (opcional)**, y guarda. Los campos de contraseña y
las constantes no se guardan nunca. Un subformulario tiene la misma acción **Almacén** junto a su botón **Guardar**, y conserva
los valores sin terminar sin validarlos.

Para cargar, selecciona **Cargar desde almacén** en la parte superior del formulario. **Cargar formulario guardado** lista tus trabajos
guardados de ese formulario, con sus fechas de creación y de caducidad; selecciona uno para rellenar el formulario con sus valores.
No se ejecuta nada hasta que lo envías.

Los trabajos guardados se conservan en la base de datos de AnsibleForms (tabla `stored_jobs`), con el nombre del formulario, tu usuario como
`<type>/<username>` (por ejemplo `local/admin`) y los valores en JSON. Un nombre debe ser único por usuario y formulario; guardar
un segundo con el mismo nombre falla con "A saved form with this name already exists".

---

## Gestionar los trabajos guardados

La página **Trabajos almacenados** lista los trabajos guardados con su formulario, usuario y fechas de creación y caducidad, y necesita `allowStoredJobs`.

Desde la 7.6.0 basta `allowStoredJobs` para abrir **Trabajos > Guardados** y **Añadir trabajo almacenado** (antes hacía falta también
`showSettings` o `allowScheduledJobs`). Su lista **Formulario** ofrece los formularios de tus roles, o todos con esas dos opciones.

- **Editar** abre la página propia del trabajo guardado: sus **Detalles** (nombre, formulario, caducidad) y sus **Valores**, los
  valores de los campos guardados en YAML, que se pueden cambiar y guardar ahí.
- **Abrir en el formulario** abre su formulario con los valores guardados ya rellenados; no se ejecuta nada hasta que lo envías.
- **Eliminar** lo borra. Puedes eliminar tus propios trabajos guardados; los usuarios con `showSettings` pueden eliminar cualquiera.
- Los trabajos guardados con una fecha de **Expira en** ya pasada se eliminan automáticamente cada día a las 04:00 (en `LOG_TZ`).

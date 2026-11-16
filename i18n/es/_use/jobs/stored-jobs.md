---
layout: default
title: Trabajos almacenados
parent: Trabajos
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
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
escribe un **Nombre**, una **Descripción** opcional y cuándo se elimina en **Eliminado** (ver [Cuándo se elimina](#when-it-is-removed)), y guarda.
Los campos de contraseña y las constantes no se guardan nunca. Un subformulario tiene la misma acción **Almacén** junto a su botón **Guardar**, y
conserva los valores sin terminar sin validarlos.

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

Desde la 7.7.0 la lista tiene una columna ordenable **Último uso**, que separa los trabajos guardados en uso de los abandonados.

- **Editar** abre la página propia del trabajo guardado: sus **Detalles** (nombre, descripción, formulario, usuario, cuándo se creó y se usó por
  última vez, y cuándo se elimina), sus **Valores**, los valores de los campos guardados en YAML, que se pueden cambiar y guardar ahí, y sus **Ejecuciones**.
- **Abrir en el formulario** abre su formulario con los valores guardados ya rellenados; no se ejecuta nada hasta que lo envías.
- **Eliminar** lo borra. Puedes eliminar tus propios trabajos guardados; los usuarios con `showSettings` pueden eliminar cualquiera.

---

## Último uso y ejecuciones

Desde la 7.7.0 un trabajo guardado registra su último uso y los trabajos lanzados desde él, para saber cuáles siguen en uso.

Estos lanzamientos cuentan como un uso de un trabajo guardado:

| Lanzamiento | Cuándo cuenta |
|---|---|
| El formulario abierto desde él (**Abrir en el formulario**), o rellenado con **Cargar desde almacén** | Cuando se lanza el trabajo |
| **Ejecutar más tarde** desde ese formulario | Cuando se dispara la ejecución planificada, no cuando se planifica |
| Un **relanzamiento** de un trabajo lanzado desde él | Cuando empieza el relanzamiento, con los mismos valores o con otros |
| `launch_job` o `plan_job` de MCP con él | Igual que arriba |

Las ejecuciones de una programación nunca cuentan, ni siquiera las de una creada desde un trabajo guardado: una programación guarda su propia copia
de los valores. Un lanzamiento solo cuenta si el usuario puede ver el trabajo guardado; uno eliminado u ocultado desde entonces se omite y el
trabajo se ejecuta igualmente.

La página del trabajo indica el trabajo guardado desde el que se lanzó, con un enlace, cuando puedes verlo. La pestaña **Ejecuciones** de la página
del trabajo guardado lista los trabajos lanzados desde él que puedes ver, con su estado, inicio, fin y duración.

---

## Cuándo se elimina

Cada trabajo guardado indica cuándo se elimina: nunca, en una fecha o cuando lleva unos días sin usarse.

| Opción | Qué hace |
|---|---|
| **Nunca** | Lo conserva hasta que alguien lo elimine. No se ofrece mientras `STORED_JOB_UNUSED_DAYS` está definido |
| **En una fecha** | Lo elimina en esa fecha |
| **Si no se usa en N días** | Lo elimina cuando no se ha lanzado ningún trabajo desde él durante esos días |

Un administrador puede definir [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Configuración > General > Retención). Entonces elimina todo trabajo guardado sin usar durante esos días, los días propios de un trabajo guardado
solo pueden ser menos, el diálogo de Almacén empieza con ellos, y uno que se elimina en una fecha también se elimina si pasa ese tiempo sin usarse.
Los días cuentan desde el último uso o, para un trabajo guardado que nunca se ha usado, desde que se guardó. Su valor por defecto, 0, nunca
elimina uno por no usarse.

Los trabajos guardados se eliminan cada día a las 04:00 (en `LOG_TZ`), en cuanto llega lo primero de su fecha o de sus días.

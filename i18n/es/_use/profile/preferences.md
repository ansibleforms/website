---
layout: default
title: Preferencias
parent: Tu perfil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Preferencias
{: .no_toc }

Idioma, tema, zona horaria, formato de fecha y notificaciones de escritorio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las preferencias

La vista Preferencias cambia cómo ves AnsibleForms. Cada elección se guarda en el navegador
donde la haces, así que otro navegador u ordenador empieza con los valores predeterminados.

| Ajuste | Opciones | También se cambia desde |
|---|---|---|
| Idioma | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (japonés), 简体中文 (chino simplificado) | la bandera de la cabecera |
| Tema | Seguir el navegador, Claro, Oscuro o Color (una cabecera del color que elijas) | el icono del sol de la cabecera |
| Vista de formularios | Mosaicos o Lista | el botón de la página Formularios |
| Zona horaria | UTC, la zona de este navegador o cualquier zona por su nombre | solo aquí |
| Formato de fecha | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY` | solo aquí |
| Notificaciones de escritorio | Activadas o desactivadas | solo aquí |

Desde 7.3.0 la vista está en pestañas, cada una con su propia dirección (`/profile/preferences/<tab>`): **Apariencia** (idioma, tema y vista
de formularios), **Fecha y hora** (zona horaria y formato de fecha) y **Notificaciones**. El cuadro de búsqueda de encima lista los ajustes que coinciden
bajo el nombre de su pestaña. Una elección es un borrador hasta **Guardar**, y salir de la vista con un cambio sin guardar pide confirmación antes.

**Seguir el navegador** pasa a claro u oscuro como lo hace el navegador, y cambia con él. Es el tema predeterminado desde 7.3.0, salvo que tu
administrador elija otro. Pasar el puntero sobre un color del tema **Color**, aquí o en el menú de temas de la cabecera, previsualiza la aplicación en ese
color, y el tema anterior vuelve cuando el puntero sale de la paleta; no cambia nada hasta que haces clic.

---

## Notificaciones de escritorio

Desde 7.3.0 la pestaña **Notificaciones** activa las notificaciones de escritorio en este navegador, para los usuarios cuyo rol define `showJobs`.

El navegador pide su permiso la primera vez. Cuando bloquea las notificaciones del sitio, el interruptor se queda desactivado e indica cómo
permitirlas, y un sitio en `http` sin cifrar no puede mostrarlas en absoluto. Una vez activadas, llega una notificación:

| Cuándo | Qué dice | Al hacer clic en ella |
|---|---|---|
| Termina un trabajo que has lanzado | El formulario y su resultado, como *Patch Linux servers: Correcto*, con el número de trabajo y la duración | Trae la pestaña al frente en ese trabajo |
| Un trabajo espera tu aprobación | El formulario, el número de trabajo y quién lo lanzó, con los botones **Aprobar** y **Rechazar** | Abre los trabajos que esperan aprobación |

Los botones **Aprobar** y **Rechazar** aparecen en Chrome y Edge; Firefox y Safari muestran la notificación sin ellos, igual que un
sitio con un certificado autofirmado, porque los botones necesitan un service worker. Las notificaciones solo llegan mientras hay una pestaña de AnsibleForms abierta,
aunque esté en segundo plano: no se envía nada cuando todas las pestañas están cerradas. Cada una se muestra una vez, por muchas pestañas que haya abiertas, y los pasos de un
trabajo de varios pasos y el trabajo que estás mirando no generan notificaciones.

---

## Zona horaria

Las fechas y horas de todo AnsibleForms se muestran en la zona horaria que selecciones. Esto incluye las horas de inicio
y fin de los trabajos, el registro de auditoría, la página de estado, las copias de seguridad, los trabajos guardados y la caducidad de un
token de API. Cambiar la zona horaria actualiza todas las páginas al instante, sin recargar.

Hasta que elijas una, se aplica la zona horaria que tu administrador definió para todos (**Configuración > Apariencia > Valores predeterminados**, consulta
[Apariencia](../appearance.html)), **UTC** salvo que se haya cambiado. **Este navegador** sigue la zona horaria de tu ordenador, y la
lista contiene todas las zonas por su nombre, como `Europe/Madrid`. La tarjeta muestra la hora actual en la zona y el formato seleccionados.

---

## Formato de fecha

El formato de fecha define cómo se lee la parte de fecha de cada fecha, y cada opción se muestra con la fecha de hoy: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`. Hasta que elijas uno, se aplica el formato de fecha predeterminado de tu
administrador, `YYYY-MM-DD` salvo que se haya cambiado. Como las demás elecciones, se guarda en este navegador.

---

## Qué conserva las horas del servidor

Dos excepciones conservan las horas propias del servidor:

- **El log del servidor y la salida de los trabajos** son texto que contiene las horas que el servidor escribió en ellos.
- **Las horas que introduces**, como cuándo debe ejecutarse un trabajo planificado, y las programaciones cron, funcionan como
  antes.

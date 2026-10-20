---
layout: default
title: La página de runners
parent: Runners
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# La página de runners
{: .no_toc }

La lista de runners, cómo añadir uno, activarlo o desactivarlo, y el predeterminado de cada tipo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

La página de **Conexiones > Runners** lista cada runner con estas columnas:

| Columna | Significado |
|---|---|
| Activado | Si recibe trabajos. Un runner desactivado no recibe ningún trabajo, aunque sea el predeterminado de su tipo. |
| Nombre | Cómo se refieren a él los formularios, con `runner: <name>`. |
| Tipo | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck o Jenkins. El runner predeterminado de su tipo lleva detrás una etiqueta **Predeterminado**. |
| Descripción | Para qué sirve. |

**Columnas** añade dos más, ocultas por defecto: **Modo**, el modo de un RTE (Saliente, Entrante o Base de datos (obsoleto), consulta
[Modos](../rte/modes.html)), y **Conexión**, si un nodo de la aplicación tiene un socket con un RTE en modo de socket: **Conectado** o
**No conectado**.

Desde 7.3.0 los runners pendientes de aprobación no aparecen en la lista sino en un aviso encima de ella, consulta [Aprobar un RTE](registration.html#approving-an-rte).
**Añadir Runner** abre un diálogo por pasos: **Runner** (nombre y descripción), **Tipo** y **Credenciales**, con un paso **Modo** después de
**Tipo** para un RTE (Saliente, el predeterminado para uno nuevo, Entrante o Base de datos (obsoleto)): cuatro pasos para un RTE, tres para los
demás. En el paso **Tipo** cada producto tiene una indicación: la del RTE da su nombre completo, *Entorno de ejecución*. Una fila abre la página
propia del runner, y su menú ofrece:

| Acción | Qué hace |
|---|---|
| Editar | Abre su página |
| Probar conexión | Comprueba que responde y acepta su credencial, consulta [Probar conexión](runner-page.html#test-connection) |
| Activar, Desactivar | Lo activa o lo desactiva, según cuál no esté |
| Cambiar credenciales | Abre la pestaña Credenciales de su página |
| Eliminar | Lo elimina |

---

## Predeterminado y Activado

El predeterminado de cada tipo es donde se ejecutan los formularios de ese tipo cuando no nombran ningún runner:

| Predeterminado para | Dónde se ejecutan estos formularios cuando no nombran ningún runner |
|---|---|
| Formularios de playbook | Los formularios `ansible`, en un RTE |
| Formularios AWX, AAP y Ascender | Los formularios `awx`, `aap` y `ascender`, en un runner AWX |
| Formularios Semaphore | Los formularios `semaphore` |
| Formularios Rundeck | Los formularios `rundeck` |
| Formularios Jenkins | Los formularios `jenkins` |

El primer runner de un tipo se convierte en su predeterminado, así que un único runner por tipo no necesita ningún paso más. Para que otro runner sea el predeterminado,
activa el interruptor **Predeterminado** en su página (consulta [La página de un runner](runner-page.html)).

Un runner desactivado sigue en la lista con sus ajustes, pero no le llega ningún trabajo, tampoco como predeterminado de su tipo. Un trabajo para él falla con
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Actívalo o desactívalo con **Activar** o **Desactivar** en el menú de su fila, o con el interruptor **Activado** en su página. Un runner nuevo está activado, y los
runners que existían antes de 7.3.0 están activados tras la actualización. La [semilla de configuración](../seed/example.html) puede desactivar uno con
`enabled: false`.

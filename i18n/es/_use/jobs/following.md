---
layout: default
title: Seguir un trabajo
parent: Trabajos
nav_order: 2
translated_from: 31962d9845c3241caca78025476d82f772e9d7a5
---

# Seguir un trabajo
{: .no_toc }

Salida en directo, extravars, filtros y descargas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Seguir un trabajo

Al hacer clic en un trabajo se abre su página: el formulario del trabajo como título, sus acciones en la cabecera y su salida debajo.

![La salida de un trabajo](../assets/screenshots/job-output.jpg)

Desde 7.3.0 la página está hecha de tarjetas, y cada una se pliega bajo su cabecera:

| Tarjeta | Qué muestra |
|---|---|
| **Resumen** | El nombre, el estado y el tipo del trabajo como cabecera, y sus datos debajo en una cuadrícula de tres columnas (dos, y luego una, en una página estrecha) |
| **Workflow** | Para un trabajo de workflow, también un trabajo de workflow en AWX o AAP, su grafo y su número de nodos (consulta [El grafo del workflow](#the-workflow-graph)) |
| **Salida** | La salida del trabajo y su barra de herramientas |

Un trabajo que se ejecutó en AWX, AAP, Ascender, Jenkins, Semaphore o Rundeck muestra allí su número como enlace a su página en esa herramienta, que se abre
en una pestaña nueva. El enlace se guarda en el trabajo, así que sigue funcionando aunque el runner se renombre o se elimine más tarde.

La página se actualiza en directo: el servidor envía un evento cada vez que un trabajo se lanza, cambia de estado, escribe salida o se
elimina, y la página vuelve a leer el trabajo, de modo que la salida crece a medida que el trabajo la escribe. La lista de trabajos se actualiza del mismo modo.
**Actualizar** recarga el trabajo a mano.

Mientras estás al final de la salida, la página la sigue hacia abajo a medida que llegan líneas nuevas. Sube para leer una línea anterior
y se queda donde estás: **Ir a lo último** aparece entonces sobre la parte inferior de la salida, y cambia a **Líneas nuevas** cuando
han llegado más. Haz clic en él, o vuelve a bajar hasta el final, para seguir de nuevo las líneas nuevas. La salida de la página del formulario, después de
**Enviar**, y el [registro del servidor](../production/logs.html) siguen sus líneas nuevas del mismo modo.

La barra de herramientas de la salida tiene:

| Botón | Qué hace |
|---|---|
| **Mostrar variables extra** | Muestra las extravars con las que se ejecutó el trabajo en un panel sobre la salida, con un selector **JSON** / **YAML** y **Copiar** |
| **Mostrar artefactos** | Muestra los artefactos del trabajo en el mismo panel (ver más abajo) |
| **Mostrar parámetros** | Sustituye a **Mostrar variables extra** para un trabajo en Jenkins: los valores con los que se ejecutó, sus parámetros de build |
| **Mostrar payload** | Sustituye a **Mostrar variables extra** para un trabajo en Rundeck: el payload que se le envió |
| **Hosts y tareas** | Muestra los hosts y tareas de un playbook sobre su salida (consulta [Hosts y tareas](#hosts-and-tasks)) |
| **Actualizar** | Recarga la salida |
| **Aplicar filtro** | Oculta las tareas cuyo nombre coincide con el filtro de salida; **Quitar filtro** las vuelve a mostrar |
| **Copiar salida** | Copia la salida como texto plano, con el filtro aplicado o no |
| **Descargar salida** | Descarga la salida como `ansibleforms-job-<id>.txt` |

**Mostrar artefactos** se ofrece para todo trabajo que no sea un trabajo de plantilla, como un playbook en el RTE o un workflow (vacío cuando
sus playbooks no recogieron artefactos con `set_stats`), y para un trabajo de plantilla que se ejecutó en AWX, AAP o Ascender. Los trabajos en Semaphore, Rundeck
y Jenkins no tienen artefactos, así que nunca se ofrece para ellos.

A la izquierda de la barra de herramientas, el botón **Contraer todo** pliega cada sección de la salida (cada play y cada tarea) y cambia a
**Expandir todo**, que las vuelve a desplegar.

**Mostrar variables extra** requiere la opción de rol `showExtravars` y **Mostrar artefactos** la opción de rol `showArtifacts` (consulta las
[opciones de rol](../config/roles.html#role-options)). Los valores de los campos de contraseña y de las claves que coinciden con
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) se enmascaran.

El filtro lo define [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` por
defecto. Pon `[low]` en el nombre de una tarea ruidosa, y **Aplicar filtro** oculta esa tarea y sus líneas.

La página de un trabajo multistep muestra cada paso bajo el trabajo principal, uno debajo de otro, cada uno bajo una barra de título como
**Paso 1 · Prepare the server (id de trabajo 98)** con su estado. Haz clic en un título (o pulsa Intro o Espacio sobre él) para plegar esa salida,
y otra vez para desplegarla. Los workflows de AWX/AAP muestran también el estado de sus nodos.

Los trabajos de [workflow](../workflows/running.html#the-job) guardan la salida de cada nodo en la suya propia, bajo un encabezado `WORKFLOW NODE` por
nodo; dibujan su grafo en directo, y un clic en un nodo abre su salida.

---

## Buscar un texto en la salida

Desde 7.3.0 la página del trabajo tiene un cuadro de búsqueda, **Buscar en la salida**, en su línea de título, a la izquierda de las acciones del trabajo.

Cada lugar donde aparece el texto en la salida se resalta, sin distinguir mayúsculas, y la página se desplaza al primero. **Intro** va al
siguiente, que se muestra más marcado, y la barra de herramientas indica cuál de cuántos es (**2 de 4**), o **No encontrado**. La búsqueda despliega primero la salida y
sus secciones, y mientras el trabajo se ejecuta también busca en las líneas nuevas, sin mover la página.

---

## Moverse por una salida larga

Desde 7.3.0 una salida larga, en la página del trabajo y bajo un formulario tras **Enviar**, ofrece estas formas de recorrerla:

| Control | Qué hace |
|---|---|
| Cabeceras fijas | La cabecera de una sección (un nodo de workflow, el playbook del trabajo, un paso de un trabajo multistep) se queda arriba mientras sus líneas se desplazan |
| **2 fallidas** | Cuenta las tareas fallidas, sin contar los fallos que se indicó a Ansible que ignorara; cada clic va a la siguiente, desplegada y resaltada. Sin tareas fallidas, **1 error** cuenta en su lugar las líneas de error |
| Números de línea | Cada número de línea enlaza a su línea, como `#L45` en la dirección: al abrir esa dirección se desplaza a la línea y la resalta |
| Botones arriba y abajo | Se muestran abajo a la derecha una vez desplazada la página, para volver al principio o ir al final |
| **En ejecución** y **Abortar** | Mientras el trabajo se ejecuta, la barra de la página del formulario se mantiene en la parte inferior de la ventana, y **Abortar** allí detiene el trabajo al instante |

---

## Resultados de tareas

Desde 7.3.0 la línea de resultado de un host en la salida de un playbook abre ese resultado en un diálogo **Resultado de la tarea**, como hace AWX.

La línea, el cuerpo del resultado que la sigue (`=> { ... }`) y el error impreso antes de un resultado fallido se resaltan como un solo bloque al pasar el ratón, y un
clic abre el diálogo. Funciona en la página del trabajo y bajo un formulario tras **Enviar**, para un playbook que se ejecutó en un RTE de 7.3.0 o
posterior, ya que el resultado viene de los mismos eventos que [Hosts y tareas](#hosts-and-tasks). El diálogo tiene estas pestañas:

| Pestaña | Qué muestra |
|---|---|
| **Detalles** | El estado, el host, el play, la tarea, el módulo, el elemento del bucle, la hora de inicio, la duración, el código de retorno y el mensaje |
| **JSON** y **YAML** | El resultado completo del módulo, coloreado y con líneas numeradas |
| **Salida estándar** y **Error estándar** | El `stdout` y el `stderr` del resultado, cuando los tiene |

Desde 7.5.0 el resultado completo, y con él las pestañas **JSON**, **YAML** y de salida, se guarda sea cual sea el nivel de detalle del trabajo,
como en AWX; un RTE anterior a 7.5.0 solo lo guarda en modo detallado. Una tarea con `no_log` tiene su resultado censurado por Ansible, se omiten
los argumentos del módulo (`invocation`) y las claves propias de Ansible `_ansible*`, se enmascaran los valores de las claves que parecen un
secreto, y un resultado se corta cuando supera los 64 KB de JSON.

---

## El grafo del workflow

Desde 7.3.0 el grafo de un workflow en ejecución se desplaza para mantener a la vista el nodo en curso.

Si desplazas el grafo, se queda donde lo dejas, con un botón **Seguir el nodo en curso** para volver a seguirlo. Al pasar el ratón sobre un nodo
se muestra su tarjeta con el nombre completo y se resaltan el nodo y sus enlaces, con el resto del grafo atenuado. El grafo tiene los botones **Ajustar a la
pantalla** y **Pantalla completa**, y bajo un formulario tras **Enviar** un clic en un nodo abre su salida como en la página del trabajo.

---

## Hosts y tareas

Desde 7.3.0, un trabajo de playbook que se ejecutó en un RTE de 7.3.0 o posterior registra sus eventos estructurados junto a su salida de texto: cada play, tarea
y resultado de host, y el resumen final (recap). **Hosts y tareas**, en la barra de herramientas de la salida, los muestra en un panel sobre la salida, en la página del trabajo y
bajo un formulario tras **Enviar**. Se ofrece en cuanto el trabajo tiene eventos, y el panel se vuelve a leer cada pocos segundos mientras el trabajo se ejecuta:

| Vista | Qué muestra |
|---|---|
| **Cuadrícula** | El recap por host (ok, cambiados, fallidos, inaccesibles, omitidos, rescatados, ignorados), y después una cuadrícula de hosts por tareas: cada celda se colorea según el resultado del host para esa tarea, con su mensaje y su tiempo al pasar el ratón, o *no ejecutada* |
| **Cronología** | Cada tarea como una barra, tan larga como lo que tardó su host más lento, con su tiempo en segundos y el total |

La salida de texto se queda como está. Los eventos los escribe el propio plugin de callback `af_events` del RTE, así que el playbook no necesita ningún cambio.

---
layout: default
title: Editar en el diseñador
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Editar en el diseñador
{: .no_toc }

Dibuja un workflow y pruébalo sin ejecutar nada
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La sección Workflows

**Diseñador > Workflows** muestra los archivos de workflow en un explorador de archivos, con las pestañas YAML, Visual y Vista previa de todas
las secciones del [diseñador](../designer/).

- **El botón `+`** de la barra de herramientas crea un archivo de workflow, con un workflow vacío para empezar.
- **YAML** muestra el archivo tal como está escrito. Las demás pestañas también conservan los comentarios y el orden de las claves.
- **Visual** dibuja cada workflow del archivo como un grafo, con su nombre y su descripción encima. Un archivo con dos workflows
  muestra ambos, uno debajo del otro.
- **Vista previa** es una simulación del workflow: consulta [Probarlo](#trying-it-out).

Los problemas se listan encima del grafo, cada uno con un enlace que abre el YAML en su línea: un enlace a un nodo que no
existe, un bucle, un playbook, inventario, credencial, runner o repositorio que el diseñador no conoce.

---

## El grafo

El grafo se lee de izquierda a derecha, de **START** a los últimos nodos. Cada nodo muestra su identificador y, debajo, lo que
ejecuta; los enlaces se colorean según lo que los dispara, como indica la leyenda dentro del grafo: si tiene éxito, si falla,
siempre.

- **Haz clic en START** para añadir un primer nodo: un nodo sin padre, que se ejecuta en cuanto arranca el workflow.
- **Haz clic en un nodo** para editarlo.
- **Haz clic en un enlace** para cambiar lo que lo dispara o para quitarlo.

---

## Añadir un nodo

Un nodo nuevo se añade con un asistente: **Nodo nuevo si tiene éxito**, **Nodo nuevo si falla** o **Nodo nuevo siempre** en un nodo
existente, o START para el primero.

1. **Qué ejecuta**: el identificador del nodo, **Ejecuta** (qué clase de nodo es y, para un nodo de playbook, dónde se ejecuta)
   y lo que ejecuta: un playbook o una plantilla o job, un workflow, el nombre y el tiempo de espera de una aprobación, o un repositorio. Consulta
   [Dónde se ejecuta un nodo](#where-a-node-runs).
2. **Cómo se ejecuta**: los ajustes de ejecución: el inventario, las credenciales, el limit, los tags, el nivel de detalle,
   los modos check y diff, la condición (**Se ejecuta si**) y **Valores de** (consulta [el archivo del workflow](file.html#run-settings)).
3. **Dónde va**: el nodo tras el que se ejecuta, y en qué caso.

**Crear** añade el nodo al YAML.

---

## Dónde se ejecuta un nodo

**Ejecuta** indica qué ejecuta un nodo y dónde, en una sola lista: **Playbook en el RTE**, **Plantilla en AWX**, **Plantilla en
Semaphore**, **Job en Rundeck**, **Job en Jenkins** y, después, **Workflow**, **Aprobación** y **Pull de repositorio**.

| Ejecuta | El campo de debajo | Runner |
|---|---|---|
| **Playbook en el RTE** | **Playbook**: un playbook del diseñador | **El RTE predeterminado**, o un runner RTE por nombre |
| **Plantilla en AWX** (incluidos AAP y Ascender) | **Plantilla**: el nombre de la plantilla, escrito a mano | los runners de AWX, cada uno con su variante |
| **Plantilla en Semaphore** | **Plantilla**: el nombre de la plantilla, escrito a mano | los runners de Semaphore |
| **Job en Rundeck** o **Job en Jenkins** | **Job**: el nombre del job, escrito a mano | los runners de Rundeck o Jenkins |

- **Playbook en el RTE** siempre se ofrece; los demás solo cuando la instancia tiene un [runner](../runners.html) de ese tipo.
- **Runner** solo lista los runners de ese tipo, con el predeterminado marcado y preseleccionado (o el primero por nombre).
- Elegir otro sitio borra lo que ejecuta el nodo, para que se vuelva a elegir.
- Un nodo cuyo runner no conoce el diseñador muestra **Plantilla o job en** ese runner.

El archivo del workflow no cambia: un nodo así es un nodo `job_template` con un `runner:` (consulta
[el archivo del workflow](file.html#run-settings)).

---

## Editar un nodo

Al hacer clic en un nodo se abre su diálogo, con cuatro pestañas:

| Pestaña | Qué contiene |
|---|---|
| **Qué ejecuta** | El identificador, **Ejecuta**, lo que ejecuta y, para un nodo de playbook, el runner |
| **Cómo se ejecuta** | Los ajustes de ejecución; las credenciales se eligen de una lista, cada una se añade con `+` |
| **Se ejecuta después de** | Los enlaces que llegan al nodo, y **Todos los padres deben converger** |
| **Ejecuta después** | Los enlaces que salen de él, con **Enlazar a un nodo existente:** y **Enlazar a un nodo nuevo:** |

**Ver en YAML** abre el YAML en el nodo, y **Quitar nodo** lo elimina junto con sus enlaces. Cada cambio se escribe en el
YAML al instante; **Guardar** guarda el archivo.

---

## Probarlo

La pestaña **Vista previa** recorre el workflow sin lanzar nada, según las reglas de AWX.

Todos los nodos empiezan como éxito. Haz clic en un nodo para que falle, y vuelve a hacer clic para que tenga éxito; el grafo muestra entonces
qué nodos se ejecutarían, cuáles no se ejecutarían y si el workflow fallaría. **Restablecer** vuelve a poner todos los nodos en éxito.

---
layout: default
title: Diseñador
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Diseñador
{: .no_toc }

Edita formularios, playbooks, inventarios y workflows en el navegador
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para autores de formularios: las secciones del diseñador y lo que muestra cada una de sus pestañas.

El diseñador necesita la [opción de rol](../config/roles.html#role-options) `showDesigner`. Edita un elemento cada vez, un
formulario, un playbook o un archivo de workflow, con sus secciones en el menú de la izquierda. Cada tipo de archivo necesita además su propia opción, todas
activadas por defecto: `allowPlaybookDesign` para los **Playbooks**, `allowWorkflowDesign` para los **Flujos de trabajo**,
`allowInventoryDesign` para los **Inventarios** y `allowVarsFileDesign` para los **Archivos de variables**. Sin ella, su sección es
de solo lectura y el servidor se niega a guardar, crear, eliminar o hacer push de sus archivos; los formularios y workflows aún pueden elegirlos. Los
**Formularios**, las **Categorías** y las **Constantes** necesitan `allowFormDesign` del mismo modo: sin ella son de solo lectura, y el servidor
se niega a guardarlos, hacer pull o hacer push de ellos. Solo una persona edita a la vez: consulta [El bloqueo del diseñador](lock.html).

---

## Sus secciones

Cada sección edita un tipo de archivo, guardado en local o en un [repositorio](../repositories/):

| Sección | Qué edita |
|---|---|
| **Formularios** | Los archivos de formularios |
| **Categorías** | Las categorías de `config.yaml` |
| **Constantes** | Las constantes de `config.yaml` |
| **Archivos de variables** | Los archivos de variables que cargan los formularios |
| **Playbooks** | Los playbooks que ejecutan los formularios y los workflows |
| **Inventarios** | Los inventarios: `inventory.yaml`, `group_vars` y `host_vars` |
| **Flujos de trabajo** | Los archivos de [workflow](../workflows/) |

Las secciones con archivos los listan en un explorador de archivos y abren el primero; una sección que aún no tiene archivos lo indica. La
sección **Formularios** y cada sección de archivos tienen un botón **Nuevo archivo** al principio de su barra de herramientas: en Inventarios crea un nuevo
inventario, en Flujos de trabajo un workflow nuevo y vacío. La lupa del explorador abre un cuadro que filtra sus archivos por nombre.

El cuadro de búsqueda de la línea del título busca un texto en el YAML abierto: marca cada lugar donde aparece. Funciona en la
pestaña **YAML**, una vez que el bloqueo del diseñador es tuyo.

---

## Sus pestañas

Todas las secciones tienen las mismas tres pestañas, todas sobre el mismo YAML: un cambio en una se ve en las demás, y **Guardar** lo guarda.

- **YAML** es el archivo tal como está escrito.
- **Visual** lo edita con campos. Solo cambian las claves que toca una edición, así que los comentarios y el resto quedan como estaban escritos.
- **Vista previa** muestra lo que hace, y no edita nada.

Lo que muestran las pestañas Visual y Vista previa, sección por sección:

| Sección | Visual | Vista previa |
|---|---|---|
| **Formularios** | La configuración del formulario y sus campos, con listas de los playbooks, inventarios y workflows del diseñador | El formulario tal como está, cambios sin guardar incluidos; su envío no ejecuta nada |
| **Categorías** | Las categorías como tabla, editables | El menú de la página Formularios, construido a partir de ellas |
| **Constantes** | Las constantes como esquema, editables (una clave se mueve con las flechas del teclado) | Cada constante con su referencia, `$(NAME)`, para copiar, y los formularios que la usan |
| **Archivos de variables** | Las variables, editables | Cada variable con su referencia en un playbook, {% raw %}`{{ name }}`{% endraw %}, para copiar, y los formularios que cargan el archivo |
| **Playbooks** | Los plays: el nombre de cada play, sus hosts, **Become**, **Recoger facts** y roles, y sus tareas, cada una con su módulo y argumentos | El esquema del playbook: sus plays, con sus hosts, roles y tareas, y los playbooks que importa |
| **Inventarios** | Los grupos, sus grupos hijos, sus hosts y las variables que define cada uno | El inventario como árbol, con sus `group_vars` y `host_vars` |
| **Flujos de trabajo** | El grafo del workflow, para [editarlo](../workflows/designer.html) | Una [ejecución de prueba](../workflows/designer.html#trying-it-out): haz clic en un nodo para que falle |

Cuando el YAML no se puede leer, las pestañas Visual y Vista previa dicen por qué, con **Ver en YAML** para abrir el YAML en esa línea.

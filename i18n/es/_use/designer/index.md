---
layout: default
title: Diseñador
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: bf0bdf119ae004ec2da8640d18a254483027098c
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
Un rol también puede ocultar los formularios, playbooks y workflows de otros equipos: consulta [Diseñadores limitados](#limited-designers).

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

---

## Diseñadores limitados

Desde la 7.5.0 tres opciones de rol limitan qué formularios, playbooks y workflows muestra el diseñador, para que cada equipo diseñe los suyos.
Las tres están activadas por defecto y siempre activadas para los admins:

| Opción | Desactivada, el diseñador muestra solo |
|---|---|
| `designAllForms` (**Editar Todos los Formularios**) | Los formularios cuyos `roles` contienen uno de los roles del usuario, y los subformularios que ningún formulario oculto usa |
| `designAllPlaybooks` (**Editar Todos los Playbooks**) | Los playbooks que ejecutan los formularios del usuario, y los que ningún formulario usa aún |
| `designAllWorkflows` (**Editar Todos los Flujos de trabajo**) | Los archivos de workflow que ejecutan los formularios del usuario, anidados incluidos, y los que ningún formulario usa aún |

Un formulario ejecuta un playbook mediante su `playbook`, sus pasos de ansible y los workflows que ejecuta. Lo que un diseñador limitado no puede hacer:

- **Ver un archivo oculto.** Nunca se lista ni se nombra: abrir uno responde como un archivo que no existe, y un archivo nuevo con su nombre
  como un archivo que ya existe.
- **Apuntar a uno.** Un formulario que nombra un formulario oculto como subformulario no muestra nada de él, y se rechaza un formulario o
  un archivo de workflow que nombra un playbook o un workflow oculto.
- **Cambiar un subformulario compartido.** Un subformulario que también usa un formulario oculto es de solo lectura, y un formulario guardado
  debe conservar uno de los roles del usuario.
- **Tocar los formularios ocultos de un archivo.** Un archivo con varios formularios conserva los ocultos tal como están al guardar, y se
  rechaza restaurar una copia de seguridad de los formularios.
- **Añadir código que ejecuta el servidor.** Un formulario guardado no puede ganar una expresión ni una consulta que ejecute el servidor, y la
  vista previa de un formulario aún no guardado no ejecuta ninguna expresión propia.
- **Leer nombres de archivo en la salida de git.** La salida de un pull o de un push omite las líneas que nombran archivos.

`allowFormDesign`, `allowPlaybookDesign` y `allowWorkflowDesign` siguen decidiendo si los archivos mostrados se pueden cambiar.
Los inventarios, los archivos de variables, las categorías y las constantes siguen visibles para todo diseñador. Un usuario con solo una parte
de la configuración ve solo sus propios formularios y archivos de workflow en las pestañas **Formularios** de las páginas de configuración y en
la pestaña **Usado por** de una credencial.

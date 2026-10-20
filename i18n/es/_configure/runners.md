---
layout: default
title: Runners
nav_order: 11
has_children: true
has_toc: false
permalink: /runners.html
translated_from: 339eda183d7748fa923090d9f8e26e2f112b1352
---

# Runners
{: .no_toc }

Dónde se ejecutan los trabajos: contenedores de entorno de ejecución para los playbooks, y AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins para las plantillas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: añade los runners en los que se ejecutan tus trabajos, elige el predeterminado de cada tipo, aprueba los RTE que piden unirse y pruébalos.

---

## En esta sección

| Página | Qué trata |
|---|---|
| [La página de runners](runners/list.html) | La lista de runners, cómo añadir uno, activarlo o desactivarlo, y el predeterminado de cada tipo |
| [Tipos de runner](runners/types.html) | Los productos que puede ser un runner, su dirección y su login |
| [Registro de runners](runners/registration.html) | Cómo un RTE pide unirse y se aprueba, los tokens de unión para instalaciones desatendidas, y el modo base de datos |
| [La página de un runner](runners/runner-page.html) | Las pestañas de un runner, el modo y la conexión de un RTE, y Probar conexión |
| [Quién gestiona los runners](runners/permissions.html) | Quién puede añadir, cambiar y probar runners |


---

## Cómo funciona

Desde la versión 7 la aplicación no ejecuta nada por sí misma: cada trabajo se ejecuta en un **runner**, añadido en **Conexiones > Runners**.
El tipo de un formulario decide qué tipo de runner necesita:

| Tipo de formulario | Se ejecuta en un runner de tipo | Qué se ejecuta |
|---|---|---|
| `ansible` | RTE | Un playbook, en un contenedor de entorno de ejecución |
| `awx`, `aap`, `ascender` | AWX (las variantes AWX, AAP y Ascender) | Una plantilla de job o de workflow |
| `semaphore` | Semaphore | Una plantilla de Semaphore UI |
| `rundeck` | Rundeck | Un job de Rundeck |
| `jenkins` | Jenkins | Un job de Jenkins |

Un formulario `workflow` o `subform` no tiene runner propio: cada nodo de un [workflow](workflows/) elige el suyo. Un nodo
con `runner:` se ejecuta en ese runner (un RTE, o una plantilla o un job en AWX, Semaphore, Rundeck o Jenkins), y cualquier otro en
el RTE predeterminado, así que los nodos de un mismo trabajo pueden ejecutarse en runners distintos. El formulario `multistep`, obsoleto desde la 7 y
sustituido por los workflows, funciona igual: cada uno de sus pasos se ejecuta en el runner que necesita su propio tipo.

Un formulario elige su runner de una de estas dos formas:

- **Por nombre**: `runner: <name>` en el formulario, en un nodo de workflow o en un paso de un multistep obsoleto (también en los
  ajustes del formulario del diseñador). El runner debe ser del tipo que necesita el formulario, o el trabajo falla. El antiguo `awx: <name>`
  sigue funcionando, escribe un aviso de obsolescencia en el log, y desaparece en la 8.
- **Como predeterminado**: un formulario que no nombra ningún runner se ejecuta en el runner predeterminado de su tipo. Si no lo hay, el trabajo falla
  con un mensaje que indica qué tipo de runner añadir.

Un runner desactivado en **Conexiones > Runners** no recibe ningún trabajo, ni por nombre ni como predeterminado: el trabajo falla e indica que se active
o que se nombre otro runner (consulta [Predeterminado y Activado](runners/list.html#default-and-enabled)).


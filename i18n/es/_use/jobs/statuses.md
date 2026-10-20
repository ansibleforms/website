---
layout: default
title: Estados y tipos
parent: Trabajos
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Estados y tipos
{: .no_toc }

Todos los estados que puede tener un trabajo, y los tipos de trabajo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Estados de un trabajo

AnsibleForms asigna los siguientes estados a un trabajo. La lista muestra cada estado como una etiqueta de color:

| Estado | Significado | Qué puedes hacer |
|---|---|---|
| `running` | El trabajo se está ejecutando, o un trabajo aprobado se ha reanudado | Seguir su salida, abortarlo |
| `approve` | El trabajo espera en un [punto de aprobación](../forms/approval.html) antes de ejecutarse (o antes de que se ejecute un paso de un multistep) | Aprobarlo o rechazarlo, si uno de tus roles es aprobador |
| `success` | El playbook, la plantilla o todos los pasos terminaron sin errores | Ver la salida, relanzar, eliminar |
| `failed` | El trabajo terminó con un error, o falló el propio lanzamiento | Ver la salida para saber por qué, relanzar, eliminar |
| `warning` | Un multistep terminó, pero falló un paso que tiene `continue` activado | Ver la salida, relanzar, eliminar |
| `aborted` | El trabajo se abortó desde AnsibleForms, o se canceló el job de AWX / AAP | Ver la salida, relanzar, eliminar |
| `rejected` | Un aprobador rechazó el trabajo; nunca se ejecutó | Ver la salida, relanzar, eliminar |
| `abandoned` | AnsibleForms dejó de seguir el trabajo (consulta [Trabajos abandonados](cleanup.html#abandoned-jobs)) | Revisar los hosts gestionados, relanzar, eliminar |

`running` es azul, `success` es verde y se lee **Correcto**, y `failed` es rojo. `approve` es naranja y se lee **Esperando aprobación**,
para que un trabajo que espera a una persona se distinga de los detenidos; `warning`, `aborted` y `rejected` son ámbar. `abandoned` es
gris: nadie lo detuvo, lo que lo ejecutaba ya no está.

---

## Tipos de trabajo

El tipo de trabajo sigue el `type` del formulario que inició el trabajo, tal como lo muestran la lista y la página del trabajo:

| Tipo mostrado | Qué se ejecuta |
|---|---|
| `ansible` | Un playbook de Ansible, ejecutado en un RTE |
| `awx`, `aap`, `ascender` | Una plantilla de job o de workflow en AWX, AAP o Ascender |
| `semaphore` | Una plantilla en Semaphore UI |
| `rundeck`, `jenkins` | Un job en Rundeck o Jenkins |
| `workflow` | Un [workflow](../workflows/), cuyos nodos de playbook se ejecutan como trabajos propios bajo él |
| `multistep` | Obsoleto, usa `workflow`: una secuencia de pasos, cada uno registrado como un trabajo propio bajo el trabajo principal |

Un trabajo de plantilla se guarda como trabajo `awx` (también en la API REST) y se muestra con el tipo de runner en el que se ejecutó, sea cual sea el
nombre que le dio el formulario: un formulario de tipo `awx` que se ejecuta en un runner AAP muestra `aap`.

Consulta [Formularios de Ansible](../forms/ansible.html), [Formularios de AWX](../forms/awx.html), [Formularios de workflow](../forms/workflow.html) y
[Formularios de varios pasos](../forms/multistep.html) para la parte del formulario.

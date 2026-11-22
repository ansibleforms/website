---
layout: default
title: Limpieza
parent: Trabajos
nav_order: 6
translated_from: 3ccd056f3993f5aea914db2765e62d0d8f89d366
---

# Limpieza
{: .no_toc }

Trabajos cortados por un reinicio, y cuánto tiempo se conservan los trabajos terminados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Trabajos abandonados

Un trabajo en ejecución lo sigue el proceso de AnsibleForms que lo inició. Cuando ese seguimiento se detiene, el trabajo se marca como
`abandoned`:

* **Al arrancar**, los trabajos que este proceso seguía antes de reiniciarse, y los trabajos de antes de la 7 que ningún proceso
  sigue, se marcan como abandonados si siguen en `running` o abortándose; el registro muestra `Abandoned <n> jobs`. Un trabajo que
  se ejecuta en un RTE no se toca: continúa sin el proceso que lo inició.
* **Cada minuto**, la [tarea del sistema](system-tasks.html) **Nodos detenidos** marca como abandonados los trabajos seguidos
  por otro proceso de AnsibleForms (o RTE) que dejó de responder durante 2 minutos; el registro muestra `Abandoned <n> jobs followed by a node that stopped answering`.
* **Cada hora**, la tarea del sistema **Jobs abandonados** marca como abandonados los trabajos que empezaron hace más de un día,
  siguen en `running` y no escribieron salida durante un día. Un trabajo que se ejecuta en un RTE tampoco se toca aquí: el RTE limpia sus propios trabajos cuando se reinicia.

Desde 7.3.0, un trabajo de plantilla en AWX, AAP o Ascender que un reinicio o un nodo detenido dejó abandonado se recupera, si empezó
en las últimas 24 horas: un proceso de AnsibleForms se hace cargo de él, vuelve a seguirlo en el runner, y el trabajo termina con lo que
realmente ocurrió allí. Los trabajos de los demás runners, los playbooks, los workflows y los trabajos multistep siguen abandonados.

Un playbook abandonado puede haberse ejecutado en parte. Revisa los hosts gestionados antes de relanzarlo; consulta
[Un trabajo muestra el estado abandoned](../troubleshooting.html#a-job-shows-the-status-abandoned).

---

## Retención de trabajos

Los trabajos terminados se conservan tantos días como el administrador defina en [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS).

La tarea nocturna del sistema **Limpieza de jobs** (a las 2:30) elimina los trabajos terminados, con su salida y sus pasos, que acabaron
hace más de ese número de días. Solo elimina trabajos con estado `success`, `failed`, `warning`, `aborted`, `rejected` o `abandoned`,
así que los trabajos en ejecución y los que esperan aprobación se conservan por antiguos que sean. El valor por defecto es `90` desde
la 7.6.0 (`0` antes), y `0` conserva todos los trabajos.

Estas horas son las predeterminadas: desde la 7.8.0 un administrador las cambia en la página de la tarea, en **Trabajos > Sistema**, y ve
allí cada una de sus ejecuciones (consulta [Tareas del sistema](system-tasks.html)).

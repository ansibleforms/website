---
layout: default
title: Estados y tipos
parent: Trabajos
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | El playbook terminó pero [requiere atención](#a-job-that-needs-attention): alguien tiene que darle seguimiento. O un multistep terminó, pero falló un paso que tiene `continue` activado | Leer el motivo en la página del trabajo, darle seguimiento, relanzar, eliminar |
| `aborted` | El trabajo se abortó desde AnsibleForms, o se canceló el job de AWX / AAP | Ver la salida, relanzar, eliminar |
| `rejected` | Un aprobador rechazó el trabajo; nunca se ejecutó | Ver la salida, relanzar, eliminar |
| `abandoned` | AnsibleForms dejó de seguir el trabajo (consulta [Trabajos abandonados](cleanup.html#abandoned-jobs)) | Revisar los hosts gestionados, relanzar, eliminar |

`running` es azul, `success` es verde y se lee **Correcto**, y `failed` es rojo. `approve` es naranja y se lee **Esperando aprobación**,
para que un trabajo que espera a una persona se distinga de los detenidos; `warning` se lee **Requiere atención**, y tanto él como `aborted` y `rejected` son ámbar. `abandoned` es
gris: nadie lo detuvo, lo que lo ejecutaba ya no está.

---

## Un trabajo que requiere atención

Desde la 7.8.0, un playbook que terminó según lo previsto, pero deja trabajo para un operador (una aprobación en otro lugar, un
paso manual, una aplicación parcial), puede terminar su trabajo como **Requiere atención** (`warning`) con un mensaje, en lugar de un
`failed` que parece una automatización rota o un `success` que oculta lo que queda pendiente. El playbook lo indica de una de dos
formas:

* un **archivo de estado** junto al playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (o `.yaml`), en un RTE. El RTE lo
  lee en cuanto termina el playbook y luego lo elimina
* **`set_stats`** con la clave `af_job_status`, en un RTE y en AWX, AAP o Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms pasa `__jobid__` en las extravars, para que el playbook pueda construir la ruta del archivo. El archivo gana cuando
un playbook hace ambas cosas.

* Solo un playbook que **terminó correctamente** puede terminar como Requiere atención: un trabajo fallido sigue `failed` y uno
  cancelado `aborted`, diga lo que diga el archivo
* Un archivo que no es válido (sin mensaje, otro estado, YAML roto) se ignora: el trabajo sigue siendo correcto, y su salida dice
  por qué en una línea `[WARNING]`
* El mensaje se muestra en la página del trabajo en un recuadro ámbar, con el detalle plegado debajo como YAML, como tooltip del
  estado en la lista, y en la última línea de salida del trabajo. **Requiere atención** bajo **Pasado** en el menú de trabajos
  lista estos trabajos
* Las [notificaciones](../forms/notifications.html) con `onStatus: [warning]` se envían para ellos; el correo y los canales llevan
  el mensaje, un webhook como [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* En un multistep, un paso que requiere atención se da por superado y se ejecuta el siguiente paso; el multistep entonces también
  requiere atención. En un [workflow](../workflows/), el trabajo cuenta como correcto para el siguiente nodo

Los trabajos de Semaphore, Rundeck y Jenkins no pueden terminar como Requiere atención.

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

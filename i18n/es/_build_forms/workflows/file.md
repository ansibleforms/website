---
layout: default
title: El archivo del workflow
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# El archivo del workflow
{: .no_toc }

La sintaxis del workflow, los tipos de nodo y los ajustes de ejecución de cada nodo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dónde están los archivos de workflow

Los archivos de workflow son archivos YAML en la carpeta local de workflows y en cada repositorio que se usa para workflows.

- **La carpeta local** es [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), por defecto `workflows` dentro de la
  carpeta persistente.
- **Un repositorio** con **¿Usar para workflows?** activado se lee entero, así que sus archivos de workflow pueden estar en cualquier carpeta. El
  diseñador los guarda de vuelta en el repositorio, y **Push** los envía al remoto.

Se lee cada archivo YAML que contiene `workflow_job_templates`, hasta seis carpetas de profundidad, y un archivo puede contener varios
workflows. Un formulario indica un workflow por su `name`, así que mantén los nombres únicos: cuando dos workflows comparten nombre, un trabajo que
lo ejecuta falla y pide que renombres uno de ellos.

---

## La sintaxis

Un archivo de workflow se escribe con la sintaxis de una exportación de AWX, con los nodos bajo `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

También se lee la forma de la colección `awx.awx`: `workflow_nodes` directamente bajo el workflow, y nombres escritos como
cadenas simples (`inventory: staging`) en lugar de mapas (`inventory: {name: staging}`).

### El workflow

Una entrada de workflow tiene algunas claves propias, junto a sus nodos:

| Clave | Qué es |
|---|---|
| `name` | El nombre del workflow, que indica el `workflow:` de un formulario |
| `description` | Para qué sirve, se muestra en el diseñador |
| `extra_vars` | Variables que recibe cada nodo; los valores del formulario ganan sobre ellas |
| `related.workflow_nodes` | Los nodos |

### Un nodo

Cada nodo tiene un identificador, lo que ejecuta y sus enlaces:

| Clave | Qué es |
|---|---|
| `identifier` | El id del nodo: letras, dígitos, puntos, guiones, dos puntos y guiones bajos, único en el workflow |
| `unified_job_template.type` | Lo que ejecuta el nodo: consulta [tipos de nodo](#node-types) |
| `unified_job_template.name` | El playbook, workflow, aprobación o repositorio que ejecuta |
| `related.success_nodes` | Los nodos que se ejecutan cuando este tiene éxito |
| `related.failure_nodes` | Los nodos que se ejecutan cuando este falla |
| `related.always_nodes` | Los nodos que se ejecutan cuando este ha terminado, sea como sea |
| `all_parents_must_converge` | `true`: el nodo espera a que se disparen todos los enlaces que llegan a él, no solo uno |

Los enlaces deben ir hacia delante: un workflow cuyos enlaces forman un bucle no se ejecuta.

---

## Tipos de nodo

Un nodo ejecuta una de cuatro cosas, con los nombres que les da AWX:

| Tipo | Lo que ejecuta el nodo |
|---|---|
| `job_template` | Uno de los playbooks del diseñador, como trabajo propio en el RTE; o, con `runner:`, la plantilla o el job de ese runner |
| `workflow_job_template` | Otro workflow, como trabajo de workflow hijo; los workflows se anidan hasta cinco niveles |
| `workflow_approval_template` | Una aprobación: el trabajo del workflow espera hasta que alguien la aprueba o la rechaza |
| `project` | Un pull del repositorio que indica (la actualización de proyecto de AWX) |

El `unified_job_template.timeout` de un nodo de aprobación se expresa en segundos. Cuando vence sin respuesta, el nodo falla; `0` o sin
tiempo de espera, espera una respuesta el tiempo que haga falta. Una aprobación rechazada hace fallar el nodo, y el workflow continúa por sus
enlaces.

---

## Ajustes de ejecución

Un nodo `job_template` admite los ajustes de un nodo de AWX, en el propio nodo:

| Clave | Qué hace |
|---|---|
| `inventory` | El inventario contra el que se ejecuta el playbook, por su nombre, como el `inventory:` de un formulario |
| `related.credentials` | Las credenciales: cada una llega al playbook con su propio nombre, y la primera *SSH* es también el login con el que se conecta ansible. Una de vault solo abre los vaults |
| `limit` | Se ejecuta solo en estos hosts (`--limit`) |
| `job_tags` | Ejecuta solo las tareas con estos tags (`--tags`) |
| `skip_tags` | Omite las tareas con estos tags (`--skip-tags`) |
| `verbosity` | De `0` a `5`: el número de `-v` |
| `diff_mode` | `true`: muestra los cambios (`--diff`) |
| `job_type` | `check`: una simulación (`--check`); `run` o nada: una ejecución real |
| `extra_data` | Variables que recibe este nodo, por debajo de las `extra_vars` del workflow y de los valores del formulario |

El trabajo del nodo recibe los valores del formulario como extra vars. Los valores del formulario ganan sobre las `extra_vars` del workflow, que ganan
sobre el `extra_data` del nodo, igual que las respuestas de un survey en AWX.

---

## Claves propias de AnsibleForms

Tres claves de un nodo son propias de AnsibleForms, y AWX las ignora, de modo que un workflow puede hacer lo mismo que un formulario de varios pasos:

| Clave | Qué hace |
|---|---|
| `runner` | En un nodo `job_template`, ejecuta la plantilla o el job de ese runner en lugar de un playbook del diseñador: AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins. Un runner RTE ejecuta allí el playbook del nodo. Un mismo workflow puede combinarlos. |
| `if_extra_var` | El nodo solo se ejecuta cuando esta extra var es `true`, como el `ifExtraVar` de un paso de multistep. Si no se cumple, el nodo se omite, y lo que va después se ejecuta como tras un éxito. No en un nodo de aprobación, que siempre se ejecuta. |
| `extra_vars_key` | El nodo recibe solo esta clave de las extra vars, con el usuario copiado dentro, como la `key` de un paso de multistep |

En un runner de plantillas, `unified_job_template.name` es la plantilla o el job que se ejecuta, y el `limit`, los `job_tags`, el modo check
y el modo diff del nodo se pasan igual que los pasaría un formulario del tipo de ese runner. Una `verbosity` mayor que `0` activa el
`verbose` del formulario, y `skip_tags` no se pasa. Solo un runner de AWX (AWX, AAP o Ascender) recibe el inventario del nodo, y las
credenciales como sus credenciales de AWX; Semaphore, Rundeck y Jenkins reciben las credenciales como las `credentials` de un formulario.

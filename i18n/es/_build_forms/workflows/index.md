---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Encadena playbooks, aprobaciones y otros workflows, como hace AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para autores de formularios: qué es un workflow, cómo se ejecutan sus nodos y dónde seguir leyendo.

Un workflow es un grafo de nodos. Cada nodo ejecuta algo: uno de los playbooks del diseñador, otro workflow, una aprobación
o un pull de repositorio. Los enlaces entre los nodos indican qué se ejecuta después: si tiene éxito, si falla o siempre. Un formulario de
[tipo `workflow`](../forms/workflow.html) lo lanza, y la página de trabajos lo dibuja en directo mientras se ejecuta.

Los workflows siguen la sintaxis y las reglas de AWX, así que un workflow exportado de AWX se lee igual en AnsibleForms. Se ejecutan en
el RTE, sin AWX: un nodo de playbook es un trabajo propio, con el inventario, las credenciales, el limit y los tags del nodo.

---

## Cómo se ejecuta un workflow

Los nodos se ejecutan según las reglas de AWX, y las ramas que no dependen unas de otras se ejecutan en paralelo.

- **Un nodo sin padre arranca enseguida**, cuando arranca el workflow.
- **Un enlace se dispara cuando su nodo ha terminado**: un enlace *si tiene éxito* tras un éxito, un enlace *si falla* tras un fallo,
  un enlace *siempre* tras cualquiera de los dos. Un nodo cancelado no dispara ninguno de sus enlaces.
- **Un nodo arranca en cuanto se dispara uno de los enlaces que llegan a él.** Con **Todos los padres deben converger** activado, espera hasta que se hayan
  disparado todos los enlaces que llegan a él.
- **Un nodo que ya no puede arrancar se marca como *no se ejecuta***, igual que los nodos que solo él podía arrancar.
- **El workflow falla cuando un nodo ha fallado y nada lo gestiona**: ese nodo no tiene ningún enlace *si falla* ni *siempre*.
  Un fallo que gestiona un enlace no hace fallar el workflow.

Un nodo con una condición (`if_extra_var`) que no se cumple se omite. Lo que va después se ejecuta como tras un éxito. Un nodo de
aprobación no admite condición: siempre espera una respuesta.

---

## Pasar datos entre nodos

Lo que el playbook de un nodo recoge con `set_stats` llega a los nodos posteriores como extra vars, igual que AWX transmite los
artefactos de un trabajo. Un nodo recibe los datos de cada padre cuyo enlace hacia él se disparó, combinados en el orden en que están
escritos los padres, y transmite lo que recibió más los datos de su propio trabajo; los suyos ganan si ambos definen la misma clave.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Un nodo posterior lee entonces {% raw %}`{{ version }}` y `{{ build_id }}`{% endraw %} como cualquier otra extra var.

Las extra vars de un nodo vienen de cuatro sitios. Uno de ellos, `extra_data`, son las variables propias del nodo: el nombre que les da AWX,
definidas en el nodo en el [archivo del workflow](file.html#run-settings). Cuando dos definen la misma clave, el orden de precedencia es
el de AWX, de menor a mayor:

| Origen | Gana sobre |
|---|---|
| las variables propias del nodo (`extra_data`) | nada |
| los datos transmitidos con `set_stats` | el `extra_data` del nodo |
| las `extra_vars` del workflow | los datos transmitidos |
| los valores del formulario | todo |

- Solo se transmiten los datos globales del playbook: `set_stats` con `per_host: false`, su valor predeterminado.
- Un nodo de aprobación, un nodo omitido y un nodo de proyecto transmiten lo que les llegó.
- La salida de un nodo termina con las claves que transmitió, solo por nombre, ya que sus valores pueden ser secretos.
- El trabajo del nodo guarda sus datos como artefactos (**Mostrar artefactos** en su página), y el trabajo del workflow guarda los datos de todos sus
  nodos, así que un workflow anidado también los transmite a los nodos posteriores.
- Un nodo que se ejecuta en un runner de AWX transmite del mismo modo los artefactos de su trabajo en AWX.
---

## En esta sección

Las siguientes páginas describen los workflows en detalle:

| Página | Qué cubre |
|---|---|
| [El archivo del workflow](file.html) | La sintaxis del archivo, los tipos de nodo y los ajustes de ejecución de cada nodo |
| [Editar en el diseñador](designer.html) | La sección Workflows del diseñador: el grafo, los diálogos de nodo y de enlace y la simulación |
| [Ejecutar un workflow](running.html) | El formulario que lo lanza, la página del trabajo, las salidas de los nodos, las aprobaciones y el aborto |

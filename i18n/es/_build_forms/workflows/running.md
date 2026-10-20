---
layout: default
title: Ejecutar un workflow
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Ejecutar un workflow
{: .no_toc }

Lanza un workflow desde un formulario y síguelo en la página de trabajos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El formulario

Un formulario de [tipo `workflow`](../forms/workflow.html) lanza un workflow, indicado con `workflow:` igual que un playbook: por
su **archivo** en la carpeta de workflows, con sus subcarpetas (`team/deploy-app.yml`), o por el **nombre** del workflow dentro
del archivo (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

Los campos del formulario llegan a cada nodo como extra vars, y también sus [`credentials`](../forms/workflow.html#workflow_credentials), con los nombres
que les da el formulario, igual que los de un formulario de varios pasos llegan a sus pasos:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Las credenciales propias de un nodo, definidas en el archivo del workflow, llegan a su playbook con su propio nombre y ganan si ambos usan el mismo nombre. En la pestaña Visual del diseñador de un formulario, **Workflow** es una lista de los
archivos de workflow del diseñador.

Un nombre de archivo solo también se encuentra en una subcarpeta, cuando solo un archivo lo tiene. Dos workflows con el mismo nombre detienen un formulario que
lo indica por su nombre, y el diseñador avisa al guardar el segundo: renombra uno, o indica su archivo. Un workflow que no se
encuentra termina el trabajo como fallido, con el motivo en su salida.

---

## El trabajo

Un trabajo de workflow se ejecuta en el servidor de AnsibleForms, y cada nodo de playbook se ejecuta como un trabajo propio, hijo del trabajo
del workflow igual que los pasos de un formulario de varios pasos: un playbook del diseñador en el RTE o, para un nodo con un `runner:`, la
plantilla o el job de ese runner en AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins (consulta [Dónde se ejecuta un nodo](designer.html#where-a-node-runs)).

La página del trabajo dibuja el workflow en directo: cada nodo coloreado según su estado, los enlaces que se dispararon y los nodos que no
se ejecutarán. Los datos de la parte superior nombran el workflow en lugar de un playbook.

- **Haz clic en un nodo** que haya terminado para abrir su salida en un diálogo.
- **La salida** contiene la salida de cada nodo bajo un encabezado `WORKFLOW NODE [identifier] (status)`, en el orden en que terminaron
  los nodos.
- **Mostrar variables extra** y **Mostrar artefactos**, en el encabezado de cada nodo en la salida y en el diálogo que se abre desde el grafo,
  muestran las extravars y los artefactos propios de ese nodo (`{}` si no tiene), en JSON o YAML, con un botón Copiar.

Las extravars de un nodo contienen lo que le transmitieron los nodos anteriores, y sus artefactos lo que su playbook recogió con
`set_stats`. Los dos botones siguen las [opciones de rol](../config/roles.html#role-options) `showExtravars` y
`showArtifacts`. Los mismos datos se obtienen con `GET /api/v2/job/{id}/node/{nodeId}`, para cualquiera que pueda ver el trabajo.

El trabajo falla cuando un nodo ha fallado y nada lo ha gestionado, según la regla de AWX; si no, tiene éxito.

---

## Aprobaciones

Un nodo de aprobación retiene el trabajo del workflow hasta que alguien responde.

Cuando el workflow llega a un nodo de aprobación, el estado del trabajo pasa a **Esperando aprobación**: se muestra en la campana y en la
página del trabajo, como un [punto de aprobación](../forms/approval.html) de un formulario. El nombre del nodo es el título de la aprobación y su descripción
el mensaje; el resto viene del `approval` del formulario:

- sus `roles` deciden quién puede aprobarla o rechazarla, y `allowSelf` si quien la lanzó también puede aprobarla;
- a sus `notifications` y `channels` se les envía la solicitud.

Un formulario de workflow sin `approval` también retiene el trabajo en un nodo de aprobación, pero entonces solo un administrador puede aprobarlo.

- **Aprobado**: el nodo tiene éxito y el workflow continúa por sus enlaces *si tiene éxito*.
- **Rechazado**: el nodo falla y el workflow continúa por sus enlaces *si falla*.
- **Tiempo agotado**: pasado el tiempo de espera del nodo sin respuesta, el nodo también falla.

---

## Abortar

**Abortar** en un trabajo de workflow en ejecución lo detiene: los trabajos de nodo en ejecución se abortan, no arranca nada más y se cancela
la aprobación que esté esperando. Un trabajo de workflow que espera una aprobación también se puede abortar.

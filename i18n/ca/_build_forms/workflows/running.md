---
layout: default
title: Executar un workflow
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Executar un workflow
{: .no_toc }

Llança un workflow des d'un formulari i segueix-lo a la pàgina de tasques
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El formulari

Un formulari de [tipus `workflow`](../forms/workflow.html) llança un workflow, indicat amb `workflow:` com es fa amb un playbook: pel
seu **fitxer** a la carpeta de workflows, amb les seves subcarpetes (`team/deploy-app.yml`), o pel **nom** del workflow dins
del fitxer (`deploy-app`):

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

Els camps del formulari arriben a cada node com a extra vars, i també les seves [`credentials`](../forms/workflow.html#workflow_credentials), amb els noms
que els dona el formulari, igual que els d'un formulari multipas arriben als seus passos:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Les credencials pròpies d'un node, definides al fitxer de workflow, arriben al seu playbook amb el seu propi nom i guanyen si tots dos fan servir el mateix nom. A la pestanya Visual d'un formulari al dissenyador, **Workflow** és una llista dels
fitxers de workflow del dissenyador.

Un nom de fitxer sol també es troba en una subcarpeta, quan només un fitxer el té. Dos workflows amb el mateix nom aturen un formulari que
l'indica pel nom, i el dissenyador avisa quan deses el segon: reanomena'n un, o indica'n el fitxer. Un workflow que no es pot
trobar fa que la tasca acabi fallida, amb el motiu a la sortida.

---

## La tasca

Una tasca de workflow s'executa al servidor d'AnsibleForms, i cada node de playbook s'executa com una tasca pròpia, filla de la tasca del
workflow, igual que els passos d'un formulari multipas: un playbook del dissenyador a l'RTE o, per a un node amb un `runner:`, la plantilla
o el job d'aquest runner a AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins (vegeu [On s'executa un node](designer.html#where-a-node-runs)).

La pàgina de la tasca dibuixa el workflow en directe: cada node amb el color del seu estat, els enllaços que s'han activat i els nodes que no
s'executaran. Les dades de la part superior indiquen el workflow en lloc d'un playbook.

- **Fes clic en un node** que hagi acabat per obrir-ne la sortida en un diàleg.
- **La sortida** conté la sortida de cada node sota una capçalera `WORKFLOW NODE [identifier] (status)`, en l'ordre en què han
  acabat els nodes.
- **Mostra les extravars** i **Mostra els artefactes**, a la capçalera de cada node a la sortida i al diàleg que s'obre des del graf,
  mostren les extravars i els artefactes propis d'aquest node (`{}` si no en té), en JSON o YAML, amb un botó Copia.

Les extravars d'un node contenen el que li han passat els nodes anteriors, i els seus artefactes, el que el seu playbook ha recollit amb
`set_stats`. Els dos botons segueixen les [opcions de rol](../config/roles.html#role-options) `showExtravars` i
`showArtifacts`. Les mateixes dades s'obtenen de `GET /api/v2/job/{id}/node/{nodeId}`, per a qualsevol que pugui veure la tasca.

La tasca falla quan un node ha fallat i res no ho ha gestionat, segons la regla d'AWX; si no, té èxit.

---

## Aprovacions

Un node d'aprovació reté la tasca del workflow fins que algú hi respon.

Quan el workflow arriba a un node d'aprovació, l'estat de la tasca passa a **Esperant aprovació**: es mostra a la campaneta i a la
pàgina de la tasca, com un [punt d'aprovació](../forms/approval.html) d'un formulari. El nom del node és el títol de l'aprovació, i la seva descripció,
el missatge; la resta surt de l'`approval` del formulari:

- els seus `roles` decideixen qui la pot aprovar o rebutjar, i `allowSelf`, si qui l'ha llançada també la pot aprovar;
- la sol·licitud s'envia a les seves `notifications` i `channels`.

Un formulari de workflow sense `approval` també reté la tasca en un node d'aprovació, però llavors només un administrador la pot aprovar.

- **Aprovada**: el node té èxit i el workflow continua pels seus enllaços *si té èxit*.
- **Rebutjada**: el node falla i el workflow continua pels seus enllaços *si falla*.
- **Temps esgotat**: passat el temps límit del node sense resposta, el node també falla.

---

## Avortar

**Avorta** en una tasca de workflow en execució l'atura: les tasques dels nodes en curs s'avorten, no comença res més, i l'aprovació que
estigui esperant es cancel·la. Una tasca de workflow que espera una aprovació també es pot avortar.

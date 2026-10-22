---
layout: default
title: El fitxer de workflow
parent: Workflows
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# El fitxer de workflow
{: .no_toc }

La sintaxi del workflow, els tipus de node i les opcions d'execució de cada node
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## On són els fitxers de workflow

Els fitxers de workflow són fitxers YAML a la carpeta local de workflows i a cada repositori que es fa servir per a workflows.

- **La carpeta local** és [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), per defecte `workflows` dins de la
  carpeta persistent.
- **Un repositori** amb **Fer servir per a workflows?** activat es llegeix sencer, de manera que els seus fitxers de workflow poden estar a qualsevol carpeta. El
  dissenyador els torna a desar al repositori, i **Push** els envia al remot.

Es llegeix cada fitxer YAML que conté `workflow_job_templates`, fins a sis carpetes de profunditat, i un fitxer pot contenir diversos
workflows. Un formulari anomena un workflow pel seu `name`, així que mantén els noms únics: quan dos workflows comparteixen nom, una tasca que
l'executa falla i demana que en reanomenis un.

---

## La sintaxi

Un fitxer de workflow s'escriu amb la sintaxi d'una exportació d'AWX, amb els nodes a `related.workflow_nodes`:

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

També es llegeix la forma de la col·lecció `awx.awx`: `workflow_nodes` directament sota el workflow, i noms escrits com a
cadenes simples (`inventory: staging`) en lloc de mapes (`inventory: {name: staging}`).

### El workflow

Una entrada de workflow té unes quantes claus pròpies, al costat dels seus nodes:

| Clau | Què és |
|---|---|
| `name` | El nom del workflow, el que indica el `workflow:` d'un formulari |
| `description` | Per a què serveix, es mostra al dissenyador |
| `extra_vars` | Variables que rep cada node; els valors del formulari hi tenen prioritat |
| `related.workflow_nodes` | Els nodes |

### Un node

Cada node té un identificador, el que executa i els seus enllaços:

| Clau | Què és |
|---|---|
| `identifier` | L'id del node: lletres, dígits, punts, guions, dos punts i guions baixos, únic dins del workflow |
| `unified_job_template.type` | Què executa el node: vegeu [tipus de node](#node-types) |
| `unified_job_template.name` | El playbook, el workflow, l'aprovació o el repositori que executa |
| `related.success_nodes` | Els nodes que s'executen quan aquest té èxit |
| `related.failure_nodes` | Els nodes que s'executen quan aquest falla |
| `related.always_nodes` | Els nodes que s'executen quan aquest ha acabat, sigui com sigui |
| `all_parents_must_converge` | `true`: el node espera que s'activin tots els enllaços que hi arriben, no només un |

Els enllaços han d'anar endavant: un workflow els enllaços del qual fan un bucle no s'executa.

---

## Tipus de node

Un node executa una de quatre coses, anomenades com les anomena AWX:

| Tipus | Què executa el node |
|---|---|
| `job_template` | Un dels playbooks del dissenyador, com a tasca pròpia a l'RTE; o, amb `runner:`, la plantilla o el job d'aquest runner |
| `workflow_job_template` | Un altre workflow, com a tasca de workflow filla; els workflows es poden niar fins a cinc nivells |
| `workflow_approval_template` | Una aprovació: la tasca del workflow espera fins que algú l'aprova o la rebutja |
| `project` | Un pull del repositori que indica (l'actualització de projecte d'AWX) |

El `unified_job_template.timeout` d'un node d'aprovació s'expressa en segons. Quan passa sense resposta, el node falla; amb `0` o sense
temps límit, espera una resposta el temps que calgui. Una aprovació rebutjada fa fallar el node, i el workflow continua pels seus
enllaços.

---

## Opcions d'execució

Un node `job_template` admet les opcions d'un node d'AWX, al mateix node:

| Clau | Què fa |
|---|---|
| `inventory` | L'inventari contra el qual s'executa el playbook, pel seu nom, com l'`inventory:` d'un formulari |
| `related.credentials` | Les credencials: cadascuna arriba al playbook amb el seu propi nom, i la primera de tipus *SSH* també és l'accés amb què es connecta ansible. Una de tipus vault només obre els vaults |
| `limit` | Només s'executa en aquests hosts (`--limit`) |
| `job_tags` | Només executa les tasques amb aquestes etiquetes (`--tags`) |
| `skip_tags` | Omet les tasques amb aquestes etiquetes (`--skip-tags`) |
| `verbosity` | De `0` a `5`: el nombre de `-v` |
| `diff_mode` | `true`: mostra els canvis (`--diff`) |
| `job_type` | `check`: una simulació (`--check`); `run` o res: una execució real |
| `extra_data` | Variables que rep aquest node, per sota de les `extra_vars` del workflow i dels valors del formulari |

La tasca del node rep els valors del formulari com a extra vars. Els valors del formulari tenen prioritat sobre les `extra_vars` del workflow, que tenen prioritat
sobre l'`extra_data` del node, com passa amb les respostes d'un survey a AWX.

---

## Claus pròpies d'AnsibleForms

Tres claus d'un node són pròpies d'AnsibleForms, i AWX les ignora, de manera que un workflow pot fer el que fa un formulari multipas:

| Clau | Què fa |
|---|---|
| `runner` | En un node `job_template`, executa la plantilla o el job d'aquest runner en lloc d'un playbook del dissenyador: AWX, AAP, Ascender, Semaphore, Rundeck o Jenkins. Un runner RTE hi executa el playbook del node. Un mateix workflow els pot combinar. |
| `if_extra_var` | El node només s'executa quan aquesta extra var és `true`, com l'`ifExtraVar` d'un pas multistep. Si no es compleix, el node s'omet, i el que el segueix s'executa com després d'un èxit. No en un node d'aprovació, que sempre s'executa. |
| `extra_vars_key` | El node només rep aquesta clau de les extra vars, amb l'usuari copiat a dins, com la `key` d'un pas multistep |

En un runner de plantilles, `unified_job_template.name` és la plantilla o el job que cal executar, i el `limit`, els `job_tags`, el mode check
i el mode diff del node es passen tal com els passaria un formulari del tipus d'aquest runner. Una `verbosity` superior a `0` activa el
`verbose` del formulari, i `skip_tags` no es passa. Només un runner d'AWX (AWX, AAP o Ascender) rep l'inventari del node, i les
credencials com a credencials d'AWX; Semaphore, Rundeck i Jenkins reben les credencials com els `credentials` d'un formulari.

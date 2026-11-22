---
layout: default
title: L'estructura pròpia d'Ansible
parent: Repositoris Git
nav_order: 6
translated_from: e34dd6322dd3240a3c390d4786ed9f933a1cd267
---

# Un repositori amb l'estructura pròpia d'Ansible
{: .no_toc }

Executeu el playbook d'un formulari des de l'arrel del seu repositori, com AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Per a administradors i autors de formularis amb els playbooks en un repositori organitzat com ho documenta Ansible, des de la 7.8.0.

---

## L'estructura

L'estructura pròpia d'Ansible manté la configuració, els inventaris, els playbooks i els rols junts a l'arrel del repositori.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

Els playbooks són a `playbooks/` i els rols a `roles/`, de manera que Ansible troba els rols gràcies a l'`ansible.cfg` de
l'arrel, que només llegeix quan `ansible-playbook` s'inicia en aquesta carpeta:

```ini
[defaults]
roles_path = ./roles
```

Les rutes relatives d'`ansible.cfg` es llegeixen des de la carpeta que el conté, així que `collections_path = ./collections`
funciona igual. AWX executa els playbooks d'un projecte des de l'arrel del projecte, i des de la 7.8.0 un formulari pot fer el mateix.

---

## Indicar el repositori en un formulari

Un formulari indica el repositori des del qual s'executa el seu playbook amb `playbookRepository`, en un formulari `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

Aleshores el job s'executa des de l'arrel d'`infra`, sigui on sigui la carpeta dels playbooks:

| Què | Es llegeix des de |
|---|---|
| `ansible.cfg` | L'arrel del repositori, amb el seu `roles_path`, el seu `collections_path` i totes les altres opcions |
| `playbook` | L'arrel: `playbooks/site.yml`, no `site.yml` |
| Un `inventory` o `__inventory__` relatiu | L'arrel: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Continua movent la carpeta d'execució, ara des de l'arrel |

Un inventari indicat pel seu nom (`inventory: production`) continua sent un dels
[inventaris](../designer/) del dissenyador, com abans. El repositori ha de tenir el tipus d'ús **Playbooks**: un nom que no
és un repositori utilitzat per als playbooks fa fallar el job amb `playbookRepository '<name>' is not a repository used for playbooks`.

Un pas `ansible` d'un [formulari multipas](../forms/multistep.html) indica el seu propi `playbookRepository`, i un node de
playbook d'un [workflow](../workflows/file.html#ansibleforms-own-keys) l'indica com a `playbook_repository`.

---

## Diversos repositoris de playbooks

Des de la 7.8.0 diversos repositoris poden tenir el tipus d'ús **Playbooks**; abans només s'utilitzava el primer, amb un avís.

| El formulari | Des d'on s'executa el seu playbook |
|---|---|
| Sense `playbookRepository` | El primer repositori utilitzat per als playbooks, en l'ordre en què es van afegir: la seva carpeta `playbooks`, si no l'arrel, exactament com abans de la 7.8.0 |
| Amb `playbookRepository: <name>` | L'arrel d'aquest repositori, inclòs el primer |

Per tant, un formulari que indica el primer repositori s'executa des de la seva arrel, i dona el seu `playbook` des d'allà
(`playbooks/site.yml`). Els formularis que no n'indiquen cap continuen executant-se com sempre.

---

## Al dissenyador

El dissenyador ofereix el repositori i els playbooks que li corresponen, en un formulari i en un node de workflow.

| On | Què mostra |
|---|---|
| La pestanya **Visual** d'un formulari | **Repositori**, a sobre de **Playbook**, quan hi ha diversos repositoris de playbooks o el formulari n'indica un. La seva primera opció, **Primer repositori de playbooks**, treu la clau |
| **Playbook** | Els playbooks del repositori triat, indicats des de la seva arrel; amb **Primer repositori de playbooks**, els del primer, tal com els executa |
| El node de playbook d'un workflow | El mateix camp **Repositori**, a la seva pestanya **Com s'executa**, i els playbooks d'aquest repositori a **Què executa** |
| La secció **Playbooks** | Els playbooks del primer repositori, des de la seva carpeta `playbooks` (si no, l'arrel), i després cada altre repositori sencer, en una carpeta amb el seu nom |

L'opció de rol [**Editar tots els playbooks**](../designer/#limited-designers) compta un playbook pel seu repositori i la seva
ruta: un formulari que executa `playbooks/site.yml` d'`infra` utilitza aquest fitxer, no un `site.yml` del primer repositori.

---

## En un runner RTE

Un [RTE](../rte/) rep el repositori que indica el job, en qualsevol dels seus [modes de fitxers](../rte/modes.html).

- Amb `RTE_FILES=transfer`, el predeterminat, l'aplicació envia sencer, empaquetat, el repositori que indica el formulari, en
  lloc de la carpeta `playbooks` del primer repositori.
- Amb `RTE_FILES=local`, l'RTE s'executa des del seu propi clon d'aquest repositori, a `REPO_PATH`.

L'RTE ha de ser 7.8.0 o posterior per executar un formulari que indica el seu repositori. Els runners AWX, Semaphore, Rundeck i
Jenkins executen les seves pròpies plantilles i jobs: `playbookRepository` no és una clau dels seus formularis, i un node de
workflow en un d'aquests runners no en té.

---

## Exemple: un formulari per a cada entorn

El formulari següent executa `playbooks/site.yml` d'`infra` contra l'inventari de l'entorn que tria l'usuari.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

El camp `__inventory__` dona l'inventari `inventories/production/hosts.yaml` per a **production**, llegit des de l'arrel
d'`infra`, amb els `group_vars` al costat. Els rols de `site.yml` vénen de `roles/`, gràcies a `roles_path` a `ansible.cfg`.

---

## El mateix abans de la 7.8.0

Abans de la 7.8.0 un formulari només podia sortir de la carpeta `playbooks` de l'únic repositori de playbooks, amb `playbookSubPath: ../`.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

També s'executa des de l'arrel, amb aquests límits, que `playbookRepository` elimina:

- Només es podia arribar al primer repositori utilitzat per als playbooks, així que l'estructura d'Ansible havia de ser aquest.
- La llista de playbooks del dissenyador mostrava `site.yml`, des de la carpeta `playbooks`, així que `playbooks/site.yml` s'escrivia a mà.
- Amb `RTE_FILES=transfer`, el predeterminat, l'RTE només rebia la carpeta `playbooks`, així que `../` no arribava a
  l'`ansible.cfg`, als rols ni als inventaris: només funcionava amb `RTE_FILES=local`.

Passar un formulari així a la 7.8.0 és canviar `playbookSubPath: ../` per `playbookRepository: <name>`; `playbook` i
`__inventory__` es queden com estan.

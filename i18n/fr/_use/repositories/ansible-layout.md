---
layout: default
title: La structure propre à Ansible
parent: Dépôts git
nav_order: 6
translated_from: e34dd6322dd3240a3c390d4786ed9f933a1cd267
---

# Un dépôt dans la structure propre à Ansible
{: .no_toc }

Exécuter le playbook d'un formulaire depuis la racine de son dépôt, comme AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les admins et les auteurs de formulaires dont les playbooks sont dans un dépôt organisé comme Ansible le documente, depuis 7.8.0.

---

## La structure

La structure propre à Ansible place la configuration, les inventaires, les playbooks et les rôles côte à côte à la racine du dépôt.

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

Les playbooks sont dans `playbooks/` et les rôles dans `roles/` : Ansible trouve donc les rôles grâce au `ansible.cfg` de la
racine, qu'il ne lit que lorsque `ansible-playbook` démarre dans ce dossier :

```ini
[defaults]
roles_path = ./roles
```

Les chemins relatifs de `ansible.cfg` sont lus depuis le dossier qui le contient, donc `collections_path = ./collections`
fonctionne de la même façon. AWX exécute les playbooks d'un projet depuis la racine du projet, et depuis 7.8.0 un
formulaire peut faire de même.

---

## Nommer le dépôt dans un formulaire

Un formulaire nomme le dépôt depuis lequel son playbook s'exécute avec `playbookRepository`, sur un formulaire `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

Le job s'exécute alors depuis la racine de `infra`, quel que soit le dossier des playbooks :

| Quoi | Lu depuis |
|---|---|
| `ansible.cfg` | La racine du dépôt, avec son `roles_path`, son `collections_path` et tous ses autres réglages |
| `playbook` | La racine : `playbooks/site.yml`, pas `site.yml` |
| Un `inventory` ou `__inventory__` relatif | La racine : `inventories/production/hosts.yaml` |
| `playbookSubPath` | Déplace toujours le dossier d'exécution, désormais depuis la racine |

Un inventaire désigné par son nom (`inventory: production`) reste l'un des [inventaires](../designer/) du concepteur, comme
avant. Le dépôt doit avoir le type d'utilisation **Playbooks** : un nom qui n'est pas un dépôt utilisé pour les playbooks
fait échouer le job avec `playbookRepository '<name>' is not a repository used for playbooks`.

Une étape `ansible` d'un [formulaire multistep](../forms/multistep.html) nomme son propre `playbookRepository`, et un nœud
playbook d'un [workflow](../workflows/file.html#ansibleforms-own-keys) le nomme `playbook_repository`.

---

## Plusieurs dépôts de playbooks

Depuis 7.8.0, plusieurs dépôts peuvent avoir le type d'utilisation **Playbooks** ; avant, seul le premier servait, avec un avertissement.

| Le formulaire | D'où s'exécute son playbook |
|---|---|
| Sans `playbookRepository` | Le premier dépôt utilisé pour les playbooks, dans l'ordre où ils ont été ajoutés : son dossier `playbooks`, sinon sa racine, exactement comme avant 7.8.0 |
| Avec `playbookRepository: <name>` | La racine de ce dépôt, le premier compris |

Un formulaire qui nomme le premier dépôt s'exécute donc depuis sa racine, et donne son `playbook` depuis celle-ci
(`playbooks/site.yml`). Les formulaires qui n'en nomment aucun continuent de s'exécuter comme toujours.

---

## Dans le concepteur

Le concepteur propose le dépôt et les playbooks qui vont avec, sur un formulaire et sur un nœud de workflow.

| Où | Ce qu'il montre |
|---|---|
| L'onglet **Visuel** d'un formulaire | **Dépôt**, au-dessus de **Playbook**, quand il y a plusieurs dépôts de playbooks ou que le formulaire en nomme un. Sa première option, **Premier dépôt de playbooks**, retire la clé |
| **Playbook** | Les playbooks du dépôt choisi, nommés depuis sa racine ; avec **Premier dépôt de playbooks**, ceux du premier, tels qu'il les exécute |
| Un nœud playbook d'un workflow | Le même champ **Dépôt**, sur son onglet **Comment il s'exécute**, et les playbooks de ce dépôt sur **Ce qu'il exécute** |
| La section **Playbooks** | Les playbooks du premier dépôt, depuis son dossier `playbooks` (sinon sa racine), puis chaque autre dépôt entier, dans un dossier à son nom |

L'option de rôle [**Modifier tous les playbooks**](../designer/#limited-designers) compte un playbook par son dépôt et son
chemin : un formulaire qui exécute `playbooks/site.yml` de `infra` utilise ce fichier, pas un `site.yml` du premier dépôt.

---

## Sur un runner RTE

Un [RTE](../rte/) reçoit le dépôt que nomme le job, dans l'un ou l'autre de ses [modes de fichiers](../rte/modes.html).

- Avec `RTE_FILES=transfer`, le mode par défaut, l'application envoie le dépôt entier que nomme le formulaire, empaqueté, au
  lieu du dossier `playbooks` du premier dépôt.
- Avec `RTE_FILES=local`, le RTE s'exécute depuis son propre clone de ce dépôt, sous `REPO_PATH`.

Le RTE doit être en 7.8.0 ou plus récent pour exécuter un formulaire qui nomme son dépôt. Les runners AWX, Semaphore, Rundeck
et Jenkins exécutent leurs propres modèles et jobs : `playbookRepository` n'est pas une clé de leurs formulaires, et un nœud
de workflow sur un tel runner n'en a pas.

---

## Exemple : un formulaire pour chaque environnement

Le formulaire ci-dessous exécute `playbooks/site.yml` de `infra` sur l'inventaire de l'environnement choisi par l'utilisateur.

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

Le champ `__inventory__` donne l'inventaire `inventories/production/hosts.yaml` pour **production**, lu depuis la racine de
`infra`, avec les `group_vars` à côté. Les rôles de `site.yml` viennent de `roles/`, grâce au `roles_path` de `ansible.cfg`.

---

## La même chose avant 7.8.0

Avant 7.8.0, un formulaire pouvait seulement sortir du dossier `playbooks` de l'unique dépôt de playbooks, avec `playbookSubPath: ../`.

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

Il s'exécute aussi depuis la racine, avec ces limites, que `playbookRepository` supprime :

- Seul le premier dépôt utilisé pour les playbooks était accessible, la structure Ansible devait donc être celui-là.
- La liste des playbooks du concepteur montrait `site.yml`, depuis le dossier `playbooks`, donc `playbooks/site.yml` se tapait à la main.
- Avec `RTE_FILES=transfer`, le mode par défaut, le RTE ne recevait que le dossier `playbooks`, donc `../` n'atteignait pas
  le `ansible.cfg`, les rôles ni les inventaires : cela ne marchait qu'avec `RTE_FILES=local`.

Passer un tel formulaire à 7.8.0 revient à remplacer `playbookSubPath: ../` par `playbookRepository: <name>` ; `playbook` et
`__inventory__` restent tels quels.

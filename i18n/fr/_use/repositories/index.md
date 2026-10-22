---
layout: default
title: Dépôts git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Dépôts git
{: .no_toc }

Conserver les formulaires, les fichiers de variables, la configuration et les playbooks dans git
{: .fs-6 .fw-300 }

---

Pour les admins qui conservent formulaires, configuration et playbooks dans git : ce qu'un dépôt peut contenir et quelle source l'emporte.

---

## À quoi sert un dépôt

Un dépôt est un dépôt git distant qu'AnsibleForms clone et tient à jour, et chacun a des interrupteurs qui indiquent ce qu'il contient :

| Interrupteur | Ce qu'AnsibleForms y lit | Dossier dans le dépôt |
|---|---|---|
| **Utiliser pour la configuration ?** | `config.yaml` avec les catégories, les rôles et les constantes | la racine |
| **Utiliser pour les formulaires ?** | Les fichiers de formulaires, que le concepteur y enregistre aussi, et leurs fichiers de variables | `forms`, ou la racine ; fichiers de variables dans `vars` |
| **Utiliser pour les playbooks ?** | Les playbooks Ansible qu'exécutent les jobs | `playbooks`, ou la racine |
| **Utiliser pour les workflows ?** | Les fichiers de [workflow](../workflows/), que le concepteur y enregistre aussi | n'importe quel dossier |
| **Utiliser pour les inventaires ?** | Un inventaire, nommé d'après le dépôt, qu'un formulaire désigne avec `inventory:` | la racine : `inventory.yaml`, `group_vars`, `host_vars` |

Sans le sous-dossier, la racine du dépôt est utilisée. Un seul dépôt peut tout contenir ; si vous les séparez, seuls **Utiliser pour les
formulaires**, **Utiliser pour les workflows** et **Utiliser pour les inventaires** peuvent être activés sur plusieurs : les autres interrupteurs prennent le premier dépôt
et journalisent un avertissement.

Chaque dépôt est cloné dans un sous-dossier qui porte son nom, sous [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Un seul dépôt pour tout

Un seul dépôt peut contenir les formulaires, les fichiers de variables, la configuration et les playbooks, avec les interrupteurs activés et un sous-dossier par type.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un dépôt par usage

Des dépôts séparés permettent aux équipes de posséder leur partie, avec un interrupteur chacun et les fichiers directement à la racine.

| Dépôt | Interrupteur | Contenu à la racine |
|---|---|---|
| `af-config` | **Utiliser pour la configuration ?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Utiliser pour les formulaires ?** | Les fichiers de formulaires de chaque équipe, fusionnés en une seule liste |
| `af-playbooks` | **Utiliser pour les playbooks ?** | Les playbooks et les rôles |

Seuls les formulaires peuvent venir de plusieurs dépôts ; la configuration et les playbooks viennent chacun d'un seul. Les fichiers de variables viennent du dossier `vars`
du premier dépôt de formulaires qui en a un.

---

## Comment les dépôts se combinent avec les dossiers locaux

Le contenu d'un dépôt remplace le dossier local correspondant ; ce tableau résume d'où chaque type de fichier est lu.

| Contenu | Lu depuis, la première correspondance l'emporte |
|---|---|
| Configuration | 1. la base de données, quand la configuration y est conservée ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. le `config.yaml` du dépôt **Utiliser pour la configuration** <br> 3. le `config.yaml` d'un dépôt **Utiliser pour les formulaires**, quand aucun dépôt n'est utilisé pour la configuration <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulaires | Chaque dépôt **Utiliser pour les formulaires** plus `FORMS_STAGING_PATH` ; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) uniquement s'il n'y en a aucun |
| Playbooks | Le dépôt **Utiliser pour les playbooks**, sinon [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Fichiers de variables | Le dossier `vars` du premier dépôt **Utiliser pour les formulaires** qui en a un, sinon [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Chaque dépôt **Utiliser pour les workflows** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), ensemble |

Les formulaires de plusieurs dépôts sont fusionnés en une seule liste. Quand deux d'entre eux contiennent un formulaire portant le même nom, le premier
chargé est conservé et l'avertissement `skipping duplicate form <name>` est journalisé : gardez donc des noms de formulaire uniques entre les dépôts.

---

## Dépannage

La plupart des problèmes apparaissent dans la colonne **Pull** et dans **Afficher la sortie du dernier pull** (ou **Afficher la sortie du dernier push**), qui contiennent le
message d'erreur de git lui-même.

- [Le clonage ou le pull d'un dépôt a échoué](../troubleshooting.html#a-repository-clone-or-pull-failed) : authentification, hôtes
  connus et modifications locales.
- [Le dépôt de formulaires n'est pas encore cloné](../troubleshooting.html#the-forms-repository-is-not-cloned-yet) : le concepteur
  ne peut pas enregistrer avant le premier clonage.
- Un dépôt bloqué en `running` est remis à `failed` : après un redémarrage, au démarrage suivant ; en moins d'une minute dès que le nœud
  qui exécute son opération git cesse de répondre pendant 2 minutes ; et dans tous les cas après 2 heures. Relancez **Pull**.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Contenu |
|---|---|
| [Ajouter un dépôt](adding.html) | La page Dépôts, chaque champ d'un dépôt, et la déclaration d'un dépôt dans le config seed |
| [Authentification](authentication.html) | HTTPS avec un jeton, SSH avec la clé générée, et commandes git personnalisées |
| [Récupérer les modifications](pulling.html) | Pulls planifiés, manuels et via l'API, et modifications locales |
| [Concepteur et push](designer.html) | Modifier des formulaires dans le concepteur et les pousser vers le dépôt |

---
layout: default
title: Dépôts git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Dépôts git
{: .no_toc }

Conserver les formulaires, les playbooks, les paramètres et les connexions dans git
{: .fs-6 .fw-300 }

---

Pour les admins qui conservent formulaires, playbooks et configuration de l'application dans git : ce qu'un dépôt peut contenir et quelle source l'emporte.

---

## À quoi sert un dépôt

Un dépôt est un dépôt git distant qu'AnsibleForms clone et tient à jour, et ses types d'usage disent ce que l'application en tire.

Depuis la 7.8.0, l'étape **Utilisation** d'un dépôt liste les types d'usage sous six rubriques : **Designer**, **Jobs**, **Système**,
**Apparence**, **Accès** et **Connexions**. Les types de **Designer** sont les fichiers que l'application lit tels quels :

| Type d'usage | Ce qu'AnsibleForms y lit | Où dans le dépôt |
|---|---|---|
| **Formulaires** | Les fichiers de formulaires, que le concepteur y enregistre aussi, et leurs fichiers de variables | `forms`, ou la racine ; fichiers de variables dans `vars` |
| **Playbooks** | Les playbooks Ansible qu'exécutent les jobs | `playbooks`, ou la racine |
| **Workflows** | Les fichiers de [workflow](../workflows/), que le concepteur y enregistre aussi | n'importe quel dossier |
| **Inventaires** | Un inventaire, nommé d'après le dépôt, qu'un formulaire désigne avec `inventory:` | la racine : `inventory.yaml`, `group_vars`, `host_vars` |
| **Catégories**, **Constantes** | Les catégories et les constantes, que le concepteur enregistre aussi dans leur fichier | le fichier qui donne `controller_categories:` ou `controller_constants:` |

Chaque autre type conserve des paramètres, des utilisateurs ou des connexions de l'application dans des fichiers YAML, lus et écrits dans les deux sens :
les planifications, les paramètres Général, les pages Apparence, les utilisateurs, groupes et rôles, les méthodes de connexion, les identifiants, les runners et
les autres connexions. Ils sont décrits dans [Configuration dans git](config-as-code.html).

**Formulaires**, **Playbooks**, **Workflows** et **Inventaires** peuvent être cochés sur plusieurs dépôts, et chaque autre type sur
un seul dépôt au plus. Un formulaire exécute les playbooks du premier dépôt **Playbooks**, sauf s'il nomme le sien avec
`playbookRepository`. Chaque dépôt est cloné dans un sous-dossier qui porte son nom, sous
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

L'interrupteur **Utiliser pour la configuration ?** d'avant la 7.8.0 est remplacé par **Rôles**, **Catégories** et **Constantes**, chacun lu depuis le
fichier qui donne sa clé ; le `config.yaml` d'un dépôt est encore lu, mais déprécié (voir
[Rôles, catégories et constantes](config-as-code.html#roles-categories-and-constants)).

### Un seul dépôt pour tout

Un seul dépôt peut contenir les formulaires, les fichiers de variables, la configuration et les playbooks, avec les types d'usage cochés et un sous-dossier par type.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Un dépôt par usage

Des dépôts séparés permettent aux équipes de posséder leur partie, chacun avec ses propres types d'usage et les fichiers directement à la racine.

| Dépôt | Types d'usage | Contenu à la racine |
|---|---|---|
| `af-platform` | **Rôles**, **Catégories**, **Constantes**, **Identifiants**, **Runners** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formulaires** | Les fichiers de formulaires de chaque équipe, fusionnés en une seule liste |
| `af-playbooks` | **Playbooks** | Les playbooks et les rôles |

Les fichiers de variables viennent du dossier `vars` du premier dépôt de formulaires qui en a un.

---

## Comment les dépôts se combinent avec les dossiers locaux

Le contenu d'un dépôt remplace le dossier local correspondant ; ce tableau résume d'où chaque type de fichier est lu.

| Contenu | Lu depuis, la première correspondance l'emporte |
|---|---|
| Rôles, catégories, constantes | Chaque clé séparément : 1. le fichier qui donne `controller_roles:`, `controller_categories:` ou `controller_constants:` dans le dépôt ayant ce type d'usage <br> 2. le `config.yaml` de ce dépôt (déprécié) <br> 3. la configuration de base : la base de données, quand la configuration y est conservée ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), sinon [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulaires | Chaque dépôt **Formulaires** plus `FORMS_STAGING_PATH` ; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) uniquement s'il n'y en a aucun |
| Playbooks | Le dépôt **Playbooks**, sinon [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Fichiers de variables | Le dossier `vars` du premier dépôt **Formulaires** qui en a un, sinon [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Chaque dépôt **Workflows** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), ensemble |

Les formulaires de plusieurs dépôts sont lus dans l'ordre où les dépôts ont été ajoutés. Quand deux d'entre eux contiennent un formulaire portant le même
nom, la copie du dépôt ajouté en premier est utilisée, et un avertissement nomme les deux copies : gardez donc des noms de formulaire uniques entre les dépôts.

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
| [Configuration dans git](config-as-code.html) | Chaque paramètre conservé dans un dépôt git, lu et écrit dans les deux sens |

---
layout: default
title: Configuration dans git
parent: Dépôts git
nav_order: 5
translated_from: 7d0beda8f50fb1602dd685827ccbf20eb3679501
---

# Configuration dans git
{: .no_toc }

Chaque paramètre conservé dans un dépôt git, lu et écrit dans les deux sens
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les admins qui veulent les paramètres, les utilisateurs et les connexions d'AnsibleForms revus et versionnés dans git, depuis la 7.8.0.

---

## Les types d'usage

L'étape **Utilisation** d'un dépôt, dans son assistant et dans l'onglet **Utilisation** de sa page, dit ce que l'application en tire.

Les types sont regroupés sous six rubriques, chacune avec le nombre de types qu'elle contient, par exemple **Designer (6)**. Chaque type a
sa propre case à cocher et une courte ligne qui dit ce que le dépôt contient pour lui ; la case d'une rubrique coche ou décoche chaque type
de cette rubrique qui peut être coché.

| Rubrique | Types d'usage (drapeau) |
|---|---|
| **Designer** | **Catégories** (`use_for_categories`), **Constantes** (`use_for_constants`), **Formulaires** (`use_for_forms`), **Inventaires** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Jobs** | **Planifications** (`use_for_schedules`) |
| **Système** | **Général** (`use_for_general`) |
| **Apparence** | **Valeurs par défaut** (`use_for_defaults`), **Logo** (`use_for_logo`), **Icône** (`use_for_icon`), **Nom** (`use_for_name`), **Liens** (`use_for_links`), **Étiquettes** (`use_for_labels`), **Annonces** (`use_for_announcements`) |
| **Accès** | **Avertissement** (`use_for_disclaimer`), **Utilisateurs** (`use_for_users`), **Groupes** (`use_for_groups`), **Rôles** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Connexions** | **Dépôts** (`use_for_repositories`), **Identifiants** (`use_for_credentials`), **Coffres de secrets** (`use_for_secret_stores`), **Bases de données** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Notifications** (`use_for_notifications`), **Assistant de chat** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formulaires**, **Inventaires** et **Workflows** peuvent être cochés sur plusieurs dépôts. Les **Playbooks** viennent d'un seul : l'étape
Utilisation les grise sur les autres, et le serveur prend le premier avec un avertissement. Chaque autre type appartient à un dépôt au plus,
et un deuxième est refusé par l'API et par le config seed. Un type qu'un autre dépôt détient apparaît coché en gris et désactivé, son
infobulle nommant ce dépôt : `Déjà géré par le dépôt « platform »`.

Activer ou désactiver un type d'usage est une modification réservée à un admin, comme l'**URI** et la **Branche** (voir
[Qui peut modifier un dépôt](adding.html#who-may-change-a-repository)).

---

## Où un dépôt les conserve

Un dépôt contient un type dans n'importe quel fichier YAML, de n'importe quel nom, dans n'importe quel dossier : la clé de premier niveau du
fichier dit quel type il contient.

Cette clé est toujours `controller_` suivi de la clé du type : `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Chaque fichier `.yaml` ou `.yml` du dépôt est examiné, à n'importe quelle profondeur, fichiers et dossiers cachés exclus. Un fichier peut
contenir plusieurs types, et un type peut être réparti sur plusieurs fichiers.

| Clé | Contient |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | une map, pour ce dont l'application n'a qu'un exemplaire ; un seul fichier au plus la donne |
| `controller_users:` | une liste d'utilisateurs, chacun retrouvé par son `type` (local quand il est omis) et son `username` |
| `controller_disclaimer:` | une liste de versions, chacune retrouvée par sa `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | les rôles, les catégories et les constantes, dans leur format habituel |
| toute autre clé `controller_` | une liste d'entrées, chacune retrouvée par son `name` |

Un objet est retrouvé par son nom au sein de son type, jamais par son fichier : une entrée déplacée vers un autre fichier garde son objet.
Une clé simple (`credentials:`, le `roles:` d'un fichier de requirements Galaxy, le `labels:` d'un fichier de variables) n'appartient à aucun
type, et l'application ne la lit ni ne l'écrit jamais. Un formulaire n'est jamais le fichier d'un type, et une clé d'un type pour lequel le
dépôt n'est pas utilisé est laissée telle quelle, avec une indication dans la sortie du pull.

### Rôles, catégories et constantes

Ces trois-là gardent le format de `config.yaml`, désormais chacun sous sa propre clé, dans un type d'usage à part (un dépôt chacun).

Chacun est lu depuis le fichier de son dépôt qui donne sa clé au premier niveau, de n'importe quel nom et dans n'importe quel dossier ; un
seul fichier peut donner les trois. Quand aucun fichier ne la donne, le `config.yaml` du dépôt est encore lu, avec ses clés simples `roles:`,
`categories:` et `constants:` : c'est déprécié depuis la 7.8.0 et plus lu dans la 8.0, et le journal du serveur, la sortie du pull et la
page du dépôt le signalent. Déplacez chaque clé dans un fichier à part, par exemple `roles.yaml` contenant `controller_roles:`.

Une clé qu'aucun dépôt ne contient vient de la configuration de base, comme avant : sa copie dans la base de données, ou le fichier de
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). L'interrupteur **Utiliser pour la configuration** d'avant n'existe plus : une
instance mise à jour donne **Rôles**, **Catégories** et **Constantes** au dépôt qui l'avait. Le config seed, les entrées
`controller_repositories:` d'un dépôt et l'API acceptent encore `use_for_config` comme alias déprécié des trois, avec un avertissement.

---

## Dans les deux sens : git et l'application

Un dépôt utilisé pour un type reste synchronisé avec l'application dans les deux sens, la base de données de l'application restant ce qui s'exécute.

| Sens | Ce qui se passe |
|---|---|
| De git vers l'application | Après chaque pull, clonage ou réinitialisation du dépôt, et au démarrage du serveur, ses fichiers sont lus : un nouveau nom crée un objet, une entrée modifiée le modifie, une entrée retirée le supprime |
| De l'application vers git | Un enregistrement dans l'application écrit dans le fichier de l'entrée : seulement les champs modifiés, les commentaires, les autres clés et les autres entrées du fichier étant conservés. Un nouvel objet va à la fin du premier fichier qui donne la clé du type, sinon dans `<key>.yaml` à la racine (`credentials.yaml`), créé pour l'occasion ; une suppression retire son entrée. Il attend le **Push** du dépôt |

Une entrée non valide est refusée seule, avec son emplacement et la raison, et l'objet de ce nom reste tel quel. Une entrée qui nomme un
objet pas encore présent (un runner et son identifiant) attend, et est relue au prochain pull de ce type. Un renommage dans git est suivi
quand un nom quitte un fichier et qu'un nouveau nom y apparaît, le reste étant inchangé.

### Activer ou désactiver un usage

Enregistrer un dépôt avec un type activé ou désactivé demande d'abord quoi faire, et montre ce que fera la modification.

| Modification | Question | Ce qu'elle fait |
|---|---|---|
| Activation | **Activer Identifiants** : `Utiliser platform pour Identifiants ?` | Le dépôt est pullé et ses entrées lues ; git l'emporte sur un nom que les deux ont ; les autres objets de l'application sont écrits dans le dépôt, en attente du **Push**, sans leurs secrets |
| Désactivation | **Désactiver Identifiants** : `Ne plus utiliser platform pour Identifiants ?` | Le dépôt est pullé une dernière fois, puis ses objets sont détachés : ils restent dans l'application tels quels, et les fichiers dans git ne sont pas touchés |
| Plusieurs | **Modifier l'usage** : `Modifier ce à quoi sert platform ?` | Une seule question, une section par type, confirmée par **Enregistrer l'usage** |

La question liste aussi ce qui reste dans l'application : les objets du config seed, les runners qu'un RTE a enregistrés lui-même, et ceux
en attente d'approbation. Un message dit ensuite ce que chaque type a pris, par exemple
`Identifiants : 2 lus depuis ses fichiers, 3 écrits dans le dépôt (en attente du Push), 1 remplacés par git, 0 gardés dans cette application.`

### Ce que dit la sortie du pull

**Afficher la sortie du dernier pull** du dépôt contient une ligne par type après la sortie propre de git.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Un objet conservé dans un dépôt affiche **Dépôt : platform** sur sa page (le nom de son dépôt), le fichier de son entrée dans son infobulle.
L'enregistrer écrit ce fichier, et le **Push** du dépôt l'envoie à git.

---

## Secrets

Git ne contient jamais un secret en clair : un champ secret d'une entrée n'est qu'une référence `${ENV}`, résolue depuis l'environnement.

Les mots de passe, jetons, secrets client et clés s'écrivent `${SEED_RTE_TOKEN}`, comme dans le [config seed](../seed/). Une entrée avec un
secret en clair, ou qui nomme une variable non définie, est refusée et nommée dans la sortie du pull ; de même pour une variable du serveur
lui-même (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` …). Un secret omis dans une entrée garde celui de la base de données de
l'application, et l'application écrit ses propres objets dans git sans leurs secrets.

Un secret saisi dans l'application pour un objet dont l'entrée le donne comme référence `${ENV}` est refusé : changez la variable, ou
l'entrée dans git.

---

## Le concepteur et ces fichiers

Le concepteur ne touche pas aux fichiers que détiennent les types d'usage, si bien que la modification d'un formulaire ne change jamais un paramètre.

Il ne liste, ne lit, n'écrit ni ne supprime jamais un fichier qui donne la clé d'un type que son dépôt détient, ni les images qu'un tel
fichier nomme. Il refuse aussi d'écrire un fichier dont le contenu donnerait la clé d'un type, et le chargement des formulaires ne lit
jamais un tel fichier comme un formulaire.

---

## Chaque type, avec un exemple

Les entrées de chaque type sont au format du config seed, si bien qu'un élément du seed et une entrée de dépôt sont interchangeables.

Les noms de fichiers ci-dessous sont des exemples : n'importe quel nom et n'importe quel dossier conviendraient.

### Catégories, constantes et rôles

Les catégories et les rôles sont des listes, les constantes une map, chacun sous sa propre clé.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Chaque rôle est vérifié séparément : un rôle non valide est refusé seul, et les autres sont servis. Les rôles peuvent être répartis sur
plusieurs fichiers, servis dans l'ordre de leurs fichiers. Voir [Rôles](../config/roles.html).

### Planifications

Les planifications sont une liste `controller_schedules:`, chaque entrée nommant le formulaire qu'elle exécute et cadencée par exactement
un de `cron`, `rrule` ou `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

Les jobs « Exécuter plus tard » que planifient les utilisateurs restent dans l'application. Voir [Planifications](../jobs/schedules.html)
pour les cadencements et les invites.

### Général

Les paramètres **Général** sont une seule map, selon les noms de leurs variables d'environnement en minuscules.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Seules les variables que modifie la page Général sont prises ; une clé en majuscules, ou une variable définie dans l'environnement réel,
est refusée. Une variable dont le nom se termine par `_PASSWORD`, `_SECRET` ou `_TOKEN` n'est qu'une référence `${ENV}`.

### Valeurs par défaut, logo, icône, nom et liens

Les pages Apparence sont une map chacune, contenant ce que la page enregistre.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

Le logo et l'icône sont des images du dépôt, nommées relativement au fichier qui les nomme. Un champ que déclare le config seed reste
celui du seed.

### Étiquettes et annonces

Les étiquettes et les annonces sont des listes d'entrées, chacune retrouvée par son nom.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Une annonce dont la fin est déjà passée n'est pas importée, ce que signale une ligne `Not imported` de la sortie du pull.

### Avertissement

L'avertissement est une liste de versions, chacune retrouvée par sa `version`, une seule au plus étant activée.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Un texte modifié depuis git corrige cette version ; `ask_again: true` redemande à tous ceux qui l'ont acceptée. Qui a accepté quoi n'est jamais dans git.

### Utilisateurs et groupes

L'entrée d'un groupe liste ses membres locaux ; l'entrée d'un utilisateur ne dit rien de ses groupes.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

Le `password` d'un utilisateur local n'est qu'une référence `${ENV}`, hachée à la lecture. Un utilisateur d'un annuaire (`ldap`, `entraid`,
`oidc`) ne donne que sa `description` et `blocked`. L'admin intégré n'est jamais lu depuis git ni écrit dans git.

### LDAP et SSO

Les annuaires LDAP et les fournisseurs SSO sont des listes, chacun nommant l'identifiant avec lequel il se connecte.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

L'entrée nommée `main` est l'annuaire principal, qui n'est jamais renommé ni supprimé. `position` conserve l'ordre de recherche.

### Dépôts

Un dépôt peut contenir les autres dépôts, au format des éléments `repositories:` du config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

Le dépôt qui les contient n'est jamais dans ses propres fichiers, une entrée ne définit jamais `use_for_repositories`, et un utilisateur ou
un jeton dans l'`uri` est refusé : nommez plutôt un identifiant. Une entrée retirée supprime son dépôt, sauf s'il a des modifications non
encore poussées.

### Identifiants, coffres de secrets et bases de données

Les identifiants sont lus en premier, puis tout ce qui en nomme un.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Retirer l'entrée d'un identifiant tant que quelque chose l'utilise encore est refusé, ce que signale la sortie du pull.

### Runners

Un runner nomme son identifiant, du type du runner, et attend tant que celui-ci manque.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Un runner qu'un RTE a enregistré lui-même, ou un runner en attente d'approbation, reste dans l'application.

### SSH

La clé SSH de l'application et les hôtes auxquels elle fait confiance forment une seule map, lue juste après les dépôts, avant leur clonage.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` n'est qu'une référence `${ENV}`, jamais écrite dans git : omise, l'application garde la sienne. `known_hosts` contient une
ligne known_hosts par serveur, et une liste vide les efface.

### Notifications et syslog

Les canaux de notification et les serveurs syslog sont des listes d'entrées.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Assistant de chat et MCP

L'assistant de chat et les paramètres MCP sont une map chacun.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` et les clés MCP sont des noms de variables d'environnement en minuscules. Une variable définie dans l'environnement réel
n'est jamais écrite, et une map qui la donne est refusée. `api_key` n'est qu'une référence `${ENV}`, ou est omise.

---
layout: default
title: Exemple
parent: Seed de configuration
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Exemple
{: .no_toc }

Un fichier seed complet, section par section
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le fichier

Le fichier seed suivant déclare toutes les sections sauf l'`awx` déprécié. Les secrets viennent de variables d'environnement comme
`${SEED_AWX_TOKEN}`, et les sections portent leurs noms de la 7.8.0 (voir [Sections renommées](./#renamed-sections)) :

```yaml
version: 1

runners:
  items:
    - name: rte01
      type: rte                  # rte, awx, semaphore, rundeck or jenkins
      rte_mode: inbound          # an RTE's RTE_MODE: outbound, inbound or database (deprecated, the default)
      credential: rte01          # a credential of the credentials section, of the runner's type
      is_default: true           # playbook forms that name no runner run here
    - name: tower
      type: awx
      credential: tower
      is_default: true           # one default per type
      enabled: true              # false: no job goes to it; left as it is when not declared

secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login    # a vault credential of the credentials section: the store's address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault     # how the secret store vault logs in, and where
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}   # the Vault token
    - name: rte01
      credential_type: rte       # an RTE's token, and its address unless it is outbound
      url: http://rte01.example.com:8000
      password: ${SEED_RTE_TOKEN}   # the RTE_TOKEN of that RTE
    - name: tower
      credential_type: awx       # also aap, ascender, semaphore, rundeck, jenkins
      url: https://tower.example.com
      password: ${SEED_AWX_TOKEN}
    - name: production-db
      user: svc_forms
      password: ${SEED_DB_PW}
      host: db.example.com
      port: 3306
      db_type: mysql
      credential_type: database
    - name: ontap-rest
      credential_type: userpass   # a user and password for a REST API, the default
      user: svc_forms
      password: ${SEED_ONTAP_PW}
    - name: smtp-login
      credential_type: smtp      # a mail server and its login: host is required
      host: smtp.example.com
      port: 587
      secure: false              # true: Use TLS to the mail server
      user: svc_forms            # leave user and password out for a relay
      password: ${SEED_SMTP_PW}
    - name: m365-mail
      credential_type: entraid   # an app registration, to send through Microsoft 365 (from 7.6.0)
      tenant_id: ${SEED_M365_TENANT}
      user: ${SEED_M365_CLIENT_ID}    # the client ID
      password: ${SEED_M365_SECRET}   # the client secret ; or client_cert and client_key

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

sso:                             # oauth2 before 7.8.0
  items:
    - name: corp
      provider: entraid          # entraid (Microsoft Entra ID, azuread before 7.8.0) or oidc
      tenant_id: ${SEED_ENTRA_TENANT}
      client_id: ${SEED_ENTRA_CLIENT_ID}
      client_secret: ${SEED_ENTRA_SECRET}   # or credential: an entraid credential
      enable: true

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_roles: true        # since 7.8.0, with use_for_categories and use_for_constants
      use_for_categories: true   # instead of use_for_config
      use_for_constants: true
      rebase_on_start: true

syslog:                          # syslog_servers before 7.8.0
  items:
    - name: siem
      host: siem.example.com
      port: 6514
      protocol: tls4             # udp4 (default), udp6, tcp4, tcp6, tls4, tls6, unix, unix-connect
      type: "5424"               # BSD (default) or 5424
      receives: audit            # log, audit or both (default)
      enabled: true
    - name: syslog
      host: syslog.example.com
      level: notice              # the lowest level of the server log it gets (info by default)
      receives: log

notifications:                   # notification_channels before 7.8.0
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: relay
      type: mail                 # no credential (from 7.6.0): its own server, sent without a login
      server: relay.example.com
      port: 25
      secure: false
      from_address: ansibleforms@example.com
    - name: m365
      type: mail
      credential: m365-mail      # an entraid credential: mail through Microsoft 365
      send_through: graph        # graph (the default) or smtp
      from_address: noreply@example.com
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap is a single-row section, so EVERY field must be declared : see "Single-row
# sections are all or nothing" on Managed objects. Empty is a perfectly good value.
ldap:
  server: ldap.example.com
  port: 389
  ignore_certs: false
  enable_tls: false
  cert: ""
  ca_bundle: ""
  bind_user_dn: cn=bind,dc=example,dc=com
  bind_user_pw: ${SEED_LDAP_PW}
  search_base: dc=example,dc=com
  username_attribute: uid
  groups_attribute: memberOf
  enable: true
  groups_search_base: ""
  group_class: ""
  group_member_attribute: ""
  group_member_user_attribute: ""
  mail_attribute: mail
  groupfilter: ""            # optional

settings:
  url: https://forms.example.com   # the only key it needs from 7.6.0

chat_assistant:              # the chat assistant's model provider ; chat before 7.8.0
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}   # or "" with credential: an api credential (since 7.8.0)
  base_url: ""               # empty for the provider default ; azure and custom need one
  model: claude-opus-5-5
  max_turns: 20
  max_tool_rounds: 6
  timeout_seconds: 60
  allow_job_status: true
  # optional - for a proxy or a vendor with its own ways
  auth_type: ""              # "" (provider default) | bearer | api-key | x-api-key | none
  api_version: ""            # e.g. 2024-10-21 for Azure OpenAI
  request_user: ""           # sent as user, e.g. for a proxy that requires one
  ignore_certs: false        # true skips the certificate check (a self-signed proxy) - insecure
  extra_headers:             # a mapping of extra request headers
    X-Org: ops

# since 7.8.0 : made or changed at each apply, never deleted
groups:
  items:
    - name: operators
      description: Run the day-to-day forms
      users:                 # its members : usernames of local users
        - alice

users:
  items:
    - username: alice        # a local user (type: local, the default)
      email: alice@example.com
      password: ${SEED_ALICE_PW}
    - username: jdoe
      type: ldap             # ldap, entraid or oidc : only description and blocked
      blocked: true
      description: Left on 2026-10-31

# since 7.8.0 : each declared field read only on its Settings page
defaults:
  default_theme: dark        # system, light or dark
  default_language: fr
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_forms_view: tiles

logo:
  logo: images/logo.png      # relative to the seed file ; "" restores the bundled one

icon:
  icon: images/icon.svg

name:
  app_name: ACME Automation

links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true

mcp:                         # environment variable names in lower case
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false

# since 7.8.0 : made or changed at each apply, never read only
announcements:
  items:
    - name: Maintenance
      message: The app is down on Sunday from 8 to 10.
      level: warning           # info, warning or danger
      start_at: 2030-01-06T08:00:00Z
      end_at: 2030-01-06T10:00:00Z

disclaimer:
  items:
    - version: 2
      title: Terms of use
      text: Use this tool for your own team's systems only.
      checkbox_label: I agree
      enabled: true          # the version in force, one at most
      ask_again: true        # a changed text asks everyone who accepted it again

ssh:
  private_key: ${SEED_SSH_PRIVATE_KEY}
  known_hosts:               # one known_hosts line each ; [] clears them
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

Les sections ci-dessous expliquent les parties qui demandent plus qu'un commentaire.

---

## Runners

Depuis la 7.3.0, un runner se connecte avec un identifiant de son type, qui contient l'adresse de son serveur dans `url`. Un runner avec son propre `token`,
ou `username` et `password`, fonctionne toujours : le seed journalise un avertissement et les transforme en un tel identifiant, nommé d'après le runner. Un
runner qui nomme un identifiant `api` ou `userpass` fonctionne aussi, avec un avertissement : donnez plutôt à cet identifiant le type du runner.
Les deux sont dépréciés depuis la 7.3.0 et seront supprimés dans la 8.0.0. Un runner RTE sans `rte_mode` est en mode base de données, déprécié (voir
[Modes](../rte/modes.html)). Un runner avec `enabled: false` ne reçoit aucun job, y compris comme runner par défaut de son type (voir
[Par défaut et Activé](../runners/list.html#default-and-enabled)) ; sans `enabled`, le seed le laisse tel quel.

Un élément de runner accepte ces clés en plus de `name`, `type`, `description`, `credential`, `is_default` et `enabled` :

| Clé | Ce qu'elle définit |
|---|---|
| `rte_mode` | Le mode d'un RTE : `outbound`, `inbound` ou `database` (obsolète, par défaut) |
| `rte_max_jobs` | Les **Jobs simultanés max.** d'un RTE en mode socket, de `0` à `10000` (`0` : aucune limite) |
| `rte_cache_mb` | Son **Cache des fichiers** en Mo, de `0` à `1048576` (`0` n'en garde aucun) |
| `rte_files` | Ses **Fichiers de job** : `transfer` ou `local` |
| `rte_drain_seconds` | Son **Délai d'arrêt** en secondes, de `0` à `86400` |
| `flavour` | Un runner `awx` qui est un AAP ou un Ascender : `aap` ou `ascender` ; rien pour AWX |
| `project` | L'id de projet d'un runner Semaphore, le nom de projet d'un runner Rundeck, le dossier d'un runner Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | L'adresse et le TLS propres au runner, d'avant la 7.3.0 : utilisés uniquement tant que son identifiant ne contient pas de `url` |

Les quatre paramètres `rte_*` sont ceux de l'onglet RTE de la page du runner (voir [Les paramètres d'un RTE](../runners/runner-page.html#an-rtes-settings)) :
ils l'emportent sur les mêmes variables définies sur le RTE, et un RTE en mode base de données les ignore. Une valeur hors de sa plage fait échouer la
validation du seed.

Un RTE en mode base de données peut s'enregistrer lui-même avant que le seed soit appliqué. Un runner RTE du seed dont le `uri` est l'adresse à laquelle un tel RTE
s'est enregistré **adopte** cette ligne : il prend le nom et les champs déclarés, et le worker ne le supprime plus quand le RTE cesse de
répondre, au lieu d'avoir un second runner pour le même RTE.

Depuis la 7.5.0, la section `databases` déclare les [bases de données](../databases.html) que les formulaires interrogent. Un élément a un `name`, un
`credential` de type base de données et une `description` facultative ; le seed l'applique après les identifiants, et refuse un identifiant d'un autre type.

---

## SSO

La section `sso` (`oauth2` avant la 7.8.0) déclare les [fournisseurs SSO](../authentication/), chacun avec son client : un `client_id` et
un `client_secret`, ou un `credential` de la section credentials.

Depuis la 7.8.0, Microsoft Entra ID s'écrit `provider: entraid`, comme l'écrivent les dépôts. `provider: azuread`, son nom d'avant, est
toujours lu de la même façon, déprécié depuis la 7.8.0 et supprimé dans la 8, avec un avertissement dans le journal du serveur. L'autre
fournisseur est `oidc`, et un seul fournisseur de chaque type peut avoir `enable: true`.

---

## Dépôts

Un élément de dépôt a un `name`, un `uri`, une `branch` facultative (celle par défaut du distant quand elle est omise), un `credential`,
`rebase_on_start`, la planification de pull `cron`, et un indicateur `use_for_*` par type d'usage : ce que l'application y lit.

Depuis la 7.8.0, chaque type d'usage a son indicateur. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` et `use_for_inventories`
existaient déjà ; les autres sont nouveaux :

| Catégorie | Indicateurs |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Jobs | `use_for_schedules` |
| Système | `use_for_general` |
| Apparence | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Accès | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Connexions | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Plusieurs dépôts peuvent contenir des formulaires, des workflows et des inventaires. Chaque autre type est contenu par un dépôt au plus :
un seed qui pose le même de ces indicateurs sur deux dépôts est refusé. Ce que chaque type garde dans git est décrit dans
[Dépôts Git](../repositories/).

`use_for_config` est déprécié depuis la 7.8.0 et supprimé dans la 8. Il est encore lu, comme `use_for_roles`, `use_for_categories` et
`use_for_constants`, avec un avertissement dans le journal du serveur. Quand plusieurs dépôts le déclarent, celui qui détient déjà ces
trois indicateurs les garde (sinon le premier du fichier), et les autres n'en reçoivent aucun. Déclarez plutôt les trois indicateurs.

---

## Mail

Le mail passe par les canaux mail de `notifications:` (voir [Mail](../notification-channels/mail.html)). Les clés
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` et `mail_from` sous `settings:` sont dépréciées
depuis la 7.6.0 et seront supprimées dans la 8.0.0. Elles fonctionnent toujours et journalisent un avertissement une fois : le seed en fait un canal
mail nommé `default`, avec un identifiant smtp `mail-login` quand il y a un `mail_username`, ou son propre serveur pour un relais. Déclarez
plutôt vous-même le canal mail et son identifiant, comme `mail` et `smtp-login` dans le fichier ci-dessus.

---

## Assistant de chat

La section `chat_assistant` (`chat` avant la 7.8.0) définit le fournisseur de modèle de l'assistant de chat. `provider` vaut l'une de ces valeurs :

* `anthropic`
* `openai`
* `azure`
* `gemini`
* `grok`
* `mistral`
* `deepseek`
* `groq`
* `openrouter`
* `ollama`
* `custom` : tout autre endpoint compatible OpenAI

Comme `ldap`, la section `chat_assistant` est une seule ligne, si bien que chaque champ est obligatoire sauf les champs
facultatifs ; un champ facultatif omis est laissé inchangé.

Depuis la 7.8.0, elle accepte aussi `credential`, un identifiant api de la section credentials dont le mot de passe est la clé, à la place
de `api_key` (déclarez alors `api_key: ""`). L'assistant de chat nécessite aussi `ENABLE_CHAT=1`, que le seed ne définit pas ; voir la
page [Assistant de chat](../chat/).

---

## Utilisateurs et groupes

Depuis la 7.8.0, les sections `groups` et `users` déclarent des groupes et des utilisateurs locaux. Ils sont créés ou modifiés à chaque
application, jamais supprimés, et restent modifiables dans l'application (voir [Utilisateurs et groupes](../users-and-groups.html)).

Un élément de groupe a un `name`, une `description` facultative et ses membres dans `users` : les noms d'utilisateurs locaux. L'élément
d'un utilisateur ne dit rien de ses groupes, si bien qu'un groupe liste ses membres en un seul endroit. Le seed applique les groupes avant les utilisateurs.

Un élément d'utilisateur a un `username` et un `type` :

| Type | Ce que donne son élément |
|---|---|
| `local` (par défaut) | `email`, `description`, `blocked`, et `password` comme référence `${ENV}`, comme chaque secret du seed |
| `ldap`, `entraid`, `oidc` | Seulement `description` et `blocked` : le reste vient de son annuaire à chaque connexion |

Un nouvel utilisateur local prend les groupes du seed qui le listent, donnez-lui donc au moins un groupe. Sans `password`, il ne peut pas
se connecter tant qu'un admin n'en a pas défini un dans l'application. Un utilisateur d'annuaire est créé avant même sa première connexion,
si bien qu'une personne partie est bloquée avant d'essayer. L'admin intégré n'est jamais déclaré : il reste le moyen de revenir.

---

## Apparence, MCP et SSH

Depuis la 7.8.0, le seed déclare aussi des paramètres dont l'application n'a qu'un exemplaire, chaque section au format de la même page dans un dépôt git.

| Section | Page | Clés |
|---|---|---|
| `defaults` | **Paramètres > Apparence > Valeurs par défaut** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** et **Icône** | `logo` ou `icon` : le chemin d'un fichier image, relatif au fichier seed ; `""` rétablit celui fourni |
| `name` | **Nom** | `app_name` |
| `links` | **Liens** | `header_links` (chacun `id`, `label`, `url`, `icon`, `newTab`, `parent`) et `show_designer` |
| `mcp` | **Paramètres > Connexions > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Paramètres > Connexions > SSH** | `private_key` et `known_hosts` |
| `announcements` | **Paramètres > Apparence > Annonces** | Des éléments avec `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Paramètres > Accès > Avertissement** | Des éléments avec `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Chaque clé est facultative : ce qu'une section omet reste tel que l'application l'a. Le logo et l'icône sont vérifiés comme un
téléversement (une image, au plus 900 Ko pour le logo et 256 Ko pour l'icône).

Les clés de `mcp` sont les variables d'environnement du [serveur MCP](../mcp/) en minuscules. Une variable que l'environnement réel définit
garde la valeur de l'environnement : le journal du serveur le signale, et le démarrage continue.

`ssh` contient la clé privée de l'application, comme référence `${ENV}` (sa clé publique en est dérivée), et les serveurs auxquels
l'application fait confiance, une ligne known_hosts chacun (les hôtes, le type de clé et la clé). Elle est appliquée à chaque démarrage.

Une annonce dont le `end_at` est passé est laissée de côté. Une `version` de l'avertissement est un nombre, une au plus est `enabled`, et
un texte modifié corrige cette version ; avec `ask_again: true`, tous ceux qui l'ont acceptée doivent l'accepter à nouveau.

Jusqu'où le seed possède chacune de ces sections est décrit dans [Objets gérés](managed-objects.html#settings-the-seed-declares).

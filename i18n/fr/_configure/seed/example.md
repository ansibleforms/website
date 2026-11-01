---
layout: default
title: Exemple
parent: Seed de configuration
nav_order: 1
translated_from: cf1f2b0122ca5cd2dfcc411e4ed20fb683b079bf
---

# Exemple
{: .no_toc }

Un fichier seed complet, section par section
{: .fs-6 .fw-300 }

---

Le fichier seed suivant déclare toutes les sections sauf `oauth2` et l'`awx` déprécié ; les secrets viennent de variables
d'environnement comme `${SEED_AWX_TOKEN}` :

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

databases:                       # from 7.5.0
  items:
    - name: production-db        # the name a field's dbConfig gives
      description: The CMDB
      credential: production-db  # a credential of the credentials section, of type database

repositories:
  prune: true
  items:
    - name: forms
      uri: https://git.example.com/forms.git
      branch: main
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true

syslog_servers:
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

notification_channels:
  items:
    - name: mail
      type: mail                 # mail, slack, teams, telegram or webhook
      credential: smtp-login     # an smtp credential: the server, port, TLS and login it sends with
      from_address: ansibleforms@example.com
      is_active: true            # the mail channel the application sends its mail with
    - name: ops-slack
      type: slack
      webhook_url: ${SEED_SLACK_WEBHOOK}

labels:
  items:
    - name: Production           # the text of a label beside the header's logo, 40 characters at most
      color: red                 # blue, green, amber, orange, red or grey
      enabled: true
      position: 1                # its place among the labels, lowest first

# ldap and settings are single-row sections, so EVERY field must be declared - see
# "Single-row sections are all or nothing" below. Empty is a perfectly good value.
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
  groupfilter: ""            # optional, see below

settings:
  mail_server: smtp.example.com
  mail_port: 587
  mail_secure: false
  mail_username: ""
  mail_password: ""
  mail_from: ansibleforms@example.com
  url: https://forms.example.com

chat:                        # the chat assistant's model provider (6.5)
  provider: anthropic        # see below, or "" (chat off)
  api_key: ${SEED_CHAT_API_KEY}
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
```

`provider` vaut l'une de ces valeurs :

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

Comme `ldap`, la section `chat` est une seule ligne, si bien que chaque champ est obligatoire sauf les champs
facultatifs ; un champ facultatif omis est laissé inchangé.

L'assistant de chat nécessite aussi `ENABLE_CHAT=1` ; voir la page [Assistant de chat](../chat).

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

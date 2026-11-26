---
layout: default
title: Exemple
parent: Llavor de configuració
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Exemple
{: .no_toc }

Un fitxer de llavor complet, secció per secció
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El fitxer

El fitxer de llavor següent declara totes les seccions excepte l'obsolet `awx`. Els secrets vénen de variables d'entorn com ara
`${SEED_AWX_TOKEN}`, i les seccions fan servir els seus noms de la 7.8.0 (vegeu [Seccions reanomenades](./#renamed-sections)):

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
Les seccions següents expliquen les parts que necessiten més que un comentari.

---

## Runners

Des de la 7.3.0 un runner inicia sessió amb una credencial del seu tipus, que conté l'adreça del seu servidor a `url`. Un runner amb el seu propi `token`,
o `username` i `password`, encara funciona: la llavor registra un avís i els converteix en una credencial d'aquest tipus, amb el nom del runner. Un
runner que nomena una credencial `api` o `userpass` també funciona encara, amb un avís: dona a aquesta credencial el tipus del runner.
Totes dues coses són obsoletes des de la 7.3.0 i s'eliminen a la 8.0.0. Un runner RTE sense `rte_mode` és en mode base de dades, obsolet (vegeu
[Modes](../rte/modes.html)). Un runner amb `enabled: false` no rep cap tasca, tampoc com a predeterminat del seu tipus (vegeu
[Predeterminat i Activat](../runners/list.html#default-and-enabled)); sense `enabled`, la llavor el deixa tal com està.

Un element de runner accepta aquestes claus a més de `name`, `type`, `description`, `credential`, `is_default` i `enabled`:

| Clau | Què defineix |
|---|---|
| `rte_mode` | El mode d'un RTE: `outbound`, `inbound` o `database` (obsolet, el predeterminat) |
| `rte_max_jobs` | El **Màxim de treballs simultanis** d'un RTE en mode de sòcol, de `0` a `10000` (`0`: sense límit) |
| `rte_cache_mb` | La seva **Memòria cau de fitxers** en MB, de `0` a `1048576` (`0` no en conserva cap) |
| `rte_files` | Els seus **Fitxers de treball**: `transfer` o `local` |
| `rte_drain_seconds` | El seu **Temps d'espera en aturar** en segons, de `0` a `86400` |
| `flavour` | Un runner `awx` que és un AAP o un Ascender: `aap` o `ascender`; cap per a AWX |
| `project` | L'id de projecte d'un runner Semaphore, el nom de projecte d'un runner Rundeck, la carpeta d'un runner Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | L'adreça i el TLS propis del runner, d'abans de la 7.3.0: només es fan servir mentre la seva credencial no conté cap `url` |

Els quatre ajustos `rte_*` són els de la pestanya RTE de la pàgina del runner (vegeu [La configuració d'un RTE](../runners/runner-page.html#an-rtes-settings)):
guanyen a les mateixes variables definides a l'RTE, i un RTE en mode base de dades els ignora. Un valor fora del seu rang fa fallar la
validació de la llavor.

Un RTE en mode base de dades es pot registrar ell mateix abans que s'apliqui la llavor. Un runner RTE de la llavor l'`uri` del qual és l'adreça on s'ha
registrat un RTE d'aquests **adopta** aquella fila: en pren el nom i els camps declarats, i el worker ja no l'elimina quan l'RTE deixa de
respondre, en lloc de crear un segon runner per al mateix RTE.

Des de la 7.5.0 la secció `databases` declara les [bases de dades](../databases.html) que consulten els formularis. Un element té un `name`, una
`credential` de tipus base de dades i una `description` opcional; la llavor l'aplica després de les credencials, i rebutja una credencial d'un altre tipus.

---

## SSO

La secció `sso` (`oauth2` abans de la 7.8.0) declara els [proveïdors SSO](../authentication/), cadascun amb el seu client: un `client_id` i un
`client_secret`, o una `credential` de la secció credentials.

Des de la 7.8.0 Microsoft Entra ID és `provider: entraid`, com l'escriuen els repositoris. `provider: azuread`, el seu nom d'abans, encara es
llegeix igual, obsolet des de la 7.8.0 i eliminat a la 8, amb un avís al registre del servidor. L'altre proveïdor és `oidc`, i només un
proveïdor de cada tipus pot tenir `enable: true`.

---

## Repositoris

Un element de repositori té un `name`, una `uri`, una `branch` opcional (la branca predeterminada del remot si s'omet), una `credential`,
`rebase_on_start`, la planificació de pull `cron`, i un indicador `use_for_*` per a cada tipus d'ús: què en llegeix l'aplicació.

Des de la 7.8.0 cada tipus d'ús té el seu indicador. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` i `use_for_inventories` ja
existien; els altres són nous:

| Categoria | Indicadors |
|---|---|
| Dissenyador | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Tasques | `use_for_schedules` |
| Sistema | `use_for_general` |
| Aparença | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Accés | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Connexions | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Diversos repositoris poden contenir formularis, workflows i inventaris. Cada altre tipus el conté com a màxim un repositori: una llavor que
posa un mateix d'aquests indicadors a dos repositoris es rebutja. El que cada tipus desa a git es descriu a
[Repositoris Git](../repositories/).

`use_for_config` és obsolet des de la 7.8.0 i s'elimina a la 8. Encara es llegeix, com a `use_for_roles`, `use_for_categories` i
`use_for_constants`, amb un avís al registre del servidor. Quan diversos repositoris el declaren, el que ja té aquests tres els conserva
(si no, el primer del fitxer), i els altres no en reben cap. Declara els tres indicadors en lloc seu.

---

## Correu

El correu passa pels canals de correu de `notifications:` (vegeu [Correu](../notification-channels/mail.html)). Les claus
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` i `mail_from` de `settings:` són obsoletes
des de la 7.6.0 i s'eliminen a la 8.0.0. Encara funcionen i registren un avís una sola vegada: la llavor les converteix en un canal de
correu anomenat `default`, amb una credencial smtp `mail-login` quan hi ha un `mail_username`, o amb el seu propi servidor per a un relay.
Declara tu mateix el canal de correu i la seva credencial, com `mail` i `smtp-login` al fitxer de dalt.

---

## Assistent de xat

La secció `chat_assistant` (`chat` abans de la 7.8.0) defineix el proveïdor de models de l'assistent de xat. `provider` és un de:

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
* `custom` : qualsevol altre endpoint compatible amb OpenAI

Com `ldap`, la secció `chat_assistant` és una sola fila, de manera que tots els camps són obligatoris excepte els
opcionals; un camp opcional que s'omet es deixa sense canvis.

Des de la 7.8.0 també accepta `credential`, una credencial api de la secció credentials la contrasenya de la qual és la clau, en lloc de
l'`api_key` (declara llavors `api_key: ""`). L'assistent de xat també necessita `ENABLE_CHAT=1`, que la llavor no defineix; vegeu la pàgina
[Assistent de xat](../chat/).

---

## Usuaris i grups

Des de la 7.8.0 les seccions `groups` i `users` declaren grups i usuaris locals. Es creen o es canvien a cada aplicació, mai no se suprimeixen,
i continuen sent editables a l'aplicació (vegeu [Usuaris i grups](../users-and-groups.html)).

Un element de grup té un `name`, una `description` opcional i els seus membres a `users`: els noms d'usuari d'usuaris locals. L'element d'un
usuari no diu res dels seus grups, de manera que un grup enumera els seus membres en un sol lloc. La llavor aplica els grups abans que els usuaris.

Un element d'usuari té un `username` i un `type`:

| Tipus | Què dona el seu element |
|---|---|
| `local` (el predeterminat) | `email`, `description`, `blocked`, i `password` com a referència `${ENV}`, com tots els secrets de la llavor |
| `ldap`, `entraid`, `oidc` | Només `description` i `blocked`: la resta ve del seu directori a cada inici de sessió |

Un usuari local nou rep els grups de la llavor que l'enumeren, així que dona-li'n almenys un. Sense `password` no pot iniciar sessió fins que
un admin n'hi defineixi una a l'aplicació. Un usuari d'un directori es crea abans que iniciï mai sessió, de manera que algú que se'n va queda
bloquejat abans d'intentar-ho. L'admin integrat no es declara mai: continua sent el camí de tornada.

---

## Aparença, MCP i SSH

Des de la 7.8.0 la llavor també declara ajustos dels quals l'aplicació en té un, cada secció en el format de la mateixa pàgina en un repositori git.

| Secció | Pàgina | Claus |
|---|---|---|
| `defaults` | **Configuració > Aparença > Valors predeterminats** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logotip** i **Icona** | `logo` o `icon`: el camí d'un fitxer d'imatge, relatiu al fitxer de la llavor; `""` restaura el que porta l'aplicació |
| `name` | **Nom** | `app_name` |
| `links` | **Enllaços** | `header_links` (cadascun `id`, `label`, `url`, `icon`, `newTab`, `parent`) i `show_designer` |
| `mcp` | **Configuració > Connexions > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Configuració > Connexions > SSH** | `private_key` i `known_hosts` |
| `announcements` | **Configuració > Aparença > Anuncis** | Elements amb `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Configuració > Accés > Avís legal** | Elements amb `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Totes les claus són opcionals: el que una secció omet es queda tal com ho té l'aplicació. El logotip i la icona es comproven com una pujada
(una imatge, com a màxim 900 KB per al logotip i 256 KB per a la icona).

Les claus de `mcp` són les variables d'entorn del [servidor MCP](../mcp/) en minúscules. Una variable que defineix l'entorn real
conserva el valor de l'entorn: el registre del servidor ho diu, i l'arrencada continua.

`ssh` conté la clau privada de l'aplicació, com a referència `${ENV}` (se'n fa la clau pública), i els servidors en què confia l'aplicació,
una línia de known_hosts cadascun (els amfitrions, el tipus de clau i la clau). S'aplica a cada arrencada.

Un anunci el `end_at` del qual ja ha passat es deixa fora. Una `version` de l'avís legal és un número, com a màxim una és `enabled`, i un text
canviat corregeix aquella versió; amb `ask_again: true` es torna a preguntar a tothom que l'havia acceptada.

Fins on és propietària la llavor de cadascun d'aquests ajustos es troba a [Objectes gestionats](managed-objects.html#settings-the-seed-declares).

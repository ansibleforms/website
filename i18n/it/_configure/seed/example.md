---
layout: default
title: Esempio
parent: Config seed
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Esempio
{: .no_toc }

Un file di seed completo, sezione per sezione
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Il file

Il seguente file di seed dichiara ogni sezione tranne la deprecata `awx`. I segreti arrivano da variabili d'ambiente come
`${SEED_AWX_TOKEN}`, e le sezioni usano i loro nomi della 7.8.0 (vedi [Sezioni rinominate](./#renamed-sections)):

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

Le sezioni qui sotto spiegano le parti che richiedono più di un commento.

---

## Runner

Dalla 7.3.0 un runner accede con una credenziale del suo tipo, che contiene l'indirizzo del suo server in `url`. Un runner con un proprio `token`,
o `username` e `password`, funziona ancora: il seed registra un avviso e li trasforma in una credenziale del genere, che prende il nome del runner. Un
runner che indica una credenziale `api` o `userpass` funziona ancora anch'esso, con un avviso: dai invece a quella credenziale il tipo del runner.
Entrambi sono deprecati dalla 7.3.0 e verranno rimossi nella 8.0.0. Un runner RTE senza `rte_mode` è in modalità database, deprecata (vedi
[Modalità](../rte/modes.html)). Un runner con `enabled: false` non riceve nessun job, nemmeno come predefinito del suo tipo (vedi
[Predefinito e Abilitato](../runners/list.html#default-and-enabled)); senza `enabled`, il seed lo lascia com'è.

Un elemento runner accetta queste chiavi oltre a `name`, `type`, `description`, `credential`, `is_default` ed `enabled`:

| Chiave | Cosa imposta |
|---|---|
| `rte_mode` | La modalità di un RTE: `outbound`, `inbound` o `database` (deprecata, la predefinita) |
| `rte_max_jobs` | I **Job simultanei max** di un RTE in modalità socket, da `0` a `10000` (`0`: nessun limite) |
| `rte_cache_mb` | La sua **Cache dei file** in MB, da `0` a `1048576` (`0` non ne conserva nessuno) |
| `rte_files` | I suoi **File dei job**: `transfer` o `local` |
| `rte_drain_seconds` | La sua **Attesa allo stop** in secondi, da `0` a `86400` |
| `flavour` | Un runner `awx` che è un AAP o un Ascender: `aap` o `ascender`; nessuno per AWX |
| `project` | L'id del progetto di un runner Semaphore, il nome del progetto di un runner Rundeck, la cartella di un runner Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | L'indirizzo e il TLS propri del runner, di prima della 7.3.0: usati solo finché la sua credenziale non contiene un `url` |

Le quattro impostazioni `rte_*` sono quelle della scheda RTE della pagina del runner (vedi [Le impostazioni di un RTE](../runners/runner-page.html#an-rtes-settings)):
vincono sulle stesse variabili impostate sull'RTE, e un RTE in modalità database le ignora. Un valore fuori dal suo intervallo fa fallire la
validazione del seed.

Un RTE in modalità database può registrarsi da solo prima che il seed venga applicato. Un runner RTE del seed il cui `uri` è l'indirizzo con cui un RTE del genere
si è registrato **adotta** quella riga: prende il nome e i campi dichiarati, e il worker non lo rimuove più quando l'RTE smette di
rispondere, invece di avere un secondo runner per lo stesso RTE.

Dalla 7.5.0 la sezione `databases` dichiara i [database](../databases.html) che i moduli interrogano. Un elemento ha un `name`, una `credential`
di tipo database e una `description` facoltativa; il seed lo applica dopo le credenziali, e rifiuta una credenziale di un altro tipo.

---

## SSO

La sezione `sso` (`oauth2` prima della 7.8.0) dichiara i [provider SSO](../authentication/), ognuno con il suo client: un `client_id` e un
`client_secret`, o una `credential` della sezione credentials.

Dalla 7.8.0 Microsoft Entra ID è `provider: entraid`, come lo scrivono i repository. `provider: azuread`, il suo nome di prima, viene
ancora letto allo stesso modo, deprecato dalla 7.8.0 e rimosso nella 8, con un avviso nel log del server. L'altro provider è `oidc`, e
solo un provider di ogni tipo può avere `enable: true`.

---

## Repository

Un elemento repository ha un `name`, un `uri`, un `branch` facoltativo (quello predefinito del remoto quando è omesso), una `credential`,
`rebase_on_start`, la pianificazione del pull `cron`, e un flag `use_for_*` per ogni tipo di utilizzo: cosa l'app legge da esso.

Dalla 7.8.0 ogni tipo di utilizzo ha il suo flag. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` e `use_for_inventories`
esistevano già; gli altri sono nuovi:

| Categoria | Flag |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Job | `use_for_schedules` |
| Sistema | `use_for_general` |
| Aspetto | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Accesso | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Connessioni | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Più repository possono contenere moduli, workflow e inventari. Ogni altro tipo è contenuto da un repository al massimo: un seed che
imposta lo stesso di questi flag su due repository viene rifiutato. Cosa ogni tipo tiene in git è descritto in
[Repository git](../repositories/).

`use_for_config` è deprecato dalla 7.8.0 e rimosso nella 8. Viene ancora letto, come `use_for_roles`, `use_for_categories` e
`use_for_constants`, con un avviso nel log del server. Quando più repository lo dichiarano, quello che ha già quei tre flag li mantiene
(altrimenti il primo nel file), e gli altri non ne ricevono nessuno. Dichiara invece i tre flag.

---

## Mail

La mail passa dai canali mail di `notifications:` (vedi [Mail](../notification-channels/mail.html)). Le chiavi
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` e `mail_from` sotto `settings:` sono deprecate
dalla 7.6.0 e verranno rimosse nella 8.0.0. Funzionano ancora e registrano un avviso una volta: il seed ne fa un canale mail chiamato
`default`, con una credenziale smtp `mail-login` quando c'è un `mail_username`, o con il proprio server per un relay. Dichiara invece tu
il canale mail e la sua credenziale, come `mail` e `smtp-login` nel file sopra.

---

## Assistente chat

La sezione `chat_assistant` (`chat` prima della 7.8.0) imposta il provider del modello dell'assistente chat. `provider` è uno tra:

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
* `custom` : qualsiasi altro endpoint compatibile con OpenAI

Come `ldap`, la sezione `chat_assistant` è una riga singola, quindi ogni campo è obbligatorio tranne quelli
facoltativi; un campo facoltativo omesso resta invariato.

Dalla 7.8.0 accetta anche `credential`, una credenziale api della sezione credentials la cui password è la chiave, al posto di
`api_key` (dichiara allora `api_key: ""`). L'assistente chat richiede anche `ENABLE_CHAT=1`, che il seed non imposta; vedi la pagina
[Assistente chat](../chat/).

---

## Utenti e gruppi

Dalla 7.8.0 le sezioni `groups` e `users` dichiarano gruppi e utenti locali. Vengono creati o modificati a ogni applicazione, mai
eliminati, e restano modificabili nell'app (vedi [Utenti e gruppi](../users-and-groups.html)).

Un elemento gruppo ha un `name`, una `description` facoltativa e i suoi membri in `users`: i nomi utente di utenti locali. L'elemento di un
utente non dice nulla dei suoi gruppi, così un gruppo elenca i propri membri in un unico posto. Il seed applica i gruppi prima degli utenti.

Un elemento utente ha uno `username` e un `type`:

| Tipo | Cosa dà il suo elemento |
|---|---|
| `local` (il predefinito) | `email`, `description`, `blocked`, e `password` come riferimento `${ENV}`, come ogni segreto del seed |
| `ldap`, `entraid`, `oidc` | Solo `description` e `blocked`: il resto arriva dalla sua directory a ogni accesso |

Un nuovo utente locale prende i gruppi del seed che lo elencano, quindi dagliene almeno uno. Senza `password` non può accedere finché un
admin non ne imposta una nell'app. Un utente di una directory viene creato prima ancora del suo primo accesso, così chi se n'è andato è
bloccato prima di provarci. L'admin integrato non viene mai dichiarato: resta la via per rientrare.

---

## Aspetto, MCP e SSH

Dalla 7.8.0 il seed dichiara anche impostazioni di cui l'app ha una sola copia, ogni sezione nel formato della stessa pagina in un repository git.

| Sezione | Pagina | Chiavi |
|---|---|---|
| `defaults` | **Impostazioni > Aspetto > Valori predefiniti** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** e **Icona** | `logo` o `icon`: il percorso di un file immagine, relativo al file di seed; `""` ripristina quello incluso |
| `name` | **Nome** | `app_name` |
| `links` | **Collegamenti** | `header_links` (ognuno `id`, `label`, `url`, `icon`, `newTab`, `parent`) e `show_designer` |
| `mcp` | **Impostazioni > Connessioni > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Impostazioni > Connessioni > SSH** | `private_key` e `known_hosts` |
| `announcements` | **Impostazioni > Aspetto > Annunci** | Elementi con `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Impostazioni > Accesso > Disclaimer** | Elementi con `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Ogni chiave è facoltativa: ciò che una sezione omette resta come l'app lo ha. Il logo e l'icona vengono controllati come un
caricamento (un'immagine, al massimo 900 KB per il logo e 256 KB per l'icona).

Le chiavi di `mcp` sono le variabili d'ambiente del [server MCP](../mcp/) in minuscolo. Una variabile che l'ambiente reale imposta mantiene
il valore dell'ambiente: il log del server lo dice, e l'avvio prosegue.

`ssh` contiene la chiave privata dell'app, come riferimento `${ENV}` (la sua chiave pubblica viene ricavata da essa), e i server di cui
l'app si fida, una riga known_hosts ciascuno (gli host, il tipo di chiave e la chiave). Viene applicata a ogni avvio.

Un annuncio il cui `end_at` è passato viene escluso. Una `version` del disclaimer è un numero, al massimo una è `enabled`, e un testo
modificato corregge quella versione; con `ask_again: true` a tutti quelli che l'hanno accettata viene chiesto di nuovo.

Fino a che punto il seed possiede ognuna di queste sezioni è descritto in [Oggetti gestiti](managed-objects.html#settings-the-seed-declares).

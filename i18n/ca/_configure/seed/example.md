---
layout: default
title: Exemple
parent: Llavor de configuració
nav_order: 1
translated_from: f085641a12234a5485ea59e73e76c29e7452d5e9
---

# Exemple
{: .no_toc }

Un fitxer de llavor complet, secció per secció
{: .fs-6 .fw-300 }

---

El fitxer de llavor següent declara totes les seccions excepte `oauth2` i l'obsolet `awx`; els secrets vénen de variables
d'entorn com ara `${SEED_AWX_TOKEN}`:

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

`provider` és un de:

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

Com `ldap`, la secció `chat` és una sola fila, de manera que tots els camps són obligatoris excepte els
opcionals; un camp opcional que s'omet es deixa sense canvis.

L'assistent de xat també necessita `ENABLE_CHAT=1`; vegeu la pàgina [Assistent de xat](../chat).

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

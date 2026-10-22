---
layout: default
title: Voorbeeld
parent: Configuratie-seed
nav_order: 1
translated_from: f085641a12234a5485ea59e73e76c29e7452d5e9
---

# Voorbeeld
{: .no_toc }

Een compleet seedbestand, sectie voor sectie
{: .fs-6 .fw-300 }

---

Het volgende seedbestand declareert elke sectie behalve `oauth2` en de verouderde `awx`; geheimen komen uit
omgevingsvariabelen zoals `${SEED_AWX_TOKEN}`:

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

`provider` is een van:

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
* `custom` : elk ander OpenAI-compatibel endpoint

Net als `ldap` is de sectie `chat` één rij, dus elk veld is verplicht behalve de optionele
velden; een optioneel veld dat wordt weggelaten, blijft ongewijzigd.

De chat-assistent heeft ook `ENABLE_CHAT=1` nodig; zie de pagina [Chat-assistent](../chat).

Sinds 7.3.0 meldt een runner zich aan met een referentie van zijn type, die het adres van zijn server in `url` bevat. Een runner met een eigen `token`,
of `username` en `password`, werkt nog: de seed logt een waarschuwing en zet ze om in zo'n referentie, genoemd naar de runner. Een
runner die een `api`- of `userpass`-referentie noemt, werkt ook nog, met een waarschuwing: geef die referentie in plaats daarvan het type van de runner.
Beide zijn sinds 7.3.0 verouderd en worden in 8.0.0 verwijderd. Een RTE-runner zonder `rte_mode` staat in databasemodus, verouderd (zie
[Modi](../rte/modes.html)). Een runner met `enabled: false` krijgt geen job, ook niet als standaard van zijn type (zie
[Standaard en Ingeschakeld](../runners/list.html#default-and-enabled)); zonder `enabled` laat de seed hem zoals hij is.

Een runneritem neemt naast `name`, `type`, `description`, `credential`, `is_default` en `enabled` deze sleutels:

| Sleutel | Wat ze instelt |
|---|---|
| `rte_mode` | De modus van een RTE: `outbound`, `inbound` of `database` (verouderd, de standaard) |
| `rte_max_jobs` | De **Max. gelijktijdige jobs** van een RTE in socketmodus, `0` tot `10000` (`0`: geen limiet) |
| `rte_cache_mb` | De **Cache voor jobbestanden** in MB, `0` tot `1048576` (`0` bewaart niets) |
| `rte_files` | De **Jobbestanden**: `transfer` of `local` |
| `rte_drain_seconds` | De **Wachttijd bij stoppen** in seconden, `0` tot `86400` |
| `flavour` | Een `awx`-runner die een AAP of een Ascender is: `aap` of `ascender`; geen voor AWX |
| `project` | Het project-id van een Semaphore-runner, de projectnaam van een Rundeck-runner, de map van een Jenkins-runner |
| `uri`, `ignore_certs`, `ca_bundle` | Het eigen adres en de TLS van de runner, van vóór 7.3.0: alleen gebruikt zolang zijn referentie geen `url` bevat |

De vier `rte_*`-instellingen zijn die van het tabblad RTE van de runnerpagina (zie [De instellingen van een RTE](../runners/runner-page.html#an-rtes-settings)):
ze winnen van dezelfde variabelen die op de RTE zijn ingesteld, en een RTE in databasemodus negeert ze. Een waarde buiten het bereik laat de
validatie van de seed mislukken.

Een RTE in databasemodus kan zichzelf registreren voordat de seed wordt toegepast. Een RTE-runner uit de seed waarvan de `uri` het adres is waarop zo'n RTE
zich registreerde, **neemt** die rij **over**: hij krijgt de gedeclareerde naam en velden, en de worker verwijdert hem niet meer als de RTE niet meer
antwoordt, in plaats van een tweede runner voor dezelfde RTE.

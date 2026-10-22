---
layout: default
title: Beispiel
parent: Config-Seed
nav_order: 1
translated_from: f085641a12234a5485ea59e73e76c29e7452d5e9
---

# Beispiel
{: .no_toc }

Eine vollständige Seed-Datei, Abschnitt für Abschnitt
{: .fs-6 .fw-300 }

---

Die folgende Seed-Datei deklariert jeden Abschnitt außer `oauth2` und dem veralteten `awx`; Geheimnisse kommen aus
Umgebungsvariablen wie `${SEED_AWX_TOKEN}`:

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

`provider` ist einer von:

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
* `custom` : jeder andere OpenAI-kompatible Endpunkt

Wie `ldap` ist der Abschnitt `chat` eine einzelne Zeile, daher ist jedes Feld erforderlich, außer den optionalen;
ein ausgelassenes optionales Feld bleibt unverändert.

Der Chat-Assistent braucht außerdem `ENABLE_CHAT=1`; siehe die Seite [Chat-Assistent](../chat).

Seit 7.3.0 meldet sich ein Runner mit Anmeldedaten seines Typs an, die die Adresse seines Servers in `url` enthalten. Ein Runner mit eigenem `token`
oder `username` und `password` funktioniert weiterhin: Der Seed protokolliert eine Warnung und macht daraus solche Anmeldedaten, benannt nach dem Runner. Ein
Runner, der `api`- oder `userpass`-Anmeldedaten nennt, funktioniert ebenfalls weiterhin, mit einer Warnung: Geben Sie diesen Anmeldedaten stattdessen den Typ des Runners.
Beides ist seit 7.3.0 veraltet und wird in 8.0.0 entfernt. Ein RTE-Runner ohne `rte_mode` ist im Datenbankmodus, veraltet (siehe
[Modi](../rte/modes.html)). Ein Runner mit `enabled: false` erhält keinen Job, auch nicht als Standard seines Typs (siehe
[Standard und Aktiviert](../runners/list.html#default-and-enabled)); ohne `enabled` lässt der Seed ihn, wie er ist.

Ein Runner-Element nimmt neben `name`, `type`, `description`, `credential`, `is_default` und `enabled` diese Schlüssel:

| Schlüssel | Was er setzt |
|---|---|
| `rte_mode` | Den Modus einer RTE: `outbound`, `inbound` oder `database` (veraltet, der Standard) |
| `rte_max_jobs` | **Max. gleichzeitige Jobs** einer RTE im Socket-Modus, `0` bis `10000` (`0`: keine Grenze) |
| `rte_cache_mb` | Ihren **Cache für Jobdateien** in MB, `0` bis `1048576` (`0` behält keine) |
| `rte_files` | Ihre **Jobdateien**: `transfer` oder `local` |
| `rte_drain_seconds` | Ihre **Wartezeit beim Stoppen** in Sekunden, `0` bis `86400` |
| `flavour` | Ein `awx`-Runner, der ein AAP oder Ascender ist: `aap` oder `ascender`; keiner für AWX |
| `project` | Die Projekt-ID eines Semaphore-Runners, den Projektnamen eines Rundeck-Runners, den Ordner eines Jenkins-Runners |
| `uri`, `ignore_certs`, `ca_bundle` | Die eigene Adresse und das TLS des Runners aus der Zeit vor 7.3.0: nur verwendet, solange seine Anmeldedaten keine `url` enthalten |

Die vier `rte_*`-Einstellungen sind die des Tabs RTE der Runner-Seite (siehe [Die Einstellungen einer RTE](../runners/runner-page.html#an-rtes-settings)):
Sie gewinnen über dieselben auf der RTE gesetzten Variablen, und eine RTE im Datenbankmodus ignoriert sie. Ein Wert außerhalb seines Bereichs lässt die
Validierung des Seeds fehlschlagen.

Eine RTE im Datenbankmodus kann sich selbst registrieren, bevor der Seed angewendet wird. Ein RTE-Runner aus dem Seed, dessen `uri` die Adresse ist, unter der eine solche RTE
sich registriert hat, **übernimmt** diese Zeile: Sie erhält den deklarierten Namen und die Felder, und der Worker entfernt sie nicht mehr, wenn die RTE nicht mehr
antwortet, statt eines zweiten Runners für dieselbe RTE.

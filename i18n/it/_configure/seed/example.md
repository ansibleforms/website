---
layout: default
title: Esempio
parent: Config seed
nav_order: 1
translated_from: 3b80574712dfc8f514f0ff20403fc53f1d521279
---

# Esempio
{: .no_toc }

Un file di seed completo, sezione per sezione
{: .fs-6 .fw-300 }

---

Il seguente file di seed dichiara ogni sezione tranne `oauth2` e la deprecata `awx`; i segreti arrivano da variabili
d'ambiente come `${SEED_AWX_TOKEN}`:

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

# ldap is a single-row section, so EVERY field must be declared - see "Single-row
# sections are all or nothing" below. Empty is a perfectly good value.
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
  url: https://forms.example.com   # the only key it needs from 7.6.0

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

`provider` è uno tra:

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

Come `ldap`, la sezione `chat` è una riga singola, quindi ogni campo è obbligatorio tranne quelli
facoltativi; un campo facoltativo omesso resta invariato.

L'assistente chat richiede anche `ENABLE_CHAT=1`; vedi la pagina [Assistente chat](../chat).

La mail passa dai canali mail di `notification_channels:` (vedi [Mail](../notification-channels/mail.html)). Le chiavi
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` e `mail_from` sotto `settings:` sono deprecate
dalla 7.6.0 e verranno rimosse nella 8.0.0. Funzionano ancora e registrano un avviso una volta: il seed ne fa un canale mail chiamato
`default`, con una credenziale smtp `mail-login` quando c'è un `mail_username`, o con il proprio server per un relay. Dichiara invece tu
il canale mail e la sua credenziale, come `mail` e `smtp-login` nel file sopra.

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

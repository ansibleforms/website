---
layout: default
title: Przykład
parent: Config seed
nav_order: 1
translated_from: cf1f2b0122ca5cd2dfcc411e4ed20fb683b079bf
---

# Przykład
{: .no_toc }

Kompletny plik seed, sekcja po sekcji
{: .fs-6 .fw-300 }

---

Poniższy plik seed deklaruje każdą sekcję poza `oauth2` i przestarzałą `awx`; sekrety pochodzą ze zmiennych środowiskowych,
takich jak `${SEED_AWX_TOKEN}`:

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

`provider` to jedno z:

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
* `custom` : dowolny inny endpoint zgodny z OpenAI

Tak jak `ldap`, sekcja `chat` to pojedynczy wiersz, więc każde pole jest wymagane poza
opcjonalnymi; pominięte pole opcjonalne pozostaje bez zmian.

Asystent czatu wymaga też `ENABLE_CHAT=1`; zobacz stronę [Asystent czatu](../chat).

Od wersji 7.3.0 runner loguje się poświadczeniem swojego typu, które zawiera adres jego serwera w `url`. Runner z własnym `token`
albo `username` i `password` nadal działa: seed zapisuje ostrzeżenie w dzienniku i zamienia je na takie poświadczenie, nazwane od runnera.
Runner, który wskazuje poświadczenie `api` lub `userpass`, też nadal działa, z ostrzeżeniem: nadaj zamiast tego temu poświadczeniu typ runnera.
Oba są przestarzałe od wersji 7.3.0 i zostaną usunięte w 8.0.0. Runner RTE bez `rte_mode` jest w trybie bazy danych, przestarzałym (zobacz
[Tryby](../rte/modes.html)). Runner z `enabled: false` nie dostaje żadnych zadań, także jako domyślny dla swojego typu (zobacz
[Domyślny i Włączony](../runners/list.html#default-and-enabled)); bez `enabled` seed zostawia go bez zmian.

Element runnera przyjmuje te klucze oprócz `name`, `type`, `description`, `credential`, `is_default` i `enabled`:

| Klucz | Co ustawia |
|---|---|
| `rte_mode` | Tryb RTE: `outbound`, `inbound` lub `database` (przestarzały, domyślny) |
| `rte_max_jobs` | **Maks. równoczesnych zadań** RTE w trybie gniazda, od `0` do `10000` (`0`: brak limitu) |
| `rte_cache_mb` | Jego **Pamięć podręczna plików** w MB, od `0` do `1048576` (`0` nie przechowuje żadnych) |
| `rte_files` | Jego **Pliki zadań**: `transfer` lub `local` |
| `rte_drain_seconds` | Jego **Czas oczekiwania przy zatrzymaniu** w sekundach, od `0` do `86400` |
| `flavour` | Runner `awx`, który jest AAP lub Ascenderem: `aap` lub `ascender`; brak dla AWX |
| `project` | Id projektu runnera Semaphore, nazwa projektu runnera Rundeck, folder runnera Jenkins |
| `uri`, `ignore_certs`, `ca_bundle` | Własny adres i TLS runnera sprzed wersji 7.3.0: używane tylko, dopóki jego poświadczenie nie zawiera `url` |

Cztery ustawienia `rte_*` to ustawienia karty RTE na stronie runnera (zobacz [Ustawienia RTE](../runners/runner-page.html#an-rtes-settings)):
wygrywają z tymi samymi zmiennymi ustawionymi na RTE, a RTE w trybie bazy danych je ignoruje. Wartość spoza zakresu powoduje niepowodzenie
walidacji seeda.

RTE w trybie bazy danych może się samo zarejestrować, zanim seed zostanie zastosowany. Runner RTE z seeda, którego `uri` jest adresem, pod którym takie RTE
się zarejestrowało, **przejmuje** ten wiersz: przyjmuje zadeklarowaną nazwę i pola, a worker przestaje go usuwać, gdy RTE przestaje
odpowiadać, zamiast tworzyć drugi runner dla tego samego RTE.

Od wersji 7.5.0 sekcja `databases` deklaruje [bazy danych](../databases.html), które odpytują formularze. Element ma `name`, `credential`
typu baza danych i opcjonalny `description`; seed stosuje go po poświadczeniach i odrzuca poświadczenie innego typu.

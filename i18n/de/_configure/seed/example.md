---
layout: default
title: Beispiel
parent: Config-Seed
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Beispiel
{: .no_toc }

Eine vollständige Seed-Datei, Abschnitt für Abschnitt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Datei

Die folgende Seed-Datei deklariert jeden Abschnitt außer dem veralteten `awx`. Geheimnisse kommen aus Umgebungsvariablen wie
`${SEED_AWX_TOKEN}`, und die Abschnitte tragen ihre Namen aus 7.8.0 (siehe [Umbenannte Abschnitte](./#renamed-sections)):

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

Die folgenden Abschnitte erklären die Teile, die mehr als einen Kommentar brauchen.

---

## Runner

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

Ab 7.5.0 deklariert der Abschnitt `databases` die [Datenbanken](../databases.html), die Formulare abfragen. Ein Eintrag hat einen `name`, eine
`credential` vom Typ Datenbank und eine optionale `description`; der Seed wendet ihn nach den Anmeldedaten an und weist Anmeldedaten eines anderen Typs ab.

---

## SSO

Der Abschnitt `sso` (`oauth2` vor 7.8.0) deklariert die [SSO-Anbieter](../authentication/), jeden mit seinem Client: eine `client_id` und
ein `client_secret`, oder `credential` mit Anmeldedaten aus dem Abschnitt credentials.

Seit 7.8.0 ist Microsoft Entra ID `provider: entraid`, wie die Repositories es schreiben. `provider: azuread`, sein früherer Name, wird
weiterhin gleich gelesen, seit 7.8.0 veraltet und in 8 entfernt, mit einer Warnung im Serverprotokoll. Der andere Anbieter ist `oidc`, und nur ein
Anbieter jeder Art darf `enable: true` haben.

---

## Repositories

Ein Repository-Element hat einen `name`, eine `uri`, einen optionalen `branch` (ohne ihn der Standard-Branch des Remotes), `credential`,
`rebase_on_start`, den Pull-Zeitplan `cron` und je ein Flag `use_for_*` pro Verwendungstyp: was die App daraus liest.

Seit 7.8.0 hat jeder Verwendungstyp sein Flag. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` und `use_for_inventories` gab es
schon vorher; die anderen sind neu:

| Kategorie | Flags |
|---|---|
| Designer | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Jobs | `use_for_schedules` |
| System | `use_for_general` |
| Erscheinungsbild | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Zugriff | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Verbindungen | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Mehrere Repositories können Formulare, Workflows und Inventare enthalten. Jeden anderen Typ enthält höchstens ein Repository: Ein Seed, der
dasselbe dieser Flags auf zwei Repositories setzt, wird abgewiesen. Was jeder Typ in Git ablegt, beschreibt
[Git-Repositories](../repositories/).

`use_for_config` ist seit 7.8.0 veraltet und wird in 8 entfernt. Es wird weiterhin gelesen, als `use_for_roles`, `use_for_categories` und
`use_for_constants`, mit einer Warnung im Serverprotokoll. Wenn mehrere Repositories es deklarieren, behält das Repository, das diese drei
bereits hat, sie (sonst das erste in der Datei), und die anderen erhalten keins. Deklarieren Sie stattdessen die drei Flags.

---

## Mail

Mails laufen über die Mail-Kanäle von `notifications:` (siehe [Mail](../notification-channels/mail.html)). Die Schlüssel
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` und `mail_from` unter `settings:` sind seit 7.6.0
veraltet und werden in 8.0.0 entfernt. Sie funktionieren weiterhin und protokollieren einmal eine Warnung: Der Seed macht daraus einen
Mail-Kanal namens `default`, mit smtp-Anmeldedaten `mail-login`, wenn es einen `mail_username` gibt, oder mit eigenem Server für ein
Relay. Deklarieren Sie stattdessen den Mail-Kanal und seine Anmeldedaten selbst, wie `mail` und `smtp-login` in der Datei oben.

---

## Chat-Assistent

Der Abschnitt `chat_assistant` (`chat` vor 7.8.0) setzt den Modellanbieter des Chat-Assistenten. `provider` ist einer von:

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

Wie `ldap` ist der Abschnitt `chat_assistant` eine einzelne Zeile, daher ist jedes Feld erforderlich, außer den optionalen;
ein ausgelassenes optionales Feld bleibt unverändert.

Seit 7.8.0 nimmt er auch `credential`, api-Anmeldedaten aus dem Abschnitt credentials, deren Passwort der Schlüssel ist, statt
`api_key` (deklarieren Sie dann `api_key: ""`). Der Chat-Assistent braucht außerdem `ENABLE_CHAT=1`, das der Seed nicht setzt; siehe die
Seite [Chat-Assistent](../chat/).

---

## Benutzer und Gruppen

Seit 7.8.0 deklarieren die Abschnitte `groups` und `users` lokale Gruppen und Benutzer. Sie werden bei jeder Anwendung angelegt oder geändert,
nie gelöscht, und bleiben in der App bearbeitbar (siehe [Benutzer und Gruppen](../users-and-groups.html)).

Ein Gruppen-Element hat einen `name`, eine optionale `description` und seine Mitglieder in `users`: die Benutzernamen lokaler Benutzer. Das
Element eines Benutzers sagt nichts über seine Gruppen, so listet eine Gruppe ihre Mitglieder an einer Stelle. Der Seed wendet die Gruppen vor den Benutzern an.

Ein Benutzer-Element hat einen `username` und einen `type`:

| Typ | Was sein Element angibt |
|---|---|
| `local` (der Standard) | `email`, `description`, `blocked`, und `password` als `${ENV}`-Verweis, wie jedes Geheimnis des Seeds |
| `ldap`, `entraid`, `oidc` | Nur `description` und `blocked`: Der Rest kommt bei jeder Anmeldung aus seinem Verzeichnis |

Ein neuer lokaler Benutzer erhält die Gruppen des Seeds, die ihn auflisten, geben Sie ihm also mindestens eine. Ohne `password` kann er sich
nicht anmelden, bis ein Admin in der App eines setzt. Ein Verzeichnisbenutzer wird angelegt, bevor er sich je anmeldet, sodass jemand, der
geht, gesperrt ist, bevor er es versucht. Der eingebaute Admin wird nie deklariert: Er bleibt der Weg zurück hinein.

---

## Erscheinungsbild, MCP und SSH

Seit 7.8.0 deklariert der Seed auch Einstellungen, von denen die App eine hat, jeden Abschnitt im Format derselben Seite in einem Git-Repository.

| Abschnitt | Seite | Schlüssel |
|---|---|---|
| `defaults` | **Einstellungen > Erscheinungsbild > Standardwerte** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** und **Symbol** | `logo` oder `icon`: der Pfad einer Bilddatei, relativ zur Seed-Datei; `""` stellt das mitgelieferte wieder her |
| `name` | **Name** | `app_name` |
| `links` | **Links** | `header_links` (jeweils `id`, `label`, `url`, `icon`, `newTab`, `parent`) und `show_designer` |
| `mcp` | **Einstellungen > Verbindungen > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Einstellungen > Verbindungen > SSH** | `private_key` und `known_hosts` |
| `announcements` | **Einstellungen > Erscheinungsbild > Ankündigungen** | Elemente mit `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Einstellungen > Zugriff > Haftungsausschluss** | Elemente mit `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Jeder Schlüssel ist optional: Was ein Abschnitt auslässt, bleibt, wie die App es hat. Das Logo und das Symbol werden wie ein Upload geprüft
(ein Bild, höchstens 900 KB für das Logo und 256 KB für das Symbol).

Die Schlüssel von `mcp` sind die Umgebungsvariablen des [MCP-Servers](../mcp/) in Kleinbuchstaben. Eine Variable, die die echte Umgebung
setzt, behält den Wert der Umgebung: Das Serverprotokoll sagt es, und der Start geht weiter.

`ssh` enthält den privaten Schlüssel der App als `${ENV}`-Verweis (ihr öffentlicher Schlüssel wird daraus erzeugt) und die Server, denen die
App vertraut, je eine known_hosts-Zeile (die Hosts, der Schlüsseltyp und der Schlüssel). Er wird bei jedem Start angewendet.

Eine Ankündigung, deren `end_at` vorbei ist, wird ausgelassen. Eine `version` des Haftungsausschlusses ist eine Zahl, höchstens eine ist
`enabled`, und ein geänderter Text korrigiert diese Version; mit `ask_again: true` werden alle, die sie akzeptiert haben, erneut gefragt.

Wie weit der Seed jeden davon besitzt, steht unter [Verwaltete Objekte](managed-objects.html#settings-the-seed-declares).

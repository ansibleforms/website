---
layout: default
title: Voorbeeld
parent: Configuratie-seed
nav_order: 1
translated_from: 4c570ca726391f1d55f86eafe947111c14a8ca11
---

# Voorbeeld
{: .no_toc }

Een compleet seedbestand, sectie voor sectie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het bestand

Het volgende seedbestand declareert elke sectie behalve de verouderde `awx`. Geheimen komen uit omgevingsvariabelen zoals
`${SEED_AWX_TOKEN}`, en de secties gebruiken hun namen van 7.8.0 (zie [Hernoemde secties](./#renamed-sections)):

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
De secties hieronder leggen de delen uit die meer nodig hebben dan een opmerking.

---

## Runners

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

Vanaf 7.5.0 declareert de sectie `databases` de [databases](../databases.html) die formulieren bevragen. Een item heeft een `name`, een `credential`
van het type database en een optionele `description`; de seed past het toe na de referenties, en weigert een referentie van een ander type.

---

## SSO

De sectie `sso` (`oauth2` vóór 7.8.0) declareert de [SSO-providers](../authentication/), elk met zijn client: een `client_id` en
`client_secret`, of een `credential` van de sectie credentials.

Sinds 7.8.0 is Microsoft Entra ID `provider: entraid`, zoals de repositories het schrijven. `provider: azuread`, de naam van voorheen, wordt nog
op dezelfde manier gelezen, verouderd sinds 7.8.0 en verwijderd in 8, met een waarschuwing in het serverlog. De andere provider is `oidc`, en
slechts één provider van elke soort mag `enable: true` hebben.

---

## Repositories

Een repositoryitem heeft een `name`, een `uri`, een optionele `branch` (de standaardbranch van de remote als die wordt weggelaten), een `credential`,
`rebase_on_start`, het pull-schema `cron`, en één `use_for_*`-vlag per gebruikstype: wat de app eruit leest.

Sinds 7.8.0 heeft elk gebruikstype zijn vlag. `use_for_forms`, `use_for_playbooks`, `use_for_workflows` en `use_for_inventories` bestonden
al; de andere zijn nieuw:

| Categorie | Vlaggen |
|---|---|
| Ontwerper | `use_for_categories`, `use_for_constants`, `use_for_forms`, `use_for_inventories`, `use_for_playbooks`, `use_for_workflows` |
| Taken | `use_for_schedules` |
| Systeem | `use_for_general` |
| Uiterlijk | `use_for_defaults`, `use_for_logo`, `use_for_icon`, `use_for_name`, `use_for_links`, `use_for_labels`, `use_for_announcements` |
| Toegang | `use_for_disclaimer`, `use_for_users`, `use_for_groups`, `use_for_roles`, `use_for_ldap`, `use_for_sso` |
| Verbindingen | `use_for_repositories`, `use_for_credentials`, `use_for_secret_stores`, `use_for_databases`, `use_for_runners`, `use_for_ssh`, `use_for_notifications`, `use_for_chat_assistant`, `use_for_mcp`, `use_for_syslog` |

Meerdere repositories kunnen formulieren, workflows en inventarissen bevatten. Elk ander type wordt door hoogstens één repository bevat: een seed die
dezelfde van die vlaggen op twee repositories zet, wordt geweigerd. Wat elk type in git bewaart, staat beschreven in
[Git-repositories](../repositories/).

`use_for_config` is sinds 7.8.0 verouderd en wordt in 8 verwijderd. Het wordt nog gelezen, als `use_for_roles`, `use_for_categories` en
`use_for_constants`, met een waarschuwing in het serverlog. Als meerdere repositories het declareren, houdt de repository die die drie al heeft
ze (anders de eerste in het bestand), en krijgen de andere er geen. Declareer in plaats daarvan de drie vlaggen.

---

## Mail

Mail gaat via de mailkanalen van `notifications:` (zie [Mail](../notification-channels/mail.html)). De sleutels
`mail_server`, `mail_port`, `mail_secure`, `mail_username`, `mail_password` en `mail_from` onder `settings:` zijn sinds 7.6.0 verouderd
en worden in 8.0.0 verwijderd. Ze werken nog en loggen eenmaal een waarschuwing: de seed maakt er een mailkanaal `default` van,
met een smtp-referentie `mail-login` als er een `mail_username` is, of met een eigen server voor een relay. Declareer in plaats daarvan
zelf het mailkanaal en zijn referentie, zoals `mail` en `smtp-login` in het bestand hierboven.

---

## Chat-assistent

De sectie `chat_assistant` (`chat` vóór 7.8.0) stelt de modelprovider van de chat-assistent in. `provider` is een van:

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

Net als `ldap` is de sectie `chat_assistant` één rij, dus elk veld is verplicht behalve de optionele
velden; een optioneel veld dat wordt weggelaten, blijft ongewijzigd.

Sinds 7.8.0 neemt ze ook `credential`, een api-referentie van de sectie credentials waarvan het wachtwoord de sleutel is, in plaats van de
`api_key` (declareer dan `api_key: ""`). De chat-assistent heeft ook `ENABLE_CHAT=1` nodig, dat de seed niet instelt; zie de pagina
[Chat-assistent](../chat/).

---

## Gebruikers en groepen

Sinds 7.8.0 declareren de secties `groups` en `users` lokale groepen en gebruikers. Ze worden bij elke toepassing aangemaakt of gewijzigd, nooit
verwijderd, en ze blijven bewerkbaar in de app (zie [Gebruikers en groepen](../users-and-groups.html)).

Een groepsitem heeft een `name`, een optionele `description` en zijn leden in `users`: de gebruikersnamen van lokale gebruikers. Het item van een
gebruiker zegt niets over zijn groepen, dus een groep somt zijn leden op één plek op. De seed past de groepen toe vóór de gebruikers.

Een gebruikersitem heeft een `username` en een `type`:

| Type | Wat zijn item geeft |
|---|---|
| `local` (de standaard) | `email`, `description`, `blocked`, en `password` als `${ENV}`-verwijzing, zoals elk geheim van de seed |
| `ldap`, `entraid`, `oidc` | Alleen `description` en `blocked`: de rest komt bij elke aanmelding uit zijn directory |

Een nieuwe lokale gebruiker krijgt de groepen van de seed die hem opsommen, dus geef hem er minstens één. Zonder `password` kan hij zich niet aanmelden
tot een admin er een instelt in de app. Een directorygebruiker wordt aangemaakt voordat hij zich ooit aanmeldt, zodat iemand die vertrekt al
geblokkeerd is voordat hij het probeert. De ingebouwde admin wordt nooit gedeclareerd: hij blijft de weg terug naar binnen.

---

## Uiterlijk, MCP en SSH

Sinds 7.8.0 declareert de seed ook instellingen waarvan de app er één heeft, elke sectie in het formaat van dezelfde pagina in een git-repository.

| Sectie | Pagina | Sleutels |
|---|---|---|
| `defaults` | **Instellingen > Uiterlijk > Standaardwaarden** | `default_theme`, `default_theme_color`, `default_forms_view`, `default_timezone`, `default_date_format`, `default_language` |
| `logo`, `icon` | **Logo** en **Pictogram** | `logo` of `icon`: het pad van een afbeeldingsbestand, relatief ten opzichte van het seedbestand; `""` zet het meegeleverde terug |
| `name` | **Naam** | `app_name` |
| `links` | **Links** | `header_links` (elk `id`, `label`, `url`, `icon`, `newTab`, `parent`) en `show_designer` |
| `mcp` | **Instellingen > Verbindingen > MCP** | `enable_mcp`, `mcp_read_only`, `mcp_chat_forms_only` |
| `ssh` | **Instellingen > Verbindingen > SSH** | `private_key` en `known_hosts` |
| `announcements` | **Instellingen > Uiterlijk > Aankondigingen** | Items met `name`, `message`, `level`, `enabled`, `start_at`, `end_at` |
| `disclaimer` | **Instellingen > Toegang > Disclaimer** | Items met `version`, `title`, `text`, `checkbox_label`, `enabled`, `ask_again` |

Elke sleutel is optioneel: wat een sectie weglaat, blijft zoals de app het heeft. Het logo en het pictogram worden gecontroleerd zoals een upload
(een afbeelding, hoogstens 900 KB voor het logo en 256 KB voor het pictogram).

De sleutels van `mcp` zijn de omgevingsvariabelen van de [MCP-server](../mcp/) in kleine letters. Een variabele die de echte omgeving
instelt, behoudt de waarde van de omgeving: het serverlog meldt dat, en het opstarten gaat door.

`ssh` bevat de private sleutel van de app, als `${ENV}`-verwijzing (de publieke sleutel wordt ervan gemaakt), en de servers die de app vertrouwt,
elk één known_hosts-regel (de hosts, het sleuteltype en de sleutel). Het wordt bij elke start toegepast.

Een aankondiging waarvan `end_at` voorbij is, wordt weggelaten. Een disclaimer-`version` is een getal, hoogstens één is `enabled`, en een gewijzigde
tekst corrigeert die versie; met `ask_again: true` wordt iedereen die haar accepteerde opnieuw gevraagd.

Hoe ver de seed eigenaar is van elk hiervan, staat op [Beheerde objecten](managed-objects.html#settings-the-seed-declares).

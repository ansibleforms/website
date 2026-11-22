---
layout: default
title: Configuratie in git
parent: Git-repositories
nav_order: 5
translated_from: 81365c1e3028835d57540b008c112e67f1cffbef
---

# Configuratie in git
{: .no_toc }

Elke instelling bewaard in een git-repository, in beide richtingen gelezen en geschreven
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders die de instellingen, de gebruikers en de verbindingen van AnsibleForms in git willen laten reviewen en versioneren, sinds 7.8.0.

---

## De gebruikstypen

De stap **Gebruik** van een repository, in de wizard en op het tabblad **Gebruik** van haar pagina, zegt wat de app eruit haalt.

De typen zijn gegroepeerd onder zes kopjes, elk met het aantal typen dat het bevat, bijvoorbeeld **Ontwerper (6)**. Elk type heeft een eigen
selectievakje en een korte regel die zegt wat de repository ervoor bevat; het vakje van een kopje vinkt elk type van dat kopje aan of uit dat
aangevinkt kan worden.

| Kopje | Gebruikstypen (vlag) |
|---|---|
| **Ontwerper** | **Categorieën** (`use_for_categories`), **Constanten** (`use_for_constants`), **Formulieren** (`use_for_forms`), **Inventarissen** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Taken** | **Planners** (`use_for_schedules`) |
| **Systeem** | **Algemeen** (`use_for_general`) |
| **Uiterlijk** | **Standaardwaarden** (`use_for_defaults`), **Logo** (`use_for_logo`), **Pictogram** (`use_for_icon`), **Naam** (`use_for_name`), **Links** (`use_for_links`), **Labels** (`use_for_labels`), **Aankondigingen** (`use_for_announcements`) |
| **Toegang** | **Disclaimer** (`use_for_disclaimer`), **Gebruikers** (`use_for_users`), **Groepen** (`use_for_groups`), **Rollen** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Verbindingen** | **Repositories** (`use_for_repositories`), **Inloggegevens** (`use_for_credentials`), **Secret stores** (`use_for_secret_stores`), **Databases** (`use_for_databases`), **Runners** (`use_for_runners`), **SSH** (`use_for_ssh`), **Meldingen** (`use_for_notifications`), **Chat-assistent** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formulieren**, **Inventarissen** en **Workflows** mogen op meerdere repositories aangevinkt zijn. **Playbooks** komen uit één: de stap Gebruik
maakt het grijs op de andere, en de server neemt de eerste met een waarschuwing. Elk ander type hoort bij hoogstens één repository, en een tweede
wordt geweigerd door de API en door de config seed. Een type dat een andere repository heeft, staat grijs aangevinkt en uitgeschakeld, met een
tooltip die die repository noemt: `Al beheerd door de repository "platform"`.

Een gebruikstype aan- of uitzetten is alleen een wijziging voor beheerders, net als de **Uri** en de **Branch** (zie
[Wie een repository mag wijzigen](adding.html#who-may-change-a-repository)).

---

## Waar een repository ze bewaart

Een repository bewaart een type in elk YAML-bestand, met elke naam en in elke map: de sleutel op het hoogste niveau zegt welk type het bevat.

Die sleutel is altijd `controller_` plus de sleutel van het type: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Elk `.yaml`- of `.yml`-bestand van de repository wordt bekeken, op elke diepte, verborgen bestanden en mappen uitgezonderd. Een bestand kan
meerdere typen bevatten, en een type kan over veel bestanden verspreid zijn.

| Sleutel | Bevat |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | één map, voor wat de app maar één keer heeft; hoogstens één bestand geeft hem |
| `controller_users:` | een lijst van gebruikers, elk herkend aan zijn `type` (lokaal als het ontbreekt) en zijn `username` |
| `controller_disclaimer:` | een lijst van versies, elk herkend aan zijn `version` |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | de rollen, de categorieën en de constanten, in hun gebruikelijke formaat |
| elke andere `controller_`-sleutel | een lijst van items, elk herkend aan zijn `name` |

Een object wordt herkend aan zijn naam binnen zijn type, nooit aan zijn bestand: een item dat naar een ander bestand verhuist, houdt zijn object.
Een gewone sleutel (`credentials:`, de `roles:` van een Galaxy-requirementsbestand, de `labels:` van een variabelenbestand) hoort bij geen enkel
type, en de app leest of schrijft hem nooit. Een formulier is nooit het bestand van een type, en een sleutel van een type waarvoor de repository
niet wordt gebruikt, blijft ongemoeid, met een hint in de pull-uitvoer.

### Rollen, categorieën en constanten

Deze drie houden het formaat van `config.yaml`, nu elk onder een eigen sleutel, in een eigen gebruikstype (elk één repository).

Elk wordt gelezen uit het bestand van zijn repository dat zijn sleutel op het hoogste niveau geeft, met elke naam en in elke map; één bestand kan
alle drie geven. Geeft geen enkel bestand hem, dan wordt de `config.yaml` van de repository nog gelezen, met zijn gewone sleutels `roles:`,
`categories:` en `constants:`: dit is verouderd sinds 7.8.0 en wordt vanaf 8.0 niet meer gelezen, en de serverlog, de pull-uitvoer en de pagina
van de repository melden dat. Verplaats elke sleutel naar een eigen bestand, bijvoorbeeld `roles.yaml` met `controller_roles:`.

Een sleutel die geen enkele repository bevat, komt zoals vroeger uit de basisconfiguratie: haar kopie in de database, of het bestand op
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). De vroegere schakelaar **Gebruiken voor configuratie** bestaat niet meer: een
bijgewerkte instantie geeft **Rollen**, **Categorieën** en **Constanten** aan de repository die hem had. De config seed, de items
`controller_repositories:` van een repository en de API aanvaarden `use_for_config` nog als verouderde alias van de drie, met een waarschuwing.

---

## In beide richtingen: git en de app

Een repository die voor een type wordt gebruikt, blijft in beide richtingen gelijk met de app, en wat draait blijft de database van de app.

| Richting | Wat er gebeurt |
|---|---|
| Van git naar de app | Na elke pull, clone of reset van de repository, en bij het starten van de server, worden de bestanden ingelezen: een nieuwe naam maakt een object, een gewijzigd item wijzigt het, een verwijderd item verwijdert het |
| Van de app naar git | Opslaan in de app schrijft terug in het bestand van het item: alleen de gewijzigde velden, met behoud van de commentaren, andere sleutels en andere items van het bestand. Een nieuw object komt aan het einde van het eerste bestand met de sleutel van het type, anders in een nieuw `<key>.yaml` in de root (`credentials.yaml`); verwijderen haalt zijn item weg. Het wacht op de **Push** van de repository |

Een ongeldig item wordt apart geweigerd, met zijn plaats en de reden, en het object met die naam blijft zoals het was. Een item dat een object noemt
dat er nog niet is (een runner en zijn inloggegevens), wacht en wordt opnieuw gelezen wanneer dat type de volgende keer gepulld wordt. Een
hernoeming in git wordt gevolgd wanneer één naam een bestand verlaat en één nieuwe naam erin verschijnt, terwijl de rest gelijk blijft.

### Een gebruik in- of uitschakelen

Een repository opslaan met een type in- of uitgeschakeld vraagt eerst wat er moet gebeuren, en toont wat de wijziging zal doen.

| Wijziging | Vraag | Wat het doet |
|---|---|---|
| Aan | **Inloggegevens inschakelen**: `platform gebruiken voor Inloggegevens?` | De repository wordt gepulld en haar items ingelezen; bij een naam die beide hebben wint git; de andere objecten van de app worden naar de repository geschreven, zonder hun geheimen, wachtend op **Push** |
| Uit | **Inloggegevens uitschakelen**: `platform niet meer gebruiken voor Inloggegevens?` | De repository wordt nog één keer gepulld, daarna worden haar objecten losgekoppeld: ze blijven ongewijzigd in de app, en de bestanden in git blijven zoals ze zijn |
| Meerdere | **Gebruik wijzigen**: `Wijzigen waarvoor platform gebruikt wordt?` | Eén vraag, een sectie per type, bevestigd met **Gebruik opslaan** |

De vraag noemt ook wat in de app blijft: de objecten van de config seed, runners die een RTE zelf registreerde, en die welke op goedkeuring
wachten. Een melding zegt daarna wat elk type overnam, bijvoorbeeld
`Inloggegevens: 2 uit de bestanden gelezen, 3 naar de repository geschreven (wachtend op Push), 1 vervangen door git, 0 behouden in deze app.`

### Wat de pull-uitvoer zegt

**Uitvoer van laatste pull tonen** van de repository bevat na de eigen uitvoer van git een regel per type.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Een object dat in een repository bewaard wordt, toont **Repository: platform** op zijn pagina (de naam van zijn repository), met het bestand van zijn
item in de tooltip. Opslaan schrijft dat bestand, en de **Push** van de repository stuurt het naar git.

---

## Geheimen

Git bevat nooit een geheim in klare tekst: een geheim veld van een item is alleen een `${ENV}`-verwijzing, opgelost uit de omgeving.

Wachtwoorden, tokens, client secrets en sleutels worden geschreven als `${SEED_RTE_TOKEN}`, zoals in de [config seed](../seed/). Een item met een
geheim in klare tekst, of dat een variabele noemt die niet is ingesteld, wordt geweigerd en genoemd in de pull-uitvoer; dat geldt ook voor een
variabele van de server zelf (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Een geheim dat in een item ontbreekt, houdt het geheim uit
de database van de app, en de app schrijft haar eigen objecten naar git zonder hun geheimen.

Een geheim dat in de app wordt ingetypt voor een object waarvan het item het als `${ENV}`-verwijzing geeft, wordt geweigerd: wijzig de variabele, of
het item in git.

---

## De ontwerper en deze bestanden

De ontwerper blijft weg van de bestanden die bij de gebruikstypen horen, zodat een formulierwijziging nooit een instelling verandert.

Hij toont, leest, schrijft of verwijdert nooit een bestand dat de sleutel geeft van een type dat zijn repository bevat, noch de afbeeldingen die zo'n
bestand noemt. Hij weigert ook een bestand te schrijven waarvan de inhoud de sleutel van een type zou geven, en het laden van formulieren leest zo'n bestand nooit als formulier.

---

## Elk type, met een voorbeeld

De items van elk type hebben het formaat van de config seed, zodat een seed-item en een repository-item uitwisselbaar zijn.

De bestandsnamen hieronder zijn voorbeelden: elke naam en elke map zou net zo goed werken.

### Categorieën, constanten en rollen

De categorieën en de rollen zijn lijsten, de constanten één map, elk onder een eigen sleutel.

```yaml
# config/categories.yaml
controller_categories:
  - name: Default
    icon: bars
  - name: Storage
    icon: database
# config/constants.yaml
controller_constants:
  mail_domain: example.com
# config/roles.yaml
controller_roles:
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
  - name: operators
    groups:
      - local/operators
    options:
      allowJobRelaunch: true
```

Elke rol wordt apart gecontroleerd: een ongeldige wordt apart geweigerd, en de andere worden gebruikt. De rollen kunnen over meerdere bestanden
verspreid zijn, en worden gebruikt in de volgorde van hun bestanden. Zie [Rollen](../config/roles.html).

### Planners

De planners zijn een lijst `controller_schedules:`, waarbij elk item het formulier noemt dat het uitvoert en getimed wordt door precies één van
`cron`, `rrule` of `one_time_run`.

```yaml
controller_schedules:
  - name: Nightly cleanup
    form: Cleanup
    rrule: DTSTART;TZID=Europe/Brussels:20261201T020000 RRULE:FREQ=DAILY;INTERVAL=1
    extra_data:
      retention_days: 14
  - name: Workday backup
    form: Backup
    cron: '30 22 * * 1-5'
```

De jobs die gebruikers met "Later uitvoeren" plannen, blijven in de app. Zie [Planners](../jobs/schedules.html) voor de timings en de prompts.

### Algemeen

De instellingen van **Algemeen** zijn één map, op de namen van hun omgevingsvariabelen in kleine letters.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Alleen de variabelen die de pagina Algemeen wijzigt, worden overgenomen; een sleutel in hoofdletters, of een variabele die in de echte omgeving is
ingesteld, wordt geweigerd. Een variabele waarvan de naam eindigt op `_PASSWORD`, `_SECRET` of `_TOKEN` is alleen een `${ENV}`-verwijzing.

### Standaardwaarden, logo, pictogram, naam en links

De pagina's van Uiterlijk zijn elk één map, met wat de pagina opslaat.

```yaml
# branding.yaml, its images in the assets folder beside it
controller_defaults:
  default_theme: dark
  default_theme_color: "#198754"
  default_forms_view: tiles
  default_timezone: Europe/Brussels
  default_date_format: DD/MM/YYYY
  default_language: fr
controller_logo:
  logo: assets/logo.png
controller_icon:
  icon: assets/icon.svg
controller_name:
  app_name: ACME Automation
controller_links:
  show_designer: true
  header_links:
    - id: docs
      label: Docs
      url: https://docs.example.com
      icon: book
      newTab: true
```

Het logo en het pictogram zijn afbeeldingen van de repository, genoemd ten opzichte van het bestand dat ze noemt. Een veld dat de config seed
declareert, blijft dat van de seed.

### Labels en aankondigingen

De labels en de aankondigingen zijn lijsten van items, elk herkend aan zijn naam.

```yaml
controller_labels:
  - name: Production
    color: red
    enabled: true
    position: 1
controller_announcements:
  - name: Maintenance
    message: The app is down on Sunday from 8 to 10.
    level: warning
    start_at: 2030-01-06T08:00:00Z
    end_at: 2030-01-06T10:00:00Z
```

Een aankondiging waarvan het einde al voorbij is, wordt niet geïmporteerd, wat een regel `Not imported` van de pull-uitvoer meldt.

### Disclaimer

De disclaimer is een lijst van versies, elk herkend aan zijn `version`, waarvan er hoogstens één ingeschakeld is.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Een gewijzigde tekst uit git corrigeert die versie; `ask_again: true` vraagt iedereen die hem accepteerde opnieuw. Wie wat accepteerde, staat nooit in git.

### Gebruikers en groepen

Het item van een groep noemt haar lokale leden; het item van een gebruiker zegt niets over zijn groepen.

```yaml
controller_groups:
  - name: operators
    description: Run the daily forms
    users:
      - alice
      - bob
controller_users:
  - username: alice
    email: alice@example.com
  - username: bob
    email: bob@example.com
    password: ${BOB_PASSWORD}
  - username: jdoe
    type: ldap
    blocked: true
    description: Left on 2026-10-31
```

Het `password` van een lokale gebruiker is alleen een `${ENV}`-verwijzing, gehasht bij het lezen. Een gebruiker van een directory (`ldap`,
`entraid`, `oidc`) geeft alleen zijn `description` en `blocked`. De ingebouwde admin wordt nooit uit git gelezen of naar git geschreven.

### LDAP en SSO

De LDAP-directories en de SSO-providers zijn lijsten, elk met de inloggegevens waarmee het zich aanmeldt.

```yaml
controller_ldap:
  - name: main
    server: ldap.example.com
    credential: ldap-bind
    position: 1
controller_sso:
  - name: corp
    provider: entraid
    credential: corp-client
    enable: true
```

Het item met de naam `main` is de hoofddirectory, die nooit hernoemd of verwijderd wordt. `position` bewaart de zoekvolgorde.

### Repositories

Een repository kan de andere repositories bevatten, in het formaat van de items `repositories:` van de config seed.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

De repository die ze bevat, staat nooit in haar eigen bestanden, een item zet nooit `use_for_repositories`, en een gebruiker of een token in de
`uri` wordt geweigerd: noem in plaats daarvan inloggegevens. Een verwijderd item verwijdert zijn repository, tenzij die nog niet gepushte wijzigingen heeft.

### Inloggegevens, secret stores en databases

De inloggegevens worden eerst gelezen, daarna alles wat er een van noemt.

```yaml
controller_credentials:
  - name: git-bot
    credential_type: git
    user: bot
    password: ${GIT_BOT_TOKEN}
  - name: cmdb-login
    credential_type: database
    db_type: mysql
    host: db.example.com
    port: 3306
    user: svc_forms
    password: ${CMDB_PASSWORD}
controller_secret_stores:
  - name: vault
    type: vault
    credential: vault-login
controller_databases:
  - name: cmdb
    description: The CMDB
    credential: cmdb-login
```

Het item van inloggegevens verwijderen terwijl iets ze nog gebruikt, wordt geweigerd, wat de pull-uitvoer meldt.

### Runners

Een runner noemt zijn inloggegevens, van het type van de runner, en wacht zolang ze ontbreken.

```yaml
controller_runners:
  - name: rte-main
    type: rte
    rte_mode: outbound
    credential: rte-main
    rte_max_jobs: 4
    is_default: true
    enabled: true
```

Een runner die een RTE zelf registreerde, of een die op goedkeuring wacht, blijft in de app.

### SSH

De SSH-sleutel van de app en de hosts die ze vertrouwt, zijn één map, gelezen direct na de repositories, voordat die gekloond worden.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` is alleen een `${ENV}`-verwijzing en wordt nooit naar git geschreven: ontbreekt hij, dan houdt de app haar eigen sleutel. `known_hosts`
bevat één known_hosts-regel per server, en een lege lijst wist ze.

### Meldingen en syslog

De meldingskanalen en de syslog-servers zijn lijsten van items.

```yaml
controller_notifications:
  - name: mail
    type: mail
    credential: smtp-login
    from_address: ansibleforms@example.com
    is_active: true
  - name: ops-slack
    type: slack
    webhook_url: ${SLACK_WEBHOOK}
controller_syslog:
  - name: siem
    host: siem.example.com
    port: 6514
    protocol: tls4
    receives: audit
```

### Chat-assistent en MCP

De chat-assistent en de MCP-instellingen zijn elk één map.

```yaml
controller_chat_assistant:
  enable_chat: true
  provider: openai
  model: gpt-5
  api_key: ${CHAT_API_KEY}
  allow_job_status: false
controller_mcp:
  enable_mcp: true
  mcp_read_only: true
  mcp_chat_forms_only: false
```

`enable_chat` en de MCP-sleutels zijn namen van omgevingsvariabelen in kleine letters. Een variabele die in de echte omgeving is ingesteld, wordt nooit
geschreven, en een map die haar geeft, wordt geweigerd. `api_key` is alleen een `${ENV}`-verwijzing, of ontbreekt.

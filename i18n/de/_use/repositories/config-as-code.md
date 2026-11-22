---
layout: default
title: Konfiguration in git
parent: Git-Repositories
nav_order: 5
translated_from: 7d0beda8f50fb1602dd685827ccbf20eb3679501
---

# Konfiguration in git
{: .no_toc }

Jede Einstellung in einem git-Repository, in beide Richtungen gelesen und geschrieben
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Admins, die die Einstellungen, die Benutzer und die Verbindungen von AnsibleForms in git geprüft und versioniert haben möchten, seit 7.8.0.

---

## Die Verwendungstypen

Der Schritt **Verwendung** eines Repositorys, in seinem Assistenten und auf dem Tab **Verwendung** seiner Seite, sagt, was die App daraus übernimmt.

Die Typen sind unter sechs Überschriften gruppiert, jede mit der Zahl der Typen, die sie enthält, zum Beispiel **Designer (6)**. Jeder Typ hat sein
eigenes Kontrollkästchen und eine kurze Zeile, die sagt, was das Repository dafür enthält; das Kästchen einer Überschrift hakt jeden Typ dieser
Überschrift an oder ab, der angehakt werden kann.

| Überschrift | Verwendungstypen (Flag) |
|---|---|
| **Designer** | **Kategorien** (`use_for_categories`), **Konstanten** (`use_for_constants`), **Formulare** (`use_for_forms`), **Inventare** (`use_for_inventories`), **Playbooks** (`use_for_playbooks`), **Workflows** (`use_for_workflows`) |
| **Jobs** | **Zeitpläne** (`use_for_schedules`) |
| **System** | **Allgemein** (`use_for_general`) |
| **Erscheinungsbild** | **Standardwerte** (`use_for_defaults`), **Logo** (`use_for_logo`), **Symbol** (`use_for_icon`), **Name** (`use_for_name`), **Links** (`use_for_links`), **Labels** (`use_for_labels`), **Ankündigungen** (`use_for_announcements`) |
| **Zugriff** | **Haftungsausschluss** (`use_for_disclaimer`), **Benutzer** (`use_for_users`), **Gruppen** (`use_for_groups`), **Rollen** (`use_for_roles`), **LDAP** (`use_for_ldap`), **SSO** (`use_for_sso`) |
| **Verbindungen** | **Repositories** (`use_for_repositories`), **Anmeldedaten** (`use_for_credentials`), **Secret Stores** (`use_for_secret_stores`), **Datenbanken** (`use_for_databases`), **Runner** (`use_for_runners`), **SSH** (`use_for_ssh`), **Benachrichtigungen** (`use_for_notifications`), **Chat-Assistent** (`use_for_chat_assistant`), **MCP** (`use_for_mcp`), **Syslog** (`use_for_syslog`) |

**Formulare**, **Inventare** und **Workflows** dürfen bei mehreren Repositories angehakt sein. **Playbooks** kommen aus einem: Der Schritt
Verwendung graut sie bei den anderen aus, und der Server nimmt das erste mit einer Warnung. Jeder andere Typ gehört höchstens einem Repository, und
ein zweites wird von der API und vom Config-Seed abgelehnt. Ein Typ, den ein anderes Repository hält, erscheint grau angehakt und deaktiviert,
mit einem Tooltip, der dieses Repository nennt: `Bereits vom Repository „platform“ verwaltet`.

Einen Verwendungstyp ein- oder auszuschalten ist allein eine Änderung für Admins, wie die **URI** und der **Branch** (siehe
[Wer ein Repository ändern darf](adding.html#who-may-change-a-repository)).

---

## Wo ein Repository sie aufbewahrt

Ein Repository hält einen Typ in einer beliebigen YAML-Datei, mit beliebigem Namen in beliebigem Ordner: Der Schlüssel der obersten Ebene sagt, welchen Typ sie hält.

Dieser Schlüssel ist immer `controller_` und der Schlüssel des Typs: `controller_credentials:`, `controller_roles:`, `controller_defaults:`.
Jede `.yaml`- oder `.yml`-Datei des Repositorys wird betrachtet, in jeder Tiefe, versteckte Dateien und Ordner ausgenommen. Eine Datei kann
mehrere Typen enthalten, und ein Typ kann über viele Dateien verteilt sein.

| Schlüssel | Enthält |
|---|---|
| `controller_general:`, `controller_mcp:`, `controller_ssh:`, `controller_chat_assistant:`, `controller_defaults:`, `controller_logo:`, `controller_icon:`, `controller_name:`, `controller_links:` | eine Map, für das, wovon die App eines hat; höchstens eine Datei liefert sie |
| `controller_users:` | eine Liste von Benutzern, jeder an seinem `type` (lokal, wenn weggelassen) und seinem `username` erkannt |
| `controller_disclaimer:` | eine Liste von Versionen, jede an ihrer `version` erkannt |
| `controller_roles:`, `controller_categories:`, `controller_constants:` | die Rollen, die Kategorien und die Konstanten, in ihrem üblichen Format |
| jeder andere `controller_`-Schlüssel | eine Liste von Einträgen, jeder an seinem `name` erkannt |

Ein Objekt wird an seinem Namen innerhalb seines Typs erkannt, nie an seiner Datei: Ein in eine andere Datei verschobener Eintrag behält sein Objekt.
Ein einfacher Schlüssel (`credentials:`, das `roles:` einer Galaxy-Requirements-Datei, das `labels:` einer Variablendatei) gehört keinem Typ, und die
App liest oder schreibt ihn nie. Ein Formular ist nie die Datei eines Typs, und der Schlüssel eines Typs, für den das Repository nicht verwendet wird,
bleibt unberührt, mit einem Hinweis in der Pull-Ausgabe.

### Rollen, Kategorien und Konstanten

Diese drei behalten das Format von `config.yaml`, jetzt jeweils unter einem eigenen Schlüssel, in einem eigenen Verwendungstyp (je ein Repository).

Jeder wird aus der Datei seines Repositorys gelesen, die seinen Schlüssel auf oberster Ebene liefert, mit beliebigem Namen in beliebigem Ordner;
eine Datei kann alle drei liefern. Liefert keine Datei ihn, wird die `config.yaml` des Repositorys noch gelesen, mit ihren einfachen Schlüsseln
`roles:`, `categories:` und `constants:`: Das ist seit 7.8.0 veraltet und wird ab 8.0 nicht mehr gelesen, und das Serverprotokoll, die Pull-Ausgabe
und die Seite des Repositorys weisen darauf hin. Verschieben Sie jeden Schlüssel in eine eigene Datei, zum Beispiel `roles.yaml` mit `controller_roles:`.

Ein Schlüssel, den kein Repository hält, kommt wie bisher aus der Basiskonfiguration: ihrer Kopie in der Datenbank oder der Datei unter
[`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH). Den früheren Schalter **Für Konfiguration verwenden** gibt es nicht mehr: Eine
aktualisierte Instanz gibt **Rollen**, **Kategorien** und **Konstanten** dem Repository, das ihn hatte. Der Config-Seed, die Einträge
`controller_repositories:` eines Repositorys und die API nehmen `use_for_config` noch als veralteten Alias der drei an, mit einer Warnung.

---

## In beide Richtungen: git und die App

Ein Repository, das für einen Typ verwendet wird, wird in beide Richtungen mit der App abgeglichen; was läuft, bleibt die Datenbank der App.

| Richtung | Was passiert |
|---|---|
| Von git zur App | Nach jedem Pull, Clone oder Reset des Repositorys und beim Start des Servers werden seine Dateien eingelesen: Ein neuer Name legt ein Objekt an, ein geänderter Eintrag ändert es, ein entfernter Eintrag entfernt es |
| Von der App zu git | Ein Speichern in der App schreibt in die Datei des Eintrags zurück: nur die geänderten Felder, wobei Kommentare, andere Schlüssel und andere Einträge der Datei erhalten bleiben. Ein neues Objekt kommt ans Ende der ersten Datei mit dem Schlüssel des Typs, sonst in eine neu angelegte `<key>.yaml` im Stammverzeichnis (`credentials.yaml`); ein Löschen entfernt seinen Eintrag. Es wartet auf den **Push** des Repositorys |

Ein ungültiger Eintrag wird allein abgelehnt, mit seiner Stelle und dem Grund, und das Objekt seines Namens bleibt, wie es war. Ein Eintrag, der ein
noch nicht vorhandenes Objekt nennt (ein Runner und seine Anmeldedaten), wartet und wird erneut gelesen, wenn dieser Typ das nächste Mal gepullt wird.
Eine Umbenennung in git wird verfolgt, wenn ein Name eine Datei verlässt und ein neuer Name darin erscheint, während der Rest gleich bleibt.

### Eine Verwendung ein- oder ausschalten

Wird ein Repository mit einem ein- oder ausgeschalteten Typ gespeichert, fragt es zuerst nach und zeigt, was die Änderung bewirkt.

| Änderung | Frage | Was sie bewirkt |
|---|---|---|
| Ein | **Anmeldedaten einschalten**: `platform für Anmeldedaten verwenden?` | Das Repository wird gepullt und seine Einträge eingelesen; bei einem Namen, den beide haben, gewinnt git; die anderen Objekte der App werden ins Repository geschrieben, ohne ihre Geheimnisse, und warten auf **Push** |
| Aus | **Anmeldedaten ausschalten**: `platform nicht mehr für Anmeldedaten verwenden?` | Das Repository wird noch einmal gepullt, dann werden seine Objekte gelöst: Sie bleiben unverändert in der App, und die Dateien in git bleiben, wie sie sind |
| Mehrere | **Verwendung ändern**: `Ändern, wofür platform verwendet wird?` | Eine Frage, ein Abschnitt pro Typ, bestätigt mit **Verwendung speichern** |

Die Frage listet auch auf, was in der App bleibt: die Objekte des Config-Seeds, Runner, die ein RTE selbst registriert hat, und solche, die auf
Genehmigung warten. Eine Meldung sagt dann, was jeder Typ übernommen hat, zum Beispiel
`Anmeldedaten: 2 aus seinen Dateien gelesen, 3 ins Repository geschrieben (warten auf Push), 1 durch git ersetzt, 0 in dieser App behalten.`

### Was die Pull-Ausgabe sagt

**Ausgabe des letzten Pulls anzeigen** des Repositorys enthält nach der eigenen Ausgabe von git eine Zeile pro Typ.

```
Credentials: 1 created, 2 updated, 0 deleted, 5 unchanged, 1 refused
Refused connections.yaml#ops-api: password must be an ${ENV} reference: a secret is never written plain in git
Renamed prod-db to main-db (its secrets kept)
Not in git, their secrets kept from the database: smtp-login
```

Ein in einem Repository aufbewahrtes Objekt zeigt auf seiner Seite **Repository: platform** (den Namen seines Repositorys), mit der Datei seines Eintrags
im Tooltip. Ein Speichern schreibt diese Datei, und der **Push** des Repositorys sendet sie an git.

---

## Geheimnisse

Git enthält nie ein Geheimnis im Klartext: Ein geheimes Feld eines Eintrags ist nur ein `${ENV}`-Verweis, aus der Umgebung aufgelöst.

Passwörter, Tokens, Client-Secrets und Schlüssel werden als `${SEED_RTE_TOKEN}` geschrieben, wie im [Config-Seed](../seed/). Ein Eintrag mit einem
Geheimnis im Klartext oder mit einer Variablen, die nicht gesetzt ist, wird abgelehnt und in der Pull-Ausgabe genannt; ebenso eine Variable des
Servers selbst (`DB_*`, `ACCESS_TOKEN_*`, `ENCRYPTION_*`, `ADMIN_*` ...). Ein in einem Eintrag weggelassenes Geheimnis behält das aus der Datenbank
der App, und die App schreibt ihre eigenen Objekte ohne ihre Geheimnisse nach git.

Ein in der App eingegebenes Geheimnis für ein Objekt, dessen Eintrag es als `${ENV}`-Verweis liefert, wird abgelehnt: Ändern Sie die Variable oder
den Eintrag in git.

---

## Der Designer und diese Dateien

Der Designer hält sich aus den Dateien heraus, die den Verwendungstypen gehören, damit eine Formularänderung nie eine Einstellung ändert.

Er listet, liest, schreibt und löscht nie eine Datei, die den Schlüssel eines Typs liefert, den sein Repository hält, noch die Bilder, die eine solche
Datei nennt. Er lehnt es auch ab, eine Datei zu schreiben, deren Inhalt den Schlüssel eines Typs liefern würde, und das Laden der Formulare liest eine solche Datei nie als Formular.

---

## Jeder Typ, mit einem Beispiel

Die Einträge jedes Typs haben das Format des Config-Seeds, sodass ein Seed-Element und ein Repository-Eintrag austauschbar sind.

Die Dateinamen unten sind Beispiele: Jeder Name und jeder Ordner wäre ebenso möglich.

### Kategorien, Konstanten und Rollen

Die Kategorien und die Rollen sind Listen, die Konstanten eine Map, jede unter ihrem eigenen Schlüssel.

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

Jede Rolle wird für sich geprüft: Eine ungültige wird allein abgelehnt, und die anderen werden bereitgestellt. Die Rollen können über mehrere Dateien
verteilt sein und werden in der Reihenfolge ihrer Dateien bereitgestellt. Siehe [Rollen](../config/roles.html).

### Zeitpläne

Die Zeitpläne sind eine Liste `controller_schedules:`, jeder Eintrag nennt das Formular, das er ausführt, und wird durch genau eines von `cron`,
`rrule` oder `one_time_run` getaktet.

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

Die Jobs, die Benutzer mit „Später ausführen“ planen, bleiben in der App. Siehe [Zeitpläne](../jobs/schedules.html) für die Zeitangaben und die Eingaben.

### Allgemein

Die Einstellungen unter **Allgemein** sind eine Map, nach den Namen ihrer Umgebungsvariablen in Kleinbuchstaben.

```yaml
controller_general:
  job_retention_days: 30
  log_level: info
  metrics_token: ${METRICS_TOKEN}
```

Nur die Variablen, die die Seite Allgemein ändert, werden übernommen; ein Schlüssel in Großbuchstaben oder eine in der echten Umgebung gesetzte
Variable wird abgelehnt. Eine Variable, deren Name auf `_PASSWORD`, `_SECRET` oder `_TOKEN` endet, ist nur ein `${ENV}`-Verweis.

### Standardwerte, Logo, Symbol, Name und Links

Die Seiten des Erscheinungsbilds sind je eine Map, die enthält, was die Seite speichert.

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

Das Logo und das Symbol sind Bilder des Repositorys, relativ zu der Datei benannt, die sie nennt. Ein Feld, das der Config-Seed deklariert, bleibt
das des Seeds.

### Labels und Ankündigungen

Die Labels und die Ankündigungen sind Listen von Einträgen, jeder an seinem Namen erkannt.

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

Eine Ankündigung, deren Ende bereits vorbei ist, wird nicht importiert, was eine Zeile `Not imported` der Pull-Ausgabe meldet.

### Haftungsausschluss

Der Haftungsausschluss ist eine Liste von Versionen, jede an ihrer `version` erkannt, höchstens eine davon aktiviert.

```yaml
controller_disclaimer:
  - version: 2
    title: Terms of use
    text: Use this tool for your own team's systems only.
    checkbox_label: I agree
    enabled: true
    ask_again: true
```

Ein geänderter Text aus git korrigiert diese Version; `ask_again: true` fragt alle, die sie akzeptiert haben, erneut. Wer was akzeptiert hat, steht nie in git.

### Benutzer und Gruppen

Der Eintrag einer Gruppe listet ihre lokalen Mitglieder; der Eintrag eines Benutzers sagt nichts über seine Gruppen.

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

Das `password` eines lokalen Benutzers ist nur ein `${ENV}`-Verweis, beim Lesen gehasht. Ein Benutzer eines Verzeichnisses (`ldap`, `entraid`,
`oidc`) liefert nur seine `description` und `blocked`. Der eingebaute Admin wird nie aus git gelesen noch nach git geschrieben.

### LDAP und SSO

Die LDAP-Verzeichnisse und die SSO-Anbieter sind Listen, jeder Eintrag nennt die Anmeldedaten, mit denen er sich anmeldet.

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

Der Eintrag namens `main` ist das Hauptverzeichnis, das nie umbenannt oder gelöscht wird. `position` hält die Suchreihenfolge.

### Repositories

Ein Repository kann die anderen Repositories enthalten, im Format der Elemente `repositories:` des Config-Seeds.

```yaml
controller_repositories:
  - name: forms
    uri: https://git.example.com/forms.git
    branch: main
    credential: git-bot
    use_for_forms: true
    cron: "*/15 * * * *"
```

Das Repository, das sie enthält, steht nie in seinen eigenen Dateien, ein Eintrag setzt nie `use_for_repositories`, und ein Benutzer oder ein Token
in der `uri` wird abgelehnt: Nennen Sie stattdessen Anmeldedaten. Ein entfernter Eintrag löscht sein Repository, außer es hat noch nicht gepushte Änderungen.

### Anmeldedaten, Secret Stores und Datenbanken

Die Anmeldedaten werden zuerst gelesen, dann alles, was eine davon nennt.

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

Den Eintrag von Anmeldedaten zu entfernen, die noch etwas verwendet, wird abgelehnt, was die Pull-Ausgabe meldet.

### Runner

Ein Runner nennt seine Anmeldedaten, vom Typ des Runners, und wartet, solange sie fehlen.

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

Ein Runner, den ein RTE selbst registriert hat, oder einer, der auf Genehmigung wartet, bleibt in der App.

### SSH

Der SSH-Schlüssel der App und die Hosts, denen sie vertraut, sind eine Map, direkt nach den Repositories gelesen, bevor diese geklont werden.

```yaml
controller_ssh:
  private_key: ${SSH_PRIVATE_KEY}
  known_hosts:
    - git.example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
```

`private_key` ist nur ein `${ENV}`-Verweis und wird nie nach git geschrieben: Wird er weggelassen, behält die App ihren eigenen. `known_hosts` enthält
eine known_hosts-Zeile pro Server, und eine leere Liste löscht sie.

### Benachrichtigungen und Syslog

Die Benachrichtigungskanäle und die Syslog-Server sind Listen von Einträgen.

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

### Chat-Assistent und MCP

Der Chat-Assistent und die MCP-Einstellungen sind je eine Map.

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

`enable_chat` und die MCP-Schlüssel sind Namen von Umgebungsvariablen in Kleinbuchstaben. Eine in der echten Umgebung gesetzte Variable wird nie
geschrieben, und eine Map, die sie liefert, wird abgelehnt. `api_key` ist nur ein `${ENV}`-Verweis oder wird weggelassen.

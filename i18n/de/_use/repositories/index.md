---
layout: default
title: Git-Repositories
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 5595dcc0c5adf343f1f347feef0f5586f0312a4b
---

# Git-Repositories
{: .no_toc }

Formulare, Playbooks, Einstellungen und Verbindungen in git aufbewahren
{: .fs-6 .fw-300 }

---

Für Admins, die Formulare, Playbooks und die Konfiguration der App in git aufbewahren: was ein Repository enthalten kann und welche Quelle Vorrang hat.

---

## Wofür ein Repository da ist

Ein Repository ist ein git-Remote, das AnsibleForms klont und aktuell hält, und seine Verwendungstypen sagen, was die App daraus übernimmt.

Seit 7.8.0 listet der Schritt **Verwendung** eines Repositorys die Verwendungstypen unter sechs Überschriften auf: **Designer**, **Jobs**, **System**,
**Erscheinungsbild**, **Zugriff** und **Verbindungen**. Die Typen unter **Designer** sind Dateien, die die App so liest, wie sie sind:

| Verwendungstyp | Was AnsibleForms daraus liest | Wo im Repository |
|---|---|---|
| **Formulare** | Die Formulardateien, die der Designer auch dorthin zurückspeichert, und ihre Variablendateien | `forms` oder das Stammverzeichnis; Variablendateien in `vars` |
| **Playbooks** | Die Ansible-Playbooks, die Jobs ausführen | `playbooks` oder das Stammverzeichnis |
| **Workflows** | Die [Workflow](../workflows/)-Dateien, die der Designer auch dorthin zurückspeichert | jeder Ordner |
| **Inventare** | Ein Inventar, nach dem Repository benannt, das ein Formular mit `inventory:` nennt | das Stammverzeichnis: `inventory.yaml`, `group_vars`, `host_vars` |
| **Kategorien**, **Konstanten** | Die Kategorien und die Konstanten, die der Designer auch in ihre Datei zurückspeichert | die Datei mit `controller_categories:` oder `controller_constants:` |

Jeder andere Typ hält Einstellungen, Benutzer oder Verbindungen der App in YAML-Dateien, in beide Richtungen gelesen und geschrieben: die Zeitpläne,
die Einstellungen unter Allgemein, die Seiten des Erscheinungsbilds, die Benutzer, Gruppen und Rollen, die Anmeldungen, die Anmeldedaten, die Runner und
die anderen Verbindungen. Sie sind in [Konfiguration in git](config-as-code.html) beschrieben.

**Formulare**, **Playbooks**, **Workflows** und **Inventare** dürfen bei mehreren Repositories angehakt sein, jeder andere Typ
bei höchstens einem Repository. Ein Formular führt die Playbooks des ersten **Playbooks**-Repositorys aus, außer es nennt mit
`playbookRepository` sein eigenes. Jedes Repository wird in einen nach ihm benannten Unterordner unter
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH) geklont.

Der Schalter **Für Konfiguration verwenden?** von vor 7.8.0 ist durch **Rollen**, **Kategorien** und **Konstanten** ersetzt, jeweils aus der
Datei mit ihrem Schlüssel gelesen; die `config.yaml` eines Repositorys wird noch gelesen, veraltet (siehe
[Rollen, Kategorien und Konstanten](config-as-code.html#roles-categories-and-constants)).

### Ein Repository für alles

Ein einzelnes Repository kann Formulare, Variablendateien, Konfiguration und Playbooks enthalten, mit angehakten Verwendungstypen und einem Unterordner pro Art.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Ein Repository pro Zweck

Getrennte Repositories lassen Teams ihren Teil besitzen, jedes mit seinen eigenen Verwendungstypen und den Dateien direkt im Stammverzeichnis.

| Repository | Verwendungstypen | Inhalt im Stammverzeichnis |
|---|---|---|
| `af-platform` | **Rollen**, **Kategorien**, **Konstanten**, **Anmeldedaten**, **Runner** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formulare** | Die Formulardateien jedes Teams, zu einer Liste zusammengeführt |
| `af-playbooks` | **Playbooks** | Die Playbooks und Rollen |

Die Variablendateien kommen aus dem Ordner `vars` des ersten Formular-Repositorys, das einen hat.

---

## Wie Repositories mit lokalen Ordnern zusammenspielen

Der Inhalt eines Repositorys ersetzt den passenden lokalen Ordner; diese Tabelle fasst zusammen, woher jede Dateiart gelesen wird.

| Inhalt | Gelesen aus, der erste Treffer gewinnt |
|---|---|
| Rollen, Kategorien, Konstanten | Jeder Schlüssel für sich: 1. die Datei mit `controller_roles:`, `controller_categories:` oder `controller_constants:` im Repository mit diesem Verwendungstyp <br> 2. die `config.yaml` dieses Repositorys (veraltet) <br> 3. die Basiskonfiguration: die Datenbank, wenn die Konfiguration dort gehalten wird ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), sonst [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulare | Jedes Repository mit **Formulare** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) nur, wenn es keines gibt |
| Playbooks | Das Repository mit **Playbooks**, sonst [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Variablendateien | Der Ordner `vars` des ersten Repositorys mit **Formulare**, das einen hat, sonst [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Jedes Repository mit **Workflows** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), zusammen |

Formulare aus mehreren Repositories werden in der Reihenfolge gelesen, in der die Repositories hinzugefügt wurden. Enthalten zwei davon ein Formular mit
demselben Namen, wird die Kopie des zuerst hinzugefügten Repositorys verwendet, und eine Warnung nennt beide Kopien; halten Sie Formularnamen also über alle Repositories hinweg eindeutig.

---

## Fehlerbehebung

Die meisten Probleme zeigen sich in der Spalte **Pull** und in **Ausgabe des letzten Pulls anzeigen** (oder **Ausgabe des letzten Pushs anzeigen**), die die eigene
Fehlermeldung von git enthalten.

- [Ein Clone oder Pull eines Repositorys ist fehlgeschlagen](../troubleshooting.html#a-repository-clone-or-pull-failed): Authentifizierung, bekannte
  Hosts und lokale Änderungen.
- [Das Formular-Repository ist noch nicht geklont](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): Der Designer
  kann vor dem ersten Clone nicht speichern.
- Ein Repository, das in `running` hängt, wird auf `failed` zurückgesetzt: nach einem Neustart beim nächsten Start; innerhalb einer Minute, sobald der Knoten,
  der seine git-Operation ausführt, seit 2 Minuten nicht mehr antwortet; und in jedem Fall nach 2 Stunden. Führen Sie **Pull** erneut aus.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Ein Repository hinzufügen](adding.html) | Die Seite Repositories, jedes Feld eines Repositorys, und eines im Config-Seed deklarieren |
| [Authentifizierung](authentication.html) | HTTPS mit einem Token, SSH mit dem erzeugten Schlüssel und eigene git-Befehle |
| [Änderungen pullen](pulling.html) | Geplante, manuelle und API-Pulls, und lokale Änderungen |
| [Designer und Push](designer.html) | Formulare im Designer bearbeiten und ins Repository pushen |
| [Konfiguration in git](config-as-code.html) | Jede Einstellung in einem git-Repository aufbewahrt, in beide Richtungen gelesen und geschrieben |

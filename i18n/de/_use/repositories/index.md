---
layout: default
title: Git-Repositories
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Git-Repositories
{: .no_toc }

Formulare, Variablendateien, Konfiguration und Playbooks in git aufbewahren
{: .fs-6 .fw-300 }

---

Für Admins, die Formulare, Konfiguration und Playbooks in git aufbewahren: was ein Repository enthalten kann und welche Quelle Vorrang hat.

---

## Wofür ein Repository da ist

Ein Repository ist ein git-Remote, das AnsibleForms klont und aktuell hält, und jedes hat Schalter, die sagen, was es enthält:

| Schalter | Was AnsibleForms daraus liest | Ordner im Repository |
|---|---|---|
| **Für Konfiguration verwenden?** | `config.yaml` mit den Kategorien, Rollen und Konstanten | das Stammverzeichnis |
| **Für Formulare verwenden?** | Die Formulardateien, die der Designer auch dorthin zurückspeichert, und ihre Variablendateien | `forms` oder das Stammverzeichnis; Variablendateien in `vars` |
| **Für Playbooks verwenden?** | Die Ansible-Playbooks, die Jobs ausführen | `playbooks` oder das Stammverzeichnis |
| **Für Workflows verwenden?** | Die [Workflow](../workflows/)-Dateien, die der Designer auch dorthin zurückspeichert | jeder Ordner |
| **Für Inventare verwenden?** | Ein Inventar, nach dem Repository benannt, das ein Formular mit `inventory:` nennt | das Stammverzeichnis: `inventory.yaml`, `group_vars`, `host_vars` |

Ohne den Unterordner wird das Stammverzeichnis des Repositorys verwendet. Ein Repository kann alles enthalten; wenn Sie aufteilen, dürfen nur **Für
Formulare verwenden**, **Für Workflows verwenden** und **Für Inventare verwenden** bei mehreren eingeschaltet sein: Die anderen Schalter nehmen das erste Repository
und protokollieren eine Warnung.

Jedes Repository wird in einen nach ihm benannten Unterordner unter [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) geklont.

### Ein Repository für alles

Ein einzelnes Repository kann Formulare, Variablendateien, Konfiguration und Playbooks enthalten, mit eingeschalteten Schaltern und einem Unterordner pro Art.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Ein Repository pro Zweck

Getrennte Repositories lassen Teams ihren Teil besitzen, mit je einem Schalter und den Dateien direkt im Stammverzeichnis.

| Repository | Schalter | Inhalt im Stammverzeichnis |
|---|---|---|
| `af-config` | **Für Konfiguration verwenden?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Für Formulare verwenden?** | Die Formulardateien jedes Teams, zu einer Liste zusammengeführt |
| `af-playbooks` | **Für Playbooks verwenden?** | Die Playbooks und Rollen |

Nur Formulare können aus mehreren Repositories kommen; Konfiguration und Playbooks kommen jeweils aus einem. Die Variablendateien kommen aus dem Ordner `vars`
des ersten Formular-Repositorys, das einen hat.

---

## Wie Repositories mit lokalen Ordnern zusammenspielen

Der Inhalt eines Repositorys ersetzt den passenden lokalen Ordner; diese Tabelle fasst zusammen, woher jede Dateiart gelesen wird.

| Inhalt | Gelesen aus, der erste Treffer gewinnt |
|---|---|
| Konfiguration | 1. der Datenbank, wenn die Konfiguration dort gehalten wird ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` des Repositorys **Für Konfiguration verwenden** <br> 3. `config.yaml` eines Repositorys **Für Formulare verwenden**, wenn kein Repository für die Konfiguration verwendet wird <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formulare | Jedes Repository **Für Formulare verwenden** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) nur, wenn es keines gibt |
| Playbooks | Das Repository **Für Playbooks verwenden**, sonst [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Variablendateien | Der Ordner `vars` des ersten Repositorys **Für Formulare verwenden**, das einen hat, sonst [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflows | Jedes Repository **Für Workflows verwenden** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), zusammen |

Formulare aus mehreren Repositories werden zu einer Liste zusammengeführt. Enthalten zwei davon ein Formular mit demselben Namen, wird das zuerst
geladene behalten und die Warnung `skipping duplicate form <name>` protokolliert; halten Sie Formularnamen also über alle Repositories hinweg eindeutig.

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

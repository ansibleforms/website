---
layout: default
title: Rollen
parent: config.yaml
nav_order: 2
translated_from: 204f9e089bcb7000e0be4712ad4590ad3b3fd74b
---

# Rollen
{: .no_toc }

Ordnen Sie Benutzer und Gruppen Rollen zu, und legen Sie fest, was jede Rolle darf.
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Das Attribut roles

Die Liste `roles` auf oberster Ebene von config.yaml:

{% include config_attribute.html name="roles" %}

---

## Die Rolle default

Jeder angemeldete Benutzer hat die Rolle `default`, daher steht ein Formular mit `roles: [default]` jedem offen, der sich anmelden kann. Es
gibt keinen anonymen Zugriff: Niemand erhält diese Rolle, ohne sich anzumelden.

Die Rolle enthält keine Gruppen und keine Benutzer, da sie bereits für alle gilt. Ihre `options` sind die Standardwerte für alle, wie
unten unter [Rollenoptionen](#role-options) beschrieben. `config.yaml` muss eine Rolle `admin` und eine Rolle `default` enthalten, und die
Rollenseite zeigt beide als **Erforderlich**.

`default` hieß vor 7.0.0 `public`, und der alte Name funktioniert weiterhin:

- **In einem Formular** passt `roles: [public]` weiterhin zu jedem Benutzer, daher müssen die Formulare in Ihren Repositories nicht geändert werden.
- **In `config.yaml`** wird eine Rolle namens `public` beim Laden der Konfiguration in der Datei in `default` umbenannt. Nur der Name
  ändert sich, vorher wird eine Sicherung der Konfiguration angelegt, und eine in einem Repository gehaltene Konfiguration hat danach eine Änderung zum Pushen.
- **In einem ytt-Template** wird das Template nicht umgeschrieben: Die daraus erzeugte Konfiguration wird umbenannt, und eine Warnung im Protokoll bittet
  Sie, die Rolle auch im Template umzubenennen. Version 8 weist dort eine Rolle `public` ab.

Eine Konfiguration mit sowohl einer Rolle `default` als auch einer Rolle `public` wird abgewiesen, da es dieselbe Rolle ist.

---

## Das Objekt Role

Jeder Eintrag der Liste `roles`:

{% include config_object.html name="Role" %}

---

## Rollenoptionen

Die `options` einer Rolle schalten Funktionen für ihre Mitglieder ein oder aus. Ab 7.3.0 zeigt die Seite der Rolle sie in vier Gruppen,
jede Option mit einem (i), das sagt, was sie gewährt, derselbe Text, den die Ansicht **Berechtigungen** des Profils zeigt:

| Option | Erlaubt dem Benutzer | Standard |
|---|---|---|
| **Einstellungen** | | |
| `showSettings` | Jede Einstellungsseite sehen und ändern; das Serverprotokoll und die Backups haben eigene Optionen | Nur Admins |
| `showAppearanceSettings` | Die Erscheinungsbild-Einstellungen ändern, ohne die übrigen Einstellungen (ab 7.3.0) | Aus |
| `showConnectionsSettings` | Die Verbindungs-Einstellungen verwalten (Anmeldedaten, Runner und mehr), ohne die übrigen Einstellungen (ab 7.3.0) | Aus |
| `showLogs` | Das Serverprotokoll sehen | Nur Admins |
| `showAuditLog` | Das Audit-Protokoll sehen, ohne die übrigen Einstellungen (ab 7.3.0) | Nur Admins |
| `allowBackupOps` | Die Datenbank sichern und wiederherstellen | Nur Admins |
| **Designer** | | |
| `showDesigner` | Den Designer sehen und verwenden | Nur Admins |
| `allowFormDesign` | Die Formularkonfiguration im Designer bearbeiten: Kategorien, Konstanten und Formulare. Ohne sie nur lesen (ab 7.3.0) | Ein |
| `designAllForms` | Jedes Formular im Designer sehen und bearbeiten. Ohne sie nur die Formulare der Rollen des Benutzers (ab 7.5.0) | Ein |
| `allowPlaybookDesign` | Die Playbooks im Designer bearbeiten: speichern, erstellen, entfernen und pushen. Ohne sie nur lesen | Ein |
| `designAllPlaybooks` | Jedes Playbook im Designer sehen und bearbeiten. Ohne sie nur die, die die Formulare des Benutzers verwenden oder noch kein Formular verwendet (ab 7.5.0) | Ein |
| `allowWorkflowDesign` | Die Workflows im Designer bearbeiten: speichern, erstellen, entfernen und pushen. Ohne sie nur lesen | Ein |
| `designAllWorkflows` | Jeden Workflow im Designer sehen und bearbeiten. Ohne sie nur die, die die Formulare des Benutzers verwenden oder noch kein Formular verwendet (ab 7.5.0) | Ein |
| `allowInventoryDesign` | Die Inventare im Designer bearbeiten: speichern, erstellen, entfernen und pushen. Ohne sie nur lesen | Ein |
| `allowVarsFileDesign` | Die Variablendateien im Designer bearbeiten: speichern, erstellen, entfernen und pushen. Ohne sie nur lesen | Ein |
| **Jobs** | | |
| `showJobs` | Die Seite Jobs sehen | Ein |
| `showAllJobLogs` | Die Jobs jedes Benutzers sehen, nicht nur die eigenen | Nur Admins |
| `manageAllJobs` | Die Jobs jedes Benutzers abbrechen, löschen und neu starten; Löschen und Neustarten brauchen zusätzlich die beiden Optionen unten (ab 7.3.0) | Nur Admins |
| `showExtravars` | Die Extravars eines Formulars und eines Jobs sehen | Ein |
| `showDebugButtons` | Die Debug-Buttons eines Formulars sehen | Ein |
| `showArtifacts` | Die Artefakte eines Jobs sehen: was ein AWX-Job zurückgibt oder was ein Playbook mit `set_stats` gesammelt hat | Ein |
| `allowVerboseMode` | Jobs im ausführlichen Modus ausführen | Ein |
| `allowJobRelaunch` | Einen Job mit den Formulardaten eines früheren Laufs neu starten | Nur Admins |
| `allowJobDeletion` | Jobs löschen: die eigenen oder mit `manageAllJobs` die aller Benutzer. Ohne sie bleibt der Job-Verlauf vollständig (ab 7.3.0) | Ein |
| `allowScheduledJobs` | Wiederkehrende und einmalige Zeitpläne erstellen und verwalten, auf der Seite **Zeitpläne** (siehe die Warnung unten) | Nur Admins |
| `allowPlannedJobs` | Einen Job einplanen, der einmal zu einer festgelegten Zeit läuft (**Später ausführen**) | Ein |
| `allowStoredJobs` | Die Daten eines Formulars speichern und später wieder laden | Ein |
| **Zugang und Integrationen** | | |
| `allowLogin` | Sich bei AnsibleForms anmelden | Ein |
| `allowChat` | Den [Chat-Assistenten](../chat/) verwenden, wenn er aktiviert ist | Ein |
| `allowMcp` | Den [MCP-Server](../mcp/) von einem KI-Agenten aus verwenden, wenn er aktiviert ist | `allowChat` der Rolle |
| `allowFileUploads` | Dateien über die Dateifelder eines Formulars hochladen (ab 7.3.0) | Ein |
| `allowApiTokens` | [API-Token](../profile/api-token.html) für Skripte erstellen, bis zur längsten Laufzeit, die die Instanz erlaubt (ab 7.3.0) | Aus |
| `extendedTokenExpiration` | Auch API-Token erstellen, die nie ablaufen; erfordert `allowApiTokens` | Aus |

Manche Optionen schließen andere ein, und die Seite der Rolle zeigt die eingeschlossenen eingeschaltet und ausgegraut:

- **`showSettings`** gewährt auch `showAppearanceSettings`, `showConnectionsSettings` und `showAuditLog`.
- **`manageAllJobs`** gewährt auch `showAllJobLogs`, da man die Jobs jedes Benutzers sehen muss, um mit ihnen zu arbeiten.
- **Die Design-Optionen** zählen nur mit `showDesigner`, und `extendedTokenExpiration` nur mit `allowApiTokens`.

Bis 7.2.0 ließ `showAllJobLogs` einen Benutzer auch die angezeigten Jobs abbrechen und löschen; ab 7.3.0 braucht das `manageAllJobs`.
Eine Rolle aus der Zeit vor 7.3.0 mit `extendedTokenExpiration` und ohne `allowApiTokens` erhält `allowApiTokens`, sodass sie ihre Token behält.

`designAllForms`, `designAllPlaybooks` und `designAllWorkflows` sind für Admins immer eingeschaltet, und was der Designer einem Benutzer
ohne sie zeigt, beschreibt [Eingeschränkte Designer](../designer/#limited-designers).

**Nur Admins** bedeutet eingeschaltet für Benutzer mit der Rolle `admin` und ausgeschaltet für alle anderen. Passt ein Benutzer zu mehreren Rollen,
werden die Optionen wie folgt kombiniert:

- **Zwischen den Rollen des Benutzers** ist eine Option nur eingeschaltet, wenn jede Rolle, die sie setzt, zustimmt: Ein explizites `false` gewinnt.
- **Die Rolle `default`** ergänzt die Optionen, die keine der anderen Rollen des Benutzers setzt, und kann so Standardwerte für alle enthalten.
- **Nirgends gesetzte Optionen** übernehmen den Standard aus der Tabelle.

`showExtraVars` mit großem V wird als andere Schreibweise von `showExtravars` akzeptiert; ist eine der beiden Schreibweisen `false`, ist die
Option ausgeschaltet.

{: .warning }
> Behandeln Sie `allowScheduledJobs` als Option auf Admin-Ebene. Zeitpläne gehören nicht dem Benutzer, der sie erstellt hat: Jeder Benutzer mit
> der Option sieht alle Zeitpläne und kann sie ändern. Ein Zeitplan läuft außerdem mit Admin-Rechten, für jedes Formular, unabhängig von den
> eigenen Zugriffsrechten des Erstellers. Gewähren Sie sie nur Rollen, denen Sie wie Admins vertrauen würden.

{: .warning }
> `allowLogin: false` auf der Rolle `default` sperrt jeden Benutzer aus, dessen andere Rollen nicht `allowLogin: true` setzen, einschließlich
> der Admins. Gewähren Sie sie den Rollen, die sich anmelden müssen, wieder, bevor Sie speichern.

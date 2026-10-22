---
layout: default
title: Jobs
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Jobs
{: .no_toc }

Die Jobs, die Ihre Formulare starten, verfolgen, abbrechen, neu starten, genehmigen und löschen
{: .fs-6 .fw-300 }

---

Für alle, die Formulare starten: was ein Job ist, wo Sie ihn finden und wer ihn sehen kann.

---

## Was ein Job ist

Ein Job ist ein Lauf eines Formulars: AnsibleForms zeichnet ihn mit Status, Extravars und Ausgabe auf, sobald das Formular abgesendet wird.

Jeder Job enthält:

* das **Formular**, das er ausgeführt hat, und den **Benutzer**, der ihn gestartet hat (mit dem Benutzertyp, etwa `local` oder `ldap`);
* seinen **Job-Typ** und **Status** sowie seine **Startzeit** und **Endzeit**;
* seine **Ausgabe**, die Extravars und Zugangsdaten, mit denen er lief, und die im Formular eingegebenen Feldwerte.

Ein mehrstufiges Formular erstellt einen Job für das Formular und einen Job pro Schritt. Die Schritte sind mit dem Hauptjob verknüpft und werden darunter aufgelistet.

Dieselben Jobs lassen sich über die [REST-API](../api/jobs.html) starten, verfolgen und verwalten.

---

## Die Seite Jobs

Der Link **Jobs** im Kopfbereich öffnet die Liste aller Jobs, die neuesten zuerst (`/jobs/all`). Die Seite und ihr Link werden Benutzern angezeigt,
deren Rolle die [Rollenoption](../config/roles.html#role-options) `showJobs` setzt.

![Die Jobliste](../assets/screenshots/job-log.jpg)

Das linke Menü ordnet die Jobs zeitlich, mit der Anzahl der Jobs in jedem Eintrag; ein Statuseintrag filtert die Liste nach diesem Status:

| Abschnitt | Menüeintrag | Zeigt |
|---|---|---|
| **Vergangenheit** | **Erfolgreich** | Jobs mit Status `success` |
| | **Fehlgeschlagen** | Jobs mit Status `failed` |
| | **Abgebrochen** | Jobs mit Status `aborted` |
| | **Abgelehnt** | Jobs mit Status `rejected` |
| | **Verwaist** | Jobs mit Status `abandoned` |
| **Gegenwart** | **Läuft** | Jobs mit Status `running` |
| | **Wartet auf Genehmigung** | Jobs mit Status `approve`; die Anzahl wird orange, wenn einer wartet |
| **Zukunft** | **Geplant** | Die Seite [Zeitpläne](schedules.html) (Rollenoption `allowScheduledJobs`) |
| | **Gespeichert** | Die Seite [Gespeicherte Jobs](stored-jobs.html) (Rollenoption `allowStoredJobs`) |

Das Menü hat keinen Eintrag für alle Jobs: Der Link **Jobs** im Kopfbereich zeigt sie alle, auch die `warning`-Jobs.

Über der Tabelle, in der Titelzeile:

* das **Suchfeld** behält die Jobs, deren angezeigte Spalten den Text enthalten (ohne Beachtung der Groß- und Kleinschreibung), oder bei denen einer der Schritte ihn als ID
  oder Ziel hat;
* **Löschen** (mit der Anzahl der markierten Jobs) löscht die in der ersten Spalte markierten Jobs gemeinsam;
* **Spalten** blendet die Spalten `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` und `user` ein oder aus;
  die Dauer eines laufenden Jobs zählt hoch;
* **Aktualisieren** lädt die Liste neu.

Die Liste lädt die neuesten Jobs, so viele, wie die Einstellung [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) angibt
(**Einstellungen > System > Allgemein**, Tab **Jobs**, standardmäßig `1000`); ihre Seiten, Suche und Filter beziehen sich auf diese Jobs.

Jede Spalte lässt sich sortieren und hat ein eigenes Filterfeld. Ein Multistep-Job hat direkt vor seinem `form` einen Pfeil, der
seine Schritte aufklappt; ein Klick auf den Rest einer Zeile öffnet den Job.

Die Glocke im Kopfbereich zählt die Jobs, die auf Ihre Genehmigung warten, und öffnet die Liste bei **Wartet auf Genehmigung**. Für die Benutzer, die
die Runner sehen können, zählt sie auch die [Runner, die auf Freigabe warten](../runners/registration.html#approving-an-rte), also RTEs, die beitreten wollen,
und öffnet **Verbindungen > Runner**, wenn nur Runner warten. Warten beide, öffnet sie ein Menü, **Jobs warten auf Freigabe** und
**Runner warten auf Freigabe**, jeweils mit ihrer Anzahl.

---

## Wer welche Jobs sieht

Welche Jobs ein Benutzer sieht, hängt von seinen Rollen ab:

| Benutzer | Sieht |
|---|---|
| Admin (Rolle `admin`) | Jeden Job |
| Rollenoption `showAllJobLogs` | Jeden Job |
| Rollenoption `manageAllJobs` (ab 7.3.0) | Jeden Job, und darf ihn abbrechen, löschen und neu starten |
| Jeder andere Benutzer | Seine eigenen Jobs und die Jobs, die auf eine Genehmigung warten, die eine seiner Rollen nennt |

Bis 7.2 konnte jeder Benutzer jeden Job öffnen, der auf eine Genehmigung wartete, einschließlich Extravars und Ausgabe; ab 7.3.0 können das nur sein Besitzer und seine
Genehmiger. Einen Job zu sehen, erlaubt nicht jede Aktion darauf: Den Job eines anderen Benutzers abzubrechen, zu löschen und neu zu starten, erfordert einen Admin oder
`manageAllJobs`, und `showAllJobLogs` zeigt die Jobs nur an. Löschen braucht außerdem `allowJobDeletion` und Neustarten `allowJobRelaunch`.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Status und Typen](statuses.html) | Jeder Status, den ein Job haben kann, und die Arten von Jobs |
| [Einen Job verfolgen](following.html) | Live-Ausgabe, Extravars, Filter und Downloads |
| [Job-Aktionen](actions.html) | Einen Job starten, abbrechen, neu starten, genehmigen oder ablehnen und löschen |
| [Zeitpläne](schedules.html) | Ein Formular später oder nach einem Cron-Zeitplan ausführen, und alle Zeitpläne verwalten |
| [Gespeicherte Jobs](stored-jobs.html) | Die Daten eines Formulars aufbewahren, um sie später wieder zu laden |
| [Bereinigung](cleanup.html) | Durch einen Neustart abgeschnittene Jobs, und wie lange beendete Jobs aufbewahrt werden |

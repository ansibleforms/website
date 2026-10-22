---
layout: default
title: Neustarten
parent: Start-Validierung
nav_order: 6
translated_from: 9f52ec39fd40e3d617d9537c5f7d356033bc9d49
---

# Neustarten
{: .no_toc }

Wie ein neu gestarteter Job validiert wird
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ein Job kann auf zwei Arten neu gestartet werden. Wie der Neustart geprüft wird, hängt davon ab, welche es ist, und vom Modus der
Start-Validierung.

---

## Zwei Arten des Neustarts

Die beiden Arten unterscheiden sich darin, ob der Aufrufer neue Werte sendet:

* **Wie gelaufen**: die Schaltfläche Neu starten, `POST /api/v2/job/{id}/relaunch` ohne Body oder `relaunch_job` ohne
  `values`.
* **Mit Änderungen**: dieselben Aufrufe mit neuen Werten, die über die gespeicherten Feldwerte des Jobs gelegt werden:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Wie jede geprüft wird

Der Modus der Start-Validierung entscheidet, ob ein Neustart wiederholt oder erneut geprüft wird:

| Neustart | `off` / `log` | `enforce` |
|---|---|---|
| **Wie gelaufen** | wiederholt die gespeicherten Extravars des Jobs, Passwörter inklusive | die vollständige Prüfung, aus den gespeicherten Feldwerten |
| **Mit Änderungen** | die vollständige Prüfung, auf den gespeicherten Werten mit den darübergelegten Änderungen | die vollständige Prüfung, auf dieselbe Weise |

Eine Ausnahme unter `enforce`: Ein Job, den ein Zeitplan auf Admin-Ebene gestartet hat, hat keine eigenen Feldwerte, daher wiederholt ein Neustart wie gelaufen
die gespeicherten Extravars des Zeitplans, für einen Admin oder einen Benutzer mit der Rollenoption `allowScheduledJobs`.

Ein geprüfter Neustart (siehe [Log und Enforce](log-and-enforce.html)) startet einen neuen Job unter dem Namen des Aufrufers.

---

## Passwortfelder

Gespeicherte Feldwerte enthalten keine Passwörter, daher hat ein geprüfter Neustart keines für ein **sichtbares Passwortfeld**:

* Der Neustart wird als `unsupported` abgelehnt, mit den fehlenden `passwordFields`.
* Starten Sie das Formular erneut und geben Sie das Passwort ein.
* Ein Passwortfeld, das die Abhängigkeiten des Formulars **ausblenden**, wird nicht gebraucht und blockiert den Neustart nicht.

Unter `enforce` gilt das auch für die Schaltfläche Neu starten.

---

## Wer neu starten darf

Beide Arten des Neustarts setzen voraus:

* dass das Formular Neustarts erlaubt (`allowRelaunch`, standardmäßig true);
* die Rollenoption `allowJobRelaunch`;
* dass der Benutzer **der Besitzer des Jobs** ist, ein Admin oder ein Benutzer mit der Rollenoption `manageAllJobs`.

Alle Jobs sehen zu dürfen (`showAllJobLogs`) reicht nicht, um den Job eines anderen Benutzers neu zu starten. Genehmiger können einen Job sehen, der auf ihre
Genehmigung wartet, ihn aber ebenfalls nicht neu starten.

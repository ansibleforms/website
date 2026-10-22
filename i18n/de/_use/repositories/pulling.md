---
layout: default
title: Änderungen pullen
parent: Git-Repositories
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Änderungen pullen
{: .no_toc }

Geplante, manuelle und API-Pulls, und lokale Änderungen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Änderungen pullen

Ein Repository wird nach seinem Zeitplan, beim Start, von der Seite aus oder über die API gepullt; es gibt keinen Webhook-Endpunkt.

| Auslöser | Wie |
|---|---|
| Zeitplan | **Geplanten Pull aktivieren** und ein **Pull-Zeitplan**, zum Beispiel `0 * * * *` für jede Stunde |
| Start | **Beim Start der App pullen** klont das Repository oder pullt es, wenn es schon geklont ist |
| Einstellungsseite | **Pull** im Zeilenmenü oder **Alle pullen** über der Liste |
| Designer | **Laden (Repository)**, das die Formular-Repositories pullt und den Designer neu lädt; auch das Übernehmen der Designer-Sperre pullt zuerst jedes Formular-Repository |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` oder `showConnectionsSettings`) oder `POST /api/v2/forms-repos/pull/<name>` (siehe unten) |

### Aus einer Pipeline oder einem Webhook pullen

AnsibleForms hat keinen eigenen Webhook-Empfänger, aber ein CI-Job oder ein Webhook des git-Servers kann den Pull-Endpunkt aufrufen.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Erstellen Sie das Token wie unter [API-Tokens](../profile/api-token.html) beschrieben, für einen Benutzer, dessen Rolle `showSettings` oder
`showConnectionsSettings` hat. `/api/v2/forms-repos/pull/<name>` braucht stattdessen `showDesigner` und `allowFormDesign`, bei eingeschaltetem
Designer ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` liefert
`head`, `status` und `output`, sodass eine Pipeline prüfen kann, welchen Commit die Instanz nach einem Pull ausführt.

### Lokale Änderungen

Ein Pull überschreibt nie Arbeit, die noch nicht gepusht ist, daher prüft ein geplanter Pull die Arbeitskopie, bevor er läuft.

Ein geplanter Pull wird übersprungen, solange die Arbeitskopie nicht committete Änderungen oder nicht gepushte Commits hat und solange ein Designer
die Designer-Sperre hält. Ein manueller Pull einer Arbeitskopie mit kollidierenden Änderungen schlägt fehl mit:

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Pushen Sie die Änderungen oder verwerfen Sie sie mit **Zurücksetzen** im Zeilenmenü, das die Arbeitskopie löscht und neu klont.

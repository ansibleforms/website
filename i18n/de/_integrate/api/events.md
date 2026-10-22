---
layout: default
title: Live-Ereignisse
parent: REST-API
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Live-Ereignisse
{: .no_toc }

Erfahren, wann sich Jobs und Einstellungen ändern, statt abzufragen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Der Server teilt seinen Clients mit, was sich ändert, sobald es sich ändert. Auch ein Skript kann zuhören, statt alle paar Sekunden einen Job zu lesen.

---

## Der Stream

`GET /api/v2/events` ist ein Stream von [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events),
der offen bleibt. Jeder angemeldete Benutzer darf ihn öffnen, mit dem üblichen Bearer Token:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Wenn sich etwas ändert, sendet er ein Ereignis `changed` mit dem Namen dessen, was sich geändert hat:

```text
event: changed
data: {"name":"jobs"}
```

---

## Ereignisnamen

Ein Ereignis trägt nur einen Namen, nie Daten, daher verrät es nichts, was der Benutzer nicht sehen darf. Diese Namen werden gesendet:

| Name | Was sich geändert hat |
|---|---|
| `jobs` | Ein Job: gestartet, sein Status oder seine Ausgabe, gelöscht |
| `appearance` | Die Einstellungen, die die Kopfzeile zeigt: das Theme, der Name, eine Ankündigung, eine Umgebungsvariable |
| `designer` | Eine Sperre des Designers, gesetzt oder freigegeben |
| `runners` | Ein Runner (ab 7.3.0): eine RTE hat sich verbunden oder getrennt, um Beitritt gebeten, wurde freigegeben oder abgelehnt, oder hat ihren Modus oder ihre Einstellungen geändert |

Wenn Sie einen Namen empfangen, lesen Sie das, was Sie anzeigen, über die normale API neu (zum Beispiel `GET /api/v2/job/42`), mit Ihren eigenen
Berechtigungen. Ein häufiger Name wird höchstens einmal pro Sekunde gesendet.

---

## Offen halten

Der Stream ist darauf ausgelegt, Proxys und Load Balancer zu überstehen, und ein Client verbindet sich von selbst neu:

* Beim Verbinden sendet der Server ein Ereignis `hello` und bittet den Client, 3 Sekunden zu warten, bevor er sich neu verbindet.
* Alle 15 Sekunden sendet er eine Kommentarzeile (`: ping`), damit eine untätige Verbindung nicht geschlossen wird. Ignorieren Sie Zeilen, die mit `:` beginnen.
* Ereignisse von jedem App-Knoten erreichen jeden Stream, egal mit welchem Knoten der Client verbunden ist.
* Lesen Sie nach einer Neuverbindung das, was Sie anzeigen, neu: ein Ereignis, das gesendet wurde, während der Stream unterbrochen war, wird nicht erneut gesendet.

---

## Health und Metriken

Die Liveness- und Readiness-Probes (`/api/v2/live`, `/api/v2/ready`) und die Prometheus-Metriken (`/api/v2/metrics`) sind
für Monitoring-Werkzeuge gedacht, nicht für Skripte, die als Benutzer handeln. Siehe [Monitoring](../production/monitoring.html).

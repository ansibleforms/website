---
layout: default
title: Überwachung
parent: Betrieb in Produktion
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Überwachung
{: .no_toc }

Health-Probes für einen Load Balancer oder Kubernetes, Prometheus-Metriken und die Seite Status
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Health-Probes

Zwei Endpunkte sagen einem Load Balancer, einem Container-Healthcheck oder Kubernetes, ob ein Prozess Verkehr annehmen kann.
Keiner braucht eine Anmeldung, und keiner gibt etwas über die Einrichtung preis:

| Endpunkt | Antwortet | Verwendung |
|----------|---------|------------|
| `/api/v2/live` | `200` mit `{"status":"live"}`, solange der Prozess läuft | Eine Liveness-Probe: den Prozess neu starten, wenn er nicht mehr antwortet |
| `/api/v2/ready` | `200` mit `{"status":"ready"}` oder `503` mit `{"status":"not ready","reason":"..."}` | Eine Readiness-Probe: Verkehr nur an bereite Prozesse senden |

Ein Prozess ist bereit, wenn all das zutrifft:

* er fährt nicht gerade herunter (`stopping`)
* die Datenbank antwortet (`database unreachable`)
* das Schema existiert (`schema not provisioned`) und ist vollständig, mit jeder Tabelle, jeder Spalte und jedem Index dieser Version
  (`schema not upgraded`); diese letzte Prüfung wird 30 Sekunden zwischengespeichert, sodass eine Probe alle paar Sekunden günstig bleibt

Unter einer [`BASE_URL`](../customization/server.html#env_BASE_URL) beginnen die Pfade mit ihr, zum Beispiel
`/ansibleforms/api/v2/ready`. Eine Laufzeitumgebung (RTE) beantwortet dieselben Probes unter `/live` und `/ready`, ohne die
Prüfung der Vollständigkeit des Schemas; sie ist nicht bereit, während sie beim Herunterfahren ihre Jobs abarbeitet, sodass ihr kein neuer Job gesendet wird. Eine ausgehende RTE
ist außerdem nicht bereit (`not connected to the app`), bis ihr Socket zur App offen ist.
Ein mit `AF_ROLE=worker` gestarteter Prozess hat keine Weboberfläche: Er beantwortet nur `/api/v2/version` und `/health` für seinen
Container-Healthcheck. Die Rollen finden Sie unter [Skalierung](scaling.html).

---

## Prometheus-Metriken

Setzen Sie [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) auf eine lange Zufallszeichenfolge, um Prometheus-Metriken bereitzustellen.
Ein Prozess, der die Webanwendung bereitstellt, antwortet unter `/api/v2/metrics`, eine RTE unter `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Ohne `METRICS_TOKEN` antworten die Endpunkte mit `404`, als gäbe es sie nicht, und eine Anfrage ohne den richtigen Header
`Authorization: Bearer <token>` erhält `401`. Jeder Prozess meldet seine eigenen Werte, scrapen Sie also jeden einzeln:

| Metrik | Was sie misst |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | Den Prozess: CPU, Speicher, Event-Loop-Verzögerung, Garbage Collection |
| `af_http_requests_total{route,method,status}` | Die bearbeiteten Anfragen |
| `af_http_request_duration_seconds{route}` | Wie lange sie gedauert haben |
| `af_jobs{status}` | Jobs, die gerade laufen (`running`) oder auf Genehmigung warten (`approve`) |
| `af_jobs_ended_24h{status}` | Jobs, die in den letzten 24 Stunden geendet haben, nach Status |
| `af_nodes{role,alive}` | Die in der Datenbank registrierten Prozesse, nach Rolle, lebend oder nicht |
| `af_login_failures_total`, `af_login_lockouts_total` | Fehlgeschlagene Anmeldungen und Kontosperren |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Auf einer RTE: die Playbooks, die sie gerade ausführt, und wie viele sie gleichzeitig ausführen darf |
| `af_rte_socket_connected` | Auf einer RTE im Socket-Modus: `1`, solange ihr Socket zur App offen ist, `0`, wenn nicht |

Die Job- und Knotenwerte werden bei jedem Scrape aus der Datenbank gelesen. Antwortet die Datenbank nicht, werden sie
weggelassen, und der Scrape gelingt trotzdem mit den übrigen Metriken.

---

## Die Seite Status

Die Seite **Status** unter **Einstellungen > System** zeigt Benutzern mit der Rollenoption `showSettings`, wie es der Instanz geht.
Sie liest nur, daher sendet ein Aktualisieren nie eine Mail und startet nie einen Job. Sie hat zwei Tabs, und die Anzahl der Probleme erscheint in der Beschriftung des Tabs **Prüfungen**.

### Prüfungen

Jede Prüfung ist grün (in Ordnung), gelb (braucht Aufmerksamkeit) oder rot (ein Problem), mit Details beim Aufklappen der Zeile:

| Prüfung | Was sie betrachtet |
|-------|------------------|
| Datenbankverbindung | Die Datenbank antwortet |
| Datenbankbenutzer | Gelb, wenn der Benutzer Rechte auf jede Datenbank hat, wie `root`, statt nur auf `AnsibleForms.*` |
| Datenbankschema | Jede Tabelle, jede Spalte und jeder Index dieser Version existiert, und welcher Patch fehlgeschlagen ist, wenn nicht |
| Zeitplaner | Ein Worker führt die Systemaufgaben aus, und keine davon hat aufgehört, eingeplant zu werden |
| Knoten | Die Prozesse in der Datenbank, gelb, wenn sie unterschiedliche Versionen ausführen |
| Jobs | Laufende Jobs und Jobs, die auf Genehmigung warten, gelb, wenn ein Job länger als 24 Stunden gelaufen ist |
| Backup-Werkzeuge | Der Dump-Befehl von [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) existiert, und seine Version |
| Letztes Backup | Gelb, wenn es keines gibt oder das neueste älter als zwei Tage ist, rot, wenn es keinen brauchbaren Dump hat |
| Designer-Sperre | Wer die Designer-Sperre hält, gelb, wenn sie länger als 8 Stunden gehalten wurde |
| Repositories | Rot, wenn ein Repository fehlgeschlagen ist oder kein Arbeitsverzeichnis auf der Festplatte hat |
| Konfigurations-Seed | Die Datei des [Config-Seeds](../seed/) ist lesbar und lässt sich parsen, und ihr letztes Neuladen hat funktioniert |
| Secret Stores | Jeder Secret Store antwortet, gelb, wenn das Token eines HashiCorp Vault bald abläuft |
| Runner | Jeder Runner antwortet, gelb, wenn es keinen gibt oder keine Standard-RTE |
| Server-Ausdrücke | Gelb, wenn [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) `legacy` ist |
| Geheimnisse | Gelb, wenn `ENCRYPTION_SECRET` der öffentlich bekannte Standard ist oder `ACCESS_TOKEN_SECRET` nicht gesetzt ist |
| LDAP | Der LDAP-Server ist erreichbar und sein TLS-Zertifikat gültig, ohne sich bei ihm anzumelden |
| Job-Speicher | Die Größe der Job-Tabellen, gelb über 1 GB, wenn keine Job-Aufbewahrung gesetzt ist |
| Beschreibbare Ordner | In jeden konfigurierten Ordner lässt sich schreiben |
| Speicherplatz | Die Festplatte mit den Backups, gelb ab 85 % Belegung und rot ab 95 % |

### Informationen

Fakten über die Instanz ohne Bewertung, das Erste, wonach ein Support-Gespräch fragt: die Version von
AnsibleForms, die Basis-URL, Version und Host der Datenbank, die Konfigurationsquelle, der Config-Seed, die
Aufbewahrungseinstellungen, die Authentifizierungsmethoden, der Server des aktiven [Mail-Kanals](../notification-channels.html),
Protokollstufe und -pfad, die Betriebszeit, die Zeitzone, die Node.js-Version und die Plattform.

Die Seite liest `/api/v2/health`, das einen angemeldeten Benutzer mit `showSettings` braucht. Für ein Überwachungssystem verwenden Sie
stattdessen die Probes und die Metriken oben.

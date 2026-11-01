---
layout: default
title: Betrieb in Produktion
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# Betrieb in Produktion
{: .no_toc }

Eine Instanz veröffentlichen, sichern und überwachen, auf die sich Menschen verlassen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Vor dem Livegang

Mit den Standardwerten läuft eine Instanz schnell, aber mehrere davon sind nur für einen ersten Eindruck gedacht. AnsibleForms
protokolliert beim Start eine Warnung `[SECURITY]`, wenn `ENCRYPTION_SECRET` oder `ACCESS_TOKEN_SECRET` nicht gesetzt ist, und die
Seite **Status** meldet die Backups, die Aufbewahrungseinstellungen und den Ausdrucks-Sanitizer.

---

## Checkliste für die Produktion

Gehen Sie diese Punkte einmal durch, bevor sich Benutzer auf die Instanz verlassen, und erneut nach einem größeren Upgrade:

| Punkt | Was zu tun ist | Details |
|------|------------|---------|
| Admin-Passwort | Das Passwort des lokalen Admin-Kontos ändern | [Härtung](../security/hardening.html#the-admin-account) |
| Verschlüsselungsgeheimnis | [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) setzen, bevor Sie Anmeldedaten speichern | [Geheimnisse und Verschlüsselung](../security/secrets.html#the-two-master-secrets) |
| Token-Geheimnis | [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) setzen, damit Sitzungen einen Neustart überstehen | [Geheimnisse und Verschlüsselung](../security/secrets.html#the-two-master-secrets) |
| HTTPS | TLS mit Ihrem eigenen Zertifikat terminieren, nicht mit dem Beispielzertifikat | [HTTPS](../security/https.html) |
| Reverse Proxy | Die Instanz hinter einem Proxy veröffentlichen, optional unter [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse Proxy](reverse-proxy.html) |
| Schema-Endpunkt | [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) auf `0` setzen, sobald das Schema existiert | [Härtung](../security/hardening.html#the-database) |
| Ausgehende Aufrufe | REST-Ausdrücke mit [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) einschränken | [Härtung](../security/hardening.html#expressions-and-outbound-calls) |
| Optionale Funktionen | MCP und den Chat-Assistenten ausgeschaltet lassen, sofern Sie sie nicht verwenden | [Härtung](../security/hardening.html#optional-features) |
| Backups | Prüfen, dass das nächtliche Backup funktioniert, und es auf einen anderen Host kopieren | [Backups](backups.html) |
| Aufbewahrung | Entscheiden, wie lange Jobs und Audit-Einträge aufbewahrt werden | [Protokolle](logs.html#retention) |

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite; die Absicherung der Instanz wird unter [Sicherheit](../security/) behandelt:

| Seite | Inhalt |
|---|---|
| [Reverse Proxy](reverse-proxy.html) | AnsibleForms hinter Nginx, Traefik oder Apache veröffentlichen, im Stamm oder unter einem Unterpfad |
| [Backups](backups.html) | Nächtliche Backups, was sie enthalten, Wiederherstellungen und was sonst noch zu sichern ist |
| [Protokolle](logs.html) | Protokolldateien, Syslog, der Audit-Verlauf und die Aufbewahrung von Jobs und Audit-Einträgen |
| [Skalierung](scaling.html) | Mehrere App-Knoten mit einem Worker; die RTE hat einen eigenen Abschnitt, [Laufzeitumgebungen](../rte/) |
| [Überwachung](monitoring.html) | Health-Probes, Prometheus-Metriken und die Seite Status |

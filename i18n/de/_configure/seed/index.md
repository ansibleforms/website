---
layout: default
title: Config-Seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
---

# Config-Seed
{: .no_toc }

Die Admin-Objekte in einer Datei deklarieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren, die aus Git bereitstellen: Deklarieren Sie die Admin-Objekte in einer Datei, damit sich eine Instanz auf einer leeren Datenbank neu aufbauen lässt.

---

## Was er abdeckt

Setzen Sie `CONFIG_SEED_PATH` auf eine YAML-Datei, und AnsibleForms wendet sie beim Start an. Die Datei
deklariert Objekte, die früher nur in der Datenbank existierten:

| Abschnitt               | Was er deklariert                                                   |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Wo Jobs laufen: RTEs, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Secret Stores (HashiCorp Vault, ...)                                |
| `credentials`           | Anmeldedaten                                                        |
| `oauth2`                | SSO-Anbieter: Entra ID und OIDC                                     |
| `repositories`          | Git-Repositories                                                    |
| `syslog_servers`        | Die Syslog-Server, die das Serverprotokoll und die Audit-Einträge erhalten |
| `notification_channels` | Mailserver, Slack, Teams, Telegram und Webhooks für Benachrichtigungen |
| `labels`                | Die Labels neben dem Logo der Kopfzeile, ab 7.3.0                   |
| `ldap`                  | Die LDAP-Konfiguration                                              |
| `settings`              | Die öffentliche URL und die Mail-Einstellungen, die verwendet werden, wenn kein Mail-Kanal aktiv ist |
| `chat`                  | Der Modellanbieter des Chat-Assistenten                             |
| `awx`                   | Seit 7 veraltet, in 8 entfernt: Verwenden Sie `runners` mit `type: awx` |

Ein vor 7 geschriebener Seed funktioniert weiterhin: Jedes Element seines Abschnitts `awx` wird als Runner vom Typ `awx` angewendet, und das Protokoll
warnt bei jeder Anwendung. Verschieben Sie diese Elemente vor dem Upgrade auf 8 unter `runners` mit `type: awx`.

Der Seed ist **nicht** dasselbe wie `config.yaml`, die die Kategorien, Rollen und Konstanten enthält
und ihren eigenen `CONFIG_PATH` hat. Die beiden werden absichtlich getrennt gehalten: Das
Repository, das `config.yaml` *enthält*, ist eines der Objekte, die der Seed deklariert, daher kann der Seed
nicht darin liegen.

Benutzer und Gruppen bleiben außen vor: Sie kommen aus LDAP oder SSO, und der erste Admin aus `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## In diesem Abschnitt

Jedes Thema hat eine eigene Seite:

| Seite | Inhalt |
|---|---|
| [Beispiel](example.html) | Eine vollständige Seed-Datei, Abschnitt für Abschnitt |
| [Verwaltete Objekte](managed-objects.html) | Wie der Seed die aufgeführten Objekte verwaltet und wie er Geheimnisse heraushält |
| [Neuladen und Start](reloading.html) | Die Datei ohne Neustart ändern, und was beim Start passiert |
| [Kubernetes](kubernetes.html) | AnsibleForms aus einer ConfigMap und Secrets bereitstellen |
| [Bearbeitung und Audit](environment-and-audit.html) | Die Einstellungsseiten sperren, und was das Audit-Protokoll festhält |

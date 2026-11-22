---
layout: default
title: Config-Seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
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

Setzen Sie `CONFIG_SEED_PATH` auf eine YAML-Datei, und AnsibleForms wendet sie beim Start an. Die Datei deklariert Objekte und Einstellungen,
die es sonst nur in der Datenbank gibt:

| Abschnitt          | Was er deklariert                                                                 |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Wo Jobs laufen: RTEs, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins           |
| `secret_stores`    | Secret Stores (HashiCorp Vault, ...)                                              |
| `credentials`      | Anmeldedaten                                                                      |
| `databases`        | Die Datenbanken, die Formulare abfragen, jede mit ihren Anmeldedaten, ab 7.5.0    |
| `sso`              | SSO-Anbieter: Entra ID und OIDC (`oauth2` vor 7.8.0)                              |
| `repositories`     | Git-Repositories, und was die App aus jedem liest                                 |
| `syslog`           | Die Syslog-Server, die das Serverprotokoll und die Audit-Einträge erhalten (`syslog_servers` vor 7.8.0) |
| `notifications`    | Mailserver, Slack, Teams, Telegram und Webhooks (`notification_channels` vor 7.8.0) |
| `labels`           | Die Labels neben dem Logo der Kopfzeile, ab 7.3.0                                 |
| `ldap`             | Die LDAP-Konfiguration                                                            |
| `settings`         | Die öffentliche URL; ihre Mail-Schlüssel sind seit 7.6.0 veraltet, zugunsten eines Mail-Kanals |
| `chat_assistant`   | Der Modellanbieter des Chat-Assistenten (`chat` vor 7.8.0)                        |
| `users`            | Benutzer, lokale und aus einem Verzeichnis, seit 7.8.0                            |
| `groups`           | Lokale Gruppen und ihre Mitglieder, seit 7.8.0                                    |
| `defaults`         | **Einstellungen > Erscheinungsbild > Standardwerte**: Theme, Sprache, Zeitzone, seit 7.8.0 |
| `logo`, `icon`     | Das Logo und das Website-Symbol, Bilddateien neben dem Seed, seit 7.8.0           |
| `name`             | Der Name der App, seit 7.8.0                                                      |
| `links`            | Die Links der Kopfzeile, und ob der Link zum Designer erscheint, seit 7.8.0       |
| `announcements`    | Die Ankündigungen unter der Kopfzeile, seit 7.8.0                                 |
| `disclaimer`       | Die Versionen des Haftungsausschlusses, den Benutzer akzeptieren, seit 7.8.0      |
| `mcp`              | Die Schalter des MCP-Servers, seit 7.8.0                                          |
| `ssh`              | Der private SSH-Schlüssel der App und ihre bekannten Hosts, seit 7.8.0            |
| `awx`              | Seit 7 veraltet, in 8 entfernt: Verwenden Sie `runners` mit `type: awx`           |

Das [Beispiel](example.html) zeigt jeden Abschnitt, und [Verwaltete Objekte](managed-objects.html), wie weit der Seed besitzt, was jeder
deklariert: Die meisten Abschnitte machen ihre Objekte in der App schreibgeschützt, einige wenige legen sie nur an oder ändern sie.

Ein vor 7 geschriebener Seed funktioniert weiterhin: Jedes Element seines Abschnitts `awx` wird als Runner vom Typ `awx` angewendet, und das Protokoll
warnt bei jeder Anwendung. Verschieben Sie diese Elemente vor dem Upgrade auf 8 unter `runners` mit `type: awx`.

Der Seed ist **nicht** dasselbe wie `config.yaml` (`CONFIG_PATH`), die Basiskonfiguration der Kategorien, Rollen und Konstanten. Ein
Repository kann diese stattdessen enthalten, und dieses Repository ist eines der Objekte, die der Seed deklariert, daher kann der Seed nicht darin liegen.

Der erste Admin kommt weiterhin aus `ADMIN_USERNAME` / `ADMIN_PASSWORD`, und die Benutzer von LDAP oder SSO bei der Anmeldung aus ihrem Verzeichnis.
Seit 7.8.0 können die Abschnitte `users` und `groups` lokale Benutzer und Gruppen hinzufügen und einen Verzeichnisbenutzer sperren, bevor er sich anmeldet.

---

## Umbenannte Abschnitte

Seit 7.8.0 heißen vier Abschnitte wie die Schlüssel, unter denen ein [Git-Repository](../repositories/) dieselben Objekte enthält, ohne
`controller_` (`sso:` für `controller_sso:`):

| Vor 7.8.0                 | Seit 7.8.0         |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Ihre Elemente sind unverändert. Die alten Namen werden weiterhin gelesen, seit 7.8.0 veraltet und in 8 entfernt: Jeder angewendete
protokolliert eine Warnung im Serverprotokoll, die den neuen Namen nennt. Ein Seed, der einen Abschnitt unter beiden Namen angibt, wird
abgewiesen. Benennen Sie sie vor dem Upgrade auf 8 in der Datei um.

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

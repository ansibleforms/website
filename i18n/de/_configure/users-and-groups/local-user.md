---
layout: default
title: Ein lokaler Benutzer
parent: Benutzer und Gruppen
nav_order: 1
translated_from: 9b36582b1f0f8b333a6e9dbb4524eb10723af183
---

# Ein lokaler Benutzer
{: .no_toc }

Einen lokalen Benutzer hinzufügen und die Tabs seiner Seite
{: .fs-6 .fw-300 }

**Benutzer hinzufügen** öffnet einen Assistenten in drei Schritten: **Benutzer** (Benutzername, Beschreibung, E-Mail), **Passwort** und **Gruppe**.

Die Seite eines Benutzers, `/settings/users/<id>`, hat diese Tabs:

| Tab | Was er zeigt |
|---|---|
| **Details** | Den Schalter **Anmeldung erlauben**, den Benutzernamen, die Beschreibung, die E-Mail und ab 7.3.0 die **Letzte Anmeldung** |
| **Gruppen** | Die Gruppen, denen der Benutzer angehört |
| **Rollen** | Die Rollen des Benutzers und was jede vergibt: **Direkt**, **Über** eine Gruppe oder **Alle** |
| **Formulare** | Die Formulare, die diese Rollen öffnen |
| **Jobs** | Die Jobs, die der Benutzer gestartet hat, die neuesten zuerst |
| **Gespeicherte Jobs** | Die Formularwerte, die der Benutzer gespeichert hat, um sie erneut auszuführen |
| **Zeitpläne** | Die Jobs, die der Benutzer mit Später ausführen eingeplant hat |
| **Aktivität** | Was das Audit-Protokoll über die Aktionen des Benutzers festgehalten hat |
| **API-Tokens** | Die API-Token des Benutzers, mit Erstellung, Ablauf und letzter Verwendung; **Widerrufen** beendet eines sofort |

Ab 7.3.0 werden die Anmeldungen eines lokalen Benutzers festgehalten, wie es bei LDAP- und SSO-Benutzern bereits geschah: **Letzte Anmeldung** zeigt die neueste, und
die Benutzerliste hat für jede Herkunft eine sortierbare Spalte **Letzte Anmeldung**, sodass ein Konto, das niemand verwendet, auffällt. Eine abgewiesene Anmeldung wird nicht
festgehalten, und ein lokaler Benutzer, der sich seit dem Upgrade nicht angemeldet hat, zeigt `–`.

**Passwort ändern** und **Löschen** befinden sich oben rechts. Der Benutzer `admin` kann nie gelöscht oder umbenannt werden.

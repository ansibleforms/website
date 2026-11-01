---
layout: default
title: Die Seite Datenbanken
parent: Datenbanken
nav_order: 1
translated_from: 66ffec0a34395642b0208e81078dbc725bdc7123
---

# Die Seite Datenbanken
{: .no_toc }

Die Liste der Datenbanken, ihre Spalten und der Dialog, der eine hinzufügt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Liste

Die Seite unter **Verbindungen > Datenbanken** listet jede Datenbank mit diesen Spalten auf:

| Spalte | Bedeutung |
|---|---|
| Name | Wie Formulare auf sie verweisen, mit `dbConfig: <name>` |
| Beschreibung | Wofür sie ist |
| Datenbanktyp | Der ihrer Anmeldedaten: MySQL, MSSQL, PostgreSQL, Oracle oder MongoDB |
| Datenbank | Die Datenbank, die ihre Anmeldedaten öffnen |

**Spalten** fügt zwei weitere hinzu, standardmäßig aus: **Host**, wohin sich ihre Anmeldedaten verbinden, mit dem Port, wenn es einen gibt, und **Verwendet von**,
wie viele Formulare sie abfragen, über ihren Namen oder den ihrer Anmeldedaten (siehe [Verwendet von](database-page.html#used-by)).

Datenbanktyp, Datenbank und Host werden aus den Anmeldedaten gelesen: Ändern Sie sie in den Anmeldedaten, unter
**Verbindungen > Anmeldedaten**. Keine Spalte zeigt einen Benutzer oder ein Passwort.

---

## Eine Datenbank hinzufügen

**Datenbank hinzufügen** öffnet einen Dialog in zwei Schritten, wie der eines Runners.

| Schritt | Felder |
|---|---|
| Datenbank | **Name** und **Beschreibung**. Der Name ist erforderlich und eindeutig |
| Anmeldedaten | **Anmeldedaten**, erforderlich: Anmeldedaten vom Typ **Datenbank**. Nur diese werden angeboten |

Im Schritt **Anmeldedaten** öffnet **Anmeldedaten hinzufügen** den Dialog für neue Anmeldedaten vom Typ **Datenbank** (siehe
[Die Seite Anmeldedaten](../credentials/list.html)) und wählt sie nach dem Speichern aus, sodass eine Datenbank und ihre Anmeldung in einem Zug angelegt werden.

---

## Das Zeilenmenü

Eine Zeile öffnet die eigene Seite der Datenbank, und ihr Menü bietet:

| Aktion | Was sie tut |
|---|---|
| Bearbeiten | Öffnet ihre Seite |
| Verbindung testen | Verbindet sich mit ihren Anmeldedaten, führt die kleinste Abfrage ihres Datenbanktyps aus und meldet, ob es funktioniert hat |
| Löschen | Löscht die Datenbank nach einer Bestätigung. Ihre Anmeldedaten bleiben |

Das Löschen einer Datenbank, die Formulare noch nennen, lässt deren Abfragen fehlschlagen, es sei denn, es bleiben Anmeldedaten mit demselben Namen,
auf die sie zurückgreifen können (siehe [Datenbanken in Formularen](in-forms.html)). Prüfen Sie zuerst ihren Tab **Verwendet von**.

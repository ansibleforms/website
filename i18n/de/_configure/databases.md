---
layout: default
title: Datenbanken
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Datenbanken
{: .no_toc }

Die Datenbanken, die Formulare abfragen, jede mit Datenbank-Anmeldedaten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Benennen Sie die Datenbanken, die Ihre Formulare abfragen, wählen Sie die Anmeldedaten jeder Datenbank und testen Sie sie.

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Die Seite Datenbanken](databases/list.html) | Die Liste der Datenbanken, ihre Spalten und der Dialog, der eine hinzufügt |
| [Die Seite einer Datenbank](databases/database-page.html) | Die Tabs einer Datenbank, die Formulare, die sie abfragen, Verbindung testen und Löschen |
| [Datenbanken in Formularen](databases/in-forms.html) | Wie die `dbConfig` eines Feldes eine Datenbank nennt, und die Formulare von vor 7.5.0 |

---

## Funktionsweise

Ab 7.5.0 ist eine **Datenbank** eine eigene Verbindung, angelegt unter **Verbindungen > Datenbanken**, zwischen **Secret Stores** und **Runner**.
Sie hat drei Dinge:

| Feld | Was es ist |
|---|---|
| Name | Der Name, den die `dbConfig` eines Feldes angibt, um sie abzufragen, etwa `cmdb` |
| Beschreibung | Wofür sie ist |
| Anmeldedaten | Die Anmeldedaten aus [Verbindungen > Anmeldedaten](credentials.html) vom Typ **Datenbank**, mit denen sie sich verbindet |

Die Anmeldedaten behalten wie bisher alles zur Verbindung: den Datenbanktyp (MySQL, MSSQL, PostgreSQL, Oracle oder MongoDB), Host und Port,
den Datenbanknamen, TLS sowie Benutzer und Passwort, verschlüsselt gespeichert oder aus einem [Secret Store](secret-stores/) gelesen.
Eine Datenbank hat weder eine eigene Adresse noch ein eigenes Geheimnis, daher wählen eine Datenbank und ein Runner ihre Anmeldedaten auf dieselbe Weise.

Ein Feld fragt eine Datenbank ab, indem es sie in `dbConfig` nennt:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Ein Name, der keine Datenbank ist, wird wie vor 7.5.0 als Anmeldedaten vom Typ Datenbank gesucht, sodass ältere Formulare unverändert
weiter funktionieren (siehe [Datenbanken in Formularen](databases/in-forms.html)).

---

## Upgrade auf 7.5.0

Das Upgrade füllt **Verbindungen > Datenbanken** einmalig, damit Ihre vorhandenen Formulare ohne Änderung weiter funktionieren.

Es legt für alle Anmeldedaten vom Typ Datenbank je eine Datenbank an, mit dem Namen und der Beschreibung der Anmeldedaten, die sich mit diesen
Anmeldedaten verbindet. Ein Formular, dessen `dbConfig` die Anmeldedaten nennt, findet jetzt die Datenbank mit demselben Namen, die sich mit denselben
Anmeldedaten verbindet: Das Ergebnis ist dasselbe. Die Anmeldedaten behalten alle ihre Felder.

Das Upgrade läuft nur einmal: Eine danach gelöschte Datenbank wird nicht erneut angelegt, und später hinzugefügte Datenbank-Anmeldedaten erhalten keine
Datenbank, bis Sie eine hinzufügen.

---

## Verwendete Anmeldedaten

Anmeldedaten, mit denen sich eine Datenbank verbindet, sind in Verwendung, wie die, mit denen sich ein Runner anmeldet.

Sie können nicht gelöscht oder umbenannt werden, solange eine Datenbank sie nennt, und der Tab **Verwendet von** ihrer Seite listet die Datenbanken auf (siehe
[Verwendete Anmeldedaten](credentials.html#credentials-in-use)). Das Löschen einer Datenbank lässt ihre Anmeldedaten unverändert.

---

## Wer Datenbanken verwaltet

Die Datenbanken folgen den Rollenoptionen der Anmeldedaten, die sie nennen.

Die Liste, die Seite einer Datenbank und ihre API brauchen die Rollenoption `showSettings` oder `showConnectionsSettings`, wie die Anmeldedaten.
Nur ein Admin kann eine Datenbank mit Anmeldedaten verbinden, die nur ein Admin nennen darf, etwa solche, die ihr Passwort aus einem Secret Store
lesen (siehe [Wer Anmeldedaten ändern darf](credentials.html#who-may-change-a-credential)): Die Formulare, die sie abfragen, würden sich mit diesen
Anmeldedaten verbinden, und **Verbindung testen** würde ihr Geheimnis an ihren Server senden. Ein anderer Benutzer darf eine Datenbank mit den Anmeldedaten,
die sie bereits nennt, erneut speichern.

Eine im [Config-Seed](seed/) deklarierte Datenbank ist auf ihrer Seite schreibgeschützt: Ändern Sie sie stattdessen in der Seed-Datei.

---

## Der Config-Seed

Ein Seed deklariert seine Datenbanken in einem Abschnitt `databases:`, nach den Anmeldedaten, die sie nennen.

Jeder Eintrag hat einen `name`, eine `credential` vom Typ Datenbank und optional eine `description`. Die Anmeldedaten können aus dem Abschnitt
`credentials` desselben Seeds stammen oder in der App angelegt sein:

```yaml
credentials:
  items:
    - name: cmdb-login
      credential_type: database
      db_type: mysql
      host: cmdb.example.com
      port: 3306
      user: svc_forms
      password: ${SEED_CMDB_PW}

databases:
  items:
    - name: cmdb                 # the name a field's dbConfig gives
      description: The CMDB
      credential: cmdb-login     # a credential of type database
```

Siehe das vollständige [Beispiel](seed/example.html) und [Verwaltete Objekte](seed/managed-objects.html) dazu, wie der Seed übernimmt, was er deklariert.

---

## Die REST-API

Skripte verwalten die Datenbanken über die [REST-API](api/), unter `/api/v2/database`, mit denselben Rollenoptionen wie die Seite.

| Aufruf | Was er tut |
|---|---|
| `GET /api/v2/database` | Listet die Datenbanken auf, jede mit Datenbanktyp, Datenbank, Host und Port ihrer Anmeldedaten und der Anzahl der Formulare, die sie abfragen (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Liefert die Datenbank dieses Namens |
| `GET /api/v2/database/<id>` | Liefert eine Datenbank |
| `POST /api/v2/database` | Fügt eine Datenbank hinzu: ihren `name`, ihre `credential` und optional ihre `description` |
| `PUT /api/v2/database/<id>` | Ändert eine Datenbank |
| `DELETE /api/v2/database/<id>` | Löscht eine Datenbank; ihre Anmeldedaten bleiben |
| `POST /api/v2/database/<id>/check` | Testet ihre Verbindung, mit ihren Anmeldedaten |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

Eine `credential`, die nicht existiert oder nicht vom Typ Datenbank ist, wird mit `400` abgewiesen. Jede Änderung wird im Audit-Protokoll festgehalten.

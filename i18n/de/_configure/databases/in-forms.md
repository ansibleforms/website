---
layout: default
title: Datenbanken in Formularen
parent: Datenbanken
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Datenbanken in Formularen
{: .no_toc }

Wie dbConfig eine Datenbank nennt, und ältere Formulare
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Eine Datenbank nennen

Ein Feld mit einer `query` führt sie auf der Datenbank aus, die seine `dbConfig` nennt.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Ab 7.5.0 wird der Name in dieser Reihenfolge gesucht:

| Reihenfolge | Der Name ist | Die Abfrage verbindet sich mit |
|---|---|---|
| 1 | Eine Datenbank unter **Verbindungen > Datenbanken** | Den Anmeldedaten, die diese Datenbank nennt |
| 2 | Sonst Anmeldedaten vom Typ **Datenbank** unter **Verbindungen > Anmeldedaten** | Diesen Anmeldedaten, wie vor 7.5.0 |

Der Datenbanktyp (MySQL, MSSQL, PostgreSQL, Oracle oder MongoDB) kommt aus den Anmeldedaten, daher gibt das Formular ihn nie an. Anmeldedaten
ohne Typ werden als MySQL gelesen.

---

## Formulare von vor 7.5.0

Jedes Formular, das Anmeldedaten in `dbConfig` nannte, funktioniert ohne Änderung weiter.

Das [Upgrade auf 7.5.0](../databases.html#upgrading-to-750) legt für alle Datenbank-Anmeldedaten je eine Datenbank mit demselben Namen an, die sich
mit diesen Anmeldedaten verbindet, sodass der Name, den ein Formular angibt, jetzt zuerst die Datenbank findet, die zur selben Anmeldung führt.
Anmeldedaten vom Typ Datenbank ohne Datenbank ihres Namens werden weiterhin in Schritt 2 gefunden.

Eine Datenbank und Anmeldedaten können sich einen Namen teilen, wie es das Upgrade macht. Die Datenbank gewinnt: Richten Sie sie auf andere Anmeldedaten,
und jedes Formular, das diesen Namen angibt, folgt, so zieht ein Formular auf einen anderen Server um, ohne bearbeitet zu werden.

---

## Die Formen von dbConfig

Die drei Formen, die `dbConfig` schon immer angenommen hat, funktionieren weiterhin, jeder Name wie oben gesucht.

| `dbConfig` | Beispiel | Was es tut |
|---|---|---|
| Ein Name | `dbConfig: cmdb` | Fragt diese Datenbank ab |
| Eine Liste von Namen | `dbConfig: [cmdb-eu, cmdb-us]` | Führt die Abfrage auf jeder aus und fügt die Ergebnisse zusammen; Doppelte werden nicht entfernt |
| Ein Objekt (veraltet) | `dbConfig: { name: cmdb, type: mysql }` | Fragt die Datenbank oder die Anmeldedaten `name` ab; veraltet, verwenden Sie nur den Namen |

Ein Verweis auf einen [Secret Store](../secret-stores/#inline-without-a-credential-row), etwa `dbConfig: secret:vault:secret/cmdb/db`, ist weder der
Name einer Datenbank noch von Anmeldedaten und wird wie bisher aus dem Store gelesen.

---

## Welche Formulare eine Datenbank abfragen

Die App liest die Formulare, um festzustellen, welche davon jede Datenbank abfragen.

Die Spalte **Verwendet von** der [Seite Datenbanken](list.html) zählt sie, und der Tab **Verwendet von** der
[Seite einer Datenbank](database-page.html#used-by) listet sie mit ihren Feldern auf. Ein Feld, das stattdessen die Anmeldedaten der Datenbank nennt,
zählt ebenfalls. Benennen Sie eine Datenbank erst um, nachdem Sie die Formulare geändert haben, die ihren alten Namen angeben.

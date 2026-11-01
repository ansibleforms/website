---
layout: default
title: Bazy danych w formularzach
parent: Bazy danych
nav_order: 3
translated_from: 44e424afaa9938d1bcdb9277d2b7d8e5fefee64e
---

# Bazy danych w formularzach
{: .no_toc }

Jak dbConfig pola wskazuje bazę danych, i starsze formularze
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wskazywanie bazy danych

Pole z `query` uruchamia je na bazie danych, którą wskazuje jego `dbConfig`.

```yaml
- name: datacenter
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.datacenter
```

Od wersji 7.5.0 nazwa jest wyszukiwana w tej kolejności:

| Kolejność | Nazwa to | Zapytanie łączy się |
|---|---|---|
| 1 | Baza danych z **Połączenia > Bazy danych** | Poświadczeniem, które wskazuje ta baza danych |
| 2 | W przeciwnym razie poświadczenie typu **Baza danych** z **Połączenia > Poświadczenia** | Tym poświadczeniem, jak przed 7.5.0 |

Typ bazy danych (MySQL, MSSQL, PostgreSQL, Oracle lub MongoDB) pochodzi z poświadczenia, więc formularz nigdy go nie podaje. Poświadczenie
bez niego jest odczytywane jako MySQL.

---

## Formularze napisane przed 7.5.0

Każdy formularz, który wskazywał poświadczenie w `dbConfig`, działa dalej bez zmian.

[Aktualizacja do 7.5.0](../databases.html#upgrading-to-750) tworzy bazę danych dla każdego poświadczenia bazy danych, o tej samej nazwie i
łączącą się tym poświadczeniem, więc nazwa podana przez formularz znajduje teraz najpierw bazę danych, która prowadzi do tego samego loginu.
Poświadczenie typu baza danych bez bazy danych o jego nazwie jest nadal znajdowane w kroku 2.

Baza danych i poświadczenie mogą mieć tę samą nazwę, tak jak robi to aktualizacja. Wygrywa baza danych: skieruj ją na inne poświadczenie, a każdy
formularz podający tę nazwę pójdzie za nią; tak formularz przechodzi na inny serwer bez edytowania.

---

## Postacie dbConfig

Trzy postacie, które `dbConfig` zawsze przyjmował, nadal działają, a każda nazwa jest wyszukiwana jak wyżej.

| `dbConfig` | Przykład | Co robi |
|---|---|---|
| Nazwa | `dbConfig: cmdb` | Odpytuje tę bazę danych |
| Lista nazw | `dbConfig: [cmdb-eu, cmdb-us]` | Uruchamia zapytanie na każdej i łączy wyniki; duplikaty nie są usuwane |
| Obiekt (przestarzały) | `dbConfig: { name: cmdb, type: mysql }` | Odpytuje bazę danych lub poświadczenie `name`; przestarzały, użyj samej nazwy |

Odwołanie do [magazynu sekretów](../secret-stores/#inline-without-a-credential-row), takie jak `dbConfig: secret:vault:secret/cmdb/db`, nie jest
nazwą bazy danych ani poświadczenia i nadal jest odczytywane z magazynu jak dotąd.

---

## Które formularze odpytują bazę danych

Aplikacja odczytuje formularze, aby ustalić, które z nich odpytują każdą bazę danych.

Kolumna **Używane przez** na [stronie baz danych](list.html) je liczy, a karta **Używane przez** na
[stronie bazy danych](database-page.html#used-by) wymienia je z ich polami. Pole, które zamiast tego wskazuje poświadczenie bazy danych,
też się liczy. Zmieniaj nazwę bazy danych dopiero po zmianie formularzy, które podają jej starą nazwę.

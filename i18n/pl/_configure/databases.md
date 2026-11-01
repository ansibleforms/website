---
layout: default
title: Bazy danych
nav_order: 7
has_children: true
has_toc: false
permalink: /databases.html
translated_from: 7c14f8dd95d2314974c54a3f2c5aba279410d822
---

# Bazy danych
{: .no_toc }

Bazy danych odpytywane przez formularze, każda z poświadczeniem
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: nazwij bazy danych, które odpytują twoje formularze, wybierz poświadczenie, którym łączy się każda z nich, i przetestuj je.

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Strona baz danych](databases/list.html) | Lista baz danych, jej kolumny i okno, które dodaje nową |
| [Strona bazy danych](databases/database-page.html) | Karty bazy danych, formularze, które ją odpytują, Testuj połączenie i Usuń |
| [Bazy danych w formularzach](databases/in-forms.html) | Jak `dbConfig` pola wskazuje bazę danych, i formularze napisane przed 7.5.0 |

---

## Jak to działa

Od wersji 7.5.0 **baza danych** jest osobnym połączeniem, dodawanym w **Połączenia > Bazy danych**, między **Magazyny sekretów** a **Runnery**.
Ma trzy elementy:

| Pole | Co to jest |
|---|---|
| Nazwa | Nazwa, którą podaje `dbConfig` pola, aby ją odpytać, np. `cmdb` |
| Opis | Do czego służy |
| Poświadczenie | Poświadczenie z [Połączenia > Poświadczenia](credentials.html) typu **Baza danych**, którym się łączy |

Poświadczenie przechowuje wszystko o połączeniu, jak dotąd: typ bazy danych (MySQL, MSSQL, PostgreSQL, Oracle lub MongoDB),
host i port, nazwę bazy danych, TLS oraz użytkownika i hasło, zaszyfrowane lub odczytywane z [magazynu sekretów](secret-stores/).
Baza danych nie ma własnego adresu ani sekretu, więc baza danych i runner wybierają swoje poświadczenie w ten sam sposób.

Pole odpytuje bazę danych, wskazując ją w `dbConfig`:

```yaml
- name: city
  type: enum
  dbConfig: cmdb            # a database of Connections > Databases
  query: select name from cmdb.city
```

Nazwa, która nie jest bazą danych, jest wyszukiwana jako poświadczenie typu baza danych, jak przed 7.5.0, więc starsze formularze działają
dalej bez zmian (zobacz [Bazy danych w formularzach](databases/in-forms.html)).

---

## Aktualizacja do 7.5.0

Aktualizacja jednorazowo wypełnia **Połączenia > Bazy danych**, więc twoje formularze działają dalej bez żadnej zmiany.

Tworzy jedną bazę danych dla każdego poświadczenia typu baza danych, z nazwą i opisem poświadczenia, łączącą się tym
poświadczeniem. Formularz, którego `dbConfig` wskazuje poświadczenie, znajduje teraz bazę danych o tej samej nazwie, która łączy się tym samym
poświadczeniem: wynik jest taki sam. Poświadczenia zachowują wszystkie swoje pola.

Aktualizacja działa tylko raz: baza danych usunięta później nie jest tworzona ponownie, a poświadczenie bazy danych dodane później nie dostaje
bazy danych, dopóki jej nie dodasz.

---

## Poświadczenia w użyciu

Poświadczenie, którym łączy się baza danych, jest w użyciu, tak jak to, którym loguje się runner.

Nie można go usunąć ani przemianować, dopóki wskazuje je baza danych, a karta **Używane przez** na jego stronie wymienia bazy danych (zobacz
[Poświadczenia w użyciu](credentials.html#credentials-in-use)). Usunięcie bazy danych pozostawia jej poświadczenie bez zmian.

---

## Kto zarządza bazami danych

Bazy danych podlegają tym samym opcjom roli co poświadczenia, które wskazują.

Lista, strona bazy danych i jej API wymagają opcji roli `showSettings` lub `showConnectionsSettings`, tak jak poświadczenia.
Tylko admin może sprawić, że baza danych łączy się poświadczeniem, które może wskazać tylko admin, np. takim, które odczytuje hasło z
magazynu sekretów (zobacz [Kto może zmienić poświadczenie](credentials.html#who-may-change-a-credential)): formularze, które ją odpytują,
łączyłyby się tym poświadczeniem, a **Testuj połączenie** wysłałoby jego sekret na jego serwer. Inny użytkownik może ponownie zapisać bazę
danych z poświadczeniem, które już wskazuje.

Baza danych zadeklarowana w [config seed](seed/) jest na swojej stronie tylko do odczytu: zmień ją zamiast tego w pliku seed.

---

## Config seed

Seed deklaruje swoje bazy danych w sekcji `databases:`, po poświadczeniach, które wskazują.

Każdy element ma `name`, `credential` typu baza danych i opcjonalnie `description`. Poświadczenie może pochodzić z sekcji
`credentials` tego samego seeda albo być utworzone w aplikacji:

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

Zobacz pełny [przykład](seed/example.html) i [Obiekty zarządzane](seed/managed-objects.html), aby dowiedzieć się, jak seed zarządza tym, co deklaruje.

---

## REST API

Skrypty zarządzają bazami danych przez [REST API](api/), pod `/api/v2/database`, z tymi samymi opcjami roli co strona.

| Wywołanie | Co robi |
|---|---|
| `GET /api/v2/database` | Wyświetla bazy danych, każdą z typem bazy danych, bazą danych, hostem i portem jej poświadczenia oraz liczbą formularzy, które ją odpytują (`used_by_count`) |
| `GET /api/v2/database?name=<name>` | Pobiera bazę danych o tej nazwie |
| `GET /api/v2/database/<id>` | Pobiera jedną bazę danych |
| `POST /api/v2/database` | Dodaje bazę danych: jej `name`, `credential` i opcjonalnie `description` |
| `PUT /api/v2/database/<id>` | Zmienia bazę danych |
| `DELETE /api/v2/database/<id>` | Usuwa bazę danych; jej poświadczenie zostaje |
| `POST /api/v2/database/<id>/check` | Testuje jej połączenie, jej poświadczeniem |

```bash
curl -X POST https://forms.example.com/api/v2/database \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "cmdb", "description": "The CMDB", "credential": "cmdb-login" }'
```

`credential`, które nie istnieje lub nie jest typu baza danych, jest odrzucane z kodem `400`. Każda zmiana jest zapisywana w dzienniku audytu.

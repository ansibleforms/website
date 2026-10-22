---
layout: default
title: Administracja
parent: Przegląd interfejsu
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administracja
{: .no_toc }

Menu Ustawienia: system, wygląd, dostęp, połączenia i dzienniki
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Menu Ustawienia

**Ustawienia** w nagłówku otwierają strony administracyjne, pogrupowane w menu po lewej w sekcjach **System**, **Wygląd**,
**Dostęp**, **Połączenia** i **Dzienniki**. Każda pozycja jest widoczna tylko dla użytkownika z opcją roli, której wymaga jej strona:
`allowBackupOps` dla **Kopie zapasowe**, `showLogs` dla **Dziennik serwera** i `showSettings` dla wszystkich pozostałych stron.
Od wersji 7.3.0 trzy opcje otwierają część z nich bez reszty:

| Opcja roli | Otwiera |
|---|---|
| `showAppearanceSettings` | Strony **Wygląd** |
| `showConnectionsSettings` | Strony **Połączenia**, z wyjątkiem **Syslog**; repozytoria, magazyny sekretów i chronione poświadczenia może zmieniać tylko administrator |
| `showAuditLog` | **Dziennik audytu** |

Opcje ról opisuje strona [Role](../config/roles.html#role-options).

---

## Listy i strony rekordów

Od wersji 7.3.0 listy ustawień i strony rekordów mają wspólny układ, z elementami sterującymi w osobnym wierszu pod tytułem:

| Element | Jak działa |
|---|---|
| Pole wyszukiwania | Pierwsze w tym wierszu na każdej stronie ustawień i stronie rekordu. Słowo zawęża od razu wszystkie karty: pasujące pola, wiersze lub linie są pokazywane pod nazwą swojej karty |
| Rozmiar strony | Tabela pokazuje tyle wierszy, ile mieści się na ekranie, dopóki nie zostanie wybrany rozmiar strony: 10, 20, 50 lub 100 |
| Kolumny | Każda nazwana kolumna sortuje, a pusta komórka pokazuje `–` |
| Pola wyboru | Wiersze mają je tylko tam, gdzie z zaznaczonymi wierszami można coś zrobić, a menu wiersza (⋮) oferuje tę samą akcję |
| Menu wiersza | Krótkie etykiety, takie jak **Edytuj** i **Usuń**. Lista z kolumną **Włączony** ma ją na pierwszym miejscu i w menu każdego wiersza oferuje **Włącz** lub **Wyłącz**, w zależności od stanu |

Listy z kolumną **Włączony** to dostawcy SSO, katalogi LDAP, runnery, harmonogramy, kanały
powiadomień, serwery syslog, ogłoszenia, etykiety i wersje zastrzeżenia.

---

## System

Sama instancja: jej ustawienia, jej stan i jej kopie zapasowe.

| Strona | Do czego służy |
|---|---|
| **Ogólne** | Zmienne środowiskowe, w kartach od Konfiguracja do Rejestrowanie. Zobacz [Zmienne środowiskowe](../customization/). |
| **Stan** | Kondycja instancji i systemów, od których zależy, w kartach Testy i Informacje. Zobacz [Monitorowanie](../production/monitoring.html). |
| **Kopie zapasowe** | Tworzenie, przywracanie i usuwanie kopii zapasowych bazy danych, config.yaml i formularzy. Zobacz [Kopie zapasowe](../production/backups.html). |

![Ustawienia > Ogólne, karta Konfiguracja](../assets/screenshots/settings.jpg)

### Kopie zapasowe

Lista kopii zapasowych, nocnych i ręcznych: **Dodaj kopię zapasową** tworzy ją od razu, a menu wiersza zawiera **Pokaż kopię zapasową**, **Przywróć** i **Usuń**.

![Ustawienia > Kopie zapasowe](../assets/screenshots/backups.jpg)

### Przywracanie

**Przywróć** pokazuje, co zawiera kopia zapasowa, a następnie ją przywraca; opcja **Utwórz nową kopię zapasową przed przywróceniem (zalecane)** jest domyślnie zaznaczona.

![Przywracanie kopii zapasowej](../assets/screenshots/restore.jpg)

---

## Wygląd

Jak instancja wygląda dla wszystkich i jakie komunikaty wyświetla.

| Strona | Do czego służy |
|---|---|
| **Wartości domyślne** | Motyw, język, widok formularzy, strefa czasowa i format daty użytkowników, którzy niczego nie wybrali. Zobacz [Wartości domyślne](../appearance/defaults.html). |
| **Nazwa** | Nazwa na karcie przeglądarki i na stronie logowania. Zobacz [Nazwa](../appearance/name.html). |
| **Logo** | Twoje własne logo w nagłówku. Zobacz [Logo](../appearance/logo.html). |
| **Ikona** | Twoja własna ikona na karcie przeglądarki. Zobacz [Ikona](../appearance/icon.html). |
| **Linki** | Link do Projektanta oraz Twoje własne linki i menu w nagłówku. Zobacz [Linki](../appearance/links.html). |
| **Etykiety** | Etykiety obok logo, na przykład PRODUCTION i EU. Zobacz [Etykiety](../appearance/labels.html). |
| **Ogłoszenia** | Komunikaty pod nagłówkiem, każdy od swojego początku do końca. Zobacz [Ogłoszenia](../announcements.html). |

---

## Dostęp

Kto może się zalogować i co może robić po zalogowaniu.

| Strona | Do czego służy |
|---|---|
| **Zastrzeżenie** | Warunki, które każdy użytkownik akceptuje raz, i kto zaakceptował którą wersję. Zobacz [Zastrzeżenie](../disclaimer.html). |
| **Użytkownicy** | Użytkownicy lokalni oraz z LDAP i jednokrotnego logowania. Zobacz [Użytkownicy i grupy](../users-and-groups.html). |
| **Grupy** | Grupy lokalne oraz z LDAP i jednokrotnego logowania. Zobacz [Użytkownicy i grupy](../users-and-groups/local-group.html). |
| **Role** | Role z config.yaml: kto je ma i na co pozwalają. Zobacz [Role](../config/roles.html). |
| **LDAP** | Logowanie przez katalog LDAP lub Active Directory. Zobacz [LDAP](../authentication/ldap.html). |
| **SSO** | Jednokrotne logowanie przez dostawców Entra ID lub OpenID Connect. Zobacz [Uwierzytelnianie](../authentication/). |

![Dostęp > LDAP, główny katalog](../assets/screenshots/ldap.jpg)

---

## Połączenia

Systemy, z którymi łączy się AnsibleForms, i dane, którymi się w nich loguje.

| Strona | Do czego służy |
|---|---|
| **Repozytoria** | Repozytoria git, z których pochodzą formularze i playbooki. Zobacz [Repozytoria git](../repositories/). |
| **Poświadczenia** | Konta i sekrety, których używają formularze, playbooki i połączenia. Zobacz [Poświadczenia](../credentials.html). |
| **Magazyny sekretów** | HashiCorp Vault i CyberArk, z których można odczytywać poświadczenia. Zobacz [Magazyny sekretów](../secret-stores/). |
| **Runnery** | Miejsca, w których działają zadania: kontenery RTE dla playbooków oraz AWX i podobne dla szablonów. Zobacz [Runnery](../runners.html). |
| **SSH** | Para kluczy, którą aplikacja łączy się z git, oraz znane hosty. Zobacz [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Powiadomienia** | Serwery SMTP, Slack, Microsoft Teams, Telegram i webhooki. Zobacz [Kanały powiadomień](../notification-channels.html). |
| **Asystent czatu** | Dostawca AI asystenta czatu. Zobacz [Asystent czatu](../chat/). |
| **MCP** | Serwer MCP dla agentów AI. Zobacz [MCP](../mcp/). |
| **Syslog** | Serwery syslog, które odbierają dziennik serwera, dziennik audytu lub oba. Zobacz [Syslog](../production/logs.html#syslog). |

![Połączenia > Poświadczenia, karta Połączenie poświadczenia](../assets/screenshots/credentials.jpg)

---

## Dzienniki

Co wydarzyło się na instancji.

| Strona | Do czego służy |
|---|---|
| **Dziennik audytu** | Kto co zmienił i czy było to dozwolone, z filtrowaniem według użytkownika, akcji i wyniku. Zobacz [Ślad audytu](../production/logs.html#audit-trail). |
| **Dziennik serwera** | Własny dziennik serwera, do rozwiązywania problemów. Zobacz [Dzienniki](../production/logs.html). |

### Dziennik serwera

Ostatnie wiersze dziennika, najnowsze na dole, śledzone na bieżąco w miarę zapisywania. Pole wyszukiwania je filtruje (wyrażenie
regularne), **Wyczyść** opróżnia widok, a nie dziennik, a **Pobierz** zapisuje cały dziennik.

![Dzienniki > Dziennik serwera](../assets/screenshots/logs.jpg)

---

## Dokumentacja API

**Dokumentacja API** w menu pomocy (znak zapytania w nagłówku) prowadzi do Swagger UI API REST pod adresem `/api/v2/docs`.
Zobacz [API](../api/).

![Interfejs Swagger](../assets/screenshots/swagger.jpg)

---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
---

# Config seed
{: .no_toc }

Deklaruj obiekty administracyjne w pliku
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów, którzy wdrażają z gita: zadeklaruj obiekty administracyjne w pliku, żeby instancję dało się odbudować na pustej bazie danych.

---

## Co obejmuje

Ustaw `CONFIG_SEED_PATH` na plik YAML, a AnsibleForms zastosuje go przy starcie. Plik deklaruje obiekty i ustawienia, które
inaczej istnieją tylko w bazie danych:

| Sekcja             | Co deklaruje                                                                      |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Gdzie działają zadania: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins    |
| `secret_stores`    | Magazyny sekretów (HashiCorp Vault, ...)                                          |
| `credentials`      | Poświadczenia                                                                     |
| `databases`        | Bazy danych, które odpytują formularze, każda ze swoim poświadczeniem, od wersji 7.5.0 |
| `sso`              | Dostawców SSO: Entra ID i OIDC (`oauth2` przed wersją 7.8.0)                      |
| `repositories`     | Repozytoria git i to, co aplikacja z każdego z nich odczytuje                     |
| `syslog`           | Serwery syslog, które otrzymują dziennik serwera i wpisy audytu (`syslog_servers` przed wersją 7.8.0) |
| `notifications`    | Serwery poczty, Slack, Teams, Telegram i webhooki (`notification_channels` przed wersją 7.8.0) |
| `labels`           | Etykiety obok logo w nagłówku, od wersji 7.3.0                                    |
| `ldap`             | Konfigurację LDAP                                                                 |
| `settings`         | Publiczny URL; jego klucze poczty są przestarzałe od wersji 7.6.0 na rzecz kanału pocztowego |
| `chat_assistant`   | Dostawcę modelu asystenta czatu (`chat` przed wersją 7.8.0)                       |
| `users`            | Użytkowników, lokalnych i z katalogu, od wersji 7.8.0                             |
| `groups`           | Grupy lokalne i ich członków, od wersji 7.8.0                                     |
| `defaults`         | **Ustawienia > Wygląd > Wartości domyślne**: motyw, język, strefa czasowa, od wersji 7.8.0 |
| `logo`, `icon`     | Logo i ikonę witryny, pliki obrazów obok seeda, od wersji 7.8.0                   |
| `name`             | Nazwę aplikacji, od wersji 7.8.0                                                  |
| `links`            | Linki w nagłówku i to, czy widać link do Designera, od wersji 7.8.0               |
| `announcements`    | Ogłoszenia pod nagłówkiem, od wersji 7.8.0                                        |
| `disclaimer`       | Wersje zastrzeżenia, które akceptują użytkownicy, od wersji 7.8.0                 |
| `mcp`              | Przełączniki serwera MCP, od wersji 7.8.0                                         |
| `ssh`              | Prywatny klucz SSH aplikacji i jej znane hosty, od wersji 7.8.0                   |
| `awx`              | Przestarzałe od wersji 7, usunięte w 8: użyj `runners` z `type: awx`              |

[Przykład](example.html) pokazuje każdą sekcję, a [Obiekty zarządzane](managed-objects.html), w jakim stopniu seed przejmuje to, co każda
deklaruje: większość sekcji czyni swoje obiekty tylko do odczytu w aplikacji, kilka tylko je tworzy lub zmienia.

Seed napisany przed wersją 7 nadal działa: każdy element jego sekcji `awx` jest stosowany jako runner typu `awx`, a dziennik
ostrzega przy każdym zastosowaniu. Przed aktualizacją do 8 przenieś te elementy do `runners` z `type: awx`.

Seed to **nie** to samo co `config.yaml` (`CONFIG_PATH`), konfiguracja bazowa kategorii, ról i stałych. Zamiast niej może je
przechowywać repozytorium, a to repozytorium jest jednym z obiektów deklarowanych przez seed, więc seed nie może znajdować się w nim.

Pierwszy admin nadal pochodzi z `ADMIN_USERNAME` / `ADMIN_PASSWORD`, a użytkownicy LDAP lub SSO z ich katalogu przy logowaniu.
Od wersji 7.8.0 sekcje `users` i `groups` mogą dodawać lokalnych użytkowników i grupy oraz blokować użytkownika katalogu, zanim się zaloguje.

---

## Przemianowane sekcje

Od wersji 7.8.0 cztery sekcje nazywają się tak jak klucze, pod którymi [repozytorium git](../repositories/) przechowuje te same obiekty, bez
`controller_` (`sso:` dla `controller_sso:`):

| Przed wersją 7.8.0        | Od wersji 7.8.0    |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Ich elementy się nie zmieniają. Stare nazwy są nadal odczytywane, przestarzałe od wersji 7.8.0 i usunięte w 8: każda zastosowana zapisuje
ostrzeżenie w dzienniku serwera, podając nową nazwę. Seed, który podaje jedną sekcję pod obiema nazwami, jest odrzucany. Zmień ich nazwy w
pliku przed aktualizacją do 8.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Przykład](example.html) | Kompletny plik seed, sekcja po sekcji |
| [Obiekty zarządzane](managed-objects.html) | Jak seed przejmuje obiekty, które wymienia, i jak trzyma sekrety poza plikiem |
| [Przeładowanie i start](reloading.html) | Zmiana pliku bez restartu i co się dzieje przy starcie |
| [Kubernetes](kubernetes.html) | Wdrażanie AnsibleForms z ConfigMap i Secrets |
| [Edycja i audyt](environment-and-audit.html) | Blokowanie stron ustawień i co zapisuje dziennik audytu |

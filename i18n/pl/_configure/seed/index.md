---
layout: default
title: Config seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 8f8eb798f4ada177abf5210049a523f7f2f4265b
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

Ustaw `CONFIG_SEED_PATH` na plik YAML, a AnsibleForms zastosuje go przy starcie. Plik
deklaruje obiekty, które wcześniej istniały tylko w bazie danych:

| Sekcja                  | Co deklaruje                                                        |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Gdzie działają zadania: RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Magazyny sekretów (HashiCorp Vault, ...)                            |
| `credentials`           | Poświadczenia                                                       |
| `databases`             | Bazy danych, które odpytują formularze, każda ze swoim poświadczeniem, od wersji 7.5.0 |
| `oauth2`                | Dostawców SSO: Entra ID i OIDC                                      |
| `repositories`          | Repozytoria git                                                     |
| `syslog_servers`        | Serwery syslog, które otrzymują dziennik serwera i wpisy audytu     |
| `notification_channels` | Serwery poczty, Slack, Teams, Telegram i webhooki dla powiadomień   |
| `labels`                | Etykiety obok logo w nagłówku, od wersji 7.3.0                      |
| `ldap`                  | Konfigurację LDAP                                                   |
| `settings`              | Publiczny URL i ustawienia poczty używane, gdy żaden kanał pocztowy nie jest aktywny |
| `chat`                  | Dostawcę modelu asystenta czatu                                     |
| `awx`                   | Przestarzałe od wersji 7, usunięte w 8: użyj `runners` z `type: awx` |

Seed napisany przed wersją 7 nadal działa: każdy element jego sekcji `awx` jest stosowany jako runner typu `awx`, a dziennik
ostrzega przy każdym zastosowaniu. Przed aktualizacją do 8 przenieś te elementy do `runners` z `type: awx`.

Seed to **nie** to samo co `config.yaml`, który przechowuje kategorie, role i stałe
i ma własne `CONFIG_PATH`. Oba są celowo rozdzielone:
repozytorium, które *przechowuje* `config.yaml`, jest jednym z obiektów deklarowanych przez seed, więc seed
nie może znajdować się w nim.

Użytkownicy i grupy są pominięci: pochodzą z LDAP lub SSO, a pierwszy admin z `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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

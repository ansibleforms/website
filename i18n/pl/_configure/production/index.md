---
layout: default
title: Środowisko produkcyjne
nav_order: 12
has_children: true
has_toc: false
permalink: /production/
translated_from: 2d7f4be84a76837fae34c1b414a229448bfae4ea
---

# Środowisko produkcyjne
{: .no_toc }

Publikuj, zabezpieczaj kopiami i monitoruj instancję, od której zależą ludzie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Zanim uruchomisz produkcję

Wartości domyślne pozwalają szybko uruchomić instancję, ale kilka z nich służy tylko do pierwszego zapoznania się. AnsibleForms
zapisuje przy starcie ostrzeżenie `[SECURITY]`, gdy `ENCRYPTION_SECRET` lub `ACCESS_TOKEN_SECRET` nie jest ustawione, a
strona **Stan** raportuje kopie zapasowe, ustawienia retencji i sanitizer wyrażeń.

---

## Lista kontrolna dla produkcji

Przejdź przez te punkty raz, zanim użytkownicy zaczną polegać na instancji, i ponownie po dużej aktualizacji:

| Punkt | Co zrobić | Szczegóły |
|------|------------|---------|
| Hasło admina | Zmień hasło lokalnego konta admina | [Utwardzanie](../security/hardening.html#the-admin-account) |
| Sekret szyfrowania | Ustaw [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET), zanim zapiszesz jakiekolwiek poświadczenie | [Sekrety i szyfrowanie](../security/secrets.html#the-two-master-secrets) |
| Sekret tokenów | Ustaw [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), żeby sesje przetrwały restart | [Sekrety i szyfrowanie](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Terminuj TLS własnym certyfikatem, nie przykładowym | [HTTPS](../security/https.html) |
| Reverse proxy | Opublikuj instancję za proxy, opcjonalnie pod [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Endpoint schematu | Ustaw [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) na `0`, gdy schemat już istnieje | [Utwardzanie](../security/hardening.html#the-database) |
| Wywołania wychodzące | Ogranicz wyrażenia REST przez [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Utwardzanie](../security/hardening.html#expressions-and-outbound-calls) |
| Funkcje opcjonalne | Zostaw MCP i asystenta czatu wyłączone, jeśli z nich nie korzystasz | [Utwardzanie](../security/hardening.html#optional-features) |
| Kopie zapasowe | Sprawdź, czy nocna kopia zapasowa działa, i kopiuj ją poza hosta | [Kopie zapasowe](backups.html) |
| Retencja | Zdecyduj, jak długo przechowywać zadania i wpisy audytu | [Dzienniki](logs.html#retention) |

---

## W tej sekcji

Każdy temat ma własną stronę; zabezpieczanie instancji opisuje sekcja [Bezpieczeństwo](../security/):

| Strona | Czego dotyczy |
|---|---|
| [Reverse proxy](reverse-proxy.html) | Publikowanie AnsibleForms za Nginx, Traefik lub Apache, w katalogu głównym lub pod podścieżką |
| [Kopie zapasowe](backups.html) | Nocne kopie zapasowe, ich zawartość, przywracanie i co jeszcze warto zachować |
| [Dzienniki](logs.html) | Pliki dziennika, syslog, ślad audytu oraz retencja zadań i wpisów audytu |
| [Skalowanie](scaling.html) | Kilka węzłów aplikacji z workerem; RTE ma własną sekcję, [Środowiska uruchomieniowe](../rte/) |
| [Monitorowanie](monitoring.html) | Sondy stanu, metryki Prometheus i strona Stan |

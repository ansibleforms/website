---
layout: default
title: Dzienniki
parent: Środowisko produkcyjne
nav_order: 3
translated_from: 17d3894c528610d4916fbdcf4beb5bbbacd2b266
---

# Dzienniki
{: .no_toc }

Pliki dziennika, syslog, ślad audytu oraz jak długo przechowywane są zadania i wpisy audytu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pliki dziennika

AnsibleForms zapisuje dwa dzienniki rotowane codziennie w [`LOG_PATH`](../customization/logging.html#env_LOG_PATH)
(`%PERSISTENT_FOLDER%/logs`), kompresuje starsze dni i przechowuje je przez [`LOG_RETENTION_DAYS`](../customization/logging.html#env_LOG_RETENTION_DAYS)
(domyślnie 30, `0` zachowuje każdy plik; zmiana na stronie ustawień działa od razu):

* `ansibleforms.<date>.log` : wszystko na poziomie [`LOG_LEVEL`](../customization/logging.html#env_LOG_LEVEL) i wyżej
* `ansibleforms.errors.<date>.log` : tylko błędy

Konsola, czytana przez `docker logs` lub `kubectl logs`, ma własny poziom,
[`LOG_CONSOLE_LEVEL`](../customization/logging.html#env_LOG_CONSOLE_LEVEL). Oba domyślnie mają `notice`, co jest właściwe dla
produkcji; używaj `info` lub `debug` tylko podczas diagnozowania problemów i zostaw
[`ENABLE_DB_QUERY_LOGGING`](../customization/features.html#env_ENABLE_DB_QUERY_LOGGING) wyłączone. Poziomy można zmieniać na
stronach ustawień bez restartu, a strona **Dziennik serwera** pokazuje dziennik użytkownikom z opcją `showLogs`.

---

## Wiersze JSON

Dla kolektora logów takiego jak Loki, ELK czy Splunk ustaw [`LOG_FORMAT`](../customization/logging.html#env_LOG_FORMAT) na `json`. Każdy
wiersz, na konsoli i w plikach, jest wtedy jednym obiektem JSON zamiast `<time> <level>: <message>`:

```json
{"time":"2026-10-12T08:15:02.113Z","level":"notice","message":"App running on port 8000!","role":"all","host":"forms01"}
```

| Pole | Zawartość |
|-------|---------|
| `time` | Czas, w ISO 8601 UTC |
| `level` | Poziom logowania |
| `message` | Komunikat |
| `requestId` | Żądanie, do którego należy wiersz, gdy został zapisany podczas jego obsługi |
| `role` | Rola procesu, [`AF_ROLE`](scaling.html), lub `all`, gdy nie jest ustawiona |
| `host` | Nazwa hosta maszyny lub kontenera, w którym działa proces |

Każde żądanie dostaje identyfikator: nagłówek `X-Request-Id` wysłany przez reverse proxy albo nowy. Jest zwracany w nagłówku
`X-Request-Id` odpowiedzi i niesiony przez każdy wiersz zapisany podczas obsługi żądania (jako `[req <id>]` w wierszach tekstowych),
więc żądanie można prześledzić w dzienniku i dopasować do dziennika proxy. Zmiana na stronie ustawień działa od razu.

---

## Syslog

Serwerami syslog zarządza się w **Ustawienia > Połączenia > Syslog**, dzięki czemu serwer syslog lub SIEM dostaje dziennik na bieżąco.
Możesz dodać kilka serwerów, a każdy ma własne ustawienia:

| Ustawienie | Co robi |
|---------|--------------|
| Włączony | Cokolwiek dostają tylko włączone serwery, więc serwer można wstrzymać bez usuwania; przełączają go też **Włącz** i **Wyłącz** w menu wiersza |
| Protokół | `udp4` (domyślnie), `udp6`, `tcp4`, `tcp6`, `tls4`, `tls6`, `unix` lub `unix-connect` |
| Host i port | Serwer docelowy, domyślnie port `514`; protokół `unix` przyjmuje zamiast tego ścieżkę gniazda |
| Otrzymuje | Dziennik serwera, wpisy audytu lub oba (domyślnie dla nowego serwera) |
| Poziom | Najniższy poziom dziennika serwera, który otrzymuje, domyślnie `info`; wpisy audytu są wysyłane zawsze |
| Typ | `BSD` (RFC 3164, domyślnie) lub `RFC 5424` |

Zmiana działa na każdym węźle bez restartu, a strona serwera ma przycisk, który wysyła do niego komunikat testowy.
Nieosiągalny serwer nigdy nie zatrzymuje aplikacji: błąd jest zapisywany na konsoli.

Od wersji 7.3.0 serwery syslog wymagają pełnych uprawnień do ustawień, czyli opcji roli [`showSettings`](../config/roles.html#role-options):
sam dostęp do ustawień połączeń nie wystarcza, bo serwer syslog otrzymuje dziennik serwera i wpisy audytu.

Zmienne `LOG_SYSLOG_*` z wcześniejszych wersji są przestarzałe od wersji 7. Pierwsze uruchomienie, które znajdzie ustawioną
[`LOG_SYSLOG_HOST`](../customization/logging.html#env_LOG_SYSLOG_HOST), importuje je jednorazowo jako serwer `syslog`,
który otrzymuje dziennik serwera jak wcześniej, i od tej pory je ignoruje. Po tym pierwszym uruchomieniu usuń je ze środowiska
i zarządzaj serwerem na stronie ustawień.

---

## Ślad audytu

Strona **Dziennik audytu** (w **Ustawienia > Dzienniki**) zapisuje, kto co zmienił, na co pliki dziennika słabo odpowiadają.
Zapisuje:

* każdą zmianę wykonaną przez API (`POST`, `PUT`, `PATCH`, `DELETE`), łącznie z próbami odrzuconymi kodem 401 lub 403
* logowania, z nazwą użytkownika, której próbowano
* zdarzenia samej aplikacji, takie jak nocne kopie zapasowe, usunięte kopie zapasowe, wyczyszczone zadania i zastosowania config seed

Każdy wpis ma czas, wykonawcę (użytkownika lub samą aplikację dla jej własnych zadań), adres IP klienta,
akcję, jej cel i wynik: `success`, `failure` lub `denied`. Strona filtruje po wykonawcy, akcji i
wyniku, a otworzyć ją mogą użytkownicy z opcją roli `showSettings`.

Adres IP to ten, który widzi AnsibleForms, czyli adres proxy, gdy aplikacja działa za proxy. Ustaw
[`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) na liczbę lub adresy swoich proxy, a AnsibleForms
zapisze zamiast tego adres klienta, który proxy podaje w `X-Forwarded-For`; zobacz [Reverse proxy](reverse-proxy.html).

Aby przechowywać ślad audytu poza instancją, dla SIEM, dodaj serwer syslog, który otrzymuje wpisy audytu (zobacz
[Syslog](#syslog)). Każdy wpis jest wysyłany na bieżąco, jako jeden wiersz `audit {...}` z wpisem w JSON, niezależnie od
poziomu serwera. Kopii w syslogu nie usuwa poniższa retencja ani nie zastępuje jej przywrócenie bazy danych.

---

## Retencja

Dwa codzienne zadania z ustawieniem chronią bazę danych przed nieograniczonym rozrostem:

| Zmienna | Domyślnie | Uruchamia się o | Usuwa |
|----------|---------|---------|---------|
| [`AUDIT_RETENTION_DAYS`](../customization/retention.html#env_AUDIT_RETENTION_DAYS) | `365` | 3:30 | Wpisy audytu starsze niż ta wartość |
| [`JOB_RETENTION_DAYS`](../customization/retention.html#env_JOB_RETENTION_DAYS) | `0` (zachowaj wszystko) | 2:30 | Zakończone zadania starsze niż ta wartość, z ich wynikiem |

`0` zachowuje wszystko w obu przypadkach. Dwa kolejne codzienne zadania nie mają ustawienia: o 3:00 usuwane są zapisane tokeny odświeżania starsze niż 30 dni i
wygasłe unieważnienia tokenów, a o 4:00 [zapisane zadania](../jobs/stored-jobs.html), których termin ważności minął.
Godziny są w strefie czasowej [`LOG_TZ`](../customization/logging.html#env_LOG_TZ), a uruchamia je worker.

Wynik zadań to zwykle najszybciej rosnąca tabela: strona **Stan** raportuje jej rozmiar
i ostrzega, gdy przekroczy 1 GB bez ustawionej retencji. Działające zadania i zadania czekające na zatwierdzenie nigdy nie są usuwane.
Wybierz retencję zadań zgodną z wymaganiami audytu, a ślad audytu przechowuj co najmniej tak samo długo.

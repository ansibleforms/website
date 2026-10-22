---
layout: default
title: Utwardzanie
parent: Bezpieczeństwo
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Utwardzanie
{: .no_toc }

Konto admina, limity logowania, baza danych, wyrażenia, dane zadań, polityka przeglądarki, funkcje opcjonalne i opcje ról
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Konto admina

Lokalne konto admina jest tworzone przy pierwszym uruchomieniu z [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
i [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), którego wartość domyślna to `AnsibleForms!123`.

* Logowanie publicznym hasłem domyślnym `AnsibleForms!123` wymusza najpierw jego zmianę: do tego czasu serwer odpowiada
  na każde żądanie poza zmianą hasła kodem `403` (kod `password_change_required`), a przeglądarka pokazuje
  stronę zmiany hasła, której nie da się zamknąć. Nowe hasło nie może być ponownie domyślnym.
* `ADMIN_PASSWORD` jest odczytywane tylko przy pierwszym tworzeniu konta: ustaw własną wartość przed pierwszym uruchomieniem.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` resetuje hasło do `ADMIN_PASSWORD` przy każdym
  uruchomieniu. Używaj tego tylko do odzyskania utraconego hasła, potem usuń zmienną i uruchom ponownie.
* Najpierw ustaw dwa główne sekrety: zobacz [Sekrety i szyfrowanie](secrets.html).
* Gdy logowanie przez LDAP lub SSO działa, zostaw lokalnego admina tylko na sytuacje awaryjne, z długim hasłem przechowywanym w Twoim sejfie.

---

## Limity logowania i hasła

Odgadywanie haseł spowalniają trzy limity. Niepowodzenia są liczone w bazie danych, więc każdy węzeł aplikacji widzi te
same próby, a każdy limit działa bez restartu:

| Zmienna | Domyślnie | Co robi |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Po tylu nieudanych logowaniach konto lokalne lub LDAP jest blokowane na `LOGIN_LOCKOUT_MINUTES`. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Adres z tyloma nieudanymi logowaniami w ciągu `LOGIN_LOCKOUT_MINUTES` jest wstrzymywany do końca tego okna: jeden adres próbujący wielu kont. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Jak długo konto pozostaje zablokowane i okno, w którym liczone są niepowodzenia. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Żądania na minutę z jednego adresu, na węzeł aplikacji, do logowania, wylogowania, odświeżania tokenu i wywołań zwrotnych logowania jednokrotnego. |

Zablokowane konto lub wstrzymany adres dostaje `429` z nagłówkiem `Retry-After`, zanim jakiekolwiek hasło zostanie sprawdzone, i
niezależnie od tego, czy konto istnieje; powyżej `AUTH_RATE_LIMIT` odpowiedzią też jest `429`. Udane logowanie zeruje
licznik konta, podobnie jak ustawienie hasła użytkownika przez admina. `0` wyłącza limit; `LOGIN_LOCKOUT_MINUTES=0`
wyłącza zarówno blokadę, jak i limit na adres.

`LOGIN_MAX_FAILURES_PER_IP` i `AUTH_RATE_LIMIT` liczą na adres klienta: za reverse proxy ustaw `TRUST_PROXY`,
żeby adres był adresem klienta, a nie proxy, zobacz [Adresy klientów](../production/reverse-proxy.html#client-addresses).

Lokalne hasło ustawiane przez aplikację, dla nowego użytkownika, przez admina lub przez użytkowników zmieniających własne, musi mieć
co najmniej [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) znaków (domyślnie `8`,
`0` nie sprawdza długości). Nie może być nazwą użytkownika ani publicznym hasłem domyślnym. `ADMIN_PASSWORD` nie jest sprawdzane.

---

## Baza danych

AnsibleForms przechowuje każde poświadczenie i zadanie w swojej bazie danych MySQL, więc trzymaj tę bazę danych poza siecią:

* Projekt docker-compose publikuje MySQL na hoście (`MYSQLDB_LOCAL_PORT`, `3306`) i jest dostarczany z hasłem root
  `AnsibleForms!123`. Usuń to mapowanie portu lub powiąż je z `127.0.0.1` i zmień hasło.
* Łącz się dedykowanym kontem zamiast `root`, ustawionym w [`DB_USER`](../customization/server.html#env_DB_USER) i
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Potrzebuje ono uprawnień tylko do schematu `AnsibleForms`:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Obejmuje to tworzenie schematu (łącznie z `CREATE DATABASE`), łatanie go przy aktualizacjach oraz
  [kopie zapasowe](../production/backups.html) i przywracanie, które działają jako ten sam użytkownik: zrzut jest wykonywany z
  `--no-tablespaces`, więc żadne globalne uprawnienie, takie jak `PROCESS`, nie jest potrzebne. Tam, gdzie to możliwe, zastąp `%` adresem
  aplikacji. Użytkownik z uprawnieniami do każdej bazy danych, jak `root`, zamienia lukę w aplikacji w
  lukę w całym serwerze baz danych: strona **Stan** ostrzega o tym w teście **Użytkownik bazy danych**, a dziennik
  przy każdym starcie.
* Ustaw [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) na `0`, gdy schemat już istnieje.
  Tworzenie schematu najpierw usuwa każdą tabelę; przy `0` nie może go uruchomić ani bootstrap przy starcie, ani endpoint
  `/api/v2/schema`.

---

## Wyrażenia i wywołania wychodzące

Wyrażenia serwerowe działają na serwerze dla każdego zalogowanego użytkownika, więc sanitizer i filtry wychodzące mają znaczenie:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` lub `paranoid`, nigdy `legacy`, które pozwala użytkownikom uruchamiać kod serwera.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : hosty, do których wyrażenia REST nie mogą docierać, np. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : gdy jest ustawiona, wyrażenia REST mogą docierać
  tylko do tych hostów i zakresów. Lista zabronionych wygrywa z nią.

Obie listy obejmują tylko funkcje pomocnicze REST samego AnsibleForms; playbooki działają poza nimi i nie są filtrowane.

Od wersji 7.3.0 funkcje pomocnicze REST sprawdzają certyfikat endpointu, jak każde inne połączenie.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` wyłącza sprawdzanie: używaj tego tylko dla
endpointów z certyfikatem samopodpisanym.

---

## Dane zadań

Extravars i wynik zadań są przechowywane w bazie danych i pokazywane każdemu, kto widzi zadanie:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : extravars, których klucz pasuje, są
  pokazywane jako `********`. Domyślnie `password|secret|token`; pola haseł są zawsze maskowane. Rozszerz je o
  nazwy używane przez Twoje formularze, np. `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : przycina obiekt `ansibleforms_user`
  wysyłany z każdym zadaniem, który w przeciwnym razie zawiera całe członkostwo użytkownika w grupach.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) ukrywa tylko hałaśliwe taski; sekrety ukrywaj przez `no_log`.

---

## Content-Security-Policy

Interfejs jest udostępniany z nagłówkiem Content-Security-Policy, który ogranicza, co strona może wczytać i uruchomić w przeglądarce:

* Skrypty pochodzą wyłącznie z samej aplikacji, więc skrypt wstrzyknięty do strony się nie uruchomi.
* Żadna inna witryna nie może wyświetlać interfejsu w ramce.
* Pozwala na to, czego potrzebuje aplikacja: lokalne wyrażenia formularzy obliczane w przeglądarce (`'unsafe-eval'`), style
  inline, obrazy z dowolnego URL (obrazy formularzy i kategorii) oraz workery edytora kodu.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) domyślnie ma wartość `1` i tak powinno
zostać. Przy `0` polityka jest wysyłana jako `Content-Security-Policy-Report-Only`: konsola przeglądarki wyświetla, co by
zablokowała, i nic nie jest blokowane. Używaj `0` tylko dla konfiguracji, która jeszcze nie działa z polityką, np. reverse proxy,
które wstrzykuje własny skrypt. Zmiana na stronie ustawień działa bez restartu.

---

## Strony ustawień i projektant

Administratorzy mogą zmieniać dużą część konfiguracji z przeglądarki. Zawęź to, gdy konfiguracja jest przechowywana gdzie indziej:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : ustawienia tylko do odczytu, dla [zarządzanego środowiska](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : usuwa wbudowanego projektanta, gdy formularze
  są utrzymywane w gicie.

---

## Funkcje opcjonalne

Te funkcje są domyślnie wyłączone. Włączaj je tylko wtedy, gdy z nich korzystasz; zmiana na stronie ustawień działa bez restartu:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : udostępnia [serwer MCP](../mcp/) pod `/api/v2/mcp`,
  dzięki czemu klienci MCP mogą uruchamiać formularze tokenem użytkownika.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : [asystent czatu](../chat/). Definicje formularzy
  i wypełniane wartości są wysyłane do skonfigurowanego dostawcy modelu.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) działa odwrotnie: domyślnie ma wartość `enforce`,
więc serwer odrzuca uruchomienie, którego wartości łamią reguły formularza, także uruchomienia przez REST API.
Zostaw tak: `log` tylko zapisuje w dzienniku to, co zostałoby odrzucone, a `off` niczego nie sprawdza, zobacz [Walidacja uruchomień](../launch-validation/).

---

## Opcje ról

Niektóre opcje ról w [config.yaml](../config/roles.html) dają więcej, niż sugeruje ich nazwa. Nadawaj je ostrożnie:

| Opcja | Dlaczego ma znaczenie |
|--------|----------------|
| `allowScheduledJobs` | Użytkownik z tą opcją widzi i może zmieniać każdy harmonogram, a harmonogram działa z uprawnieniami admina, dla dowolnego formularza. Traktuj ją jak opcję na poziomie admina. |
| `allowBackupOps` | Obejmuje **przywracanie**, które zastępuje całą bazę danych. |
| `showSettings` | Otwiera strony administracyjne. Bez roli admin nie pozwala zmieniać kont i grup wskazanych przez rolę admin, zobacz [Użytkownicy i grupy](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Pokazuje dziennik serwera, który może zawierać nazwy hostów, nazwy użytkowników i szczegóły błędów. |
| `showConnectionsSettings` | Otwiera strony połączeń: poświadczenia, runnery, kanały powiadomień i inne. Dodawanie, zmiana i usuwanie runnerów i magazynów sekretów pozostają w gestii admina, tak samo jak poświadczenia połączeń i logowań. W przypadku repozytorium dodawanie go lub usuwanie oraz zmiana jego adresu, gałęzi lub flag `use_for_*` pozostają w gestii admina. |
| `showAllJobLogs` | Pokazuje zadania każdego użytkownika, nie tylko własne. |
| `manageAllJobs` | Przerywa, usuwa i ponownie uruchamia zadania każdego użytkownika. |
| `allowApiTokens` | Pozwala użytkownikowi tworzyć tokeny API, które żyją do [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (domyślnie 90). Wylogowanie tokenem lub jego unieważnienie go kończy, a zmiana hasła kończy wszystkie tokeny użytkownika, zobacz [Tokeny](secrets.html#tokens). |
| `extendedTokenExpiration` | Z `allowApiTokens` pozwala też tworzyć tokeny API, które nigdy nie wygasają. |
| `allowFileUploads` | Pozwala użytkownikowi przesyłać pliki przez pola plików formularza. Włączona dla każdego użytkownika, chyba że rola ją wyłącza. |
| `allowChat`, `allowMcp` | Pozwalają użytkownikowi korzystać z asystenta czatu i serwera MCP, gdy są włączone. `allowChat` jest włączona dla każdego użytkownika, chyba że rola ją wyłącza, a `allowMcp` podąża za `allowChat`, chyba że rola ją ustawia. |

Użytkownik bez roli `admin` nie dostaje żadnej z powyższych opcji na poziomie admina, chyba że da mu ją rola. Gdy rola `admin`
nie ustawia żadnych opcji, jej użytkownicy dostają `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` i `allowScheduledJobs`. `allowApiTokens` i
`extendedTokenExpiration` pozostają wyłączone nawet dla roli `admin`: ustaw je w rolach, które ich potrzebują.

Gdy kilka ról użytkownika ustawia tę samą opcję, wygrywa `false`. Opcje roli `default` uzupełniają tylko opcje,
których nie ustawia żadna z własnych ról użytkownika; nigdy ich nie unieważniają.

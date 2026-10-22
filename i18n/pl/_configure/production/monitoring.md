---
layout: default
title: Monitorowanie
parent: Środowisko produkcyjne
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Monitorowanie
{: .no_toc }

Sondy stanu dla load balancera lub Kubernetes, metryki Prometheus i strona Stan
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sondy stanu

Dwa endpointy mówią load balancerowi, healthcheckowi kontenera lub Kubernetes, czy proces może przyjmować ruch.
Żaden nie wymaga logowania i żaden nie zwraca niczego o konfiguracji:

| Endpoint | Odpowiada | Do czego go używać |
|----------|---------|------------|
| `/api/v2/live` | `200` z `{"status":"live"}`, dopóki proces działa | Sonda liveness: zrestartuj proces, gdy przestanie odpowiadać |
| `/api/v2/ready` | `200` z `{"status":"ready"}` lub `503` z `{"status":"not ready","reason":"..."}` | Sonda readiness: kieruj ruch tylko do gotowych procesów |

Proces jest gotowy, gdy spełnione są wszystkie te warunki:

* nie jest w trakcie zamykania (`stopping`)
* baza danych odpowiada (`database unreachable`)
* schemat istnieje (`schema not provisioned`) i jest kompletny, z każdą tabelą, kolumną i indeksem tej wersji
  (`schema not upgraded`); to ostatnie sprawdzenie jest buforowane przez 30 sekund, więc sonda co kilka sekund pozostaje tania

Przy [`BASE_URL`](../customization/server.html#env_BASE_URL) ścieżki zaczynają się od niego, np.
`/ansibleforms/api/v2/ready`. Środowisko uruchomieniowe (RTE) odpowiada na te same sondy pod `/live` i `/ready`, bez
sprawdzania kompletności schematu; nie jest gotowe, gdy przy zamykaniu kończy swoje zadania, więc nie trafia do niego żadne nowe zadanie. RTE w trybie wychodzącym
też nie jest gotowe (`not connected to the app`), dopóki jego gniazdo do aplikacji nie jest otwarte.
Proces uruchomiony z `AF_ROLE=worker` nie ma interfejsu WWW: odpowiada tylko na `/api/v2/version` i `/health` dla
healthchecku swojego kontenera. Role opisuje strona [Skalowanie](scaling.html).

---

## Metryki Prometheus

Ustaw [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) na długi losowy ciąg, aby udostępniać metryki Prometheus.
Proces obsługujący aplikację WWW odpowiada pod `/api/v2/metrics`, RTE pod `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Bez `METRICS_TOKEN` endpointy odpowiadają `404`, jakby nie istniały, a żądanie bez właściwego nagłówka
`Authorization: Bearer <token>` dostaje `401`. Każdy proces raportuje własne wartości, więc zbieraj metryki z każdego:

| Metryka | Co mierzy |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | Proces: CPU, pamięć, opóźnienie pętli zdarzeń, odśmiecanie pamięci |
| `af_http_requests_total{route,method,status}` | Obsłużone żądania |
| `af_http_request_duration_seconds{route}` | Jak długo trwały |
| `af_jobs{status}` | Zadania, które teraz działają (`running`) lub czekają na zatwierdzenie (`approve`) |
| `af_jobs_ended_24h{status}` | Zadania zakończone w ciągu ostatnich 24 godzin, według statusu |
| `af_nodes{role,alive}` | Procesy zarejestrowane w bazie danych, według roli, żywe lub nie |
| `af_login_failures_total`, `af_login_lockouts_total` | Nieudane logowania i blokady kont |
| `af_rte_running_jobs`, `af_rte_max_jobs` | Na RTE: playbooki, które teraz uruchamia, i ile może uruchamiać naraz |
| `af_rte_socket_connected` | Na RTE w trybie gniazda: `1`, gdy jego gniazdo do aplikacji jest otwarte, `0`, gdy nie |

Wartości zadań i węzłów są odczytywane z bazy danych przy każdym zbieraniu. Gdy baza danych nie odpowiada, są one pomijane,
a zbieranie i tak się udaje z pozostałymi metrykami.

---

## Strona Stan

Strona **Stan**, w **Ustawienia > System**, pokazuje użytkownikom z opcją roli `showSettings`, w jakiej kondycji jest instancja.
Tylko odczytuje, więc jej odświeżenie nigdy nie wysyła poczty ani nie uruchamia zadania. Ma dwie karty, a liczba problemów jest widoczna na etykiecie karty **Testy**.

### Testy

Każdy test jest zielony (w porządku), bursztynowy (wymaga uwagi) lub czerwony (problem), ze szczegółami po rozwinięciu wiersza:

| Test | Co sprawdza |
|-------|------------------|
| Połączenie z bazą danych | Baza danych odpowiada |
| Użytkownik bazy danych | Bursztynowy, gdy użytkownik ma uprawnienia do każdej bazy danych, jak `root`, zamiast tylko do `AnsibleForms.*` |
| Schemat bazy danych | Każda tabela, kolumna i indeks tej wersji istnieje, a jeśli nie, która łatka się nie powiodła |
| Harmonogram zadań | Worker uruchamia zadania systemowe i żadne z nich nie przestało być planowane |
| Węzły | Procesy w bazie danych, bursztynowy, gdy działają w różnych wersjach |
| Zadania | Działające zadania i zadania czekające na zatwierdzenie, bursztynowy, gdy zadanie działa dłużej niż 24 godziny |
| Narzędzia kopii zapasowych | Polecenie zrzutu z [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) istnieje, i jego wersja |
| Ostatnia kopia zapasowa | Bursztynowy, gdy nie ma żadnej lub najnowsza ma więcej niż dwa dni, czerwony, gdy nie ma użytecznego zrzutu |
| Blokada projektanta | Kto trzyma blokadę projektanta, bursztynowy, gdy jest trzymana dłużej niż 8 godzin |
| Repozytoria | Czerwony, gdy repozytorium się nie powiodło lub nie ma kopii roboczej na dysku |
| Config seed | Plik [config seed](../seed/) jest czytelny i się parsuje, a jego ostatnie przeładowanie się udało |
| Magazyny sekretów | Każdy magazyn sekretów odpowiada, bursztynowy, gdy token HashiCorp Vault wkrótce wygasa |
| Runnery | Każdy runner odpowiada, bursztynowy, gdy nie ma żadnego lub nie ma domyślnego RTE |
| Wyrażenia serwera | Bursztynowy, gdy [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) ma wartość `legacy` |
| Sekrety | Bursztynowy, gdy `ENCRYPTION_SECRET` to publiczna wartość domyślna lub `ACCESS_TOKEN_SECRET` nie jest ustawione |
| LDAP | Serwer LDAP jest osiągalny, a jego certyfikat TLS jest ważny, bez logowania się do niego |
| Magazyn zadań | Rozmiar tabel zadań, bursztynowy powyżej 1 GB, gdy nie ustawiono retencji zadań |
| Foldery z prawem zapisu | Do każdego skonfigurowanego folderu można zapisywać |
| Miejsce na dysku | Dysk z kopiami zapasowymi, bursztynowy od 85% zajętości i czerwony od 95% |

### Informacje

Fakty o instancji, które nie mają oceny, czyli pierwsze rzeczy, o które pyta wsparcie: wersja AnsibleForms,
bazowy URL, wersja i host bazy danych, źródło konfiguracji, config seed, ustawienia
retencji, metody uwierzytelniania, serwer aktywnego [kanału pocztowego](../notification-channels.html), poziom
i ścieżka dziennika, czas działania, strefa czasowa, wersja Node.js i platforma.

Strona odczytuje `/api/v2/health`, co wymaga zalogowanego użytkownika z `showSettings`. W systemie monitorowania używaj zamiast tego
powyższych sond i metryk.

---
layout: default
title: Procesy systemowe
parent: Zadania
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Procesy systemowe
{: .no_toc }

Procesy konserwacji, które AnsibleForms uruchamia sam, i kiedy działają
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: czyszczenia, nocna kopia zapasowa i pozostała praca serwera w tle, wymienione w **Zadaniach** od wersji 7.8.0.

---

## Procesy

Serwer uruchamia te procesy sam, każdy według crona w strefie czasowej serwera, ustawianej przez [`LOG_TZ`](../customization/logging.html#env_LOG_TZ):

| Proces | Domyślnie działa | Co robi |
|---|---|---|
| **Porzucone zadania** | Co godzinę | Kończy zadania, które działały dobę bez wyniku i których nie przejął żaden runner (zobacz [Porzucone zadania](cleanup.html#abandoned-jobs)) |
| **Zatrzymane węzły** | Co minutę | Zwalnia zadania, rezerwacje i runnery trzymane przez węzły AnsibleForms i RTE, które przestały odpowiadać |
| **Koniec harmonogramów** | Co minutę | Wyłącza lub usuwa [harmonogramy](schedules.html), które dotarły do swojego końca |
| **Resynchronizacja harmonogramów** | Co 5 minut | Ponownie odczytuje z bazy danych harmonogramy i pobrania repozytoriów, na wypadek pominiętego powiadomienia o zmianie |
| **Wygasłe tokeny** | Codziennie o 03:00 | Usuwa wygasłe tokeny logowania, unieważnienia tokenów i tokeny API |
| **Czyszczenie audytu** | Codziennie o 03:30 | Usuwa wpisy audytu starsze niż `AUDIT_RETENTION_DAYS` |
| **Czyszczenie zadań** | Codziennie o 02:30 | Usuwa zakończone zadania starsze niż `JOB_RETENTION_DAYS`, wraz z ich wynikiem |
| **Nocna kopia zapasowa** | Codziennie o północy | Wykonuje kopię zapasową bazy danych i usuwa najstarsze nocne kopie ponad `NIGHTLY_BACKUP_RETENTION` |
| **Czyszczenie zapisanych zadań** | Codziennie o 04:00 | Usuwa zapisane zadania po dacie wygaśnięcia lub nieużywane przez `STORED_JOB_UNUSED_DAYS` i zapomina węzły nieobecne od doby |
| **Ponowne wczytanie config seed** | Co minutę | Ponownie stosuje [config seed](../seed/reloading.html), gdy jego plik się zmienił |

Ustawienia przechowywania opisuje strona [Kopie zapasowe i retencja](../customization/retention.html), a kopie zapasowe strona
[Kopie zapasowe](../production/backups.html). **Ponowne wczytanie config seed** jest wyłączone bez [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Te procesy działają na węźle, który wykonuje pracę w tle: na procesie bez `AF_ROLE` albo na `worker`, który trzyma blokadę workera,
gdy aplikacja jest podzielona na kilka węzłów (zobacz [Skalowanie](../production/scaling.html#roles)).

---

## Pętle huba runnerów

Hub runnerów przekazuje zadania do RTE, a trzy jego własne pętle działają co kilka sekund zamiast według crona:

| Pętla | Domyślnie działa | Co robi |
|---|---|---|
| **Przekazywanie do runnerów** | Co 2 sekundy | Przekazuje oczekujące zadania i anulowania ich runnerom; uruchomione na innym węźle dociera do runnera przy następnym przebiegu |
| **Łączenie z runnerami inbound** | Co 10 sekund | Łączy się z runnerami [inbound](../rte/modes.html#inbound), które ten węzeł może trzymać, ponownie z takim, który stracił gniazdo |
| **Czyszczenie zakończonych zadań** | Co 60 sekund | Zwalnia to, co ten węzeł przechowywał o zadaniach zakończonych na innym węźle |

Pętle działają na każdym węźle, który uruchamia aplikację webową, więc przy kilku węzłach aplikacji każdy ma własne. Minuta, najmniejszy
krok crona, jest dla nich zbyt duża: każda działa co określoną liczbę sekund.

---

## Lista System

Strona [Zadania](./) wymienia procesy w sekcji **Przyszłe**, jako **System**, z liczbą procesów, dla administratorów (opcja roli `showSettings`).

Lista ma jeden wiersz na proces i pętlę i jest odczytywana ponownie co minutę:

| Kolumna | Pokazuje |
|---|---|
| **Nazwa** | Nazwę procesu |
| **Harmonogram** | Kiedy działa, słowami (*Co godzinę*, *Co 2 s*), jego cron po najechaniu kursorem, lub **Wyłączony** dla procesu, który nie działa |
| **Ostatnie uruchomienie** | Kiedy zaczęło się ostatnie uruchomienie, lub kreskę, gdy nigdy nie działał |
| **Następne uruchomienie** | Kiedy działa następnym razem |
| **Stan** | Jak poszło ostatnie uruchomienie: `success` lub `failed` |

**Kolumny** oferują też **Opis**, czyli co robi każdy proces. Kliknięcie wiersza otwiera stronę procesu. Procesy należą do samej
aplikacji: nie można ich dodawać ani usuwać.

---

## Strona procesu

Strona procesu ma trzy karty, nad nimi **Uruchom teraz** i **Zapisz**, oraz pole wyszukiwania, które zawęża wszystkie karty naraz.

| Karta | Co pokazuje |
|---|---|
| **Szczegóły** | Jego **Nazwę** i **Opis**, **Ostatnie uruchomienie** (błąd po najechaniu, gdy się nie udało), **Wynik** ostatniego uruchomienia, **Następne uruchomienie**, **Węzeł**, który odpowiedział dla pętli, oraz **Stosowane ustawienie** |
| **Harmonogram** | Kiedy działa: cron dla procesu, **Interwał** w sekundach dla pętli |
| **Uruchomienia** | Każde zapisane uruchomienie, najnowsze najpierw |

**Stosowane ustawienie** podaje zmienną i jej wartość, na przykład `JOB_RETENTION_DAYS` 90, z łączem **Zmień w Ustawieniach**, które
otwiera kartę ustawień, gdzie się ją zmienia. Proces bez takiego ustawienia pokazuje kreskę.

### Karta Harmonogram
{: .no_toc }

Cron procesu edytuje się w tym samym edytorze co cron harmonogramu: gotowe ustawienia, wyrażenie słowami i trzy następne uruchomienia,
w strefie czasowej serwera. Przyjmuje 5 pól (minuta, godzina, dzień, miesiąc i dzień tygodnia) i musi uruchamiać się ponownie. Pętla
przyjmuje całkowitą liczbę sekund w swoich granicach, które podaje wiersz pod polem.

**Zapisz** zapisuje wartość w zarządzanym pliku ustawień, tak jak strony ustawień, i od razu stosuje ją na każdym węźle, bez
restartu. Wartość ustawiona w środowisku procesu, lub każda wartość przy [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
jest tylko do odczytu, z wierszem *Ustawione przez zmienną środowiskową* i jej nazwą.

### Karta Uruchomienia
{: .no_toc }

Każde uruchomienie procesu to wiersz z tymi kolumnami:

| Kolumna | Pokazuje |
|---|---|
| **Uruchomione przez** | Użytkownika, który wybrał **Uruchom teraz**, np. `admin (local)`, lub **Harmonogram** dla uruchomienia według crona |
| **Czas rozpoczęcia**, **Czas zakończenia** i **Czas trwania** | Kiedy uruchomienie się zaczęło i skończyło, i ile trwało |
| **Stan** | `success` lub `failed` |
| **Wynik** | Co zrobiło uruchomienie, np. *Removed 120 jobs*, lub jego błąd |
| **Węzeł** | Węzeł, który je wykonał |

Przechowywane są uruchomienia z ostatnich 30 dni, do 1000 na proces: dla procesu działającego co minutę to około ostatnich 16 godzin.

Pętla działa zbyt często, by mieć wiersz na każdy przebieg. Jej karta **Uruchomienia** pokazuje zamiast tego, dla każdego węzła:

* podsumowanie każdej godziny, np. *1,800 passes, 0 failed*, `failed`, gdy nie powiódł się jakiś przebieg z tej godziny;
* wiersz dla każdego **Uruchom teraz**, z *Run now: done* lub błędem;
* wiersz `failed`, gdy nie powiedzie się przebieg z jej timera, najwyżej raz na minutę dla tego samego błędu.

### Uruchom teraz
{: .no_toc }

**Uruchom teraz** od razu uruchamia proces na węźle, który wykonuje procesy, i zapisuje uruchomienie z Twoją nazwą. Jest wyłączone,
gdy trwa uruchomienie procesu, oraz dla procesu **Wyłączony**. Długie uruchomienie, jak nocna kopia zapasowa, trwa dalej po odpowiedzi strony.

**Uruchom teraz** pętli wykonuje jeden przebieg na węźle, który obsługuje stronę, i jest odrzucane tam, gdzie hub runnerów nie działa.
Każde **Uruchom teraz** jest zapisywane w dzienniku audytu jako `system.task.run`.

---

## Zmiana czasu działania procesu

Każdy proces i każda pętla ma zmienną środowiskową dla swojego czasu, którą zapisuje jego karta **Harmonogram**. Wszystkie działają bez restartu.

| Zmienna | Domyślnie | Proces |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Porzucone zadania |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Zatrzymane węzły |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Koniec harmonogramów |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Resynchronizacja harmonogramów |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Wygasłe tokeny |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Czyszczenie audytu |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Czyszczenie zadań |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Nocna kopia zapasowa |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Czyszczenie zapisanych zadań |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Ponowne wczytanie config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (od 1 do 60) | Przekazywanie do runnerów |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (od 2 do 300) | Łączenie z runnerami inbound |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (od 10 do 3600) | Czyszczenie zakończonych zadań |

Wartość, która nie jest poprawnym cronem, lub sekundy poza granicami, ustawione ręcznie w środowisku, są pomijane na rzecz wartości domyślnej.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Przed wersją 7.8.0 config seed był sprawdzany co [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Ta zmienna jest przestarzała od wersji 7.8.0 na rzecz `CONFIG_SEED_RELOAD_CRON` i zostanie usunięta w wersji 8.0. Dopóki
`CONFIG_SEED_RELOAD_CRON` nie jest ustawiona, jest nadal odczytywana jako cron, z ostrzeżeniem w logu przy starcie:

| `CONFIG_SEED_RELOAD_SECONDS` | Odczytywana jako |
|---|---|
| `60` | `* * * * *`, co minutę |
| Wielokrotność 60 do `3600` | Co określoną liczbę minut, np. `*/5 * * * *` dla `300` (`3600` jako `0 * * * *`) |
| Liczba poniżej 60, która dzieli 60 | Co określoną liczbę sekund |
| `0` | Ponowne wczytanie jest wyłączone |
| Każda inna liczba | Najbliższa z powyższych, co podaje log |

Karta **Harmonogram** procesu pokazuje ten cron z wierszem *Z przestarzałej zmiennej CONFIG_SEED_RELOAD_SECONDS; cron zapisany tutaj
ją zastąpi.* **Zapisz** zapisuje `CONFIG_SEED_RELOAD_CRON`, która od tej pory ma pierwszeństwo przed starą zmienną.

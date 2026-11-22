---
layout: default
title: Zadania
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Zadania
{: .no_toc }

Śledzenie, przerywanie, ponowne uruchamianie, zatwierdzanie i usuwanie zadań, które uruchamiają twoje formularze
{: .fs-6 .fw-300 }

---

Dla każdego, kto uruchamia formularze: czym jest zadanie, gdzie je znaleźć i kto może je widzieć.

---

## Czym jest zadanie

Zadanie to jedno uruchomienie formularza: AnsibleForms rejestruje je wraz ze stanem, extravars i wynikiem, gdy tylko formularz zostanie wysłany.

Każde zadanie przechowuje:

* **formularz**, który uruchomiło, i **użytkownika**, który je uruchomił (z typem użytkownika, np. `local` lub `ldap`);
* swój **typ zadania** i **stan** oraz **czas rozpoczęcia** i **czas zakończenia**;
* swój **wynik**, extravars i poświadczenia, z którymi działało, oraz wartości pól wprowadzone w formularzu.

Formularz wieloetapowy tworzy jedno zadanie dla formularza i po jednym zadaniu na każdy krok. Kroki są powiązane z zadaniem głównym i wyświetlane pod nim.

Tymi samymi zadaniami można uruchamiać, śledzić i zarządzać przez [REST API](../api/jobs.html).

---

## Strona Zadania

Link **Zadania** w nagłówku otwiera listę wszystkich zadań, od najnowszych (`/jobs/all`). Strona i jej link są widoczne dla użytkowników,
których rola ustawia [opcję roli](../config/roles.html#role-options) `showJobs`.

![Lista zadań](../assets/screenshots/job-log.jpg)

Lewe menu porządkuje zadania w czasie, z liczbą zadań przy każdej pozycji; pozycja stanu filtruje listę według tego stanu:

| Sekcja | Pozycja menu | Pokazuje |
|---|---|---|
| **Przeszłe** | **Zakończone powodzeniem** | Zadania o stanie `success` |
| | **Nieudane** | Zadania o stanie `failed` |
| | **Przerwane** | Zadania o stanie `aborted` |
| | **Odrzucone** | Zadania o stanie `rejected` |
| | **Porzucone** | Zadania o stanie `abandoned` |
| **Bieżące** | **Uruchomione** | Zadania o stanie `running` |
| | **Oczekuje na zatwierdzenie** | Zadania o stanie `approve`; licznik zmienia kolor na pomarańczowy, gdy któreś czeka |
| **Przyszłe** | **Zaplanowane** | Strona [Harmonogramy](schedules.html) (opcja roli `allowScheduledJobs`) |
| | **Zapisane** | Strona [Zapisane zadania](stored-jobs.html) (opcja roli `allowStoredJobs`) |

Menu nie ma pozycji dla wszystkich zadań: link **Zadania** w nagłówku pokazuje je wszystkie, łącznie z zadaniami `warning`.

Nad tabelą, w wierszu tytułu:

* **pole wyszukiwania** zostawia zadania, których widoczne kolumny zawierają tekst (bez rozróżniania wielkości liter) lub których jeden z kroków ma go jako id
  albo cel;
* **Usuń** (z liczbą zaznaczonych zadań) usuwa razem zadania zaznaczone w pierwszej kolumnie;
* **Kolumny** pokazuje lub ukrywa kolumny `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` i `user`;
  czas trwania działającego zadania odlicza się na bieżąco;
* **Odśwież** przeładowuje listę.

Lista ładuje najnowsze zadania, tyle, ile określa ustawienie [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Ustawienia > System > Ogólne**, karta **Zadania**, domyślnie `1000`); jej strony, wyszukiwanie i filtry obejmują te zadania.

Każdą kolumnę można sortować i każda ma własne pole filtra. Zadanie wieloetapowe ma strzałkę tuż przed swoim `form`, która rozwija
jego kroki; kliknięcie w pozostałą część wiersza otwiera zadanie.

Dzwonek w nagłówku liczy zadania czekające na twoje zatwierdzenie i otwiera listę na **Oczekuje na zatwierdzenie**. Dla użytkowników, którzy widzą
runnery, liczy także [runnery czekające na zatwierdzenie](../runners/registration.html#approving-an-rte), czyli RTE, które poprosiły o dołączenie,
i otwiera **Połączenia > Runnery**, gdy czekają tylko runnery. Gdy czekają jedne i drugie, otwiera menu z pozycjami **Zadania czekające na zatwierdzenie** i
**Runnery czekające na zatwierdzenie**, każda z licznikiem.

---

## Kto widzi które zadania

Zadania widoczne dla użytkownika zależą od jego ról:

| Użytkownik | Widzi |
|---|---|
| Administrator (rola `admin`) | Każde zadanie |
| Opcja roli `showAllJobLogs` | Każde zadanie |
| Opcja roli `manageAllJobs` (od 7.3.0) | Każde zadanie i może je przerwać, usunąć i uruchomić ponownie |
| Każdy inny użytkownik | Własne zadania oraz zadania czekające na zatwierdzenie, które wskazuje jedną z jego ról |

Do wersji 7.2 każdy użytkownik mógł otworzyć dowolne zadanie czekające na zatwierdzenie, łącznie z jego extravars i wynikiem; od wersji 7.3.0 mogą to tylko jego właściciel i
zatwierdzający. Widzenie zadania nie daje prawa do każdej akcji na nim: przerwanie, usunięcie i ponowne uruchomienie zadania innego użytkownika wymaga administratora lub
`manageAllJobs`, a `showAllJobLogs` tylko pokazuje zadania. Usuwanie wymaga też `allowJobDeletion`, a ponowne uruchamianie `allowJobRelaunch`.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Stany i typy](statuses.html) | Każdy stan, jaki może mieć zadanie, i rodzaje zadań |
| [Śledzenie zadania](following.html) | Wynik na żywo, extravars, filtry i pobieranie |
| [Akcje na zadaniach](actions.html) | Uruchamianie, przerywanie, ponowne uruchamianie, zatwierdzanie lub odrzucanie i usuwanie zadania |
| [Harmonogramy](schedules.html) | Uruchamianie formularza później lub według harmonogramu cron i zarządzanie wszystkimi harmonogramami |
| [Zapisane zadania](stored-jobs.html) | Przechowywanie danych formularza, aby wczytać je później |
| [Czyszczenie](cleanup.html) | Zadania przerwane przez restart i jak długo przechowywane są zakończone zadania |

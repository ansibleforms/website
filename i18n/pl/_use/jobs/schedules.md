---
layout: default
title: Harmonogramy
parent: Zadania
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Harmonogramy
{: .no_toc }

Uruchamianie formularza później, według crona lub reguły rrule, i zarządzanie wszystkimi harmonogramami
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Akcje formularza

Formularz może zrobić więcej niż natychmiastowe uruchomienie: lista rozwijana obok jego przycisku **Wyślij** zawiera trzy kolejne akcje.

| Akcja | Co robi | Opcja roli |
|---|---|---|
| **Harmonogram (cykliczny)** | Tworzy harmonogram, który uruchamia formularz według wyrażenia cron | `allowScheduledJobs` |
| **Uruchom później (jednorazowo)** | Tworzy harmonogram, który uruchamia formularz raz, w wybranym dniu i o wybranej godzinie | `allowPlannedJobs` |
| **Zapisz** | Zapisuje wartości pól, aby można je było później ponownie wczytać do formularza | `allowStoredJobs` |

Akcja, której opcja roli jest wyłączona, nie jest wyświetlana. Przed każdą z nich formularz jest walidowany, tak jak przy **Wyślij**. Obie
akcje harmonogramu tworzą wpis w **Zadania > Zaplanowane**; **Zapisz** tworzy wpis na stronie **Zapisane zadania**.
Pasek boczny strony [Zadania](./) otwiera je w sekcji **Przyszłe** jako **Zaplanowane** i **Zapisane**. Opcje ról opisano
w [Opcje ról](../config/roles.html#role-options).

{: .warning }
> Traktuj `allowScheduledJobs` jako opcję na poziomie administratora. Jej harmonogramy nie należą do użytkownika, który je utworzył: każdy użytkownik
> z tą opcją widzi wszystkie harmonogramy i może je zmieniać. Taki harmonogram działa też z uprawnieniami administratora, dla dowolnego formularza, niezależnie od
> dostępu samego twórcy. Przyznawaj ją tylko rolom, którym zaufałbyś jak administratorom.

{: .note }
> **Uruchom później (jednorazowo)** wymaga tylko `allowPlannedJobs`. Dla użytkownika bez `allowScheduledJobs` planuje uruchomienie **jako ten
> użytkownik**: serwer sprawdza, czy użytkownik może uruchomić formularz, a zadanie działa jako on i należy do niego, gdy nadejdzie jego czas
> (zobacz [Zaplanowane uruchomienia](#planned-runs)).

---

## Planowanie formularza

Wypełnij formularz, a następnie otwórz listę rozwijaną obok **Wyślij** i wybierz jedną z akcji harmonogramu.

- **Harmonogram (cykliczny)** otwiera **Utwórz harmonogram**: wpisz **Nazwa** i **Wyrażenie cron** (domyślne `0 0 * * *`
  uruchamia codziennie o północy), a następnie wybierz **Utwórz harmonogram**.
- **Uruchom później (jednorazowo)** otwiera **Uruchom później**: wpisz **Nazwa** i wybierz datę i godzinę **Uruchom o**, a następnie wybierz
  **Zaplanuj zadanie**.

Nazwa musi być unikalna wśród wszystkich harmonogramów. Harmonogram zachowuje nazwę formularza i kopię extravars, które formularz wygenerował
w tym momencie, zapisaną jako YAML; każde uruchomienie używa tej kopii, więc edytuj ją na stronie harmonogramu, aby zmienić to, co otrzymuje zadanie.
Aby zamiast tego zaplanować go regułą rrule lub nadać mu koniec, otwórz jego stronę i zmień jego kartę **Harmonogram**.

![Harmonogramy](../assets/screenshots/schedules.jpg)

---

## Lista harmonogramów

**Zadania > Zaplanowane** wyświetla każdy harmonogram i wymaga `allowScheduledJobs`; wiersz otwiera własną stronę harmonogramu.

| Kolumna | Pokazuje |
|---|---|
| **Włączony** | Czy harmonogram uruchamia się sam według swojego planu |
| **Nazwa** i **Formularz** | Harmonogram i formularz, który uruchamia |
| **Harmonogram** | Jego plan zwykłym językiem, np. *At 02:00 AM*; najedź na niego, aby zobaczyć cron lub samą regułę |
| **Ostatnie uruchomienie** | Kiedy uruchomił się ostatnio |
| **Następne uruchomienie** | Kiedy uruchomi się następnym razem, kreska, gdy nie ma przed sobą żadnego uruchomienia |
| **Stan** | Jego ostatnie uruchomienie: czy uruchomił zadanie, lub **Uruchamianie…**, gdy właśnie je uruchamia |

Kolumna **Harmonogram** opisuje harmonogram jednorazowy jako **Jednorazowe uruchomienie**. Reguła rrule, której nie da się opisać zwykłym
językiem, jest wyświetlana bez zmian. Menu każdego wiersza oferuje:

| Akcja | Co robi |
|---|---|
| **Edytuj** | Otwiera stronę harmonogramu |
| **Uruchom teraz** | Uruchamia harmonogram teraz, bez czekania na jego plan |
| **Włącz** lub **Wyłącz** | Włącza lub wyłącza harmonogram, zależnie od tego, co pokazuje jego kolumna **Włączony** |
| **Usuń** | Usuwa harmonogram; od razu przestaje się uruchamiać |

**Nowy element: harmonogram** tworzy harmonogram od zera, w trzech krokach: **Szczegóły** (jego **Nazwa**, **Opis** i **Formularz**),
**Harmonogram** (jego plan i koniec) oraz **Extra vars**. **Extra vars** to YAML bez formularza, który by go wypełnił, więc sam dodaj
wartości potrzebne playbookowi, jako słownik (pary klucz: wartość).

---

## Strona harmonogramu

Strona harmonogramu zawiera kroki jego okna dialogowego jako karty, z **Uruchom teraz**, **Usuń** i **Zapisz** w prawym górnym rogu.

| Karta | Co zawiera |
|---|---|
| **Szczegóły** | Jego źródło, **Nazwa**, **Opis**, **Formularz**, potem **Ostatnie uruchomienie**, **Uruchomione zadanie**, **Ostatnie uruchomienie**, **Następne uruchomienie** i **Włączony** |
| **Harmonogram** | Jak jest planowany (zobacz [Planowanie harmonogramu](#timing-a-schedule)) i jak się kończy (zobacz [Koniec harmonogramu](#the-end-of-a-schedule)) |
| **Extra vars** | YAML, który otrzymuje zadanie; dla harmonogramu przechowywanego w git także pytania jego pliku |
| **Uruchomienia** | Zadania, które uruchomił, od najnowszego; wiersz otwiera zadanie |

Pierwsze pole **Ostatnie uruchomienie** mówi, jak przebiegło jego ostatnie uruchomienie, jako stan: nieudane po najechaniu podaje przyczynę.
**Uruchomione zadanie** prowadzi do zadania, które uruchomił, więc możesz je otworzyć i zobaczyć, jak się zakończyło. Karta **Uruchomienia** wyświetla
zadania, które możesz widzieć, z użytkownikiem, jako który działały, ich początkiem, końcem, czasem trwania i stanem; ich liczba jest w tytule karty.

Przełącznik **Włączony** wstrzymuje harmonogram bez usuwania go i jest zapisywany przez **Zapisz**, jak każde pole strony. Wyłączony
harmonogram pozostaje na liście ze swoimi ustawieniami, ale nie uruchamia się sam: cykliczny pomija swoje uruchomienia, a jednorazowy
czeka po swojej chwili, aż zostanie ponownie włączony. **Uruchom teraz** nadal uruchamia go na żądanie. Nowy harmonogram jest włączony.

---

## Planowanie harmonogramu

Harmonogram jest planowany na jeden z trzech sposobów, wybierany w **Harmonogram** na jego karcie **Harmonogram**; rrule jest nowością w 7.8.0.

| Plan | Uruchamia się | Zobacz |
|---|---|---|
| **Cron** | Cyklicznie, według wyrażenia cron w strefie czasowej serwera | [Wyrażenia cron i strefa czasowa](#cron-expressions-and-time-zone) |
| **Reguła powtarzania (rrule)** | Cyklicznie, według reguły iCal we własnej strefie czasowej | [Reguły powtarzania](#recurrence-rules) |
| **Jednorazowe uruchomienie** | Raz, w danym dniu i o danej godzinie | [Jak działa harmonogram](#how-a-schedule-runs) |

Przy cronie lub regule rrule edytor pokazuje trzy następne uruchomienia i zatrzymuje je na końcu harmonogramu. Zmiana planu
zachowuje tylko wybrany: harmonogram przełączony z crona na regułę rrule traci swój cron.

---

## Wyrażenia cron i strefa czasowa

Harmonogram cykliczny może przyjąć standardowe 5-polowe wyrażenie cron: minuta, godzina, dzień miesiąca, miesiąc i dzień tygodnia.

| Wyrażenie | Uruchamia się |
|---|---|
| `*/15 * * * *` | Co 15 minut |
| `0 2 * * *` | Codziennie o 02:00 |
| `30 7 * * 1-5` | Od poniedziałku do piątku o 07:30 |
| `0 0 1 * *` | O północy pierwszego dnia każdego miesiąca |

Edytor cron opisuje wyrażenie słowami, oferuje gotowe ustawienia i pokazuje podgląd następnych uruchomień. Serwer odrzuca wyrażenie,
którego nie potrafi wykonać, lub takie, które nigdy nie może wystąpić. Więcej przykładów i funkcje cron, których edytor nie akceptuje,
znajdziesz w FAQ w [Jakich wyrażeń cron mogę używać?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Harmonogramy cron działają w strefie czasowej serwera, ustawianej przez [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (domyślnie `UTC`),
> a nie w strefie czasowej twojego profilu czy przeglądarki. Edytor cron pokazuje podgląd następnych uruchomień w tej samej strefie.

---

## Reguły powtarzania

Od wersji 7.8.0 harmonogram cykliczny może zamiast tego przyjąć regułę powtarzania iCal (rrule), która działa we własnej strefie czasowej.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

Pierwsza uruchamia się codziennie o 02:00 w Brukseli, druga w każdy poniedziałek o 06:00 UTC, trzecia w ostatni dzień roboczy
każdego miesiąca o 07:30 w Nowym Jorku. Reguła to jeden wiersz, a jej części są oddzielone spacjami:

| Część | Co określa |
|---|---|
| `DTSTART` | Pierwsze uruchomienie, z `TZID` (strefa IANA, np. `Europe/Brussels`, lub przesunięcie, np. `UTC+5` czy `GMT-3`) albo w UTC z końcówką `Z` |
| `RRULE` | Kiedy się powtarza: `FREQ` z `INTERVAL` równym co najmniej 1 oraz `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … w razie potrzeby; jedna lub więcej |
| `EXRULE` | Opcjonalnie: reguła uruchomień do pominięcia |

Serwer odrzuca regułę, której nie potrafi wykonać, i podaje przyczynę:

- brak `DTSTART`, więcej niż jeden albo jeden bez strefy czasowej, a także `EXDATE` lub `RDATE`;
- reguła bez `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` z liczbą (`5MO`) albo `COUNT` razem z `UNTIL`;
- `COUNT` powyżej 999, liczba `BYxxx` spoza zakresu (`BYHOUR` od 0 do 23, `BYSETPOS` od 1 do 366 lub od -366 do -1 …), `WKST`,
  który nie jest dniem tygodnia, `DTSTART` lub `UNTIL`, który nie jest prawdziwą datą (`20300230`), albo część podana dwukrotnie w regule;
- reguła, która nigdy się nie uruchamia: brak uruchomienia w ciągu 50 lat od jej `DTSTART`, np. `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` od
  północy, która trafia tylko w parzyste godziny.

Edytor to pole tekstowe: nowa reguła rrule zaczyna jako codziennie o północy w strefie czasowej twojej przeglądarki. Od razu mówi, dlaczego reguła
zostałaby odrzucona, a w przeciwnym razie pokazuje jej trzy następne uruchomienia we własnej strefie czasowej reguły lub **Ta reguła rrule nie ma już
żadnego uruchomienia.**, gdy jej `UNTIL` lub `COUNT` już minęło. Godzina pomijana przez zmianę czasu uruchamia się, gdy zegar do niej dojdzie
(02:30 uruchamia się o 03:30 w noc, gdy zegar przeskakuje z 02:00 na 03:00), tak jak w cronie; godzina, którą zegar pokazuje dwa razy, uruchamia
się raz, za pierwszym razem.

---

## Koniec harmonogramu

Od wersji 7.8.0 harmonogram planowany cronem lub regułą rrule może się kończyć; w **Koniec** na jego karcie **Harmonogram** wybierz jedną opcję.

| Koniec | Harmonogram kończy się |
|---|---|
| **Nigdy** | Nigdy: wartość domyślna i każdy harmonogram sprzed wersji 7.8.0 |
| **W dniu** | W wybranym dniu i o wybranej godzinie: po tej chwili nie ma już uruchomień |
| **Po** … **uruchomieniach** | Gdy uruchomi łącznie tyle zadań, ile wymieniono, tych z jego karty **Uruchomienia**; pole pokazuje, ile było dotąd |

**Po zakończeniu** jest wyłączany (**Wyłącz**, wartość domyślna) lub usuwany (**Usuń**). Zadanie systemowe **Koniec harmonogramów**
stosuje końce co minutę, a harmonogram, który osiąga swoją liczbę uruchomień, kończy się zaraz po ostatnim z nich. Własne `UNTIL` lub `COUNT`
reguły rrule nadal obowiązuje; koniec działa dodatkowo.

Harmonogram jednorazowy nie ma końca: kończy się wraz ze swoim uruchomieniem. Jego przełącznik **Usuń po uruchomieniu**, domyślnie włączony, usuwa go
po uruchomieniu; gdy jest wyłączony, harmonogram zostaje po uruchomieniu wyłączony i zachowany wraz z wynikiem.

---

## Jak działa harmonogram

Gdy nadchodzi termin harmonogramu, trafia on do kolejki, a serwer uruchamia harmonogramy z kolejki po jednym, sprawdzając kolejkę co 10 sekund.

- Harmonogramy **cykliczne** pomijają uruchomienie, gdy poprzednie uruchomienie wciąż jest w kolejce lub działa, więc uruchomienia nigdy się nie nakładają.
- Harmonogramy **jednorazowe** uruchamiają się w ciągu minuty od swojej chwili, a następnie są usuwane (lub zachowywane jako wyłączone, gdy **Usuń po
  uruchomieniu** jest wyłączone), także gdy zostały uruchomione przez **Uruchom teraz**.
- **Stan** ma wartość `success`, gdy zadanie zostało uruchomione, i `failed`, gdy nie dało się go uruchomić. `success` mówi tylko, że zadanie zostało
  uruchomione: otwórz zadanie, aby zobaczyć, jak się zakończyło.

Harmonogram utworzony z `allowScheduledJobs` działa jako wbudowany użytkownik `Schedule Service` (typ `schedule`) z rolą
`admin`. Może uruchomić dowolny formularz, niezależnie od dostępu osoby, która utworzyła harmonogram, a `ansibleforms_user` w
jego extravars opisuje tego użytkownika. [Zaplanowane uruchomienie](#planned-runs) działa natomiast jako użytkownik, który je zaplanował.

Zadanie otrzymuje też obiekt `schedule`, dzięki czemu playbook wie, że uruchomił go harmonogram:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Jego `one_time_run` to chwila uruchomienia harmonogramu jednorazowego, `null` dla cyklicznego. Zawiera też pozostałe ustawienia
harmonogramu, takie jak `enabled` i `repository`, oraz `run_at`: tę samą chwilę pod nazwą sprzed wersji 7.8.0 (przestarzałe, usunięte w wersji 8).

---

## Zaplanowane uruchomienia

**Uruchom później (jednorazowo)** wybrane przez użytkownika bez `allowScheduledJobs` tworzy zaplanowane uruchomienie: jednorazowy harmonogram powiązany z tym użytkownikiem.

- **Przy planowaniu** serwer sprawdza, czy użytkownik może uruchomić formularz (jego `roles`), a tryb verbose wymaga
  `allowVerboseMode`. Zaplanowane uruchomienie jest zawsze jednorazowe; wyrażenie cron lub reguła rrule jest odrzucane.
- **Przy weryfikacji uruchomienia `enforce`** wartości pól są sprawdzane podczas planowania, więc uruchomienie, które zostałoby odrzucone, jest
  odrzucane, gdy użytkownik wciąż na nie patrzy.
- **Gdy się uruchamia**, zadanie działa jako ten użytkownik i należy do niego, przechodząc te same sprawdzenia co uruchomienie z przeglądarki:
  role formularza w ich ówczesnej postaci, usunięcie zastrzeżonych extravars i weryfikacja uruchomienia. `ansibleforms_user` opisuje tego użytkownika.

Planujący nie widzi **Zadania > Zaplanowane**, co wymaga `allowScheduledJobs`; zadanie pojawia się w jego własnej historii zadań.
Zaplanowane uruchomienie jest zawsze usuwane po uruchomieniu.

---

## Gdy formularz się zmienia

Harmonogram odwołuje się do formularza po nazwie i uruchamia go w postaci zdefiniowanej w chwili każdego uruchomienia.

- **Formularz zostaje zmieniony**: następne uruchomienie używa nowej definicji (playbook, szablon, inwentarz) z extravars zapisanymi w
  harmonogramie. Formularz nie jest renderowany, więc żadne pole nie jest przeliczane; dostosuj extra vars harmonogramu.
- **Formularz zostaje przemianowany lub usunięty**: uruchomienie kończy się błędem, **Stan** zmienia się na `failed`, a **Ostatnie uruchomienie**
  po najechaniu pokazuje `Failed to launch : No such form '<name>'`. Edytuj harmonogram i wybierz właściwy formularz albo go usuń.

---

## Zaplanowane zadania w historii zadań

Każde uruchomienie harmonogramu tworzy zwykłe zadanie, wyświetlane na stronie [Zadania](./) z `Schedule Service` jako użytkownikiem lub,
w przypadku zaplanowanego uruchomienia, z użytkownikiem, który je zaplanował.

Zadanie `Schedule Service` nie należy do osoby, która utworzyła harmonogram, więc widzą je tylko administratorzy i
użytkownicy z `showAllJobLogs`; zadanie zaplanowanego uruchomienia widzi też jego użytkownik. Karta **Uruchomienia** harmonogramu wyświetla
zadania, które uruchomił, a jego **Uruchomione zadanie** prowadzi do ostatniego z nich.

---

## Harmonogramy w repozytorium git

Od wersji 7.8.0 harmonogramy można też przechowywać w repozytorium git, jako wpisy listy `controller_schedules:` w jego plikach YAML.

Co najwyżej jedno repozytorium ma zastosowanie **Harmonogramy**: jego wpisy są wczytywane do **Zadania > Zaplanowane** przy każdym pull, planowane przez
`cron`, `rrule` lub `one_time_run`, a harmonogram utworzony lub zmieniony w aplikacji jest zapisywany z powrotem do swojego pliku i czeka na push
repozytorium. Taki harmonogram pokazuje swój plik na swojej stronie, a jego koniec zawsze tylko go wyłącza. Zobacz
[Repozytoria git](../repositories/).

---

## W API

Od wersji 7.8.0 harmonogram w API ma trzy pola planu, z których dokładnie jedno jest ustawione: `cron`, `rrule` lub `one_time_run`.

| Pole | Zawiera |
|---|---|
| `cron` | Wyrażenie cron |
| `rrule` | Regułę powtarzania, w jednym wierszu |
| `one_time_run` | Chwilę jedynego uruchomienia, czas ISO 8601 z przesunięciem lub `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Jego koniec: `never`, `date` lub `count`, jego datę, liczbę uruchomień oraz `disable` lub `remove` |
| `remove_after_run` | Harmonogram jednorazowy: `false` zachowuje go, wyłączony, po uruchomieniu |

{: .warning }
> Para, którą API przyjmowało przed wersją 7.8.0, `one_time_run: true` z `run_at`, jest przestarzała od wersji 7.8.0 i zostanie usunięta w wersji 8.
> Nadal jest odczytywana jako `one_time_run` w tej chwili, z ostrzeżeniem w logu serwera; `one_time_run: false` z cronem jest odczytywane jako
> ten cron.

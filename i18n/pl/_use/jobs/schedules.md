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
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Harmonogramy
{: .no_toc }

Uruchamianie formularza później lub według harmonogramu cron i zarządzanie wszystkimi harmonogramami
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
akcje harmonogramu tworzą wpis na stronie **Harmonogramy**; **Zapisz** tworzy wpis na stronie **Zapisane zadania**.
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
w tym momencie, zapisaną jako YAML; każde uruchomienie używa tej kopii, więc edytuj ją na stronie **Harmonogramy**, aby zmienić to, co otrzymuje zadanie.

![Harmonogramy](../assets/screenshots/schedules.jpg)

---

## Strona Harmonogramy

Strona **Harmonogramy** wyświetla każdy harmonogram, od wersji 7.3.0 z kolumną **Włączony**, i wymaga `allowScheduledJobs`. Menu każdego wiersza oferuje:

| Akcja | Co robi |
|---|---|
| **Edytuj** | Zmienia nazwę, typ, wyrażenie cron lub czas uruchomienia, formularz i extra vars |
| **Uruchom teraz** | Uruchamia harmonogram teraz, bez czekania na jego wyrażenie cron lub czas uruchomienia |
| **Włącz** lub **Wyłącz** | Włącza lub wyłącza harmonogram, zależnie od tego, co pokazuje jego kolumna **Włączony** (od wersji 7.3.0) |
| **Usuń** | Usuwa harmonogram; od razu przestaje się uruchamiać |
| **Ostatni wynik** | Na stronie harmonogramu to, co zgłosiło ostatnie uruchomienie, np. numer uruchomionego zadania |

Harmonogram można też utworzyć tutaj od zera. Wybierz **Formularz**, a następnie zaznacz **Jednorazowe uruchomienie** i ustaw
**Uruchom o** albo zostaw je niezaznaczone i ustaw **Harmonogram cron**. **Extra vars** to YAML bez formularza, który by go wypełnił, więc sam dodaj
wartości potrzebne playbookowi, jako słownik (pary klucz: wartość).

Pole **Harmonogram cron** to edytor cron: opisuje wyrażenie słowami, oferuje gotowe ustawienia i pokazuje podgląd następnych
uruchomień. Serwer odrzuca wyrażenie, którego nie potrafi wykonać, lub takie, które nigdy nie może wystąpić.

Od wersji 7.3.0 każdy harmonogram ma przełącznik **Włączony**, aby wstrzymać go bez usuwania. Wyłączony harmonogram pozostaje na stronie
ze swoimi ustawieniami, ale nie uruchamia się sam: cykliczny pomija swoje takty cron, a jednorazowy czeka po swoim
**Uruchom o**, aż zostanie ponownie włączony. **Uruchom teraz** nadal uruchamia go na żądanie. Nowy harmonogram jest włączony, a harmonogramy
istniejące przed wersją 7.3.0 są włączone po aktualizacji.

---

## Wyrażenia cron i strefa czasowa

Harmonogram cykliczny przyjmuje standardowe 5-polowe wyrażenie cron: minuta, godzina, dzień miesiąca, miesiąc i dzień tygodnia.

| Wyrażenie | Uruchamia się |
|---|---|
| `*/15 * * * *` | Co 15 minut |
| `0 2 * * *` | Codziennie o 02:00 |
| `30 7 * * 1-5` | Od poniedziałku do piątku o 07:30 |
| `0 0 1 * *` | O północy pierwszego dnia każdego miesiąca |

Więcej przykładów i funkcje cron, których edytor nie akceptuje, znajdziesz w FAQ w
[Jakich wyrażeń cron mogę używać?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Harmonogramy cron działają w strefie czasowej serwera, ustawianej przez [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (domyślnie `UTC`),
> a nie w strefie czasowej twojego profilu czy przeglądarki. Edytor cron pokazuje podgląd następnych uruchomień w tej samej strefie.

---

## Jak działa harmonogram

Gdy nadchodzi termin harmonogramu, trafia on do kolejki, a serwer uruchamia harmonogramy z kolejki po jednym, sprawdzając kolejkę co 10 sekund.

- Harmonogramy **cykliczne** pomijają takt, gdy poprzednie uruchomienie wciąż jest w kolejce lub działa, więc uruchomienia nigdy się nie nakładają.
- Harmonogramy **jednorazowe** uruchamiają się w ciągu minuty od **Uruchom o**, a następnie są usuwane, także gdy zostały uruchomione przez **Uruchom teraz**.
- **Stan** ma wartość `success`, gdy zadanie zostało uruchomione, i `failed`, gdy nie dało się go uruchomić. `success` mówi tylko, że zadanie zostało
  uruchomione: otwórz zadanie, aby zobaczyć, jak się zakończyło.

Harmonogram utworzony z `allowScheduledJobs` działa jako wbudowany użytkownik `Schedule Service` (typ `schedule`) z rolą
`admin`. Może uruchomić dowolny formularz, niezależnie od dostępu osoby, która utworzyła harmonogram, a `ansibleforms_user` w
jego extravars opisuje tego użytkownika. [Zaplanowane uruchomienie](#planned-runs) działa natomiast jako użytkownik, który je zaplanował.

Zadanie otrzymuje też obiekt `schedule` (z jego `id`, `name` i `form`), dzięki czemu playbook wie, że uruchomił go harmonogram:

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Zaplanowane uruchomienia

**Uruchom później (jednorazowo)** wybrane przez użytkownika bez `allowScheduledJobs` tworzy zaplanowane uruchomienie: jednorazowy harmonogram powiązany z tym użytkownikiem.

- **Przy planowaniu** serwer sprawdza, czy użytkownik może uruchomić formularz (jego `roles`), a tryb verbose wymaga
  `allowVerboseMode`. Zaplanowane uruchomienie jest zawsze jednorazowe; wyrażenie cron jest odrzucane.
- **Przy weryfikacji uruchomienia `enforce`** wartości pól są sprawdzane podczas planowania, więc uruchomienie, które zostałoby odrzucone, jest
  odrzucane, gdy użytkownik wciąż na nie patrzy.
- **Gdy się uruchamia**, zadanie działa jako ten użytkownik i należy do niego, przechodząc te same sprawdzenia co uruchomienie z przeglądarki:
  role formularza w ich ówczesnej postaci, usunięcie zastrzeżonych extravars i weryfikacja uruchomienia. `ansibleforms_user` opisuje tego użytkownika.

Planujący nie widzi strony **Harmonogramy**, która wymaga `allowScheduledJobs`; zadanie pojawia się w jego własnej historii zadań.

---

## Gdy formularz się zmienia

Harmonogram odwołuje się do formularza po nazwie i uruchamia go w postaci zdefiniowanej w chwili każdego uruchomienia.

- **Formularz zostaje zmieniony**: następne uruchomienie używa nowej definicji (playbook, szablon, inwentarz) z extravars zapisanymi w
  harmonogramie. Formularz nie jest renderowany, więc żadne pole nie jest przeliczane; dostosuj extra vars harmonogramu.
- **Formularz zostaje przemianowany lub usunięty**: uruchomienie kończy się błędem, **Stan** zmienia się na `failed`, a **Ostatni wynik** brzmi
  `Failed to launch : No such form '<name>'`. Edytuj harmonogram i wybierz właściwy formularz albo go usuń.

---

## Zaplanowane zadania w historii zadań

Każde uruchomienie harmonogramu tworzy zwykłe zadanie, wyświetlane na stronie [Zadania](./) z `Schedule Service` jako użytkownikiem lub,
w przypadku zaplanowanego uruchomienia, z użytkownikiem, który je zaplanował.

Zadanie `Schedule Service` nie należy do osoby, która utworzyła harmonogram, więc widzą je tylko administratorzy i
użytkownicy z `showAllJobLogs`; zadanie zaplanowanego uruchomienia widzi też jego użytkownik. **Ostatni wynik** harmonogramu wskazuje uruchomione zadanie, więc możesz je znaleźć na liście.

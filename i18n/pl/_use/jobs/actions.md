---
layout: default
title: Akcje na zadaniach
parent: Zadania
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Akcje na zadaniach
{: .no_toc }

Uruchamianie, przerywanie, ponowne uruchamianie, zatwierdzanie lub odrzucanie i usuwanie zadania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Uruchamianie zadania

Każde zadanie zaczyna się od formularza. Otwórz go ze strony **Formularze**, wypełnij pola i naciśnij **Wyślij**:

1. Formularz jest walidowany w przeglądarce, a wartości pól są wysyłane do serwera.
2. Serwer tworzy zadanie i zwraca jego numer; uruchamiają się akcje [`onSubmit`](../forms/job-status-action.html) formularza.
3. Wynik zadania pojawia się pod formularzem i odświeża się co dwie sekundy, aż zadanie się zakończy.

Zadanie pojawia się też na stronie **Zadania**, gdzie możesz je później śledzić.

### Kto może uruchomić formularz

Formularz jest wyświetlany i można go uruchomić dla użytkowników, którzy mają jedną z [ról](../config/roles.html) z jego listy `roles`.
Rola `default`, którą ma każdy użytkownik, udostępnia formularz każdemu, kto może się zalogować.

### Przed wysłaniem

Pasek nad polami oferuje kilka narzędzi, każde widoczne tylko wtedy, gdy pozwala na to twoja rola:

| Przycisk | Co robi | Opcja roli |
|---|---|---|
| **Pokaż extravars** | Podgląd extravars, które otrzyma zadanie, w trakcie wypełniania pól | `showExtraVars` |
| **verbose** | Uruchamia zadanie w trybie verbose | `allowVerboseMode` |
| **Wczytaj z zapisanych** | Wypełnia pola z [zapisanego zadania](stored-jobs.html) | `allowStoredJobs` |
| **Przeładuj ten formularz** | Ponownie ładuje formularz z wartościami domyślnymi | brak |

### Wybory przy uruchamianiu

Formularz może pozwolić użytkownikom wybrać niektóre opcje Ansible przy uruchamianiu, deklarując pole o zastrzeżonej nazwie.
Wartość pola nadpisuje wtedy własne ustawienie formularza:

| Nazwa pola | Nadpisuje | Typowy typ pola |
|---|---|---|
| `__check__` | Tryb check, uruchomienie próbne, które niczego nie zmienia | `checkbox` |
| `__diff__` | Tryb diff, który pokazuje, co by się zmieniło | `checkbox` |
| `__limit__` | Hosty, na których działa playbook | `text` lub `enum` |
| `__tags__` | Tagi do uruchomienia | `text` lub `enum` |
| `__inventory__` | Inwentarz | `enum` |
| `__playbook__`, `__template__` | Playbook lub szablon AWX / AAP | `enum` |

Na przykład formularz, który oferuje uruchomienie próbne i ograniczenie hostów:

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

Serwer akceptuje te nazwy tylko z formularza, który deklaruje je jako pola, więc uruchomienie przez API nie może dodać ich
samodzielnie. Nadpisywane przez nie właściwości opisano przy [Formularzach Ansible](../forms/ansible.html) i [Formularzach AWX](../forms/awx.html).

### Co może zatrzymać uruchomienie

Uruchomienie nie zawsze od razu staje się działającym zadaniem:

* **Nieprawidłowe pola** : formularz nie zostaje wysłany, a każde pole, które nie przeszło walidacji, pokazuje przyczynę.
* **Weryfikacja uruchomienia** : gdy [weryfikacja uruchomienia](../launch-validation/) jest ustawiona na `enforce`, serwer ponownie sprawdza wartości
  i odrzuca uruchomienie, które łamie reguły formularza.
* **Zatwierdzenie** : formularz z [punktem zatwierdzenia](../forms/approval.html) tworzy zadanie, które następnie czeka w stanie
  `approve`; zobacz [Zatwierdzanie lub odrzucanie zadania](#approve-or-reject-a-job).

Gdy zadanie się kończy, [powiadomienia](../forms/notifications.html) formularza wysyłają swoje e-maile i wiadomości na kanały, a jego akcje
stanu zadania się uruchamiają.

### Inne sposoby uruchomienia zadania

Formularz może też uruchomić zadanie bez naciskania **Wyślij** przez człowieka:

| Uruchamiane przez | Jak | Strona |
|---|---|---|
| Uruchomienie później lub harmonogram cron | **Uruchom później (jednorazowo)** lub **Harmonogram (cykliczny)** obok **Wyślij** | [Harmonogramy](schedules.html) |
| Skrypt lub potok | `POST /api/v2/job` z tokenem API | [Zadania w REST API](../api/jobs.html) |
| Agent AI | Narzędzie `launch_job` serwera MCP | [Narzędzia MCP](../mcp/tools.html) |
| Rozmowa | Asystent czatu wypełnia formularz i go uruchamia | [Asystent czatu](../chat/) |
| Wcześniejsze zadanie | **Uruchom ponownie**, poniżej | [Ponowne uruchamianie zadania](#relaunch-a-job) |

---

## Przerywanie zadania

**Przerwij** w menu wiersza (⋮) listy lub **Przerwij zadanie** na stronie zadania zatrzymuje zadanie o stanie `running`. Po potwierdzeniu
AnsibleForms oznacza zadanie do przerwania:

* **`ansible`**: RTE zatrzymuje proces playbooka (ze wszystkimi jego workerami), a zadanie kończy się jako `aborted` z
  `... was aborted by the operator`. Zadanie, które wciąż czeka na wolne RTE, jest przerywane, zanim się uruchomi.
* **Zadanie szablonu** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins): AnsibleForms prosi runner o anulowanie lub zatrzymanie
  zadania, a zadanie kończy się jako `aborted`. Gdy runner odmawia, wynik pokazuje `Abort request denied`, a po nim
  `reverting abort request`, i zadanie działa dalej. Build Jenkins, który wciąż jest w kolejce, zostaje z niej usunięty.
* **`workflow`**: działające zadania węzłów są przerywane i nic więcej się nie uruchamia (zobacz
  [Uruchamianie workflow](../workflows/running.html#abort)).
* **`multistep`**: kroki, które jeszcze się nie zaczęły, są pomijane (`skipping: [Abort is requested]`), a zadanie główne
  kończy się jako `aborted`. Krok, który już działa, jest osobnym zadaniem: otwórz go i przerwij, aby też go zatrzymać.

Możesz przerywać własne zadania; administrator lub, od wersji 7.3.0, użytkownik, którego rola ustawia `manageAllJobs`, może przerwać dowolne zadanie. `showAllJobLogs` pozwala
użytkownikowi widzieć zadania innych użytkowników, ale nie przerywać ich.

---

## Ponowne uruchamianie zadania

**Uruchom ponownie** w menu wiersza (⋮) listy lub **Uruchom zadanie ponownie** na stronie zadania uruchamia nowe zadanie na podstawie zakończonego. Jest dostępne dla każdego
zadania, które nie ma stanu `running` ani nie czeka na zatwierdzenie, dla użytkowników, których rola ustawia opcję roli `allowJobRelaunch`.

Okno dialogowe oferuje:

* **Uruchom ponownie**: uruchamia zadanie ponownie z wartościami, z którymi działało, jako nowe zadanie w twoim imieniu.
* **Tryb szczegółowy (verbose)**: uruchamia ponownie w trybie verbose; widoczne przy opcji roli `allowVerboseMode`.
* **Edytuj wartości przed ponownym uruchomieniem**, a potem **Edytuj i uruchom ponownie**: otwiera formularz wstępnie wypełniony wartościami zadania, abyś mógł
  je zmienić przed wysłaniem.

Ponowne uruchomienie wymaga też, aby formularz na nie pozwalał (`allowRelaunch`, domyślnie true), a zadanie było **twoje własne**, chyba że
jesteś administratorem lub, od wersji 7.3.0, masz `manageAllJobs`; `showAllJobLogs`, które do wersji 7.2 pozwalało ponownie uruchamiać dowolne zadanie, już tego nie robi. Jak ponowne uruchomienie jest sprawdzane względem reguł formularza i dlaczego formularz z
polem hasła może je odrzucić, opisano w [Ponowne uruchamianie](../launch-validation/relaunching.html).

### Ponowne uruchomienie ze wstępnie wypełnionymi danymi

**Edytuj i uruchom ponownie** otwiera formularz z parametrem URL `prefillJobId`, którego możesz też użyć we własnym linku:

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

Formularz ładuje wartości pól zapisane z zadaniem `61` i pokazuje `Formularz wypełniono danymi z poprzedniego zadania #61`.
Wysłanie go uruchamia nowe zadanie, sprawdzane jak każde inne uruchomienie. Wstępne wypełnianie podlega tym samym zasadom co ponowne uruchomienie:

* **Pola haseł nigdy nie są zapisywane**, więc nigdy nie są wstępnie wypełniane: wpisz je ponownie. Stałe również nie są zapisywane.
* Wymagana jest opcja roli `allowJobRelaunch`, a zadanie musi być twoje (albo jesteś administratorem lub masz `manageAllJobs`).
* Formularza z `allowRelaunch: false` nie można uruchomić ponownie ani wstępnie wypełnić:

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Zadania sprzed wprowadzenia zapisywania wartości pól nie można wstępnie wypełnić, a formularz pokazuje zamiast tego błąd:

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Zatwierdzanie lub odrzucanie zadania

Zadanie z [punktem zatwierdzenia](../forms/approval.html) zatrzymuje się w stanie `approve` i czeka. Jest wyświetlane na stronie Zadania
swoich zatwierdzających, czyli użytkowników z jedną z ról zatwierdzenia, aby mogli je znaleźć; od wersji 7.3.0 inni użytkownicy już go nie widzą.

**Rozpatrz zatwierdzenie** jest dostępne dla administratorów i użytkowników, którzy mają jedną z ról zatwierdzenia: kliknięcie wiersza zadania,
**Rozpatrz zatwierdzenie** w menu wiersza lub przycisk **Rozpatrz zatwierdzenie** na stronie zadania. Okno dialogowe pokazuje komunikat
zatwierdzenia z wypełnionymi wartościami zadania (lub ogólny tekst, jeśli komunikatu nie ma) oraz formularz, id zadania, kto je uruchomił i
kiedy, z linkiem do zadania; **Odrzuć** i **Zatwierdź** udzielają odpowiedzi:

* **Zatwierdź**: zadanie jest kontynuowane, a jego stan wraca do `running`.
* **Odrzuć**: zadanie kończy się jako `rejected`, a jego wynik zapisuje `rejected by <username>`.

Zadania czekającego na zatwierdzenie nie można uruchomić ponownie ani usunąć ze strony Zadania; najpierw je zatwierdź lub odrzuć.

Od wersji 7.3.0 użytkownik, który uruchomił zadanie, nie może go zatwierdzić, więc zawsze patrzy na nie druga osoba, choć nadal może je odrzucić,
aby je wycofać. Administrator zawsze może zatwierdzać, łącznie z własnymi zadaniami. Formularz, którego punkt zatwierdzenia ustawia
[`allowSelf: true`](../forms/approval.html#approving-your-own-job), pozwala uruchamiającemu także zatwierdzić własne zadanie.

---

## Usuwanie zadania

**Usuń** w menu wiersza (⋮) listy lub **Usuń zadanie** na stronie zadania usuwa zadanie wraz z jego wynikiem po potwierdzeniu.
Usunięcie zadania wieloetapowego usuwa też jego kroki. Aby usunąć kilka zadań naraz, zaznacz je w pierwszej kolumnie listy i
kliknij **Usuń (n)** nad nią.

Możesz usuwać własne zadania. Administratorzy i, od wersji 7.3.0, użytkownicy z opcją roli `manageAllJobs` mogą usunąć dowolne zadanie; `showAllJobLogs`
już na to nie pozwala. Rola, która ustawia `allowJobDeletion: false`, nie usuwa żadnego zadania, nawet własnego, więc historia zadań pozostaje kompletna. Na stronie
zadania przycisk jest ukryty, gdy zadanie działa lub jest przerywane (z wyjątkiem administratorów i `manageAllJobs`) oraz gdy czeka na zatwierdzenie; na liście
pozycja menu i pole wyboru są wyszarzone dla zadania, którego nie możesz usunąć.

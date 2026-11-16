---
layout: default
title: Zapisane zadania
parent: Zadania
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c3ccb3044f19e33eaa03668524bd617b0af6c033
---

# Zapisane zadania
{: .no_toc }

Przechowywanie danych formularza, aby wczytać je później
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Zapisane zadania

Zapisane zadania przechowują wartości formularza, abyś mógł wczytać je ponownie zamiast za każdym razem wypełniać te same pola.

Aby zapisać, wypełnij formularz, otwórz listę rozwijaną obok **Wyślij** i wybierz **Zapisz**. W **Zapisz dane formularza** wpisz
**Nazwa** i opcjonalny **Opis**, określ w **Usuwany**, kiedy zostanie usunięte (zobacz [Kiedy jest usuwane](#when-it-is-removed)), a następnie zapisz.
Pola haseł i stałych nigdy nie są zapisywane. Podformularz ma tę samą akcję **Zapisz** obok swojego przycisku **Zapisz** i przechowuje niedokończone
wartości bez ich walidacji.

Aby wczytać, wybierz **Wczytaj z zapisanych** na górze formularza. **Wczytaj zapisany formularz** wyświetla twoje zapisane zadania dla tego formularza, z
datami ich utworzenia i wygaśnięcia; wybierz jedno, aby wypełnić formularz jego wartościami. Nic się nie uruchamia, dopóki nie wyślesz formularza.

Zapisane zadania są przechowywane w bazie danych AnsibleForms (tabela `stored_jobs`), z nazwą formularza, twoim użytkownikiem jako
`<type>/<username>` (na przykład `local/admin`) i wartościami jako JSON. Nazwa musi być unikalna dla użytkownika i formularza; zapisanie
drugiego z tą samą nazwą kończy się błędem „Zapisany formularz o tej nazwie już istnieje”.

---

## Zarządzanie zapisanymi zadaniami

Strona **Zapisane zadania** wyświetla zapisane zadania z ich formularzem, użytkownikiem, datą utworzenia i wygaśnięcia i wymaga `allowStoredJobs`.

Od wersji 7.6.0 samo `allowStoredJobs` otwiera **Zadania > Zapisane** i **Dodaj zapisane zadanie**, które wcześniej wymagały także
`showSettings` lub `allowScheduledJobs`. Jego lista **Formularz** oferuje formularze, które otwierają Twoje role; użytkownicy z `showSettings`
lub `allowScheduledJobs` dostają każdy formularz.

Od wersji 7.7.0 lista ma sortowalną kolumnę **Ostatnio użyte**, która odróżnia używane zapisane zadania od porzuconych.

- **Edytuj** otwiera własną stronę zapisanego zadania: jego **Szczegóły** (nazwa, opis, formularz, użytkownik, kiedy zostało utworzone i ostatnio
  użyte oraz kiedy zostanie usunięte), **Wartości**, czyli zapisane wartości pól jako YAML, które można tam zmienić i zapisać, oraz **Uruchomienia**.
- **Otwórz w formularzu** otwiera jego formularz z wypełnionymi zapisanymi wartościami; nic się nie uruchamia, dopóki nie wyślesz formularza.
- **Usuń** je usuwa. Możesz usuwać własne zapisane zadania; użytkownicy z `showSettings` mogą usuwać dowolne.

---

## Ostatnie użycie i uruchomienia

Od wersji 7.7.0 zapisane zadanie zapamiętuje ostatnie użycie i zadania z niego uruchomione, więc widać, które są nadal w użyciu.

Te uruchomienia liczą się jako użycie zapisanego zadania:

| Uruchomienie | Kiedy się liczy |
|---|---|
| Formularz otwarty z niego (**Otwórz w formularzu**) lub wypełniony przez **Wczytaj z zapisanych** | Gdy zadanie zostaje uruchomione |
| **Uruchom później** z tego formularza | Gdy zaplanowane uruchomienie się wykona, nie gdy zostaje zaplanowane |
| **Ponowne uruchomienie** zadania uruchomionego z niego | Gdy ponowne uruchomienie startuje, z tymi samymi lub zmienionymi wartościami |
| `launch_job` lub `plan_job` z MCP z tym zadaniem | Jak wyżej |

Uruchomienia harmonogramu nigdy się nie liczą, nawet harmonogramu utworzonego z zapisanego zadania: harmonogram ma własną kopię wartości. Uruchomienie
liczy się tylko wtedy, gdy użytkownik może widzieć zapisane zadanie; takie, które zostało od tego czasu usunięte lub ukryte, jest pomijane, a zadanie
i tak się uruchamia.

Strona zadania wskazuje, z linkiem, zapisane zadanie, z którego je uruchomiono, jeśli możesz je widzieć. Karta **Uruchomienia** na stronie zapisanego
zadania wyświetla uruchomione z niego zadania, które możesz widzieć, z ich stanem, początkiem, końcem i czasem trwania.

---

## Kiedy jest usuwane

Każde zapisane zadanie określa, kiedy jest usuwane: nigdy, w danym dniu albo gdy przez kilka dni nie jest używane.

| Wybór | Co robi |
|---|---|
| **Nigdy** | Zachowuje je, dopóki ktoś go nie usunie. Niedostępne, gdy ustawiono `STORED_JOB_UNUSED_DAYS` |
| **W dniu** | Usuwa je w tym dniu |
| **Gdy nieużywany przez N dni** | Usuwa je, gdy przez tyle dni nie uruchomiono z niego żadnego zadania |

Administrator może ustawić [`STORED_JOB_UNUSED_DAYS`](../customization/retention.html#env_STORED_JOB_UNUSED_DAYS)
(Ustawienia > Ogólne > Przechowywanie). Wtedy usuwa ona każde zapisane zadanie nieużywane przez tyle dni, własne dni zapisanego zadania mogą być
tylko mniejsze, okno Zapisz zaczyna od tej wartości, a zadanie usuwane w danym dniu jest usuwane także wtedy, gdy tak długo pozostaje nieużywane.
Dni liczą się od ostatniego użycia albo, dla zapisanego zadania nigdy nieużytego, od jego zapisania. Wartość domyślna, 0, nigdy nie usuwa zadania
z powodu braku użycia.

Zapisane zadania są usuwane codziennie o 04:00 (w `LOG_TZ`), gdy nadejdzie pierwszy z terminów: ich data albo ich dni.

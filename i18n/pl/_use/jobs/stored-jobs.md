---
layout: default
title: Zapisane zadania
parent: Zadania
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
translated_from: c4e55de429d31936d8735965a2f487c070b9140d
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
**Nazwa**, opcjonalny **Opis** i datę **Wygasa (opcjonalnie)**, a następnie zapisz. Pola haseł i stałych nigdy
nie są zapisywane. Podformularz ma tę samą akcję **Zapisz** obok swojego przycisku **Zapisz** i przechowuje niedokończone wartości bez
ich walidacji.

Aby wczytać, wybierz **Wczytaj z zapisanych** na górze formularza. **Wczytaj zapisany formularz** wyświetla twoje zapisane zadania dla tego formularza, z
datami ich utworzenia i wygaśnięcia; wybierz jedno, aby wypełnić formularz jego wartościami. Nic się nie uruchamia, dopóki nie wyślesz formularza.

Zapisane zadania są przechowywane w bazie danych AnsibleForms (tabela `stored_jobs`), z nazwą formularza, twoim użytkownikiem jako
`<type>/<username>` (na przykład `local/admin`) i wartościami jako JSON. Nazwa musi być unikalna dla użytkownika i formularza; zapisanie
drugiego z tą samą nazwą kończy się błędem „Zapisany formularz o tej nazwie już istnieje”.

---

## Zarządzanie zapisanymi zadaniami

Strona **Zapisane zadania** wyświetla zapisane zadania z ich formularzem, użytkownikiem, datą utworzenia i wygaśnięcia i wymaga `allowStoredJobs`.

- **Edytuj** otwiera własną stronę zapisanego zadania: jego **Szczegóły** (nazwa, formularz, wygaśnięcie) i **Wartości**, czyli zapisane
  wartości pól jako YAML, które można tam zmienić i zapisać.
- **Otwórz w formularzu** otwiera jego formularz z wypełnionymi zapisanymi wartościami; nic się nie uruchamia, dopóki nie wyślesz formularza.
- **Usuń** je usuwa. Możesz usuwać własne zapisane zadania; użytkownicy z `showSettings` mogą usuwać dowolne.
- Zapisane zadania z datą **Wygasa** w przeszłości są usuwane automatycznie codziennie o 04:00 (w `LOG_TZ`).

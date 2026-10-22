---
layout: default
title: Projektant
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: 77ea52f327e41f36adaf3be7d2b50c1d1716bcb6
---

# Projektant
{: .no_toc }

Edycja formularzy, playbooków, inwentarzy i workflowów w przeglądarce
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla autorów formularzy: sekcje projektanta i to, co pokazuje każda z ich kart.

Projektant wymaga [opcji roli](../config/roles.html#role-options) `showDesigner`. Edytuje jeden element naraz,
formularz, playbook lub plik workflow, a jego sekcje są w lewym menu. Każdy rodzaj pliku wymaga też własnej opcji, wszystkie
domyślnie włączone: `allowPlaybookDesign` dla **Playbooki**, `allowWorkflowDesign` dla **Przepływy pracy**,
`allowInventoryDesign` dla **Inwentarze** i `allowVarsFileDesign` dla **Pliki zmiennych**. Bez niej sekcja jest
tylko do odczytu, a serwer odmawia zapisywania, tworzenia, usuwania i wypychania jej plików; formularze i workflowy nadal mogą je wybierać.
**Formularze**, **Kategorie** i **Stałe** w ten sam sposób wymagają `allowFormDesign`: bez niej są tylko do odczytu, a serwer
odmawia ich zapisywania, pobierania (pull) i wypychania (push). Edytować może tylko jedna osoba naraz: zobacz [Blokada projektanta](lock.html).

---

## Sekcje

Każda sekcja edytuje jeden rodzaj pliku, przechowywany lokalnie lub w [repozytorium](../repositories/):

| Sekcja | Co edytuje |
|---|---|
| **Formularze** | Pliki formularzy |
| **Kategorie** | Kategorie z `config.yaml` |
| **Stałe** | Stałe z `config.yaml` |
| **Pliki zmiennych** | Pliki zmiennych ładowane przez formularze |
| **Playbooki** | Playbooki uruchamiane przez formularze i workflowy |
| **Inwentarze** | Inwentarze: `inventory.yaml`, `group_vars` i `host_vars` |
| **Przepływy pracy** | Pliki [workflow](../workflows/) |

Sekcje z plikami wyświetlają je w eksploratorze plików i otwierają pierwszy z nich; sekcja, która nie ma jeszcze plików, informuje o tym.
Sekcja **Formularze** i każda sekcja plików mają na początku paska narzędzi przycisk **Nowy plik**: w Inwentarzach tworzy on nowy
inwentarz, w Przepływach pracy nowy, pusty workflow. Lupa eksploratora otwiera pole, które filtruje jego pliki po nazwie.

Pole wyszukiwania w wierszu tytułu znajduje tekst w otwartym YAML: zaznacza każde miejsce, w którym się pojawia. Działa na
karcie **YAML**, gdy blokada projektanta należy do ciebie.

---

## Karty

Każda sekcja ma te same trzy karty, wszystkie na tym samym YAML: zmiana w jednej jest widoczna w pozostałych, a **Zapisz** ją zapisuje.

- **YAML** to plik w takiej postaci, w jakiej jest zapisany.
- **Wizualny** edytuje go za pomocą pól. Zmieniają się tylko klucze, których dotyczy edycja, więc komentarze i reszta pozostają bez zmian.
- **Podgląd** pokazuje, co plik robi, i niczego nie edytuje.

Co pokazują karty Wizualny i Podgląd w poszczególnych sekcjach:

| Sekcja | Wizualny | Podgląd |
|---|---|---|
| **Formularze** | Ustawienia formularza i jego pola, z listami playbooków, inwentarzy i workflowów projektanta | Formularz w obecnej postaci, łącznie z niezapisanymi zmianami; jego wysłanie niczego nie uruchamia |
| **Kategorie** | Kategorie jako tabela, do edycji | Menu strony Formularze, zbudowane z nich |
| **Stałe** | Stałe jako konspekt, do edycji (klucz przesuwa się klawiszami strzałek) | Każda stała z odwołaniem do niej, `$(NAME)`, do skopiowania, oraz formularze, które jej używają |
| **Pliki zmiennych** | Zmienne, do edycji | Każda zmienna z odwołaniem do niej w playbooku, {% raw %}`{{ name }}`{% endraw %}, do skopiowania, oraz formularze, które ładują plik |
| **Playbooki** | Play: nazwa, hosty, **Become**, **Zbieraj fakty** i role każdego play oraz jego zadania, każde z modułem i argumentami | Konspekt playbooka: jego play z hostami, rolami i zadaniami oraz importowane przez niego playbooki |
| **Inwentarze** | Grupy, ich grupy podrzędne, ich hosty i zmienne ustawiane przez każde z nich | Inwentarz jako drzewo, z jego `group_vars` i `host_vars` |
| **Przepływy pracy** | Graf workflow, do [edycji](../workflows/designer.html) | [Próbne uruchomienie](../workflows/designer.html#trying-it-out): kliknij węzeł, aby zakończył się błędem |

Gdy YAML nie da się odczytać, karty Wizualny i Podgląd podają przyczynę, z przyciskiem **Pokaż w YAML**, który otwiera YAML w odpowiednim wierszu.

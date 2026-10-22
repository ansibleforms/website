---
layout: default
title: Edycja w projektancie
parent: Workflowy
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Edycja w projektancie
{: .no_toc }

Narysuj workflow i wypróbuj go, niczego nie uruchamiając
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sekcja Przepływy pracy

**Projektant > Przepływy pracy** wyświetla pliki workflow w eksploratorze plików, z kartami YAML, Wizualny i Podgląd, takimi jak w każdej
sekcji [projektanta](../designer/).

- **Przycisk `+`** na pasku narzędzi tworzy plik workflow z pustym workflow na początek.
- **YAML** pokazuje plik w takiej postaci, w jakiej jest zapisany. Komentarze i kolejność kluczy są zachowywane także przez pozostałe karty.
- **Wizualny** rysuje każdy workflow z pliku jako graf, z nazwą i opisem nad nim. Plik z dwoma workflow
  pokazuje oba, jeden pod drugim.
- **Podgląd** to próbne uruchomienie workflow: zobacz [Wypróbowanie](#trying-it-out).

Problemy są wymienione nad grafem, każdy z linkiem otwierającym YAML w odpowiednim wierszu: połączenie do węzła, który nie
istnieje, pętla, playbook, inwentarz, poświadczenie, runner lub repozytorium, których projektant nie zna.

---

## Graf

Graf czyta się od lewej do prawej, od **START** do ostatnich węzłów. Każdy węzeł pokazuje swój identyfikator, a pod nim to, co
uruchamia; połączenia są pokolorowane według tego, co je uruchamia, jak mówi legenda wewnątrz grafu: przy sukcesie, przy błędzie,
zawsze.

- **Kliknij START**, aby dodać pierwszy węzeł: węzeł bez rodzica, który uruchamia się, gdy tylko wystartuje workflow.
- **Kliknij węzeł**, aby go edytować.
- **Kliknij połączenie**, aby zmienić to, co je uruchamia, lub je usunąć.

---

## Dodawanie węzła

Nowy węzeł dodaje się kreatorem: **Nowy węzeł przy sukcesie**, **Nowy węzeł przy błędzie** lub **Nowy węzeł zawsze** na istniejącym
węźle albo START dla pierwszego.

1. **Co uruchamia**: identyfikator węzła, **Uruchamia** (jakiego rodzaju jest węzeł i, dla węzła playbooka, gdzie działa)
   oraz to, co uruchamia: playbook albo szablon lub zadanie, workflow, nazwę i limit czasu zatwierdzenia albo repozytorium. Zobacz
   [Gdzie działa węzeł](#where-a-node-runs).
2. **Jak działa**: ustawienia uruchamiania: inwentarz, poświadczenia, limit, tagi, szczegółowość,
   tryb check i diff, warunek (**Działa, gdy**) oraz **Wartości z** (zobacz [plik workflow](file.html#run-settings)).
3. **Dokąd prowadzi**: węzeł, po którym się uruchamia, i w jakiej sytuacji.

**Utwórz** dodaje węzeł do YAML.

---

## Gdzie działa węzeł

**Uruchamia** mówi, co węzeł uruchamia i gdzie, na jednej liście: **Playbook na RTE**, **Szablon na AWX**, **Szablon na
Semaphore**, **Zadanie na Rundeck**, **Zadanie na Jenkins**, a potem **Workflow**, **Zatwierdzenie** i **Pull repozytorium**.

| Uruchamia | Pole pod nim | Runner |
|---|---|---|
| **Playbook na RTE** | **Playbook**: playbook z projektanta | **Domyślne RTE** lub runner RTE wskazany z nazwy |
| **Szablon na AWX** (łącznie z AAP i Ascender) | **Szablon**: wpisana nazwa szablonu | runnery AWX, każdy ze swoim wariantem |
| **Szablon na Semaphore** | **Szablon**: wpisana nazwa szablonu | runnery Semaphore |
| **Zadanie na Rundeck** lub **Zadanie na Jenkins** | **Zadanie**: wpisana nazwa zadania | runnery Rundeck lub Jenkins |

- **Playbook na RTE** jest zawsze dostępny; pozostałe tylko wtedy, gdy instancja ma [runner](../runners.html) danego typu.
- **Runner** wyświetla tylko runnery danego typu, z oznaczonym i wstępnie wybranym domyślnym (lub pierwszym według nazwy).
- Wybór innego miejsca czyści to, co węzeł uruchamia, więc trzeba to wybrać ponownie.
- Węzeł, którego runnera projektant nie zna, pokazuje **Szablon lub zadanie na** tym runnerze.

Plik workflow się nie zmienia: taki węzeł to węzeł `job_template` z `runner:` (zobacz
[plik workflow](file.html#run-settings)).

---

## Edycja węzła

Kliknięcie węzła otwiera jego okno dialogowe z czterema kartami:

| Karta | Co zawiera |
|---|---|
| **Co uruchamia** | Identyfikator, **Uruchamia**, to, co uruchamia, oraz, dla węzła playbooka, runner |
| **Jak działa** | Ustawienia uruchamiania; poświadczenia wybiera się z listy, każde dodaje się przez `+` |
| **Uruchamia się po** | Połączenia prowadzące do węzła oraz **Wszyscy rodzice muszą się zbiec** |
| **Uruchamia potem** | Połączenia wychodzące z niego, z **Połącz z istniejącym węzłem:** i **Połącz z nowym węzłem:** |

**Pokaż w YAML** otwiera YAML na węźle, a **Usuń węzeł** usuwa go wraz z jego połączeniami. Każda zmiana jest od razu zapisywana w
YAML; **Zapisz** zapisuje plik.

---

## Wypróbowanie

Karta **Podgląd** odtwarza workflow bez uruchamiania czegokolwiek, według zasad AWX.

Każdy węzeł zaczyna jako sukces. Kliknij węzeł, aby zakończył się błędem, i kliknij ponownie, aby znów zakończył się sukcesem; graf pokazuje wtedy,
które węzły by się uruchomiły, które by się nie uruchomiły i czy workflow zakończyłby się błędem. **Resetuj** sprawia, że każdy węzeł znów kończy się sukcesem.

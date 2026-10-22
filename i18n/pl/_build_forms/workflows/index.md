---
layout: default
title: Workflowy
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflowy
{: .no_toc }

Łączenie playbooków, zatwierdzeń i innych workflow w łańcuch, tak jak w AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla autorów formularzy: czym jest workflow, jak działają jego węzły i gdzie czytać dalej.

Workflow to graf węzłów. Każdy węzeł coś uruchamia: jeden z playbooków projektanta, inny workflow, zatwierdzenie
lub pull repozytorium. Połączenia między węzłami mówią, co uruchamia się potem: przy sukcesie, przy błędzie lub zawsze. Uruchamia go formularz
[typu `workflow`](../forms/workflow.html), a strona zadań rysuje go na żywo w trakcie działania.

Workflowy stosują składnię i zasady AWX, więc workflow wyeksportowany z AWX czyta się w AnsibleForms tak samo. Działają
na RTE, bez AWX: węzeł playbooka to osobne zadanie, z inwentarzem, poświadczeniami, limitem i tagami węzła.

---

## Jak działa workflow

Węzły działają według zasad AWX, a gałęzie, które od siebie nie zależą, działają równolegle.

- **Węzeł bez rodzica startuje od razu**, gdy startuje workflow.
- **Połączenie zadziała, gdy jego węzeł się zakończy**: połączenie *przy sukcesie* po sukcesie, połączenie *przy błędzie* po błędzie,
  połączenie *zawsze* po jednym lub drugim. Anulowany węzeł nie uruchamia żadnego ze swoich połączeń.
- **Węzeł startuje, gdy tylko zadziała jedno prowadzące do niego połączenie.** Przy włączonym **Wszyscy rodzice muszą się zbiec** czeka, aż zadziałają wszystkie
  połączenia do niego.
- **Węzeł, który nie może już wystartować, jest oznaczany jako *nie uruchamia się***, podobnie jak węzły, które tylko on mógł uruchomić.
- **Workflow kończy się błędem, gdy węzeł zakończył się błędem i nic go nie obsługuje**: ten węzeł nie ma połączenia *przy błędzie* ani *zawsze*.
  Błąd obsłużony przez połączenie nie powoduje błędu workflow.

Węzeł z niespełnionym warunkiem (`if_extra_var`) jest pomijany. To, co następuje po nim, działa jak po sukcesie. Węzeł
zatwierdzenia nie przyjmuje warunku: zawsze czeka na odpowiedź.

---

## Przekazywanie danych między węzłami

To, co playbook węzła zbierze przez `set_stats`, trafia do kolejnych węzłów jako extra vars, tak jak AWX przekazuje dalej
artefakty zadania. Węzeł otrzymuje dane od każdego rodzica, którego połączenie do niego zadziałało, scalone w kolejności zapisania
rodziców, i przekazuje dalej to, co dostał, plus dane własnego zadania; przy kluczu ustawionym przez oba wygrywają jego własne.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Węzeł po nim odczytuje wtedy {% raw %}`{{ version }}` i `{{ build_id }}`{% endraw %} jak każdą inną extra var.

Extra vars węzła pochodzą z czterech miejsc. Jedno z nich, `extra_data`, to własne zmienne węzła: tak nazywa je AWX,
ustawiane na węźle w [pliku workflow](file.html#run-settings). Gdy dwa z nich ustawiają ten sam klucz, kolejność pierwszeństwa jest
taka jak w AWX, od najniższego:

| Źródło | Wygrywa z |
|---|---|
| własne zmienne węzła (`extra_data`) | niczym |
| dane przekazane dalej przez `set_stats` | `extra_data` węzła |
| `extra_vars` workflow | przekazanymi danymi |
| wartości formularza | wszystkim |

- Przekazywane są tylko dane dotyczące całego playbooka: `set_stats` z `per_host: false`, czyli domyślnie.
- Węzeł zatwierdzenia, węzeł pominięty i węzeł projektu przekazują dalej to, co do nich dotarło.
- Wynik węzła kończy się kluczami, które przekazał dalej, tylko z nazwy, ponieważ ich wartości mogą być tajne.
- Zadanie węzła zachowuje swoje dane jako artefakty (**Pokaż artefakty** na jego stronie), a zadanie workflow zachowuje dane wszystkich
  swoich węzłów, więc zagnieżdżony workflow również przekazuje je kolejnym węzłom.
- Węzeł działający na runnerze AWX w ten sam sposób przekazuje dalej artefakty swojego zadania AWX.
---

## W tej sekcji

Na kolejnych stronach szczegółowo opisano workflowy:

| Strona | Czego dotyczy |
|---|---|
| [Plik workflow](file.html) | Składnia pliku, typy węzłów i ustawienia uruchamiania każdego węzła |
| [Edycja w projektancie](designer.html) | Sekcja Przepływy pracy w projektancie: graf, okna dialogowe węzłów i połączeń oraz próbne uruchomienie |
| [Uruchamianie workflow](running.html) | Formularz, który go uruchamia, strona zadania, wyniki węzłów, zatwierdzenia i przerywanie |

---
layout: default
title: Śledzenie zadania
parent: Zadania
nav_order: 2
translated_from: 31962d9845c3241caca78025476d82f772e9d7a5
---

# Śledzenie zadania
{: .no_toc }

Wynik na żywo, extravars, filtry i pobieranie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Śledzenie zadania

Kliknięcie zadania otwiera jego stronę: formularz zadania jako tytuł, jego akcje w nagłówku i jego wynik poniżej.

![Wynik zadania](../assets/screenshots/job-output.jpg)

Od wersji 7.3.0 strona składa się z kart, a każdą można zwinąć pod jej nagłówkiem:

| Karta | Co pokazuje |
|---|---|
| **Podsumowanie** | Nazwę, stan i typ zadania jako nagłówek, a pod nim informacje o zadaniu w siatce z trzema kolumnami (dwiema, a potem jedną na wąskiej stronie) |
| **Workflow** | Dla zadania workflow, także zadania workflow AWX lub AAP, jego graf i liczbę węzłów (zobacz [Graf workflow](#the-workflow-graph)) |
| **Wynik** | Wynik zadania i jego pasek narzędzi |

Zadanie, które działało na AWX, AAP, Ascender, Jenkins, Semaphore lub Rundeck, pokazuje tam swój numer jako link do swojej strony w tym narzędziu, otwierany
w nowej karcie. Link jest zapisany w zadaniu, więc działa nadal, gdy runner zostanie później przemianowany lub usunięty.

Strona aktualizuje się na żywo: serwer wysyła zdarzenie za każdym razem, gdy zadanie zostaje uruchomione, zmienia stan, zapisuje wynik lub zostaje
usunięte, a strona ponownie odczytuje zadanie, więc wynik rośnie w miarę jego zapisywania. Lista zadań aktualizuje się w ten sam sposób.
**Odśwież** przeładowuje zadanie ręcznie.

Gdy jesteś na końcu wyniku, strona przewija się za nim w dół, gdy przychodzą nowe wiersze. Przewiń w górę, aby przeczytać wcześniejszy wiersz,
a strona zostanie tam, gdzie jesteś: nad dołem wyniku pojawi się wtedy **Przejdź do najnowszych**, które zmieni się w **Nowe wiersze**, gdy
przyjdą kolejne. Kliknij je lub przewiń z powrotem na koniec, aby znów śledzić nowe wiersze. Wynik na stronie formularza po
**Wyślij** i [log serwera](../production/logs.html) śledzą nowe wiersze w ten sam sposób.

Pasek narzędzi wyniku zawiera:

| Przycisk | Co robi |
|---|---|
| **Pokaż extravars** | Pokazuje extravars, z którymi działało zadanie, w panelu nad wynikiem, z przełącznikiem **JSON** / **YAML** i przyciskiem **Kopiuj** |
| **Pokaż artefakty** | Pokazuje artefakty zadania w tym samym panelu (zobacz niżej) |
| **Pokaż parametry** | Zastępuje **Pokaż extravars** dla zadania Jenkins: wartości, z którymi działało, czyli jego parametry builda |
| **Pokaż payload** | Zastępuje **Pokaż extravars** dla zadania Rundeck: payload, który zostało mu wysłane |
| **Hosty i zadania** | Pokazuje hosty i zadania playbooka nad jego wynikiem (zobacz [Hosty i zadania](#hosts-and-tasks)) |
| **Odśwież** | Przeładowuje wynik |
| **Zastosuj filtr** | Ukrywa zadania, których nazwa pasuje do filtra wyniku; **Usuń filtr** pokazuje je ponownie |
| **Kopiuj wynik** | Kopiuje wynik jako zwykły tekst, z zastosowanym filtrem lub bez |
| **Pobierz wynik** | Pobiera wynik jako `ansibleforms-job-<id>.txt` |

**Pokaż artefakty** jest dostępne dla każdego zadania, które nie jest zadaniem szablonu, np. playbooka na RTE lub workflow (puste, gdy
jego playbooki nie zebrały artefaktów przez `set_stats`), oraz dla zadania szablonu, które działało na AWX, AAP lub Ascender. Zadania Semaphore, Rundeck
i Jenkins nie mają artefaktów, więc dla nich nigdy nie jest dostępne.

Po lewej stronie paska narzędzi przycisk **Zwiń wszystko** zwija każdą sekcję wyniku (każdy play i każde zadanie) i zmienia się w
**Rozwiń wszystko**, który ponownie je rozwija.

**Pokaż extravars** wymaga opcji roli `showExtravars`, a **Pokaż artefakty** opcji roli `showArtifacts` (zobacz
[opcje ról](../config/roles.html#role-options)). Wartości pól haseł i kluczy pasujących do
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) są maskowane.

Filtr ustawia [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), domyślnie `\[low\]`.
Dodaj `[low]` do nazwy hałaśliwego zadania, a **Zastosuj filtr** ukryje to zadanie i jego wiersze.

Strona zadania wieloetapowego pokazuje każdy krok pod zadaniem głównym, jeden pod drugim, każdy pod paskiem tytułu, np.
**Krok 1 · Prepare the server (id zadania 98)**, z jego stanem. Kliknij tytuł (lub naciśnij na nim Enter albo Spację), aby zwinąć ten wynik,
i ponownie, aby go rozwinąć. Workflowy AWX/AAP pokazują też stan swoich węzłów.

Zadania [workflow](../workflows/running.html#the-job) przechowują wynik każdego węzła we własnym wyniku, pod banerem `WORKFLOW NODE` dla każdego
węzła; rysują swój graf na żywo, a kliknięcie węzła otwiera jego wynik.

---

## Wyszukiwanie tekstu w wyniku

Od wersji 7.3.0 strona zadania ma pole wyszukiwania **Szukaj w wyniku** w wierszu tytułu, na lewo od akcji zadania.

Każde miejsce, w którym tekst pojawia się w wyniku, jest podświetlane, bez względu na wielkość liter, a strona przechodzi do pierwszego z nich. **Enter** przechodzi
do następnego, pokazanego mocniej, a pasek narzędzi podaje, które to z ilu (**2 z 4**), lub **Nie znaleziono**. Wyszukiwanie najpierw rozwija wynik i
jego sekcje, a gdy zadanie działa, przeszukiwane są też nowe wiersze, bez przesuwania strony.

---

## Poruszanie się po długim wyniku

Od wersji 7.3.0 długi wynik, na stronie zadania i pod formularzem po **Wyślij**, ma następujące sposoby nawigacji:

| Element | Co robi |
|---|---|
| Przyklejone nagłówki | Nagłówek sekcji (węzła workflow, playbooka zadania, kroku zadania wieloetapowego) pozostaje na górze, gdy jej wiersze się przewijają |
| **2 nieudane** | Liczy nieudane zadania, pomijając błędy, które Ansible miał zignorować; każde kliknięcie przechodzi do następnego, rozwiniętego i podświetlonego. Bez nieudanych zadań **1 błąd** liczy zamiast tego wiersze błędów |
| Numery wierszy | Każdy numer wiersza jest linkiem do swojego wiersza, np. `#L45` w adresie: otwarcie tego adresu przewija do wiersza i go podświetla |
| Przyciski w górę i w dół | Wyświetlane w prawym dolnym rogu po przewinięciu strony, aby wrócić na górę lub przejść na koniec |
| **Uruchomione** i **Przerwij** | Gdy zadanie działa, pasek strony formularza jest przytrzymywany na dole okna, a **Przerwij** w nim od razu zatrzymuje zadanie |

---

## Wyniki zadań

Od wersji 7.3.0 wiersz wyniku hosta w wyniku playbooka otwiera ten wynik w oknie dialogowym **Wynik zadania**, tak jak w AWX.

Wiersz, treść wyniku po nim (`=> { ... }`) i błąd wypisany przed nieudanym wynikiem są podświetlane jako jeden blok po najechaniu, a
kliknięcie otwiera okno dialogowe. Działa to na stronie zadania i pod formularzem po **Wyślij**, dla playbooka, który działał na RTE w wersji 7.3.0 lub
nowszej, ponieważ wynik pochodzi z tych samych zdarzeń co [Hosty i zadania](#hosts-and-tasks). Okno dialogowe ma następujące karty:

| Karta | Co pokazuje |
|---|---|
| **Szczegóły** | Stan, host, play, zadanie, moduł, element pętli, czas rozpoczęcia, czas trwania, kod powrotu i komunikat |
| **JSON** i **YAML** | Cały wynik modułu, pokolorowany i z numerowanymi wierszami |
| **Standardowe wyjście** i **Standardowy błąd** | `stdout` i `stderr` wyniku, jeśli je ma |

Od wersji 7.5.0 cały wynik, a wraz z nim karty **JSON**, **YAML** i karty wyjścia, jest zapisywany bez względu na poziom szczegółowości
zadania, jak w AWX; RTE starsze niż 7.5.0 zapisuje go tylko w trybie verbose. Zadanie z `no_log` ma wynik ocenzurowany przez Ansible,
argumenty modułu (`invocation`) i własne klucze Ansible `_ansible*` są pomijane, wartości kluczy wyglądających na sekret są maskowane,
a wynik jest obcinany, gdy przekracza 64 KB JSON.

---

## Graf workflow

Od wersji 7.3.0 graf działającego workflow przesuwa się tak, aby działający węzeł był widoczny.

Jeśli przewiniesz graf w inne miejsce, zostanie tam, gdzie go zostawiłeś, z przyciskiem **Śledź działający węzeł**, aby znów go śledzić. Najechanie na węzeł
pokazuje jego kartę z pełną nazwą i wyróżnia węzeł oraz jego połączenia, a reszta grafu jest przygaszona. Graf ma przyciski **Dopasuj do
ekranu** i **Pełny ekran**, a pod formularzem po **Wyślij** kliknięcie węzła otwiera jego wynik tak jak na stronie zadania.

---

## Hosty i zadania

Od wersji 7.3.0 zadanie playbooka, które działało na RTE w wersji 7.3.0 lub nowszej, zapisuje swoje zdarzenia strukturalne obok wyniku tekstowego: każdy play, zadanie
i wynik hosta oraz podsumowanie. **Hosty i zadania** na pasku narzędzi wyniku pokazuje je w panelu nad wynikiem, na stronie zadania i
pod formularzem po **Wyślij**. Przycisk jest dostępny, gdy zadanie ma zdarzenia, a panel jest odczytywany ponownie co kilka sekund, gdy zadanie działa:

| Widok | Co pokazuje |
|---|---|
| **Siatka** | Podsumowanie dla każdego hosta (ok, changed, failed, unreachable, skipped, rescued, ignored), a potem siatkę hostów według zadań: każda komórka jest pokolorowana według wyniku hosta dla danego zadania, z komunikatem i czasem po najechaniu, albo *nie uruchomiono* |
| **Oś czasu** | Każde zadanie jako pasek o długości odpowiadającej najwolniejszemu hostowi, z czasem w sekundach i sumą |

Wynik tekstowy pozostaje bez zmian. Zdarzenia zapisuje własna wtyczka callback RTE `af_events`, więc playbook nie wymaga żadnych zmian.

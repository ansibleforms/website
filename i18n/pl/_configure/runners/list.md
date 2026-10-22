---
layout: default
title: Strona runnerów
parent: Runnery
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# Strona runnerów
{: .no_toc }

Lista runnerów, dodawanie runnera, włączanie i wyłączanie go oraz domyślny runner każdego typu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lista

Strona w **Połączenia > Runnery** wyświetla każdy runner z tymi kolumnami:

| Kolumna | Znaczenie |
|---|---|
| Włączony | Czy przyjmuje zadania. Wyłączony runner nie dostaje żadnych zadań, nawet jako domyślny dla swojego typu. |
| Nazwa | Jak odwołują się do niego formularze, przez `runner: <name>`. |
| Typ | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck lub Jenkins. Domyślny runner swojego typu ma po nim pigułkę **Domyślne**. |
| Opis | Do czego służy. |

**Kolumny** dodaje dwie kolejne, domyślnie wyłączone: **Tryb**, czyli tryb RTE (Wychodzący, Przychodzący lub Baza danych (przestarzały), zobacz
[Tryby](../rte/modes.html)), oraz **Połączenie**, czyli czy węzeł aplikacji trzyma gniazdo do RTE w trybie gniazda: **Połączony** lub
**Niepołączony**.

Od wersji 7.3.0 runnery czekające na zatwierdzenie nie są na liście, tylko w powiadomieniu nad nią, zobacz [Zatwierdzanie RTE](registration.html#approving-an-rte).
**Dodaj runner** otwiera okno w krokach: **Runner** (nazwa i opis), **Typ** i **Poświadczenia**, z krokiem **Tryb** po
**Typ** dla RTE (Wychodzący, domyślny dla nowego, Przychodzący lub Baza danych (przestarzały)): cztery kroki dla RTE, trzy dla
pozostałych. W kroku **Typ** każdy produkt ma podpowiedź: podpowiedź RTE podaje jego pełną nazwę, *Środowisko uruchomieniowe*. Wiersz otwiera własną
stronę runnera, a jego menu oferuje:

| Akcja | Co robi |
|---|---|
| Edytuj | Otwiera jego stronę |
| Testuj połączenie | Sprawdza, czy odpowiada i akceptuje swoje poświadczenie, zobacz [Testuj połączenie](runner-page.html#test-connection) |
| Włącz, Wyłącz | Włącza go lub wyłącza, zależnie od stanu |
| Zmień poświadczenia | Otwiera kartę Poświadczenia na jego stronie |
| Usuń | Usuwa go |

---

## Domyślny i Włączony

Domyślny runner każdego typu to miejsce, w którym działają formularze tego typu, gdy nie wskazują żadnego runnera:

| Domyślny dla | Gdzie działają te formularze, gdy nie wskazują runnera |
|---|---|
| Formularze playbooków | Formularze `ansible`, na RTE |
| Formularze AWX, AAP i Ascender | Formularze `awx`, `aap` i `ascender`, na runnerze AWX |
| Formularze Semaphore | Formularze `semaphore` |
| Formularze Rundeck | Formularze `rundeck` |
| Formularze Jenkins | Formularze `jenkins` |

Pierwszy runner danego typu staje się domyślnym, więc pojedynczy runner na typ nie wymaga dodatkowego kroku. Aby ustawić inny runner jako domyślny,
włącz przełącznik **Domyślne** na jego stronie (zobacz [Strona runnera](runner-page.html)).

Wyłączony runner zostaje na liście ze swoimi ustawieniami, ale nie trafia do niego żadne zadanie, także jako domyślnego dla swojego typu. Zadanie dla niego kończy się błędem
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Włączaj go i wyłączaj przez **Włącz** lub **Wyłącz** w menu jego wiersza albo przełącznikiem **Włączony** na jego stronie. Nowy runner jest włączony, a
runnery istniejące przed wersją 7.3.0 są po aktualizacji włączone. [Config seed](../seed/example.html) może wyłączyć runner przez
`enabled: false`.

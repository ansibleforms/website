---
layout: default
title: Runnery
nav_order: 11
has_children: true
has_toc: false
permalink: /runners.html
translated_from: 339eda183d7748fa923090d9f8e26e2f112b1352
---

# Runnery
{: .no_toc }

Gdzie działają zadania: kontenery środowiska uruchomieniowego dla playbooków oraz AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins dla szablonów
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: dodaj runnery, na których działają Twoje zadania, wybierz domyślny dla każdego typu, zatwierdzaj RTE, które proszą o dołączenie, i testuj je.

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Strona runnerów](runners/list.html) | Lista runnerów, dodawanie runnera, włączanie i wyłączanie go oraz domyślny runner każdego typu |
| [Typy runnerów](runners/types.html) | Produkty, którymi może być runner, ich adres i logowanie |
| [Rejestracja](runners/registration.html) | Jak RTE prosi o dołączenie i jest zatwierdzane, tokeny dołączenia dla instalacji bez nadzoru oraz tryb bazy danych |
| [Strona runnera](runners/runner-page.html) | Karty runnera, tryb i połączenie RTE oraz Testuj połączenie |
| [Kto zarządza runnerami](runners/permissions.html) | Kto może dodawać, zmieniać i testować runnery |


---

## Jak to działa

Od wersji 7 aplikacja sama niczego nie uruchamia: każde zadanie działa na **runnerze**, dodawanym w **Połączenia > Runnery**.
Typ formularza decyduje, jakiego typu runnera potrzebuje:

| Typ formularza | Działa na runnerze typu | Co jest uruchamiane |
|---|---|---|
| `ansible` | RTE | Playbook, w kontenerze środowiska uruchomieniowego |
| `awx`, `aap`, `ascender` | AWX (odmiany AWX, AAP i Ascender) | Szablon zadania lub workflow |
| `semaphore` | Semaphore | Szablon Semaphore UI |
| `rundeck` | Rundeck | Zadanie Rundeck |
| `jenkins` | Jenkins | Zadanie Jenkins |

Formularz `workflow` lub `subform` nie ma własnego runnera: każdy węzeł [workflow](workflows/) wybiera własny. Węzeł
z `runner:` działa na tym runnerze (RTE albo szablon lub zadanie na AWX, Semaphore, Rundeck lub Jenkins), każdy inny na
domyślnym RTE, więc węzły jednego zadania mogą działać na różnych runnerach. Formularz `multistep`, przestarzały od wersji 7 i
zastąpiony przez workflowy, działa tak samo: każdy jego krok działa na runnerze, którego potrzebuje jego własny typ.

Formularz wybiera runner na jeden z dwóch sposobów:

- **Po nazwie**: `runner: <name>` w formularzu, w węźle workflow lub w kroku przestarzałego formularza multistep (także w
  ustawieniach formularza w projektancie). Runner musi być typu, którego potrzebuje formularz, inaczej zadanie kończy się błędem. Starsze `awx: <name>`
  nadal działa, zapisuje w dzienniku ostrzeżenie o przestarzałości i zniknie w wersji 8.
- **Jako domyślny**: formularz, który nie wskazuje runnera, działa na domyślnym runnerze swojego typu. Bez niego zadanie kończy się błędem
  z komunikatem, który mówi, jakiego typu runner trzeba dodać.

Runner wyłączony w **Połączenia > Runnery** nie dostaje żadnych zadań, ani po nazwie, ani jako domyślny: zadanie kończy się błędem z prośbą o jego włączenie
lub wskazanie innego runnera (zobacz [Domyślny i Włączony](runners/list.html#default-and-enabled)).


---
layout: default
title: Stany i typy
parent: Zadania
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Stany i typy
{: .no_toc }

Każdy stan, jaki może mieć zadanie, i rodzaje zadań
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Stany zadań

AnsibleForms ustawia na zadaniu następujące stany. Lista pokazuje każdy stan jako kolorową etykietę:

| Stan | Znaczenie | Co możesz zrobić |
|---|---|---|
| `running` | Zadanie działa lub zatwierdzone zadanie zostało wznowione | Śledzić jego wynik, przerwać je |
| `approve` | Zadanie czeka w [punkcie zatwierdzenia](../forms/approval.html), zanim się uruchomi (lub zanim uruchomi się krok formularza wieloetapowego) | Zatwierdzić je lub odrzucić, jeśli jedna z twoich ról jest zatwierdzająca |
| `success` | Playbook, szablon lub każdy krok zakończył się bez błędów | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `failed` | Zadanie zakończyło się błędem lub samo uruchomienie się nie powiodło | Wyświetlić wynik, aby sprawdzić przyczynę, uruchomić ponownie, usunąć |
| `warning` | Formularz wieloetapowy się zakończył, ale krok z ustawionym `continue` zakończył się błędem | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `aborted` | Zadanie zostało przerwane z AnsibleForms lub zadanie AWX / AAP zostało anulowane | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `rejected` | Zatwierdzający odrzucił zadanie; nigdy się nie uruchomiło | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `abandoned` | AnsibleForms przestał śledzić zadanie (zobacz [Porzucone zadania](cleanup.html#abandoned-jobs)) | Sprawdzić zarządzane hosty, uruchomić ponownie, usunąć |

`running` jest niebieski, `success` zielony i brzmi **Zakończone powodzeniem**, a `failed` czerwony. `approve` jest pomarańczowy i brzmi **Oczekuje na zatwierdzenie**,
więc zadanie czekające na człowieka odróżnia się od zatrzymanych; `warning`, `aborted` i `rejected` są bursztynowe. `abandoned` jest
szary: nikt go nie zatrzymał, ale to, co je uruchamiało, zniknęło.

---

## Typy zadań

Typ zadania wynika z `type` formularza, który uruchomił zadanie, tak jak pokazuje go lista i strona zadania:

| Wyświetlany typ | Co działa |
|---|---|
| `ansible` | Playbook Ansible uruchamiany na RTE |
| `awx`, `aap`, `ascender` | Szablon zadania lub szablon workflow na AWX, AAP lub Ascender |
| `semaphore` | Szablon na Semaphore UI |
| `rundeck`, `jenkins` | Zadanie na Rundeck lub Jenkins |
| `workflow` | [Workflow](../workflows/), którego węzły playbooków działają pod nim jako osobne zadania |
| `multistep` | Przestarzały, używaj `workflow`: sekwencja kroków, z których każdy jest rejestrowany jako osobne zadanie pod zadaniem głównym |

Zadanie szablonu jest zapisywane jako zadanie `awx` (także w REST API) i wyświetlane z rodzajem runnera, na którym działało, niezależnie od tego,
jak nazwał je formularz: formularz typu `awx`, który działa na runnerze AAP, pokazuje `aap`.

Stronę formularzy opisują [Formularze Ansible](../forms/ansible.html), [Formularze AWX](../forms/awx.html), [Formularze workflow](../forms/workflow.html) i
[Formularze wieloetapowe](../forms/multistep.html).

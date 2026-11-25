---
layout: default
title: Stany i typy
parent: Zadania
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | Playbook się zakończył, ale [wymaga uwagi](#a-job-that-needs-attention): ktoś musi się nim zająć. Albo formularz wieloetapowy się zakończył, ale krok z ustawionym `continue` zakończył się błędem | Przeczytać przyczynę na stronie zadania, zająć się nim, uruchomić ponownie, usunąć |
| `aborted` | Zadanie zostało przerwane z AnsibleForms lub zadanie AWX / AAP zostało anulowane | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `rejected` | Zatwierdzający odrzucił zadanie; nigdy się nie uruchomiło | Wyświetlić wynik, uruchomić ponownie, usunąć |
| `abandoned` | AnsibleForms przestał śledzić zadanie (zobacz [Porzucone zadania](cleanup.html#abandoned-jobs)) | Sprawdzić zarządzane hosty, uruchomić ponownie, usunąć |

`running` jest niebieski, `success` zielony i brzmi **Zakończone powodzeniem**, a `failed` czerwony. `approve` jest pomarańczowy i brzmi **Oczekuje na zatwierdzenie**,
więc zadanie czekające na człowieka odróżnia się od zatrzymanych; `warning` brzmi **Wymaga uwagi** i, podobnie jak `aborted` i `rejected`, jest bursztynowy. `abandoned` jest
szary: nikt go nie zatrzymał, ale to, co je uruchamiało, zniknęło.

---

## Zadanie wymagające uwagi

Od wersji 7.8.0 playbook, który zakończył się zgodnie z założeniem, ale zostawia pracę operatorowi (zatwierdzenie gdzie indziej,
krok ręczny, częściowe zastosowanie zmian), może zakończyć swoje zadanie jako **Wymaga uwagi** (`warning`) z komunikatem, zamiast jako
`failed`, które wygląda na zepsutą automatyzację, lub `success`, które ukrywa to, co zostało do zrobienia. Playbook sygnalizuje to na
jeden z dwóch sposobów:

* **plik stanu** obok playbooka, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (lub `.yaml`), na RTE. RTE odczytuje go, gdy
  playbook się zakończy, a następnie go usuwa
* **`set_stats`** z kluczem `af_job_status`, na RTE oraz na AWX, AAP lub Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms przekazuje `__jobid__` w extravars, więc playbook może zbudować ścieżkę pliku. Gdy playbook robi jedno i drugie,
wygrywa plik.

* Tylko playbook, który **zakończył się powodzeniem**, może zakończyć się jako Wymaga uwagi: nieudane zadanie pozostaje `failed`,
  a przerwane `aborted`, niezależnie od zawartości pliku
* Nieprawidłowy plik (brak komunikatu, inny stan, uszkodzony YAML) jest ignorowany: zadanie pozostaje zakończone powodzeniem, a jego
  wynik podaje przyczynę w wierszu `[WARNING]`
* Komunikat jest wyświetlany na stronie zadania w bursztynowym polu, ze szczegółami zwiniętymi pod nim jako YAML, jako podpowiedź
  stanu na liście oraz w ostatnim wierszu wyniku zadania. **Wymaga uwagi** w sekcji **Przeszłe** w menu zadań wyświetla te zadania
* [Powiadomienia](../forms/notifications.html) z `onStatus: [warning]` są dla nich wysyłane; poczta i kanały zawierają komunikat,
  webhook jako [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* W formularzu wieloetapowym krok, który wymaga uwagi, zostaje zaliczony i uruchamia się następny krok; cały formularz wieloetapowy
  również wymaga wtedy uwagi. W [workflow](../workflows/) zadanie liczy się jako zakończone powodzeniem dla następnego węzła

Zadania Semaphore, Rundeck i Jenkins nie mogą zakończyć się jako Wymaga uwagi.

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

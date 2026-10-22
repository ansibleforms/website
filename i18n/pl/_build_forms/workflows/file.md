---
layout: default
title: Plik workflow
parent: Workflowy
nav_order: 1
translated_from: bb4d3027e33a5bfd11443369b621eb34c4af2f68
---

# Plik workflow
{: .no_toc }

Składnia workflow, typy węzłów i ustawienia uruchamiania każdego węzła
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gdzie znajdują się pliki workflow

Pliki workflow to pliki YAML w lokalnym folderze workflow i w każdym repozytorium używanym do workflowów.

- **Folder lokalny** to [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), domyślnie `workflows` w
  folderze trwałym.
- **Repozytorium** z włączonym **Używać do workflowów?** jest odczytywane w całości, więc jego pliki workflow mogą leżeć w dowolnym folderze.
  Projektant zapisuje je z powrotem do repozytorium, a **Push** wysyła je do repozytorium zdalnego.

Odczytywany jest każdy plik YAML zawierający `workflow_job_templates`, do sześciu poziomów folderów w głąb, a jeden plik może zawierać kilka
workflowów. Formularz wskazuje workflow po jego `name`, więc nazwy muszą być unikalne: gdy dwa workflowy mają tę samą nazwę, zadanie,
które go uruchamia, kończy się błędem z informacją, by zmienić nazwę jednego z nich.

---

## Składnia

Plik workflow zapisuje się w składni eksportu AWX, z węzłami pod `related.workflow_nodes`:

```yaml
workflow_job_templates:
  - name: deploy-app
    description: Builds, approves and deploys the application
    extra_vars:
      app_name: orders-api
    related:
      workflow_nodes:
        - identifier: build
          unified_job_template:
            name: build.yaml
            type: job_template
          inventory:
            name: staging
          related:
            credentials:
              - name: deploy-ssh
            success_nodes:
              - identifier: approve
            failure_nodes:
              - identifier: notify
        - identifier: approve
          unified_job_template:
            name: Approve the deploy
            type: workflow_approval_template
            timeout: 3600
          related:
            success_nodes:
              - identifier: deploy
        - identifier: deploy
          unified_job_template:
            name: deploy.yaml
            type: job_template
          inventory:
            name: production
          limit: web
          job_tags: deploy
        - identifier: notify
          unified_job_template:
            name: notify.yaml
            type: job_template
```

Odczytywany jest też kształt z kolekcji `awx.awx`: `workflow_nodes` bezpośrednio pod workflow i nazwy zapisane jako
zwykłe ciągi (`inventory: staging`), a nie mapy (`inventory: {name: staging}`).

### Workflow

Wpis workflow ma obok swoich węzłów kilka własnych kluczy:

| Klucz | Co to jest |
|---|---|
| `name` | Nazwa workflow, którą wskazuje `workflow:` formularza |
| `description` | Do czego służy, wyświetlane w projektancie |
| `extra_vars` | Zmienne, które otrzymuje każdy węzeł; wartości formularza mają nad nimi pierwszeństwo |
| `related.workflow_nodes` | Węzły |

### Węzeł

Każdy węzeł ma identyfikator, to, co uruchamia, i swoje połączenia:

| Klucz | Co to jest |
|---|---|
| `identifier` | Id węzła: litery, cyfry, kropki, myślniki, dwukropki i podkreślenia, unikalne w workflow |
| `unified_job_template.type` | Co uruchamia węzeł: zobacz [typy węzłów](#node-types) |
| `unified_job_template.name` | Playbook, workflow, zatwierdzenie lub repozytorium, które uruchamia |
| `related.success_nodes` | Węzły uruchamiane, gdy ten zakończy się sukcesem |
| `related.failure_nodes` | Węzły uruchamiane, gdy ten zakończy się błędem |
| `related.always_nodes` | Węzły uruchamiane, gdy ten się zakończy, w dowolny sposób |
| `all_parents_must_converge` | `true`: węzeł czeka, aż zadziałają wszystkie prowadzące do niego połączenia, a nie tylko jedno |

Połączenia muszą prowadzić do przodu: workflow, którego połączenia tworzą pętlę, nie zostanie uruchomiony.

---

## Typy węzłów

Węzeł uruchamia jedną z czterech rzeczy, nazwanych tak jak w AWX:

| Typ | Co uruchamia węzeł |
|---|---|
| `job_template` | Jeden z playbooków projektanta, jako osobne zadanie na RTE; albo, z `runner:`, szablon lub zadanie tego runnera |
| `workflow_job_template` | Inny workflow, jako podrzędne zadanie workflow; workflowy można zagnieżdżać do pięciu poziomów |
| `workflow_approval_template` | Zatwierdzenie: zadanie workflow czeka, aż ktoś je zatwierdzi lub odrzuci |
| `project` | Pull wskazanego repozytorium (aktualizacja projektu w AWX) |

`unified_job_template.timeout` węzła zatwierdzenia podaje się w sekundach. Gdy upłynie bez odpowiedzi, węzeł kończy się błędem; `0` lub brak
limitu czasu oznacza czekanie na odpowiedź bez względu na to, jak długo to potrwa. Odrzucone zatwierdzenie kończy węzeł błędem, a workflow idzie dalej swoimi
połączeniami.

---

## Ustawienia uruchamiania

Węzeł `job_template` przyjmuje ustawienia węzła AWX, na samym węźle:

| Klucz | Co robi |
|---|---|
| `inventory` | Inwentarz, na którym działa playbook, wskazany z nazwy, jak `inventory:` formularza |
| `related.credentials` | Poświadczenia: każde trafia do playbooka pod własną nazwą, a pierwsze typu *SSH* jest też loginem, którym łączy się ansible. Poświadczenie vault służy tylko do otwierania vaultów |
| `limit` | Uruchamia tylko na tych hostach (`--limit`) |
| `job_tags` | Uruchamia tylko zadania z tymi tagami (`--tags`) |
| `skip_tags` | Pomija zadania z tymi tagami (`--skip-tags`) |
| `verbosity` | Od `0` do `5`: liczba `-v` |
| `diff_mode` | `true`: pokazuje zmiany (`--diff`) |
| `job_type` | `check`: uruchomienie próbne (`--check`); `run` lub brak: rzeczywiste uruchomienie |
| `extra_data` | Zmienne, które otrzymuje ten węzeł, poniżej `extra_vars` workflow i wartości formularza |

Zadanie węzła otrzymuje wartości formularza jako extra vars. Wartości formularza mają pierwszeństwo przed `extra_vars` workflow, które mają pierwszeństwo
przed `extra_data` węzła, tak jak odpowiedzi ankiety w AWX.

---

## Własne klucze AnsibleForms

Trzy klucze węzła należą do AnsibleForms, a AWX je ignoruje, dzięki czemu workflow może robić to, co formularz wieloetapowy:

| Klucz | Co robi |
|---|---|
| `runner` | W węźle `job_template` uruchamia szablon lub zadanie tego runnera zamiast playbooka projektanta: AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins. Runner RTE uruchamia tam playbook węzła. Jeden workflow może je łączyć. |
| `if_extra_var` | Węzeł uruchamia się tylko wtedy, gdy ta extra var ma wartość `true`, jak `ifExtraVar` kroku formularza wieloetapowego. Gdy warunek nie jest spełniony, węzeł jest pomijany, a to, co następuje po nim, działa jak po sukcesie. Nie dotyczy węzła zatwierdzenia, który zawsze działa. |
| `extra_vars_key` | Węzeł otrzymuje tylko ten klucz extra vars, ze skopiowanym użytkownikiem, jak `key` kroku formularza wieloetapowego |

Na runnerze szablonów `unified_job_template.name` to szablon lub zadanie do uruchomienia, a `limit`, `job_tags`, tryb check
i tryb diff węzła są przekazywane tak, jak przekazałby je formularz typu tego runnera. `verbosity` powyżej `0` włącza
`verbose` formularza, a `skip_tags` nie jest przekazywany. Tylko runner AWX (AWX, AAP lub Ascender) otrzymuje inwentarz węzła, a
poświadczenia jako swoje poświadczenia AWX; Semaphore, Rundeck i Jenkins otrzymują poświadczenia jako `credentials` formularza.

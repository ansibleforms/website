---
layout: default
title: Własny układ Ansible
parent: Repozytoria git
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Repozytorium we własnym układzie Ansible
{: .no_toc }

Playbook formularza uruchamiany z katalogu głównego repozytorium, jak w AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów i autorów formularzy, których playbooki leżą w repozytorium ułożonym tak, jak opisuje to Ansible, od 7.8.0.

---

## Układ

Własny układ Ansible trzyma konfigurację, inwentarze, playbooki i role obok siebie w katalogu głównym repozytorium.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

Playbooki są w `playbooks/`, a role w `roles/`, więc Ansible znajduje role przez `ansible.cfg` w katalogu głównym, który
odczytuje tylko wtedy, gdy `ansible-playbook` startuje w tym folderze:

```ini
[defaults]
roles_path = ./roles
```

Ścieżki względne w `ansible.cfg` są odczytywane od folderu, który go zawiera, więc `collections_path = ./collections` działa
tak samo. AWX uruchamia playbooki projektu z katalogu głównego projektu, a od 7.8.0 formularz może robić to samo.

---

## Wskazanie repozytorium w formularzu

Formularz wskazuje repozytorium, z którego uruchamia się jego playbook, przez `playbookRepository`, w formularzu `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

Zadanie działa wtedy z katalogu głównego `infra`, niezależnie od tego, w którym folderze są playbooki:

| Co | Odczytywane z |
|---|---|
| `ansible.cfg` | Katalog główny repozytorium, z jego `roles_path`, `collections_path` i każdym innym ustawieniem |
| `playbook` | Katalog główny: `playbooks/site.yml`, nie `site.yml` |
| Względne `inventory` lub `__inventory__` | Katalog główny: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Nadal przesuwa folder uruchomienia, teraz od katalogu głównego |

Inwentarz wskazany nazwą (`inventory: production`) to nadal jeden z [inwentarzy](../designer/) projektanta, jak wcześniej.
Repozytorium musi mieć typ użycia **Playbooki**: nazwa, która nie jest repozytorium używanym do playbooków, kończy zadanie
błędem `playbookRepository '<name>' is not a repository used for playbooks`.

Krok `ansible` [formularza wieloetapowego](../forms/multistep.html) wskazuje własne `playbookRepository`, a węzeł playbooka
[workflowu](../workflows/file.html#ansibleforms-own-keys) wskazuje je jako `playbook_repository`.

---

## Repozytorium, w którym jest formularz

Od 7.8.0 formularz trzymany w tym samym repozytorium co jego playbook wskazuje je jako `__self__`, zamiast powtarzać jego nazwę.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` to repozytorium, z którego formularz jest czytany, i musi ono mieć typ użycia **Playbooki**, jak każde repozytorium
wskazane przez formularz. W węźle playbooka workflowu `playbook_repository: __self__` to repozytorium, w którym jest plik
workflowu.

Formularz z lokalnego folderu formularzy nie jest w żadnym repozytorium, więc jego `__self__` nie wskazuje żadnego. Formularz
dostaje wtedy błąd wczytania, który go wymienia, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, a
jego uruchomienie jest odrzucane z podaniem przyczyny. `__self__` węzła w pliku lokalnego folderu workflowów kończy zadanie
węzła błędem.

---

## Kilka repozytoriów playbooków

Od 7.8.0 kilka repozytoriów może mieć typ użycia **Playbooki**; wcześniej używane było tylko pierwsze, z ostrzeżeniem.

| Formularz | Skąd działa jego playbook |
|---|---|
| Bez `playbookRepository` | Pierwsze repozytorium używane do playbooków, w kolejności dodania: jego folder `playbooks`, a w przeciwnym razie katalog główny, dokładnie jak przed 7.8.0 |
| Z `playbookRepository: <name>` | Katalog główny tego repozytorium, łącznie z pierwszym |

Formularz, który wskazuje pierwsze repozytorium, działa więc z jego katalogu głównego i podaje swój `playbook` od niego
(`playbooks/site.yml`). Formularze, które żadnego nie wskazują, działają tak jak zawsze.

---

## W projektancie

Projektant oferuje repozytorium i odpowiadające mu playbooki, w formularzu i w węźle workflowu.

| Gdzie | Co pokazuje |
|---|---|
| Karta **Wizualny** formularza | **Repozytorium**, nad **Playbook**, gdy jest kilka repozytoriów playbooków albo formularz jakieś wskazuje. Jego pierwsza opcja, **Pierwsze repozytorium playbooków**, usuwa klucz; druga, **Repozytorium tego formularza (name)**, zapisuje `__self__` |
| **Playbook** | Playbooki wybranego repozytorium, podane od jego katalogu głównego; z **Pierwsze repozytorium playbooków** playbooki pierwszego, tak jak je uruchamia |
| Węzeł playbooka workflowu | To samo pole **Repozytorium**, na jego karcie **Jak działa**, z **Repozytorium tego workflow (name)** dla `__self__`, oraz playbooki tego repozytorium na **Co uruchamia** |
| Sekcja **Playbooki** | Playbooki pierwszego repozytorium, z jego folderu `playbooks` (a w przeciwnym razie z katalogu głównego), a potem każde inne repozytorium w całości, w folderze nazwanym jak ono |

Opcja roli [**Edytować wszystkie playbooki**](../designer/#limited-designers) liczy playbook według repozytorium i ścieżki:
formularz uruchamiający `playbooks/site.yml` z `infra` używa tego pliku, a nie `site.yml` z pierwszego repozytorium.

---

## Na runnerze RTE

[RTE](../rte/) otrzymuje repozytorium wskazane przez zadanie, w każdym ze swoich [trybów plików](../rte/modes.html).

- Przy `RTE_FILES=transfer`, domyślnym, aplikacja wysyła całe repozytorium wskazane przez formularz, spakowane, zamiast
  folderu `playbooks` pierwszego repozytorium.
- Przy `RTE_FILES=local` RTE działa z własnego klonu tego repozytorium, w `REPO_PATH`.

RTE musi być w wersji 7.8.0 lub nowszej, aby uruchomić formularz wskazujący swoje repozytorium. Runnery AWX, Semaphore, Rundeck
i Jenkins uruchamiają własne szablony i zadania: `playbookRepository` nie jest kluczem ich formularzy, a węzeł workflowu na
takim runnerze go nie ma.

---

## Przykład: jeden formularz dla każdego środowiska

Poniższy formularz uruchamia `playbooks/site.yml` z `infra` na inwentarzu środowiska wybranego przez użytkownika.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

Pole `__inventory__` daje dla **production** inwentarz `inventories/production/hosts.yaml`, odczytywany z katalogu głównego
`infra`, z `group_vars` obok niego. Role z `site.yml` pochodzą z `roles/`, przez `roles_path` w `ansible.cfg`.

---

## To samo przed 7.8.0

Przed 7.8.0 formularz mógł jedynie wyjść z folderu `playbooks` jedynego repozytorium playbooków, przez `playbookSubPath: ../`.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

On też działa z katalogu głównego, z tymi ograniczeniami, które `playbookRepository` usuwa:

- Dostępne było tylko pierwsze repozytorium używane do playbooków, więc układ Ansible musiał być właśnie nim.
- Lista playbooków projektanta pokazywała `site.yml`, z folderu `playbooks`, więc `playbooks/site.yml` wpisywało się ręcznie.
- Przy `RTE_FILES=transfer`, domyślnym, RTE otrzymywał tylko folder `playbooks`, więc `../` nie sięgało do `ansible.cfg`,
  ról ani inwentarzy: działało to tylko z `RTE_FILES=local`.

Przeniesienie takiego formularza na 7.8.0 to zastąpienie `playbookSubPath: ../` przez `playbookRepository: <name>`;
`playbook` i `__inventory__` pozostają bez zmian.

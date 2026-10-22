---
layout: default
title: Repozytoria git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 8eb2dfed1f173597f36522be4b3bb4cb606557d6
---

# Repozytoria git
{: .no_toc }

Przechowywanie formularzy, plików zmiennych, konfiguracji i playbooków w git
{: .fs-6 .fw-300 }

---

Dla administratorów, którzy przechowują formularze, konfigurację i playbooki w git: co może zawierać repozytorium i które źródło wygrywa.

---

## Do czego służy repozytorium

Repozytorium to zdalne repozytorium git, które AnsibleForms klonuje i aktualizuje, a każde z nich ma przełączniki określające, co zawiera:

| Przełącznik | Co AnsibleForms z niego odczytuje | Folder w repozytorium |
|---|---|---|
| **Używać do konfiguracji?** | `config.yaml` z kategoriami, rolami i stałymi | katalog główny |
| **Używać do formularzy?** | Pliki formularzy, które projektant również do niego zapisuje, i ich pliki zmiennych | `forms` lub katalog główny; pliki zmiennych w `vars` |
| **Używać do playbooków?** | Playbooki Ansible uruchamiane przez zadania | `playbooks` lub katalog główny |
| **Używać do workflowów?** | Pliki [workflow](../workflows/), które projektant również do niego zapisuje | dowolny folder |
| **Używać do inwentarzy?** | Jeden inwentarz nazwany tak jak repozytorium, który formularz wskazuje przez `inventory:` | katalog główny: `inventory.yaml`, `group_vars`, `host_vars` |

Bez podfolderu używany jest katalog główny repozytorium. Jedno repozytorium może zawierać wszystko; jeśli je rozdzielisz, tylko **Używać do
formularzy**, **Używać do workflowów** i **Używać do inwentarzy** mogą być włączone w kilku: pozostałe przełączniki biorą pierwsze repozytorium
i zapisują ostrzeżenie w logu.

Każde repozytorium jest klonowane do podfolderu nazwanego tak jak ono, w [`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

### Jedno repozytorium na wszystko

Jedno repozytorium może zawierać formularze, pliki zmiennych, konfigurację i playbooki, z włączonymi przełącznikami i jednym podfolderem na każdy rodzaj.

```
forms-repo/
├── config.yaml        # categories, roles and constants
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Jedno repozytorium na każde przeznaczenie

Osobne repozytoria pozwalają zespołom zarządzać własną częścią, z jednym przełącznikiem w każdym i plikami bezpośrednio w katalogu głównym.

| Repozytorium | Przełącznik | Zawartość w katalogu głównym |
|---|---|---|
| `af-config` | **Używać do konfiguracji?** | `config.yaml` |
| `af-forms-network`, `af-forms-storage` | **Używać do formularzy?** | Pliki formularzy każdego zespołu, scalone w jedną listę |
| `af-playbooks` | **Używać do playbooków?** | Playbooki i role |

Tylko formularze mogą pochodzić z kilku repozytoriów; konfiguracja i playbooki pochodzą każde z jednego. Pliki zmiennych pochodzą z folderu `vars`
pierwszego repozytorium formularzy, które go ma.

---

## Jak repozytoria łączą się z folderami lokalnymi

Zawartość repozytorium zastępuje odpowiedni folder lokalny; ta tabela podsumowuje, skąd odczytywany jest każdy rodzaj pliku.

| Zawartość | Odczytywana z, wygrywa pierwsze dopasowanie |
|---|---|
| Konfiguracja | 1. bazy danych, gdy konfiguracja jest tam przechowywana ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)) <br> 2. `config.yaml` repozytorium **Używać do konfiguracji** <br> 3. `config.yaml` repozytorium **Używać do formularzy**, gdy żadne repozytorium nie jest używane do konfiguracji <br> 4. [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularze | Każde repozytorium **Używać do formularzy** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) tylko wtedy, gdy nie ma żadnego |
| Playbooki | Repozytorium **Używać do playbooków**, w przeciwnym razie [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Pliki zmiennych | Folder `vars` pierwszego repozytorium **Używać do formularzy**, które go ma, w przeciwnym razie [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflowy | Każde repozytorium **Używać do workflowów** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), razem |

Formularze z kilku repozytoriów są scalane w jedną listę. Gdy dwa z nich zawierają formularz o tej samej nazwie, zachowywany jest ten
załadowany jako pierwszy, a w logu pojawia się ostrzeżenie `skipping duplicate form <name>`, więc nazwy formularzy muszą być unikalne we wszystkich repozytoriach.

---

## Rozwiązywanie problemów

Większość problemów widać w kolumnie **Pull** oraz w **Pokaż wynik ostatniego pull** (lub **Pokaż wynik ostatniego push**), które zawierają
własny komunikat błędu git.

- [Klonowanie lub pull repozytorium nie powiodło się](../troubleshooting.html#a-repository-clone-or-pull-failed): uwierzytelnianie, znane
  hosty i lokalne zmiany.
- [Repozytorium formularzy nie zostało jeszcze sklonowane](../troubleshooting.html#the-forms-repository-is-not-cloned-yet): projektant
  nie może zapisywać przed pierwszym klonowaniem.
- Repozytorium, które utknęło w stanie `running`, jest resetowane do `failed`: po restarcie przy następnym starcie; w ciągu minuty, gdy węzeł,
  który wykonuje jego operację git, przestanie odpowiadać na 2 minuty; a w każdym przypadku po 2 godzinach. Uruchom **Pull** ponownie.

---

## W tej sekcji

Każdy temat ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Dodawanie repozytorium](adding.html) | Strona Repozytoria, każde pole repozytorium i deklarowanie go w config seed |
| [Uwierzytelnianie](authentication.html) | HTTPS z tokenem, SSH z wygenerowanym kluczem i własne polecenia git |
| [Pobieranie zmian](pulling.html) | Pull zaplanowany, ręczny i przez API oraz zmiany lokalne |
| [Projektant i push](designer.html) | Edycja formularzy w projektancie i wypychanie ich do repozytorium |

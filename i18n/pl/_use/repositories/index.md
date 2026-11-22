---
layout: default
title: Repozytoria git
nav_order: 2
has_children: true
has_toc: false
redirect_from:
  - /repositories.html
permalink: /repositories/
translated_from: 04bcefa07810f2c0318286071624cd4a6d05e7e3
---

# Repozytoria git
{: .no_toc }

Przechowywanie formularzy, playbooków, ustawień i połączeń w git
{: .fs-6 .fw-300 }

---

Dla administratorów, którzy przechowują formularze, playbooki i konfigurację aplikacji w git: co może zawierać repozytorium i które źródło wygrywa.

---

## Do czego służy repozytorium

Repozytorium to zdalne repozytorium git, które AnsibleForms klonuje i aktualizuje, a jego typy zastosowania określają, co aplikacja z niego bierze.

Od wersji 7.8.0 krok **Zastosowanie** repozytorium wymienia typy zastosowania pod sześcioma nagłówkami: **Projektant**, **Zadania**, **System**,
**Wygląd**, **Dostęp** i **Połączenia**. Typy z grupy **Projektant** to pliki, które aplikacja odczytuje w niezmienionej postaci:

| Typ zastosowania | Co AnsibleForms z niego odczytuje | Gdzie w repozytorium |
|---|---|---|
| **Formularze** | Pliki formularzy, które projektant również do niego zapisuje, i ich pliki zmiennych | `forms` lub katalog główny; pliki zmiennych w `vars` |
| **Playbooki** | Playbooki Ansible uruchamiane przez zadania | `playbooks` lub katalog główny |
| **Workflowy** | Pliki [workflow](../workflows/), które projektant również do niego zapisuje | dowolny folder |
| **Inwentarze** | Jeden inwentarz nazwany tak jak repozytorium, który formularz wskazuje przez `inventory:` | katalog główny: `inventory.yaml`, `group_vars`, `host_vars` |
| **Kategorie**, **Stałe** | Kategorie i stałe, które projektant również zapisuje z powrotem do ich pliku | plik podający `controller_categories:` lub `controller_constants:` |

Każdy inny typ przechowuje ustawienia, użytkowników lub połączenia aplikacji w plikach YAML, odczytywanych i zapisywanych w obu kierunkach: harmonogramy,
ustawienia Ogólne, strony Wyglądu, użytkowników, grupy i role, logowania, poświadczenia, runnery i
pozostałe połączenia. Opisuje je strona [Konfiguracja w git](config-as-code.html).

**Formularze**, **Workflowy** i **Inwentarze** można zaznaczyć w kilku repozytoriach; **Playbooki** pochodzą z pierwszego,
a każdy inny typ najwyżej z jednego repozytorium. Każde repozytorium jest klonowane do podfolderu nazwanego tak jak ono, w
[`REPO_PATH`](../customization/paths.html#env_REPO_PATH).

Przełącznik **Używać do konfiguracji?** sprzed wersji 7.8.0 zastępują **Role**, **Kategorie** i **Stałe**, każdy odczytywany z
pliku podającego jego klucz; `config.yaml` repozytorium jest nadal odczytywany, jako przestarzały (zobacz
[Role, kategorie i stałe](config-as-code.html#roles-categories-and-constants)).

### Jedno repozytorium na wszystko

Jedno repozytorium może zawierać formularze, pliki zmiennych, konfigurację i playbooki, z zaznaczonymi typami zastosowania i jednym podfolderem na każdy rodzaj.

```
forms-repo/
├── config/            # categories.yaml, constants.yaml, roles.yaml
├── forms/             # form files (*.yaml)
├── playbooks/         # Ansible playbooks and roles
└── vars/              # vars files used by forms
```

### Jedno repozytorium na każde przeznaczenie

Osobne repozytoria pozwalają zespołom zarządzać własną częścią, każde z własnymi typami zastosowania i plikami bezpośrednio w katalogu głównym.

| Repozytorium | Typy zastosowania | Zawartość w katalogu głównym |
|---|---|---|
| `af-platform` | **Role**, **Kategorie**, **Stałe**, **Poświadczenia**, **Runnery** | `roles.yaml`, `categories.yaml`, `constants.yaml`, `connections.yaml` |
| `af-forms-network`, `af-forms-storage` | **Formularze** | Pliki formularzy każdego zespołu, scalone w jedną listę |
| `af-playbooks` | **Playbooki** | Playbooki i role |

Pliki zmiennych pochodzą z folderu `vars` pierwszego repozytorium formularzy, które go ma.

---

## Jak repozytoria łączą się z folderami lokalnymi

Zawartość repozytorium zastępuje odpowiedni folder lokalny; ta tabela podsumowuje, skąd odczytywany jest każdy rodzaj pliku.

| Zawartość | Odczytywana z, wygrywa pierwsze dopasowanie |
|---|---|
| Role, kategorie, stałe | Każdy klucz osobno: 1. plik podający `controller_roles:`, `controller_categories:` lub `controller_constants:` w repozytorium z tym typem zastosowania <br> 2. `config.yaml` tego repozytorium (przestarzałe) <br> 3. konfiguracja bazowa: baza danych, gdy konfiguracja jest tam przechowywana ([`ENABLE_CONFIG_IN_DATABASE`](../customization/configuration.html#env_ENABLE_CONFIG_IN_DATABASE)), w przeciwnym razie [`CONFIG_PATH`](../customization/paths.html#env_CONFIG_PATH) |
| Formularze | Każde repozytorium **Formularze** plus `FORMS_STAGING_PATH`; [`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH) tylko wtedy, gdy nie ma żadnego |
| Playbooki | Repozytorium **Playbooki**, w przeciwnym razie [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH) |
| Pliki zmiennych | Folder `vars` pierwszego repozytorium **Formularze**, które go ma, w przeciwnym razie [`VARS_FILES_PATH`](../customization/paths.html#env_VARS_FILES_PATH) |
| Workflowy | Każde repozytorium **Workflowy** plus [`WORKFLOWS_PATH`](../customization/paths.html#env_WORKFLOWS_PATH), razem |

Formularze z kilku repozytoriów są odczytywane w kolejności, w jakiej repozytoria zostały dodane. Gdy dwa z nich zawierają formularz o tej samej
nazwie, używana jest kopia z repozytorium dodanego jako pierwsze, a ostrzeżenie wskazuje obie kopie, więc nazwy formularzy muszą być unikalne we wszystkich repozytoriach.

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
| [Konfiguracja w git](config-as-code.html) | Wszystkie ustawienia przechowywane w repozytorium git, odczytywane i zapisywane w obu kierunkach |

---
layout: default
title: Twój pierwszy formularz
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Twój pierwszy formularz
{: .no_toc }

Napisz playbook, zbuduj dla niego formularz w Projektancie, uruchom go i znajdź zadanie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ten samouczek zaczyna się od świeżej instalacji, zobacz [Instalacja](installation/). Zajmuje około piętnastu minut.

---

## 1. Zaloguj się

Otwórz AnsibleForms w przeglądarce i zaloguj się jako administrator.

Domyślne konto to `admin` / `AnsibleForms!123` (lub Twoje wartości [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)); otwiera się strona **Formularze**:

![Strona Formularze z przykładowymi formularzami](assets/screenshots/dashboard.jpg)

---

## 2. Napisz playbook

Formularz `ansible` uruchamia playbook z folderu playbooków, więc najpierw potrzebny jest playbook. Zapisz to jako `hello.yaml`:

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

Playbook odczytuje cztery zmienne. Formularz, który zbudujesz w następnym kroku, wysyła je jako extravars, po jednej na pole.

Umieść plik w folderze `playbooks` folderu trwałego
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); utwórz folder, jeśli jeszcze nie istnieje:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Ze źródeł</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Folder zamontowany w `/app/dist/persistent`, w przykładzie instalacji `/srv/apps/ansibleforms/persistent`:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

Folder `data/playbooks` projektu docker-compose:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

Wolumen trwały, zamontowany w `/app/dist/persistent` w podzie AnsibleForms. Sprawdź nazwę poda, a potem skopiuj do niego plik:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

Folder `persistent/playbooks` serwera, w przykładzie instalacji `/srv/apps/ansibleforms/server`:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Gdy repozytorium git ma włączoną opcję **Używać do playbooków?**, playbooki są uruchamiane z tego repozytorium:
> zatwierdź (commit) tam `hello.yaml`. Zobacz [Projektant i git](gui/designer-and-git.html).

---

## 3. Utwórz formularz

Formularze to pliki YAML w folderze formularzy. Projektant edytuje je w przeglądarce i sprawdza przed zapisem.

1. Kliknij **Projektant** w górnym menu, a potem **Formularze** w menu po lewej.
2. Kliknij przełącznik w prawym górnym rogu (**Uruchom projektanta**). Blokuje on konfigurację, aby nikt inny nie edytował jej w tym samym
   czasie, i wtedy pokazuje **Zablokowany przeze mnie**.
3. Kliknij **Nowy plik**, pierwszy przycisk paska narzędzi, i wpisz nazwę pliku `hello-world.yaml`. Projektant dodaje do niego formularz
   o nazwie `New Form`.
4. Zastąp YAML w edytorze tym formularzem:

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Kliknij **Weryfikuj** (znak zaznaczenia), a potem **Zapisz**. Zapis tworzy `hello-world.yaml` w folderze formularzy.
6. Kliknij ponownie przełącznik, aby zwolnić blokadę.

![Projektant podczas edycji formularza](assets/screenshots/designer.jpg)

Formularz używa czterech typów pól:

| Pole | Typ | Co robi |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Wymagane pole tekstowe |
| `target_env` | [`enum`](formfields/enum.html) | Lista rozwijana ze stałą listą `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Lista rozwijana wypełniana przez lokalne [wyrażenie](expressions/local.html); `__auto__` wybiera pierwszą pozycję |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Pole wyboru, wysyłane jako `true` lub `false` |

`vm_size` pokazuje obie kolumny, `size` i `cpus`, i wysyła `size`, pierwszą z nich; `valueColumn` wybiera inną.

`roles: [default]` pozwala każdemu zalogowanemu użytkownikowi uruchomić formularz, a `categories: [Default]` umieszcza go w kategorii, którą definiuje domyślny
`config.yaml`.

{: .note }
> Możesz też skopiować `hello-world.yaml` do [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) i [zweryfikować go w VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Uruchom go

Otwórz formularz ze strony **Formularze**: kliknij **Formularze** w górnym menu i wybierz **Hello world** w kategorii **Default**.

Wpisz swoje imię i, jeśli chcesz, zmień pozostałe pola. Kliknij **Pokaż extravars**, aby zobaczyć, co otrzyma
playbook, a potem kliknij **Wyślij**:

![Formularz](assets/screenshots/form.jpg)

---

## 5. Obserwuj wynik

Zadanie rozpoczyna się od razu, a jego wynik pojawia się pod formularzem w trakcie działania i kończy się paskiem **Zakończone**:

![Wynik zadania](assets/screenshots/run.jpg)

Zadanie debug wypisuje Twoje wartości, na przykład `Hello Alice: a small machine in development (dry run: True)`.

Ostrzeżenie o niejawnym localhost jest spodziewane, gdy nie ma inwentarza; prawdziwy formularz ustawia [`inventory`](forms/ansible.html).

---

## 6. Znajdź je w historii zadań

Każde uruchomienie jest zapisywane jako zadanie. Kliknij **Zadania** w górnym menu: nowe zadanie jest na górze listy **Wszystkie zadania**.

Kliknij zadanie, aby ponownie zobaczyć jego wynik, a **Pokaż extravars**, aby zobaczyć, co zostało wysłane. Ikony przed każdym zadaniem
uruchamiają je ponownie lub je usuwają:

![Historia zadań](assets/screenshots/job-output.jpg)

---

## Następne kroki

Rozbuduj ten formularz, korzystając ze stron referencyjnych:

* **[Formularze](forms/)** : każda właściwość formularza, szablony na runnerach, formularze workflow, punkty zatwierdzenia i powiadomienia
* **[Pola formularzy](formfields/)** : wszystkie typy pól, z walidacją, zależnościami i układem
* **[Wyrażenia](expressions/)** : wypełnianie pól z API REST, baz danych i plików
* **[Role](config/roles.html)** i **[kategorie](config/categories.html)** w `config.yaml` : decydują, kto widzi który formularz
* **[Jak to działa](how-it-works.html)** : co dzieje się za uruchomieniem i gdzie wszystko jest przechowywane

---
layout: default
title: Dodawanie repozytorium
parent: Repozytoria git
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Dodawanie repozytorium
{: .no_toc }

Strona Repozytoria, każde pole repozytorium i deklarowanie go w config seed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Strona Repozytoria

Repozytoriami zarządza się w **Ustawienia > Połączenia > Repozytoria**, co wymaga [opcji roli](../config/roles.html#role-options) `showSettings` lub, od wersji 7.3.0,
`showConnectionsSettings`. Niektóre zmiany może wprowadzać tylko administrator, zobacz [niżej](#who-may-change-a-repository).

![Repozytoria](../assets/screenshots/git.jpg)

Lista pokazuje **Nazwa**, **Opis**, **Gałąź**, **Head** (skrócony hash wybranego commita), **Pull** i
**Push**. Karta **Szczegóły** repozytorium pokazuje te same odznaki Pull i Push nad jego head:

| Kolumna | Co oznacza |
|---|---|
| **Pull** | Ostatnie klonowanie, pull lub reset: **Uruchomione**, gdy git pracuje, potem **Zakończone powodzeniem** lub **Nieudane**; myślnik przed pierwszym |
| **Push** | **Nieudane**, gdy ostatni push się nie powiódł; **Oczekujące zmiany**, gdy zmiany zapisane tutaj, przez projektanta, nie zostały jeszcze wypchnięte do repozytorium zdalnego; **Zakończone powodzeniem**, gdy nic nie czeka; myślnik przed pierwszym pushem |

**Zakończone powodzeniem** w kolumnie Push oznacza tylko, że nic nie czeka na wypchnięcie: repozytorium zdalne może nadal zawierać nowsze commity, które
przyniesie pull. Menu każdego wiersza zawiera następujące akcje:

| Akcja | Co robi |
|---|---|
| **Edytuj** | Zmiana poniższych pól |
| **Pull** | Klonuje repozytorium lub wykonuje pull, gdy kopia robocza już istnieje |
| **Push** | Commituje i wypycha kopię roboczą; tylko w repozytoriach używanych do formularzy, konfiguracji, playbooków, workflowów lub inwentarzy i aktywne tylko wtedy, gdy są jeszcze niewypchnięte zmiany |
| **Resetuj** | Usuwa kopię roboczą i klonuje ją ponownie, co odrzuca lokalne zmiany |
| **Zmień poświadczenia** | Otwiera kartę **Poświadczenia** repozytorium, aby wybrać poświadczenie używane przez git |
| **Pokaż wynik ostatniego pull** | Pokazuje wynik git z ostatniego klonowania, pull lub resetu, z zamaskowanym hasłem |
| **Pokaż wynik ostatniego push** | Pokazuje wynik git z ostatniego pushu, z zamaskowanym hasłem |
| **Usuń** | Usuwa rekord i jego kopię roboczą w `REPO_PATH`; tylko administrator |

**Pull wszystkich** nad listą wykonuje pull wszystkich repozytoriów naraz.

Na repozytorium działa naraz tylko jedna operacja git. Druga jest odrzucana z komunikatem
`Repository '<name>' not found or already running, try again later`.

---

## Dodawanie repozytorium

Kliknij **Dodaj repozytorium**: kreator prosi o pola w czterech krokach (**Repozytorium**, **Poświadczenia**, **Zastosowanie**, **Harmonogram
pull**), a AnsibleForms rozpoczyna klonowanie w tle, gdy tylko zapiszesz.

![Edycja repozytorium](../assets/screenshots/git-edit.jpg)

| Pole | Wymagane | Znaczenie |
|---|---|---|
| **Nazwa** | tak | Nazwa folderu w `REPO_PATH`; litery, cyfry, myślnik, podkreślenie i kropka |
| **Gałąź** | tak | Gałąź do klonowania, pull i push, na przykład `main`; wymagana od wersji 7.3.0. Tylko repozytorium z config seed może ją pominąć, aby sklonować domyślną gałąź repozytorium zdalnego |
| **Poświadczenie** | nie | Poświadczenie z [Połączenia > Poświadczenia](../credentials.html) z użytkownikiem i hasłem lub tokenem, których używa git; **Dodaj poświadczenie** tworzy nowe |
| **Uri** | tak | Repozytorium zdalne, `https://...` lub SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Włącz zaplanowany pull** | nie | Wykonuje pull repozytorium według harmonogramu |
| **Harmonogram pull** | nie | Kiedy wykonywać pull, jako wyrażenie cron; widoczne po włączeniu zaplanowanego pull |
| **Opis** | tak | Dowolny opis tekstowy |
| **Używać do konfiguracji?** ... **Używać do inwentarzy?** | nie | Co zawiera repozytorium, zobacz [wyżej](./#what-a-repository-is-for) |
| **Pull przy starcie aplikacji** | nie | Klonuje repozytorium lub wykonuje jego pull przy każdym starcie AnsibleForms |

Zmiana nazwy repozytorium przenosi jego kopię roboczą do nowego folderu, a razem z nią jego harmonogram pull. Repozytorium sprzed
wersji 7, które nadal ma własnego użytkownika, informuje o tym na swojej karcie **Poświadczenia**: wybierz poświadczenie, które go zastąpi.

---

## Kto może zmieniać repozytorium

Zawartość repozytorium staje się tym, co AnsibleForms ładuje i uruchamia, więc od wersji 7.3.0 użytkownik bez roli `admin` nie może już:

- dodawać ani usuwać repozytorium;
- zmieniać jego **Uri** ani **Gałąź**;
- włączać ani wyłączać żadnego z jego przełączników **Używać do**.

Nadal może zmieniać jego opis, harmonogram pull i poświadczenie oraz wykonywać jego pull, push lub reset. Poświadczenia używanego przez runner,
połączenie lub logowanie nie może wybrać; odmowa wskazuje je z nazwy i nie mówi nic o jego zawartości.

---

## Deklarowanie repozytoriów w config seed

Repozytoria można też zadeklarować w [config seed](../seed/), aby nowa instancja sklonowała je przy pierwszym starcie.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Pola są takie same jak na stronie, łącznie z `credential` (poświadczenie z seed lub z aplikacji), `rebase_on_start` (**Pull przy starcie
aplikacji**) i `cron` (harmonogram pull); `user` i `password` są nadal akceptowane zamiast poświadczenia.
Repozytorium z seed jest w interfejsie tylko do odczytu i jest ponownie klonowane przy starcie, gdy brakuje jego kopii roboczej; zobacz
[Obiekty zarządzane](../seed/managed-objects.html).

---
layout: default
title: Uwierzytelnianie
parent: Repozytoria git
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Uwierzytelnianie
{: .no_toc }

HTTPS z tokenem, SSH z wygenerowanym kluczem i własne polecenia git
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Uwierzytelnianie

Sposób uwierzytelniania AnsibleForms zależy od postaci **Uri**.

### HTTPS z tokenem

Dla prywatnego repozytorium zdalnego HTTPS wybierz **Poświadczenie**, którego użytkownik jest użytkownikiem git, a hasło osobistym tokenem dostępu
(lub hasłem).

Od wersji 7.3.0 git loguje się przez `GIT_ASKPASS`: użytkownik i token trafiają do każdego polecenia git, które komunikuje się z serwerem, nigdy do
URL, więc nie są przechowywane w `.git/config` klonu, a zmieniony token jest używany przy następnym pull lub push. Token potrzebuje
uprawnień do odczytu, aby wykonać pull, i do zapisu, aby wykonać push. Publiczne repozytorium zdalne nie wymaga poświadczenia.

Do wersji 7.2.0 oba były wstawiane do URL, jako `https://<user>:<token>@git.example.com/team/forms.git`. Klon utworzony w tamtym czasie zachowuje
ten URL do następnego pull lub push, który przywraca jego remote do własnego **Uri** repozytorium.

### SSH z wygenerowanym kluczem

Dla repozytorium zdalnego SSH AnsibleForms uwierzytelnia się własną parą kluczy, którą generuje przy pierwszym starcie.

1. Otwórz **Ustawienia > Połączenia > SSH**, na karcie **Klucz**, i skopiuj **Klucz publiczny**.
2. Dodaj go na serwerze git jako klucz wdrożeniowy repozytorium (z uprawnieniem do zapisu, jeśli wykonujesz push) lub do użytkownika z dostępem.
3. Dodaj repozytorium z **Uri** SSH, na przykład `git@git.example.com:team/forms.git`, i nie wybieraj żadnego poświadczenia.

Para kluczy znajduje się w `.ssh/id_rsa` w [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), więc trzymaj ten folder na
pamięci trwałej, w przeciwnym razie klucz zmieni się przy ponownym utworzeniu kontenera.

Przy klonowaniu z Uri w postaci `user@host:path` AnsibleForms najpierw uruchamia `ssh-keyscan` na hoście i dodaje jego klucz do
znanych hostów. Dla innych repozytoriów zdalnych dodaj host na karcie **Znane hosty** w **Ustawienia > Połączenia > SSH** przed
pierwszym klonowaniem.

### Własne polecenia git

Polecenia clone, pull i push można zastąpić, na przykład aby dodać opcje git, trzema ustawieniami.

| Ustawienie | Domyślnie | Co dodaje AnsibleForms |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, Uri i nazwę |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Od wersji 7.3.0 te polecenia działają bez powłoki: cudzysłowy działają, ale operator powłoki, taki jak `;`, `|`, `&&` czy `>`, jest odrzucany.

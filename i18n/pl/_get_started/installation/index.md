---
layout: default
title: Instalacja
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Instalacja
{: .no_toc }

Wybierz metodę instalacji AnsibleForms
{: .fs-6 .fw-300 }

---

Dla administratorów konfigurujących nową instancję: wybierz metodę instalacji, a potem postępuj zgodnie z jej stroną.

---

## W tej sekcji

AnsibleForms obsługuje kilka metod instalacji, każdą opisaną na osobnej stronie:

| Strona | Co obejmuje |
|---|---|
| [Instalator](installer.html) | Jedno polecenie, które instaluje kontroler lub Runner na Docker, Podman, Kubernetes lub natywnie, a potem go aktualizuje i tworzy jego kopie zapasowe |
| [Natywnie](native.html) | Instalacja instalatorem bez kontenerów: Node.js, MariaDB i Ansible na serwerze, AnsibleForms jako usługi systemd |
| [Docker](docker.html) | Zainstaluj MySQL i uruchom gotowy obraz Docker z wymaganymi zmiennymi środowiskowymi |
| [Docker Compose](docker-compose.html) | Pobierz [projekt docker-compose](https://github.com/ansibleforms/docker) i użyj docker-compose, aby uruchomić zarówno MySQL, jak i AnsibleForms |
| [Ze źródeł](from-source.html) | Zainstaluj ręcznie wszystkie zależności, a potem zbuduj i uruchom kod |
| [Kubernetes](kubernetes.html) | Zainstaluj chart Helm i użyj Kubernetes, aby uruchomić AnsibleForms i jego bazę danych MySQL |

{: .note }
> **Zalecenie** Instalator, dostępny od wersji 7.3.0, to najszybsza droga do działającej instancji: na podstawie kilku pytań konfiguruje projekt Docker Compose na
> Docker lub Podman albo jedną z pozostałych metod. Obrazy Docker zawierają wszystkie zależności.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Aby przenieść istniejącą instalację na nowsze wydanie, zobacz [Aktualizacja](../upgrading/).

Każda metoda uruchamia jedno RTE obok aplikacji, czyli kontener (lub usługę), który uruchamia playbooki. Aby dodać kolejne, na innym hoście lub w innym
centrum danych, zainstaluj Runner [instalatorem](installer.html#a-runner): łączy się on z AnsibleForms przez jeden WebSocket (wychodzący, zobacz
[Tryby](../rte/modes.html)) i nie przechowuje poświadczeń do bazy danych. Zobacz też [Środowiska uruchomieniowe](../rte/) i ich runbook
[RTE w innym centrum danych](../rte/another-datacenter.html).

---

## Tagi obrazów

Obraz jest publikowany jako `ghcr.io/ansibleforms/ansibleforms` w GitHub Container Registry, który należy do
projektu i nie ogranicza anonimowych pobrań. Każde wydanie od 7.0.0 jest publikowane wyłącznie tam, a wydania 6.x
również tam są.

Od wersji 7 playbooki działają na RTE, publikowanym w trzech warstwach obok aplikacji (zobacz [Obrazy RTE](../rte/images.html)):

| Obraz | Czym jest |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | Aplikacja webowa i API, bez pythona i ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | RTE bez pythona i ansible: baza dla własnego obrazu |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Baza z pythonem, ansible-core i kilkoma bibliotekami: ten, do którego dodajesz swoje kolekcje |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Core z pakietem `ansible`, jego kolekcjami i bibliotekami: domyślne RTE |

Cztery obrazy są budowane w tym samym przebiegu i mają te same tagi, więc tag RTE zawsze odpowiada tagowi aplikacji.

Stare repozytorium Docker Hub, `ansibleguy/ansibleforms`, nie jest już aktualizowane. Zachowuje istniejące
wydania, ale nie dostaje nowych wersji żadnej z linii. Jeśli pobierasz z niego obrazy, przejdź
na `ghcr.io/ansibleforms/ansibleforms` z tym samym tagiem, aby nadal otrzymywać aktualizacje.

Na każdym obrazie dostępne są następujące tagi; obrazy RTE zaczynają się od 7.0.0, więc nie mają tagów 6.x:

| Tag | Wskazuje na |
|---|---|
| `latest` | najnowsze wydanie najnowszej wersji głównej |
| `7`, `6` | najnowsze wydanie tej wersji głównej |
| `7.0`, `6.5` | najnowsze wydanie tej wersji pomocniczej |
| `7.0.0`, `6.5.5` | dokładnie to wydanie |
| `latest-rc` | najnowszy kandydat do wydania albo najnowsze wydanie, jeśli jest nowsze; każdy kandydat ma też własny tag |

`latest` przesuwa się tylko do przodu: poprawka dla starszej wersji głównej (na przykład 6.5.x wydana
po 7.0.0) przesuwa `6` i `6.5`, ale nigdy `latest`.

Aby pozostać na wersji głównej, używaj jej numeru (`6`) zamiast `latest`.

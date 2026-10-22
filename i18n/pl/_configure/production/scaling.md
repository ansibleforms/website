---
layout: default
title: Skalowanie
parent: Środowisko produkcyjne
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# Skalowanie
{: .no_toc }

AnsibleForms rozdzielony na kilka węzłów aplikacji i worker, obok jednego lub kilku RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Role

Każdy kontener AnsibleForms uruchamia ten sam kod serwera, a [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decyduje, co robi:

| `AF_ROLE` | Obraz | Uruchamia | Ile |
|---|---|---|---|
| `all` (nieustawiona) | `ansibleforms` | Aplikację WWW i worker w jednym procesie: domyślnie | 1 |
| `app` | `ansibleforms` | Interfejs WWW i API | Ile chcesz, za load balancerem |
| `worker` | `ansibleforms` | Pracę w tle: schemat bazy danych i jego aktualizacje, config seed, harmonogramy, nocną kopię zapasową, synchronizacje repozytoriów i porządki | Jeden pracuje; kolejne czekają i przejmują pracę |
| `rte` | `ansibleforms-rte-full` (lub `-rte-core`, `-rte-base`) | Playbooki | Ile chcesz |

Najmniejsza instalacja to jeden kontener bez `AF_ROLE` obok jednego RTE: tak działają [projekt Docker Compose](../installation/docker-compose.html)
i [chart Helm](../installation/kubernetes.html). Każda inna wartość `AF_ROLE` zatrzymuje proces przy starcie.

---

## RTE

RTE, środowisko uruchomieniowe, które uruchamia playbooki, ma własną sekcję: [Środowiska uruchomieniowe](../rte/). Opisuje, jak RTE
uruchamia zadanie, [jego obrazy](../rte/images.html), [jak je uruchomić](../rte/run.html), [kilka RTE](../rte/several.html) jako runnery lub
repliki oraz [RTE w innym centrum danych](../rte/another-datacenter.html).

---

## Kilka węzłów aplikacji

Aby obsłużyć więcej użytkowników albo przetrwać utratę jednego węzła, podziel aplikację na węzły `app` za load balancerem i `worker`.

### Co współdzielą węzły
{: .no_toc }

Węzły uzgadniają się ze sobą przez bazę danych i współdzielony wolumen:

* **Baza danych** : zadania, blokada workera, blokada projektanta, lista węzłów, dzierżawy runnerów (który węzeł aplikacji trzyma
  gniazdo każdego RTE) i powiadomienia o zmianach, które utrzymują aktualność pamięci podręcznych każdego węzła. Poświadczenie, runner lub harmonogram edytowany
  na jednym węźle obowiązuje na wszystkich w ciągu 5 sekund
* **Wolumen trwały** (`/app/dist/persistent`) : formularze, konfiguracja, repozytoria, przesłane pliki, kopie zapasowe i zarządzany `.env`.
  Każdy węzeł aplikacji i worker montują ten sam, do odczytu i zapisu
* **Folder ssh** (`/home/node/.ssh`) : klucz i znane hosty dla gita przez ssh; worker tworzy klucz przy pierwszym starcie
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : taki sam na każdym węźle aplikacji, inaczej token podpisany
  przez jeden węzeł zostanie odrzucony przez następny. Węzeł aplikacji odmawia startu bez niego
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : taki sam na każdym węźle aplikacji i workerze, inaczej
  poświadczenia zapisanego przez jeden nie da się odczytać na innym. RTE w trybie gniazda nigdy go nie odczytuje; potrzebuje go tylko przestarzałe RTE w trybie bazy danych,
  które samo się rejestruje

Daj też każdemu kontenerowi tego samego użytkownika bazy danych: czekający worker może zakończyć sesję martwego tylko wtedy, gdy jest to jego własna sesja.

### Blokada workera
{: .no_toc }

Naraz pracuje tylko jeden worker. Trzyma blokadę bazy danych `ansibleforms_worker`; gdy się zatrzyma, baza danych zwalnia blokadę, a
czekający worker przejmuje ją w ciągu 10 sekund. Gdy host workera padnie bez pożegnania, baza danych mogłaby trzymać blokadę godzinami,
więc czekający worker kończy tę sesję, gdy żaden worker nie zapisał sygnału życia przez dwie minuty, i przejmuje pracę.

Worker, który straci blokadę na rzecz innego, zatrzymuje się, a jego kontener uruchamia się ponownie jako czekający. Worker, którego start się nie powiódł, też się zatrzymuje,
więc nigdy nie trzyma blokady, nic nie robiąc. Galera i replikacja grupowa nie współdzielą blokady między węzłami bazy danych: skieruj każdy
worker na ten sam węzeł bazy danych.

### Zadania i węzły
{: .no_toc }

Każdy kontener nazywa się `<role>-<hostname>-<port>`, bez żadnych ustawień, a strona **Stan** wyświetla je wszystkie z ich rolą
i wersją, informacją, który jest workerem, oraz ostrzeżeniem, gdy działają w różnych wersjach.

Zadanie działające na RTE należy do tego RTE i trwa dalej, gdy węzeł aplikacji, który je uruchomił, zniknie. Każde inne zadanie (zadanie szablonu
na AWX lub innym runnerze, zadanie workflow lub kroki przestarzałego formularza wieloetapowego) należy do węzła aplikacji, który je uruchomił. Kontener, który się restartuje, kończy własne niezakończone zadania, a
worker kończy zadania kontenera, który przestał odpowiadać przez dwie minuty, np. zastąpionego poda.

`SIGHUP` wysłany do dowolnego węzła ponownie stosuje [config seed](../seed/): węzeł aplikacji prosi o to worker.

### Aktualizacja
{: .no_toc }

Aktualizuj **najpierw worker**, potem węzły aplikacji. Worker łata schemat, a węzeł aplikacji nowej wersji czeka, aż
schemat zostanie załatany, i zapisuje w dzienniku, na co czeka. Węzły aplikacji zaktualizowane jako pierwsze pozostają niegotowe, dopóki worker ich nie dogoni, a stare nadal
obsługują ruch. RTE mogą dołączyć w dowolnym momencie, o ile mówią tym samym kontraktem.

### Ograniczenia
{: .no_toc }

Kilka rzeczy pozostaje przy jednym węźle:

* **Asystent czatu** trzyma swoje rozmowy w pamięci jednego węzła aplikacji: użyj sticky sessions na load balancerze (nginx
  `ip_hash`) albo jednego węzła aplikacji
* **Dzienniki** zostają w każdym kontenerze. Ustaw [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) poza współdzielonym wolumenem, bo kilka
  procesów rotujących jeden plik gubi wiersze. Przeglądarka dziennika pokazuje dziennik węzła, który odpowiada, więc zbieraj dzienniki centralnie
* **Ustawienia** zmienione na stronach ustawień są zapisywane w zarządzanym `.env` na współdzielonym wolumenie i obowiązują na każdym węźle; te,
  które wymagają restartu, wymagają go na każdym węźle

---

## Przykładowy układ

Repozytorium aplikacji ma kompletny punkt wyjścia w [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Usługa | Obraz | Rola |
|---|---|---|
| `db` | `mariadb:11` | Baza danych, z użytkownikiem, który ma uprawnienia tylko do schematu `AnsibleForms` |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, za load balancerem |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: drugi czeka i przejmuje pracę |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Uruchamia playbooki z `RTE_MODE=inbound` i `RTE_FILES=local`: aplikacja się z nim łączy |
| `lb` | `nginx:stable` | Terminuje HTTPS na porcie 8443 i rozkłada przeglądarki na węzły aplikacji przez `ip_hash` |

Runner `rte` tego RTE i poświadczenie, którym się loguje (jego adres `http://rte:8000` i `RTE_TOKEN`), są zadeklarowane w
[config seed](../seed/) `seed.yaml`, który worker stosuje przy każdym starcie; RTE nie ustawia `RTE_URL` i nie jest publikowane na hoście.

Węzły aplikacji i workery współdzielą jeden `.env`, z użytkownikiem bazy danych, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` za load balancerem i `LOG_PATH` poza współdzielonym wolumenem. RTE nie ma `env_file`: dostaje
tylko `RTE_TOKEN` z `compose.yaml`, więc nie zna hasła do bazy danych. Węzły aplikacji, workery i RTE montują te same
wolumeny trwały i ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```

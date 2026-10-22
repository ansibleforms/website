---
layout: default
title: Kilka RTE
parent: RTE
nav_order: 4
translated_from: 06592303233da78436fcc2765588aec6c88bc045
---

# Kilka RTE
{: .no_toc }

Ile playbooków uruchamia jedno RTE, kolejne RTE jako runnery lub repliki i co się dzieje, gdy któreś się zatrzyma lub padnie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kilka zadań na jednym RTE

Jedno RTE uruchamia obok siebie do [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooków, domyślnie 10
(`0` oznacza brak limitu). Zadanie dla pełnego RTE nie zostaje przejęte. W trybie gniazda aplikacja go nie wysyła, dopóki ostatni
raport stanu RTE nie pokazuje wolnego miejsca, a RTE, które jest pełne lub się zatrzymuje, odpowiada `refused` jako zajęte; w trybie bazy danych RTE odpowiada
`503`. W obu przypadkach aplikacja zapisuje raz w wyniku `Waiting for a free slot on RTE <name>` i oferuje zadanie ponownie co 10 sekund,
najwyżej przez [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) (domyślnie 60). Potem zadanie kończy się błędem
*the RTE '&lt;name&gt;' stayed busy for 60 minutes (RTE_QUEUE_MINUTES)*. Zadanie przerwane w trakcie oczekiwania kończy się jako `aborted`, nigdy nie
docierając do RTE.

---

## Kilka RTE

Aplikacja sama nie rozkłada zadań na runnery: każde zadanie trafia do jednego runnera, tego wskazanego przez formularz albo
domyślnego. Więcej kontenerów RTE pomaga na dwa sposoby:

* **Jako osobne runnery** : każde RTE ma własne `RTE_NAME` i dołącza jako osobny runner: prosi o dołączenie, a admin
  je zatwierdza, albo przedstawia token dołączenia (zobacz [Rejestracja](../runners/registration.html)). Formularz wybiera jedno przez `runner: <name>`,
  np. RTE z kolekcjami VMware albo RTE w innej strefie sieci; pozostałe działają na domyślnym RTE
* **Jako repliki za jednym adresem** (tylko tryb bazy danych) : kilka kontenerów RTE z tym samym `RTE_URL` i tym samym `RTE_TOKEN`,
  np. pody za Service Kubernetes, współdzieli jeden runner, a adres rozkłada na nie wywołania. Pełna replika odpowiada
  `503`, a następna próba może trafić na inną. Aplikacja śledzi zadanie przez bazę danych, więc nie ma znaczenia, która replika
  odpowiada na wywołania o jego status

W trybie gniazda (zobacz [Tryby](modes.html)) runner trzyma jedno gniazdo do jednego RTE, a drugie RTE, które loguje się tym samym
`RTE_NAME`, przejmuje gniazdo od pierwszego. Daj każdemu RTE własną nazwę i własny runner i pozwól formularzom wybierać między nimi przez
`runner:`.

Każde RTE w trybie bazy danych zapisuje sygnał życia w bazie danych co 10 sekund, a takie, które samo się rejestruje, sprawdza swój wiersz runnera co
30 sekund. Dla RTE w trybie gniazda sygnał życia co 20 sekund zapisuje za nie węzeł aplikacji, który trzyma jego gniazdo, dopóki
gniazdo jest otwarte. Strona **Stan** wyświetla każde RTE z jego wersją. Worker usuwa runner, który RTE w trybie bazy danych samo zarejestrowało,
gdy to RTE nie zapisało sygnału życia przez 10 minut, a gdy domyślny runner jest takim wierszem, którego RTE się zatrzymało, następne RTE,
które sprawdzi, przejmuje rolę domyślnego. Runner z config seed, dodany ręcznie lub dołączony przez gniazdo, nigdy nie jest usuwany w ten sposób.

---

## Gdy RTE się zatrzyma lub padnie

**Gdy RTE się zatrzymuje.** Po `SIGTERM` (`docker stop`, aktualizacja krocząca, zmniejszenie skali) RTE przestaje przyjmować zadania: `/ready` odpowiada `503`,
a nowe zadanie jest odrzucane jako zajęte (`503` w trybie bazy danych), więc aplikacja czeka albo, w trybie bazy danych, adres wysyła je do innej
repliki. Działające playbooki dostają [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) na zakończenie, domyślnie 25,
po czym RTE kończy działanie.

**Gdy RTE pada.** Zabity kontener (brak pamięci, utracony węzeł, koniec limitu czasu zatrzymania) zabiera ze sobą swoje playbooki: nic
nie przenosi ich do innego RTE i nic nie uruchamia ich ponownie. Ich zadania są kończone jako `abandoned`, przez samo RTE albo przez aplikację, gdy
wraca pod tym samym id, które zrestartowany kontener zachowuje (`rte-<hostname>-<port>`), albo przez worker, gdy sygnał życia RTE
ma dwie minuty. Zanim uruchomisz playbook ponownie, sprawdź na zarządzanych hostach, co zrobił.

**Gdy RTE nie działa.** W trybie gniazda nowe zadanie dla niego czeka na jego gniazdo, do `RTE_QUEUE_MINUTES` i jeszcze jednej minuty, a potem
kończy się błędem *no app node holds a socket to RTE '&lt;name&gt;' and it took no job for 60 minutes (RTE_QUEUE_MINUTES): is it connected?*.
W trybie bazy danych kończy się błędem od razu, z *the RTE at ... is unreachable*, chyba że pod jego adresem odpowie inna replika.

---
layout: default
title: Zdarzenia na żywo
parent: API REST
nav_order: 4
translated_from: 2dcfc48df93271c0e13e05c67682a3b02e6e7e97
---

# Zdarzenia na żywo
{: .no_toc }

Informacje o zmianach zadań i ustawień zamiast odpytywania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Serwer informuje swoich klientów o zmianach w chwili, gdy następują. Skrypt też może nasłuchiwać, zamiast odczytywać zadanie co kilka sekund.

---

## Strumień

`GET /api/v2/events` to strumień [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events),
który pozostaje otwarty. Może go otworzyć każdy zalogowany użytkownik, ze zwykłym tokenem bearer:

```bash
curl -N https://af.example.com/api/v2/events -H "Authorization: Bearer <token>"
```

Gdy coś się zmienia, wysyła zdarzenie `changed` z nazwą tego, co się zmieniło:

```text
event: changed
data: {"name":"jobs"}
```

---

## Nazwy zdarzeń

Zdarzenie zawiera tylko nazwę, nigdy dane, więc nie ujawnia niczego, czego użytkownik nie może zobaczyć. Wysyłane są te nazwy:

| Nazwa | Co się zmieniło |
|---|---|
| `jobs` | Zadanie: uruchomione, zmiana jego stanu lub wyniku, usunięte |
| `appearance` | Ustawienia widoczne w nagłówku: motyw, nazwa, ogłoszenie, zmienna środowiskowa |
| `designer` | Blokada projektanta, założona lub zwolniona |
| `runners` | Runner (od wersji 7.3.0): RTE połączyło się lub rozłączyło, poprosiło o dołączenie, zostało zatwierdzone lub odrzucone albo zmieniło tryb lub ustawienia |

Po otrzymaniu nazwy odczytaj ponownie to, co wyświetlasz, przez zwykłe API (na przykład `GET /api/v2/job/42`), z własnymi
uprawnieniami. Często zmieniająca się nazwa jest wysyłana najwyżej raz na sekundę.

---

## Utrzymywanie połączenia

Strumień jest zbudowany tak, aby przetrwać proxy i load balancery, a klient sam łączy się ponownie:

* Po połączeniu serwer wysyła zdarzenie `hello` i prosi klienta, aby przed ponownym połączeniem odczekał 3 sekundy.
* Co 15 sekund wysyła wiersz komentarza (`: ping`), aby bezczynne połączenie nie zostało zamknięte. Ignoruj wiersze zaczynające się od `:`.
* Zdarzenia z każdego węzła aplikacji trafiają do każdego strumienia, niezależnie od tego, z którym węzłem połączony jest klient.
* Po ponownym połączeniu odczytaj jeszcze raz to, co wyświetlasz: zdarzenie wysłane, gdy strumień nie działał, nie jest wysyłane ponownie.

---

## Stan i metryki

Sondy liveness i readiness (`/api/v2/live`, `/api/v2/ready`) oraz metryki Prometheus (`/api/v2/metrics`) są
przeznaczone dla narzędzi monitorujących, a nie dla skryptów działających jako użytkownik. Zobacz [Monitorowanie](../production/monitoring.html).

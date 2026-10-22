---
layout: default
title: Ponowne uruchamianie i audyt
parent: Asystent czatu
nav_order: 4
translated_from: b7d416fbf35e98de81e41ee53ba0d2ff9040fea0
---

# Ponowne uruchamianie i audyt
{: .no_toc }

Ponowne uruchamianie z czatu, ślad audytu i ograniczenia
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ponowne uruchamianie

Prośba typu „Uruchom ponownie zadanie 1234” (użytkownik musi wpisać ID zadania) pokazuje podgląd ponownego uruchomienia
według tych samych zasad co `relaunch_job` serwera MCP, łącznie z zasadą dotyczącą haseł w
[walidacji przy uruchomieniu](../launch-validation), i wyświetla podsumowanie **Uruchom ponownie**; przycisk
uruchamia je raz. „Uruchom ponownie zadanie 1234 z serwerem web02” zmienia tylko to pole.

---

## Audyt

Każde uruchomienie z czatu jest zapisywane jako **chat.launch** z użytkownikiem, zadaniem, formularzem,
dostawcą i skrótem (hash) ładunku zatwierdzonego podsumowania. Zmiany w ustawieniach czatu są
zapisywane tak jak każda inna zmiana ustawień.

---

## Ograniczenia

Asystent czatu nie robi jeszcze wszystkiego, co przeglądarka:

- **Formularze typu kreator** nie mogą brać udziału (`enableForChat` jest dla nich odrzucane), podobnie jak
  pola, których asystent nie wypełnia: hasła i przesyłane pliki.
- Odpowiedzi przychodzą w całości; strumieniowanie nie jest jeszcze obsługiwane.
- Model może źle zrozumieć prośbę. Karta podsumowania pokazuje dokładnie, co zostanie wysłane;
  przejrzyj ją, zanim klikniesz **Uruchom**.

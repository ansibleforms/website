---
layout: default
title: Preferencje
parent: Twój profil
nav_order: 2
translated_from: d67f4050fea45cbd0cccd16c37cdc03838042925
---

# Preferencje
{: .no_toc }

Język, motyw, strefa czasowa, format daty i powiadomienia na pulpicie
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Preferencje

Widok Preferencje zmienia to, jak AnsibleForms wygląda dla ciebie. Każdy wybór jest zapisywany w przeglądarce,
w której go dokonujesz, więc inna przeglądarka lub komputer zaczyna od ustawień domyślnych.

| Ustawienie | Opcje | Można ustawić także |
|---|---|---|
| Język | Català, Deutsch, English, Español, Français, Italiano, Nederlands, Polski, Português, 日本語 (japoński), 简体中文 (chiński uproszczony) | flagą w nagłówku |
| Motyw | Zgodnie z przeglądarką, Jasny, Ciemny lub Kolor (nagłówek w wybranym przez ciebie kolorze) | ikoną słońca w nagłówku |
| Widok formularzy | Kafelki lub Lista | przyciskiem na stronie Formularze |
| Strefa czasowa | UTC, strefa tej przeglądarki lub dowolna strefa według nazwy | tylko tutaj |
| Format daty | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` lub `DD.MM.YYYY` | tylko tutaj |
| Powiadomienia na pulpicie | Włączone lub wyłączone | tylko tutaj |

Od wersji 7.3.0 widok jest podzielony na karty, każda pod własnym adresem (`/profile/preferences/<tab>`): **Wygląd** (język, motyw i widok
formularzy), **Data i godzina** (strefa czasowa i format daty) oraz **Powiadomienia**. Pole wyszukiwania nad nimi wyświetla pasujące ustawienia
pod nazwą ich karty. Wybór pozostaje szkicem do kliknięcia **Zapisz**, a opuszczenie widoku z niezapisaną zmianą wywołuje pytanie.

**Zgodnie z przeglądarką** przełącza motyw na jasny lub ciemny tak jak przeglądarka i zmienia się razem z nią. Od wersji 7.3.0 jest to motyw domyślny, chyba że
administrator wybierze inny. Najechanie na kolor motywu **Kolor**, tutaj lub w menu motywu w nagłówku, pokazuje podgląd aplikacji w tym
kolorze, a poprzedni motyw wraca, gdy wskaźnik opuści paletę; nic się nie zmienia aż do kliknięcia.

---

## Powiadomienia na pulpicie

Od wersji 7.3.0 karta **Powiadomienia** włącza powiadomienia na pulpicie w tej przeglądarce, dla użytkowników, których rola ustawia `showJobs`.

Za pierwszym razem przeglądarka prosi o zgodę. Gdy blokuje powiadomienia dla tej witryny, przełącznik pozostaje wyłączony i podpowiada, jak
je dopuścić, a witryna na zwykłym `http` w ogóle nie może ich wyświetlać. Po włączeniu powiadomienie pojawia się:

| Kiedy | Treść | Kliknięcie w nie |
|---|---|---|
| Kończy się zadanie, które uruchomiłeś | Formularz i jego wynik, np. *Patch Linux servers: Zakończone powodzeniem*, z numerem zadania i czasem trwania | Przenosi kartę na wierzch, na to zadanie |
| Zadanie czeka na twoje zatwierdzenie | Formularz, numer zadania i kto je uruchomił, z przyciskami **Zatwierdź** i **Odrzuć** | Otwiera zadania czekające na zatwierdzenie |

Przyciski **Zatwierdź** i **Odrzuć** pojawiają się w Chrome i Edge; Firefox i Safari pokazują powiadomienie bez nich, podobnie jak
witryna z certyfikatem samopodpisanym, ponieważ przyciski wymagają service workera. Powiadomienia przychodzą tylko wtedy, gdy otwarta jest karta AnsibleForms,
nawet w tle: po zamknięciu wszystkich kart nic nie jest wysyłane. Każde pojawia się raz, niezależnie od liczby otwartych kart, a kroki
zadania wieloetapowego i zadanie, które właśnie oglądasz, nie generują powiadomień.

---

## Strefa czasowa

Daty i godziny w całym AnsibleForms są wyświetlane w wybranej przez ciebie strefie czasowej. Dotyczy to czasu rozpoczęcia
i zakończenia zadań, dziennika audytu, strony stanu, kopii zapasowych, zapisanych zadań i wygaśnięcia tokenu
API. Zmiana strefy czasowej od razu aktualizuje każdą stronę, bez przeładowania.

Dopóki jej nie wybierzesz, obowiązuje strefa czasowa ustawiona przez administratora dla wszystkich (**Ustawienia > Wygląd > Wartości domyślne**, zobacz
[Wygląd](../appearance.html)), czyli **UTC**, jeśli jej nie zmieniono. **Ta przeglądarka** podąża za strefą czasową twojego komputera, a
lista zawiera każdą strefę według nazwy, np. `Europe/Madrid`. Karta pokazuje bieżący czas w wybranej strefie i formacie.

---

## Format daty

Format daty określa, jak wygląda część daty w każdej dacie; każda opcja jest pokazana z dzisiejszą datą: `YYYY-MM-DD`
(2026-10-12), `DD/MM/YYYY`, `MM/DD/YYYY` lub `DD.MM.YYYY`. Dopóki go nie wybierzesz, obowiązuje domyślny format daty administratora,
czyli `YYYY-MM-DD`, jeśli go nie zmieniono. Podobnie jak pozostałe ustawienia jest przechowywany w tej przeglądarce.

---

## Co zachowuje czas serwera

Dwa wyjątki zachowują własny czas serwera:

- **Log serwera i wynik zadań** to tekst zawierający czasy, które zapisał w nich serwer.
- **Czasy wprowadzane przez ciebie**, np. kiedy ma się uruchomić zaplanowane zadanie, oraz harmonogramy cron działają tak jak
  dotąd.

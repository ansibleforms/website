---
layout: default
title: Zastrzeżenie
nav_order: 8
has_children: true
has_toc: false
permalink: /disclaimer.html
translated_from: ad00bcbac9d3c64c103b15d26914eec84174f6b6
---

# Zastrzeżenie
{: .no_toc }

Warunki, które każdy użytkownik akceptuje raz przed użyciem aplikacji, zapisywane z tym, kto zaakceptował którą wersję i kiedy
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: poproś każdego użytkownika o akceptację warunków korzystania w **Ustawienia > Dostęp > Zastrzeżenie**, z opcją roli `showSettings`.

Od wersji 7.3.0 strona wyświetla każdą wersję zastrzeżenia, a każda wersja otwiera się na własnej stronie ze swoimi akceptacjami.
Do wersji 7.2 strona miała zamiast tego trzy karty (**Ogólne**, **Wersje** i **Akceptacje**); aktualizacja zachowuje każdą wersję.

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Ogólne](disclaimer/general.html) | Lista wersji, dodawanie wersji i włączanie tej, którą akceptują użytkownicy |
| [Wersje](disclaimer/versions.html) | Strona wersji i zmiana jej tekstu jako poprawki lub ponownie dla wszystkich |
| [Akceptacje](disclaimer/acceptances.html) | Kto zaakceptował którą wersję i ponowne pytanie wybranych użytkowników |


---

## Co widzą użytkownicy

Gdy jakaś wersja jest włączona, każdy użytkownik, który się loguje, dostaje ją w oknie przed czymkolwiek innym, także admini:

1. Czytają jej tytuł i tekst.
2. Zaznaczają pole wyboru, a potem klikają **Akceptuj**. **Odrzuć**, na czerwono, zamiast tego ich wylogowuje.

Od wersji 7.3.0 strona za oknem jest rozmyta, dopóki nie odpowiedzą.

Użytkownik akceptuje każdą wersję raz: przy następnym logowaniu nie jest pytany ponownie, tylko gdy pojawi się nowa wersja, gdy
admin zapisze zmieniony tekst z [Zapytaj wszystkich ponownie](disclaimer/versions.html#changing-the-text) albo gdy admin użyje
[Poproś ponownie](disclaimer/acceptances.html#asking-users-again) na jego akceptacji.

Dopóki nie zaakceptują, API odpowiada na każde wywołanie z ich sesji statusem `403` i kodem `disclaimer_required`,
z wyjątkiem wywołań pod `/api/v2/disclaimer` i `/api/v2/profile` oraz zdarzeń na żywo, które śledzi przeglądarka.
[Token API](profile/api-token.html) nigdy nie jest pytany, bo w skrypcie nie ma nikogo, kto mógłby kliknąć.


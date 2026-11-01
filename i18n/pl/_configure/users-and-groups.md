---
layout: default
title: Użytkownicy i grupy
nav_order: 16
has_children: true
has_toc: false
permalink: /users-and-groups.html
translated_from: 07178b6b66a60d91e5a8ff3c417da3771730bc5e
---

# Użytkownicy i grupy
{: .no_toc }

Lokalni użytkownicy i grupy, obok nich użytkownicy i grupy LDAP i logowania jednokrotnego oraz blokowanie logowania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: zarządzaj tym, kto może się logować, w **Ustawienia > Dostęp > Użytkownicy** i **Grupy**, z opcją roli `showSettings`.

Wbudowany admin, kolejność logowania i mapowanie ról kont lokalnych są opisane na stronie [Konta lokalne](authentication/local.html).

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Użytkownik lokalny](users-and-groups/local-user.html) | Dodawanie użytkownika lokalnego i karty jego strony |
| [Kilka grup](users-and-groups/several-groups.html) | Użytkownik lokalny w kilku grupach i jego role |
| [Grupa lokalna](users-and-groups/local-group.html) | Strona grupy lokalnej i jej karty |
| [Użytkownicy i grupy z katalogu](users-and-groups/directory.html) | Użytkownicy i grupy LDAP, Entra ID i OIDC, w postaci z ostatniego logowania |
| [Blokowanie logowania](users-and-groups/blocking-a-sign-in.html) | Zezwól na logowanie: blokowanie użytkownika bez usuwania czegokolwiek |


---

## Listy

Listy **Użytkownicy** i **Grupy** pokazują lokalnych użytkowników i grupy, a obok nich użytkowników i grupy LDAP i logowania jednokrotnego.

Użytkownik lub grupa LDAP, Entra ID lub OIDC pojawia się na liście, gdy się zaloguje (lub zostanie zauważony przy logowaniu) albo gdy wskaże go rola.
Kolumna **Źródło** mówi, skąd każdy pochodzi: lokalnie, LDAP, Microsoft Entra ID lub OIDC. Od wersji 7.3.0 lista **Użytkownicy** ma też
kolumnę **Ostatnie logowanie**, która mówi, kiedy każdy użytkownik ostatnio się zalogował.

Wiersz otwiera stronę swojego użytkownika lub grupy. **Dodaj użytkownika** i **Dodaj grupę** tworzą lokalnego użytkownika lub grupę.

---

## Konta, które dają uprawnienia admina

Rola admin w config.yaml wskazuje lokalne grupy i użytkowników, więc tylko admin może zmieniać konta i grupy, które ona wskazuje.

Użytkownik z `showSettings`, ale bez roli admin, nie może zmienić, zablokować, przenieść do innych grup, ustawić hasła ani usunąć
lokalnego konta wskazanego przez rolę admin (bezpośrednio lub przez jedną z jego grup). Nie może też utworzyć, przemianować ani usunąć grupy
wskazanej przez rolę admin ani dodać do niej użytkownika. To samo dotyczy użytkownika LDAP lub SSO, który mapuje się na rolę admin: jego blokowanie,
kończenie jego sesji, zapominanie go i unieważnianie jego tokenów API należą do admina. Serwer odpowiada na takie żądanie `403`.


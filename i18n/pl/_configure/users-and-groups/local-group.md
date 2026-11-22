---
layout: default
title: Grupa lokalna
parent: Użytkownicy i grupy
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Grupa lokalna
{: .no_toc }

Strona grupy lokalnej i jej karty
{: .fs-6 .fw-300 }

Od wersji 7.8.0 **Dodaj grupę** otwiera trzyetapowy kreator **Nowy element: grupa**: **Szczegóły** (nazwa i opis), **Użytkownicy**
(użytkownicy lokalni, których należy dodać do grupy) i **Role** (role, które grupa ma otrzymać, aby mieli je jej użytkownicy). Wymagana
jest tylko nazwa. **Zapisz** na ostatnim etapie tworzy grupę, a potem dodaje użytkowników i nadaje role: to, co się nie uda, jest
wymienione w komunikacie, a grupa zostaje.

Strona grupy, `/settings/groups/<id>`, ma te karty:

| Karta | Co pokazuje |
|---|---|
| **Szczegóły** | Nazwę i opis |
| **Użytkownicy** | Użytkowników w grupie; **Dodaj użytkownika** dodaje jednego, menu wiersza lub pola wyboru usuwają |
| **Role** | Role, które wskazują grupę |
| **Formularze** | Formularze, które otwierają te role |

Grupy z użytkownikami nie można usunąć: najpierw usuń z niej użytkowników. Grupy `admins` nigdy nie można usunąć ani zmienić jej nazwy.

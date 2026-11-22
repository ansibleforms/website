---
layout: default
title: Użytkownik lokalny
parent: Użytkownicy i grupy
nav_order: 1
translated_from: 830382a6160c7dd5632ad0f8d89b7ad520d7ae52
---

# Użytkownik lokalny
{: .no_toc }

Dodawanie użytkownika lokalnego i karty jego strony
{: .fs-6 .fw-300 }

**Dodaj użytkownika** otwiera czteroetapowy kreator **Nowy użytkownik**:

| Etap | O co pyta |
|---|---|
| **Użytkownik** | Nazwa użytkownika, opis i e-mail; wymagana jest tylko nazwa użytkownika |
| **Hasło** | Hasło wpisane dwa razy: **Dalej** czeka, aż oba będą takie same |
| **Grupa** | Grupa lokalna, do której należy użytkownik i która daje mu role grupy |
| **Role** | Role nadane samemu użytkownikowi, każda wybrana przez **Dodaj rolę**; żadna nie jest wymagana |

Etap **Role** i hasło wpisywane dwa razy są nowe w wersji 7.8.0. **Zapisz** na ostatnim etapie tworzy użytkownika, a potem nadaje mu
wybrane role: rola, której nie udało się nadać, jest wymieniona w komunikacie, a użytkownik i tak zostaje utworzony.

Strona użytkownika, `/settings/users/<id>`, ma te karty:

| Karta | Co pokazuje |
|---|---|
| **Szczegóły** | Przełącznik **Zezwól na logowanie**, nazwę użytkownika, opis, e-mail oraz, od wersji 7.3.0, **Ostatnie logowanie** |
| **Grupy** | Grupy, do których należy użytkownik |
| **Role** | Role, które ma użytkownik, i co daje każdą z nich: **Bezpośrednio**, **Przez** grupę lub **Wszyscy** |
| **Formularze** | Formularze, które otwierają te role |
| **Zadania** | Zadania uruchomione przez użytkownika, od najnowszego |
| **Zapisane zadania** | Wartości formularzy, które użytkownik zapisał, żeby uruchomić je ponownie |
| **Harmonogramy** | Zadania, które użytkownik zaplanował przez Uruchom później |
| **Aktywność** | Co dziennik audytu zapisał o działaniach użytkownika |
| **Tokeny API** | Tokeny API użytkownika, z datą utworzenia, wygaśnięcia i ostatniego użycia każdego; **Unieważnij** od razu kończy jeden z nich |

Od wersji 7.3.0 logowania użytkownika lokalnego są zapisywane, tak jak już wcześniej logowania użytkownika LDAP lub SSO: **Ostatnie logowanie** pokazuje najnowsze, a
lista użytkowników ma sortowalną kolumnę **Ostatnie logowanie** dla każdego źródła, więc konto, którego nikt nie używa, rzuca się w oczy. Odrzucone logowanie nie jest
zapisywane, a lokalny użytkownik, który nie logował się od aktualizacji, pokazuje `–`.

**Zmień hasło** i **Usuń** są w prawym górnym rogu. Użytkownika `admin` nigdy nie można usunąć ani zmienić jego nazwy.

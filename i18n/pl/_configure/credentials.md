---
layout: default
title: Poświadczenia
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 0c8fddace3f97bb7d5a3a2642e3fccc296680454
---

# Poświadczenia
{: .no_toc }

Przechowuj dane logowania, których używają formularze, repozytoria, magazyny sekretów i kanały powiadomień
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: dodaj użytkowników, hasła i tokeny, którymi łączy się AnsibleForms, przechowywane w postaci zaszyfrowanej lub odczytywane z magazynu sekretów.

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Typy poświadczeń](credentials/types.html) | Co zawiera każdy typ i gdzie można go wybrać |
| [Strona poświadczeń](credentials/list.html) | Lista poświadczeń i okno, które dodaje nowe |
| [Strona poświadczenia](credentials/credential-page.html) | Karty poświadczenia i to, co go używa |

---

## Jak to działa

**Poświadczenie** to nazwane dane logowania, dodawane w **Połączenia > Poświadczenia**. Formularze i inne obiekty administracyjne odwołują się
do niego po nazwie, więc samo hasło nigdy nie pojawia się w formularzu. Jego użytkownik i hasło są albo przechowywane w
bazie danych AnsibleForms, zaszyfrowane kluczem `ENCRYPTION_SECRET`, albo odczytywane z [magazynu sekretów](secret-stores/) przy każdym
użyciu poświadczenia.

Od wersji 7.5.0 formularze odpytują [bazę danych](databases.html) z **Połączenia > Bazy danych**, która wskazuje poświadczenie typu
**Baza danych**, którym się łączy; formularz, który wskazuje samo poświadczenie w `dbConfig`, nadal działa jak dotąd.

---

## Kto może zmienić poświadczenie

Od wersji 7.3.0 poświadczenie, od którego zależy połączenie lub logowanie, może dodać, zmienić lub usunąć tylko admin:

| Poświadczenia | Dlaczego |
|---|---|
| Typy połączeń: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` i `cyberark` | Runner lub magazyn sekretów bierze z niego swój adres i sekret |
| Typy logowania: `oidc`, `entraid` i `ldap` | Dostawca SSO lub katalog LDAP loguje nim użytkowników |
| Każde poświadczenie wskazane przez runner | Runner loguje się nim, a zmiana samego runnera też wymaga admina |

Inni użytkownicy z dostępem do poświadczeń widzą je tylko do odczytu. Użytkownik, który mógłby skierować takie poświadczenie na inny
serwer, dostałby każdy sekret wysyłany przez nie, dlatego ta zasada odpowiada zasadzie dla runnerów. Trzy kolejne zasady
trzymają tych użytkowników z dala od sekretów, których inaczej nie mogliby odczytać:

- **Wskazywanie chronionego poświadczenia**: tylko admin może wskazać jedno z tych poświadczeń gdzie indziej, np. w repozytorium,
  kanale powiadomień lub ustawieniach asystenta czatu. Poświadczenie, które odczytuje hasło z magazynu sekretów, jest
  chronione tak samo, niezależnie od typu.
- **Wybór magazynu sekretów**: tylko admin może skierować poświadczenie na [magazyn sekretów](secret-stores/) albo zmienić
  magazyn lub odwołanie, które odczytuje; inny użytkownik może je nadal odesłać bez zmian albo wyczyścić wszystkie.
- **Przenoszenie poświadczenia**: gdy inny użytkownik zmienia, gdzie loguje się poświadczenie (jego host, port, wystawcę, dzierżawę lub
  adres serwera), nie wpisując ponownie hasła, zapisane hasło jest czyszczone, tak samo jak odwołanie do magazynu sekretów,
  które odczytuje, więc stary sekret nigdy nie trafia do nowego celu.

---

## Poświadczenia w użyciu

Poświadczenia, na które wciąż wskazują jakieś rekordy, od wersji 7.5.0 także [baza danych](databases.html), nie można usunąć ani
przemianować, bo te rekordy wskazywałyby na nic.
Odmowa podaje, ile rekordów go używa; karta **Używane przez** na [jego stronie](credentials/credential-page.html) je wymienia.
Najpierw skieruj je na inne poświadczenie, potem je usuń lub przemianuj.

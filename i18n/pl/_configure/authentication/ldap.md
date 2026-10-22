---
layout: default
title: LDAP
parent: Uwierzytelnianie
nav_order: 2
translated_from: a4089d681ad976e31e7ddefb29588bd3ca334dab
---

# LDAP
{: .no_toc }

Pozwól użytkownikom katalogu logować się własnym hasłem i nadawaj im role przez ich grupy w katalogu
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jak to działa

AnsibleForms łączy się z katalogiem kontem bind, wyszukuje użytkownika, a następnie wykonuje bind jako ten użytkownik, żeby sprawdzić
hasło:

1. Użytkownik loguje się nazwą użytkownika i hasłem. Gdy żaden użytkownik **lokalny** nie ma tej nazwy, sprawdzany jest LDAP.
2. AnsibleForms wykonuje bind kontem bind z poświadczenia katalogu i szuka w **Bazie wyszukiwania** wpisu, którego
   **Atrybut nazwy użytkownika** jest równy nazwie użytkownika.
3. Wykonuje bind jako znaleziony wpis, z wpisanym hasłem.
4. Grupy są odczytywane z wpisu (lub z wyszukiwania grup), filtrowane i poprzedzane prefiksem `ldap/`.

Nazwa użytkownika w formie UPN (`jdoe@example.com`), która nie znajduje użytkownika, jest ponawiana raz z częścią przed `@`, więc użytkownicy
mogą logować się w obu formach, nawet gdy Atrybut nazwy użytkownika zawiera krótką nazwę. Błędne hasło nigdy nie jest ponawiane.

Jeden zestaw ustawień obsługuje Active Directory, OpenLDAP i inne; od wersji 7.3.0 może być [kilka katalogów](#several-directories).

---

## Ustawienia

Od wersji 7.3.0 ustawienia są osobne dla każdego katalogu. **Dostęp > LDAP** wyświetla katalogi w kolejności, w jakiej wyszukiwana jest sama nazwa użytkownika:

![Dostęp > LDAP](../assets/screenshots/ldap.jpg)

| Menu wiersza | Co robi |
|---|---|
| Edytuj | Otwiera stronę katalogu |
| Testuj połączenie | Próbuje zalogować się testową nazwą użytkownika i hasłem, zobacz [Testowanie połączenia](#testing-the-connection) |
| Włącz, Wyłącz | Włącza lub wyłącza katalog; `main` jest wyłączany zamiast usuwania |
| Przenieś w górę, Przenieś w dół | Zmienia jego miejsce w kolejności wyszukiwania |
| Usuń | Usuwa katalog; w `main` widoczne, ale nieaktywne |

Dodawanie katalogu pyta o pola w czterech krokach, którymi są karty jego strony. **Szczegóły** zawierają **Włączony**, **Nazwę** i **Opis**:

| Karta | Ustawienie | Znaczenie |
|---|---|---|
| Poświadczenia | Poświadczenie | Wymagane. Poświadczenie `ldap` z [Połączenia > Poświadczenia](../credentials.html), które przechowuje połączenie, zobacz niżej |
| Użytkownicy | Baza wyszukiwania | DN, od którego zaczyna się wyszukiwanie użytkownika, np. `OU=Users,DC=example,DC=com`. Przeszukiwane są też poddrzewa |
| Użytkownicy | Atrybut nazwy użytkownika | Atrybut porównywany z nazwą logowania: `sAMAccountName` w AD (domyślnie), `uid` w OpenLDAP |
| Użytkownicy | Atrybut poczty | Atrybut z adresem e-mail, zwykle `mail` |
| Użytkownicy | Domeny logowania | Domeny, których logowania `user@domain` trafiają prosto do tego katalogu, zobacz [Kilka katalogów](#several-directories) |
| Grupy | Atrybut grup | Atrybut wpisu użytkownika, który zawiera grupy (`memberOf`, domyślnie), lub `groups` przy wyszukiwaniu grup |
| Grupy | Baza wyszukiwania grup | DN, od którego zaczyna się wyszukiwanie grup |
| Grupy | Klasa grupy | objectClass grup, np. `group`, `groupOfNames` lub `posixGroup` |
| Grupy | Atrybut członka grupy | Atrybut grupy z listą jej członków, np. `member`, `uniqueMember` lub `memberUid`; domyślnie `member` |
| Grupy | Atrybut użytkownika członka grupy | Atrybut użytkownika, który zawierają te wartości członków, np. `dn` lub `uid`; domyślnie `dn` |
| Grupy | Filtr grup | Wyrażenie regularne; zachowywane są tylko grupy o pasującej nazwie. Puste zachowuje wszystkie grupy |

Wartości domyślne trzech ostatnich pól grup obowiązują tylko przy wyszukiwaniu grup, zobacz następną sekcję.

Poświadczenie `ldap` określa, jak dotrzeć do katalogu i jako kto go przeszukiwać:

| Pole | Znaczenie |
|---|---|
| Serwery | Jeden na pole, jako `host`, `host:port` lub `ldaps://host:port`, próbowane w tej kolejności: gdy jeden nie odpowiada, próbowany jest następny |
| Port | `389` dla zwykłego LDAP, `636` dla LDAPS |
| Włącz TLS | Łączy przez LDAPS (`ldaps://`). StartTLS na porcie 389 nie jest obsługiwany |
| Ignoruj certyfikaty | Pomija weryfikację certyfikatu serwera. Widoczne tylko przy **Włącz TLS** |
| Certyfikat | Certyfikat klienta, który AnsibleForms przedstawia serwerom, w PEM, gdy certyfikaty są sprawdzane |
| Pakiet CA | Certyfikat(y) CA, które podpisały certyfikat serwera, w PEM, gdy certyfikaty są sprawdzane |
| DN użytkownika bind | DN konta usługi, które przeszukuje katalog |
| Hasło użytkownika bind | Jego hasło, przechowywane w postaci zaszyfrowanej lub odczytywane z [magazynu sekretów](../secret-stores/) |

Tylko admin może dodać lub zmienić poświadczenie `ldap`, zobacz [Kto może zmienić poświadczenie](../credentials.html#who-may-change-a-credential).
Do wersji 7.2.0 serwery, TLS i konto bind były polami ustawień LDAP. Aktualizacja do 7.3.0 przenosi je do poświadczenia,
zobacz [Adresy w poświadczeniach](../credentials/types.html#addresses-in-credentials):

| Katalog przed aktualizacją | Dokąd trafiają jego serwery |
|---|---|
| Własny bind DN i hasło, bez poświadczenia | Nowe poświadczenie `ldap` o nazwie `<directory>-ldap`, np. `main-ldap` |
| Poświadczenie bez serwerów | Do tego poświadczenia |
| Poświadczenie, które ma już inne serwery | Kopia poświadczenia o nazwie `<credential>-<directory>`, którą katalog potem wskazuje |

Zajęta nazwa dostaje `-2`, `-3` i tak dalej. Katalog z config seed zostaje bez zmian: należy do seeda.

---

## Grupy

Grupy pochodzą z jednego z dwóch miejsc, a **Atrybut grup** decyduje, z którego:

- **Atrybut wpisu użytkownika**, zwykle `memberOf`. To typowa konfiguracja dla Active Directory i dla
  OpenLDAP z nakładką `memberof`.
- **Wyszukiwanie grup**, dla katalogów bez `memberOf`. Uruchamia się tylko wtedy, gdy ustawione są zarówno **Baza wyszukiwania grup**, jak i **Klasa grupy**:
  AnsibleForms szuka wtedy grup tej klasy, których **Atrybut członka grupy** zawiera **Atrybut użytkownika członka grupy**
  danego użytkownika, i zapisuje wynik w atrybucie `groups`. Ustaw **Atrybut grup** na `groups`,
  żeby go użyć.

{: .note }
> Przy **Atrybucie grup** `memberOf` skonfigurowane wyszukiwanie grup się uruchamia, ale jego wynik nie jest używany dla ról.

Każda grupa jest DN, a AnsibleForms zachowuje jej pierwszy CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` staje się `AF-Admins`.
Następnie do tej nazwy stosowany jest **Filtr grup**, a pozostałe grupy dostają prefiks `ldap/`: `ldap/AF-Admins`.

W dużych katalogach filtr utrzymuje małe tokeny i zadania; nieprawidłowe wyrażenie regularne zachowuje wszystkie grupy i trafia do dziennika.

---

## Mapowanie na role

W config.yaml grupa LDAP to `ldap/<group CN>`, a użytkownik LDAP to `ldap/<username>`, w obu przypadkach z rozróżnianiem wielkości liter:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

Nazwa użytkownika to wartość **Atrybutu nazwy użytkownika** w postaci zwróconej przez katalog, a nie wpisanej przez użytkownika.
Opcje ról opisuje strona [Role](../config/roles.html).

---

## Kilka katalogów

Od wersji 7.3.0 może być kilka katalogów, każdy z własnymi serwerami, użytkownikami i grupami. Ich nazwy rozróżniają członków:

| Katalog | Nazwa użytkownika | Grupy | W roli |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Każdy inny, np. `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

Użytkownik wskazuje katalog przy logowaniu jako `corp\jdoe` lub `corp/jdoe` albo loguje się adresem w domenie, która należy
do katalogu. Sama nazwa użytkownika jest sprawdzana w każdym włączonym katalogu, w ich kolejności, tak samo jak nazwa w rodzaju `other\jdoe`, gdy żaden
katalog nie nazywa się `other`: jest wtedy wyszukiwana dokładnie tak, jak ją wpisano.

Decyduje pierwszy katalog, który zna użytkownika: błędne hasło w nim jest ostateczną odpowiedzią, a następny katalog nie jest
sprawdzany, bo mógłby zawierać kogoś innego o tej samej nazwie. Katalog, z którym nie można się połączyć, jest pomijany.

Katalog o nazwie `default` do wersji 7.2.0 od 7.3.0 nazywa się `main`: aktualizacja zmienia mu nazwę, a nowa instalacja zaczyna
od `main`. Jego członkowie zachowują krótkie nazwy, więc role, które ich wskazują, nie wymagają zmian. Nazwy katalogu `main` nie można
zmienić, a nazwa katalogu zawiera tylko litery, cyfry, `-` i `_`.

---

## Testowanie połączenia

**Testuj połączenie** prosi o testową nazwę użytkownika i hasło i próbuje zalogować się z ustawieniami widocznymi na ekranie, zapisanymi lub nie.
Po sukcesie pokazuje wpis użytkownika w katalogu, z którego odczytasz dokładne nazwy atrybutów i DN grup do użycia.

Testowy użytkownik, który nie istnieje, i tak zgłasza sukces: połączenie i konto bind działają, tylko użytkownik nie
został znaleziony. Typowe błędy:

| Komunikat | Przyczyna |
|---|---|
| `Bad server or port (connection failed)` | Nazwa hosta nie jest rozwiązywana lub port jest nieosiągalny. |
| `Wrong binding credentials` | Bind DN lub hasło w poświadczeniu katalogu są błędne. |
| `Unable to verify the certificate` | Certyfikat serwera nie jest podpisany przez pakiet CA z poświadczenia. |
| `Certificate is not valid` | Certyfikat lub pakiet CA w poświadczeniu nie zawiera prawidłowego certyfikatu PEM. |

---

## Przykład Active Directory

Ten przykład łączy się z dwoma kontrolerami domeny przez LDAPS i zachowuje tylko grupy, których nazwa zaczyna się od `AF-`:

| Ustawienie | Wartość |
|---|---|
| Poświadczenie > Serwery | `dc01.example.com`, potem `dc02.example.com` |
| Poświadczenie > Port | `636` |
| Poświadczenie > Włącz TLS | włączone |
| Poświadczenie > Ignoruj certyfikaty | wyłączone, z certyfikatem klienta i łańcuchem CA firmowego urzędu certyfikacji |
| Poświadczenie > DN użytkownika bind | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Baza wyszukiwania | `OU=Users,DC=example,DC=com` |
| Atrybut poczty | `mail` |
| Atrybut nazwy użytkownika | `sAMAccountName` |
| Atrybut grup | `memberOf` |
| Filtr grup | `^AF-` |

Członkowie `CN=AF-Operators,…` pasują do ról z `ldap/AF-Operators` i logują się jako `jdoe` lub `jdoe@example.com`.

---

## Przykład OpenLDAP

Ten przykład używa wyszukiwania grup na wpisach `groupOfNames`, więc działa bez nakładki `memberof`:

| Ustawienie | Wartość |
|---|---|
| Poświadczenie > Serwery | `ldap.example.com` |
| Poświadczenie > Port | `636` |
| Poświadczenie > Włącz TLS | włączone |
| Poświadczenie > DN użytkownika bind | `cn=readonly,dc=example,dc=com` |
| Baza wyszukiwania | `ou=people,dc=example,dc=com` |
| Atrybut poczty | `mail` |
| Atrybut nazwy użytkownika | `uid` |
| Atrybut grup | `groups` |
| Baza wyszukiwania grup | `ou=groups,dc=example,dc=com` |
| Klasa grupy | `groupOfNames` |
| Atrybut członka grupy | `member` |
| Atrybut użytkownika członka grupy | `dn` |

Użytkownik wymieniony w `cn=af-admins,ou=groups,dc=example,dc=com` dostaje grupę `ldap/af-admins`. Dla grup `posixGroup`
użyj **Atrybutu członka grupy** `memberUid` i **Atrybutu użytkownika członka grupy** `uid`.

Z nakładką `memberof` zostaw pola wyszukiwania grup puste i ustaw **Atrybut grup** na `memberOf`.

---

## Typowe pułapki

Większość problemów z LDAP sprowadza się do jednego z tych:

- **Lokalny użytkownik o tej samej nazwie.** Użytkownicy lokalni są sprawdzani najpierw, więc katalog nigdy nie jest pytany o tę nazwę.
- **Brak grup lub niewłaściwe grupy.** Atrybut grup musi istnieć (`groups` przy wyszukiwaniu grup); `memberOf` pomija zagnieżdżenia.
- **Nazwy grup, które nie pasują.** Używaj `ldap/<CN>` z tą samą wielkością liter i sprawdź, czy Filtr grup zachowuje grupę.
- **DN grup, które nie zaczynają się od CN.** Jako nazwa grupy używana jest tylko pierwsza wartość `CN=`, więc każdy DN grupy
  musi zaczynać się od `CN=` (lub `cn=`).
- **Certyfikaty.** TLS wymaga obu pól certyfikatów w poświadczeniu i pasującej nazwy serwera; Ignoruj certyfikaty służy tylko do testów.
- **Ustawienia, których nie da się zapisać.** Gdy katalog pochodzi z [config seed](../seed/managed-objects.html), jego strona
  jest tylko do odczytu: zmień zamiast tego plik seed.

Nieudane logowanie pokazuje ogólny komunikat. Przyczynę zapisuje serwer w dzienniku i dziennik audytu, a w przypadku Active
Directory jest ona tłumaczona z kodu katalogu, np. `Wrong password`, `Account locked` lub `Password expired`.

---
layout: default
title: Sekrety i szyfrowanie
parent: Bezpieczeństwo
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Sekrety i szyfrowanie
{: .no_toc }

Dwa główne sekrety, co chronią i jak długo trwają sesje i tokeny
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dwa główne sekrety

Dwa sekrety chronią wszystko inne. Ustaw oba, zanim instancja będzie przechowywać prawdziwe dane, przechowuj je poza instancją
i nigdy nie zmieniaj ich bez potrzeby:

| Sekret | Co chroni | Jeśli nie jest ustawiony | Jeśli zostanie utracony lub zmieniony |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Każde hasło i token zapisane w bazie danych: poświadczenia, hasło bind LDAP, tokeny runnerów, client secrets SSO, adresy webhooków Slack i Teams, klucz API czatu | Używany jest domyślny klucz, publicznie dostępny w kodzie źródłowym | Utracony: każdy zapisany sekret trzeba wprowadzić ponownie. Zmieniony: od wersji 7.3.0 każdy zapisany sekret jest ponownie szyfrowany, zobacz [niżej](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | Podpis tokenów dostępu i odświeżania, łącznie z długotrwałymi [tokenami API](../profile/api-token.html) | Przy każdym starcie generowany jest losowy sekret, więc każdy restart wylogowuje wszystkich | Każda sesja i każdy token API stają się nieważne |

Dopóki ich brakuje, przy starcie oba są zgłaszane w dzienniku ostrzeżeniem `[SECURITY]`. Strony ustawień odmawiają ich edycji,
API nigdy ich nie zwraca, a kopie zapasowe celowo je pomijają, więc utraconego `ENCRYPTION_SECRET` nie da się nigdzie
odzyskać: trzymaj jego kopię w swoim menedżerze sekretów. Sekret szyfrowania jest używany jako klucz 32-znakowy; krótsza lub
dłuższa wartość jest dopełniana lub obcinana.

Zmiana `ACCESS_TOKEN_SECRET` od razu kończy każdą sesję i każdy token API. Aby zakończyć tokeny jednego użytkownika lub jednej
sesji, użyj unieważnień opisanych w [Tokeny](#tokens).

---

## Zmiana sekretu szyfrowania

Od wersji 7.3.0 ustawienie lub zmiana `ENCRYPTION_SECRET` nie powoduje już utraty zapisanych sekretów. Przy następnym starcie worker ponownie szyfruje
każdy z nich nowym kluczem, w jednej transakcji bazy danych, zanim cokolwiek innego zapisze sekret:

| Sytuacja | Co ustawić |
|---|---|
| Instancja działała bez `ENCRYPTION_SECRET`, na publicznym kluczu domyślnym | Tylko `ENCRYPTION_SECRET`: sekrety są ponownie szyfrowane z klucza domyślnego |
| Instancja działała z własnym kluczem | `ENCRYPTION_SECRET` na nowy klucz i [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) na stary, na ten jeden start |

Gdy zapisane sekrety zostały zaszyfrowane kluczem, który nie jest żadnym z nich, nic nie jest zmieniane, a aplikacja odmawia startu, dopóki
`ENCRYPTION_SECRET_PREVIOUS` nie wskaże tego klucza. Usuń `ENCRYPTION_SECRET_PREVIOUS`, gdy start ponownie je zaszyfruje, i ustaw
nowy `ENCRYPTION_SECRET` na każdym węźle aplikacji, workerze i każdym RTE w trybie bazy danych, które samo się rejestruje. Ta
samodzielna rejestracja (`RTE_REGISTER`) jest przestarzała w 7.3.0: RTE, które dołącza tokenem dołączenia (`RTE_JOIN_TOKEN`) w trybie
gniazda, nie potrzebuje `ENCRYPTION_SECRET`, zobacz [Tryby RTE](../rte/modes.html).

---

## Tokeny

Logowanie zwraca krótkotrwały token dostępu i dłuższy token odświeżania, którym przeglądarka zdobywa nową parę:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : domyślnie `30m`. Krótszy czas
  ogranicza użycie przechwyconego tokenu.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : domyślnie `24h`.
  Tyle bezczynna przeglądarka pozostaje zalogowana.
* Opcja roli `allowApiTokens` pozwala użytkownikowi zażądać tokenu API ważnego przez określoną liczbę dni, a
  `extendedTokenExpiration` dodaje token, który nigdy nie wygasa. Nadawaj je tylko rolom, które potrzebują dostępu do API ze skryptów.
  Na [stronie profilu](../profile/api-token.html) token tworzy się z sesji przeglądarki zalogowanej najwyżej 10 minut
  temu, nigdy z innego tokenu API. Token, który nigdy nie wygasa, żyje 50 lat, a poniższe zdarzenia nadal go kończą.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : domyślnie `90`. Najdłuższy czas życia tokenu
  API: dłuższe żądanie jest do niego przycinane.

Token jest podpisanym JWT, ale serwer przechowuje też listę unieważnionych tokenów, współdzieloną przez wszystkie węzły aplikacji, więc token
może się zakończyć przed wygaśnięciem:

| Zdarzenie | Co się kończy |
|-------|-----------|
| Wylogowanie | Każdy token tego logowania: token dostępu, jego token odświeżania oraz token API, gdy wylogowanie go używa |
| Zmiana hasła, przez użytkownika lub admina | Każdy token użytkownika wystawiony przed zmianą, łącznie z tokenami API, na każdym urządzeniu |
| Wyłączenie przełącznika **Zezwól na logowanie** użytkownika (lokalnego, LDAP lub SSO) albo usunięcie lokalnego użytkownika | Każdy token użytkownika |
| **Zakończ sesje** na stronie użytkownika LDAP lub SSO | Każdy token użytkownika; może zalogować się ponownie, chyba że jest zablokowany |
| **Unieważnij** przy tokenie API, na stronie profilu lub na karcie **Tokeny API** użytkownika | Ten jeden token API, natychmiast |

Skrypt kończy własny token API, wylogowując się nim: `POST /api/v2/auth/logout` z tokenem w nagłówku
`Authorization`.

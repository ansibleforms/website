---
layout: default
title: Uwierzytelnianie
parent: API REST
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Uwierzytelnianie
{: .no_toc }

Logowanie, odświeżanie tokenu lub używanie tokenu długoterminowego
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Każde wywołanie wymaga tokenu dostępu w nagłówku `Authorization`. Token uzyskuje się przez zalogowanie, a odświeża
za pomocą tokenu odświeżania (refresh token).

---

## Logowanie

Zaloguj się uwierzytelnianiem basic, podając nazwę użytkownika i hasło:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

Odpowiedź zawiera dwa tokeny, token dostępu i token odświeżania:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Wywoływanie API

Wysyłaj token dostępu jako token bearer przy każdym wywołaniu:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Odświeżanie tokenu

Token dostępu wygasa (`ACCESS_TOKEN_EXPIRATION`, domyślnie 30 minut). Nowy uzyskasz tokenem odświeżania,
bez hasła:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

Odpowiedź zawiera nową parę, w tej samej postaci co przy logowaniu. Token odświeżania działa raz: zachowaj nowy na następne odświeżenie.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Tokeny długoterminowe

Skrypt działający bez nadzoru może używać tokenu, który żyje dłużej. Od wersji 7.3.0 wymaga to opcji roli `allowApiTokens`:

* Utwórz go w [Profil > Tokeny API](../profile/api-token.html).
* Albo zaloguj się z parametrem zapytania `expiryDays`, aby uzyskać token ważny przez podaną liczbę dni:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` jest odczytywany tylko z adresu URL, nigdy z treści żądania. Dla użytkownika, którego role nie mają `allowApiTokens`, jest ignorowany,
a logowanie zwraca token o zwykłym czasie życia. `expiryDays=never` wymaga też `extendedTokenExpiration`. Dodaj parametr zapytania `name`
(`?expiryDays=90&name=nightly-backup`), aby nadać tokenowi nazwę na liście tokenów użytkownika.

Token długoterminowy żyje maksymalnie [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) dni, domyślnie
90: dłuższy `expiryDays` jest do tej wartości przycinany, chyba że ma wartość `never`. Odświeżenie go zwraca zwykły token, więc gdy wygaśnie, zaloguj się ponownie.

### Tokeny zalogowanego użytkownika

Widok **Tokeny API** w profilu korzysta z tych endpointów, które działają dla każdego konta, także SSO, bo nie wymagają hasła:

| Wywołanie | Co robi |
|---|---|
| `GET /api/v2/profile/tokens` | Wyświetla listę Twoich tokenów API, z ich `sid`, `name`, datą utworzenia, wygaśnięcia i ostatniego użycia |
| `POST /api/v2/profile/tokens` | Tworzy token z Twojej sesji; treść zawiera `expiryDays` (liczbę lub `never`) i opcjonalnie `name` |
| `DELETE /api/v2/profile/tokens/{sid}` | Unieważnia jeden z Twoich tokenów |

`POST` odpowiada `403`, gdy zostanie wywołany tokenem API (token nie może utworzyć kolejnego), bez `allowApiTokens` lub gdy
sesja zalogowała się ponad 10 minut temu (kod `sign_in_again`): najpierw zaloguj się ponownie. Czas życia powyżej maksimum daje odpowiedź `400`.

---

## Gdy token wygasa przedwcześnie

Token, długoterminowy lub nie, przestaje działać przed wygaśnięciem, gdy zdarzy się jedna z tych rzeczy:

* **Wylogowanie z jego sesji**: `POST /api/v2/auth/logout` z tym tokenem kończy tokeny tego logowania i tylko te.
  Wylogowanie w przeglądarce nie kończy tokenu skryptu.
* **Zmiana hasła**: użytkownik zmienia swoje hasło albo ustawia je administrator. Każdy wcześniej wydany token jest odrzucany.
* **Użytkownik zostaje usunięty lub zablokowany**: usunięcie lokalnego użytkownika lub zablokowanie użytkownika kończy wszystkie jego tokeny. Administrator może też
  zakończyć sesje użytkownika LDAP lub SSO.

Odrzucony token daje odpowiedź `401`. Zaloguj się ponownie, nowym hasłem, jeśli zostało zmienione.

---

## Skrypty logujące się przy każdym uruchomieniu

Endpointy logowania i tokenów są chronione przed zalewem żądań i odgadywaniem haseł, więc skrypt, który loguje się przy każdym uruchomieniu,
powinien znać te limity:

| Limit | Domyślnie | Co się dzieje |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 żądań na minutę z jednego adresu | Logowanie, wylogowanie, odświeżanie, endpointy SSO, `PUT /api/v2/profile` (zmiana hasła) oraz `POST` lub `DELETE /api/v2/profile/tokens` odpowiadają `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 nieudanych logowań z rzędu | Konto jest blokowane na [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15), każde logowanie odpowiada `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 nieudanych logowań z jednego adresu | Każde logowanie z tego adresu odpowiada `429` aż do końca okna czasowego |

Odpowiedź `429` zawiera nagłówek `Retry-After` z liczbą sekund do odczekania: zatrzymaj się i poczekaj, nie ponawiaj od razu. Zablokowane konto
odrzuca nawet poprawne hasło do końca blokady, więc skrypt z błędnym hasłem blokuje swojego użytkownika dla wszystkich.
Błędne bieżące hasło przy zmianie hasła (`PUT /api/v2/profile`) również liczy się jako nieudane logowanie, a zablokowane konto
nie może zmienić hasła. Udane logowanie zeruje licznik konta, podobnie jak ustawienie hasła przez administratora.

Aby nie trafiać na te limity, zaloguj się raz i używaj tego samego tokenu albo użyj tokenu długoterminowego, zamiast logować się przy
każdym wywołaniu. Za reverse proxy ustaw [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY), aby serwer widział
adres klienta, w przeciwnym razie wszyscy klienci liczą się jako jeden.

---
layout: default
title: Token API
parent: Twój profil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# Token API
{: .no_toc }

Tworzenie tokenu dla skryptów i agentów AI
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kto może go utworzyć

Długotrwały token pozwala skryptom wywoływać API bez twojego hasła. Od wersji 7.3.0 wymaga opcji roli `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Do wersji 7.2.0 wystarczała sama opcja `extendedTokenExpiration`. Rola sprzed wersji 7.3.0, która ustawia tylko tę opcję, otrzymuje
`allowApiTokens`, więc zachowuje swoje tokeny; z obiema można też utworzyć token, który nigdy nie wygasa. Zobacz [Opcje ról](../config/roles.html#role-options).

---

## Tworzenie tokenu

**Nowy token**, w wierszu tytułu **Profil > Tokeny API**, otwiera kreator w trzech krokach:

1. **Szczegóły**: nazwa, po której rozpoznasz token na liście, i czas ważności. Do wyboru jest 30, 90, 180
   lub 365 dni, do [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (domyślnie 90), samo
   to maksimum oraz **Nigdy nie wygasa** przy `extendedTokenExpiration`. Wybierz najkrótszy okres, jakiego potrzebuje twój skrypt.
2. **Potwierdź**: konto lokalne lub LDAP wpisuje hasło, które nie jest zapisywane w tokenie. Konto Microsoft Entra ID lub
   OIDC nie ma tu hasła: jego token powstaje z sesji, w której logowanie musiało nastąpić najwyżej 10 minut
   wcześniej, więc dostawca może najpierw poprosić o ponowne zalogowanie.
3. **Kopiuj**: token, pokazywany **tylko raz**. Skopiuj go przyciskiem **Kopiuj** i chroń go tak jak hasło.

Wysyłaj token w nagłówku `Authorization` każdego wywołania API:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Tokenem API nie można utworzyć kolejnego tokenu. Token konta SSO niesie role z jego ostatniego logowania: zmiana grupy u
dostawcy tożsamości dociera do niego dopiero wtedy, gdy zalogujesz się ponownie i utworzysz nowy token.

---

## Twoje tokeny

Utworzone przez ciebie tokeny są wyświetlane z nazwą oraz datą utworzenia, wygaśnięcia i ostatniego użycia; **Unieważnij** w menu wiersza kończy token.
Administrator widzi je i unieważnia także na twojej stronie w **Ustawienia > Użytkownicy**. Token kończy się po wygaśnięciu lub wcześniej:

- **po unieważnieniu**, z listy;
- **po wylogowaniu tym tokenem** (`POST /api/v2/auth/logout` z tokenem w nagłówku `Authorization`), co kończy go razem
  z sesją, w której został utworzony;
- **po zmianie hasła**, co kończy wszystkie tokeny i sesje twojego konta utworzone przed nią, oraz po zablokowaniu twojego konta.

Token, który nigdy nie wygasa, również kończy się w tych przypadkach. Skrypt może też sam zażądać tokenu przez API logowania i
jego parametr `expiryDays` (`POST /api/v2/auth/login?expiryDays=90` lub `expiryDays=never`); dłuższe `expiryDays` jest skracane
do `API_TOKEN_MAX_DAYS`.

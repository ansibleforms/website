---
layout: default
title: API-Token
parent: Ihr Profil
nav_order: 5
translated_from: d3889d55e63b57c6b78525515638d33617daa750
---

# API-Token
{: .no_toc }

Ein Token für Skripte und KI-Agenten erstellen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wer eines erstellen kann

Ein langlebiges Token lässt Skripte die API ohne Ihr Passwort aufrufen. Ab 7.3.0 braucht es die Rollenoption `allowApiTokens`:

```yaml
roles:
  - name: automation
    groups:
      - local/automation
    options:
      allowApiTokens: true
      extendedTokenExpiration: true   # also tokens that never expire
```

Bis 7.2.0 gab es nur die Option `extendedTokenExpiration`. Eine Rolle aus der Zeit vor 7.3.0, die nur diese Option setzt, erhält
`allowApiTokens`, sodass sie ihre Tokens behält; mit beiden lässt sich auch ein Token erstellen, das nie abläuft. Siehe [Rollenoptionen](../config/roles.html#role-options).

---

## Ein Token erstellen

**Neues Token** in der Titelzeile von **Profil > API-Tokens** öffnet einen Wizard mit drei Schritten:

1. **Details**: ein Name, damit Sie das Token in der Liste wiedererkennen, und wie lange es gültig bleibt. Zur Wahl stehen 30, 90, 180
   oder 365 Tage bis [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) (standardmäßig 90), dieses
   Maximum selbst und, mit `extendedTokenExpiration`, **Läuft nie ab**. Wählen Sie die kürzeste Zeit, die Ihr Skript braucht.
2. **Bestätigen**: Ein lokales oder LDAP-Konto gibt sein Passwort ein, das nicht im Token gespeichert wird. Ein Konto von Microsoft Entra ID oder
   OIDC hat hier kein Passwort: Sein Token wird aus seiner Sitzung erstellt, die sich höchstens 10 Minuten
   vorher angemeldet haben muss, daher kann der Anbieter Sie bitten, sich zuerst erneut anzumelden.
3. **Kopieren**: das Token, **nur einmal** angezeigt. Kopieren Sie es mit **Kopieren** und bewahren Sie es so sicher auf wie ein Passwort.

Senden Sie das Token im Header `Authorization` jedes API-Aufrufs:

```bash
curl -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/job
```

Ein API-Token kann kein weiteres erstellen. Das Token eines SSO-Kontos trägt die Rollen seiner letzten Anmeldung: Eine Gruppenänderung beim
Identitätsanbieter erreicht es erst, wenn Sie sich erneut anmelden und ein neues Token erstellen.

---

## Ihre Tokens

Die Tokens, die Sie erstellt haben, werden mit ihrem Namen aufgelistet und damit, wann jedes erstellt wurde, abläuft und zuletzt verwendet wurde; **Widerrufen** im Menü einer Zeile beendet eines.
Ein Admin sieht und widerruft sie auch auf Ihrer Seite unter **Einstellungen > Benutzer**. Ein Token endet mit seinem Ablauf, oder früher:

- durch **einen Widerruf** aus der Liste;
- durch **eine Abmeldung mit dem Token** (`POST /api/v2/auth/logout` mit dem Token im Header `Authorization`), die es zusammen mit
  der Sitzung beendet, in der es erstellt wurde;
- durch **eine Passwortänderung**, die jedes vorher erstellte Token und jede Sitzung Ihres Kontos beendet, und durch eine Sperrung Ihres Kontos.

Ein Token, das nie abläuft, endet in diesen Fällen trotzdem. Ein Skript kann auch selbst ein Token über die Login-API und
ihren Parameter `expiryDays` anfordern (`POST /api/v2/auth/login?expiryDays=90` oder `expiryDays=never`); ein längeres `expiryDays` wird
auf `API_TOKEN_MAX_DAYS` gekürzt.

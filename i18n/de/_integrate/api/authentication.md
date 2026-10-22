---
layout: default
title: Authentifizierung
parent: REST-API
nav_order: 1
translated_from: 58596f571c415f814cc79306f4f882b3078e962e
---

# Authentifizierung
{: .no_toc }

Anmelden, das Token erneuern oder ein langlebiges Token verwenden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Jeder Aufruf braucht ein Access Token im Header `Authorization`. Ein Token erhält man durch Anmelden, und es wird mit
dem Refresh Token frisch gehalten.

---

## Anmelden

Melden Sie sich mit Basic Authentication an, mit dem Namen und dem Passwort des Benutzers:

```bash
curl -X POST https://af.example.com/api/v2/auth/login -u admin:<password>
```

Die Antwort enthält zwei Tokens, das Access Token und das Refresh Token:

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Die API aufrufen

Senden Sie das Access Token bei jedem Aufruf als Bearer Token:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

---

## Das Token erneuern

Das Access Token läuft ab (`ACCESS_TOKEN_EXPIRATION`, standardmäßig 30 Minuten). Holen Sie mit dem Refresh Token ein neues,
ohne das Passwort:

```bash
curl -X POST https://af.example.com/api/v2/token \
  -H "Content-Type: application/json" -d '{ "refreshtoken": "<refreshtoken>" }'
```

Die Antwort enthält ein neues Paar, im selben Aufbau wie bei der Anmeldung. Ein Refresh Token funktioniert einmal: behalten Sie das neue für die nächste Erneuerung.

```json
{ "token": "eyJ...", "refreshtoken": "eyJ..." }
```

---

## Langlebige Tokens

Ein Skript, das unbeaufsichtigt läuft, kann ein Token verwenden, das länger hält. Ab 7.3.0 braucht es dafür die Rollenoption `allowApiTokens`:

* Erstellen Sie eines unter [Profil > API-Tokens](../profile/api-token.html).
* Oder melden Sie sich mit dem Query-Parameter `expiryDays` an, für ein Token, das so viele Tage gültig ist:

```bash
curl -X POST "https://af.example.com/api/v2/auth/login?expiryDays=90" -u automation:<password>
```

`expiryDays` wird nur aus der URL gelesen, nie aus dem Body. Für einen Benutzer, dessen Rollen `allowApiTokens` fehlt, wird es ignoriert,
und die Anmeldung gibt ein Token mit der üblichen Lebensdauer zurück. `expiryDays=never` braucht zusätzlich `extendedTokenExpiration`. Fügen Sie den Query-Parameter `name`
hinzu (`?expiryDays=90&name=nightly-backup`), um das Token in der Token-Liste des Benutzers zu benennen.

Ein langlebiges Token lebt höchstens [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) Tage, standardmäßig
90: ein längeres `expiryDays` wird darauf gekürzt, sofern es nicht `never` ist. Seine Erneuerung gibt ein gewöhnliches Token zurück, melden Sie sich daher erneut an, wenn es abläuft.

### Tokens des angemeldeten Benutzers

Die Ansicht **API-Tokens** des Profils verwendet diese Endpunkte, die für jedes Konto funktionieren, SSO eingeschlossen, da sie kein Passwort brauchen:

| Aufruf | Was er tut |
|---|---|
| `GET /api/v2/profile/tokens` | Listet Ihre API-Tokens auf, mit ihrer `sid`, `name`, Erstellung, Ablauf und letzten Verwendung |
| `POST /api/v2/profile/tokens` | Erstellt ein Token aus Ihrer Sitzung; der Body enthält `expiryDays` (eine Zahl oder `never`) und optional `name` |
| `DELETE /api/v2/profile/tokens/{sid}` | Widerruft eines Ihrer Tokens |

`POST` antwortet `403`, wenn es mit einem API-Token aufgerufen wird (ein Token kann kein anderes erstellen), ohne `allowApiTokens` oder wenn die
Sitzung sich vor mehr als 10 Minuten angemeldet hat (Code `sign_in_again`): melden Sie sich zuerst erneut an. Eine Lebensdauer über dem Maximum antwortet `400`.

---

## Wenn ein Token vorzeitig endet

Ein Token, langlebig oder nicht, funktioniert vor seinem Ablauf nicht mehr, wenn eines davon eintritt:

* **Eine Abmeldung seiner Sitzung**: `POST /api/v2/auth/logout` mit dem Token beendet die Tokens dieser Anmeldung, und nur diese. Eine
  Abmeldung im Browser beendet nicht das Token eines Skripts.
* **Eine Passwortänderung**: der Benutzer ändert sein Passwort, oder ein Admin setzt es. Jedes zuvor ausgestellte Token wird abgelehnt.
* **Der Benutzer wird entfernt oder gesperrt**: das Löschen eines lokalen Benutzers oder das Sperren eines Benutzers beendet alle seine Tokens. Ein Admin kann auch
  die Sitzungen eines LDAP- oder SSO-Benutzers beenden.

Ein abgelehntes Token antwortet `401`. Melden Sie sich erneut an, mit dem neuen Passwort, falls es sich geändert hat.

---

## Skripte, die sich bei jedem Lauf anmelden

Die Endpunkte für Anmeldung und Tokens sind gegen Überflutung und das Erraten von Passwörtern geschützt, daher sollte ein Skript, das sich bei jedem Lauf anmeldet,
diese Grenzen kennen:

| Grenze | Standard | Was passiert |
|---|---|---|
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | 120 Anfragen pro Minute von einer Adresse | Anmeldung, Abmeldung, Erneuerung, die SSO-Endpunkte, `PUT /api/v2/profile` (Passwortänderung) und `POST` oder `DELETE /api/v2/profile/tokens` antworten `429` |
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | 5 fehlgeschlagene Anmeldungen in Folge | Das Konto wird für [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) (15) gesperrt, jede Anmeldung antwortet `429` |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | 30 fehlgeschlagene Anmeldungen von einer Adresse | Jede Anmeldung von dieser Adresse antwortet `429`, bis das Zeitfenster endet |

Eine `429` trägt einen Header `Retry-After` mit den zu wartenden Sekunden: halten Sie an und warten Sie, versuchen Sie es nicht sofort erneut. Ein gesperrtes Konto
lehnt selbst das richtige Passwort ab, bis die Sperre endet, daher sperrt ein Skript mit falschem Passwort seinen Benutzer für alle aus.
Ein falsches aktuelles Passwort bei einer Passwortänderung (`PUT /api/v2/profile`) zählt ebenfalls als fehlgeschlagene Anmeldung, und ein gesperrtes Konto
kann sein Passwort nicht ändern. Eine erfolgreiche Anmeldung setzt den Zähler des Kontos zurück, ebenso ein Admin, der das Passwort setzt.

Um diese Grenzen zu meiden, melden Sie sich einmal an und verwenden Sie das Token wieder, oder verwenden Sie ein langlebiges Token, statt sich für
jeden Aufruf anzumelden. Hinter einem Reverse Proxy setzen Sie [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY), damit der Server
die Adresse des Clients sieht, sonst zählt jeder Client als einer.

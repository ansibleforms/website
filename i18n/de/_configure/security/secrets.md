---
layout: default
title: Geheimnisse und Verschlüsselung
parent: Sicherheit
nav_order: 3
translated_from: 88f3f3eaac372a4e373c4a49f5935635da47140d
---

# Geheimnisse und Verschlüsselung
{: .no_toc }

Die beiden Hauptgeheimnisse, was sie schützen und wie lange Sitzungen und Token gelten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die beiden Hauptgeheimnisse

Zwei Geheimnisse schützen alles andere. Setzen Sie beide, bevor die Instanz echte Daten enthält, bewahren Sie sie außerhalb der Instanz auf
und ändern Sie sie nie leichtfertig:

| Geheimnis | Was es schützt | Wenn es nicht gesetzt ist | Wenn es verloren geht oder geändert wird |
|--------|------------------|------------------|--------------------------|
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | Jedes in der Datenbank gespeicherte Passwort und Token: Anmeldedaten, das LDAP-Bind-Passwort, Runner-Token, SSO-Client-Secrets, Webhook-Adressen von Slack und Teams, der API-Schlüssel des Chats | Ein Standardschlüssel wird verwendet, der im Quellcode öffentlich ist | Verloren: Jedes gespeicherte Geheimnis muss neu eingegeben werden. Geändert: Ab 7.3.0 wird jedes gespeicherte Geheimnis neu verschlüsselt, siehe [unten](#changing-the-encryption-secret) |
| [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) | Die Signatur von Zugriffs- und Refresh-Token, einschließlich langlebiger [API-Token](../profile/api-token.html) | Bei jedem Start wird ein zufälliges Geheimnis erzeugt, sodass jeder Neustart alle abmeldet | Jede Sitzung und jedes API-Token wird ungültig |

Beide werden beim Start als Warnung `[SECURITY]` protokolliert, solange sie fehlen. Die Einstellungsseiten verweigern ihre Bearbeitung,
die API gibt sie nie zurück, und Backups lassen sie absichtlich weg, sodass ein verlorenes `ENCRYPTION_SECRET` nirgendwo
wiederhergestellt werden kann: Bewahren Sie eine Kopie in Ihrem Secret Manager auf. Das Verschlüsselungsgeheimnis wird als Schlüssel mit 32 Zeichen verwendet; ein kürzerer oder
längerer Wert wird aufgefüllt oder abgeschnitten.

Eine Änderung von `ACCESS_TOKEN_SECRET` beendet sofort jede Sitzung und jedes API-Token. Um die Token eines Benutzers oder einer
Sitzung zu beenden, verwenden Sie die unter [Token](#tokens) beschriebenen Sperren.

---

## Das Verschlüsselungsgeheimnis ändern

Ab 7.3.0 gehen beim Setzen oder Ändern von `ENCRYPTION_SECRET` die gespeicherten Geheimnisse nicht mehr verloren. Beim nächsten Start verschlüsselt der Worker
jedes davon mit dem neuen Schlüssel neu, in einer Datenbanktransaktion, bevor irgendetwas anderes ein Geheimnis schreibt:

| Situation | Was zu setzen ist |
|---|---|
| Die Instanz lief ohne `ENCRYPTION_SECRET`, mit dem öffentlichen Standardschlüssel | Nur `ENCRYPTION_SECRET`: Die Geheimnisse werden vom Standardschlüssel aus neu verschlüsselt |
| Die Instanz lief mit einem eigenen Schlüssel | `ENCRYPTION_SECRET` auf den neuen Schlüssel und [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS) auf den alten, für diesen einen Start |

Wurden die gespeicherten Geheimnisse mit einem Schlüssel verschlüsselt, der keiner von beiden ist, wird nichts geändert, und die App verweigert den Start, bis
`ENCRYPTION_SECRET_PREVIOUS` diesen Schlüssel nennt. Entfernen Sie `ENCRYPTION_SECRET_PREVIOUS`, sobald der Start sie neu verschlüsselt hat, und setzen Sie das
neue `ENCRYPTION_SECRET` auf jedem App-Knoten, dem Worker und jeder RTE im Datenbankmodus, die sich selbst registriert. Diese
Selbstregistrierung (`RTE_REGISTER`) ist in 7.3.0 veraltet: Eine RTE, die im Socket-Modus mit einem Beitrittstoken (`RTE_JOIN_TOKEN`) beitritt,
braucht kein `ENCRYPTION_SECRET`, siehe [RTE-Modi](../rte/modes.html).

---

## Token

Eine Anmeldung gibt ein kurzlebiges Zugriffstoken und ein längeres Refresh-Token zurück, mit dem der Browser ein neues Paar erhält:

* [`ACCESS_TOKEN_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_EXPIRATION) : standardmäßig `30m`. Kürzer
  begrenzt die Nutzung eines abgefangenen Tokens.
* [`ACCESS_TOKEN_REFRESH_EXPIRATION`](../customization/security.html#env_ACCESS_TOKEN_REFRESH_EXPIRATION) : standardmäßig `24h`.
  So lange bleibt ein untätiger Browser angemeldet.
* Die Rollenoption `allowApiTokens` lässt einen Benutzer ein API-Token anfordern, das eine Anzahl von Tagen gültig ist, und
  `extendedTokenExpiration` fügt eines hinzu, das nie abläuft. Gewähren Sie sie nur Rollen, die API-Zugriff aus Skripten brauchen.
  Auf der [Profilseite](../profile/api-token.html) wird ein Token aus einer Browsersitzung erstellt, die sich vor höchstens 10 Minuten angemeldet hat,
  und nie aus einem anderen API-Token. Ein Token, das nie abläuft, lebt 50 Jahre, und die Ereignisse unten beenden es trotzdem.
* [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) : standardmäßig `90`. Die längste Lebensdauer eines
  API-Tokens: Eine längere Anforderung wird darauf gekürzt.

Ein Token ist ein signiertes JWT, aber der Server führt außerdem eine Liste gesperrter Token, die alle App-Knoten teilen, sodass ein Token
vor seinem Ablauf enden kann:

| Ereignis | Was endet |
|-------|-----------|
| Abmelden | Jedes Token dieser Anmeldung: das Zugriffstoken, sein Refresh-Token und ein API-Token, wenn die Abmeldung es verwendet |
| Eine Passwortänderung, durch den Benutzer oder durch einen Admin | Jedes vor der Änderung ausgestellte Token des Benutzers, API-Token eingeschlossen, auf jedem Gerät |
| Der Schalter **Anmeldung erlauben** eines Benutzers ausgeschaltet (lokaler, LDAP- oder SSO-Benutzer) oder ein lokaler Benutzer gelöscht | Jedes Token des Benutzers |
| **Sitzungen beenden** auf der Seite eines LDAP- oder SSO-Benutzers | Jedes Token des Benutzers; er kann sich erneut anmelden, sofern er nicht gesperrt ist |
| **Widerrufen** bei einem API-Token, auf der Profilseite oder im Tab **API-Tokens** des Benutzers | Genau dieses API-Token, sofort |

Ein Skript beendet sein eigenes API-Token, indem es sich damit abmeldet: `POST /api/v2/auth/logout` mit dem Token im
Header `Authorization`.

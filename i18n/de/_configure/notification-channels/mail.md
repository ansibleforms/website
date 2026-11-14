---
layout: default
title: Mail
parent: Benachrichtigungskanäle
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
---

# Mail
{: .no_toc }

Mailserver, der Standardserver und wie sie sich anmelden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Der Mail-Kanal

Ein Mail-Kanal ist der Server, über den die App ihre Mails sendet: ein SMTP-Server oder ab 7.6.0 Microsoft 365. Sie können mehrere
haben; der mit **Standard** markierte ist der Server, über den die App ihre Mails sendet, wenn ein Formular keinen Mail-Kanal nennt:

| Schritt | Feld | Bedeutung |
|---|---|---|
| Anmeldedaten | Anmeldedaten-Eintrag | Ein **smtp**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html) (der Mailserver, sein Port und TLS und die Anmeldung) oder ein **Microsoft Entra ID**-Eintrag, um über [Microsoft 365](microsoft-365.html) zu senden. Ab 7.6.0 optional: Ohne Eintrag sendet der Kanal über seinen eigenen Mailserver, siehe unten. |
| Anmeldedaten | Mail-Server, Mail-Port, TLS verwenden | Nur ohne Anmeldedaten: der Server, über den der Kanal ohne Anmeldung sendet (ein Relay). **Mail-Server** ist dann erforderlich. |
| Anmeldedaten | Senden über | Nur mit einem Microsoft Entra ID-Eintrag: **Microsoft Graph** (der Standard) oder **SMTP (OAuth2)**, siehe [Microsoft 365](microsoft-365.html). |
| Absender | Mail-Absender | Die Absenderadresse, die Empfänger sehen. Bei Microsoft 365 das Postfach, als das die Mail gesendet wird. |

---

## Ein Relay ohne Anmeldung

Ein Mailserver, der Mails ohne Anmeldung annimmt (ein Relay), lässt sich auf zwei Arten nutzen, beide senden ohne Authentifizierung:

- **Ein smtp-Eintrag nur mit seinem Server**: Seine Felder **Benutzer (optional)** und **Passwort (optional)** bleiben leer.
- **Keine Anmeldedaten** (ab 7.6.0): Der Schritt **Anmeldedaten** fragt den eigenen **Mail-Server**, **Mail-Port** und **TLS verwenden** des Kanals ab.

Ein Kanal, der Anmeldedaten mit eigenem Server nennt, vergisst einen zuvor am Kanal eingegebenen Server.

---

## Der Standardkanal

Der erste Mail-Kanal wird zum Standard, und **Als Standard festlegen** im Zeilenmenü verschiebt das auf einen anderen. Der Schalter
**Standard** im Tab **Details** der Seite eines Mail-Kanals tut dasselbe.

Ab 7.6.0 sendet die App überhaupt keine Mails, solange kein Mail-Kanal der Standard ist oder solange der Standardkanal ausgeschaltet
ist. Zuvor griff sie auf die Mail-Einstellungen der Einstellungsseite oder des Config-Seeds zurück. Das Upgrade auf 7.6.0 macht aus
diesen Einstellungen den Standard-Mail-Kanal `default`, wenn noch kein Mail-Kanal aktiv war: Mit einer Anmeldung nennt er neue
smtp-Anmeldedaten `mail-login`, für ein Relay hat er seinen eigenen Server und keine Anmeldedaten. Deklarieren Sie im
[Config-Seed](../seed/) einen Mail-Kanal unter `notification_channels:` (siehe [Beispiel](../seed/example.html)): Die alten
`mail_*`-Schlüssel unter `settings:` funktionieren weiterhin, sind aber veraltet.

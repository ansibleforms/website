---
layout: default
title: Mail
parent: Benachrichtigungskanäle
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Mail
{: .no_toc }

SMTP-Server, der Standardserver und ihre Anmeldung
{: .fs-6 .fw-300 }

Ein Mail-Kanal ist ein SMTP-Server. Sie können mehrere haben; der mit **Standard** markierte ist der Server, über den die App ihre
Mails sendet, wenn ein Formular keinen Mail-Kanal nennt. Der erste Mail-Kanal wird zum Standard, und **Als Standard festlegen** verschiebt das.

| Schritt | Feld | Bedeutung |
|---|---|---|
| Anmeldedaten | Anmeldedaten-Eintrag | Erforderlich. Ein **smtp**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html): der Mailserver, sein Port und TLS und die Anmeldung. Für ein Relay ohne Anmeldung ein smtp-Eintrag ohne Benutzer. |
| Absender | Mail-Absender | Die Absenderadresse, die Empfänger sehen. |

Der Schalter **Standard** im Tab **Details** der Seite eines Mail-Kanals macht ihn zum Standard, wie **Als Standard festlegen**.
Die Mail-Einstellungen des Config-Seeds werden verwendet, solange kein Mail-Kanal der Standard ist oder solange der Standardkanal ausgeschaltet ist.

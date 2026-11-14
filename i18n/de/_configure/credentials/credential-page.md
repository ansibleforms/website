---
layout: default
title: "Die Seite eines Anmeldedaten-Eintrags"
parent: Anmeldedaten
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
---

# Die Seite eines Anmeldedaten-Eintrags
{: .no_toc }

Die Tabs eines Eintrags und was ihn verwendet
{: .fs-6 .fw-300 }

Die Seite eines Anmeldedaten-Eintrags zeigt die Schritte seines Dialogs als Tabs, dazu was ihn verwendet:

| Tab | Was er enthält |
|---|---|
| Details | Name und Beschreibung. |
| Typ | Wofür die Anmeldedaten sind. |
| Anmeldung | Jedes Feld seines Typs, wie im Schritt **Anmeldung** des Dialogs: der Benutzer, das Passwort und wo er sich anmeldet (Host und Port, die Datenbank, der Mail-Server, die Server des Verzeichnisses, der Tenant oder Issuer, die Adresse des Servers und sein TLS). Bei CyberArk-Anmeldedaten AppID, Client-Zertifikat und Schlüssel. Ab 7.6.0 die Auswahl, wie er sich anmeldet, und bei SSH-Anmeldedaten privater Schlüssel und Passphrase. |
| Speicher | Datenbank oder Secret Store sowie der Store und die Referenz. Nicht für CyberArk und HashiCorp Vault. |
| Verwendet von | Alles, was diese Anmeldedaten nennt: Secret Stores, Benachrichtigungskanäle, Repositories, LDAP-Verzeichnisse, SSO-Anbieter, Runner, [Datenbanken](../databases.html) (ab 7.5.0), der Chat-Assistent, Formulare und die Workflows des Designers. Eine Zeile öffnet das Element. |

Das Passwort wird im Tab **Anmeldung** eingegeben und nach dem Speichern nie wieder angezeigt: Leer gelassen bleibt das gespeicherte erhalten.
Dasselbe gilt für den Client-Schlüssel von CyberArk-Anmeldedaten und ab 7.6.0 für den privaten Schlüssel und die Passphrase von
SSH-Anmeldedaten.

Ab 7.6.0 gilt das nur, solange die Anmeldeart gleich bleibt. Geändert (SSH **Privater Schlüssel** auf **Passwort** und zurück, SMTP
**Keine Anmeldung** auf **Anmeldung**, Entra ID **Zertifikat** auf **Geheimnis** und zurück, **Token** auf **Passwort** und zurück), passt
nichts Gespeichertes mehr: Das neue Geheimnis ist erforderlich, und **Speichern** verlangt es. SSH-Anmeldedaten, die auf **Passwort** geändert
werden, verwerfen beim **Speichern** den gespeicherten privaten Schlüssel und die Passphrase, wie der Tab unter der Auswahl sagt. Mit **In einen
Schlüssel schreiben** im Tab **Speicher** gibt es nur die Auswahlen mit Passwort, siehe [Wie sich Anmeldedaten anmelden](types.html#how-a-credential-signs-in).

Oben rechts befinden sich **Verbindung testen** (nur bei Datenbank-Anmeldedaten), **Löschen** und **Speichern**.

Ab 7.3.0 werden **Löschen** und ein neuer Name abgewiesen, solange **Verwendet von** etwas auflistet, siehe [Verwendete Anmeldedaten](../credentials.html#credentials-in-use).

Im [Config-Seed](../seed/) deklarierte Anmeldedaten sind auf dieser Seite schreibgeschützt: Ändern Sie sie stattdessen in der Seed-Datei.

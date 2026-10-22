---
layout: default
title: "Die Seite eines Anmeldedaten-Eintrags"
parent: Anmeldedaten
nav_order: 3
translated_from: 0269b5c0d313622bea6c910b96231f41ffd852d7
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
| Anmeldung | Jedes Feld seines Typs, wie im Schritt **Anmeldung** des Dialogs: der Benutzer, das Passwort und wo er sich anmeldet (Host und Port, die Datenbank, der Mail-Server, die Server des Verzeichnisses, der Tenant oder Issuer, die Adresse des Servers und sein TLS). Bei CyberArk-Anmeldedaten AppID, Client-Zertifikat und Schlüssel. |
| Speicher | Datenbank oder Secret Store sowie der Store und die Referenz. Nicht für CyberArk und HashiCorp Vault. |
| Verwendet von | Alles, was diese Anmeldedaten nennt: Secret Stores, Benachrichtigungskanäle, Repositories, LDAP-Verzeichnisse, SSO-Anbieter, Runner, der Chat-Assistent, Formulare und die Workflows des Designers. Eine Zeile öffnet das Element. |

Das Passwort wird im Tab **Anmeldung** eingegeben und nach dem Speichern nie wieder angezeigt: Leer gelassen bleibt das gespeicherte erhalten. Bei CyberArk-Anmeldedaten
lassen Sie den Client-Schlüssel leer, um den gespeicherten zu behalten. Oben rechts befinden sich **Verbindung testen** (nur bei Datenbank-Anmeldedaten),
**Löschen** und **Speichern**.

Ab 7.3.0 werden **Löschen** und ein neuer Name abgewiesen, solange **Verwendet von** etwas auflistet, siehe [Verwendete Anmeldedaten](../credentials.html#credentials-in-use).

Im [Config-Seed](../seed/) deklarierte Anmeldedaten sind auf dieser Seite schreibgeschützt: Ändern Sie sie stattdessen in der Seed-Datei.

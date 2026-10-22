---
layout: default
title: Sicherheitsmaßnahmen
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Sicherheitsmaßnahmen
{: .no_toc }

Wie Anmeldung, Berechtigungen, Secrets und Verbindungen geschützt sind
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wo es läuft

AnsibleForms ist selbst gehostet, auf Ihrer Infrastruktur, mit seinen Daten in einer Datenbank, die Sie betreiben.

* Es gibt keinen AnsibleForms-Cloud-Dienst und keinen Lizenzserver, und keine Telemetrie oder Update-Prüfung.
* Die Oberfläche wird von der Anwendung selbst ausgeliefert und lädt nichts von einer anderen Website.
* Die Anwendung verbindet sich nur mit den Systemen, die ein Administrator konfiguriert, aufgeführt unter [Ausgehende Verbindungen](#outbound-connections).

Die Bestandteile und was jeder enthält:

| Bestandteil | Was er macht | Was er enthält |
|---|---|---|
| Anwendung | Die Weboberfläche, die REST-API, der Scheduler | Keine eigenen Daten: Alles liegt in der Datenbank |
| MySQL oder MariaDB | Die Datenbank der Anwendung | Benutzer, Gruppen, Zugangsdaten (verschlüsselt), Jobs mit ihren Extravars und ihrer Ausgabe, das Audit-Protokoll |
| Laufzeitumgebung (RTE) | Führt die Playbooks aus, in einem eigenen Container | Die Dateien der Jobs, die sie ausführt, und die Secrets eines Jobs nur, solange dieser Job läuft |
| Persistenter Ordner | Die Konfiguration, Formulare, Playbooks und Uploads | Die Dateien, die die Formulare und Playbooks verwenden |

Siehe [Wie es funktioniert](../how-it-works.html) für das Gesamtbild und [RTE](../rte/) für die Laufzeitumgebung.

---

## Anmeldung

Jede Seite und jeder API-Aufruf, der Daten liest oder ändert, braucht einen angemeldeten Benutzer. Die wenigen Endpunkte, die ohne Anmeldung offen sind, bedienen die
Anmeldung selbst, die Version, Name und Logo der Instanz, die API-Dokumentation und die Datenbankeinrichtung beim ersten Start,
die [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` schließt:

| Methode | Wie sie funktioniert |
|---|---|
| Lokale Konten | Passwörter mit bcrypt gehasht, eine [Mindestlänge](../security/hardening.html#sign-in-limits-and-passwords), und das öffentliche Standardpasswort des Admins muss bei der ersten Anmeldung geändert werden |
| LDAP / Active Directory | Das Verzeichnis prüft das Passwort, und seine Gruppen werden Rollen zugeordnet. Siehe [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Single Sign-on über Ihren Identitätsanbieter, der auch seine eigene Multi-Faktor-Authentifizierung mitbringt. Siehe [Authentifizierung](../authentication/) |

* Fehlgeschlagene Anmeldungen [sperren das Konto](../security/hardening.html#sign-in-limits-and-passwords), und die Anmeldung ist ratenbegrenzt.
* Eine Anmeldung liefert ein signiertes Access-Token, 30 Minuten gültig, und ein Refresh-Token, 24 Stunden gültig.
* Tokens lassen sich vor ihrem Ablauf beenden: Abmelden, eine Passwortänderung, ein gesperrter Benutzer und ein widerrufenes API-Token beenden sie auf
  allen Knoten gleichzeitig, siehe [Tokens](../security/secrets.html#tokens).
* AnsibleForms hat keine eigene Multi-Faktor-Authentifizierung: Verwenden Sie Single Sign-on, wo sie erforderlich ist.

---

## Berechtigungen

Was ein Benutzer tun darf, ergibt sich aus den Rollen seiner Gruppen und wird vom Server bei jeder Anfrage geprüft:

* Rollen werden in [config.yaml](../config/roles.html) definiert: welche Formulare ein Benutzer sieht und welche Optionen er hat,
  etwa den Designer, die Einstellungsseiten oder die Jobs anderer Benutzer.
* Der Server prüft jeden Start gegen die Regeln des Formulars (seine Felder, ihre Werte und den Zugriff des Benutzers), einschließlich
  Starts über die REST-API, siehe [Start-Validierung](../launch-validation/).
* Die Admin-Rolle führt bewusst jedes Playbook aus. Andere Rollen erhalten nur, was gewährt wird: Ein Benutzer mit mehreren Rollen erhält eine
  Option nur, wenn keine dieser Rollen sie verweigert, sodass eine einzige restriktive Rolle genügt, um sie vorzuenthalten.

---

## Gespeicherte Secrets

Passwörter, Tokens und Schlüssel werden verschlüsselt, bevor sie in die Datenbank geschrieben werden:

* Jedes gespeicherte Secret, also Zugangsdaten, das LDAP-Bind-Passwort, Runner-Tokens, Client-Secrets für Single Sign-on, Webhook-Adressen
  und API-Schlüssel, wird mit AES-256 und einem zufälligen Initialisierungsvektor pro Wert verschlüsselt, unter dem
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets), das Sie setzen.
* Kein API-Aufruf und keine Einstellungsseite zeigt ein gespeichertes Secret, und Backups lassen die Hauptschlüssel weg.
* Secrets können in Ihrem Vault bleiben: [HashiCorp Vault und CyberArk](../secret-stores/) werden gelesen, wenn ein Job sie braucht.
* Die Secrets eines Jobs erreichen die Laufzeitumgebung mit AES-256-GCM versiegelt, unter einem aus ihrem Token abgeleiteten Schlüssel.
* Extravars, deren Name nach einem Secret aussieht, werden in der Jobansicht maskiert, Passwortfelder immer, siehe [Jobdaten](../security/hardening.html#job-data).

Der Rest der Datenbank, also Jobs, ihre Extravars und ihre Ausgabe, wird so gespeichert, wie er ist: Schützen Sie ihn mit der eigenen
Verschlüsselung im Ruhezustand und der Zugriffskontrolle der Datenbank, siehe [Die Datenbank](../security/hardening.html#the-database).

---

## Audit-Trail

Jede Änderung und jeder abgelehnte Versuch wird aufgezeichnet:

* Jedes Erstellen, Ändern und Löschen, über die Oberfläche oder die API, wird mit dem Benutzer, seiner
  Adresse, der Aktion, dem Objekt und dem Ergebnis ins Audit-Protokoll geschrieben. Ablehnungen und Anmeldungen werden ebenfalls aufgezeichnet, fehlgeschlagene eingeschlossen.
* Werte, die nach Secrets aussehen, werden vor dem Schreiben geschwärzt.
* Das Protokoll wird standardmäßig 365 Tage aufbewahrt und kann über UDP, TCP oder TLS an Syslog kopiert werden.

---

## Im Browser

Die Oberfläche ist gegen in eine Seite eingeschleusten Code geschützt:

* Eine [Content-Security-Policy](../security/hardening.html#the-content-security-policy) erlaubt nur die eigenen Skripte und Frames der Anwendung.
* Jede Antwort trägt Schutz-Header: nosniff, Frame-Schutz und HSTS über HTTPS.
* Das HTML von Formularen, Hilfetexten und Chat-Antworten wird bereinigt, und die Jobausgabe wird maskiert.

---

## Auf dem Server

Der Code, der Benutzereingaben verarbeitet, vermeidet die klassischen Injections:

* Datenbankabfragen übergeben ihre Werte als Parameter, nie als in die Abfrage geklebten Text.
* Befehle, git eingeschlossen, laufen aus einer Argumentliste, nie über eine Shell, sodass Shell-Zeichen nichts bewirken.
* Serverausdrücke durchlaufen einen [Sanitizer für Ausdrücke](../security/hardening.html#expressions-and-outbound-calls) und ihre REST-Aufrufe einen Hostfilter.
* Der [MCP-Server](../mcp/), der [Chat-Assistent](../chat/) und der Metrics-Endpunkt sind aus, bis Sie sie einschalten.

---

## Verbindungen

Der Datenverkehr zu und von AnsibleForms lässt sich durchgehend verschlüsseln:

* Die Anwendung stellt [HTTPS](../security/https.html) selbst bereit oder steht hinter Ihrem Reverse Proxy.
* Eine Laufzeitumgebung spricht mit der Anwendung über einen WebSocket, `wss://` mit einer HTTPS-Adresse, und die Anwendung
  pinnt das Zertifikat einer eingehenden, siehe [RTE-Modi](../rte/modes.html).
* LDAP, Single Sign-on, die Runner, git, die Secret Stores und die REST-Aufrufe von Ausdrücken prüfen das Zertifikat des
  Servers, den sie erreichen, sofern ein Administrator die Prüfung für einen Server mit selbstsigniertem Zertifikat nicht abschaltet.

### Ausgehende Verbindungen

AnsibleForms verbindet sich nur mit dem, was ein Administrator konfiguriert:

| Verbindung | Wann |
|---|---|
| LDAP, OpenID Connect, Entra ID (Microsoft-Anmeldung und Graph) | Wenn diese Anmeldemethode eingerichtet ist |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Wenn ein Formular auf diesem Runner läuft |
| Git-Server | Wenn ein Repository eingerichtet ist |
| Mailserver, Slack, Teams, Telegram, Webhooks | Wenn ein Benachrichtigungskanal eingerichtet ist |
| HashiCorp Vault, CyberArk | Wenn ein Secret Store eingerichtet ist |
| Ein Modellanbieter (Anthropic, OpenAI und andere) | Nur mit eingeschaltetem [Chat-Assistenten](../chat/), der standardmäßig aus ist |
| In Formularen genannte Hosts und APIs | Wenn die Ausdrücke eines Formulars oder ein Playbook sie aufrufen |
| Syslog-Server | Wenn die Weiterleitung von Audit oder Protokollen eingerichtet ist |

---

## Die Container

Die Images sind so gebaut, dass sie mit so wenig Rechten wie möglich laufen:

* Die Anwendung und die Laufzeitumgebung laufen als unprivilegierter Benutzer `node`, nicht als root.
* Sie basieren auf schlanken, per Digest fixierten Debian-Images, siehe [Sichere Entwicklung](development.html#code-analysis-and-dependencies).
* Die Anwendung lauscht auf einem Port, 8000.

Für die Schritte, die eine neue Instanz absichern, folgen Sie der [Härtung](../security/hardening.html).

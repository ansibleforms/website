---
layout: default
title: FAQ zur Bewertung
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# FAQ zur Bewertung
{: .no_toc }

Kurze Antworten auf die Fragen, die Sicherheitsfragebögen am häufigsten stellen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Daten und Hosting

Wo die Daten liegen und wer darauf zugreifen kann:

| Frage | Antwort |
|---|---|
| Wo werden unsere Daten gespeichert? | In der MySQL- oder MariaDB-Datenbank, die Sie betreiben, und im persistenten Ordner Ihrer Instanz. AnsibleForms ist selbst gehostet, ohne Cloud-Dienst dahinter. |
| Sendet es Daten an seine Entwickler? | Nein. Es gibt keine Telemetrie, keine Nutzungsberichte und keine Update-Prüfung. |
| Womit verbindet es sich? | Nur mit den Systemen, die ein Administrator konfiguriert: siehe [Ausgehende Verbindungen](measures.html#outbound-connections). |
| Verwendet es KI oder sendet es Daten an einen Modellanbieter? | Nur mit eingeschaltetem [Chat-Assistenten](../chat/), der standardmäßig aus ist. Dann sendet es Formulardefinitionen und die gerade eingegebenen Werte an den Anbieter, den Sie konfigurieren. |
| Kann es ohne Internetzugang laufen? | Ja. Die Anwendung braucht keinen Internetzugang; die Playbooks brauchen, was ihre Tasks erreichen. |

---

## Verschlüsselung

Was verschlüsselt wird und mit welchen Schlüsseln:

| Frage | Antwort |
|---|---|
| Werden Daten bei der Übertragung verschlüsselt? | Mit [HTTPS](../security/https.html), bereitgestellt von der Anwendung oder Ihrem Reverse Proxy, und `wss://` zwischen der Anwendung und ihren Laufzeitumgebungen. |
| Werden Daten im Ruhezustand verschlüsselt? | Jedes gespeicherte Secret wird von der Anwendung mit AES-256 verschlüsselt. Jobs und ihre Ausgabe werden so gespeichert, wie sie sind: Verwenden Sie die Verschlüsselung im Ruhezustand der Datenbank selbst. Siehe [Gespeicherte Secrets](measures.html#stored-secrets). |
| Wer hält die Schlüssel? | Sie: Das [`ENCRYPTION_SECRET`](../security/secrets.html) setzen Sie selbst, es bleibt aus Backups heraus und kann rotiert werden. |
| Können Secrets in unserem Vault bleiben? | Ja: [HashiCorp Vault und CyberArk](../secret-stores/) werden gelesen, wenn ein Job sie braucht. |

---

## Zugriff und Nachvollziehbarkeit

Wer sich anmelden kann, was er tun kann und was aufgezeichnet wird:

| Frage | Antwort |
|---|---|
| Unterstützt es Single Sign-on? | Ja: LDAP / Active Directory, OpenID Connect und Entra ID. Siehe [Authentifizierung](../authentication/). |
| Unterstützt es Multi-Faktor-Authentifizierung? | Über Single Sign-on: Die MFA Ihres Identitätsanbieters gilt. Lokale Konten haben keine eigene. |
| Wie werden Berechtigungen verwaltet? | Mit Rollen, die Gruppen zugeordnet sind und vom Server bei jeder Anfrage geprüft werden. Siehe [Berechtigungen](measures.html#permissions). |
| Gibt es ein Audit-Protokoll? | Ja: jede Änderung und jeder abgelehnte Versuch, standardmäßig 365 Tage aufbewahrt und an Syslog weiterleitbar. Siehe [Audit-Trail](measures.html#audit-trail). |
| Gibt es ein Standardpasswort? | Das erste Admin-Konto hat ein öffentliches Standardpasswort, das bei der ersten Anmeldung geändert werden muss. Siehe [Das Admin-Konto](../security/hardening.html#the-admin-account). |

---

## Schwachstellen und Updates

Wie Probleme gefunden, behoben und angekündigt werden:

| Frage | Antwort |
|---|---|
| Wurden Schwachstellen gefunden? | Ja. Jede veröffentlichte steht in [Security Advisories](advisories.html), mit der Version, die sie behoben hat. |
| Wie melden wir eine? | Vertraulich, über GitHub: siehe [Eine Schwachstelle melden](reporting.html). |
| Wie wird der Code geprüft? | Statische Analyse mit CodeQL und Dependency Review bei jedem Pull Request, automatisierte Tests und Updates durch Dependabot. Siehe [Sichere Entwicklung](development.html). |
| Welche Versionen erhalten Sicherheitskorrekturen? | 7.x und 6.5.x. Siehe [Unterstützte Versionen](development.html#supported-versions). |
| Wie erfahren wir von einem neuen Advisory? | Beobachten Sie die Security Alerts des Repositorys auf GitHub. Siehe [Über neue Advisories informiert werden](advisories.html#being-told-of-new-advisories). |
| Wurde ein Penetrationstest durchgeführt? | Es ist kein Bericht eines externen Penetrationstests veröffentlicht. Der Code ist öffentlich, sodass Ihr eigenes Team oder Ihr Tester ihn bewerten kann, und Befunde werden wie oben gemeldet. |

---

## Images und Lieferkette

Woher die Images kommen und wie man sie prüft:

| Frage | Antwort |
|---|---|
| Wo werden die Images veröffentlicht? | In der GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, gebaut von öffentlichen GitHub-Actions-Workflows. Siehe [Releases und Images](development.html#releases-and-images). |
| Laufen die Container als root? | Nein: als unprivilegierter Benutzer `node`. |
| Sind die Images signiert? | Noch nicht. Ziehen Sie sie per Digest (`@sha256:...`), um sicherzugehen, dass Sie das geprüfte Image ausführen. |
| Gibt es eine SBOM? | Mit den Images wird noch keine veröffentlicht. Ein Scanner wie Trivy oder Syft erstellt eine aus dem Image. |
| Werden die Images auf Schwachstellen gescannt? | Nicht in der Release-Pipeline. Ihre Basis-Images sind per Digest fixiert und werden von Dependabot aktuell gehalten; scannen Sie die Images in Ihrer eigenen Registry, um Ihre eigene Richtlinie anzuwenden. |
| Unter welcher Lizenz steht es? | GPL-3.0, Open Source, ohne Gewährleistung. |

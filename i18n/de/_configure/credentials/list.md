---
layout: default
title: Die Seite Anmeldedaten
parent: Anmeldedaten
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# Die Seite Anmeldedaten
{: .no_toc }

Die Liste der Anmeldedaten und der Dialog, der einen Eintrag hinzufügt
{: .fs-6 .fw-300 }

Die Seite unter **Verbindungen > Anmeldedaten** listet alle Anmeldedaten mit **Name**, **Typ**, **Beschreibung** und **Verwendet von** auf, der
Anzahl der Datensätze, Formulare und Workflows, die sie nennen (siehe [Verwendete Anmeldedaten](../credentials.html#credentials-in-use)).

**Anmeldedaten hinzufügen** öffnet einen Dialog in Schritten:

| Schritt | Felder |
|---|---|
| Anmeldedaten | Name und Beschreibung, beide erforderlich. |
| Typ | Einer von 18 Typen, siehe unten. |
| Anmeldung | Womit und wo sich der Typ anmeldet, siehe unten. |
| Speicher | Wo Benutzer und Passwort gespeichert werden: **Datenbank** (verschlüsselt in der AnsibleForms-Datenbank) oder **Secret Store**, mit dem Store und der **Referenz** darin. Nicht für CyberArk und HashiCorp Vault, mit denen sich ein Secret Store anmeldet. |

Der Schritt **Typ** listet die Typen nach Namen auf: AAP, API, Ascender, AWX, CyberArk, Datenbank, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH sowie Benutzer und Passwort (siehe [Typen von Anmeldedaten](types.html)).

Der Schritt **Anmeldung** enthält jedes Feld des Typs, die Adresse eingeschlossen; es gibt keinen eigenen Verbindungsschritt:

| Typen | Felder des Schritts Anmeldung |
|---|---|
| Jeder Typ außer CyberArk | Das Passwort oder was dafür steht: das Bind-Passwort bei LDAP, das Client-Secret bei Entra ID und Open ID, das Token bei HashiCorp Vault, das RTE-Token, das API-Token bei Semaphore, Rundeck und Jenkins, ein Token oder Passwort bei AWX, AAP und Ascender |
| Jeder Typ außer HashiCorp Vault, RTE, Semaphore und Rundeck | Der Benutzer: die AppID bei CyberArk, der Bind-DN bei LDAP, die Client-ID bei Entra ID und Open ID, optional bei AWX, AAP und Ascender |
| SSH, Datenbank | **Host** und **Port**; bei einer Datenbank außerdem **Datenbanktyp** und **Datenbank** |
| SMTP | **Mail-Server** (erforderlich), sein **Port** und **TLS verwenden** |
| LDAP | Die **Server** des Verzeichnisses (erforderlich), sein **Port** und **TLS aktivieren**; mit TLS **Zertifikate ignorieren**, das **CA-Bundle** und ein **Client-Zertifikat** |
| Microsoft Entra ID | **Tenant-ID** (erforderlich) und **Umleitungs-URI** |
| Open ID | **Issuer** (erforderlich) und **Umleitungs-URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, die Adresse, bei der er sich anmeldet, erforderlich, mit **Zertifikatsprüfung überspringen** und dem **CA-Bundle** |
| CyberArk | **Client-Zertifikat** und **Client-Schlüssel** |

Eine Zeile öffnet die eigene Seite des Eintrags. Ihr Menü bietet **Bearbeiten**, **Verbindung testen** (nur bei Datenbank-Anmeldedaten) und **Löschen**. Das
Passwort wird auf der Seite des Eintrags geändert, in seinem Tab **Anmeldung**.

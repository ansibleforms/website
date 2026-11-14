---
layout: default
title: Die Seite Anmeldedaten
parent: Anmeldedaten
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
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
| Speicher | Wo Benutzer und Passwort gespeichert werden: **Datenbank** (verschlüsselt in der AnsibleForms-Datenbank) oder **Secret Store**. Unter **Secret Store** liest **Auf einen Schlüssel verweisen** ein Secret, das schon im Store liegt, und **In einen Schlüssel schreiben** schreibt die im Schritt **Anmeldung** eingegebenen Benutzer und Passwort beim **Speichern** in den Store. Wählen Sie dann den Store und füllen Sie die **Referenz** aus; ihr Beispiel folgt dem Store: ein HashiCorp-Vault-Pfad oder ein CyberArk-Konto. Nicht für CyberArk und HashiCorp Vault, mit denen sich ein Secret Store anmeldet. |
| Anmeldung | Womit und wo sich der Typ anmeldet, siehe unten. |

Der Schritt **Typ** listet die Typen nach Namen auf: AAP, API, Ascender, AWX, CyberArk, Datenbank, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH sowie Benutzer und Passwort (siehe [Typen von Anmeldedaten](types.html)).

Der Schritt **Anmeldung** enthält jedes Feld des Typs, die Adresse eingeschlossen; es gibt keinen eigenen Verbindungsschritt. Ab 7.6.0 fragen
einige Typen zuerst, wie sie sich anmelden, und zeigen dann nur das Nötige (siehe [Wie sich Anmeldedaten anmelden](types.html#how-a-credential-signs-in)):

| Typen | Felder des Schritts Anmeldung |
|---|---|
| Jeder Typ außer CyberArk | Das Passwort oder was dafür steht: das **Passwort** bei LDAP (sein Bind-Passwort), das **Client-Secret** bei Entra ID und Open ID, das **Token** bei HashiCorp Vault und RTE, das **API-Token** bei Semaphore, Rundeck und Jenkins, **Token** oder **Passwort** bei AWX, AAP, Ascender und Git. Keines bei einem privaten SSH-Schlüssel, einem SMTP-Relay oder einem Entra-ID-Zertifikat |
| Jeder Typ außer HashiCorp Vault, RTE, Semaphore und Rundeck | Der Benutzer: die AppID bei CyberArk, der Bind-DN bei LDAP, die Client-ID bei Entra ID und Open ID. Keiner mit **Token** (AWX, AAP, Ascender, Git) oder **Keine Anmeldung** (SMTP) |
| SSH, Datenbank | **Host** und **Port**; bei einer Datenbank außerdem ihre **Engine** und **Datenbank** |
| SSH | Ab 7.6.0 **Anmelden mit**: **Passwort**, oder **Privater Schlüssel** mit dem **Privater Schlüssel** und seiner optionalen **Passphrase** |
| AWX, AAP, Ascender, Git | Ab 7.6.0 **Anmelden mit**: **Token** (kein Benutzer) oder **Passwort** (ein Benutzer und sein Passwort) |
| Benutzer und Passwort, API | Ab 7.6.0 zeigt der Schalter **Host und Port hinzufügen** nach dem Passwort einen optionalen **Host** und **Port** |
| SMTP | **Mail-Server** (erforderlich), **Mail-Port** und **TLS verwenden**; ab 7.6.0 **Anmelden mit**: **Keine Anmeldung** (ein Relay) oder **Anmeldung** (ein Benutzer und sein Passwort) |
| LDAP | Die **Server** des Verzeichnisses (erforderlich), sein **Port** und **TLS aktivieren**; mit TLS **Zertifikate ignorieren**, das **CA-Bundle** und ein **Client-Zertifikat** |
| Microsoft Entra ID | **Tenant-ID** (erforderlich) und **Umleitungs-URI**; ab 7.6.0 **Anmelden mit**: **Geheimnis** (das **Client-Secret**) oder **Zertifikat** (ein **Zertifikat** und sein privater Schlüssel, nur Mail) |
| Open ID | **Issuer** (erforderlich) und **Umleitungs-URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, die Adresse, bei der er sich anmeldet, erforderlich, mit **Zertifikatsprüfung überspringen** und dem **CA-Bundle** |
| CyberArk | **Client-Zertifikat** und **Client-Schlüssel** |

Mit **Auf einen Schlüssel verweisen** werden Benutzer und Passwort nicht abgefragt: Der Store liefert sie. Der Schritt **Anmeldung** behält dann nur die Adressfelder des Typs (SSH, Datenbank, Mail- und Verzeichnisserver, eine Serveradresse, ab 7.6.0 der optionale Host und Port von Benutzer und Passwort und API), und eine Git-Anmeldung hat gar keinen Schritt **Anmeldung**: Sie wird im Schritt **Speicher** gespeichert.

Mit **In einen Schlüssel schreiben** (ab 7.6.0) fragt der Schritt **Anmeldung** Benutzer und Passwort ab und bietet nur die Anmeldearten mit Passwort an (siehe
[Wie sich Anmeldedaten anmelden](types.html#how-a-credential-signs-in)), und **Speichern** schreibt sie an der **Referenz** in den Store; AnsibleForms behält nur Store und Referenz. Angeboten werden nur Stores, die Schreiben erlauben, und **Secret Store hinzufügen** legt einen mit bereits eingeschaltetem Schreiben an. Ein Schlüssel, der schon ein Secret enthält, wird nur ersetzt, wenn **Ein vorhandenes Geheimnis überschreiben** angehakt ist, siehe [Anmeldedaten schreiben](../secret-stores/#writing-credentials).

Eine Zeile öffnet die eigene Seite des Eintrags. Ihr Menü bietet **Bearbeiten**, **Verbindung testen** (nur bei Datenbank-Anmeldedaten) und **Löschen**. Das
Passwort wird auf der Seite des Eintrags geändert, in seinem Tab **Anmeldung**.

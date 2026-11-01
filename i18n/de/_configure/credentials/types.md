---
layout: default
title: Typen von Anmeldedaten
parent: Anmeldedaten
nav_order: 1
translated_from: 2782b0144b1442eceb8684fb1407827cef5fde8f
---

# Typen von Anmeldedaten
{: .no_toc }

Was jeder Typ enthält und wo er gewählt werden kann
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Typen

Der Typ sagt, wofür Anmeldedaten sind. Er bestimmt, welche Felder der Dialog abfragt und wo sie gewählt werden können:

| Typ | Was er enthält | Verwendet von |
|---|---|---|
| Benutzer und Passwort | Benutzer und Passwort für eine beliebige Anmeldung: eine REST-API mit Basic Auth, ein Dienst und mehr. Der Standard | Playbooks, über die `credentials` eines Formulars oder ein Anmeldedaten-Feld; [REST-Ausdrücke](../expressions/credentials.html) |
| SSH | Benutzer und Passwort für SSH zu einem Server, mit seinem Host und Port | Playbooks, über die `credentials` oder `ansibleCredentials` eines Formulars oder ein Anmeldedaten-Feld, und die Anmeldung eines Workflow-Knotens |
| Git | Benutzer und Passwort oder Token für Git-Repositories | [Repositories](../repositories/authentication.html) |
| API | Benutzer und Passwort oder Token für eine REST-API | [REST-Ausdrücke](../expressions/credentials.html), ein Telegram-Bot-Token, das Bearer-Token eines Webhooks, der API-Schlüssel des Chat-Assistenten |
| Datenbank | Eine Datenbankanmeldung, mit Typ, Host, Port und Datenbankname | Eine [Datenbank](../databases.html), die Formulare abfragen (`dbConfig`), ab 7.5.0, oder direkt die `dbConfig` eines Formulars; `fnCredentials`; lässt sich testen |
| CyberArk | Die Adresse des CyberArk Central Credential Provider (CCP) und sein TLS sowie AppID, Client-Zertifikat und Schlüssel, mit denen sich ein CyberArk-Store anmeldet | Ein [CyberArk](../secret-stores/cyberark.html)-Secret-Store |
| SMTP | Ein Mailserver, sein Port und TLS und seine Anmeldung (keine für ein Relay) | Ein Mail-[Benachrichtigungskanal](../notification-channels.html) |
| LDAP | Server, Port, TLS und Zertifikate eines Verzeichnisses sowie sein Bind-DN und Passwort | Ein [LDAP-Verzeichnis](../authentication/ldap.html) |
| Microsoft Entra ID | Die App-Registrierung eines Anbieters: Tenant-ID, Client-ID, Client-Secret und Umleitungs-URI | Ein [Entra ID-Anbieter](../authentication/entra-id.html) |
| Open ID | Der Client eines Anbieters: Issuer, Client-ID, Client-Secret und Umleitungs-URI | Ein [OIDC-Anbieter](../authentication/oidc.html) |
| RTE | Das Token (`RTE_TOKEN`) und die Adresse einer RTE | Ein RTE-[Runner](../runners.html) |
| AWX, AAP, Ascender | Das Token oder die Anmeldung und die Adresse dieser Plattform | Ein Runner dieses Typs |
| Semaphore, Rundeck | Das API-Token und die Adresse dieses Produkts | Ein Runner dieses Typs |
| Jenkins | Ein Benutzer, sein API-Token und die Adresse eines Jenkins | Ein Jenkins-Runner |
| HashiCorp Vault | Das Token und die Adresse, mit denen sich ein Vault-Store anmeldet | Ein [HashiCorp Vault](../secret-stores/hashicorp-vault.html)-Secret-Store |

Datenbank-Anmeldedaten können vom Typ MySQL, MSSQL, PostgreSQL, Oracle oder MongoDB sein. Ab 7.5.0 wählt sie eine Datenbank unter
[Verbindungen > Datenbanken](../databases.html), und das Upgrade auf 7.5.0 legt für jeden Eintrag eine Datenbank mit demselben Namen an.

In der API und im [Config-Seed](../seed/) heißen die Typen `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` und `vault`. Das Upgrade von 6
gibt allen Anmeldedaten den Typ `userpass`, oder `database` für Datenbank-Anmeldedaten: Ein Formular verwendet sie wie in 6. Ändern Sie ihn auf SSH für eine
Anmeldung, mit der sich das Playbook eines Workflow-Knotens verbindet, oder auf API für eine REST-API.

---

## Adressen in Anmeldedaten

Ab 7.3.0 trägt eine Anmeldung, die auf einem Server funktioniert, diesen Server mit sich, sodass der Datensatz, der sie verwendet, nur die Anmeldedaten nennt:

| Datensatz | Was in seine Anmeldedaten verschoben wurde |
|---|---|
| Ein LDAP-Verzeichnis | Server, Port, TLS, Zertifikate und Bind-Konto, in `ldap`-Anmeldedaten namens `<directory>-ldap` |
| Ein SSO-Anbieter | Client-ID und Secret, Tenant oder Issuer sowie Umleitungs-URI, in `entraid`- oder `oidc`-Anmeldedaten namens `<provider>-sso` |
| Ein Runner | Adresse und TLS sowie Token oder Anmeldung, in Anmeldedaten seines Typs, `<runner>-token` oder `<runner>-login` |
| Ein Secret Store | Adresse und TLS sowie Token (`<store>-token`) oder CyberArk-AppID und Zertifikat (`<store>-appid`) |
| Ein Mail-Kanal | Server, Port und TLS, in seine `smtp`-Anmeldedaten oder neue namens `<channel>-smtp` |

Das Upgrade auf 7.3.0 nimmt diese Verschiebungen einmal vor. Ein Datensatz, der bereits Anmeldedaten nannte, behält sie und erhält eine Kopie davon, wenn
ein anderer Datensatz dieselbe Anmeldung mit einem anderen Server verwendete. Im [Config-Seed](../seed/) deklarierte Datensätze bleiben so, wie der Seed sie hat.
Die Anmeldedaten der Verbindungen und Anmeldungen können nur von einem Admin geändert werden, siehe [Wer Anmeldedaten ändern darf](../credentials.html#who-may-change-a-credential).

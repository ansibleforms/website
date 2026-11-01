---
layout: default
title: Typen referenties
parent: Inloggegevens
nav_order: 1
translated_from: 2782b0144b1442eceb8684fb1407827cef5fde8f
---

# Typen referenties
{: .no_toc }

Wat elk type bevat, en waar het kan worden gekozen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De typen

Het type zegt waarvoor een referentie dient. Het bepaalt welke velden het dialoogvenster vraagt, en waar de referentie kan worden gekozen:

| Type | Wat het bevat | Gebruikt door |
|---|---|---|
| Gebruiker en wachtwoord | Een gebruiker en wachtwoord voor elke aanmelding: een REST API met basic auth, een service en meer. De standaard | Playbooks, via de `credentials` van een formulier of een referentieveld; [REST-expressies](../expressions/credentials.html) |
| SSH | Een gebruiker en wachtwoord voor SSH naar een server, met de host en poort | Playbooks, via de `credentials` of `ansibleCredentials` van een formulier of een referentieveld, en de aanmelding van een workflownode |
| Git | Een gebruiker en wachtwoord of token voor git-repositories | [Repositories](../repositories/authentication.html) |
| API | Een gebruiker en wachtwoord of token voor een REST API | [REST-expressies](../expressions/credentials.html), een Telegram-bottoken, het bearer-token van een webhook, de API-sleutel van de chat-assistent |
| Database | Een database-aanmelding, met het type, de host, de poort en de databasenaam | Een [database](../databases.html) die formulieren bevragen (`dbConfig`), vanaf 7.5.0, of rechtstreeks de `dbConfig` van een formulier; `fnCredentials`; ze kan worden getest |
| CyberArk | Het adres van de CyberArk Central Credential Provider (CCP) en de TLS ervan, en de AppID, het clientcertificaat en de sleutel waarmee een CyberArk-store zich aanmeldt | Een [CyberArk](../secret-stores/cyberark.html)-secret store |
| SMTP | Een mailserver, de poort en TLS, en de aanmelding (geen voor een relay) | Een [meldingskanaal](../notification-channels.html) voor mail |
| LDAP | De servers, poort, TLS en certificaten van een directory, en de bind-DN en het wachtwoord | Een [LDAP-directory](../authentication/ldap.html) |
| Microsoft Entra ID | De app-registratie van een provider: tenant ID, client ID, client secret en omleidings-URI | Een [Entra ID-provider](../authentication/entra-id.html) |
| Open ID | De client van een provider: issuer, client ID, client secret en omleidings-URI | Een [OIDC-provider](../authentication/oidc.html) |
| RTE | Het token (`RTE_TOKEN`) en het adres van een RTE | Een RTE-[runner](../runners.html) |
| AWX, AAP, Ascender | Het token of de aanmelding, en het adres, van dat platform | Een runner van dat type |
| Semaphore, Rundeck | Het API-token en het adres van dat product | Een runner van dat type |
| Jenkins | Een gebruiker, het API-token en het adres van een Jenkins | Een Jenkins-runner |
| HashiCorp Vault | Het token en het adres waarmee een Vault-store zich aanmeldt | Een [HashiCorp Vault](../secret-stores/hashicorp-vault.html)-secret store |

Een databasereferentie kan van het type MySQL, MSSQL, PostgreSQL, Oracle of MongoDB zijn. Vanaf 7.5.0 wordt ze gekozen door een database uit
[Verbindingen > Databases](../databases.html), en de upgrade naar 7.5.0 maakt voor elke databasereferentie een database met dezelfde naam.

In de API en de [configuratie-seed](../seed/) zijn de typen `userpass`, `ssh`, `git`, `api`, `database`, `cyberark`, `smtp`,
`ldap`, `entraid`, `oidc`, `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins` en `vault`. De upgrade vanaf 6
geeft elke referentie het type `userpass`, of `database` voor een databasereferentie: een formulier gebruikt haar zoals in 6. Wijzig het naar SSH voor een
aanmelding waarmee het playbook van een workflownode verbinding maakt, of naar API voor een REST API.

---

## Adressen in referenties

Vanaf 7.3.0 draagt een aanmelding die op één server werkt die server mee, zodat het record dat haar gebruikt alleen de referentie noemt:

| Record | Wat naar de referentie is verplaatst |
|---|---|
| Een LDAP-directory | De servers, poort, TLS, certificaten en het bindaccount, naar een `ldap`-referentie met de naam `<directory>-ldap` |
| Een SSO-provider | De client ID en het secret, de tenant of issuer, en de omleidings-URI, naar een `entraid`- of `oidc`-referentie met de naam `<provider>-sso` |
| Een runner | Het adres en de TLS, en het token of de aanmelding, naar een referentie van zijn type, `<runner>-token` of `<runner>-login` |
| Een secret store | Het adres en de TLS, en het token (`<store>-token`) of de CyberArk-AppID en het certificaat (`<store>-appid`) |
| Een mailkanaal | De server, poort en TLS, naar zijn `smtp`-referentie, of een nieuwe met de naam `<channel>-smtp` |

De upgrade naar 7.3.0 voert deze verplaatsingen eenmaal uit. Een record dat al een referentie noemde, behoudt haar, en krijgt er een kopie van als
een ander record dezelfde aanmelding met een andere server gebruikte. Records die in de [configuratie-seed](../seed/) zijn gedeclareerd, blijven zoals de seed ze heeft.
De referenties van de verbindingen en aanmeldingen kunnen alleen door een admin worden gewijzigd, zie [Wie een referentie mag wijzigen](../credentials.html#who-may-change-a-credential).

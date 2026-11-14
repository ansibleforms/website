---
layout: default
title: Typen referenties
parent: Inloggegevens
nav_order: 1
translated_from: eb4f5cce55db979ca4f0d1304d797decc01192ee
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
| Gebruiker en wachtwoord | Een gebruiker en wachtwoord voor elke aanmelding: een REST API met basic auth, een service en meer, met een optionele host en poort. De standaard | Playbooks, via de `credentials` van een formulier of een referentieveld; [REST-expressies](../expressions/credentials.html) |
| SSH | Een gebruiker met een wachtwoord of een privésleutel voor SSH naar een server, met de host en poort | Playbooks, via de `credentials` of `ansibleCredentials` van een formulier of een referentieveld, en de aanmelding van een workflownode |
| Git | Een token, of een gebruiker en wachtwoord, voor git-repositories | [Repositories](../repositories/authentication.html) |
| API | Een gebruiker en wachtwoord of token voor een REST API, met een optionele host en poort | [REST-expressies](../expressions/credentials.html), een Telegram-bottoken, het bearer-token van een webhook, de API-sleutel van de chat-assistent |
| Database | Een database-aanmelding, met het type, de host, de poort en de databasenaam | Een [database](../databases.html) die formulieren bevragen (`dbConfig`), vanaf 7.5.0, of rechtstreeks de `dbConfig` van een formulier; `fnCredentials`; ze kan worden getest |
| CyberArk | Het adres van de CyberArk Central Credential Provider (CCP) en de TLS ervan, en de AppID, het clientcertificaat en de sleutel waarmee een CyberArk-store zich aanmeldt | Een [CyberArk](../secret-stores/cyberark.html)-secret store |
| SMTP | Een mailserver, de poort en TLS, en de optionele aanmelding (geen voor een relay) | Een [meldingskanaal](../notification-channels.html) voor mail |
| LDAP | De servers, poort, TLS en certificaten van een directory, en de bind-DN en het wachtwoord | Een [LDAP-directory](../authentication/ldap.html) |
| Microsoft Entra ID | Een app-registratie: tenant ID, client ID, client secret of certificaat, en omleidings-URI | Een [Entra ID-provider](../authentication/entra-id.html); een mailkanaal dat via [Microsoft 365](../notification-channels/microsoft-365.html) verstuurt |
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

## Hoe een referentie zich aanmeldt

Vanaf 7.6.0 vraagt de stap **Aanmelding** van deze typen eerst hoe de referentie zich aanmeldt, en toont dan alleen de velden die die keuze nodig heeft:

| Type | Keuze | Velden |
|---|---|---|
| SSH | **Aanmelden met**: **Wachtwoord** of **Privésleutel** | Wachtwoord: de gebruiker en zijn wachtwoord. Privésleutel: de gebruiker, de PEM- of OpenSSH-**Privésleutel** en een optionele **Wachtwoordzin** |
| AWX, AAP, Ascender | **Aanmelden met**: **Token** of **Wachtwoord** | Token: het **Token**, geen gebruiker. Wachtwoord: de gebruiker en zijn wachtwoord |
| Git | **Aanmelden met**: **Token** of **Wachtwoord** | Token: het **Token**, geen gebruiker (git stuurt dan de gebruiker `oauth2`). Wachtwoord: de gebruiker en zijn wachtwoord |
| SMTP | **Aanmelden met**: **Geen aanmelding** of **Aanmelding** | Geen aanmelding, voor een relay: alleen **Mail server**, **Mail poort** en **TLS gebruiken**. Aanmelding: die, plus de gebruiker en zijn wachtwoord |
| Microsoft Entra ID | **Aanmelden met**: **Geheim** of **Certificaat** | Geheim: het **Client secret**. Certificaat: het PEM-**Certificaat** en de privésleutel ervan, alleen voor mail via Microsoft 365 |

Een referentie bewaart alleen wat haar keuze nodig heeft: een SSH-referentie heeft nooit zowel een wachtwoord als een sleutel, het andere
vervalt bij opslaan. Met **Schrijven naar een sleutel** in de stap **Opslag** worden alleen de keuzes met een wachtwoord aangeboden.

De andere typen melden zich op één manier aan. Een referentie Gebruiker en wachtwoord of API heeft na het wachtwoord de schakelaar
**Host en poort toevoegen**, zie [Host en poort van een aanmelding](#host-and-port-of-a-login). Het dialoogvenster noemt het
LDAP-bindwachtwoord **Wachtwoord**, het RTE-token **Token** en het type van een database **Engine**.

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

---

## Host en poort van een aanmelding

Vanaf 7.6.0 kan een referentie Gebruiker en wachtwoord of API ook een optionele **Host** en **Poort** bevatten: in de stap
**Aanmelding** toont de schakelaar **Host en poort toevoegen** na het wachtwoord ze.

Ze bereiken het playbook en de expressies met de referentie, als `host` en `port`, naast `user` en `password`: via de `credentials`
van een formulier en [`fn.fnCredentials`](../expressions/credentials.html). Een referentie die uit een secret store wordt gelezen, behoudt
haar eigen host en poort, en neemt die van het geheim alleen waar ze leeg zijn. SSH- en databasereferenties hadden ze altijd al.

---

## De privésleutel van een SSH-referentie

Vanaf 7.6.0 kan een SSH-referentie zich aanmelden met een privésleutel in plaats van haar wachtwoord: **Aanmelden met** op **Privésleutel** vraagt deze:

| Veld | Betekenis |
|---|---|
| Privésleutel | De PEM- of OpenSSH-privésleutel waarmee het playbook zich aanmeldt. Versleuteld opgeslagen, nooit meer getoond: leeg gelaten blijft de opgeslagen sleutel. |
| Wachtwoordzin | De wachtwoordzin van de sleutel, als die er een heeft. Versleuteld opgeslagen. |

Ze meldt zich met het een of het ander aan, nooit met beide: bij opslaan wist een sleutel het opgeslagen wachtwoord, en **Wachtwoord**
de opgeslagen sleutel en wachtwoordzin, zoals de pagina van de referentie zegt. Ze worden nooit door de API teruggegeven, en worden gemaskeerd in de uitvoer.

Wanneer een formulier de referentie in `ansibleCredentials` noemt, schrijft de RTE de sleutel naar een privé tijdelijk bestand (in een eigen
map, alleen leesbaar voor zijn gebruiker) en geeft hem aan het playbook door als `ansible_ssh_private_key_file`. Een sleutel met een
wachtwoordzin wordt geladen in een `ssh-agent` die alleen voor die job wordt gestart, en het bestand wordt verwijderd zodra hij geladen is.
Het bestand en de agent zijn weg wanneer de job eindigt, ook bij een mislukte of afgebroken job, zodat er nooit een sleutel achterblijft
op de RTE die de job heeft uitgevoerd.

De RTE-images hebben `ssh-agent` en `ssh-add`; op een eigen RTE zonder ze faalt een job met een sleutel met wachtwoordzin, met die melding.

De `credentials` van een formulier die een SSH-referentie noemen, geven de sleutel aan het playbook als `private_key`, en de wachtwoordzin als
`private_key_passphrase`. In de [configuratie-seed](../seed/) is de sleutel de `client_key` van de referentie en de wachtwoordzin `key_passphrase`.

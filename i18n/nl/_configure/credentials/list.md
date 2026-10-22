---
layout: default
title: De pagina met inloggegevens
parent: Inloggegevens
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
---

# De pagina met inloggegevens
{: .no_toc }

De lijst met referenties, en het dialoogvenster waarmee je er een toevoegt
{: .fs-6 .fw-300 }

De pagina onder **Verbindingen > Inloggegevens** toont elke referentie met haar **Naam**, **Type**, **Beschrijving** en **Gebruikt door**, het
aantal records, formulieren en workflows dat haar noemt (zie [Referenties in gebruik](../credentials.html#credentials-in-use)).

**Inloggegevens toevoegen** opent een dialoogvenster in stappen:

| Stap | Velden |
|---|---|
| Referentie | Naam en beschrijving, beide verplicht. |
| Type | Een van 18 typen, zie hieronder. |
| Aanmelding | Waarmee en waar het type zich aanmeldt, zie hieronder. |
| Opslag | Waar de gebruiker en het wachtwoord worden bewaard: **Database** (versleuteld in de AnsibleForms-database) of **Geheimenkluis**, met de store en de **Referentie** daarin. Niet voor CyberArk of HashiCorp Vault, waarmee een secret store zich aanmeldt. |

De stap **Type** toont de typen op naam: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, en Gebruiker en wachtwoord (zie [Typen referenties](types.html)).

De stap **Aanmelding** bevat elk veld van het type, het adres inbegrepen; er is geen aparte verbindingsstap:

| Typen | Velden van de stap Aanmelding |
|---|---|
| Elk type behalve CyberArk | Het wachtwoord, of wat ervoor in de plaats komt: het bindwachtwoord van LDAP, het client secret van Entra ID en Open ID, het token van HashiCorp Vault, het RTE-token, het API-token van Semaphore, Rundeck en Jenkins, een token of wachtwoord voor AWX, AAP en Ascender |
| Elk type behalve HashiCorp Vault, RTE, Semaphore en Rundeck | De gebruiker: de AppID van CyberArk, de bind-DN van LDAP, de client ID van Entra ID en Open ID, optioneel voor AWX, AAP en Ascender |
| SSH, Database | **Host** en **Poort**; voor een database ook het **Database type** en de **Database** |
| SMTP | **Mail server** (verplicht), de **Poort** en **TLS gebruiken** |
| LDAP | De **Servers** van de directory (verplicht), de **Poort** en **TLS inschakelen**; met TLS ook **Certificaten negeren**, de **CA-bundel** en een **Clientcertificaat** |
| Microsoft Entra ID | **Tenant ID** (verplicht) en **Omleidings-URI** |
| Open ID | **Issuer** (verplicht) en **Omleidings-URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, het adres waarbij het zich aanmeldt, verplicht, met **Certificaatcontrole overslaan** en de **CA-bundel** |
| CyberArk | **Clientcertificaat** en **Clientsleutel** |

Een rij opent de eigen pagina van de referentie. Het menu biedt **Bewerken**, **Verbinding testen** (alleen voor databasereferenties) en **Verwijderen**. Het
wachtwoord wordt gewijzigd op de pagina van de referentie, in het tabblad **Aanmelding**.

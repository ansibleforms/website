---
layout: default
title: De pagina met inloggegevens
parent: Inloggegevens
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
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
| Opslag | Waar gebruiker en wachtwoord worden bewaard: **Database** (versleuteld in de AnsibleForms-database) of **Geheimenkluis**. Onder **Geheimenkluis** leest **Verwijzen naar een sleutel** een geheim dat al in de kluis staat, en **Schrijven naar een sleutel** schrijft de in de stap **Aanmelding** getypte gebruiker en wachtwoord bij **Opslaan** naar de kluis. Kies dan de kluis en vul de **Referentie** in; het voorbeeld volgt de kluis: een HashiCorp Vault-pad of een CyberArk-account. Niet voor CyberArk en HashiCorp Vault, waarmee een geheimenkluis zich aanmeldt. |
| Aanmelding | Waarmee en waar het type zich aanmeldt, zie hieronder. |

De stap **Type** toont de typen op naam: AAP, API, Ascender, AWX, CyberArk, Database, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH, en Gebruiker en wachtwoord (zie [Typen referenties](types.html)).

De stap **Aanmelding** bevat elk veld van het type, het adres inbegrepen; er is geen aparte verbindingsstap. Vanaf 7.6.0 vragen sommige
typen eerst hoe ze zich aanmelden, en tonen dan alleen wat dat nodig heeft (zie [Hoe een referentie zich aanmeldt](types.html#how-a-credential-signs-in)):

| Typen | Velden van de stap Aanmelding |
|---|---|
| Elk type behalve CyberArk | Het wachtwoord, of wat ervoor in de plaats komt: het **Wachtwoord** van LDAP (het bindwachtwoord), het **Client secret** van Entra ID en Open ID, het **Token** van HashiCorp Vault en RTE, het **API-token** van Semaphore, Rundeck en Jenkins, het **Token** of **Wachtwoord** van AWX, AAP, Ascender en Git. Geen voor een SSH-privésleutel, een SMTP-relay of een Entra ID-certificaat |
| Elk type behalve HashiCorp Vault, RTE, Semaphore en Rundeck | De gebruiker: de AppID van CyberArk, de bind-DN van LDAP, de client ID van Entra ID en Open ID. Geen met **Token** (AWX, AAP, Ascender, Git) of **Geen aanmelding** (SMTP) |
| SSH, Database | **Host** en **Poort**; voor een database ook de **Engine** en de **Database** |
| SSH | Vanaf 7.6.0 **Aanmelden met**: **Wachtwoord**, of **Privésleutel** met de **Privésleutel** en een optionele **Wachtwoordzin** |
| AWX, AAP, Ascender, Git | Vanaf 7.6.0 **Aanmelden met**: **Token** (geen gebruiker) of **Wachtwoord** (een gebruiker en zijn wachtwoord) |
| Gebruiker en wachtwoord, API | Vanaf 7.6.0 toont de schakelaar **Host en poort toevoegen**, na het wachtwoord, een optionele **Host** en **Poort** |
| SMTP | **Mail server** (verplicht), **Mail poort** en **TLS gebruiken**; vanaf 7.6.0 **Aanmelden met**: **Geen aanmelding** (een relay) of **Aanmelding** (een gebruiker en zijn wachtwoord) |
| LDAP | De **Servers** van de directory (verplicht), de **Poort** en **TLS inschakelen**; met TLS ook **Certificaten negeren**, de **CA-bundel** en een **Clientcertificaat** |
| Microsoft Entra ID | **Tenant ID** (verplicht) en **Omleidings-URI**; vanaf 7.6.0 **Aanmelden met**: **Geheim** (het **Client secret**) of **Certificaat** (een **Certificaat** en de privésleutel ervan, alleen mail) |
| Open ID | **Issuer** (verplicht) en **Omleidings-URI** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Server**, het adres waarbij het zich aanmeldt, verplicht, met **Certificaatcontrole overslaan** en de **CA-bundel** |
| CyberArk | **Clientcertificaat** en **Clientsleutel** |

Met **Verwijzen naar een sleutel** worden gebruiker en wachtwoord niet gevraagd: de store levert ze. De stap **Aanmelding** houdt dan alleen de adresvelden van het type (SSH, database, mail- en directoryservers, een serveradres, de optionele host en poort van Gebruiker en wachtwoord en API vanaf 7.6.0), en een Git-aanmelding heeft helemaal geen stap **Aanmelding**: ze wordt opgeslagen vanuit de stap **Opslag**.

Met **Schrijven naar een sleutel** (vanaf 7.6.0) vraagt de stap **Aanmelding** gebruiker en wachtwoord, met alleen de aanmeldkeuzes met een wachtwoord (zie
[Hoe een referentie zich aanmeldt](types.html#how-a-credential-signs-in)), en **Opslaan** schrijft ze op de **Referentie** naar de kluis; AnsibleForms bewaart alleen de kluis en de referentie. Alleen kluizen die schrijven toestaan worden aangeboden, en **Secret store toevoegen** maakt er een met schrijven al aan. Een sleutel waar al een geheim staat, wordt alleen vervangen als **Een bestaand geheim overschrijven** is aangevinkt, zie [Referenties schrijven](../secret-stores/#writing-credentials).

Een rij opent de eigen pagina van de referentie. Het menu biedt **Bewerken**, **Verbinding testen** (alleen voor databasereferenties) en **Verwijderen**. Het
wachtwoord wordt gewijzigd op de pagina van de referentie, in het tabblad **Aanmelding**.

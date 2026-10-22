---
layout: default
title: "De pagina van een referentie"
parent: Inloggegevens
nav_order: 3
translated_from: 0269b5c0d313622bea6c910b96231f41ffd852d7
---

# De pagina van een referentie
{: .no_toc }

De tabbladen van een referentie, en wat haar gebruikt
{: .fs-6 .fw-300 }

De pagina van een referentie toont de stappen van haar dialoogvenster als tabbladen, plus wat haar gebruikt:

| Tabblad | Wat het bevat |
|---|---|
| Details | Naam en beschrijving. |
| Type | Waarvoor de referentie dient. |
| Aanmelding | Elk veld van haar type, zoals in de stap **Aanmelding** van het dialoogvenster: de gebruiker, het wachtwoord, en waar ze zich aanmeldt (host en poort, de database, de mailserver, de servers van de directory, de tenant of issuer, het adres van de server en de TLS ervan). Voor een CyberArk-referentie de AppID, het clientcertificaat en de sleutel. |
| Opslag | Database of Geheimenkluis, en de store en de referentie. Niet voor CyberArk of HashiCorp Vault. |
| Gebruikt door | Alles wat deze referentie noemt: secret stores, meldingskanalen, repositories, LDAP-directory's, SSO-providers, runners, de chat-assistent, formulieren en de workflows van de designer. Een rij opent het. |

Het wachtwoord wordt in het tabblad **Aanmelding** getypt en wordt na het opslaan nooit meer getoond: leeg gelaten blijft het opgeslagen wachtwoord staan. Laat voor een CyberArk-referentie
de clientsleutel leeg om de opgeslagen sleutel te behouden. Rechtsboven staan **Verbinding testen** (alleen voor databasereferenties),
**Verwijderen** en **Opslaan**.

Vanaf 7.3.0 worden **Verwijderen** en een nieuwe naam geweigerd zolang **Gebruikt door** iets toont, zie [Referenties in gebruik](../credentials.html#credentials-in-use).

Een referentie die in de [configuratie-seed](../seed/) is gedeclareerd, is op deze pagina alleen-lezen: wijzig haar dan in het seedbestand.

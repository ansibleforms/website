---
layout: default
title: "De pagina van een referentie"
parent: Inloggegevens
nav_order: 3
translated_from: e6bb8581b39ffc997504889b1b6e8d245cd51d13
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
| Aanmelding | Elk veld van haar type, zoals in de stap **Aanmelding** van het dialoogvenster: de gebruiker, het wachtwoord, en waar ze zich aanmeldt (host en poort, de database, de mailserver, de servers van de directory, de tenant of issuer, het adres van de server en de TLS ervan). Voor een CyberArk-referentie de AppID, het clientcertificaat en de sleutel. Vanaf 7.6.0 de keuze hoe ze zich aanmeldt, en voor een SSH-referentie de privésleutel en de wachtwoordzin. |
| Opslag | Database of Geheimenkluis, en de store en de referentie. Niet voor CyberArk of HashiCorp Vault. |
| Gebruikt door | Alles wat deze referentie noemt: secret stores, meldingskanalen, repositories, LDAP-directory's, SSO-providers, runners, [databases](../databases.html) (vanaf 7.5.0), de chat-assistent, formulieren en de workflows van de designer. Een rij opent het. |

Het wachtwoord wordt in het tabblad **Aanmelding** getypt en wordt na het opslaan nooit meer getoond: leeg gelaten blijft het opgeslagen wachtwoord staan. Hetzelfde geldt
voor de clientsleutel van een CyberArk-referentie, en vanaf 7.6.0 voor de privésleutel en de wachtwoordzin van een SSH-referentie.

Vanaf 7.6.0 geldt dat alleen zolang de aanmeldkeuze gelijk blijft. Gewijzigd (een SSH-**Privésleutel** naar **Wachtwoord** en terug, een
SMTP-**Geen aanmelding** naar **Aanmelding**, een Entra ID-**Certificaat** naar **Geheim** en terug, een **Token** naar een **Wachtwoord** en
terug) past niets opgeslagens erbij: het nieuwe geheim dat ze nodig heeft is verplicht, en **Opslaan** vraagt erom. Een SSH-referentie die
naar **Wachtwoord** gaat, wist bij **Opslaan** haar opgeslagen privésleutel en wachtwoordzin, zoals het tabblad onder de keuze zegt. Met
**Schrijven naar een sleutel** in het tabblad **Opslag** worden alleen de keuzes met een wachtwoord aangeboden, zie [Hoe een referentie zich aanmeldt](types.html#how-a-credential-signs-in).

Rechtsboven staan **Verbinding testen** (alleen voor databasereferenties), **Verwijderen** en **Opslaan**.

Vanaf 7.3.0 worden **Verwijderen** en een nieuwe naam geweigerd zolang **Gebruikt door** iets toont, zie [Referenties in gebruik](../credentials.html#credentials-in-use).

Een referentie die in de [configuratie-seed](../seed/) is gedeclareerd, is op deze pagina alleen-lezen: wijzig haar dan in het seedbestand.

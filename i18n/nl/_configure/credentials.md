---
layout: default
title: Inloggegevens
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 08110077a1cf59a4a52e078fc2ebc252f7cae48d
---

# Inloggegevens
{: .no_toc }

Bewaar de aanmeldgegevens waarmee formulieren, repositories, secret stores en meldingskanalen verbinding maken
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: voeg de gebruikers, wachtwoorden en tokens toe waarmee AnsibleForms verbinding maakt, versleuteld bewaard of gelezen uit een secret store.

---

## In deze sectie

| Pagina | Wat er aan bod komt |
|---|---|
| [Typen referenties](credentials/types.html) | Wat elk type bevat, en waar het kan worden gekozen |
| [De pagina met inloggegevens](credentials/list.html) | De lijst met referenties, en het dialoogvenster waarmee je er een toevoegt |
| [De pagina van een referentie](credentials/credential-page.html) | De tabbladen van een referentie, en wat haar gebruikt |

---

## Hoe het werkt

Een **referentie** is een benoemde aanmelding, toegevoegd onder **Verbindingen > Inloggegevens**. Formulieren en de andere beheerobjecten verwijzen
ernaar met haar naam, zodat het wachtwoord zelf nooit in een formulier verschijnt. De gebruiker en het wachtwoord worden ofwel in de
AnsibleForms-database bewaard, versleuteld met `ENCRYPTION_SECRET`, ofwel elke keer dat de referentie wordt gebruikt uit een [secret store](secret-stores/)
gelezen.

---

## Wie een referentie mag wijzigen

Vanaf 7.3.0 kan een referentie waarvan een verbinding of een aanmelding afhangt alleen door een admin worden toegevoegd, gewijzigd of verwijderd:

| Referenties | Waarom |
|---|---|
| Verbindingstypen: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` en `cyberark` | Een runner of een secret store haalt er zijn adres en zijn geheim uit |
| Aanmeldtypen: `oidc`, `entraid` en `ldap` | Een SSO-provider of een LDAP-directory meldt er gebruikers mee aan |
| Elke referentie die een runner noemt | De runner meldt zich ermee aan, en voor een wijziging van de runner zelf is ook een admin nodig |

Andere gebruikers met toegang tot de referenties zien deze alleen-lezen. Een gebruiker die zo'n referentie naar een andere
server zou kunnen laten wijzen, zou elk geheim ontvangen dat erdoorheen wordt verstuurd; daarom volgt de regel die voor runners. Nog drie regels
houden die gebruikers weg van geheimen die ze anders niet zouden kunnen lezen:

- **Een beschermde referentie noemen**: alleen een admin kan een van deze referenties elders noemen, zoals in een repository,
  een meldingskanaal of de instellingen van de chat-assistent. Een referentie die haar wachtwoord uit een secret store leest, is
  op dezelfde manier beschermd, ongeacht haar type.
- **Een secret store kiezen**: alleen een admin kan een referentie naar een [secret store](secret-stores/) laten wijzen, of de
  store of de referentie die ze leest wijzigen; een andere gebruiker mag ze nog wel ongewijzigd terugsturen, of ze allemaal leegmaken.
- **Een referentie verplaatsen**: als een andere gebruiker wijzigt waar een referentie zich aanmeldt (host, poort, issuer, tenant of
  serveradres) zonder het wachtwoord opnieuw te typen, wordt het opgeslagen wachtwoord gewist, en ook de verwijzing naar de secret store
  die ze leest, zodat het oude geheim nooit naar het nieuwe doel gaat.

---

## Referenties in gebruik

Een referentie die nog door records wordt genoemd, kan niet worden verwijderd of hernoemd, omdat die records dan naar niets zouden wijzen.
De weigering noemt hoeveel records haar gebruiken; het tabblad **Gebruikt door** van [haar pagina](credentials/credential-page.html) toont ze.
Laat ze eerst naar een andere referentie wijzen, en verwijder of hernoem haar daarna.

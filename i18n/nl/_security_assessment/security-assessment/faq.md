---
layout: default
title: Veelgestelde vragen bij een beoordeling
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# Veelgestelde vragen bij een beoordeling
{: .no_toc }

Korte antwoorden op de vragen die beveiligingsvragenlijsten het vaakst stellen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gegevens en hosting

Waar de gegevens staan, en wie erbij kan:

| Vraag | Antwoord |
|---|---|
| Waar worden onze gegevens opgeslagen? | In de MySQL- of MariaDB-database die jij draait, en in de persistente map van je instantie. AnsibleForms is self-hosted, zonder clouddienst erachter. |
| Stuurt het gegevens naar de makers? | Nee. Er is geen telemetrie, geen gebruiksrapportage en geen updatecontrole. |
| Waarmee maakt het verbinding? | Alleen met de systemen die een beheerder configureert: zie [Uitgaande verbindingen](measures.html#outbound-connections). |
| Gebruikt het AI of stuurt het gegevens naar een modelprovider? | Alleen als de [chatassistent](../chat/) aanstaat, en die staat standaard uit. Dan stuurt het formulierdefinities en de ingevulde waarden naar de provider die je configureert. |
| Kan het draaien zonder internettoegang? | Ja. De applicatie heeft geen internettoegang nodig; de playbooks hebben nodig wat hun taken bereiken. |

---

## Versleuteling

Wat er versleuteld is, en met welke sleutels:

| Vraag | Antwoord |
|---|---|
| Zijn gegevens versleuteld tijdens transport? | Met [HTTPS](../security/https.html), aangeboden door de applicatie of door je reverse proxy, en `wss://` tussen de applicatie en haar runtime-omgevingen. |
| Zijn gegevens versleuteld in rust? | Elk opgeslagen geheim wordt door de applicatie versleuteld met AES-256. Jobs en hun uitvoer worden opgeslagen zoals ze zijn: gebruik de eigen versleuteling in rust van de database. Zie [Opgeslagen geheimen](measures.html#stored-secrets). |
| Wie beheert de sleutels? | Jij: het [`ENCRYPTION_SECRET`](../security/secrets.html) stel je zelf in, het blijft buiten back-ups en kan worden geroteerd. |
| Kunnen geheimen in onze eigen vault blijven? | Ja: [HashiCorp Vault en CyberArk](../secret-stores/) worden gelezen wanneer een job ze nodig heeft. |

---

## Toegang en verantwoording

Wie kan aanmelden, wat ze kunnen doen en wat er wordt vastgelegd:

| Vraag | Antwoord |
|---|---|
| Ondersteunt het single sign-on? | Ja: LDAP / Active Directory, OpenID Connect en Entra ID. Zie [Authenticatie](../authentication/). |
| Ondersteunt het meervoudige authenticatie? | Via single sign-on: de MFA van je identiteitsprovider is van toepassing. Lokale accounts hebben geen eigen MFA. |
| Hoe worden rechten beheerd? | Met rollen die aan groepen zijn gekoppeld, bij elk verzoek door de server gecontroleerd. Zie [Rechten](measures.html#permissions). |
| Is er een auditlogboek? | Ja: elke wijziging en elke geweigerde poging, standaard 365 dagen bewaard en door te sturen naar syslog. Zie [Audittrail](measures.html#audit-trail). |
| Is er een standaardwachtwoord? | Het eerste adminaccount heeft een openbaar standaardwachtwoord, dat bij de eerste aanmelding moet worden gewijzigd. Zie [Het adminaccount](../security/hardening.html#the-admin-account). |

---

## Kwetsbaarheden en updates

Hoe problemen worden gevonden, opgelost en aangekondigd:

| Vraag | Antwoord |
|---|---|
| Zijn er kwetsbaarheden gevonden? | Ja. Elke gepubliceerde staat in [Beveiligingsadvisories](advisories.html), met de versie waarin die is opgelost. |
| Hoe melden we er een? | Vertrouwelijk, via GitHub: zie [Een kwetsbaarheid melden](reporting.html). |
| Hoe wordt de code gecontroleerd? | Statische analyse met CodeQL en dependency review op elke pull request, geautomatiseerde tests en updates via Dependabot. Zie [Veilige ontwikkeling](development.html). |
| Welke versies krijgen beveiligingsoplossingen? | 7.x en 6.5.x. Zie [Ondersteunde versies](development.html#supported-versions). |
| Hoe horen we van een nieuwe advisory? | Volg de beveiligingsmeldingen van de repository op GitHub. Zie [Op de hoogte blijven van nieuwe advisories](advisories.html#being-told-of-new-advisories). |
| Is er een penetratietest uitgevoerd? | Er is geen rapport van een penetratietest door derden gepubliceerd. De code is openbaar, dus je eigen team of tester kan die beoordelen, en bevindingen worden gemeld zoals hierboven. |

---

## Images en toeleveringsketen

Waar de images vandaan komen, en hoe je ze controleert:

| Vraag | Antwoord |
|---|---|
| Waar worden de images gepubliceerd? | Op de GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, gebouwd door openbare GitHub Actions-workflows. Zie [Releases en images](development.html#releases-and-images). |
| Draaien de containers als root? | Nee: als de niet-geprivilegieerde gebruiker `node`. |
| Zijn de images ondertekend? | Nog niet. Haal ze op via digest (`@sha256:...`) om zeker te weten dat je de image draait die je hebt gereviewd. |
| Is er een SBOM? | Er wordt nog geen SBOM met de images gepubliceerd. Een scanner zoals Trivy of Syft maakt er een op basis van de image. |
| Worden de images gescand op kwetsbaarheden? | Niet in de releasepipeline. Hun basisimages zijn vastgepind op digest en worden door Dependabot actueel gehouden; scan de images in je eigen registry om je eigen beleid toe te passen. |
| Onder welke licentie valt het? | GPL-3.0, open source, zonder garantie. |

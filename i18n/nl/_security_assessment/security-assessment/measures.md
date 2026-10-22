---
layout: default
title: Beveiligingsmaatregelen
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Beveiligingsmaatregelen
{: .no_toc }

Hoe aanmelden, rechten, geheimen en verbindingen worden beschermd
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Waar het draait

AnsibleForms is self-hosted, op je eigen infrastructuur, met zijn gegevens in een database die jij draait.

* Er is geen clouddienst of licentieserver van AnsibleForms, en geen telemetrie of updatecontrole.
* De interface wordt door de applicatie zelf aangeboden en laadt niets van een andere site.
* De applicatie maakt alleen verbinding met de systemen die een beheerder configureert, opgesomd in [Uitgaande verbindingen](#outbound-connections).

De onderdelen en wat elk ervan bevat:

| Onderdeel | Wat het doet | Wat het bevat |
|---|---|---|
| Applicatie | De webinterface, de REST API, de planner | Geen eigen gegevens: alles staat in de database |
| MySQL of MariaDB | De database van de applicatie | Gebruikers, groepen, inloggegevens (versleuteld), jobs met hun extravars en uitvoer, het auditlogboek |
| Runtime-omgeving (RTE) | Voert de playbooks uit, in een eigen container | De bestanden van de jobs die ze uitvoert, en de geheimen van een job alleen zolang die job draait |
| Persistente map | De configuratie, formulieren, playbooks en uploads | De bestanden die de formulieren en playbooks gebruiken |

Zie [Hoe het werkt](../how-it-works.html) voor het volledige plaatje, en [RTE](../rte/) voor de runtime-omgeving.

---

## Aanmelden

Elke pagina en API-aanroep die gegevens leest of wijzigt, vereist een aangemelde gebruiker. De paar endpoints die zonder aanmelding openstaan, dienen
het aanmelden zelf, de versie, de naam en het logo van de instantie, de API-documentatie en de database-installatie bij een eerste start,
die [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` afsluit:

| Methode | Hoe het werkt |
|---|---|
| Lokale accounts | Wachtwoorden gehasht met bcrypt, een [minimale lengte](../security/hardening.html#sign-in-limits-and-passwords), en het openbare standaardwachtwoord van admin moet bij de eerste aanmelding worden gewijzigd |
| LDAP / Active Directory | De directory controleert het wachtwoord, en de groepen ervan worden aan rollen gekoppeld. Zie [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Single sign-on via je identiteitsprovider, die ook zijn eigen meervoudige authenticatie meebrengt. Zie [Authenticatie](../authentication/) |

* Mislukte aanmeldingen [vergrendelen het account](../security/hardening.html#sign-in-limits-and-passwords), en het aanmelden is aan een snelheidslimiet gebonden.
* Een aanmelding levert een ondertekend toegangstoken op dat 30 minuten geldig is, en een vernieuwingstoken dat 24 uur geldig is.
* Tokens kunnen worden beëindigd voordat ze verlopen: afmelden, een wachtwoordwijziging, een geblokkeerde gebruiker en een ingetrokken API-token beëindigen ze
  meteen op elk knooppunt, zie [Tokens](../security/secrets.html#tokens).
* AnsibleForms heeft geen eigen meervoudige authenticatie: gebruik single sign-on waar die vereist is.

---

## Rechten

Wat een gebruiker mag doen, volgt uit de rollen van zijn groepen, bij elk verzoek door de server gecontroleerd:

* Rollen worden gedefinieerd in [config.yaml](../config/roles.html): welke formulieren een gebruiker ziet en welke opties hij heeft,
  zoals de ontwerper, de instellingenpagina's of de jobs van andere gebruikers.
* De server controleert elke start tegen de regels van het formulier (de velden, hun waarden en de toegang van de gebruiker), ook
  starts via de REST API, zie [Launch-validatie](../launch-validation/).
* De adminrol voert bewust elk playbook uit. Andere rollen krijgen alleen wat is toegekend: een gebruiker met meerdere rollen krijgt een
  optie alleen als geen van die rollen haar weigert, dus één beperkende rol is genoeg om haar te onthouden.

---

## Opgeslagen geheimen

Wachtwoorden, tokens en sleutels worden versleuteld voordat ze in de database worden geschreven:

* Elk opgeslagen geheim, inloggegevens, het bind-wachtwoord van LDAP, runnertokens, client secrets voor single sign-on, webhook-adressen
  en API-sleutels, wordt versleuteld met AES-256 en een willekeurige initialisatievector per waarde, onder het
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) dat je instelt.
* Geen enkele API-aanroep of instellingenpagina toont een opgeslagen geheim, en back-ups laten de hoofdgeheimen weg.
* Geheimen kunnen in je vault blijven: [HashiCorp Vault en CyberArk](../secret-stores/) worden gelezen wanneer een job ze nodig heeft.
* De geheimen van een job komen bij de runtime-omgeving aan verzegeld met AES-256-GCM, onder een sleutel die van zijn token is afgeleid.
* Extravars waarvan de naam op een geheim lijkt, worden in de jobweergave gemaskeerd, en wachtwoordvelden altijd, zie [Jobgegevens](../security/hardening.html#job-data).

De rest van de database, jobs, hun extravars en hun uitvoer, wordt opgeslagen zoals het is: bescherm die met de eigen versleuteling in rust
en het toegangsbeheer van de database, zie [De database](../security/hardening.html#the-database).

---

## Audittrail

Elke wijziging, en elke poging die wordt geweigerd, wordt vastgelegd:

* Elke aanmaak, wijziging en verwijdering, via de interface of de API, wordt in het auditlogboek geschreven met de gebruiker, zijn
  adres, de actie, het object en het resultaat. Weigeringen en aanmeldingen worden ook vastgelegd, mislukte inbegrepen.
* Waarden die op geheimen lijken, worden onleesbaar gemaakt voordat ze worden geschreven.
* Het logboek wordt standaard 365 dagen bewaard, en kan naar syslog worden gekopieerd via UDP, TCP of TLS.

---

## In de browser

De interface is beschermd tegen code die in een pagina wordt geïnjecteerd:

* Een [Content-Security-Policy](../security/hardening.html#the-content-security-policy) staat alleen de eigen scripts en frames van de applicatie toe.
* Elk antwoord bevat beschermende headers: nosniff, framebescherming, en HSTS via HTTPS.
* De HTML van formulieren, helpteksten en chatantwoorden wordt opgeschoond, en joboutput wordt ge-escaped.

---

## Op de server

De code die gebruikersinvoer verwerkt, vermijdt de klassieke injecties:

* Databasequery's geven hun waarden door als parameters, nooit als tekst die in de query is geplakt.
* Commando's, git inbegrepen, draaien vanuit een argumentenlijst, nooit via een shell, dus shelltekens doen niets.
* Serverexpressies gaan door een [expressie-sanitizer](../security/hardening.html#expressions-and-outbound-calls), en hun REST-aanroepen door een hostfilter.
* De [MCP-server](../mcp/), de [chatassistent](../chat/) en het metrics-endpoint staan uit tot je ze aanzet.

---

## Verbindingen

Verkeer van en naar AnsibleForms kan van begin tot eind versleuteld worden:

* De applicatie biedt zelf [HTTPS](../security/https.html) aan, of staat achter je reverse proxy.
* Een runtime-omgeving praat met de applicatie via een WebSocket, `wss://` bij een HTTPS-adres, en de applicatie
  pint het certificaat van een inkomende vast, zie [RTE-modi](../rte/modes.html).
* LDAP, single sign-on, de runners, git, de secret stores en de REST-aanroepen van expressies controleren het certificaat van de
  server die ze bereiken, tenzij een beheerder die controle uitzet voor een server met een zelfondertekend certificaat.

### Uitgaande verbindingen

AnsibleForms maakt alleen verbinding met wat een beheerder configureert:

| Verbinding | Wanneer |
|---|---|
| LDAP, OpenID Connect, Entra ID (Microsoft-aanmelding en Graph) | Wanneer die aanmeldmethode is ingesteld |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Wanneer een formulier op die runner draait |
| Git-servers | Wanneer een repository is ingesteld |
| Mailserver, Slack, Teams, Telegram, webhooks | Wanneer een meldingskanaal is ingesteld |
| HashiCorp Vault, CyberArk | Wanneer een secret store is ingesteld |
| Een modelprovider (Anthropic, OpenAI en andere) | Alleen als de [chatassistent](../chat/) aanstaat, en die staat standaard uit |
| Hosts en API's die in formulieren worden genoemd | Wanneer de expressies van een formulier of een playbook ze aanroepen |
| Syslog-servers | Wanneer het doorsturen van audit of logs is ingesteld |

---

## De containers

De images zijn gebouwd om met zo weinig mogelijk rechten te draaien:

* De applicatie en de runtime-omgeving draaien als de niet-geprivilegieerde gebruiker `node`, niet als root.
* Ze zijn gebouwd op slanke Debian-images die op digest zijn vastgepind, zie [Veilige ontwikkeling](development.html#code-analysis-and-dependencies).
* De applicatie luistert op één poort, 8000.

Volg [Hardening](../security/hardening.html) voor de stappen om een nieuwe instantie te beveiligen.

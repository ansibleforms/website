---
layout: default
title: Hardening
parent: Beveiliging
nav_order: 1
redirect_from:
  - /production/hardening.html
translated_from: be22a8ac091b17a67815ab392de93cd0ff519dd9
---

# Hardening
{: .no_toc }

Het adminaccount, aanmeldlimieten, de database, expressies, jobgegevens, het browserbeleid, optionele functies en rolinstellingen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het adminaccount

Het lokale adminaccount wordt bij de eerste start aangemaakt op basis van [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME)
en [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD), waarvan de standaardwaarde `AnsibleForms!123` is.

* Wie zich aanmeldt met het openbare standaardwachtwoord `AnsibleForms!123`, moet het eerst wijzigen: tot dan beantwoordt de server
  elk verzoek behalve de wachtwoordwijziging met `403` (code `password_change_required`), en toont de browser een
  pagina om het wachtwoord te wijzigen die niet kan worden gesloten. Het nieuwe wachtwoord mag niet opnieuw het standaardwachtwoord zijn.
* `ADMIN_PASSWORD` wordt alleen gelezen wanneer het account voor het eerst wordt aangemaakt: stel je eigen waarde in vóór de eerste start.
* [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN)`=1` zet het wachtwoord bij elke start terug op `ADMIN_PASSWORD`.
  Gebruik het alleen om een verloren wachtwoord te herstellen, verwijder het daarna en herstart.
* Stel eerst de twee hoofdgeheimen in: zie [Geheimen en versleuteling](secrets.html).
* Zodra aanmelden via LDAP of SSO werkt, bewaar je de lokale admin alleen voor noodgevallen, met een lang wachtwoord in je kluis.

---

## Aanmeldlimieten en wachtwoorden

Het raden van wachtwoorden wordt door drie limieten afgeremd. De mislukte pogingen worden in de database geteld, zodat elke app-node dezelfde
pogingen ziet, en elke limiet geldt zonder herstart:

| Variabele | Standaard | Wat ze doet |
|----------|---------|--------------|
| [`LOGIN_MAX_FAILURES`](../customization/security.html#env_LOGIN_MAX_FAILURES) | `5` | Na zoveel mislukte aanmeldingen wordt een lokaal of LDAP-account `LOGIN_LOCKOUT_MINUTES` lang geblokkeerd. |
| [`LOGIN_MAX_FAILURES_PER_IP`](../customization/security.html#env_LOGIN_MAX_FAILURES_PER_IP) | `30` | Een adres met zoveel mislukte aanmeldingen binnen `LOGIN_LOCKOUT_MINUTES` wordt tegengehouden tot dat venster eindigt: één adres dat veel accounts probeert. |
| [`LOGIN_LOCKOUT_MINUTES`](../customization/security.html#env_LOGIN_LOCKOUT_MINUTES) | `15` | Hoe lang een account geblokkeerd blijft, en het venster waarin mislukte pogingen worden geteld. |
| [`AUTH_RATE_LIMIT`](../customization/security.html#env_AUTH_RATE_LIMIT) | `120` | Verzoeken per minuut van één adres, per app-node, op de callbacks voor aanmelden, afmelden, tokenvernieuwing en single sign-on. |

Een geblokkeerd account of een tegengehouden adres krijgt `429` met een header `Retry-After`, voordat er een wachtwoord wordt gecontroleerd en
ongeacht of het account bestaat; boven `AUTH_RATE_LIMIT` is het antwoord ook `429`. Een geslaagde aanmelding wist de
telling van het account, en dat doet ook een admin die het wachtwoord van de gebruiker instelt. `0` schakelt een limiet uit; `LOGIN_LOCKOUT_MINUTES=0`
schakelt zowel de blokkering als de limiet per adres uit.

`LOGIN_MAX_FAILURES_PER_IP` en `AUTH_RATE_LIMIT` tellen per clientadres: stel achter een reverse proxy `TRUST_PROXY` in,
zodat het adres dat van de client is en niet dat van de proxy, zie [Clientadressen](../production/reverse-proxy.html#client-addresses).

Een lokaal wachtwoord dat via de applicatie wordt ingesteld, voor een nieuwe gebruiker, door een admin of door gebruikers die hun eigen wachtwoord wijzigen, moet
minstens [`PASSWORD_MIN_LENGTH`](../customization/security.html#env_PASSWORD_MIN_LENGTH) tekens hebben (standaard `8`,
`0` controleert geen lengte). Het mag niet de gebruikersnaam of het openbare standaardwachtwoord zijn. `ADMIN_PASSWORD` wordt niet gecontroleerd.

---

## De database

AnsibleForms bewaart elke referentie en elke job in zijn MySQL-database, dus houd die database van het netwerk af:

* Het docker-compose-project publiceert MySQL op de host (`MYSQLDB_LOCAL_PORT`, `3306`) en wordt geleverd met het
  rootwachtwoord `AnsibleForms!123`. Verwijder die poortkoppeling, of bind haar aan `127.0.0.1`, en wijzig het wachtwoord.
* Maak verbinding met een eigen account in plaats van `root`, ingesteld in [`DB_USER`](../customization/server.html#env_DB_USER) en
  [`DB_PASSWORD`](../customization/server.html#env_DB_PASSWORD). Het heeft alleen rechten op het schema `AnsibleForms` nodig:

  ```sql
  CREATE USER 'ansibleforms'@'%' IDENTIFIED BY '<password>';
  GRANT ALL PRIVILEGES ON `AnsibleForms`.* TO 'ansibleforms'@'%';
  ```

  Dat dekt het aanmaken van het schema (de `CREATE DATABASE` inbegrepen), het patchen ervan bij upgrades, en de
  [back-ups](../production/backups.html) en het terugzetten, die als dezelfde gebruiker draaien: de dump wordt gemaakt met
  `--no-tablespaces`, dus er is geen serverbreed recht zoals `PROCESS` nodig. Vervang `%` waar mogelijk door het adres van de
  applicatie. Een gebruiker met rechten op elke database, zoals `root`, maakt van een gat in de applicatie
  een gat in de hele databaseserver: de pagina **Status** waarschuwt ervoor in de controle **Databasegebruiker**, en het log
  bij elke start.
* Zet [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) op `0` zodra het schema bestaat.
  Het aanmaken van het schema verwijdert eerst elke tabel; met `0` kunnen noch de bootstrap bij het opstarten noch het endpoint
  `/api/v2/schema` het uitvoeren.

---

## Expressies en uitgaande aanroepen

Serverexpressies draaien op de server voor elke aangemelde gebruiker, dus de sanitizer en de uitgaande filters doen ertoe:

* [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) : `strict` of `paranoid`, nooit `legacy`, waarmee gebruikers servercode kunnen uitvoeren.
* [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) : hosts die REST-expressies niet mogen bereiken, bijv. `169.254.169.254,127.0.0.0/8`.
* [`REST_ALLOWED_HOSTS`](../customization/security.html#env_REST_ALLOWED_HOSTS) : als die is ingesteld, kunnen REST-expressies
  alleen deze hosts en bereiken bereiken. De lijst met geweigerde hosts gaat erboven.

Beide lijsten dekken alleen de REST-hulpfuncties van AnsibleForms zelf; playbooks draaien daarbuiten en worden niet gefilterd.

Vanaf 7.3.0 controleren de REST-hulpfuncties het certificaat van het endpoint, zoals elke andere verbinding.
[`REST_IGNORE_CERTS`](../customization/security.html#env_REST_IGNORE_CERTS)`=1` schakelt de controle uit: gebruik het alleen voor
endpoints met een zelfondertekend certificaat.

---

## Jobgegevens

De extravars en uitvoer van jobs worden in de database opgeslagen en getoond aan iedereen die de job kan zien:

* [`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) : extravars waarvan de sleutel overeenkomt, worden
  getoond als `********`. De standaard is `password|secret|token`; wachtwoordvelden worden altijd gemaskeerd. Breid het uit met
  de namen die je formulieren gebruiken, bijvoorbeeld `password|secret|token|apikey|passphrase`.
* [`EXTRAVARS_USER_FIELDS`](../customization/security.html#env_EXTRAVARS_USER_FIELDS) : beperkt het object `ansibleforms_user`
  dat met elke job wordt meegestuurd, dat anders het hele groepslidmaatschap van de gebruiker bevat.
* [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT) verbergt alleen luidruchtige taken; verberg geheimen met `no_log`.

---

## De Content-Security-Policy

De interface wordt geleverd met een header Content-Security-Policy, die beperkt wat een pagina in de browser mag laden en uitvoeren:

* Scripts komen alleen van de applicatie zelf, dus een script dat in een pagina is geïnjecteerd, draait niet.
* Geen andere site mag de interface in een frame tonen.
* Ze staat toe wat de applicatie nodig heeft: lokale formulierexpressies die in de browser worden geëvalueerd (`'unsafe-eval'`), inline
  stijlen, afbeeldingen van elke URL (afbeeldingen van formulieren en categorieën), en de workers van de code-editor.

[`CONTENT_SECURITY_POLICY`](../customization/security.html#env_CONTENT_SECURITY_POLICY) is standaard `1` en hoort dat te
blijven. Met `0` wordt het beleid verstuurd als `Content-Security-Policy-Report-Only`: de browserconsole toont wat het zou
blokkeren, en er wordt niets geblokkeerd. Gebruik `0` alleen voor een opzet die nog niet met het beleid kan werken, zoals een reverse proxy
die een eigen script injecteert. Een wijziging op de instellingenpagina geldt zonder herstart.

---

## De instellingenpagina's en de designer

Beheerders kunnen een groot deel van de configuratie vanuit de browser wijzigen. Beperk dat waar de configuratie elders staat:

* [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0` : alleen-lezen instellingen, voor een [beheerde omgeving](../seed/environment-and-audit.html).
* [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)`=0` : verwijdert de ingebouwde designer wanneer formulieren
  in git worden onderhouden.

---

## Optionele functies

Deze functies staan standaard uit. Schakel ze alleen in als je ze gebruikt; een wijziging op de instellingenpagina geldt zonder herstart:

* [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) : biedt de [MCP-server](../mcp/) aan op `/api/v2/mcp`,
  zodat MCP-clients formulieren kunnen starten met het token van een gebruiker.
* [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT) : de [chat-assistent](../chat/). Formulierdefinities
  en de waarden die worden ingevuld, worden naar de geconfigureerde modelprovider gestuurd.

[`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) werkt andersom: die staat standaard op `enforce`,
zodat de server een start weigert waarvan de waarden de regels van het formulier overtreden, ook starts via de REST API.
Laat hem zo staan: `log` logt alleen wat zou worden geweigerd en `off` controleert niets, zie [Validatie bij het starten](../launch-validation/).

---

## Rolinstellingen

Sommige rolinstellingen in [config.yaml](../config/roles.html) geven meer dan hun naam doet vermoeden. Geef ze met zorg:

| Instelling | Waarom het ertoe doet |
|--------|----------------|
| `allowScheduledJobs` | Een gebruiker met deze instelling ziet elke planning en kan ze wijzigen, en een planning draait met adminrechten, voor elk formulier. Behandel haar als instelling op adminniveau. |
| `allowBackupOps` | Omvat **terugzetten**, wat de hele database vervangt. |
| `showSettings` | Opent de beheerpagina's. Zonder de rol admin kan ze de accounts en groepen die de rol admin noemt niet wijzigen, zie [Gebruikers en groepen](../users-and-groups.html#accounts-that-grant-admin). |
| `showLogs` | Toont het serverlog, dat hostnamen, gebruikersnamen en foutdetails kan bevatten. |
| `showConnectionsSettings` | Opent de verbindingspagina's: referenties, runners, meldingskanalen en meer. Runners en secret stores toevoegen, wijzigen en verwijderen blijft voorbehouden aan een admin, net als de referenties van verbindingen en aanmeldingen. Bij een repository blijven toevoegen of verwijderen en het wijzigen van het adres, de branch of de vlaggen `use_for_*` voorbehouden aan een admin. |
| `showAllJobLogs` | Toont de jobs van elke gebruiker, niet alleen de eigen. |
| `manageAllJobs` | Breekt de jobs van elke gebruiker af, verwijdert ze en start ze opnieuw. |
| `allowApiTokens` | Laat de gebruiker API-tokens maken die tot [`API_TOKEN_MAX_DAYS`](../customization/security.html#env_API_TOKEN_MAX_DAYS) leven (standaard 90). Afmelden met een token of het intrekken ervan beëindigt het, en een wachtwoordwijziging beëindigt alle tokens van de gebruiker, zie [Tokens](secrets.html#tokens). |
| `extendedTokenExpiration` | Laat de gebruiker met `allowApiTokens` ook API-tokens maken die nooit verlopen. |
| `allowFileUploads` | Laat de gebruiker bestanden uploaden via de bestandsvelden van een formulier. Aan voor elke gebruiker, tenzij een rol het uitzet. |
| `allowChat`, `allowMcp` | Laten de gebruiker de chat-assistent en de MCP-server gebruiken, als die zijn ingeschakeld. `allowChat` staat aan voor elke gebruiker, tenzij een rol het uitzet, en `allowMcp` volgt `allowChat`, tenzij een rol het instelt. |

Een gebruiker zonder de rol `admin` krijgt geen van de instellingen op adminniveau hierboven, tenzij een rol ze geeft. Als de rol `admin`
geen instellingen instelt, krijgen zijn gebruikers `showSettings`, `showDesigner`, `showLogs`, `showAuditLog`, `allowBackupOps`,
`allowJobRelaunch`, `showAllJobLogs`, `manageAllJobs` en `allowScheduledJobs`. `allowApiTokens` en
`extendedTokenExpiration` blijven zelfs voor de rol `admin` uit: stel ze in op de rollen die ze nodig hebben.

Als meerdere rollen van een gebruiker dezelfde instelling instellen, wint `false`. De instellingen van de rol `default` vullen alleen de instellingen aan
die geen van de eigen rollen van de gebruiker instelt; ze gaan er nooit boven.

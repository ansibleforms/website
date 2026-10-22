---
layout: default
title: Beheer
parent: Rondleiding door de interface
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Beheer
{: .no_toc }

Het menu Instellingen: het systeem, het uiterlijk, toegang, verbindingen en logs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Het menu Instellingen

**Instellingen** in de kopbalk opent de beheerpagina's, in het linkermenu gegroepeerd onder **Systeem**, **Uiterlijk**,
**Toegang**, **Verbindingen** en **Logboeken**. Elk item verschijnt alleen voor een gebruiker met de rol-optie die de pagina nodig heeft:
`allowBackupOps` voor **Back-ups**, `showLogs` voor **Serverlog**, en `showSettings` voor elke andere pagina.
Vanaf 7.3.0 openen drie opties een deel ervan zonder de rest:

| Rol-optie | Opent |
|---|---|
| `showAppearanceSettings` | De pagina's onder **Uiterlijk** |
| `showConnectionsSettings` | De pagina's onder **Verbindingen**, behalve **Syslog**; repositories, secret stores en beschermde referenties blijven door een beheerder te wijzigen |
| `showAuditLog` | Het **Auditlogboek** |

Zie [Rollen](../config/roles.html#role-options) voor de rol-opties.

---

## Lijsten en recordpagina's

Vanaf 7.3.0 delen de lijsten en recordpagina's van de instellingen één indeling, met hun bedieningselementen op een eigen rij onder de titel:

| Deel | Hoe het werkt |
|---|---|
| Zoekvak | Als eerste in die rij op elke instellingenpagina en recordpagina. Een woord beperkt alle tabbladen tegelijk: de overeenkomende velden, rijen of regels verschijnen onder de naam van hun tabblad |
| Paginagrootte | Een tabel toont zoveel rijen als op het scherm passen, tot er een paginagrootte wordt gekozen: 10, 20, 50 of 100 |
| Kolommen | Elke kolom met een naam is sorteerbaar, en een lege cel toont `–` |
| Selectievakjes | Rijen hebben ze alleen waar er iets te doen valt met de aangevinkte rijen, en het rijmenu (⋮) biedt dezelfde actie |
| Rijmenu | Korte labels, zoals **Bewerken** en **Verwijderen**. Een lijst met een kolom **Ingeschakeld** heeft die als eerste, en biedt in elk rijmenu **Inschakelen** of **Uitschakelen**, al naar gelang wat van toepassing is |

De lijsten met een kolom **Ingeschakeld** zijn de SSO-providers, de LDAP-directory's, de runners, de planningen, de meldingskanalen,
de syslogservers, de aankondigingen, de labels en de versies van de disclaimer.

---

## Systeem

De instantie zelf: de instellingen, de gezondheid en de back-ups.

| Pagina | Waarvoor het dient |
|---|---|
| **Algemeen** | De omgevingsvariabelen, in tabbladen van Configuratie tot Logboek. Zie [Omgevingsvariabelen](../customization/). |
| **Status** | De gezondheid van de instantie en de systemen waarvan ze afhankelijk is, in de tabbladen Controles en Informatie. Zie [Monitoring](../production/monitoring.html). |
| **Back-ups** | Back-ups maken, herstellen en verwijderen van de database, config.yaml en de formulieren. Zie [Back-ups](../production/backups.html). |

![Instellingen > Algemeen, het tabblad Configuratie](../assets/screenshots/settings.jpg)

### Back-ups

De lijst met back-ups, nachtelijk en handmatig: **Back-up toevoegen** maakt er nu een, en het menu van een rij heeft **Back-up tonen**, **Herstellen** en **Verwijderen**.

![Instellingen > Back-ups](../assets/screenshots/backups.jpg)

### Herstellen

**Herstellen** toont wat de back-up bevat en herstelt die daarna; **Maak eerst een nieuwe back-up aan voor het herstellen (aanbevolen)** is standaard aangevinkt.

![Een back-up herstellen](../assets/screenshots/restore.jpg)

---

## Uiterlijk

Hoe de instantie er voor iedereen uitziet, en de berichten die ze toont.

| Pagina | Waarvoor het dient |
|---|---|
| **Standaardwaarden** | Het thema, de taal, de formulierweergave, de tijdzone en het datumformaat van gebruikers die niets hebben gekozen. Zie [Standaardwaarden](../appearance/defaults.html). |
| **Naam** | De naam in het browsertabblad en op de aanmeldpagina. Zie [Naam](../appearance/name.html). |
| **Logo** | Je eigen logo in de kopbalk. Zie [Logo](../appearance/logo.html). |
| **Pictogram** | Je eigen pictogram in het browsertabblad. Zie [Pictogram](../appearance/icon.html). |
| **Links** | De link naar de Designer, en je eigen links en menu's in de kopbalk. Zie [Links](../appearance/links.html). |
| **Labels** | Labels naast het logo, zoals PRODUCTION en EU. Zie [Labels](../appearance/labels.html). |
| **Aankondigingen** | Berichten onder de kopbalk, elk van zijn begin tot zijn einde. Zie [Aankondigingen](../announcements.html). |

---

## Toegang

Wie zich mag aanmelden, en wat hij daarna mag doen.

| Pagina | Waarvoor het dient |
|---|---|
| **Disclaimer** | Voorwaarden die elke gebruiker één keer accepteert, en wie welke versie heeft geaccepteerd. Zie [Disclaimer](../disclaimer.html). |
| **Gebruikers** | De lokale gebruikers, en die van LDAP en single sign-on. Zie [Gebruikers en groepen](../users-and-groups.html). |
| **Groepen** | De lokale groepen, en die van LDAP en single sign-on. Zie [Gebruikers en groepen](../users-and-groups/local-group.html). |
| **Rollen** | De rollen van config.yaml: wie ze heeft en wat ze toestaan. Zie [Rollen](../config/roles.html). |
| **LDAP** | Aanmelden met een LDAP-directory of Active Directory. Zie [LDAP](../authentication/ldap.html). |
| **SSO** | Single sign-on met Entra ID of OpenID Connect-providers. Zie [Authenticatie](../authentication/). |

![Toegang > LDAP, de hoofddirectory](../assets/screenshots/ldap.jpg)

---

## Verbindingen

De systemen die AnsibleForms bereikt, en waarmee het zich daarbij aanmeldt.

| Pagina | Waarvoor het dient |
|---|---|
| **Repositories** | De git-repositories waar de formulieren en playbooks vandaan komen. Zie [Git-repositories](../repositories/). |
| **Inloggegevens** | De accounts en secrets die formulieren, playbooks en verbindingen gebruiken. Zie [Referenties](../credentials.html). |
| **Secret stores** | HashiCorp Vault en CyberArk, waaruit referenties kunnen worden gelezen. Zie [Secret stores](../secret-stores/). |
| **Runners** | Waar jobs draaien: RTE-containers voor playbooks, en AWX en dergelijke voor templates. Zie [Runners](../runners.html). |
| **SSH** | Het sleutelpaar waarmee de app verbinding maakt met git, en de known hosts. Zie [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Meldingen** | SMTP-servers, Slack, Microsoft Teams, Telegram en webhooks. Zie [Meldingskanalen](../notification-channels.html). |
| **Chat-assistent** | De AI-provider van de chat-assistent. Zie [Chat-assistent](../chat/). |
| **MCP** | De MCP-server voor AI-agents. Zie [MCP](../mcp/). |
| **Syslog** | Syslogservers die het serverlog, het auditlogboek of beide ontvangen. Zie [Syslog](../production/logs.html#syslog). |

![Verbindingen > Inloggegevens, het tabblad Verbinding van een referentie](../assets/screenshots/credentials.jpg)

---

## Logboeken

Wat er op de instantie is gebeurd.

| Pagina | Waarvoor het dient |
|---|---|
| **Auditlogboek** | Wie wat heeft gewijzigd, en of dat was toegestaan, gefilterd op gebruiker, actie en resultaat. Zie [Audittrail](../production/logs.html#audit-trail). |
| **Serverlog** | Het eigen log van de server, voor het oplossen van problemen. Zie [Logs](../production/logs.html). |

### Serverlog

De laatste regels van het log, de nieuwste onderaan, gevolgd terwijl ze worden geschreven. Het zoekvak filtert ze (een reguliere
expressie), **Wissen** maakt de weergave leeg, niet het log, en **Downloaden** slaat het hele log op.

![Logboeken > Serverlog](../assets/screenshots/logs.jpg)

---

## API-documentatie

**API-documentatie** in het helpmenu (het vraagteken in de kopbalk) linkt naar de Swagger UI van de REST API op `/api/v2/docs`.
Zie [API](../api/).

![Swagger-interface](../assets/screenshots/swagger.jpg)

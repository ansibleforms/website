---
layout: default
title: Configuratie-seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
---

# Configuratie-seed
{: .no_toc }

De beheerobjecten in een bestand declareren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders die vanuit git uitrollen: declareer de beheerobjecten in een bestand, zodat een instantie op een lege database opnieuw kan worden opgebouwd.

---

## Wat het dekt

Stel `CONFIG_SEED_PATH` in op een YAML-bestand, en AnsibleForms past het bij het opstarten toe. Het bestand declareert objecten en
instellingen die anders alleen in de database bestaan:

| Sectie             | Wat ze declareert                                                                 |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Waar jobs draaien: RTE's, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins       |
| `secret_stores`    | Secret stores (HashiCorp Vault, ...)                                              |
| `credentials`      | Referenties                                                                       |
| `databases`        | De databases die formulieren bevragen, elk met zijn referentie, vanaf 7.5.0        |
| `sso`              | SSO-providers: Entra ID en OIDC (`oauth2` vóór 7.8.0)                             |
| `repositories`     | Git-repositories, en wat de app uit elk ervan leest                               |
| `syslog`           | De syslogservers die het serverlog en de auditregels krijgen (`syslog_servers` vóór 7.8.0) |
| `notifications`    | Mailservers, Slack, Teams, Telegram en webhooks (`notification_channels` vóór 7.8.0) |
| `labels`           | De labels naast het logo in de kopbalk, vanaf 7.3.0                                |
| `ldap`             | De LDAP-configuratie                                                              |
| `settings`         | De publieke URL; de mailsleutels zijn sinds 7.6.0 verouderd, ten gunste van een mailkanaal |
| `chat_assistant`   | De modelprovider van de chat-assistent (`chat` vóór 7.8.0)                        |
| `users`            | Gebruikers, lokaal en uit een directory, sinds 7.8.0                              |
| `groups`           | Lokale groepen en hun leden, sinds 7.8.0                                          |
| `defaults`         | **Instellingen > Uiterlijk > Standaardwaarden**: thema, taal, tijdzone, sinds 7.8.0 |
| `logo`, `icon`     | Het logo en het websitepictogram, afbeeldingsbestanden naast de seed, sinds 7.8.0 |
| `name`             | De naam van de app, sinds 7.8.0                                                   |
| `links`            | De links in de kopbalk, en of de Designer-link wordt getoond, sinds 7.8.0         |
| `announcements`    | De aankondigingen onder de kopbalk, sinds 7.8.0                                   |
| `disclaimer`       | De versies van de disclaimer die gebruikers accepteren, sinds 7.8.0               |
| `mcp`              | De schakelaars van de MCP-server, sinds 7.8.0                                     |
| `ssh`              | De private SSH-sleutel van de app en zijn known hosts, sinds 7.8.0                |
| `awx`              | Verouderd sinds 7, verwijderd in 8: gebruik `runners` met `type: awx`             |

Het [Voorbeeld](example.html) toont elke sectie, en [Beheerde objecten](managed-objects.html) hoe ver de seed eigenaar is van wat elke
sectie declareert: de meeste secties maken hun objecten alleen-lezen in de app, een paar maken of wijzigen ze alleen.

Een seed die vóór 7 is geschreven, blijft werken: elk item van de sectie `awx` wordt toegepast als runner van het type `awx`, en het log
waarschuwt bij elke toepassing. Verplaats die items naar `runners` met `type: awx` voordat je naar 8 upgradet.

De seed is **niet** hetzelfde als `config.yaml` (`CONFIG_PATH`), de basisconfiguratie van de categorieën, rollen en constanten. Een
repository kan die in plaats daarvan bevatten, en die repository is een van de objecten die de seed declareert, dus de seed kan er niet in staan.

De eerste admin komt nog steeds uit `ADMIN_USERNAME` / `ADMIN_PASSWORD`, en de gebruikers van LDAP of SSO bij het aanmelden uit hun directory.
Sinds 7.8.0 kunnen de secties `users` en `groups` lokale gebruikers en groepen toevoegen, en een directorygebruiker blokkeren voordat hij zich aanmeldt.

---

## Hernoemde secties

Sinds 7.8.0 hebben vier secties de naam van de sleutels waaronder een [git-repository](../repositories/) dezelfde objecten bewaart, zonder
`controller_` (`sso:` voor `controller_sso:`):

| Vóór 7.8.0                | Sinds 7.8.0        |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Hun items zijn ongewijzigd. De oude namen worden nog gelezen, verouderd sinds 7.8.0 en verwijderd in 8: elke oude naam die wordt toegepast,
logt een waarschuwing in het serverlog met de nieuwe naam. Een seed die één sectie onder beide namen geeft, wordt geweigerd. Hernoem ze in het
bestand voordat je naar 8 upgradet.

---

## In deze sectie

Elk onderwerp heeft een eigen pagina:

| Pagina | Wat er aan bod komt |
|---|---|
| [Voorbeeld](example.html) | Een compleet seedbestand, sectie voor sectie |
| [Beheerde objecten](managed-objects.html) | Hoe de seed eigenaar is van de objecten die hij noemt, en hoe hij geheimen buiten houdt |
| [Herladen en opstarten](reloading.html) | Het bestand wijzigen zonder herstart, en wat er bij het opstarten gebeurt |
| [Kubernetes](kubernetes.html) | AnsibleForms uitrollen vanuit een ConfigMap en Secrets |
| [Bewerken en audit](environment-and-audit.html) | De instellingenpagina's vergrendelen, en wat het auditlogboek vastlegt |

---
layout: default
title: Configuratie-seed
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
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

Stel `CONFIG_SEED_PATH` in op een YAML-bestand, en AnsibleForms past het bij het opstarten toe. Het bestand
declareert objecten die voorheen alleen in de database bestonden:

| Sectie                  | Wat ze declareert                                                   |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Waar jobs draaien: RTE's, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Secret stores (HashiCorp Vault, ...)                                |
| `credentials`           | Referenties                                                         |
| `oauth2`                | SSO-providers: Entra ID en OIDC                                     |
| `repositories`          | Git-repositories                                                    |
| `syslog_servers`        | De syslogservers die het serverlog en de auditregels krijgen        |
| `notification_channels` | Mailservers, Slack, Teams, Telegram en webhooks voor meldingen      |
| `labels`                | De labels naast het logo in de kopbalk, vanaf 7.3.0                 |
| `ldap`                  | De LDAP-configuratie                                                |
| `settings`              | De publieke URL, en de mailinstellingen die worden gebruikt als er geen mailkanaal actief is |
| `chat`                  | De modelprovider van de chat-assistent                              |
| `awx`                   | Verouderd sinds 7, verwijderd in 8: gebruik `runners` met `type: awx` |

Een seed die vóór 7 is geschreven, blijft werken: elk item van de sectie `awx` wordt toegepast als runner van het type `awx`, en het log
waarschuwt bij elke toepassing. Verplaats die items naar `runners` met `type: awx` voordat je naar 8 upgradet.

De seed is **niet** hetzelfde als `config.yaml`, dat de categorieën, rollen en constanten bevat
en een eigen `CONFIG_PATH` heeft. De twee worden bewust gescheiden gehouden: de
repository die `config.yaml` *bevat*, is een van de objecten die de seed declareert, dus de seed
kan er niet in staan.

Gebruikers en groepen blijven erbuiten: die komen uit LDAP of SSO, en de eerste admin uit `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

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

---
layout: default
title: Draaien in productie
nav_order: 12
has_children: true
has_toc: false
permalink: /production/
translated_from: 2d7f4be84a76837fae34c1b414a229448bfae4ea
---

# Draaien in productie
{: .no_toc }

Publiceer, back-up en monitor een instantie waarvan mensen afhankelijk zijn
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Voordat je live gaat

Met de standaardwaarden draait een instantie snel, maar een aantal ervan is alleen bedoeld om eens rond te kijken. AnsibleForms
logt bij het opstarten een waarschuwing `[SECURITY]` als `ENCRYPTION_SECRET` of `ACCESS_TOKEN_SECRET` niet is ingesteld, en de
pagina **Status** rapporteert over de back-ups, de instellingen voor de bewaartermijn en de expressie-sanitizer.

---

## Checklist voor productie

Loop deze punten één keer door voordat gebruikers van de instantie afhankelijk zijn, en opnieuw na een grote upgrade:

| Punt | Wat te doen | Details |
|------|------------|---------|
| Adminwachtwoord | Wijzig het wachtwoord van het lokale adminaccount | [Hardening](../security/hardening.html#the-admin-account) |
| Versleutelingsgeheim | Stel [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) in voordat je een referentie opslaat | [Geheimen en versleuteling](../security/secrets.html#the-two-master-secrets) |
| Tokengeheim | Stel [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET) in, zodat sessies een herstart overleven | [Geheimen en versleuteling](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Handel TLS af met je eigen certificaat, niet met het voorbeeldcertificaat | [HTTPS](../security/https.html) |
| Reverse proxy | Publiceer de instantie achter een proxy, optioneel onder [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Schema-endpoint | Zet [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) op `0` zodra het schema bestaat | [Hardening](../security/hardening.html#the-database) |
| Uitgaande aanroepen | Beperk REST-expressies met [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Hardening](../security/hardening.html#expressions-and-outbound-calls) |
| Optionele functies | Laat MCP en de chat-assistent uit, tenzij je ze gebruikt | [Hardening](../security/hardening.html#optional-features) |
| Back-ups | Controleer of de nachtelijke back-up werkt, en kopieer hem van de host af | [Back-ups](backups.html) |
| Bewaartermijn | Bepaal hoe lang jobs en auditregels worden bewaard | [Logs](logs.html#retention) |

---

## In deze sectie

Elk onderwerp heeft een eigen pagina; het beveiligen van de instantie wordt behandeld onder [Beveiliging](../security/):

| Pagina | Wat er aan bod komt |
|---|---|
| [Reverse proxy](reverse-proxy.html) | AnsibleForms publiceren achter Nginx, Traefik of Apache, op de root of onder een subpad |
| [Back-ups](backups.html) | Nachtelijke back-ups, wat ze bevatten, terugzetten, en wat je verder moet bewaren |
| [Logs](logs.html) | Logbestanden, syslog, het audittrail, en de bewaartermijn van jobs en auditregels |
| [Schalen](scaling.html) | Meerdere app-nodes met een worker; de RTE heeft een eigen sectie, [Runtime-omgevingen](../rte/) |
| [Monitoring](monitoring.html) | Health probes, Prometheus-metrics en de pagina Status |

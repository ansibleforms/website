---
layout: default
title: Typen runners
parent: Runners
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Typen runners
{: .no_toc }

De producten die een runner kan zijn, hun adres en aanmelding
{: .fs-6 .fw-300 }

De stap **Type** biedt één keuze per product, elk met een hint; die van de RTE schrijft de naam voluit, *Runtime-omgeving*. AAP en
Ascender worden opgeslagen als een runner van het type `awx` met een variant (`aap` of `ascender`), wat ook de configuratie-seed gebruikt:

| Type | Voorbeeld-uri | Project | Authenticatie |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | Het `RTE_TOKEN` van de RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Een API-token, of een gebruiker en wachtwoord |
| Ascender | `https://ascender.example.com/api/v2` | | Een API-token, of een gebruiker en wachtwoord |
| AWX | `https://awx.example.com/api/v2` | | Een API-token, of een gebruiker en wachtwoord |
| Jenkins | `https://jenkins.example.com` | De map waarin de jobs staan (optioneel) | Een gebruiker en het API-token van die gebruiker |
| Rundeck | `https://rundeck.example.com` | De projectnaam | Het API-token van een gebruiker |
| Semaphore | `https://semaphore.example.com` | Het project-id, het getal in `/project/<id>` | Het API-token van een gebruiker |

Een adres van AWX, AAP of Ascender bevat het API-pad: `/api/v2`, of `/api/controller/v2` voor AAP 2.5 en later.
Een RTE is de AnsibleForms-image gestart met `AF_ROLE=rte`; hoe je er een draait, staat beschreven in
[Runtime-omgevingen](../rte/).

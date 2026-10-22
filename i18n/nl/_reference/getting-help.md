---
layout: default
title: Hulp krijgen
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Hulp krijgen
{: .no_toc }

Waar je een vraag stelt, een bug of een beveiligingsprobleem meldt, en een verbetering voorstelt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Voordat je het vraagt

De meeste antwoorden staan al ergens beschreven; even kijken bespaart vaak een rondje heen en weer:

1. Doorzoek deze site met het zoekvak bovenaan elke pagina.
2. Zoek de exacte foutmelding op in [Probleemoplossing](troubleshooting.html), en blader door de [FAQ](faq.html).
3. Bekijk het serverlog (**Instellingen**, daarna **Serverlog**) en de pagina **Status**, die de meeste configuratieproblemen melden.
4. Bekijk de [Changelog](changelog.html): het probleem kan in een nieuwere release al zijn opgelost.

---

## Waar je terechtkunt

Elk soort verzoek heeft een eigen plek, allemaal op GitHub:

| Je wilt | Ga naar |
|---|---|
| Een vraag stellen of een idee delen | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Een bug melden | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Een functie voorstellen | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Een beveiligingsprobleem melden | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), privé |
| Deze documentatie corrigeren of verbeteren | **Edit this page on GitHub** onderaan elke pagina, of een [issue op de website](https://github.com/ansibleforms/website/issues) |

---

## Een bug melden

Een melding die kan worden gereproduceerd, wordt het snelst opgelost. Het sjabloon voor bugmeldingen vraagt om het volgende:

* **Versie** : te zien onder **Over** in het helpmenu (**?**) van de bovenbalk
* **Deployment** : Docker, Docker Compose, Kubernetes, het installatieprogramma (en de engine ervan), een native installatie of vanuit de broncode
* **Stappen om te reproduceren** : wat je deed, wat je verwachtte, en wat er in plaats daarvan gebeurde
* **Bewijs** : de relevante regels uit het serverlog, en een schermafbeelding als het probleem zichtbaar is

Voeg bij een probleem met een formulier een minimale formulierdefinitie toe die het laat zien. Verwijder wachtwoorden, tokens, hostnamen en alle
andere privégegevens uit logs en formulieren voordat je ze plaatst: issues en discussies zijn openbaar.

---

## Een beveiligingsprobleem melden

**Open er nooit een openbaar issue voor:** gebruik [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), dat alleen de maintainers zien.

Het [beveiligingsbeleid](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) noemt de ondersteunde versies en
wat er gebeurt nadat je een melding hebt gedaan.

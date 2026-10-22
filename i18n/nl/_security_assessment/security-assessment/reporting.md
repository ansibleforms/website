---
layout: default
title: Een kwetsbaarheid melden
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Een kwetsbaarheid melden
{: .no_toc }

Hoe je een beveiligingsprobleem vertrouwelijk meldt, en wat er daarna gebeurt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Meld het vertrouwelijk

AnsibleForms bewaart inloggegevens en vault-tokens, dus meld een beveiligingsprobleem nooit in een openbaar issue:

1. Open **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: een vertrouwelijke advisory die alleen de maintainers zien.
2. Is die pagina voor jou niet beschikbaar, open dan een gewoon issue waarin je alleen zegt dat je een beveiligingsmelding hebt en vraagt
   om een vertrouwelijk kanaal: geen details, geen reproductie, geen versienummers. Een maintainer opent een vertrouwelijke advisory en
   nodigt je daarvoor uit.

Het volledige beleid staat in [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) van de repository.

---

## Wat je meestuurt

Hoe meer hiervan een melding bevat, hoe sneller het wordt opgelost:

* Wat een aanvaller wint: de gegevens van een andere gebruiker, een playbook dat hij niet mag uitvoeren, de host, of adminrechten.
* De versie, en hoe die is uitgerold: Docker, Kubernetes, of native geïnstalleerd.
* Een reproductie, of het verzoek dat het probleem veroorzaakt.
* Of er een aangemelde gebruiker voor nodig is, en met welke [rolopties](../config/roles.html).

---

## Wat er daarna gebeurt

Een melding loopt via dezelfde vertrouwelijke advisory, van het eerste bericht tot de publicatie:

| Stap | Wat je krijgt |
|---|---|
| Ontvangstbevestiging | Bevestiging dat de melding is aangekomen, en of het probleem te reproduceren is |
| Geaccepteerd | Een oplossing in de volgende release van elke [ondersteunde versie](development.html#supported-versions), en een gepubliceerde advisory die jou vermeldt, tenzij je liever niet genoemd wordt |
| Afgewezen | De redenering, meestal dat het gedrag een recht vereist dat de melder al had |

Zodra de oplossing is uitgebracht, wordt de advisory gepubliceerd en verschijnt die in [Beveiligingsadvisories](advisories.html).

---

## Reikwijdte

Het beleid trekt de grens waar het rollenmodel die trekt:

| Binnen de reikwijdte | Buiten de reikwijdte |
|---|---|
| Alles wat een aangemelde gebruiker kan bereiken buiten wat zijn rol toestaat | Bevindingen waarvoor het adminaccount al gecompromitteerd moet zijn: een admin die elk playbook kan uitvoeren, is het product |
| Alles wat bereikbaar is zonder aan te melden | Scannerrapporten zonder aangetoonde impact |
| Opgeslagen inloggegevens die leesbaar worden, of in een log terechtkomen | |
| Injectie in de shell, de database of de browser | |

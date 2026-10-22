---
layout: default
title: Upgraden
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Upgraden
{: .no_toc }

Breng AnsibleForms naar een nieuwere release
{: .fs-6 .fw-300 }

---

Voor beheerders van een draaiende instantie: ga naar een nieuwere release, met de methode waarmee je hebt geïnstalleerd.

---

## In deze sectie

De upgradeprocedure hangt af van hoe je AnsibleForms hebt geïnstalleerd. Elke methode wordt op een eigen pagina beschreven:

| Pagina | Wat het behandelt |
|---|---|
| [Upgraden naar v7](../upgrade-7.html) | Wat je nog op 6.5 moet aanpassen, voordat je naar 7 gaat |
| [Met het installatieprogramma](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, voor een installatie die het installatieprogramma heeft gemaakt: back-up, release notes en rollback |
| [Docker](docker.html) | Haal de nieuwe image op en maak de container opnieuw aan met dezelfde instellingen |
| [Docker Compose](docker-compose.html) | Haal de nieuwe image op en herstart het docker-compose-project |
| [Vanuit de broncode](from-source.html) | Haal de nieuwe code op, bouw hem opnieuw en herstart de applicatie |
| [Kubernetes](kubernetes.html) | Ververs de chartrepository en voer `helm upgrade` uit met je waarden |

{: .note }
> **Eerst een back-up** Maak een back-up voordat je upgradet (**Instellingen → Back-ups**). Het databaseschema wordt bij de eerste
> start van de nieuwe release geüpgraded, dus de back-up is je terugvalpunt als er iets misgaat. Vanaf 7.3.0 maakt de worker er ook
> zelf een voordat hij vanaf een oudere release upgradet, met de naam van de release, tenzij
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) `0` is.

Welke release je krijgt, hangt af van de image-tag die je draait: `latest` volgt de nieuwste hoofdversie, terwijl een tag als `7`
op die hoofdversie blijft. Alle tags staan onder [Image-tags](../installation/#image-tags).

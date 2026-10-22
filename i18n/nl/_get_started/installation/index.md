---
layout: default
title: Installatie
nav_order: 1
has_children: true
has_toc: false
permalink: /installation/
translated_from: c5efb1a569cf31ab6b1817687a024e12c26eb128
---

# Installatie
{: .no_toc }

Kies een installatiemethode voor AnsibleForms
{: .fs-6 .fw-300 }

---

Voor beheerders die een nieuwe instantie opzetten: kies een installatiemethode en volg de bijbehorende pagina.

---

## In deze sectie

AnsibleForms ondersteunt verschillende installatiemethoden, elk beschreven op een eigen pagina:

| Pagina | Wat het behandelt |
|---|---|
| [Installatieprogramma](installer.html) | Eén commando dat een controller of een Runner installeert op Docker, Podman, Kubernetes of native, en die daarna bijwerkt en er back-ups van maakt |
| [Native](native.html) | De installatie van het installatieprogramma zonder containers: Node.js, MariaDB en Ansible op de server, AnsibleForms als systemd-services |
| [Docker](docker.html) | Installeer MySQL en draai de kant-en-klare Docker-image met de vereiste omgevingsvariabelen |
| [Docker Compose](docker-compose.html) | Download het [docker-compose-project](https://github.com/ansibleforms/docker) en start met docker-compose zowel MySQL als AnsibleForms |
| [Vanuit de broncode](from-source.html) | Installeer alle afhankelijkheden met de hand, en bouw en start daarna de code |
| [Kubernetes](kubernetes.html) | Installeer de Helm-chart en start met Kubernetes AnsibleForms en de bijbehorende MySQL-database |

{: .note }
> **Aanbeveling** Het installatieprogramma is sinds 7.3.0 de snelste weg naar een werkende instantie: op basis van een paar vragen zet het het Docker Compose-project op
> Docker of Podman op, of een van de andere methoden. De Docker-images bevatten alle afhankelijkheden.

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

Om een bestaande installatie naar een nieuwere release te brengen, zie [Upgraden](../upgrading/).

Elke methode draait één RTE naast de app, de container (of service) die de playbooks uitvoert. Wil je er nog een toevoegen, op een andere host of in een ander
datacenter, installeer dan een Runner met het [installatieprogramma](installer.html#a-runner): die belt AnsibleForms aan over één WebSocket (uitgaand, zie
[Modi](../rte/modes.html)) en bevat geen database-inloggegevens. Zie ook [Runtime-omgevingen](../rte/) en het bijbehorende runbook
[Een RTE in een ander datacenter](../rte/another-datacenter.html).

---

## Image-tags

De image wordt gepubliceerd als `ghcr.io/ansibleforms/ansibleforms` op de GitHub Container Registry, die van het
project is en anonieme pulls niet beperkt. Elke release vanaf 7.0.0 wordt alleen daar gepubliceerd, en de 6.x-releases
staan er ook.

Sinds 7 draaien playbooks op een RTE, die naast de app in drie lagen wordt gepubliceerd (zie [De RTE-images](../rte/images.html)):

| Image | Wat het is |
|---|---|
| `ghcr.io/ansibleforms/ansibleforms` | De webapplicatie en de API, zonder python of ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | De RTE zonder python of ansible: de basis voor je eigen RTE |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | De basis met python, ansible-core en een paar bibliotheken: de image om je collections aan toe te voegen |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | De core met het `ansible`-pakket, de bijbehorende collections en bibliotheken: de standaard-RTE |

De vier images worden in dezelfde run gebouwd en dragen dezelfde tags, dus een RTE-tag komt altijd overeen met die van de app.

De oude Docker Hub-repository, `ansibleguy/ansibleforms`, wordt niet meer bijgewerkt. De bestaande
releases blijven staan, maar er komen geen nieuwe versies van welke lijn dan ook bij. Pull je daarvandaan, stap dan over
op `ghcr.io/ansibleforms/ansibleforms` met dezelfde tag om updates te blijven ontvangen.

Op elke image zijn de volgende tags beschikbaar; de RTE-images beginnen bij 7.0.0 en hebben dus geen 6.x-tags:

| Tag | Verwijst naar |
|---|---|
| `latest` | de nieuwste release van de nieuwste hoofdversie |
| `7`, `6` | de nieuwste release van die hoofdversie |
| `7.0`, `6.5` | de nieuwste release van die minor-versie |
| `7.0.0`, `6.5.5` | precies die release |
| `latest-rc` | de nieuwste release candidate, of de nieuwste release als die nieuwer is; elke candidate heeft ook een eigen tag |

`latest` gaat alleen vooruit: een patch voor een oudere hoofdversie (bijvoorbeeld een 6.5.x die na 7.0.0
uitkomt) verplaatst `6` en `6.5`, maar nooit `latest`.

Wil je op een hoofdversie blijven, gebruik dan het nummer ervan (`6`) in plaats van `latest`.

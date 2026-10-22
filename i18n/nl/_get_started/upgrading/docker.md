---
layout: default
title: Docker
parent: Upgraden
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Upgrade een losse container, zonder docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een losse installatie upgrade je door de containers te vervangen: haal de nieuwe images op, verwijder de oude containers en
start nieuwe met dezelfde `run`-commando's. Sinds versie 7 zijn het er twee: AnsibleForms en de RTE die de
playbooks uitvoert, altijd op dezelfde release. Je bestanden staan in de gekoppelde map `/app/dist/persistent` en je gegevens in
MySQL, dus beide blijven behouden.

---

## Voordat je upgradet

Bereid de upgrade zo voor dat je terug kunt als er iets misgaat:

* **Maak een back-up** onder **Instellingen → Back-ups**. De nieuwe release upgradet het databaseschema bij de eerste start.
* **Lees de [changelog](../changelog)** voor de releases tussen je versie en de nieuwe.
* **Ga je naar een nieuwe hoofdversie?** Volg eerst [Upgraden naar v7](../upgrade-7.html).
* **Kom je van 6.5?** De images van 7 draaien als uid 1000 in plaats van root: maak die gebruiker één keer eigenaar van de mappen die je koppelt, bijvoorbeeld
  `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Kom je van 7.2?** De RTE krijgt een eigen bestand en de app belt hem aan: zie eerst [Van 7.2 naar 7.3](#from-72-to-73).

---

## Van 7.2 naar 7.3

Tot en met 7.2.0 las de RTE het omgevingsbestand van de app, met de instellingen van de database, en voegde hij zichzelf toe als runner vanuit `RTE_URL`. Dat
is databasemodus, verouderd in 7.3.0 en verwijderd in 8.0.0. Sinds 7.3.0 belt de app de RTE aan en houdt één WebSocket open
(`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)), en bevat de RTE geen database-instellingen. Eén keer, vóór stap 2:

1. Maak `/srv/apps/ansibleforms/rte.env` aan zoals de [installatie](../installation/docker.html#prepare-the-folders) dat doet, met
   `RTE_MODE=inbound`, hetzelfde `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` en `HTTPS=0`. Geen `DB_*`, geen `ENCRYPTION_SECRET`, geen `RTE_URL`
2. Declareer de runner in die modus. Voeg ofwel de [config seed](../seed/) van de installatie toe, `persistent/seed.yaml` met de RTE-referentie
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) en de runner `rte` (`rte_mode: inbound`), en voeg
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` toe aan het omgevingsbestand van de app. Of open, zonder seed, de runner onder
   **Verbindingen → Runners**, zet de **Modus** op **Inkomend**, en kies een RTE-referentie die `http://rte:8000` en het token bevat

Met de seed bevat het omgevingsbestand van de app ook `RTE_TOKEN`, hetzelfde token, omdat de seed het daaruit leest.

---

## 1. Haal de nieuwe images op

Download de nieuwste images van AnsibleForms en de RTE voor de tag die je draait:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Vervang de containers

Verwijder de oude containers en start nieuwe met de `run`-commando's van de [installatie](../installation/docker.html). De app
leest de databaseverbinding uit zijn omgevingsbestand, met de databasegebruiker van AnsibleForms (niet root). De RTE leest zijn eigen
`rte.env`, zonder de instellingen van de database, en de app belt hem aan over een netwerk dat beide containers delen:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Kom je van 6.5, dan is er nog geen RTE-container: de commando's `stop` en `rm` vinden alleen de app. Maak het gedeelde netwerk
één keer aan met `docker network create ansibleforms` (of `podman network create ansibleforms`). Zet, zoals de
[installatie](../installation/docker.html#prepare-the-folders) doet, de databaseverbinding, `ENCRYPTION_SECRET`, een `RTE_TOKEN`
van minstens 16 tekens en `CONFIG_SEED_PATH` in het omgevingsbestand van de app, en maak `rte.env` en de config seed aan. Gebruik je eigen
mappen waar je 6.5-installatie andere koppelde. De seed voegt de RTE onder **Verbindingen → Runners** toe als de standaardrunner `rte`;
zie [Upgraden naar v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Controleer de upgrade

Volg het log van AnsibleForms terwijl het start. De eerste start van een nieuwe release upgradet het databaseschema:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

De RTE schrijft een eigen log, dat `docker logs rte` toont. In AnsibleForms toont **Help → Over** de versie die draait, en **Instellingen → Status** de gezondheid van de
database, het schema en de andere systemen waarvan AnsibleForms afhankelijk is.

---

## Terugdraaien

Om terug te gaan naar de release die je eerder draaide, de versie die **Help → Over** vóór de upgrade toonde, voer je stap 2 opnieuw uit met
de exacte tag daarvan in plaats van `7`, op zowel de image van AnsibleForms als die van de RTE. Als die release niet start op de geüpgradede
database, herstel je de back-up die je onder **Instellingen → Back-ups** hebt gemaakt.

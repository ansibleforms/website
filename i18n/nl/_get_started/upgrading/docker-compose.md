---
layout: default
title: Docker Compose
parent: Upgraden
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Upgrade een installatie die met het docker-compose-project is gemaakt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Het docker-compose-project draait drie containers: MySQL (`mysqldb`), AnsibleForms (`app`) en de RTE die de
playbooks uitvoert (`rte`). AnsibleForms en de RTE gebruiken de image-tag `7`, die altijd naar de nieuwste 7.x-release wijst. Een
upgrade haalt de images opnieuw op en maakt de containers waarvan de image is veranderd opnieuw aan. Alles wat bewaard moet blijven, staat
in de map `data` en blijft behouden.

---

## Voordat je upgradet

Bereid de upgrade zo voor dat je terug kunt als er iets misgaat:

* **Maak een back-up** onder **Instellingen → Back-ups**. De nieuwe release upgradet het databaseschema bij de eerste start.
* **Lees de [changelog](../changelog)** voor de releases tussen je versie en de nieuwe.
* **Ga je naar een nieuwe hoofdversie?** Volg eerst [Upgraden naar v7](../upgrade-7.html).
* **Kom je van 6.5?** Het 6.x-project, op de branch `v6`, heeft geen container `rte`. Werk je kopie van het project bij naar
  de branch `main`, en behoud daarbij je `.env`-instellingen en je map `data`, zodat `docker-compose.yml` de service `rte`
  heeft. Dat compose-bestand zet `CONFIG_SEED_PATH`, en een 6.x-map `data` heeft geen `seed.yaml`: kopieer `data/seed.yaml` uit
  de repository, en voeg `RTE_TOKEN` (minstens 16 tekens) toe aan je `.env`, zoals de `.env` van de repository het heeft. Zonder die twee
  weigert de app te starten. De images van 7 draaien als uid 1000 in plaats van root: maak die gebruiker één keer eigenaar van de map `data`, en laat de MySQL-
  bestanden aan MySQL, met `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  De map `data/ssh` wordt nu gekoppeld op `/home/node/.ssh` in plaats van `/root/.ssh`.
* **Kom je van 7.2?** Werk `docker-compose.yml` en `data/seed.yaml` samen bij: zie eerst [Van 7.2 naar 7.3](#from-72-to-73).

---

## Van 7.2 naar 7.3

Tot en met 7.2.0 kreeg de service `rte` de instellingen van de database, en zijn runner, gedeclareerd in `data/seed.yaml`, draaide in databasemodus,
verouderd in 7.3.0 en verwijderd in 8.0.0. Sinds 7.3.0 belt de app de RTE aan op `http://rte:8000` en houdt één WebSocket open
(`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)), en bevat de RTE geen database-instellingen. Neem beide bestanden uit de branch
`main` van de repository, en behoud je `.env`:

| Bestand | Wat er verandert |
|---|---|
| `docker-compose.yml` | De service `rte` leest `.env` niet meer: hij krijgt `RTE_MODE=inbound`, `RTE_TOKEN` en `RTE_FILES=local`, en geen `DB_*` |
| `data/seed.yaml` | Een RTE-referentie `rte`, met `url: http://rte:8000` en `password: ${RTE_TOKEN}`, en de runner `rte` met `rte_mode: inbound` en `credential: rte` |

Wijzig beide. Met alleen het nieuwe compose-bestand houdt de seed de runner `rte` in databasemodus: de app roept de RTE aan als een 7.2-RTE,
waarop de nieuwe RTE niet antwoordt, en er draait geen enkel playbook. Een seed die je zelf hebt gewijzigd, heeft dezelfde referentie en `rte_mode` nodig.

Een runner die de seed heeft gemaakt, blijft beheerd en alleen-lezen onder **Verbindingen → Runners**, ook nadat je `CONFIG_SEED_PATH` verwijdert: alleen een
seed die wordt toegepast, geeft een runner vrij die hij niet meer declareert. Houd de seed dus en zet `rte_mode` daar, in plaats van
`CONFIG_SEED_PATH` te verwijderen om de runner met de hand te wijzigen.

Het [installatieprogramma](../installation/installer.html#upgrade) doet dit zelf: de upgrade vervangt `docker-compose.yml`, en `data/seed.yaml`
als dat een seed is die de repository meeleverde, ongewijzigd. Een met de hand gewijzigde seed blijft staan, en de nieuwe wordt ernaast opgeslagen.

---

## 1. Haal de nieuwe images op

Download de nieuwste images van de tags in `docker-compose.yml`:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Maak de containers opnieuw aan

Start het project opnieuw; de containers waarvan de image is veranderd, worden opnieuw aangemaakt:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Controleer de upgrade

Volg het log van AnsibleForms terwijl het start. De eerste start van een nieuwe release upgradet het databaseschema, en de RTE
start zodra AnsibleForms gezond is:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

In AnsibleForms toont **Help → Over** de versie die draait, en **Instellingen → Status** de gezondheid van de
database, het schema en de andere systemen waarvan AnsibleForms afhankelijk is.

---

## Terugdraaien

Om terug te gaan naar de release die je eerder draaide, de versie die **Help → Over** vóór de upgrade toonde, pin je de exacte tag daarvan in
`docker-compose.yml`, op zowel de image van AnsibleForms als die van de RTE, in plaats van `7`, en voer je stap 2 opnieuw uit. Als die release
niet start op de geüpgradede database, herstel je de back-up die je onder **Instellingen → Back-ups** hebt gemaakt. Zet de tags terug op
`7` om weer updates te ontvangen.

**VIDEO**: [AnsibleForms upgraden](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)

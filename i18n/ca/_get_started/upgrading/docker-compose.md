---
layout: default
title: Docker Compose
parent: Actualització
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Actualitza una instal·lació feta amb el projecte de docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El projecte de docker-compose executa tres contenidors: MySQL (`mysqldb`), AnsibleForms (`app`) i l'RTE que executa els
playbooks (`rte`). AnsibleForms i l'RTE fan servir l'etiqueta d'imatge `7`, que sempre apunta a la versió 7.x més nova. Una
actualització torna a baixar les imatges i torna a crear els contenidors amb una imatge que ha canviat. Tot el que ha de persistir es desa
a la carpeta `data` i es conserva.

---

## Abans d'actualitzar

Prepara l'actualització de manera que puguis tornar enrere si alguna cosa va malament:

* **Fes una còpia de seguretat** a **Configuració → Còpies de seguretat**. La versió nova actualitza l'esquema de la base de dades en el primer inici.
* **Llegeix el [registre de canvis](../changelog)** de les versions entre la teva i la nova.
* **Passes a una versió major nova?** Segueix primer [Actualitzar a la v7](../upgrade-7.html).
* **Véns de la 6.5?** El projecte 6.x, a la seva branca `v6`, no té contenidor `rte`. Actualitza la teva còpia del projecte a
  la seva branca `main`, conservant la configuració del teu `.env` i la teva carpeta `data`, perquè `docker-compose.yml` tingui el servei
  `rte`. Aquest fitxer compose defineix `CONFIG_SEED_PATH`, i una carpeta `data` de la 6.x no té `seed.yaml`: copia `data/seed.yaml` del
  repositori, i afegeix `RTE_TOKEN` (com a mínim 16 caràcters) al teu `.env`, tal com el té el `.env` del repositori. Sense això l'aplicació
  es nega a iniciar-se. Les imatges de la 7 s'executen amb l'uid 1000 en lloc de root: dona una vegada la carpeta `data` a aquest usuari, deixant els fitxers de MySQL
  a MySQL, amb `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  La carpeta `data/ssh` ara es munta a `/home/node/.ssh` en lloc de `/root/.ssh`.
* **Véns de la 7.2?** Actualitza `docker-compose.yml` i `data/seed.yaml` alhora: consulta primer [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

Fins a la 7.2.0 el servei `rte` rebia la configuració de la base de dades i el seu runner, declarat a `data/seed.yaml`, s'executava en mode database,
obsolet a la 7.3.0 i eliminat a la 8.0.0. Des de la 7.3.0 l'aplicació truca a l'RTE a `http://rte:8000` i hi manté un WebSocket obert
(`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)), i l'RTE no té cap configuració de la base de dades. Agafa tots dos fitxers de la branca
`main` del repositori, conservant el teu `.env`:

| Fitxer | Què canvia |
|---|---|
| `docker-compose.yml` | El servei `rte` ja no llegeix `.env`: rep `RTE_MODE=inbound`, `RTE_TOKEN` i `RTE_FILES=local`, i cap `DB_*` |
| `data/seed.yaml` | Una credencial d'RTE `rte`, amb `url: http://rte:8000` i `password: ${RTE_TOKEN}`, i el runner `rte` amb `rte_mode: inbound` i `credential: rte` |

Canvia'ls tots dos. Amb només el fitxer compose nou, el seed manté el runner `rte` en mode database: l'aplicació crida l'RTE com si fos un de la 7.2,
cosa que el nou RTE no respon, i no s'executa cap playbook. Un seed que hagis canviat tu mateix necessita la mateixa credencial i el mateix `rte_mode`.

Un runner que ha creat el seed continua gestionat, de només lectura a **Connexions → Runners**, fins i tot després de treure `CONFIG_SEED_PATH`: només un
seed que s'aplica allibera un runner que ja no declara. Així que conserva el seed i defineix-hi `rte_mode`, en lloc de treure
`CONFIG_SEED_PATH` per canviar el runner a mà.

L'[instal·lador](../installation/installer.html#upgrade) ho fa tot sol: la seva actualització substitueix `docker-compose.yml`, i `data/seed.yaml`
quan és un dels que venien amb el repositori, sense canvis. Un que s'hagi canviat a mà es conserva, i el nou es desa al costat.

---

## 1. Baixa les imatges noves

Baixa les imatges més noves de les etiquetes de `docker-compose.yml`:

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

## 2. Torna a crear els contenidors

Torna a iniciar el projecte; es tornen a crear els contenidors amb una imatge que ha canviat:

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

## 3. Comprova l'actualització

Segueix el registre d'AnsibleForms mentre s'inicia. El primer inici d'una versió nova actualitza l'esquema de la base de dades, i l'RTE
s'inicia quan AnsibleForms està en bon estat:

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

A AnsibleForms, **Ajuda → Quant a** mostra la versió que s'està executant, i **Configuració → Estat** mostra la salut de la
base de dades, de l'esquema i dels altres sistemes dels quals depèn AnsibleForms.

---

## Tornar enrere

Per tornar a la versió que executaves abans, la que mostrava **Ajuda → Quant a** abans de l'actualització, fixa la seva etiqueta exacta a
`docker-compose.yml` tant a la imatge d'AnsibleForms com a la de l'RTE, en lloc de `7`, i torna a executar el pas 2. Si aquella versió
no s'inicia amb la base de dades actualitzada, restaura la còpia de seguretat que vas fer a **Configuració → Còpies de seguretat**. Torna a posar les etiquetes a
`7` per tornar a rebre actualitzacions.

**VÍDEO**: [Com actualitzar AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)

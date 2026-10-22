---
layout: default
title: Docker
parent: Actualització
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Actualitza un contenidor independent, sense docker-compose
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una instal·lació independent s'actualitza substituint-ne els contenidors: baixa les imatges noves, suprimeix els contenidors antics i
inicia'n de nous amb les mateixes ordres `run`. Des de la versió 7 n'hi ha dos: AnsibleForms i l'RTE que executa els
playbooks, sempre en la mateixa versió. Els teus fitxers es desen a la carpeta muntada `/app/dist/persistent` i les teves dades a
MySQL, així que tots dos es conserven.

---

## Abans d'actualitzar

Prepara l'actualització de manera que puguis tornar enrere si alguna cosa va malament:

* **Fes una còpia de seguretat** a **Configuració → Còpies de seguretat**. La versió nova actualitza l'esquema de la base de dades en el primer inici.
* **Llegeix el [registre de canvis](../changelog)** de les versions entre la teva i la nova.
* **Passes a una versió major nova?** Segueix primer [Actualitzar a la v7](../upgrade-7.html).
* **Véns de la 6.5?** Les imatges de la 7 s'executen amb l'uid 1000 en lloc de root: dona una vegada a aquest usuari les carpetes que muntes, per
  exemple `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Véns de la 7.2?** L'RTE rep un fitxer propi i l'aplicació el truca: consulta primer [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

Fins a la 7.2.0 l'RTE llegia el fitxer d'entorn de l'aplicació, amb la configuració de la base de dades, i s'afegia ell mateix com a runner a partir de `RTE_URL`. Això
és el mode database, obsolet a la 7.3.0 i eliminat a la 8.0.0. Des de la 7.3.0 l'aplicació truca a l'RTE i hi manté un WebSocket obert
(`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)), i l'RTE no té cap configuració de la base de dades. Una sola vegada, abans del pas 2:

1. Crea `/srv/apps/ansibleforms/rte.env` com ho fa la [instal·lació](../installation/docker.html#prepare-the-folders), amb
   `RTE_MODE=inbound`, el mateix `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` i `HTTPS=0`. Cap `DB_*`, cap `ENCRYPTION_SECRET`, cap `RTE_URL`
2. Declara el runner en aquest mode. O bé afegeix el [config seed](../seed/) de la instal·lació, `persistent/seed.yaml` amb la credencial d'RTE
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) i el runner `rte` (`rte_mode: inbound`), i afegeix
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` al fitxer d'entorn de l'aplicació. O bé, sense seed, obre el runner a
   **Connexions → Runners**, posa el seu **Mode** a **Entrant**, i tria una credencial d'RTE que contingui `http://rte:8000` i el token

Amb el seed, el fitxer d'entorn de l'aplicació també conté `RTE_TOKEN`, el mateix token, ja que el seed el llegeix d'allà.

---

## 1. Baixa les imatges noves

Baixa les imatges més noves d'AnsibleForms i de l'RTE de l'etiqueta que executes:

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

## 2. Substitueix els contenidors

Suprimeix els contenidors antics i inicia'n de nous amb les ordres `run` de la [instal·lació](../installation/docker.html). L'aplicació
llegeix la connexió a la base de dades del seu fitxer d'entorn, amb l'usuari de base de dades d'AnsibleForms (no root). L'RTE llegeix el seu propi
`rte.env`, sense la configuració de la base de dades, i l'aplicació el truca a través d'una xarxa que comparteixen tots dos contenidors:

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

Si véns de la 6.5, encara no hi ha cap contenidor d'RTE: les ordres `stop` i `rm` només troben l'aplicació. Crea la xarxa compartida
una vegada amb `docker network create ansibleforms` (o `podman network create ansibleforms`). Com fa la
[instal·lació](../installation/docker.html#prepare-the-folders), posa la connexió a la base de dades, `ENCRYPTION_SECRET`, un `RTE_TOKEN`
d'almenys 16 caràcters i `CONFIG_SEED_PATH` al fitxer d'entorn de l'aplicació, i crea `rte.env` i el config seed. Fes servir les teves pròpies
carpetes on la teva instal·lació 6.5 en muntava d'altres. El seed afegeix l'RTE a **Connexions → Runners** com a runner predeterminat `rte`;
consulta [Actualitzar a la v7](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Comprova l'actualització

Segueix el registre d'AnsibleForms mentre s'inicia. El primer inici d'una versió nova actualitza l'esquema de la base de dades:

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

L'RTE escriu el seu propi registre, que mostra `docker logs rte`. A AnsibleForms, **Ajuda → Quant a** mostra la versió que s'està executant, i **Configuració → Estat** mostra la salut de la
base de dades, de l'esquema i dels altres sistemes dels quals depèn AnsibleForms.

---

## Tornar enrere

Per tornar a la versió que executaves abans, la que mostrava **Ajuda → Quant a** abans de l'actualització, torna a executar el pas 2 amb
la seva etiqueta exacta en lloc de `7`, tant a la imatge d'AnsibleForms com a la de l'RTE. Si aquella versió no s'inicia amb la base de dades
actualitzada, restaura la còpia de seguretat que vas fer a **Configuració → Còpies de seguretat**.

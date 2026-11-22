---
layout: default
title: Executar un RTE
parent: RTE
nav_order: 3
translated_from: 5bf6a2898a4a5258d75cbbcc40cf1d4338adba80
---

# Executar un RTE
{: .no_toc }

Els ajustos de cada mode, i com iniciar un RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ajustos

El que necessita un RTE depèn del seu mode (vegeu [Modes](modes.html)). Tots els RTE llegeixen aquests:

| Variable | Significat |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Des de la 7.3.0: `outbound` (truca al controlador), `inbound` (el controlador li truca) o `database` (obsolet, el predeterminat durant tota la 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | El token entre el controlador i l'RTE, d'almenys 16 caràcters; l'RTE es nega a arrencar sense ell |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Quants playbooks executa alhora, `10` per defecte (`0` no posa cap límit). Una tasca per a un RTE ple espera fins que acaba un playbook |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | En aturar-se, quant de temps espera els seus playbooks en execució, `25` per defecte; els que encara s'executen llavors acaben com a abandonats |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | La llegeixen els nodes del controlador i el worker, no l'RTE: quant de temps espera una tasca un RTE ple o que s'està aturant, `60` per defecte |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | La carpeta de playbooks i el límit de sortida: les llegeix l'RTE, així que defineix-les al seu entorn |
| `LISTEN_HOST` | Des de la 7.3.0: l'adreça on escolten els seus listeners, totes les interfícies per defecte; `127.0.0.1` quan res no li truca des de fora (un RTE sortint) |

Un RTE en un mode de sòcol, `outbound` o `inbound`, també llegeix aquests, i cap `DB_*` ni cap `ENCRYPTION_SECRET`:

| Variable | Significat |
|---|---|
| [`CONTROLLER_URL`](../customization/server.html#env_CONTROLLER_URL) | L'adreça del controlador tal com l'obre la gent, com ara `https://forms.example.com`. Sortint: l'adreça a la qual truca. Entrant: l'adreça de la seva única crida de registre |
| [`CONTROLLER_TLS_VERIFY`](../customization/server.html#env_CONTROLLER_TLS_VERIFY) | `1` (predeterminat): el certificat del controlador ha de ser vàlid. `0` n'accepta qualsevol, només dins d'una xarxa de confiança |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | El nom del seu runner, el que els formularis nomenen amb `runner:`. Si no es defineix: el seu id de node, `rte-<hostname>-<port>`, que canvia amb el contenidor: defineix-lo en producció |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Opcional, només la primera vegada: un token d'unió, creat a través de l'API, que aprova el seu runner a l'instant en lloc d'esperar un admin (vegeu [Tokens d'unió](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Entrant, quan demana unir-se: l'adreça a la qual truca el controlador, com ara `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (predeterminat): el controlador envia els playbooks i els inventaris amb la tasca. `local`: s'executa des de les seves pròpies carpetes muntades |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | On esperen la sortida, els esdeveniments i el final de cada tasca fins que el controlador els ha desat, `<persistent>/rte-spool` per defecte: mantén-lo en un volum |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Amb `transfer`: on es conserven les carpetes que ha enviat el controlador, `<persistent>/rte-files` per defecte |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Amb `transfer`: quant poden ocupar aquestes carpetes, `1024` per defecte; primer surten les que fa més temps que no es fan servir, i `0` no en conserva cap |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | La llegeix el controlador, no l'RTE: la carpeta més gran que envia amb `transfer`, `512` per defecte |

`CONTROLLER_URL` i `CONTROLLER_TLS_VERIFY` són noves a la 7.8.0: un RTE d'una versió anterior llegeix `APP_URL` i `APP_TLS_VERIFY`.
Els noms antics són obsolets des de la 7.8.0 i s'eliminen a la 8.0. Un RTE encara en llegeix un quan el seu nom nou no està definit, amb un avís
en arrencar, i el nom nou guanya quan tots dos estan definits.

En un RTE en un mode de sòcol, `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` i `RTE_CACHE_MB` també es poden definir a la seva pàgina de runner,
a la pestanya RTE: un valor definit allà guanya a la variable, que llavors només omple un camp deixat buit (vegeu
[La configuració d'un RTE](../runners/runner-page.html#an-rtes-settings)). Un valor fora de rang es porta al seu límit, i l'RTE ho indica
quan arrenca.

Un RTE en mode base de dades (obsolet) llegeix en canvi els ajustos de la base de dades, i es registra ell mateix:

| Variable | Significat |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Els mateixos valors que el controlador: l'RTE llegeix les seves tasques de la base de dades i hi escriu la sortida |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | L'adreça on el controlador crida l'RTE, com ara `http://rte:8000`. El runner rep el nom del seu host (`rte`), de manera que els formularis poden fer servir `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Obsolet a la 7.3.0, juntament amb el mode base de dades: un RTE en mode de sòcol s'uneix amb un token d'unió. `1` (predeterminat): l'RTE s'afegeix ell mateix a **Connexions > Runners** en arrencar, i el primer passa a ser el runner predeterminat. `0`: afegeix-lo tu mateix allà, o a la [llavor de configuració](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | El mateix valor que el controlador, necessari només per registrar-se ell mateix (el token del runner es desa xifrat); deixa'l fora amb `RTE_REGISTER=0` |

En mode base de dades, sense `RTE_URL` l'RTE registra la seva adreça IP i el seu port amb el nom `rte-<hostname>-<port>`, que canvien quan
es recrea el contenidor: defineix `RTE_URL` en producció. El worker elimina un runner que l'RTE ha registrat ell mateix 10 minuts després del
darrer heartbeat de l'RTE.

---

## Iniciar-lo

L'RTE executa els playbooks, així que necessita la seva carpeta ssh, amb la clau privada i el `known_hosts` que fan servir els playbooks, i una carpeta
persistent per al seu spool i els fitxers que envia el controlador. Tria el mode:

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Sortint</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Entrant</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Base de dades (obsolet)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Inicia l'RTE en qualsevol host que arribi al controlador, amb el seu propi token i el nom que rebrà el seu runner:

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e CONTROLLER_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Truca al controlador i demana unir-se: **Connexions > Runners** mostra el runner `rte-dmz` pendent d'aprovació, i el seu registre mostra
l'empremta del seu token. Comprova que la revisió mostra la mateixa empremta, i després fes clic a **Aprova** (vegeu
[Aprovar un RTE](../runners/registration.html#approving-an-rte)): a partir d'aleshores rep tasques, i inicia sessió amb el seu propi `RTE_TOKEN`.
Per a un inici desatès, afegeix `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, que l'aprova a l'instant. Res no ha d'arribar a aquest
host: no publiquis cap port. Al seu `PORT` només escolten `/live`, `/ready` i `/metrics`, per a les sondes.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Inicia l'RTE on hi arribi el controlador. Aquest s'executa al costat del controlador i executa els playbooks des de les seves carpetes (`RTE_FILES=local`):

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Després dona al controlador el seu runner: a la [llavor de configuració](../seed/), una credencial RTE i un runner entrant que hi inicia sessió:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the controller dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the controller's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

O afegeix aquests dos a mà: la credencial a **Connexions > Credencials**, de tipus RTE, i el runner a
**Connexions > Runners**, de tipus RTE, mode **Entrant**, amb aquesta credencial. Per deixar que l'RTE demani unir-se, inicia'l amb
`CONTROLLER_URL` i `RTE_URL`, i aprova'l a **Connexions > Runners** (vegeu [Entrant](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Obsolet des de la 7.3.0 i eliminat a la 8.0.0. L'RTE executa els playbooks des del seu propi disc, així que munta-hi també el volum persistent del controlador
(playbooks, repositoris, fitxers pujats) i la seva carpeta ssh. Un exemple amb Docker, amb el controlador accessible com a `ansibleforms` a la
mateixa xarxa:

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the controller's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Mantén un RTE entrant fora de la xarxa pública: el seu sòcol respon a qualsevol que tingui el token. `docker stop` només espera 10 segons abans
de matar un contenidor, així que dona a l'RTE un temps d'aturada més llarg (`--stop-timeout`, o `stop_grace_period` a compose) o redueix
`RTE_DRAIN_SECONDS`. Kubernetes espera 30 segons per defecte.

L'[instal·lador](../installation/installer.html) configura un RTE sortint o entrant en un servidor propi, amb Docker, Podman o
[sense contenidors](../installation/native.html), i mostra l'empremta amb què s'ha d'aprovar. Per executar a mà un RTE en un altre centre de dades,
segueix [Un altre centre de dades](another-datacenter.html).


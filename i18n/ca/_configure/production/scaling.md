---
layout: default
title: Escalat
parent: En producció
nav_order: 4
translated_from: d18732c9af35c09cfbe63654540f98a730463f43
---

# Escalat
{: .no_toc }

AnsibleForms repartit en diversos nodes del controlador i un worker, al costat d'un o més RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rols

Tots els contenidors d'AnsibleForms executen el mateix codi de servidor, i [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decideix què fa cadascun:

| `AF_ROLE` | Imatge | Executa | Quants |
|---|---|---|---|
| `all` (sense definir) | `ansibleforms` | La interfície web i l'API del controlador, i el worker, en un sol procés: el predeterminat | 1 |
| `controller` | `ansibleforms` | La interfície web i l'API | Tants com vulguis, darrere d'un balancejador de càrrega |
| `worker` | `ansibleforms` | La feina en segon pla: l'esquema de la base de dades i les seves actualitzacions, la llavor de configuració, les programacions, la còpia de seguretat nocturna, les sincronitzacions dels repositoris i les neteges | Un treballant; els altres esperen i prenen el relleu |
| `rte` | `ansibleforms-rte-full` (o `-rte-core`, `-rte-base`) | Els playbooks | Tants com vulguis |

La instal·lació més petita és un contenidor sense `AF_ROLE` al costat d'un RTE: és el que executen el [projecte Docker Compose](../installation/docker-compose.html)
i el [chart de Helm](../installation/kubernetes.html). Qualsevol altre valor d'`AF_ROLE` atura el procés en arrencar.

Fins a la 7.7, el rol `controller` es deia `app`. Des de la 7.8.0 `AF_ROLE=app` és obsolet i s'elimina a la 8.0: continua funcionant com a
`controller`, amb un avís al registre en arrencar, i el node conserva el seu nom `app-`, de manera que torna a trobar les seves pròpies tasques després de l'actualització.

---

## L'RTE

L'RTE, l'entorn d'execució que executa els playbooks, té la seva pròpia secció: [Entorns d'execució](../rte/). Hi trobaràs com un RTE
executa una tasca, [les seves imatges](../rte/images.html), [com executar-ne un](../rte/run.html), [diversos RTE](../rte/several.html) com a runners o
rèpliques, i [un RTE en un altre centre de dades](../rte/another-datacenter.html).

---

## Diversos nodes del controlador

Per servir més usuaris, o per sobreviure a la pèrdua d'un node, divideix-lo en nodes `controller` darrere d'un balancejador de càrrega i un `worker`.

### Què comparteixen els nodes
{: .no_toc }

Els nodes es posen d'acord entre ells a través de la base de dades i d'un volum compartit:

* **La base de dades** : les tasques, el bloqueig del worker, el bloqueig del dissenyador, la llista de nodes, els leases dels runners (quin node del controlador té el
  sòcol de cada RTE) i els avisos de canvi que mantenen al dia la memòria cau de cada node. Una credencial, un runner o una programació editats
  en un node són vigents a tots en menys de 5 segons
* **El volum persistent** (`/app/dist/persistent`) : formularis, la configuració, repositoris, fitxers pujats, còpies de seguretat i el `.env` gestionat.
  Tots els nodes del controlador i el worker munten el mateix, en lectura i escriptura
* **La carpeta ssh** (`/home/node/.ssh`) : la clau i els hosts coneguts per a git per ssh; el worker crea la clau a la seva primera arrencada
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : el mateix a tots els nodes del controlador, o el node següent rebutja un token signat
  per un altre node. Un node del controlador es nega a arrencar sense aquest secret
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : el mateix a tots els nodes del controlador i al worker, o una
  credencial desada per un no la pot llegir un altre. Un RTE en mode sòcol no el llegeix mai; només el necessita un RTE obsolet en mode base de dades
  que es registra ell mateix

Dona també a tots els contenidors el mateix usuari de base de dades: un worker en espera només pot acabar la sessió d'un worker mort quan és la seva.

### El bloqueig del worker
{: .no_toc }

Només treballa un worker alhora. Té el bloqueig de base de dades `ansibleforms_worker`; quan s'atura, la base de dades allibera el bloqueig i un
worker en espera el pren en menys de 10 segons. Quan l'amfitrió del worker mor sense acomiadar-se, la base de dades podria conservar el bloqueig durant hores,
així que un worker en espera acaba aquella sessió quan fa dos minuts que cap worker no ha escrit un heartbeat, i pren el relleu.

Un worker que perd el bloqueig en favor d'un altre s'atura, i el seu contenidor es reinicia com a worker en espera. Un worker que no aconsegueix arrencar també
s'atura, de manera que mai no té el bloqueig sense fer res. Galera i la replicació de grup no comparteixen el bloqueig entre nodes de base de dades: apunta tots
els workers al mateix node de base de dades.

### Tasques i nodes
{: .no_toc }

Cada contenidor s'anomena `<role>-<hostname>-<port>`, sense res a definir, i la pàgina **Estat** els llista tots amb el seu rol
i la seva versió, quin és el worker, i un avís quan executen versions diferents.

Una tasca que s'executa en un RTE pertany a aquell RTE, i continua quan desapareix el node del controlador que l'ha iniciada. Qualsevol altra tasca (una tasca de plantilla
a AWX o a un altre runner, una tasca de workflow, o els passos d'un formulari multistep obsolet) pertany al node del controlador que l'ha iniciada. Un contenidor que es reinicia acaba les seves pròpies tasques pendents, i el
worker acaba les tasques d'un contenidor que fa dos minuts que no respon, com ara un pod substituït.

Un `SIGHUP` enviat a qualsevol node torna a aplicar la [llavor de configuració](../seed/): un node del controlador demana al worker que ho faci.

### Actualitzar
{: .no_toc }

Actualitza **primer el worker**, i després els nodes del controlador. El worker aplica els pedaços a l'esquema, i un node del controlador de la versió nova espera fins que
l'esquema està actualitzat i registra què espera. Els nodes del controlador actualitzats primer es queden sense estar preparats fins que el worker els segueix, mentre els antics continuen
servint. Els RTE poden seguir en qualsevol moment, sempre que parlin el mateix contracte.

### Límits
{: .no_toc }

Algunes coses es queden en un sol node:

* **L'assistent de xat** conserva les seves converses a la memòria d'un node del controlador: fes servir sessions persistents al balancejador de càrrega (`ip_hash` de
  nginx), o un sol node del controlador
* **Els registres** es queden a cada contenidor. Posa [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) fora del volum compartit, perquè si diversos
  processos fan la rotació d'un mateix fitxer es perden línies. El visor de registres mostra el registre del node que respon, així que recull els registres de manera centralitzada
* **Els ajustos** canviats a les pàgines de configuració s'escriuen al `.env` gestionat del volum compartit i s'apliquen a tots els nodes; els que
  necessiten un reinici el necessiten a tots els nodes

---

## Exemple de disposició

El repositori docker té un punt de partida complet a [scale](https://github.com/ansibleforms/docker/tree/main/scale):

| Servei | Imatge | Rol |
|---|---|---|
| `db` | `mariadb:11` | La base de dades, amb un usuari que només té permisos sobre l'esquema `AnsibleForms` |
| `controller1`, `controller2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=controller`, darrere del balancejador de càrrega |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: el segon espera i pren el relleu |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Executa els playbooks amb `RTE_MODE=inbound` i `RTE_FILES=local`: el controlador hi truca |
| `lb` | `nginx:stable` | Termina l'HTTPS al port 8443 i reparteix els navegadors entre els nodes del controlador amb `ip_hash` |

El runner `rte` de l'RTE i la credencial amb què s'hi inicia sessió (la seva adreça `http://rte:8000` i `RTE_TOKEN`) es declaren a la
[llavor de configuració](../seed/) `seed.yaml`, que el worker aplica a cada arrencada; l'RTE no defineix cap `RTE_URL` i no es publica a l'amfitrió.

Els nodes del controlador i els workers comparteixen un mateix `.env`, amb l'usuari de la base de dades, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` darrere del balancejador de càrrega i un `LOG_PATH` fora del volum compartit. L'RTE no té `env_file`: només rep
`RTE_TOKEN` de `compose.yaml`, de manera que no conté cap contrasenya de base de dades. Els nodes del controlador, els workers i l'RTE munten els mateixos
volums persistent i ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```

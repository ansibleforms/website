---
layout: default
title: Escalat
parent: En producció
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# Escalat
{: .no_toc }

AnsibleForms repartit en diversos nodes d'aplicació i un worker, al costat d'un o més RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Rols

Tots els contenidors d'AnsibleForms executen el mateix codi de servidor, i [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decideix què fa cadascun:

| `AF_ROLE` | Imatge | Executa | Quants |
|---|---|---|---|
| `all` (sense definir) | `ansibleforms` | L'aplicació web i el worker en un sol procés: el predeterminat | 1 |
| `app` | `ansibleforms` | La interfície web i l'API | Tants com vulguis, darrere d'un balancejador de càrrega |
| `worker` | `ansibleforms` | La feina en segon pla: l'esquema de la base de dades i les seves actualitzacions, la llavor de configuració, les programacions, la còpia de seguretat nocturna, les sincronitzacions dels repositoris i les neteges | Un treballant; els altres esperen i prenen el relleu |
| `rte` | `ansibleforms-rte-full` (o `-rte-core`, `-rte-base`) | Els playbooks | Tants com vulguis |

La instal·lació més petita és un contenidor sense `AF_ROLE` al costat d'un RTE: és el que executen el [projecte Docker Compose](../installation/docker-compose.html)
i el [chart de Helm](../installation/kubernetes.html). Qualsevol altre valor d'`AF_ROLE` atura el procés en arrencar.

---

## L'RTE

L'RTE, l'entorn d'execució que executa els playbooks, té la seva pròpia secció: [Entorns d'execució](../rte/). Hi trobaràs com un RTE
executa una tasca, [les seves imatges](../rte/images.html), [com executar-ne un](../rte/run.html), [diversos RTE](../rte/several.html) com a runners o
rèpliques, i [un RTE en un altre centre de dades](../rte/another-datacenter.html).

---

## Diversos nodes d'aplicació

Per servir més usuaris, o per sobreviure a la pèrdua d'un node, divideix l'aplicació en nodes `app` darrere d'un balancejador de càrrega i un `worker`.

### Què comparteixen els nodes
{: .no_toc }

Els nodes es posen d'acord entre ells a través de la base de dades i d'un volum compartit:

* **La base de dades** : les tasques, el bloqueig del worker, el bloqueig del dissenyador, la llista de nodes, els leases dels runners (quin node d'aplicació té el
  sòcol de cada RTE) i els avisos de canvi que mantenen al dia la memòria cau de cada node. Una credencial, un runner o una programació editats
  en un node són vigents a tots en menys de 5 segons
* **El volum persistent** (`/app/dist/persistent`) : formularis, la configuració, repositoris, fitxers pujats, còpies de seguretat i el `.env` gestionat.
  Tots els nodes d'aplicació i el worker munten el mateix, en lectura i escriptura
* **La carpeta ssh** (`/home/node/.ssh`) : la clau i els hosts coneguts per a git per ssh; el worker crea la clau a la seva primera arrencada
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : el mateix a tots els nodes d'aplicació, o el node següent rebutja un token signat
  per un altre node. Un node d'aplicació es nega a arrencar sense aquest secret
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : el mateix a tots els nodes d'aplicació i al worker, o una
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

Una tasca que s'executa en un RTE pertany a aquell RTE, i continua quan desapareix el node d'aplicació que l'ha iniciada. Qualsevol altra tasca (una tasca de plantilla
a AWX o a un altre runner, una tasca de workflow, o els passos d'un formulari multistep obsolet) pertany al node d'aplicació que l'ha iniciada. Un contenidor que es reinicia acaba les seves pròpies tasques pendents, i el
worker acaba les tasques d'un contenidor que fa dos minuts que no respon, com ara un pod substituït.

Un `SIGHUP` enviat a qualsevol node torna a aplicar la [llavor de configuració](../seed/): un node d'aplicació demana al worker que ho faci.

### Actualitzar
{: .no_toc }

Actualitza **primer el worker**, i després els nodes d'aplicació. El worker aplica els pedaços a l'esquema, i un node d'aplicació de la versió nova espera fins que
l'esquema està actualitzat i registra què espera. Els nodes d'aplicació actualitzats primer es queden sense estar preparats fins que el worker els segueix, mentre els antics continuen
servint. Els RTE poden seguir en qualsevol moment, sempre que parlin el mateix contracte.

### Límits
{: .no_toc }

Algunes coses es queden en un sol node:

* **L'assistent de xat** conserva les seves converses a la memòria d'un node d'aplicació: fes servir sessions persistents al balancejador de càrrega (`ip_hash` de
  nginx), o un sol node d'aplicació
* **Els registres** es queden a cada contenidor. Posa [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) fora del volum compartit, perquè si diversos
  processos fan la rotació d'un mateix fitxer es perden línies. El visor de registres mostra el registre del node que respon, així que recull els registres de manera centralitzada
* **Els ajustos** canviats a les pàgines de configuració s'escriuen al `.env` gestionat del volum compartit i s'apliquen a tots els nodes; els que
  necessiten un reinici el necessiten a tots els nodes

---

## Exemple de disposició

El repositori de l'aplicació té un punt de partida complet a [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Servei | Imatge | Rol |
|---|---|---|
| `db` | `mariadb:11` | La base de dades, amb un usuari que només té permisos sobre l'esquema `AnsibleForms` |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, darrere del balancejador de càrrega |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: el segon espera i pren el relleu |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Executa els playbooks amb `RTE_MODE=inbound` i `RTE_FILES=local`: l'aplicació hi truca |
| `lb` | `nginx:stable` | Termina l'HTTPS al port 8443 i reparteix els navegadors entre els nodes d'aplicació amb `ip_hash` |

El runner `rte` de l'RTE i la credencial amb què s'hi inicia sessió (la seva adreça `http://rte:8000` i `RTE_TOKEN`) es declaren a la
[llavor de configuració](../seed/) `seed.yaml`, que el worker aplica a cada arrencada; l'RTE no defineix cap `RTE_URL` i no es publica a l'amfitrió.

Els nodes d'aplicació i els workers comparteixen un mateix `.env`, amb l'usuari de la base de dades, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` darrere del balancejador de càrrega i un `LOG_PATH` fora del volum compartit. L'RTE no té `env_file`: només rep
`RTE_TOKEN` de `compose.yaml`, de manera que no conté cap contrasenya de base de dades. Els nodes d'aplicació, els workers i l'RTE munten els mateixos
volums persistent i ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```

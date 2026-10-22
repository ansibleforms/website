---
layout: default
title: Exécuter un RTE
parent: RTE
nav_order: 3
translated_from: 7973ec16ff9be3ec527cc8a2a652cc4b23ed5e54
---

# Exécuter un RTE
{: .no_toc }

Les paramètres de chaque mode, et comment démarrer un RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Paramètres

Ce dont un RTE a besoin dépend de son mode (voir [Modes](modes.html)). Tout RTE lit celles-ci :

| Variable | Signification |
|---|---|
| [`RTE_MODE`](../customization/server.html#env_RTE_MODE) | Depuis la 7.3.0 : `outbound` (il contacte l'application), `inbound` (l'application le contacte) ou `database` (obsolète, la valeur par défaut pendant toute la 7.x) |
| [`RTE_TOKEN`](../customization/server.html#env_RTE_TOKEN) | Le jeton entre l'application et le RTE, d'au moins 16 caractères ; le RTE refuse de démarrer sans lui |
| [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) | Combien de playbooks il exécute à la fois, `10` par défaut (`0` ne fixe aucune limite). Un job destiné à un RTE plein attend qu'un playbook se termine |
| [`RTE_DRAIN_SECONDS`](../customization/server.html#env_RTE_DRAIN_SECONDS) | À l'arrêt, combien de temps il attend ses playbooks en cours, `25` par défaut ; ceux qui tournent encore se terminent alors comme abandonnés |
| [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES) | Lue par les nœuds d'application et le worker, pas par le RTE : combien de temps un job attend un RTE plein ou en cours d'arrêt, `60` par défaut |
| [`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH), `PROCESS_MAX_BUFFER` | Le dossier des playbooks et la limite de sortie : lues par le RTE, définissez-les donc dans son environnement |
| `LISTEN_HOST` | Depuis la 7.3.0 : l'adresse à laquelle se lient ses écouteurs, toutes les interfaces par défaut ; `127.0.0.1` quand rien ne le contacte depuis l'extérieur (un RTE sortant) |

Un RTE en mode socket, `outbound` ou `inbound`, lit aussi celles-ci, et aucune `DB_*` ni `ENCRYPTION_SECRET` :

| Variable | Signification |
|---|---|
| [`APP_URL`](../customization/server.html#env_APP_URL) | L'adresse de l'application telle que les gens l'ouvrent, comme `https://forms.example.com`. Sortant : l'adresse qu'il contacte. Entrant : l'adresse de son unique appel d'enregistrement |
| [`APP_TLS_VERIFY`](../customization/server.html#env_APP_TLS_VERIFY) | `1` (par défaut) : le certificat de l'application doit être valide. `0` accepte n'importe lequel, uniquement à l'intérieur d'un réseau de confiance |
| [`RTE_NAME`](../customization/server.html#env_RTE_NAME) | Le nom de son runner, que les formulaires nomment avec `runner:`. Non définie : son id de nœud, `rte-<hostname>-<port>`, qui change avec le conteneur : définissez-la en production |
| [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN) | Facultative, la première fois uniquement : un jeton d'adhésion, créé via l'API, qui approuve son runner immédiatement au lieu d'attendre un admin (voir [Jetons d'adhésion](../runners/registration.html#join-tokens)) |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | Entrant, quand il demande à rejoindre : l'adresse que contacte l'application, comme `http://rte-dmz.example.com:8000` |
| [`RTE_FILES`](../customization/server.html#env_RTE_FILES) | `transfer` (par défaut) : l'application envoie les playbooks et les inventaires avec le job. `local` : il exécute depuis ses propres dossiers montés |
| [`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH) | Où la sortie, les événements et la fin de chaque job attendent que l'application les ait enregistrés, `<persistent>/rte-spool` par défaut : gardez-le sur un volume |
| [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH) | Avec `transfer` : où sont conservés les dossiers envoyés par l'application, `<persistent>/rte-files` par défaut |
| [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) | Avec `transfer` : combien de place ces dossiers peuvent prendre, `1024` par défaut ; ceux utilisés il y a le plus longtemps partent en premier, et `0` n'en garde aucun |
| [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) | Lue par l'application, pas par le RTE : le plus gros dossier qu'elle envoie avec `transfer`, `512` par défaut |

Sur un RTE en mode socket, `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`, `RTE_FILES` et `RTE_CACHE_MB` peuvent aussi être définies sur sa page de runner,
dans l'onglet RTE : une valeur saisie là l'emporte sur la variable, qui ne remplit alors qu'un champ laissé vide (voir
[Les paramètres d'un RTE](../runners/runner-page.html#an-rtes-settings)). Une valeur hors limites est ramenée à sa limite, et le RTE l'indique
à son démarrage.

Un RTE en mode base de données (obsolète) lit à la place les paramètres de la base de données, et s'enregistre lui-même :

| Variable | Signification |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | Les valeurs propres à l'application : le RTE lit ses jobs dans la base de données et y écrit leur sortie |
| [`RTE_URL`](../customization/server.html#env_RTE_URL) | L'adresse à laquelle l'application appelle le RTE, comme `http://rte:8000`. Le runner est nommé d'après son hôte (`rte`), les formulaires peuvent donc utiliser `runner: rte` |
| [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER) | Dépréciée dans la 7.3.0, avec le mode base de données : un RTE en mode socket rejoint plutôt avec un jeton d'adhésion. `1` (par défaut) : le RTE s'ajoute lui-même dans **Connexions > Runners** à son démarrage, et le premier devient le runner par défaut. `0` : ajoutez-le vous-même là, ou dans le [seed de configuration](../seed/) |
| [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) | La valeur propre à l'application, nécessaire uniquement pour s'enregistrer lui-même (le jeton du runner est stocké chiffré) ; omettez-la avec `RTE_REGISTER=0` |

En mode base de données, sans `RTE_URL`, le RTE enregistre son adresse IP et son port sous le nom `rte-<hostname>-<port>`, qui changent quand
le conteneur est recréé : définissez `RTE_URL` en production. Le worker supprime un runner que le RTE a enregistré lui-même 10 minutes après le
dernier heartbeat du RTE.

---

## Le démarrer

Le RTE exécute les playbooks, il a donc besoin de son dossier ssh, avec la clé privée et le `known_hosts` qu'utilisent les playbooks, et d'un dossier
persistant pour son spool et les fichiers qu'envoie l'application. Choisissez le mode :

<div class="af-tabs" data-tab-group="rtemode">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="outbound" aria-selected="true">Sortant</button>
<button type="button" role="tab" class="af-tab" data-tab="inbound" aria-selected="false">Entrant</button>
<button type="button" role="tab" class="af-tab" data-tab="database" aria-selected="false">Base de données (obsolète)</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="outbound" markdown="1">

Démarrez le RTE sur n'importe quel hôte qui joint l'application, avec son propre jeton et le nom que reçoit son runner :

```bash
docker run -d --name rte-dmz --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=outbound -e APP_URL=https://forms.example.com \
  -e RTE_NAME=rte-dmz -e RTE_TOKEN=<at least 16 characters> -e HTTPS=0 \
  -v /srv/apps/rte/persistent:/app/dist/persistent \
  -v /srv/apps/rte/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Il contacte l'application et demande à rejoindre : **Connexions > Runners** montre le runner `rte-dmz` en attente d'approbation, et son journal montre
l'empreinte de son jeton. Vérifiez que son examen montre la même empreinte, puis **Approuvez**-le (voir
[Approuver un RTE](../runners/registration.html#approving-an-rte)) : il reçoit des jobs à partir de là, en se connectant avec son propre `RTE_TOKEN`.
Pour un démarrage sans intervention, ajoutez `-e RTE_JOIN_TOKEN=<a join token, afj_...>`, qui l'approuve immédiatement. Rien n'a besoin de joindre cet
hôte : ne publiez aucun port. Seuls `/live`, `/ready` et `/metrics` écoutent sur son `PORT`, pour les sondes.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="inbound" markdown="1" hidden>

Démarrez le RTE là où l'application le joint. Celui-ci tourne à côté de l'application et exécute les playbooks depuis ses dossiers (`RTE_FILES=local`) :

```bash
docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 40 \
  -e RTE_MODE=inbound -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_FILES=local -e PORT=8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

Donnez ensuite à l'application son runner : dans le [seed de configuration](../seed/), un identifiant RTE et un runner entrant qui se connecte avec lui :

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      description: The RTE_TOKEN of the rte container, and its address
      url: http://rte:8000          # where the app dials it
      password: ${RTE_TOKEN}        # its RTE_TOKEN, from the app's environment
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true              # playbook forms that name no runner run here
```

Ou ajoutez les deux à la main : l'identifiant dans **Connexions > Identifiants**, type RTE, et le runner dans
**Connexions > Runners**, type RTE, mode **Entrant**, avec cet identifiant. Pour laisser plutôt le RTE demander à rejoindre, démarrez-le avec
`APP_URL` et `RTE_URL`, et approuvez-le dans **Connexions > Runners** (voir [Entrant](modes.html#inbound)).

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="database" markdown="1" hidden>

Déprécié depuis la 7.3.0 et supprimé dans la 8.0.0. Le RTE exécute les playbooks depuis son propre disque, montez donc aussi le volume persistant de l'application
(playbooks, dépôts, fichiers téléversés) et son dossier ssh sur lui. Un exemple Docker, avec l'application joignable sous le nom `ansibleforms` sur le
même réseau :

```bash
docker run -d --name rte --network ansibleforms \
  -e DB_HOST=192.168.0.1 -e DB_PORT=3306 -e DB_USER=ansibleforms -e DB_PASSWORD=<password> \
  -e ENCRYPTION_SECRET=<the app's> -e RTE_TOKEN=<at least 16 characters> \
  -e RTE_URL=http://rte:8000 -e HTTPS=0 \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Gardez un RTE entrant hors du réseau public : son socket répond à tout appelant qui a le jeton. `docker stop` n'attend que 10 secondes avant
de tuer un conteneur, donnez donc au RTE un délai d'arrêt plus long (`--stop-timeout`, ou `stop_grace_period` dans compose) ou diminuez
`RTE_DRAIN_SECONDS`. Kubernetes attend 30 secondes par défaut.

L'[installeur](../installation/installer.html) met en place un RTE sortant ou entrant sur un serveur dédié, avec Docker, Podman ou
[sans conteneurs](../installation/native.html), et affiche l'empreinte avec laquelle l'approuver. Pour exécuter à la main un RTE dans un autre datacenter,
suivez [Un autre datacenter](another-datacenter.html).

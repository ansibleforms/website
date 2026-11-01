---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Environnements d'exécution (RTE)
{: .no_toc }

Ce qu'est un RTE, comment il exécute un playbook, et ce à quoi il peut toucher
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : comprenez le RTE avant d'en exécuter un, de le dimensionner ou de le déplacer vers un autre réseau.

| Page | Ce qu'elle couvre |
|---|---|
| [Images](images.html) | Les trois images RTE, et la construction de la vôtre avec les collections qu'utilisent vos playbooks |
| [Modes](modes.html) | Sortant, entrant ou base de données : qui ouvre la connexion, le spool, les fichiers du job |
| [Exécuter un RTE](run.html) | Les paramètres de chaque mode, et un exemple `docker run` pour chacun |
| [Plusieurs RTE](several.html) | La capacité, les répliques derrière une même adresse, et ce qui se passe quand un RTE s'arrête ou meurt |
| [Un autre datacenter](another-datacenter.html) | Un runbook : ajouter un RTE dans un second datacenter, d'un hôte nu jusqu'à son premier job |

---

## Ce qu'est un RTE

AnsibleForms 7 n'exécute aucun playbook dans le conteneur de l'application. Le job d'un formulaire `ansible` est confié à un [runner](../runners.html) de type
`rte`, un environnement d'exécution : le serveur AnsibleForms démarré avec `AF_ROLE=rte`, à côté de python et d'ansible, sans interface
web. Il parle à l'application via un seul WebSocket et ne détient aucun identifiant de base de données
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` ou `inbound`, voir [Modes](modes.html)) : l'application lui envoie le job,
le RTE exécute `ansible-playbook`, et l'application enregistre la sortie et le statut final qu'il lui renvoie, là où le navigateur les lit.

L'application résout les identifiants du job et les remet au RTE scellés pour ce RTE et ce job uniquement. Le RTE ne lit jamais la
table des identifiants ni un coffre de secrets, et un playbook n'hérite pas des variables d'environnement propres à AnsibleForms
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` et les autres) : passez une telle valeur comme extravar ou comme identifiant. Le RTE de la 7.0 à la 7.2,
qui lisait et écrivait lui-même la base de données, tourne encore en 7.x sous la forme du mode base de données déprécié (voir [Mode base de données](#database-mode-deprecated)).

---

## Fonctionnement du RTE

Le RTE est un conteneur que vous exécutez vous-même, à côté de l'application ou dans un autre réseau : AnsibleForms n'en crée jamais. Voici
où il tourne, ce qu'il partage avec l'application, et ce qui se passe à l'intérieur depuis le moment où un formulaire est lancé jusqu'à la disparition
du processus du playbook :

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Comment le RTE exécute un playbook</title>
<desc id="afr-desc">Sur un hôte de conteneurs ou dans un cluster Kubernetes, tous deux gérés par l'opérateur, le conteneur de l'application et un ou plusieurs conteneurs RTE maintiennent chacun un WebSocket entre eux, ouvert par l'application (entrant) ou par le RTE (sortant). Seule l'application parle à la base de données. 1 : le navigateur lance un formulaire sur l'application. 2 : l'application enregistre le job dans la base de données, choisit le runner et scelle pour lui les secrets du job. 3 : l'application envoie le job par le socket. 4 : le RTE le réclame et obtient les fichiers du job, depuis son cache ou depuis l'application. 5 : le RTE lance ansible-playbook comme processus enfant, un par job, jusqu'à RTE_MAX_JOBS. 6 : le playbook atteint les hôtes gérés. 7 : le RTE écrit la sortie, les événements et la fin dans son spool et les envoie par le socket ; l'application les enregistre dans la base de données et en accuse réception. 8 : le navigateur suit le job via l'application. Le volume de l'application n'est monté dans le RTE qu'avec RTE_FILES=local.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Hôte de conteneurs ou cluster Kubernetes</text>
<text class="afr-s" x="181" y="61">géré par vous ; un RTE sortant peut être dans un autre réseau</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Navigateur</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formulaires, job</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">Conteneur app</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">web, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">scellent les secrets</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">Hub RTE</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">stocke, puis acquitte</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">Conteneur RTE</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">Fichiers du job</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">en cache par hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">jusqu'à RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">gardé jusqu'à l'acquit</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">un</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Hôtes gérés</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volume de l'app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventaires</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">RTE_FILES=local seul</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">réservé à l'app</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

Le schéma montre un socket par RTE, quel que soit le côté qui l'a ouvert : l'application contacte un RTE entrant, un RTE sortant contacte l'application (voir
[Modes](modes.html)). Une fois ouvert, les mêmes messages circulent dans les deux sens, et seule l'application lit et écrit la base de données.

**Qui le démarre.** Un RTE est un conteneur de longue durée, démarré par ce qui exécute vos autres conteneurs. Il attend des jobs et continue
de tourner entre eux :

| Comment vous exécutez AnsibleForms | Qui démarre le RTE |
|---|---|
| `docker run` ou `podman run` | Vous, avec une commande comme celle de [Exécuter un RTE](run.html), sur n'importe quel hôte qui joint l'application, ou que l'application joint |
| [Docker Compose](../installation/docker-compose.html) | Le service `rte` de `docker-compose.yml`, à côté de `app` et `mysqldb`. Son seed de configuration le déclare comme runner par défaut `rte`, entrant, à `http://rte:8000` |
| [Chart Helm](../installation/kubernetes.html) | Kubernetes, comme second conteneur nommé `rte` dans le pod de l'application (`containers.rte`). L'application le contacte sur `127.0.0.1`, en entrant, et le seed du chart le déclare comme runner par défaut |
| [L'installeur](../installation/installer.html) | Docker Compose ou le chart Helm comme ci-dessus, ou un service systemd [sans conteneurs](../installation/native.html) ; un Runner à part entière, qui demande à rejoindre et attend l'approbation d'un admin |

Le moteur de conteneurs est le vôtre : Docker ou Podman sur l'hôte, ou le runtime de conteneurs de votre cluster Kubernetes, installé et tenu
à jour par vous. AnsibleForms ne lui parle jamais. Ni l'application ni le RTE n'appellent Docker ou Podman, ne montent leur socket ni ne démarrent de
conteneur : l'application ne parle au RTE que via son socket.

**Ce qu'il contient.** Un conteneur, avec ce qu'il faut pour exécuter un playbook et rien de plus :

* **Le serveur** : le même serveur Node.js que l'application, démarré avec `AF_ROLE=rte` (défini dans l'image) sous `tini`
* **Ce qui est laissé de côté** : l'interface web, la connexion, le planificateur, le worker et tous les modules de base de données, que ce rôle ne charge pas
* **Ce sur quoi il écoute** : son `PORT` (`8000`) : `/live` et `/ready` pour les sondes et `/metrics` pour Prometheus, et en entrant le socket
  que contacte l'application, `/rte/v1/socket`. Un RTE sortant n'accepte aucune connexion de l'application
* **Python et ansible** : apportés par la couche d'image que vous choisissez (voir [Les images RTE](images.html))
* **L'utilisateur** : le serveur et chaque playbook tournent en tant que `node` (uid 1000), jamais en root

**Ce qu'il partage avec l'application.** Son jeton, et avec `RTE_FILES=local` les fichiers de l'application. Avec `RTE_FILES=transfer`, la valeur par défaut, les
playbooks et les inventaires arrivent avec chaque job, et le RTE n'a besoin d'aucun disque partagé :

| Partagé avec l'application | Ce qu'en fait le RTE |
|---|---|
| `RTE_TOKEN` | Il le présente quand il contacte l'application (sortant), ou le vérifie quand l'application le contacte (entrant). L'application détient la même valeur dans l'identifiant RTE du runner, et les secrets du job sont scellés avec |
| Le volume persistant, `/app/dist/persistent`, avec `RTE_FILES=local` uniquement | Le dossier des playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), ou le dépôt de playbooks que le worker a cloné sous [`REPO_PATH`](../customization/paths.html#env_REPO_PATH), les inventaires ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) et les dépôts d'inventaires) et les fichiers téléversés. Le RTE écrit les fichiers d'extravars du job dans le dossier du playbook, montez-le donc en lecture-écriture |
| Le dossier ssh, `/home/node/.ssh` | La clé privée et le `known_hosts` qu'utilisent les connexions ssh du playbook : montez ceux de l'application, gérés sur ses pages de paramètres, ou donnez au RTE les siens |

Le RTE ne clone rien : un dépôt lui parvient dans les fichiers d'un job, ou sur le volume qu'il partage avec l'application. Les collections, les rôles et
`ansible.cfg` proviennent de l'image, des dossiers `/etc/ansible/collections`, `/etc/ansible/roles` et `/etc/ansible/ansible.cfg` quand
vous les y montez (le projet Docker Compose le fait), ou d'un `ansible.cfg` à côté des playbooks.

**La vie d'un job.** Les numéros ci-dessous sont ceux du schéma, pour un formulaire de playbook lancé depuis le navigateur ou l'API :

1. **Lancement** : l'application vérifie le formulaire et ses valeurs, construit les extravars et enregistre le job avec le statut `running`. Un formulaire avec une
   [approbation](../forms/approval.html) s'arrête là jusqu'à ce qu'un approbateur l'accepte, et n'atteint aucun RTE avant cela
2. **Choix du runner** : l'application prend le RTE que nomme le formulaire avec `runner: <name>`, sinon le runner par défaut de type RTE, et enregistre son
   nom sur le job. Elle résout les identifiants du job depuis la base de données ou un [coffre de secrets](../secret-stores/), son accès ansible et son
   mot de passe vault, et les scelle en AES-256-GCM avec une clé dérivée du jeton de ce runner et de l'id du job
3. **Remise** : le nœud d'application qui détient le socket du RTE lui envoie le job : les extravars, les options du formulaire, les secrets scellés et
   les hashes des fichiers du job. N'importe quel nœud d'application peut lancer le job ; celui qui détient le socket l'envoie en moins de deux secondes. Un RTE plein,
   ou non connecté, fait attendre le job, jusqu'à [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Réclamation** : le RTE répond `claimed`, ou `refused` quand il est plein, en cours d'arrêt, ne peut pas ouvrir les secrets, ou que le job arrive avec un autre
   [contrat](images.html#the-contract) que le sien. Avec `RTE_FILES=transfer`, il prend les playbooks et les inventaires dans son
   cache par leur hash, demande à l'application un hash qu'il n'a pas, et les décompresse dans un dossier propre au job
5. **Démarrage** : dans le dossier du playbook (plus le `playbookSubPath` du formulaire, qui doit exister), il écrit deux fichiers : `extravars_<id>.json`
   avec les valeurs du formulaire et les identifiants, et un fichier caché avec l'accès ansible. Puis il lance `ansible-playbook` comme son propre processus
   enfant, sans shell, dans un groupe de processus à part, avec `-e @` ces fichiers, un `-i` par inventaire, et les tags, la limite, le check,
   le diff et la verbosité du formulaire. Le mot de passe vault entre par stdin, jamais dans un fichier ni sur la ligne de commande, et le processus tourne en tant que
   `node` avec un environnement filtré (voir plus bas)
6. **Exécution** : le playbook se connecte aux hôtes gérés depuis le conteneur RTE, en ssh avec la clé et le `known_hosts` de
   `/home/node/.ssh`, avec `sshpass` pour un accès par mot de passe, ou via les API qu'appellent ses modules. C'est le RTE, pas l'application, qui doit pouvoir les joindre
7. **Sortie et fin** : le RTE regroupe stdout et stderr toutes les demi-secondes ou tous les 64 Ko, avec les identifiants masqués, et numérote chaque
   lot. Il écrit chaque élément dans le spool du job sur son disque avant de l'envoyer : la sortie, les événements, le journal du job
   `.joblogs/job_log_<id>.log` (toutes les 2 secondes), le début et la fin avec le statut final (`success`, `failed` ou `aborted`). L'application
   enregistre chaque élément une seule fois et en accuse réception, et le RTE abandonne le spool une fois la fin enregistrée. Au-delà de
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) octets sur un flux (50 Mo par défaut), il n'envoie plus rien, et
   le playbook continue. L'application envoie ensuite les [notifications](../forms/notifications.html) du formulaire
8. **Suivi** : le navigateur ne parle jamais au RTE : la page du formulaire relit le job via l'application toutes les 2 secondes, et la page Jobs
   le suit en direct à mesure que l'application enregistre chaque élément

**Un socket coupé.** Le playbook continue. Le RTE rappelle (sortant), ou un nœud d'application le recontacte (entrant), et renvoie ce que
l'application n'avait pas acquitté : l'application ignore ce qu'elle a déjà enregistré, si bien qu'aucune ligne n'est perdue ni enregistrée deux fois. Cela tient tant que le socket
revient dans les deux minutes : l'application n'écrit le heartbeat du RTE que tant que son socket est ouvert, et une fois que ce heartbeat a deux minutes,
le worker termine les jobs en cours du RTE comme abandonnés, même si leurs playbooks tournent encore. Gardez le spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) sur un volume, afin qu'un RTE redémarré envoie encore ce qu'il avait conservé. Un
playbook qui tournait quand son RTE a redémarré ne peut pas continuer : l'application termine son job comme abandonné quand le RTE revient sans lui.

**Interruption.** Une interruption positionne l'indicateur d'interruption du job, et le nœud d'application qui détient le socket du RTE envoie `cancel` en moins de deux secondes. Le RTE
envoie `SIGTERM` au groupe de processus du playbook, si bien que `ansible-playbook` et chaque fork qu'il a lancé s'arrêtent ensemble, et le job se termine
`aborted`. Un cancel qui arrive avant son job est conservé une minute, et le job démarre alors interrompu.

**Nettoyage.** Dès que le processus se termine, quelle qu'en soit l'issue, le RTE supprime les deux fichiers d'extravars (un formulaire avec `keepExtravars`
garde le fichier visible, jamais le caché), le fichier d'artefacts dans `/tmp`, le fichier de journal du job et le dossier de fichiers propre au job. La
fin est enregistrée une seule fois : un second écrivain, comme l'application qui fait échouer un job que le RTE a déjà terminé, ne change rien.

**Un processus par job, pas un conteneur par job.** AWX et AAP démarrent un nouveau pod ou conteneur depuis une image d'execution environment pour
chaque job. AnsibleForms ne démarre rien : le conteneur RTE tourne déjà, et chaque job est un processus enfant à l'intérieur. Un job démarre
sans tirer d'image ni planifier de pod, et AnsibleForms n'a besoin d'aucun droit sur votre moteur de conteneurs ou votre cluster. En contrepartie, les
playbooks qui tournent sur un même RTE partagent son CPU, sa mémoire, `/tmp`, son dossier personnel et son python : donnez au conteneur assez de ressources pour
`RTE_MAX_JOBS` playbooks avec leurs forks. Pour changer ce qu'un playbook peut utiliser, changez l'image, pas le job.

---

## La frontière de sécurité

Le RTE exécute du code écrit par les auteurs de formulaires, il est donc conçu pour détenir le moins possible :

* **Son jeton uniquement** : le RTE ne détient aucun identifiant de base de données ni `ENCRYPTION_SECRET`. Il n'accepte aucun appel sauf le socket de l'application, avec
  son jeton, et n'a ni utilisateurs, ni connexion, ni pages web. Via le socket, il peut seulement exécuter les jobs que l'application lui envoie, en rendre compte et
  demander leurs fichiers : il ne peut ni créer un job, ni lire un autre job, ni distribuer des identifiants
* **Des secrets scellés** : pour exécuter un job, le RTE ne lit jamais la table des identifiants ni un coffre de secrets. Il reçoit les secrets des jobs qu'il
  exécute, scellés pour son jeton et cet id de job uniquement, si bien qu'un paquet destiné à un autre RTE ou à un autre job ne s'ouvre pas, et qu'un octet modifié
  est refusé
* **Une connexion vérifiée** : en sortant, le RTE vérifie le certificat de l'application. En entrant via HTTPS, l'application épingle le certificat propre du RTE
  quand il rejoint, et ne le contacte que s'il présente celui-là (voir [Modes](modes.html#inbound)). Un RTE entrant en HTTP simple a sa place
  sur un réseau privé, comme celui du projet Docker Compose
* **Aucun environnement hérité** : `ansible-playbook` reçoit l'environnement du RTE privé de chaque variable que lit AnsibleForms lui-même
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, les `MYSQL_*` et les autres), si bien que
  `lookup('env', ...)` ne peut pas les atteindre. Ce que vous définissez pour les playbooks (`PATH`, proxies, `ANSIBLE_*`) passe tel quel
* **Aucun modèle venant des utilisateurs** : {% raw %}une valeur de formulaire qui contient `{{`, `{%` ou `{#` atteint le playbook comme une chaîne unsafe{% endraw %}
  qu'ansible ne passe jamais au moteur de templates, sauf si le formulaire définit `allowJinjaInExtravars`, et aucun shell n'exécute jamais la ligne de commande
* **Pas root** : le RTE et ses playbooks tournent en tant que `node` (uid 1000), si bien qu'un playbook peut faire ce que cet utilisateur peut faire dans le conteneur, comme
  lire ses fichiers et la clé ssh, et rien de plus

Traitez son conteneur, son image et son environnement avec le même soin que ceux de l'application.

---

## Mode base de données (déprécié)

Le RTE de la 7.0 à la 7.2, sans `RTE_MODE`, tourne pendant toute la 7.x et sera supprimé dans la 8.0.0. Il diffère des étapes ci-dessus sur quatre points :

* **Il détient la base de données** : ses paramètres `DB_*`, et `ENCRYPTION_SECRET` quand il s'enregistre lui-même
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **La remise est un appel HTTP** : l'application appelle `POST <address>/rte/v1/jobs` avec le jeton et les secrets scellés, et le RTE réclame
  le job en y écrivant son nom dans la base de données (étapes 3 et 4)
* **Il écrit lui-même la sortie** : dans la base de données, par lots, sans spool (étape 7). Une interruption lui parvient via l'indicateur d'interruption du job,
  qu'il lit toutes les 2 secondes, et un appel `/cancel`
* **Il lit les fichiers depuis le volume de l'application** : il a besoin du même disque que l'application, comme avec `RTE_FILES=local`

Sa page de runner n'a aucun des [paramètres RTE](../runners/runner-page.html#an-rtes-settings) : il lit ses propres variables. Pour le passer à un
mode socket, voir [Modes](modes.html#database-deprecated).

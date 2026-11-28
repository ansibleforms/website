---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: 42d2358e58b374791786a5f99e571e566eca4d4a
---

# Images RTE
{: .no_toc }

Les trois images RTE publiées, et un RTE à vous avec les collections et les bibliothèques qu'utilisent vos playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les images RTE

Le RTE est publié en trois couches, chacune construite sur la précédente, avec les mêmes tags que le contrôleur (voir [Tags d'image](../installation/#image-tags)) :

| Image | Ce qu'elle contient | À utiliser |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js et le serveur AnsibleForms, git, ssh et sshpass. Ni python ni ansible, elle n'exécute donc aucun playbook à elle seule | Pour construire un RTE avec vos propres versions de python et d'ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, plus python 3.14, ansible-core et quelques bibliothèques courantes (`jmespath`, `netaddr`, `requests`, `paramiko`). Aucune collection | Pour construire un RTE plus petit avec uniquement les collections et les bibliothèques qu'utilisent vos playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Le core, plus le paquet `ansible` sur le même ansible-core, et ce que contenait l'image d'AnsibleForms 6.5 : les collections NetApp, AWS et community, `pandas`, `pyvmomi`, `boto3`, le client mariadb, ytt et quelques outils système | **La valeur par défaut.** Exécutez-la telle quelle : les playbooks de la 6.5 y trouvent ce qu'ils utilisaient |

Comme l'image du contrôleur, chaque couche tourne en tant qu'utilisateur `node` (uid 1000), et les playbooks tournent aussi sous cet utilisateur.

Depuis la 7.6.0, chaque couche est publiée pour `linux/amd64` et `linux/arm64` sous le même tag. Un RTE que vous construisez à partir d'une couche est
construit pour l'architecture de la machine qui le construit : pour des hôtes arm64, construisez-le sur l'un d'eux, ou avec `docker buildx build --platform linux/arm64`.

---

## Construire votre propre RTE

Partez de `ansibleforms-rte-core` et ajoutez les collections et les bibliothèques python qu'utilisent vos playbooks. Cet exemple NetApp est l'un
des Dockerfiles de [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte) :

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

L'environnement python et le dossier des collections appartiennent à `node`, ces installations n'ont donc pas besoin de root. Une couche qui installe des paquets
système passe en `USER root` pour eux et revient à `USER node` à la fin. Pour apporter votre propre python et votre propre ansible, partez de
`ansibleforms-rte-base` (`Dockerfile.own-ansible` dans le même dossier).

Gardez l'image alignée sur la version du contrôleur : `:7` suit le `:7` du contrôleur. Les collections et les rôles peuvent aussi être montés au lieu d'être intégrés, dans
`/etc/ansible/collections` et `/etc/ansible/roles`. Aucune reconstruction n'est alors nécessaire à chaque modification, mais ce qui s'exécute dépend de ce volume ;
les bibliothèques python vont toujours dans l'image. Tout intégrer est reproductible et démarre vite, c'est donc la voie à suivre en production.

---

## La construire dans le Designer

Depuis 7.9.0 vous décrivez un environnement d'exécution dans le Designer ; un [builder](builder.html) construit son image, la pousse et la signe.

1. Donnez à un dépôt l'usage **Environnements d'exécution** (Paramètres > Dépôts) ; il contient les définitions.
2. Dans le Designer, ouvrez **Environnements d'exécution** et cliquez sur **Nouveau** : remplissez-le dans l'onglet **Visuel**, ou écrivez-le dans l'onglet **YAML**.
3. **Enregistrer**, puis **Push** pour le committer dans le dépôt, et **Construire** : la construction est un job de la page **Jobs**, avec son log en direct.

Chaque environnement d'exécution est un dossier à lui dans le dépôt, à son nom, qui ne contient que sa définition :

```text
rte-netapp/
  rte.yaml
```

Le Dockerfile, `ansible.cfg` et les fichiers de dépendances sont réécrits à chaque construction, à partir de la définition et de la version
de l'app : ils ne sont donc jamais périmés dans le dépôt. L'onglet **Fichiers** les montre tels que le builder les reçoit.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Toutes les clés sauf le nom peuvent être omises ; la barre d'outils de l'onglet **YAML** règle chaque partie dans une boîte de dialogue.

| Clé | Ce que c'est |
|---|---|
| `name` | Le nom de l'environnement d'exécution, celui de son dossier et de son image : lettres minuscules, chiffres, points, tirets et tirets bas |
| `arch` | `all`, une image pour amd64 et arm64 comme celles publiées, ou `amd64` ou `arm64` seul ; `all` si omis. Une architecture autre que celle de l'hôte du builder demande [QEMU sur cet hôte](builder.html#amd64-and-arm64) |
| `python` | Le python de l'image, de 3.11 à 3.15 ; 3.15 si omis |
| `ansible_core` | Une release d'ansible-core (`2.22`) ou une version (`2.22.0`) qui tourne sur ce python ; la plus récente qui le fait si omis |
| `ansible_collections` | Les collections, chacune avec son `name` (namespace.name) et une `version` facultative ; la dernière si omise. Ce dont chaque collection a besoin, son `requirements.txt` et son `bindep.txt` (ou son `meta/execution-environment.yml`), est installé avec elle, comme le fait ansible-builder |
| `python_packages` | Des paquets python, comme les lignes d'un `requirements.txt` |
| `os_packages` | Des paquets Debian 13 (trixie) |
| `registry` | `credential` : un identifiant **Registre de conteneurs**, qui contient l'adresse du registre et son login ; `path` : le chemin de l'image dans celui-ci, son nom si omis ; `tag` : `app`, la version de l'app (`7.9.0`), pour qu'une reconstruction suive chaque mise à jour, ou un tag à vous |
| `sbom` | `true` joint à l'image une nomenclature logicielle (SBOM) |
| `sign` | `credential` : un identifiant **Clé de signature**, avec lequel le builder signe l'image avec cosign 3 ; vérifiez-la avec `cosign verify --key <clé publique>` de cosign 3 (cosign 2 ne lit pas ses signatures) |

Chaque environnement d'exécution est construit à partir de `ansibleforms-rte-base` de la version de l'app : un environnement au tag `app` dont
l'image a été construite pour une version plus ancienne est signalé comme tel sur la page **Environnements d'exécution**, avec **Les reconstruire**.

---

## Le contrat

Ce que le contrôleur et un RTE doivent partager, c'est leur contrat, un numéro que les deux annoncent. Un RTE d'une version plus ancienne continue de fonctionner avec un
contrôleur plus récent tant que les deux parlent le même contrat ; quand une version le change, ses notes de version indiquent que les RTE doivent être mis à jour. Chaque mode
a le sien :

| Mode | Contrat | En cas de discordance |
|---|---|---|
| Sortant, Entrant | 3, nouveau dans la 7.3.0 | Le contrôleur ferme le socket du RTE avec le code `4409` et journalise *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE sortant journalise *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un job envoyé avec un autre contrat est refusé |
| Base de données (obsolète) | 2, depuis la 7.0.0 | Le RTE refuse les jobs du contrôleur |

**Tester la connexion** sur le runner indique quel contrat parle le RTE et lequel il faut au contrôleur (voir
[Tester la connexion](../runners/runner-page.html#test-connection)), et la ligne **Runners** de la page **Statut** exécute la même vérification.

---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Images RTE
{: .no_toc }

Les trois images RTE publiées, et un RTE à vous avec les collections et les bibliothèques qu'utilisent vos playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les images RTE

Le RTE est publié en trois couches, chacune construite sur la précédente, avec les mêmes tags que l'application (voir [Tags d'image](../installation/#image-tags)) :

| Image | Ce qu'elle contient | À utiliser |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js et le serveur AnsibleForms, git, ssh et sshpass. Ni python ni ansible, elle n'exécute donc aucun playbook à elle seule | Pour construire un RTE avec vos propres versions de python et d'ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, plus python 3.14, ansible-core et quelques bibliothèques courantes (`jmespath`, `netaddr`, `requests`, `paramiko`). Aucune collection | Pour construire un RTE plus petit avec uniquement les collections et les bibliothèques qu'utilisent vos playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Le core, plus le paquet `ansible` sur le même ansible-core, et ce que contenait l'image d'AnsibleForms 6.5 : les collections NetApp, AWS et community, `pandas`, `pyvmomi`, `boto3`, le client mariadb, ytt et quelques outils système | **La valeur par défaut.** Exécutez-la telle quelle : les playbooks de la 6.5 y trouvent ce qu'ils utilisaient |

Comme l'image de l'application, chaque couche tourne en tant qu'utilisateur `node` (uid 1000), et les playbooks tournent aussi sous cet utilisateur.

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

Gardez l'image alignée sur la version de l'application : `:7` suit le `:7` de l'application. Les collections et les rôles peuvent aussi être montés au lieu d'être intégrés, dans
`/etc/ansible/collections` et `/etc/ansible/roles`. Aucune reconstruction n'est alors nécessaire à chaque modification, mais ce qui s'exécute dépend de ce volume ;
les bibliothèques python vont toujours dans l'image. Tout intégrer est reproductible et démarre vite, c'est donc la voie à suivre en production.

---

## Le contrat

Ce que l'application et un RTE doivent partager, c'est leur contrat, un numéro que les deux annoncent. Un RTE d'une version plus ancienne continue de fonctionner avec une
application plus récente tant que les deux parlent le même contrat ; quand une version le change, ses notes de version indiquent que les RTE doivent être mis à jour. Chaque mode
a le sien :

| Mode | Contrat | En cas de discordance |
|---|---|---|
| Sortant, Entrant | 3, nouveau dans la 7.3.0 | L'application ferme le socket du RTE avec le code `4409` et journalise *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE sortant journalise *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un job envoyé avec un autre contrat est refusé |
| Base de données (obsolète) | 2, depuis la 7.0.0 | Le RTE refuse les jobs de l'application |

**Tester la connexion** sur le runner indique quel contrat parle le RTE et lequel il faut à l'application (voir
[Tester la connexion](../runners/runner-page.html#test-connection)), et la ligne **Runners** de la page **Statut** exécute la même vérification.

---
layout: default
title: Tâches système
parent: Jobs
nav_order: 7
translated_from: 3c7c5f9702fa19b6daa323c22d92feefd289dc54
---

# Tâches système
{: .no_toc }

Les tâches de maintenance qu'AnsibleForms exécute seul, et quand elles s'exécutent
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : les nettoyages, la sauvegarde nocturne et les autres travaux de fond du serveur, listés sous **Jobs** depuis la 7.8.0.

---

## Les tâches

Le serveur exécute ces tâches de lui-même, chacune selon un cron dans le fuseau horaire du serveur, défini par [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) :

| Tâche | Exécution par défaut | Ce qu'elle fait |
|---|---|---|
| **Jobs abandonnés** | Toutes les heures | Termine les jobs qui ont tourné un jour sans sortie et qu'aucun runner n'a pris (voir [Jobs abandonnés](cleanup.html#abandoned-jobs)) |
| **Nœuds arrêtés** | Toutes les minutes | Libère les jobs, les réservations et les runners tenus par les nœuds AnsibleForms et les RTE qui ont cessé de répondre |
| **Fins de planification** | Toutes les minutes | Désactive ou supprime les [planifications](schedules.html) arrivées à leur fin |
| **Resync des planifications** | Toutes les 5 minutes | Relit dans la base de données les planifications et les pulls de dépôts, au cas où un avis de changement aurait été manqué |
| **Jetons expirés** | Chaque jour à 03:00 | Supprime les jetons de connexion expirés, les révocations de jetons et les jetons d'API expirés |
| **Nettoyage du journal d'audit** | Chaque jour à 03:30 | Supprime les entrées d'audit plus anciennes que `AUDIT_RETENTION_DAYS` |
| **Nettoyage des jobs** | Chaque jour à 02:30 | Supprime les jobs terminés plus anciens que `JOB_RETENTION_DAYS`, avec leur sortie |
| **Sauvegarde nocturne** | Chaque jour à minuit | Sauvegarde la base de données et supprime les plus anciennes sauvegardes nocturnes au-delà de `NIGHTLY_BACKUP_RETENTION` |
| **Nettoyage des jobs enregistrés** | Chaque jour à 04:00 | Supprime les jobs enregistrés dont l'échéance est passée ou inutilisés depuis `STORED_JOB_UNUSED_DAYS`, et oublie les nœuds partis depuis un jour |
| **Rechargement du config seed** | Toutes les minutes | Applique de nouveau le [config seed](../seed/reloading.html) quand son fichier a changé |

Les paramètres de conservation sont décrits dans [Sauvegardes et conservation](../customization/retention.html), et les sauvegardes dans
[Sauvegardes](../production/backups.html). Le **Rechargement du config seed** est désactivé sans [`CONFIG_SEED_PATH`](../customization/configuration.html#env_CONFIG_SEED_PATH).

Ces tâches s'exécutent sur le nœud qui fait le travail de fond : le processus sans `AF_ROLE`, ou le `worker` qui détient le verrou du worker
quand l'application est répartie sur plusieurs nœuds (voir [Mise à l'échelle](../production/scaling.html#roles)).

---

## Les boucles du hub des runners

Le hub des runners remet les jobs aux RTE, et trois boucles qui lui sont propres s'exécutent toutes les quelques secondes au lieu d'un cron :

| Boucle | Exécution par défaut | Ce qu'elle fait |
|---|---|---|
| **Distribution aux runners** | Toutes les 2 secondes | Remet les jobs en attente et les annulations à leurs runners ; un job lancé sur un autre nœud atteint son runner au passage suivant |
| **Appel des runners entrants** | Toutes les 10 secondes | Appelle les runners [entrants](../rte/modes.html#inbound) que ce nœud peut tenir, de nouveau pour celui qui a perdu son socket |
| **Purge des jobs terminés** | Toutes les 60 secondes | Libère ce que ce nœud gardait des jobs terminés sur un autre nœud |

Les boucles s'exécutent sur chaque nœud qui exécute l'application web : avec plusieurs nœuds d'application, chacun a les siennes. Une minute, le
plus petit pas d'un cron, est trop grossière pour elles : chacune s'exécute toutes les tant de secondes.

---

## La liste Système

La page [Jobs](./) liste les tâches sous **Futur**, comme **Système**, avec le nombre de tâches, pour les admins (option de rôle `showSettings`).

La liste a une ligne par tâche et par boucle, et est relue toutes les minutes :

| Colonne | Affiche |
|---|---|
| **Nom** | Le nom de la tâche |
| **Planification** | Quand elle s'exécute, en mots (*Toutes les heures*, *Toutes les 2 secondes*), son cron au survol, ou **Désactivée** pour une tâche qui ne s'exécute pas |
| **Dernière exécution** | Quand la dernière exécution a commencé, ou un tiret si elle n'a jamais tourné |
| **Prochaine exécution** | Quand elle s'exécute ensuite |
| **Statut** | Comment s'est passée la dernière exécution : `success` ou `failed` |

**Colonnes** propose aussi **Description**, ce que fait chaque tâche. Un clic sur une ligne ouvre la page de la tâche. Les tâches sont
celles de l'application : elles ne peuvent être ni ajoutées ni supprimées.

---

## La page d'une tâche

La page d'une tâche a trois onglets, avec **Exécuter maintenant** et **Enregistrer** au-dessus, et un champ de recherche qui filtre tous les onglets à la fois.

| Onglet | Ce qu'il affiche |
|---|---|
| **Détails** | Son **Nom** et sa **Description**, son **Dernier lancement** (l'erreur au survol en cas d'échec), le **Résultat** de la dernière exécution, **Dernière exécution**, **Prochaine exécution**, le **Nœud** qui a répondu pour une boucle, et le **Paramètre appliqué** |
| **Planification** | Quand elle s'exécute : un cron pour une tâche, un **Intervalle** en secondes pour une boucle |
| **Exécutions** | Chaque exécution enregistrée, la plus récente en premier |

**Paramètre appliqué** nomme la variable et sa valeur, par exemple `JOB_RETENTION_DAYS` 90, avec **À modifier dans les Paramètres** pour ouvrir
l'onglet de paramètres qui la modifie. Une tâche sans un tel paramètre affiche un tiret.

### L'onglet Planification
{: .no_toc }

Le cron d'une tâche se modifie dans le même éditeur que celui d'une planification : préréglages, l'expression en mots et les trois prochaines
exécutions, dans le fuseau horaire du serveur. Il prend 5 champs (minute, heure, jour, mois et jour de la semaine) et doit se répéter. Une boucle
prend un nombre entier de secondes, dans ses bornes, que la ligne sous le champ indique.

**Enregistrer** écrit la valeur dans le fichier de paramètres géré, comme le font les pages de paramètres, et l'applique aussitôt sur chaque nœud,
sans redémarrage. Une valeur définie dans l'environnement du processus, ou toute valeur avec [`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)`=0`,
s'affiche en lecture seule, avec la ligne *Défini par la variable d'environnement* et son nom.

### L'onglet Exécutions
{: .no_toc }

Chaque exécution d'une tâche est une ligne, avec ces colonnes :

| Colonne | Affiche |
|---|---|
| **Lancé par** | L'utilisateur qui a choisi **Exécuter maintenant**, comme `admin (local)`, ou **Planification** pour une exécution selon son cron |
| **Heure de début**, **Heure de fin** et **Durée** | Quand l'exécution a commencé et s'est terminée, et combien de temps elle a pris |
| **Statut** | `success` ou `failed` |
| **Résultat** | Ce qu'a fait l'exécution, par exemple *Removed 120 jobs*, ou son erreur |
| **Nœud** | Le nœud qui l'a exécutée |

Les exécutions des 30 derniers jours sont conservées, jusqu'à 1000 par tâche : pour une tâche qui s'exécute chaque minute, environ ses 16 dernières heures.

Une boucle s'exécute bien trop souvent pour une ligne par passage. Son onglet **Exécutions** affiche à la place, par nœud :

* un résumé de chaque heure, par exemple *1,800 passes, 0 failed*, `failed` quand un passage de cette heure a échoué ;
* une ligne pour chaque **Exécuter maintenant**, avec *Run now: done* ou l'erreur ;
* une ligne `failed` quand un passage sur sa minuterie échoue, au plus une fois par minute pour la même erreur.

### Exécuter maintenant
{: .no_toc }

**Exécuter maintenant** exécute la tâche tout de suite, sur le nœud qui exécute les tâches, et enregistre l'exécution avec votre nom. Le bouton est
désactivé tant qu'une exécution de la tâche est en cours, et pour une tâche **Désactivée**. Une longue exécution, comme la sauvegarde nocturne,
continue après la réponse de la page.

L'**Exécuter maintenant** d'une boucle exécute un passage sur le nœud qui sert la page, et il est refusé là où le hub des runners ne tourne pas. Chaque
**Exécuter maintenant** est écrit dans le journal d'audit comme `system.task.run`.

---

## Changer quand une tâche s'exécute

Chaque tâche et chaque boucle a une variable d'environnement pour son horaire, que son onglet **Planification** écrit. Toutes s'appliquent sans redémarrage.

| Variable | Défaut | Tâche |
|---|---|---|
| [`ABANDONED_JOBS_CRON`](../customization/system-tasks.html#env_ABANDONED_JOBS_CRON) | `0 * * * *` | Jobs abandonnés |
| [`DEAD_NODES_CRON`](../customization/system-tasks.html#env_DEAD_NODES_CRON) | `* * * * *` | Nœuds arrêtés |
| [`SCHEDULE_ENDS_CRON`](../customization/system-tasks.html#env_SCHEDULE_ENDS_CRON) | `* * * * *` | Fins de planification |
| [`SCHEDULE_RESYNC_CRON`](../customization/system-tasks.html#env_SCHEDULE_RESYNC_CRON) | `*/5 * * * *` | Resync des planifications |
| [`TOKEN_CLEANUP_CRON`](../customization/system-tasks.html#env_TOKEN_CLEANUP_CRON) | `0 3 * * *` | Jetons expirés |
| [`AUDIT_CLEANUP_CRON`](../customization/system-tasks.html#env_AUDIT_CLEANUP_CRON) | `30 3 * * *` | Nettoyage du journal d'audit |
| [`JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_JOB_CLEANUP_CRON) | `30 2 * * *` | Nettoyage des jobs |
| [`NIGHTLY_BACKUP_CRON`](../customization/system-tasks.html#env_NIGHTLY_BACKUP_CRON) | `0 0 * * *` | Sauvegarde nocturne |
| [`STORED_JOB_CLEANUP_CRON`](../customization/system-tasks.html#env_STORED_JOB_CLEANUP_CRON) | `0 4 * * *` | Nettoyage des jobs enregistrés |
| [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON) | `* * * * *` | Rechargement du config seed |
| [`RUNNER_DISPATCH_SECONDS`](../customization/system-tasks.html#env_RUNNER_DISPATCH_SECONDS) | `2` (1 à 60) | Distribution aux runners |
| [`RUNNER_DIAL_SECONDS`](../customization/system-tasks.html#env_RUNNER_DIAL_SECONDS) | `10` (2 à 300) | Appel des runners entrants |
| [`RUNNER_PRUNE_SECONDS`](../customization/system-tasks.html#env_RUNNER_PRUNE_SECONDS) | `60` (10 à 3600) | Purge des jobs terminés |

Une valeur qui n'est pas un cron valide, ou des secondes hors bornes, définie à la main dans l'environnement, est ignorée au profit de la valeur par défaut.

### CONFIG_SEED_RELOAD_SECONDS
{: .no_toc }

Avant la 7.8.0, le config seed était vérifié toutes les [`CONFIG_SEED_RELOAD_SECONDS`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_SECONDS).
Cette variable est obsolète depuis la 7.8.0, au profit de `CONFIG_SEED_RELOAD_CRON`, et sera supprimée dans la 8.0. Tant que
`CONFIG_SEED_RELOAD_CRON` n'est pas défini, elle est encore lue comme un cron, avec un avertissement dans le journal au démarrage :

| `CONFIG_SEED_RELOAD_SECONDS` | Lue comme |
|---|---|
| `60` | `* * * * *`, toutes les minutes |
| Un multiple de 60 jusqu'à `3600` | Toutes les tant de minutes, par exemple `*/5 * * * *` pour `300` (`3600` se lit `0 * * * *`) |
| Un nombre inférieur à 60 qui divise 60 | Toutes les tant de secondes |
| `0` | Le rechargement est désactivé |
| Tout autre nombre | Le plus proche de ceux-ci, ce que le journal indique |

L'onglet **Planification** de la tâche affiche ce cron avec la ligne *De CONFIG_SEED_RELOAD_SECONDS, obsolète ; un cron enregistré ici la
remplace.* **Enregistrer** écrit `CONFIG_SEED_RELOAD_CRON`, qui l'emporte dès lors sur l'ancienne variable.

---
layout: default
title: Jobs
nav_order: 3
has_children: true
has_toc: false
redirect_from:
  - /jobs.html
permalink: /jobs/
translated_from: 5ebe08c87f55b79169432884bb849e27dde03cb2
---

# Jobs
{: .no_toc }

Suivre, arrêter, relancer, approuver et supprimer les jobs que lancent vos formulaires
{: .fs-6 .fw-300 }

---

Pour tous ceux qui lancent des formulaires : ce qu'est un job, où le trouver, et qui peut le voir.

---

## Qu'est-ce qu'un job

Un job est une exécution d'un formulaire : AnsibleForms l'enregistre avec son statut, ses extravars et sa sortie dès que le formulaire est soumis.

Chaque job conserve :

* le **formulaire** qu'il a exécuté et l'**utilisateur** qui l'a lancé (avec le type d'utilisateur, comme `local` ou `ldap`) ;
* son **type de job** et son **statut**, ainsi que son **heure de début** et son **heure de fin** ;
* sa **sortie**, les extravars et les identifiants avec lesquels il s'est exécuté, et les valeurs de champ saisies dans le formulaire.

Un formulaire multistep crée un job pour le formulaire et un job par étape. Les étapes sont liées au job principal et listées sous lui.

Les mêmes jobs peuvent être lancés, suivis et gérés via l'[API REST](../api/jobs.html).

---

## La page Jobs

Le lien **Jobs** de l'en-tête ouvre la liste de tous les jobs, du plus récent au plus ancien (`/jobs/all`). La page et son lien sont affichés aux utilisateurs
dont le rôle définit l'[option de rôle](../config/roles.html#role-options) `showJobs`.

![La liste des jobs](../assets/screenshots/job-log.jpg)

Le menu de gauche classe les jobs dans le temps, avec le nombre de jobs de chaque entrée ; une entrée de statut filtre la liste sur ce statut :

| Section | Entrée du menu | Affiche |
|---|---|---|
| **Passé** | **Réussi** | Les jobs au statut `success` |
| | **Échoué** | Les jobs au statut `failed` |
| | **Annulé** | Les jobs au statut `aborted` |
| | **Rejeté** | Les jobs au statut `rejected` |
| | **Abandonné** | Les jobs au statut `abandoned` |
| **Présent** | **En cours** | Les jobs au statut `running` |
| | **En attente d'approbation** | Les jobs au statut `approve` ; le compteur passe à l'orange quand un job attend |
| **Futur** | **Planifiés** | La page [Planifications](schedules.html) (option de rôle `allowScheduledJobs`) |
| | **Enregistrés** | La page [Jobs enregistrés](stored-jobs.html) (option de rôle `allowStoredJobs`) |

Le menu n'a pas d'entrée pour tous les jobs : le lien **Jobs** de l'en-tête les affiche tous, jobs `warning` compris.

Au-dessus du tableau, sur la ligne de titre :

* la **zone de recherche** garde les jobs dont les colonnes affichées contiennent le texte (sans tenir compte de la casse), ou dont l'une des étapes l'a comme id
  ou comme cible ;
* **Supprimer** (avec le nombre de jobs cochés) supprime ensemble les jobs cochés dans la première colonne ;
* **Colonnes** affiche ou masque les colonnes `id`, `form`, `job type`, `status`, `start time`, `end time`, `duration` et `user` ;
  la durée d'un job en cours s'incrémente ;
* **Actualiser** recharge la liste.

La liste charge les jobs les plus récents, autant que l'indique le réglage [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE)
(**Paramètres > Système > Général**, onglet **Jobs**, `1000` par défaut) ; ses pages, sa recherche et ses filtres portent sur ces jobs.

Chaque colonne peut être triée et a son propre champ de filtre. Un job multistep a une flèche juste avant son `form` qui déplie
ses étapes ; un clic sur le reste d'une ligne ouvre le job.

La cloche de l'en-tête compte les jobs qui attendent votre approbation et ouvre la liste sur **En attente d'approbation**. Pour les utilisateurs qui peuvent voir
les runners, elle compte aussi les [runners en attente d'approbation](../runners/registration.html#approving-an-rte), des RTE qui ont demandé à rejoindre l'instance,
et ouvre **Connexions > Runners** quand seuls des runners attendent. Quand les deux attendent, elle ouvre un menu, **Jobs en attente d'approbation** et
**Runners en attente d'approbation**, chacun avec son compteur.

---

## Qui voit quels jobs

Les jobs qu'un utilisateur voit dépendent de ses rôles :

| Utilisateur | Voit |
|---|---|
| Admin (rôle `admin`) | Tous les jobs |
| Option de rôle `showAllJobLogs` | Tous les jobs |
| Option de rôle `manageAllJobs` (depuis la 7.3.0) | Tous les jobs, et peut les arrêter, les supprimer et les relancer |
| Tout autre utilisateur | Ses propres jobs, et les jobs en attente d'une approbation qui nomme l'un de ses rôles |

Jusqu'à la 7.2, tout utilisateur pouvait ouvrir n'importe quel job en attente d'approbation, extravars et sortie comprises ; depuis la 7.3.0, seuls son propriétaire et ses
approbateurs le peuvent. Voir un job ne donne pas droit à toutes les actions sur lui : arrêter, supprimer et relancer le job d'un autre utilisateur demande d'être admin ou
d'avoir `manageAllJobs`, et `showAllJobLogs` ne fait qu'afficher les jobs. Supprimer demande aussi `allowJobDeletion`, et relancer `allowJobRelaunch`.

---

## Dans cette section

Chaque sujet a sa propre page :

| Page | Contenu |
|---|---|
| [Statuts et types](statuses.html) | Chaque statut qu'un job peut avoir, et les types de job |
| [Suivre un job](following.html) | Sortie en direct, extravars, filtres et téléchargements |
| [Actions sur les jobs](actions.html) | Lancer, arrêter, relancer, approuver ou rejeter, et supprimer un job |
| [Planifications](schedules.html) | Exécuter un formulaire plus tard ou selon une planification cron, et gérer toutes les planifications |
| [Jobs enregistrés](stored-jobs.html) | Conserver les données d'un formulaire pour les recharger plus tard |
| [Nettoyage](cleanup.html) | Les jobs interrompus par un redémarrage, et la durée de conservation des jobs terminés |

---
layout: default
title: Planifications
parent: Jobs
nav_order: 4
redirect_from:
  - /schedules.html
  - /schedules/
  - /schedules/scheduling.html
  - /schedules/schedules-page.html
translated_from: 7ffab643975d7705375fbd02588c9db76e27f74f
---

# Planifications
{: .no_toc }

Exécuter un formulaire plus tard ou selon une planification cron, et gérer toutes les planifications
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les actions du formulaire

Un formulaire peut faire plus que s'exécuter immédiatement : la liste déroulante à côté de son bouton **Soumettre** contient trois autres actions.

| Action | Ce qu'elle fait | Option de rôle |
|---|---|---|
| **Planifier (récurrent)** | Crée une planification qui exécute le formulaire selon une expression cron | `allowScheduledJobs` |
| **Exécuter plus tard (une seule fois)** | Crée une planification qui exécute le formulaire une fois, à la date et à l'heure que vous choisissez | `allowPlannedJobs` |
| **Enregistrer** | Enregistre les valeurs des champs, pour les recharger plus tard dans le formulaire | `allowStoredJobs` |

Une action dont l'option de rôle est désactivée n'est pas affichée. Le formulaire est validé avant chacune d'elles, comme pour **Soumettre**. Les deux
actions de planification créent une entrée sur la page **Planifications** ; **Enregistrer** crée une entrée sur la page **Jobs enregistrés**. La
barre latérale de la page [Jobs](./) les ouvre sous **Futur**, en tant que **Planifiés** et **Enregistrés**. Les options de rôle sont décrites
dans [Options de rôle](../config/roles.html#role-options).

{: .warning }
> Considérez `allowScheduledJobs` comme une option de niveau admin. Ses planifications n'appartiennent pas à l'utilisateur qui les a créées : chaque utilisateur
> disposant de l'option voit et peut modifier toutes les planifications. Une telle planification s'exécute aussi avec les droits admin, pour n'importe quel formulaire, quel que soit
> l'accès propre de son créateur. Ne l'accordez qu'aux rôles auxquels vous feriez confiance comme admins.

{: .note }
> **Exécuter plus tard (une seule fois)** ne nécessite que `allowPlannedJobs`. Pour un utilisateur sans `allowScheduledJobs`, elle planifie une exécution **en tant que cet
> utilisateur** : le serveur vérifie que l'utilisateur peut exécuter le formulaire, et le job s'exécute en son nom, lui appartient, le moment venu
> (voir [Exécutions planifiées](#planned-runs)).

---

## Planifier un formulaire

Remplissez le formulaire, puis ouvrez la liste déroulante à côté de **Soumettre** et choisissez l'une des actions de planification.

- **Planifier (récurrent)** ouvre **Créer une planification** : saisissez un **Nom** et une **Expression Cron** (la valeur par défaut, `0 0 * * *`,
  s'exécute chaque jour à minuit), puis sélectionnez **Créer une planification**.
- **Exécuter plus tard (une seule fois)** ouvre **Exécuter plus tard** : saisissez un **Nom** et choisissez la date et l'heure **Exécuter à**, puis sélectionnez
  **Planifier le job**.

Le nom doit être unique parmi toutes les planifications. La planification conserve le nom du formulaire et une copie des extravars que le formulaire a produites
à ce moment-là, écrites en YAML ; chaque exécution utilise cette copie : modifiez-la donc sur la page **Planifications** pour changer ce que reçoit le job.

![Planifications](../assets/screenshots/schedules.jpg)

---

## La page Planifications

La page **Planifications** liste toutes les planifications, avec leur colonne **Activé** depuis la 7.3.0, et nécessite `allowScheduledJobs`. Le menu de chaque ligne propose :

| Action | Ce qu'elle fait |
|---|---|
| **Modifier** | Change le nom, le type, l'expression cron ou l'heure d'exécution, le formulaire et les extra vars |
| **Exécuter maintenant** | Exécute la planification maintenant, sans attendre son expression cron ou son heure d'exécution |
| **Activer** ou **Désactiver** | Active ou désactive la planification, selon le cas, comme l'indique sa colonne **Activé** (depuis la 7.3.0) |
| **Supprimer** | Supprime la planification ; elle cesse immédiatement de s'exécuter |
| **Dernière sortie** | Sur la page de la planification, ce qu'a rapporté la dernière exécution, comme le numéro du job qu'elle a démarré |

Une planification peut aussi être créée ici de zéro. Choisissez le **Formulaire**, puis cochez **Exécution unique** et définissez
**Exécuter à**, ou laissez la case décochée et définissez une **Planification**. **Variables supplémentaires** est du YAML sans formulaire pour le remplir : ajoutez donc vous-même les
valeurs dont le playbook a besoin, sous forme de dictionnaire (paires clé: valeur).

Le champ **Planification** est un éditeur cron : il décrit l'expression en mots, propose des préréglages et affiche un aperçu des prochaines
exécutions. Le serveur refuse une expression qu'il ne peut pas exécuter, ou qui ne peut jamais se produire.

Depuis la 7.3.0, chaque planification a un interrupteur **Activé**, pour la mettre en pause sans la supprimer. Une planification désactivée reste sur la page
avec ses réglages, mais ne s'exécute pas d'elle-même : une planification récurrente saute ses déclenchements cron, et une planification unique attend au-delà de son
**Exécuter à** jusqu'à ce qu'elle soit réactivée. **Exécuter maintenant** l'exécute toujours à la demande. Une nouvelle planification est activée, et les planifications
qui existaient avant la 7.3.0 sont activées après la mise à niveau.

---

## Expressions cron et fuseau horaire

Une planification récurrente prend une expression cron standard à 5 champs : minute, heure, jour du mois, mois et jour de la semaine.

| Expression | S'exécute |
|---|---|
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 2 * * *` | Chaque jour à 02:00 |
| `30 7 * * 1-5` | Du lundi au vendredi à 07:30 |
| `0 0 1 * *` | À minuit le premier jour de chaque mois |

D'autres exemples, et les fonctionnalités cron que l'éditeur n'accepte pas, se trouvent dans la FAQ sous
[Quelles expressions cron puis-je utiliser ?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Les planifications cron s'exécutent dans le fuseau horaire du serveur, défini avec [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (par défaut `UTC`),
> et non dans le fuseau horaire de votre profil ou de votre navigateur. L'éditeur cron affiche l'aperçu des prochaines exécutions dans ce même fuseau.

---

## Comment une planification s'exécute

Quand une planification arrive à échéance, elle est mise en file d'attente, et le serveur démarre les planifications en attente une par une, en vérifiant la file toutes les 10 secondes.

- Les planifications **récurrentes** sautent un déclenchement tant que l'exécution précédente est encore en attente ou en cours : les exécutions ne se chevauchent jamais.
- Les planifications **uniques** s'exécutent dans la minute qui suit **Exécuter à**, puis sont supprimées, y compris quand elles sont démarrées avec **Exécuter maintenant**.
- Le **Statut** est `success` quand le job a été démarré et `failed` quand il n'a pas pu l'être. Un `success` indique seulement que le job a été
  lancé : ouvrez le job pour voir comment il s'est terminé.

Une planification créée avec `allowScheduledJobs` s'exécute en tant qu'utilisateur intégré `Schedule Service` (type `schedule`) avec le
rôle `admin`. Elle peut exécuter n'importe quel formulaire, quel que soit l'accès de la personne qui a créé la planification, et `ansibleforms_user` dans
ses extravars décrit cet utilisateur. Une [exécution planifiée](#planned-runs) s'exécute plutôt en tant qu'utilisateur qui l'a planifiée.

Le job reçoit aussi un objet `schedule` (avec son `id`, son `name` et son `form`), pour qu'un playbook sache qu'une planification l'a démarré :

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  form: Cleanup servers
```

---

## Exécutions planifiées

**Exécuter plus tard (une seule fois)** par un utilisateur sans `allowScheduledJobs` crée une exécution planifiée : une planification unique liée à cet utilisateur.

- **Lors de la planification**, le serveur vérifie que l'utilisateur peut exécuter le formulaire (ses `roles`), et le mode verbeux nécessite
  `allowVerboseMode`. Une exécution planifiée est toujours unique ; une expression cron est refusée.
- **Avec la validation au lancement `enforce`**, les valeurs des champs sont vérifiées lors de la planification : une exécution qui serait refusée est
  refusée pendant que l'utilisateur est encore là.
- **Lors de l'exécution**, le job s'exécute en tant que cet utilisateur, lui appartient, et passe par les mêmes vérifications qu'un lancement depuis le navigateur : les
  rôles du formulaire tels qu'ils sont alors, les extravars réservées retirées, et la validation au lancement. `ansibleforms_user` le décrit.

Celui qui planifie ne voit pas la page **Planifications**, qui nécessite `allowScheduledJobs` ; le job apparaît dans son propre historique de jobs.

---

## Quand le formulaire change

Une planification fait référence à son formulaire par son nom et l'exécute tel qu'il est défini au moment de chaque exécution.

- **Le formulaire est modifié** : l'exécution suivante utilise la nouvelle définition (playbook, template, inventaire) avec les extravars stockées dans
  la planification. Le formulaire n'est pas rendu, donc aucun champ n'est recalculé ; modifiez les extra vars de la planification pour qu'elles correspondent.
- **Le formulaire est renommé ou supprimé** : l'exécution échoue, le **Statut** devient `failed` et la **Dernière sortie** indique
  `Failed to launch : No such form '<name>'`. Modifiez la planification et choisissez le bon formulaire, ou supprimez-la.

---

## Les jobs planifiés dans l'historique des jobs

Chaque exécution d'une planification crée un job ordinaire, listé sur la page [Jobs](./) avec `Schedule Service` comme utilisateur ou,
pour une exécution planifiée, avec l'utilisateur qui l'a planifiée.

Un job `Schedule Service` n'appartient pas à la personne qui a créé la planification : il n'est donc visible que des admins et des
utilisateurs disposant de `showAllJobLogs` ; le job d'une exécution planifiée est aussi visible de son utilisateur. La **Dernière sortie** de la planification nomme le job qu'elle a démarré, pour que vous puissiez le retrouver dans la liste.

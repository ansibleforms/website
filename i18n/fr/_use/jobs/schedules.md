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
translated_from: 57383a13d04c8157937b3c6caa33ad7af84c93b7
---

# Planifications
{: .no_toc }

Exécuter un formulaire plus tard, selon un cron ou une rrule, et gérer toutes les planifications
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
actions de planification créent une entrée sous **Jobs > Planifiés** ; **Enregistrer** crée une entrée sur la page **Jobs enregistrés**. La
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
à ce moment-là, écrites en YAML ; chaque exécution utilise cette copie : modifiez-la donc sur la page de la planification pour changer ce que reçoit le job. Pour
la planifier plutôt avec une rrule, ou lui donner une fin, ouvrez sa page et modifiez son onglet **Planification**.

![Planifications](../assets/screenshots/schedules.jpg)

---

## La liste des planifications

**Jobs > Planifiés** liste toutes les planifications et nécessite `allowScheduledJobs` ; une ligne ouvre la page de la planification.

| Colonne | Affiche |
|---|---|
| **Activé** | Si la planification s'exécute selon sa propre planification |
| **Nom** et **Formulaire** | La planification, et le formulaire qu'elle exécute |
| **Planification** | Sa planification en langage courant, comme *At 02:00 AM* ; survolez-la pour voir le cron ou la règle elle-même |
| **Dernière exécution** | Quand elle s'est exécutée pour la dernière fois |
| **Prochaine exécution** | Quand elle s'exécute la prochaine fois, un tiret quand elle n'a aucune exécution à venir |
| **Statut** | Son dernier lancement : s'il a démarré un job, ou **Démarrage…** pendant qu'elle en lance un |

La colonne **Planification** indique une planification unique par **Exécution unique**. Une rrule que le langage courant ne peut pas décrire est
affichée telle quelle. Le menu de chaque ligne propose :

| Action | Ce qu'elle fait |
|---|---|
| **Modifier** | Ouvre la page de la planification |
| **Exécuter maintenant** | Exécute la planification maintenant, sans attendre sa planification |
| **Activer** ou **Désactiver** | Active ou désactive la planification, selon le cas, comme l'indique sa colonne **Activé** |
| **Supprimer** | Supprime la planification ; elle cesse immédiatement de s'exécuter |

**Nouveau planification** en crée une de zéro, en trois étapes : **Détails** (son **Nom**, sa **Description** et son **Formulaire**),
**Planification** (sa planification et sa fin) et **Variables supplémentaires**. **Variables supplémentaires** est du YAML sans formulaire pour le remplir :
ajoutez donc vous-même les valeurs dont le playbook a besoin, sous forme de dictionnaire (paires clé: valeur).

---

## La page d'une planification

La page d'une planification reprend les étapes de son dialogue en onglets, avec **Exécuter maintenant**, **Supprimer** et **Enregistrer** en haut à droite.

| Onglet | Ce qu'il contient |
|---|---|
| **Détails** | Sa source, **Nom**, **Description**, **Formulaire**, puis **Dernier lancement**, **Job lancé**, **Dernière exécution**, **Prochaine exécution** et **Activé** |
| **Planification** | Comment elle est planifiée (voir [Quand une planification s'exécute](#timing-a-schedule)) et comment elle se termine (voir [La fin d'une planification](#the-end-of-a-schedule)) |
| **Variables supplémentaires** | Le YAML que reçoit le job ; pour une planification conservée dans git, aussi les invites de son fichier |
| **Exécutions** | Les jobs qu'elle a démarrés, le plus récent en premier ; une ligne ouvre le job |

**Dernier lancement** indique comment s'est passé son dernier lancement, sous forme de statut : un échec en donne la raison au survol. **Job lancé** pointe vers
le job qu'elle a démarré, pour que vous puissiez l'ouvrir et voir comment il s'est terminé. L'onglet **Exécutions** liste les jobs que vous pouvez voir, avec
l'utilisateur sous lequel ils ont tourné, leur début, leur fin, leur durée et leur statut ; leur nombre figure dans le titre de l'onglet.

L'interrupteur **Activé** met une planification en pause sans la supprimer, et est enregistré avec **Enregistrer**, comme chaque champ de la page. Une
planification désactivée reste listée avec ses réglages, mais ne s'exécute pas d'elle-même : une planification récurrente saute ses exécutions, et une
planification unique attend au-delà de son moment jusqu'à ce qu'elle soit réactivée. **Exécuter maintenant** l'exécute toujours à la demande. Une nouvelle planification est activée.

---

## Quand une planification s'exécute

Une planification s'exécute de l'une de trois façons, choisie sous **Planification** dans son onglet **Planification** ; la rrule est nouvelle dans la 7.8.0.

| Planification | S'exécute | Voir |
|---|---|---|
| **Cron** | De façon récurrente, selon une expression cron dans le fuseau horaire du serveur | [Expressions cron et fuseau horaire](#cron-expressions-and-time-zone) |
| **Règle de récurrence (rrule)** | De façon récurrente, selon une règle iCal dans son propre fuseau horaire | [Règles de récurrence](#recurrence-rules) |
| **Exécution unique** | Une fois, à une date et une heure | [Comment une planification s'exécute](#how-a-schedule-runs) |

Avec un cron ou une rrule, l'éditeur affiche les trois prochaines exécutions, et les arrête à la fin de la planification. Changer de planification
ne garde que celle choisie : une planification passée d'un cron à une rrule perd son cron.

---

## Expressions cron et fuseau horaire

Une planification récurrente peut prendre une expression cron standard à 5 champs : minute, heure, jour du mois, mois et jour de la semaine.

| Expression | S'exécute |
|---|---|
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 2 * * *` | Chaque jour à 02:00 |
| `30 7 * * 1-5` | Du lundi au vendredi à 07:30 |
| `0 0 1 * *` | À minuit le premier jour de chaque mois |

L'éditeur cron décrit l'expression en mots, propose des préréglages et affiche un aperçu des prochaines exécutions. Le serveur refuse une
expression qu'il ne peut pas exécuter, ou qui ne peut jamais se produire. D'autres exemples, et les fonctionnalités cron que l'éditeur n'accepte pas, se
trouvent dans la FAQ sous [Quelles expressions cron puis-je utiliser ?](../faq.html#which-cron-expressions-can-i-use).

{: .note }
> Les planifications cron s'exécutent dans le fuseau horaire du serveur, défini avec [`LOG_TZ`](../customization/logging.html#env_LOG_TZ) (par défaut `UTC`),
> et non dans le fuseau horaire de votre profil ou de votre navigateur. L'éditeur cron affiche l'aperçu des prochaines exécutions dans ce même fuseau.

---

## Règles de récurrence

Depuis la 7.8.0, une planification récurrente peut prendre à la place une règle de récurrence iCal (rrule), qui s'exécute dans son propre fuseau horaire.

```text
DTSTART;TZID=Europe/Brussels:20261020T020000 RRULE:FREQ=DAILY;INTERVAL=1
DTSTART:20261019T060000Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
DTSTART;TZID=America/New_York:20261101T073000 RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
```

La première s'exécute chaque jour à 02:00 à Bruxelles, la deuxième chaque lundi à 06:00 UTC, la troisième le dernier jour ouvré de
chaque mois à 07:30 à New York. Une règle tient sur une ligne, ses parties séparées par des espaces :

| Partie | Ce qu'elle indique |
|---|---|
| `DTSTART` | La première exécution, avec un `TZID` (une zone IANA comme `Europe/Brussels`, ou un décalage comme `UTC+5` ou `GMT-3`), ou en UTC terminée par `Z` |
| `RRULE` | Quand elle se répète : `FREQ` avec un `INTERVAL` d'au moins 1, et `BYDAY`, `BYHOUR`, `BYMONTHDAY`, `COUNT`, `UNTIL` … selon les besoins ; une ou plusieurs |
| `EXRULE` | Facultatif : une règle d'exécutions à sauter |

Le serveur refuse une règle qu'il ne peut pas exécuter, et dit pourquoi :

- aucun `DTSTART`, plus d'un, ou un sans fuseau horaire, et `EXDATE` ou `RDATE` ;
- une règle sans `INTERVAL`, `FREQ=SECONDLY`, `BYDAY` avec un nombre (`5MO`), ou `COUNT` avec `UNTIL` ;
- `COUNT` au-delà de 999, un nombre `BYxxx` hors de sa plage (`BYHOUR` de 0 à 23, `BYSETPOS` de 1 à 366 ou de -366 à -1 …), un `WKST`
  qui n'est pas un jour de la semaine, un `DTSTART` ou un `UNTIL` qui n'est pas une vraie date (`20300230`), ou une partie donnée deux fois dans une règle ;
- une règle qui ne se déclenche jamais : aucune exécution dans les 50 ans qui suivent son `DTSTART`, comme `FREQ=HOURLY;INTERVAL=2;BYHOUR=1` à partir
  de minuit, qui ne tombe que sur les heures paires.

L'éditeur est une zone de texte : une nouvelle rrule commence chaque jour à minuit dans le fuseau horaire de votre navigateur. Il dit aussitôt pourquoi une règle
serait refusée, sinon affiche ses trois prochaines exécutions dans le fuseau propre à la règle, ou **Cette rrule n'a plus d'exécution à venir.** quand son
`UNTIL` ou son `COUNT` est dépassé. Une heure qu'un passage à l'heure d'été saute s'exécute quand l'horloge l'atteint (02:30 s'exécute à 03:30 la
nuit où l'horloge passe de 02:00 à 03:00), comme le fait un cron ; une heure que l'horloge affiche deux fois s'exécute une fois, à la première.

---

## La fin d'une planification

Depuis la 7.8.0, une planification par cron ou par rrule peut prendre fin ; sous **Fin** dans son onglet **Planification**, choisissez une option.

| Fin | La planification se termine |
|---|---|
| **Jamais** | Jamais : la valeur par défaut, et celle de chaque planification d'avant la 7.8.0 |
| **À une date** | À la date et à l'heure choisies : aucune exécution après |
| **Après** … **exécutions** | Une fois qu'elle a démarré autant de jobs au total, ceux que liste son onglet **Exécutions** ; le champ indique combien jusqu'ici |

**À la fin**, elle est désactivée (**La désactiver**, la valeur par défaut) ou supprimée (**La supprimer**). La tâche système **Fins de planification**
applique les fins chaque minute, et une planification qui atteint son nombre d'exécutions se termine juste après la dernière. Le `UNTIL` ou le
`COUNT` propre à une rrule s'applique toujours ; la fin s'y ajoute.

Une planification unique n'a pas de fin : elle se termine avec son exécution. Son interrupteur **Supprimer après exécution**, activé par défaut, la supprime
après son exécution ; désactivé, la planification est désactivée après son exécution et conservée avec son résultat.

---

## Comment une planification s'exécute

Quand une planification arrive à échéance, elle est mise en file d'attente, et le serveur démarre les planifications en attente une par une, en vérifiant la file toutes les 10 secondes.

- Les planifications **récurrentes** sautent une exécution tant que l'exécution précédente est encore en attente ou en cours : les exécutions ne se chevauchent jamais.
- Les planifications **uniques** s'exécutent dans la minute qui suit leur moment, puis sont supprimées (ou conservées, désactivées, quand **Supprimer après
  exécution** est désactivé), y compris quand elles sont démarrées avec **Exécuter maintenant**.
- Le **Statut** est `success` quand le job a été démarré et `failed` quand il n'a pas pu l'être. Un `success` indique seulement que le job a été
  lancé : ouvrez le job pour voir comment il s'est terminé.

Une planification créée avec `allowScheduledJobs` s'exécute en tant qu'utilisateur intégré `Schedule Service` (type `schedule`) avec le
rôle `admin`. Elle peut exécuter n'importe quel formulaire, quel que soit l'accès de la personne qui a créé la planification, et `ansibleforms_user` dans
ses extravars décrit cet utilisateur. Une [exécution planifiée](#planned-runs) s'exécute plutôt en tant qu'utilisateur qui l'a planifiée.

Le job reçoit aussi un objet `schedule`, pour qu'un playbook sache qu'une planification l'a démarré :

```yaml
schedule:
  id: 3
  name: Nightly cleanup
  description: ''
  form: Cleanup servers
  one_time_run: null
```

Son `one_time_run` est le moment de l'exécution d'une planification unique, `null` pour une planification récurrente. Il porte aussi les autres réglages
de la planification, comme `enabled` et `repository`, et `run_at` : le même moment sous son nom d'avant la 7.8.0 (déprécié, supprimé dans la 8).

---

## Exécutions planifiées

**Exécuter plus tard (une seule fois)** par un utilisateur sans `allowScheduledJobs` crée une exécution planifiée : une planification unique liée à cet utilisateur.

- **Lors de la planification**, le serveur vérifie que l'utilisateur peut exécuter le formulaire (ses `roles`), et le mode verbeux nécessite
  `allowVerboseMode`. Une exécution planifiée est toujours unique ; une expression cron ou une rrule est refusée.
- **Avec la validation au lancement `enforce`**, les valeurs des champs sont vérifiées lors de la planification : une exécution qui serait refusée est
  refusée pendant que l'utilisateur est encore là.
- **Lors de l'exécution**, le job s'exécute en tant que cet utilisateur, lui appartient, et passe par les mêmes vérifications qu'un lancement depuis le navigateur : les
  rôles du formulaire tels qu'ils sont alors, les extravars réservées retirées, et la validation au lancement. `ansibleforms_user` le décrit.

Celui qui planifie ne voit pas **Jobs > Planifiés**, qui nécessite `allowScheduledJobs` ; le job apparaît dans son propre historique de jobs. Une
exécution planifiée est toujours supprimée après son exécution.

---

## Quand le formulaire change

Une planification fait référence à son formulaire par son nom et l'exécute tel qu'il est défini au moment de chaque exécution.

- **Le formulaire est modifié** : l'exécution suivante utilise la nouvelle définition (playbook, template, inventaire) avec les extravars stockées dans
  la planification. Le formulaire n'est pas rendu, donc aucun champ n'est recalculé ; modifiez les extra vars de la planification pour qu'elles correspondent.
- **Le formulaire est renommé ou supprimé** : l'exécution échoue, le **Statut** devient `failed` et **Dernier lancement**, au survol, indique
  `Failed to launch : No such form '<name>'`. Modifiez la planification et choisissez le bon formulaire, ou supprimez-la.

---

## Les jobs planifiés dans l'historique des jobs

Chaque exécution d'une planification crée un job ordinaire, listé sur la page [Jobs](./) avec `Schedule Service` comme utilisateur ou,
pour une exécution planifiée, avec l'utilisateur qui l'a planifiée.

Un job `Schedule Service` n'appartient pas à la personne qui a créé la planification : il n'est donc visible que des admins et des
utilisateurs disposant de `showAllJobLogs` ; le job d'une exécution planifiée est aussi visible de son utilisateur. L'onglet **Exécutions** de la
planification liste les jobs qu'elle a démarrés, et son **Job lancé** pointe vers le dernier.

---

## Planifications dans un dépôt git

Depuis la 7.8.0, les planifications peuvent aussi être conservées dans un dépôt git, comme entrées d'une liste `controller_schedules:` dans ses fichiers YAML.

Un dépôt au plus a l'usage **Planifications** : ses entrées sont lues dans **Jobs > Planifiés** à chaque pull, planifiées par un
`cron`, une `rrule` ou un `one_time_run`, et une planification créée ou modifiée dans l'application est réécrite dans son fichier, en attente du
push du dépôt. Une telle planification affiche son fichier sur sa page, et sa fin ne fait jamais que la désactiver. Voir
[Dépôts git](../repositories/).

---

## Dans l'API

Depuis la 7.8.0, une planification de l'API a trois champs de planification, dont exactement un est défini : `cron`, `rrule` ou `one_time_run`.

| Champ | Contient |
|---|---|
| `cron` | Une expression cron |
| `rrule` | Une règle de récurrence, sur une ligne |
| `one_time_run` | Le moment de son unique exécution, une heure ISO 8601 avec son décalage ou `Z` (`2026-11-15T22:00:00+01:00`) |
| `ends`, `end_at`, `end_count`, `end_action` | Sa fin : `never`, `date` ou `count`, sa date, son nombre d'exécutions, et `disable` ou `remove` |
| `remove_after_run` | Une planification unique : `false` la conserve, désactivée, après son exécution |

{: .warning }
> La paire que l'API acceptait avant la 7.8.0, `one_time_run: true` avec `run_at`, est dépréciée depuis la 7.8.0 et supprimée dans la 8. Elle est
> toujours lue comme `one_time_run` à ce moment-là, avec un avertissement dans le journal du serveur ; `one_time_run: false` avec un cron est lu comme
> ce cron.

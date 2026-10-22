---
layout: default
title: Actions sur les jobs
parent: Jobs
nav_order: 3
translated_from: 6014f8e14db84fca0d144f1d64232e50aa6cbec9
---

# Actions sur les jobs
{: .no_toc }

Lancer, arrêter, relancer, approuver ou rejeter, et supprimer un job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Lancer un job

Chaque job part d'un formulaire. Ouvrez-le depuis la page **Formulaires**, remplissez les champs et cliquez sur **Soumettre** :

1. Le formulaire est validé dans le navigateur, et les valeurs des champs sont envoyées au serveur.
2. Le serveur crée le job et renvoie son numéro ; les actions [`onSubmit`](../forms/job-status-action.html) du formulaire s'exécutent.
3. La sortie du job apparaît sous le formulaire et se rafraîchit toutes les deux secondes jusqu'à la fin du job.

Le job apparaît aussi sur la page **Jobs**, où vous pouvez le suivre plus tard.

### Qui peut lancer un formulaire

Un formulaire est listé, et peut être lancé, pour les utilisateurs qui ont l'un des [rôles](../config/roles.html) de sa liste `roles`.
Le rôle `default`, que tout utilisateur possède, rend un formulaire accessible à tous ceux qui peuvent se connecter.

### Avant de soumettre

La barre au-dessus des champs propose quelques outils, chacun affiché uniquement si votre rôle le permet :

| Bouton | Ce qu'il fait | Option de rôle |
|---|---|---|
| **Afficher les variables supplémentaires** | Affiche un aperçu des extravars que recevra le job, au fur et à mesure que vous remplissez les champs | `showExtraVars` |
| **Verbeux** | Exécute le job en mode verbeux | `allowVerboseMode` |
| **Charger depuis le stockage** | Remplit les champs à partir d'un [job enregistré](stored-jobs.html) | `allowStoredJobs` |
| **Recharger ce formulaire** | Recharge le formulaire, avec ses valeurs par défaut | aucune |

### Choix au moment du lancement

Un formulaire peut laisser ses utilisateurs choisir certaines options Ansible au lancement, en déclarant un champ avec un nom réservé. La
valeur du champ remplace alors le réglage propre au formulaire :

| Nom du champ | Remplace | Type de champ habituel |
|---|---|---|
| `__check__` | Le mode check, une exécution à blanc qui ne change rien | `checkbox` |
| `__diff__` | Le mode diff, qui montre ce qui changerait | `checkbox` |
| `__limit__` | Les hôtes sur lesquels le playbook s'exécute | `text` ou `enum` |
| `__tags__` | Les tags à exécuter | `text` ou `enum` |
| `__inventory__` | L'inventaire | `enum` |
| `__playbook__`, `__template__` | Le playbook, ou le template AWX / AAP | `enum` |

Par exemple, un formulaire qui propose une exécution à blanc et une limite d'hôtes :

```yaml
fields:
  - name: __check__
    type: checkbox
    label: Dry run (check mode)
  - name: __limit__
    type: text
    label: Limit to these hosts
```

Le serveur n'accepte ces noms que d'un formulaire qui les déclare comme champs : un lancement depuis l'API ne peut donc pas les ajouter de
lui-même. Les propriétés qu'ils remplacent sont décrites dans [Formulaires Ansible](../forms/ansible.html) et [Formulaires AWX](../forms/awx.html).

### Ce qui peut empêcher un lancement

Un lancement ne devient pas toujours immédiatement un job en cours :

* **Champs invalides** : le formulaire n'est pas soumis, et chaque champ qui échoue à sa validation en indique la raison.
* **Validation au lancement** : avec la [validation au lancement](../launch-validation/) réglée sur `enforce`, le serveur vérifie de nouveau les valeurs
  et refuse un lancement qui enfreint les règles du formulaire.
* **Approbation** : un formulaire avec un [point d'approbation](../forms/approval.html) crée le job, qui attend ensuite au statut
  `approve` ; voir [Approuver ou rejeter un job](#approve-or-reject-a-job).

Quand le job se termine, les [notifications](../forms/notifications.html) du formulaire envoient leurs mails et leurs messages sur les canaux, et ses actions
sur statut de job s'exécutent.

### Autres façons de démarrer un job

Un formulaire peut aussi démarrer un job sans que personne ne clique sur **Soumettre** :

| Démarré par | Comment | Page |
|---|---|---|
| Une exécution ultérieure ou une planification cron | **Exécuter plus tard (une seule fois)** ou **Planifier (récurrent)** à côté de **Soumettre** | [Planifications](schedules.html) |
| Un script ou un pipeline | `POST /api/v2/job` avec un jeton d'API | [Jobs de l'API REST](../api/jobs.html) |
| Un agent IA | L'outil `launch_job` du serveur MCP | [Outils MCP](../mcp/tools.html) |
| Une conversation | L'assistant de chat remplit le formulaire et le lance | [Assistant de chat](../chat/) |
| Un job précédent | **Relancer**, ci-dessous | [Relancer un job](#relaunch-a-job) |

---

## Arrêter un job

**Arrêter** dans le menu de la ligne (⋮) de la liste, ou **Arrêter le job** sur la page du job, arrête un job au statut `running`. Après votre confirmation,
AnsibleForms marque le job pour l'arrêt :

* **`ansible`** : le RTE arrête le processus du playbook (avec tous ses workers), et le job se termine en `aborted` avec
  `... was aborted by the operator`. Un job qui attend encore un RTE libre est arrêté avant de démarrer.
* **Un job de template** (AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins) : AnsibleForms demande au runner d'annuler ou d'arrêter
  le job, et le job se termine en `aborted`. Quand le runner refuse, la sortie affiche `Abort request denied`, suivi de
  `reverting abort request`, et le job continue de s'exécuter. Un build Jenkins encore en file d'attente en est retiré.
* **`workflow`** : les jobs des nœuds en cours sont arrêtés et plus rien ne démarre (voir
  [Exécuter un workflow](../workflows/running.html#abort)).
* **`multistep`** : les étapes qui n'ont pas encore démarré sont ignorées (`skipping: [Abort is requested]`), et le job principal
  se termine en `aborted`. Une étape déjà en cours est un job à part entière : ouvrez-la et arrêtez-la pour l'arrêter elle aussi.

Vous pouvez arrêter vos propres jobs ; un admin, ou depuis la 7.3.0 un utilisateur dont le rôle définit `manageAllJobs`, peut arrêter n'importe quel job. `showAllJobLogs` permet à un
utilisateur de voir les jobs des autres utilisateurs, pas de les arrêter.

---

## Relancer un job

**Relancer** dans le menu de la ligne (⋮) de la liste, ou **Relancer le job** sur la page du job, démarre un nouveau job à partir d'un job terminé. C'est proposé sur tout
job qui n'est ni `running` ni en attente d'approbation, aux utilisateurs dont le rôle définit l'option de rôle `allowJobRelaunch`.

La boîte de dialogue propose :

* **Relancer** : exécute de nouveau le job avec les valeurs avec lesquelles il s'est exécuté, comme nouveau job à votre nom.
* **Mode verbeux** : relance en mode verbeux ; affiché avec l'option de rôle `allowVerboseMode`.
* **Modifier les valeurs avant de relancer**, puis **Modifier et relancer** : ouvre le formulaire pré-rempli avec les valeurs du job, pour que vous
  puissiez les changer avant de soumettre.

Une relance exige aussi que le formulaire l'autorise (`allowRelaunch`, true par défaut) et que le job soit **le vôtre**, sauf
si vous êtes admin ou, depuis la 7.3.0, disposez de `manageAllJobs` ; `showAllJobLogs`, qui permettait de relancer n'importe quel job jusqu'à la 7.2, ne le permet plus. La façon dont une relance est vérifiée au regard des règles du formulaire, et pourquoi un formulaire avec un
champ mot de passe peut la refuser, est décrite dans [Relancer](../launch-validation/relaunching.html).

### Relancer avec des données pré-remplies

**Modifier et relancer** ouvre le formulaire avec le paramètre d'URL `prefillJobId`, que vous pouvez aussi utiliser dans un lien à vous :

```text
https://af.example.com/form?form=New%20Virtual%20Machine&prefillJobId=61
```

Le formulaire charge les valeurs de champ stockées avec le job `61` et affiche `Formulaire prérempli avec les données de la tâche précédente #61`.
Le soumettre démarre un nouveau job, vérifié comme tout autre lancement. Le pré-remplissage suit les mêmes règles qu'une relance :

* **Les champs mot de passe ne sont jamais stockés**, ils ne sont donc jamais pré-remplis : saisissez-les de nouveau. Les constantes ne sont pas stockées non plus.
* L'option de rôle `allowJobRelaunch` est requise, et le job doit être le vôtre (ou vous êtes admin ou disposez de `manageAllJobs`).
* Un formulaire avec `allowRelaunch: false` ne peut être ni relancé ni pré-rempli :

```yaml
- name: New Virtual Machine
  type: ansible
  playbook: create-vm.yaml
  allowRelaunch: false
```

Un job antérieur au stockage des valeurs de champ ne peut pas être pré-rempli, et le formulaire affiche plutôt une erreur :

```text
No saved form data found for job <id>. This job may have been created before the relaunch feature was enabled.
```

---

## Approuver ou rejeter un job

Un job avec un [point d'approbation](../forms/approval.html) s'arrête au statut `approve` et attend. Il est listé sur la page Jobs de
ses approbateurs, les utilisateurs qui ont l'un des rôles de l'approbation, pour qu'ils puissent le trouver ; depuis la 7.3.0, les autres utilisateurs ne le voient plus.

**Examiner l'approbation** est proposé aux admins et aux utilisateurs qui ont l'un des rôles de l'approbation : un clic sur la ligne du job,
**Examiner l'approbation** dans le menu de la ligne, ou le bouton **Examiner l'approbation** sur la page du job. La boîte de dialogue affiche le
message de l'approbation, avec les valeurs du job insérées (ou une ligne générique s'il n'y en a pas), ainsi que le formulaire, l'id du job, qui l'a lancé et
quand, avec un lien vers le job ; **Rejeter** et **Approuver** y répondent :

* **Approuver** : le job continue et son statut repasse à `running`.
* **Rejeter** : le job se termine en `rejected`, et sa sortie enregistre `rejected by <username>`.

Un job en attente d'approbation ne peut être ni relancé ni supprimé depuis la page Jobs ; approuvez-le ou rejetez-le d'abord.

Depuis la 7.3.0, l'utilisateur qui a lancé un job ne peut pas l'approuver : une deuxième personne l'examine donc toujours, mais il peut toujours le rejeter pour
le retirer. Un admin peut toujours approuver, y compris ses propres jobs. Un formulaire dont le point d'approbation définit
[`allowSelf: true`](../forms/approval.html#approving-your-own-job) permet aussi à celui qui l'a lancé d'approuver son propre job.

---

## Supprimer un job

**Supprimer** dans le menu de la ligne (⋮) de la liste, ou **Supprimer le job** sur la page du job, supprime un job avec sa sortie après votre confirmation.
Supprimer un job multistep supprime aussi ses étapes. Pour supprimer plusieurs jobs à la fois, cochez-les dans la première colonne de la liste et
cliquez sur **Supprimer (n)** au-dessus.

Vous pouvez supprimer vos propres jobs. Les admins et, depuis la 7.3.0, les utilisateurs disposant de l'option de rôle `manageAllJobs` peuvent supprimer n'importe quel job ; `showAllJobLogs`
ne le permet plus. Un rôle qui définit `allowJobDeletion: false` ne supprime aucun job, pas même les siens : l'historique des jobs reste ainsi complet. Sur la page du
job, le bouton est masqué pendant que le job est en cours ou en cours d'arrêt (sauf pour les admins et `manageAllJobs`) et pendant qu'il attend une approbation ; dans la liste, l'entrée
du menu et la case à cocher sont grisées pour un job que vous ne pouvez pas supprimer.

---
layout: default
title: Outils
parent: Serveur MCP
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Outils
{: .no_toc }

Les outils qu'un agent utilise pour remplir, approuver et relancer des formulaires
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le serveur MCP propose jusqu'à 15 outils. Six sont proposés à tous les utilisateurs ; les autres suivent les options de rôle de l'utilisateur, si bien qu'un utilisateur
sans une option ne se voit pas du tout proposer ses outils :

| Outil | Ce qu'il fait | Proposé avec |
|---|---|---|
| `list_forms` | Les formulaires que l'utilisateur peut utiliser : nom, description, catégories, et `enableForChat` (si l'assistant de chat le propose). | toujours |
| `get_form` | La définition complète d'un formulaire. Chaque champ porte aussi `dynamic` (évalué à partir d'une expression ou d'une requête) et `dependsOn` (les champs qu'il lit). | toujours |
| `resolve_field` | Évalue le formulaire pour les valeurs remplies jusqu'ici. Voir plus bas. | toujours |
| `launch_job` | Lance le formulaire avec les valeurs données, exactement comme le ferait une soumission depuis le navigateur. Renvoie l'id du job. | toujours |
| `relaunch_job` | Relance un job avec certains champs modifiés. Voir plus bas. | toujours |
| `get_job` | Le statut et la sortie d'un job (`tail` limite la sortie aux dernières lignes). | toujours |
| `plan_job` | Exécute le formulaire une fois, plus tard, en tant que l'utilisateur : ce que fait **Exécuter plus tard (une seule fois)** sur le formulaire. | `allowPlannedJobs` |
| `create_schedule` | Crée une planification, récurrente (`cron`) ou unique (`run_at`), comme sur la page **Planifications**. | `allowScheduledJobs` |
| `list_schedules` | Les planifications que l'utilisateur peut voir : toutes avec `allowScheduledJobs`, sinon les exécutions qu'il a planifiées. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `get_schedule` | Une planification, avec ses variables supplémentaires (celles qui ressemblent à des secrets étant masquées) et la sortie de sa dernière exécution. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `delete_schedule` | Annule une exécution planifiée ou supprime une planification que l'utilisateur peut voir. | `allowPlannedJobs` ou `allowScheduledJobs` |
| `list_stored_jobs` | Les [jobs enregistrés](../jobs/stored-jobs.html) que l'utilisateur peut voir, sans leurs valeurs. | `allowStoredJobs` |
| `get_stored_job` | Un job enregistré avec ses valeurs, par `id`, ou par `form` et `name` parmi ceux de l'utilisateur. | `allowStoredJobs` |
| `store_job` | Enregistre les valeurs d'un formulaire sous un nom, comme le fait **Enregistrer** sur le formulaire. | `allowStoredJobs` |
| `delete_stored_job` | Supprime un job enregistré que l'utilisateur peut voir. | `allowStoredJobs` |

`launch_job`, `relaunch_job` et `plan_job` acceptent `verbose: true` pour exécuter le job en mode verbeux, ce qui nécessite l'option de rôle
`allowVerboseMode`. Avec [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do), les outils qui lancent, planifient ou
modifient (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` et `delete_stored_job`)
ne sont pas proposés.

Il n'existe aucun outil pour exécuter une expression, une requête, un playbook ou des extravars arbitraires. Les expressions
et les requêtes ne s'exécutent jamais que telles que le formulaire les définit.

L'[assistant de chat](../chat) utilise aussi ces outils, avec un bouton **Lancer** à la place de `launch_job`.

---

## Remplir un formulaire

Appelez `resolve_field` avec le nom du formulaire et les valeurs dont vous disposez, puis à nouveau après chaque réponse. Il parcourt
les champs dans l'ordre de leurs dépendances et indique pour chacun :

- `status` : `resolved`, `waiting` (avec `waitingFor`), `hidden`, ou `error` (le champ revient à sa valeur par défaut) ;
- `value`, `default` et, pour les champs à choix, `options` (au plus `maxOptions`, 200 par défaut) ;
- `needsInput` : un champ obligatoire sans valeur, ou un choix encore sur `__auto__` ;
- `validationErrors` : les règles que la valeur enfreint, sous la forme `[{type, description}]`, avec le message du navigateur.

Pour l'ensemble du formulaire, `missing` et `invalid` listent ce qui reste à corriger ; `launch_job` le refuse tant que `complete` ne vaut pas true.

La validation est le code même du navigateur, partagé avec la [validation au lancement](../launch-validation). Les champs masqués ne sont pas
validés, et un champ facultatif vide est valide.

---

## Planifications et exécutions planifiées

`plan_job` accepte les mêmes `form`, `values` et `expectedPayloadHash` que `launch_job`, avec un `name` pour l'exécution et `run_at`, une
heure ISO 8601 avec son décalage ou `Z` (`2026-10-15T22:00:00+02:00`) ; une heure sans fuseau est refusée. Les valeurs sont résolues
et validées immédiatement, et vérifiées à nouveau au déclenchement de l'exécution, comme pour une [exécution planifiée](../jobs/schedules.html#planned-runs) dans le
navigateur. La réponse donne l'heure d'exécution en UTC et selon l'horloge de l'application.

`create_schedule` accepte un `form`, un `name`, soit `cron` (cinq champs, comme `0 22 * * 1-5`) soit `run_at`, et les
`extraVars` que reçoit le job. Une telle planification s'exécute en tant que `Schedule Service`, sans la validation du formulaire ; pour exécuter un formulaire une fois en tant
que l'utilisateur, utilisez `plan_job`. Les noms de planification sont uniques.

---

## Jobs enregistrés

Un job enregistré est l'ensemble des valeurs d'un formulaire enregistré sous un nom ; les outils travaillent sur les mêmes jobs enregistrés que le navigateur.

`list_stored_jobs` liste les jobs enregistrés de l'utilisateur, ou ceux de tout le monde pour un utilisateur avec `showSettings`, avec leur nom, leur description,
leur formulaire, leur création et leur expiration. Un job marqué `usable` (appartenant à l'utilisateur, d'un formulaire qu'il peut lancer) peut être passé comme `storedJob`
(`{ "id": 7 }`, ou `{ "name": "..." }` parmi ceux de l'utilisateur pour ce formulaire) à `resolve_field`, `launch_job` ou `plan_job` : ses
valeurs servent de point de départ et `values` s'y superposent. Les champs mot de passe ne sont pas enregistrés, fournissez-les donc dans `values`.
`launch_job` et `plan_job` à partir d'un job enregistré ont besoin du `expectedPayloadHash` que `resolve_field` a renvoyé pour lui, et
`resolve_field` refuse `storedJob` combiné à `subform`.

`store_job` accepte le `form`, un `name` unique parmi les jobs enregistrés de l'utilisateur pour ce formulaire, les `values`, et éventuellement une
`description` et un `expires_at` (ISO 8601 avec son décalage ou `Z`). Sa réponse indique quels champs mot de passe ont été laissés de côté.

---

## Transmettre des valeurs

Passez `field` pour ne résoudre que ce champ et ce dont il dépend. Pour une ligne de liste ou une étape d'assistant, passez `subform` (et
éventuellement `parent`, les valeurs du formulaire parent).

Envoyez les valeurs telles que le navigateur les détient. Un champ à choix accepte aussi un enregistrement partiel ou sa valeur `valueColumn`
(`"vol1"`), et un tableau quand il est `multiple`. Les champs calculés ignorent les valeurs envoyées, sauf s'ils sont `editable`.

---

## Approuver le contenu exact

Quand le formulaire est complet, `resolve_field` renvoie aussi ce que `launch_job` va soumettre :

- `modeledExtravars` : les extravars après application de `model`, `valueColumn` et `output`,
  avec les champs mot de passe masqués ;
- `credentials` : les identifiants AnsibleForms qu'utilisera le job (des noms, pas des secrets) ;
- `payloadHash` : un hash SHA-256 du nom du formulaire, des vraies extravars et des identifiants.

Montrez `modeledExtravars` à l'opérateur, et passez le `payloadHash` qu'il a approuvé à
`launch_job` comme `expectedPayloadHash`. Le lancement résout à nouveau le formulaire et est refusé
quand le contenu diffère, par exemple parce qu'une requête répond désormais autrement.
`ansibleforms_user`, `__jobid__` et `__verbose__` sont ajoutés au lancement et ne font pas partie du hash.

`launch_job` ne vérifie que le contenu. Une modification du formulaire qui laisse le contenu identique ne fait pas refuser le lancement.
Chaque réponse de `resolve_field` porte aussi un `formFingerprint`, un hash SHA-256 de la définition du formulaire : pour refuser un
lancement après toute modification du formulaire, comparez-le vous-même avant d'appeler `launch_job`, comme le fait le bouton
**Lancer** de l'assistant de chat.

---

## Relancer avec des changements

`relaunch_job` accepte un `id` de job et des `values` : seulement les champs à changer, en valeurs brutes.
`values` se superpose aux valeurs avec lesquelles le job a été lancé à l'origine, et le résultat est
résolu et validé exactement comme par `launch_job`, lignes de liste comprises, puis lancé comme un
nouveau job par vous (`ansibleforms_user`, c'est vous, pas l'auteur d'origine). Les fichiers téléversés
du job d'origine sont réutilisés.

Sans `values`, c'est une relance **telle que le job s'est exécuté** : ses extravars stockées sont rejouées sur
le serveur, mots de passe compris (l'aperçu les masque). Si le formulaire est soumis à la validation au lancement
`enforce`, la relance passe toutefois par la même vérification qu'une relance avec
changements.

**Les mots de passe ne sont jamais stockés avec les valeurs des champs**, une relance qui passe par la
vérification est donc refusée quand le formulaire affiche un champ mot de passe, au niveau supérieur ou dans une ligne de liste
(`unsupported`, avec les `passwordFields`). Un champ mot de passe masqué par ses dépendances ne
bloque pas la relance. Voir [Validation au lancement](../launch-validation).

Appelez-le d'abord avec `preview: true` : il renvoie `modeledExtravars` (mots de passe masqués),
`credentials` et un `payloadHash` sans lancer. Faites-les confirmer par l'utilisateur, puis appelez-le
à nouveau avec `expectedPayloadHash`. Les mêmes permissions que pour une relance dans le navigateur
s'appliquent : le formulaire doit autoriser la relance et vos rôles ont besoin de l'option `allowJobRelaunch`. Un
job sans données de formulaire stockées (lancé avant que la relance n'existe) et un formulaire assistant ne peuvent pas être
relancés avec des changements.

L'API REST propose la même chose via `POST /api/v2/job/{id}/relaunch` avec le corps
`{ "values": { ... } }` ; sans corps, elle rejoue le job tel qu'il s'est exécuté.

---

## Erreurs

Un appel refusé est une erreur d'outil dont le contenu structuré porte un `code` et les détails :

| Code | Quand |
|---|---|
| `form_incomplete` | `launch_job` ou `relaunch_job` sur un formulaire incomplet, avec `missing`, `invalid`, `waiting`, `validationErrors` et `rowErrors` |
| `payload_mismatch` | le contenu diffère de `expectedPayloadHash`, avec les deux hashs |
| `access_denied` | les rôles de l'utilisateur n'accordent pas le formulaire, le job, la planification ou le job enregistré, ou le mode verbeux, ou le serveur est en lecture seule |
| `not_found` | aucun formulaire, sous-formulaire ou job de ce nom |
| `unsupported` | un formulaire assistant, un sous-formulaire seul, un champ fichier, ou un `relaunch_job` qui nécessiterait un champ mot de passe affiché |
| `no_form_data` | `relaunch_job` avec changements pour un job qui n'a stocké aucune valeur de formulaire, comme un job lancé par une planification ; relancez-le plutôt sans changements |
| `invalid_request` | une requête que le serveur refuse comme mal formée |
| `internal_error` | tout le reste |

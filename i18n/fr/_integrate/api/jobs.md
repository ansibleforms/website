---
layout: default
title: Jobs
parent: API REST
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Jobs
{: .no_toc }

Lancer un formulaire, suivre le job, l'interrompre, le relancer ou l'approuver
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un job est une exécution d'un formulaire. Lancez-le avec le nom et les valeurs du formulaire, puis suivez-le par son ID.

---

## Lancer un formulaire

Envoyez le nom du formulaire et ses valeurs à `POST /api/v2/job` :

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

La requête accepte ces propriétés :

| Propriété | Signification |
|---|---|
| `formName` | Le nom du formulaire à lancer. Obligatoire. |
| `extravars` | Les variables supplémentaires du job. `payload` est accepté comme autre nom. |
| `rawFormData` | Les valeurs des champs du formulaire, telles que le navigateur les détient. La [validation au lancement](../launch-validation/) les vérifie, et construit les extravars à partir d'elles. |
| `credentials` | Les identifiants à transmettre au job, par nom. |
| `files` | Les fichiers téléversés des champs fichier du formulaire (voir [Téléversement de fichiers](../launch-validation/file-uploads.html)). |

La réponse contient l'ID du nouveau job :

```json
{ "id": 42 }
```

Pour exécuter le job en mode verbeux, ajoutez `"__verbose__": true` aux extravars. Il faut l'option de rôle `allowVerboseMode`,
sinon le lancement répond `403`.

---

## Téléverser un fichier

Un formulaire avec un champ fichier a besoin que le fichier soit d'abord téléversé. Envoyez-le comme partie multipart `file` à `POST /api/v2/job/upload` :

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

La réponse décrit le fichier stocké :

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Transmettez-la telle quelle dans les `files` du lancement, sous le nom du champ fichier : `"files": { "firmware": { ... } }`. Le serveur
la vérifie par rapport à son propre disque (voir [Téléversement de fichiers](../launch-validation/file-uploads.html)).

---

## Suivre le job

Lisez le job par son ID :

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

Le job contient son `status`, ses `extravars` (aussi sous `payload`, le même objet), ses `subjobs` et son `output`. La
sortie est du HTML avec les couleurs de la page du job ; ajoutez `?text=true` pour du texte brut, qui convient à un script ou à un journal :

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Son `status` vaut `running` pendant son exécution, et `approve` pendant qu'il attend une approbation. Un job se termine avec l'un de ces statuts :

| Statut | Signification |
|---|---|
| `success` | Le job s'est terminé sans erreur |
| `failed` | Le job a échoué |
| `warning` | Un job multi-étapes s'est terminé, mais une étape qui a `continue` défini a échoué en cours de route |
| `aborted` | Le job a été interrompu |
| `rejected` | L'approbation a été refusée, ce qui l'attendait ne s'est donc pas exécuté |
| `abandoned` | Le processus qui suivait le job s'est arrêté (un redémarrage, un conteneur remplacé) et le job a été abandonné |

Un job qui tournait sur un runner au moment où il a été abandonné peut encore se terminer avec son vrai résultat, si ce runner finit par le mener à bien.

---

## Trouver des jobs

`GET /api/v2/job` liste les jobs les plus récents en premier, sous la forme `{ "count": ..., "records": [ ... ] }`. Ces paramètres de requête affinent la liste :

| Paramètre | Signification |
|---|---|
| `records` | Le nombre maximal de jobs. La valeur par défaut est [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), et 5000 au maximum sauf si `JOBS_LIST_SIZE` est plus élevé. |
| `user`, `user_type` | Seulement les jobs de cet utilisateur. `user_type` vaut `local` quand il est omis (`ldap`, `azuread`, `oidc` pour les autres). |
| `runner` | Seulement les jobs exécutés sur ce runner |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Un utilisateur voit ses propres jobs et les jobs qui attendent une approbation que l'un de ses rôles peut donner. Un admin, ou un rôle avec l'option
`showAllJobLogs` ou `manageAllJobs`, voit tous les jobs. Un enregistrement contient le résumé du job (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...) ; lisez
le job lui-même pour ses extravars et sa sortie.

`GET /api/v2/job/approvals` répond par un nombre : combien de jobs attendent une approbation que l'utilisateur peut donner.

---

## Plus d'informations sur un job

Ces endpoints lisent davantage d'informations sur un job :

| Appel | Ce qu'il renvoie |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Les valeurs des champs avec lesquelles le job a été lancé, telles que le formulaire les détenait. Les mêmes permissions que pour une relance s'appliquent : votre propre job (ou tous les jobs pour un admin ou un rôle avec `manageAllJobs`), un formulaire qui autorise la relance, et l'option de rôle `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Les événements structurés d'un job de playbook (depuis la 7.3.0, pour un playbook sur un RTE 7.3.0 ou ultérieur) : chaque play, tâche, résultat d'hôte et le récapitulatif, avec leurs `order`, `type`, `play`, `task`, `host`, `duration` et `time` |
| `GET /api/v2/job/{id}/events/{order}` | L'un de ces événements avec son `result` complet, tel que l'affiche la boîte de dialogue **Résultat de la tâche** ; `400` quand `order` n'est pas un nombre entier, `404` quand le job n'a pas cet événement |
| `GET /api/v2/job/{id}/node/{nodeId}` | Un nœud d'un job de workflow : `{ "node", "job", "extravars", "artifacts" }`, où `job` est l'ID du job propre au nœud, ou `null` quand le nœud ne s'est pas exécuté. |

---

## Autres actions

Ces endpoints agissent sur un job existant :

| Appel | Action |
|---|---|
| `POST /api/v2/job/{id}/abort` | Interrompre un job en cours |
| `POST /api/v2/job/{id}/relaunch` | Relancer un job, tel qu'il s'est exécuté ou avec des changements (voir [Relancer](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Approuver un job qui attend une approbation ; votre propre job répond `403`, sauf si son approbation définit `allowSelf: true` ou si vous êtes admin |
| `POST /api/v2/job/{id}/reject` | Rejeter un job qui attend une approbation |
| `GET /api/v2/job/{id}/download` | Télécharger la sortie du job |
| `DELETE /api/v2/job/{id}` | Supprimer un job |

L'interruption, l'approbation, le rejet et la suppression répondent par un message, et une relance aussi par l'ID du nouveau job :

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Ajoutez `?verbose=true` à une relance pour exécuter le nouveau job en mode verbeux, avec l'option de rôle `allowVerboseMode`. Un job qui
n'est pas dans le bon état pour l'action, par exemple l'interruption d'un job déjà terminé, répond `409`.

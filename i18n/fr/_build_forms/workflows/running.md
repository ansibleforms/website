---
layout: default
title: Exécuter un workflow
parent: Workflows
nav_order: 3
translated_from: 1883c268cde716170bdb84c7f2df49e9122dc55d
---

# Exécuter un workflow
{: .no_toc }

Lancer un workflow depuis un formulaire, et le suivre sur la page des jobs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le formulaire

Un formulaire de [type `workflow`](../forms/workflow.html) lance un workflow, désigné avec `workflow:` comme on désigne un playbook : par
son **fichier** dans le dossier des workflows, avec ses sous-dossiers (`team/deploy-app.yml`), ou par le **nom** du workflow dans
le fichier (`deploy-app`) :

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

Les champs du formulaire parviennent à chaque nœud comme extra vars, tout comme ses [`credentials`](../forms/workflow.html#workflow_credentials), sous les noms
que le formulaire leur donne, comme ceux d'un formulaire multistep parviennent à ses étapes :

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Les identifiants propres à un nœud, définis dans le fichier de workflow, parviennent à son playbook sous leur propre nom et l'emportent sur un nom utilisé des deux côtés. Dans l'onglet Visuel du concepteur pour un formulaire, **Workflow** est une liste des
fichiers de workflow du concepteur.

Un nom de fichier seul est trouvé aussi dans un sous-dossier, quand un seul fichier porte ce nom. Deux workflows du même nom bloquent un formulaire qui le
désigne par son nom, et le concepteur vous avertit quand vous enregistrez le second : renommez-en un, ou désignez son fichier. Un workflow introuvable
termine le job en échec, avec la raison dans sa sortie.

---

## Le job

Un job de workflow s'exécute sur le serveur AnsibleForms, et chaque nœud playbook s'exécute comme un job à part entière, enfant du job de
workflow comme le sont les étapes d'un formulaire multistep : un playbook du concepteur sur le RTE ou, pour un nœud avec un `runner:`, le
template ou le job de ce runner sur AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins (voir [Où un nœud s'exécute](designer.html#where-a-node-runs)).

La page du job dessine le workflow en direct : chaque nœud coloré selon son statut, les liens qui se sont déclenchés, et les nœuds qui ne
s'exécuteront pas. Les informations en haut nomment le workflow à la place d'un playbook.

- **Cliquez sur un nœud** terminé pour ouvrir sa sortie dans une boîte de dialogue.
- **La sortie** contient la sortie de chaque nœud sous une bannière `WORKFLOW NODE [identifier] (status)`, dans l'ordre où les nœuds
  se sont terminés.
- **Afficher les variables supplémentaires** et **Afficher les artefacts**, sur l'en-tête de chaque nœud dans la sortie et dans la boîte de dialogue ouverte depuis le graphe,
  montrent les extravars et les artefacts propres à ce nœud (`{}` quand il n'en a pas), en JSON ou en YAML, avec un bouton Copier.

Les extravars d'un nœud contiennent ce que les nœuds précédents lui ont transmis, et ses artefacts ce que son playbook a rassemblé avec
`set_stats`. Les deux boutons suivent les [options de rôle](../config/roles.html#role-options) `showExtravars` et
`showArtifacts`. Les mêmes données sont disponibles via `GET /api/v2/job/{id}/node/{nodeId}`, pour quiconque peut voir le job.

Le job échoue quand un nœud a échoué et que rien ne l'a pris en charge, selon la règle d'AWX ; sinon il réussit.

---

## Approbations

Un nœud d'approbation retient le job de workflow jusqu'à ce que quelqu'un y réponde.

Quand le workflow atteint un nœud d'approbation, le statut du job passe à **En attente d'approbation** : il apparaît dans la cloche et sur la
page du job, comme le [point d'approbation](../forms/approval.html) d'un formulaire. Le nom du nœud est le titre de l'approbation et sa description
le message ; le reste provient de l'`approval` du formulaire :

- ses `roles` décident qui peut l'approuver ou la rejeter, et `allowSelf` si celui qui a lancé le job peut aussi l'approuver ;
- ses `notifications` et ses `channels` reçoivent la demande.

Un formulaire workflow sans `approval` retient tout de même le job à un nœud d'approbation, mais seul un admin peut alors l'approuver.

- **Approuvée**, le nœud réussit et le workflow continue le long de ses liens *en cas de succès*.
- **Rejetée**, le nœud échoue et le workflow continue le long de ses liens *en cas d'échec*.
- **Expirée**, après le délai du nœud sans réponse, le nœud échoue aussi.

---

## Arrêt

**Arrêter** sur un job de workflow en cours l'arrête : les jobs des nœuds en cours sont interrompus, plus rien ne démarre, et une approbation qu'il
attend est annulée. Un job de workflow qui attend une approbation peut lui aussi être arrêté.

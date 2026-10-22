---
layout: default
title: Statuts et types
parent: Jobs
nav_order: 1
translated_from: 5974310f0d30079e77ad45698ed2afb70e68ce1e
---

# Statuts et types
{: .no_toc }

Chaque statut qu'un job peut avoir, et les types de job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Statuts des jobs

AnsibleForms attribue les statuts suivants à un job. La liste affiche chaque statut sous forme de pastille colorée :

| Statut | Signification | Ce que vous pouvez faire |
|---|---|---|
| `running` | Le job est en cours, ou un job approuvé a repris | Suivre sa sortie, l'arrêter |
| `approve` | Le job attend à un [point d'approbation](../forms/approval.html) avant de s'exécuter (ou avant qu'une étape d'un multistep s'exécute) | L'approuver ou le rejeter, si l'un de vos rôles est approbateur |
| `success` | Le playbook, le template ou chacune des étapes s'est terminé sans erreur | Voir la sortie, relancer, supprimer |
| `failed` | Le job s'est terminé par une erreur, ou le lancement lui-même a échoué | Voir la sortie pour en comprendre la raison, relancer, supprimer |
| `warning` | Un multistep s'est terminé, mais une étape définie avec `continue` a échoué | Voir la sortie, relancer, supprimer |
| `aborted` | Le job a été arrêté depuis AnsibleForms, ou le job AWX / AAP a été annulé | Voir la sortie, relancer, supprimer |
| `rejected` | Un approbateur a rejeté le job ; il ne s'est jamais exécuté | Voir la sortie, relancer, supprimer |
| `abandoned` | AnsibleForms a cessé de suivre le job (voir [Jobs abandonnés](cleanup.html#abandoned-jobs)) | Vérifier les hôtes gérés, relancer, supprimer |

`running` est bleu, `success` vert et s'affiche **Réussi**, et `failed` rouge. `approve` est orange et s'affiche **En attente d'approbation** :
un job qui attend une personne se distingue ainsi des jobs arrêtés ; `warning`, `aborted` et `rejected` sont ambre. `abandoned` est
gris : personne ne l'a arrêté, ce qui l'exécutait a disparu.

---

## Types de job

Le type de job suit le `type` du formulaire qui a démarré le job, tel que la liste et la page du job l'affichent :

| Type affiché | Ce qui s'exécute |
|---|---|
| `ansible` | Un playbook Ansible, exécuté sur un RTE |
| `awx`, `aap`, `ascender` | Un job template ou un workflow template sur AWX, AAP ou Ascender |
| `semaphore` | Un template sur Semaphore UI |
| `rundeck`, `jenkins` | Un job sur Rundeck ou Jenkins |
| `workflow` | Un [workflow](../workflows/), dont les nœuds playbook s'exécutent comme des jobs à part entière sous lui |
| `multistep` | Obsolète, utilisez `workflow` : une suite d'étapes, chacune enregistrée comme un job à part entière sous le job principal |

Un job de template est stocké comme un job `awx` (dans l'API REST aussi) et affiché avec le type de runner sur lequel il s'est exécuté, quel que soit
le nom que le formulaire lui donne : un formulaire de type `awx` qui s'exécute sur un runner AAP affiche `aap`.

Voir [Formulaires Ansible](../forms/ansible.html), [Formulaires AWX](../forms/awx.html), [Formulaires workflow](../forms/workflow.html) et
[Formulaires multistep](../forms/multistep.html) pour le côté formulaire.

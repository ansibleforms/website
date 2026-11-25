---
layout: default
title: Statuts et types
parent: Jobs
nav_order: 1
translated_from: de3ae8ab9d1bd42e3d78336c40b963276b936ff4
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
| `warning` | Le playbook s'est terminé mais [requiert une attention](#a-job-that-needs-attention) : quelqu'un doit en assurer le suivi. Ou un multistep s'est terminé, mais une étape définie avec `continue` a échoué | Lire pourquoi sur la page du job, en assurer le suivi, relancer, supprimer |
| `aborted` | Le job a été arrêté depuis AnsibleForms, ou le job AWX / AAP a été annulé | Voir la sortie, relancer, supprimer |
| `rejected` | Un approbateur a rejeté le job ; il ne s'est jamais exécuté | Voir la sortie, relancer, supprimer |
| `abandoned` | AnsibleForms a cessé de suivre le job (voir [Jobs abandonnés](cleanup.html#abandoned-jobs)) | Vérifier les hôtes gérés, relancer, supprimer |

`running` est bleu, `success` vert et s'affiche **Réussi**, et `failed` rouge. `approve` est orange et s'affiche **En attente d'approbation** :
un job qui attend une personne se distingue ainsi des jobs arrêtés ; `warning` s'affiche **Requiert une attention**, et lui, `aborted` et `rejected` sont ambre. `abandoned` est
gris : personne ne l'a arrêté, ce qui l'exécutait a disparu.

---

## Un job qui requiert une attention

Depuis la 7.8.0, un playbook qui s'est terminé comme prévu, mais qui laisse du travail à un opérateur (une approbation ailleurs,
une étape manuelle, une application partielle), peut terminer son job en **Requiert une attention** (`warning`) avec un message, au
lieu d'un `failed` qui ressemble à une automatisation cassée ou d'un `success` qui cache ce qui reste à faire. Le playbook le signale
de l'une de deux façons :

* un **fichier de statut** à côté du playbook, `<playbook_dir>/.joblogs/job_status_<jobid>.yml` (ou `.yaml`), sur un RTE. Le RTE
  le lit dès que le playbook se termine, puis le supprime
* **`set_stats`** avec la clé `af_job_status`, sur un RTE et sur AWX, AAP ou Ascender

{% raw %}
```yaml
# .joblogs/job_status_{{ __jobid__ }}.yml
status: attention        # or warning ; success leaves the job a success
message: >               # required : one line
  Follow-up required: 3 items are waiting for operator approval.
detail:                  # optional : anything
  - id: 1
    action: create
    object: group-a
```

```yaml
- name: Ask for attention
  ansible.builtin.set_stats:
    data:
      af_job_status:
        status: attention
        message: "3 items wait for operator approval"
```
{% endraw %}

AnsibleForms passe `__jobid__` dans les extravars, pour que le playbook puisse construire le chemin du fichier. Le fichier
l'emporte quand un playbook fait les deux.

* Seul un playbook qui a **réussi** peut se terminer en Requiert une attention : un job échoué reste `failed` et un job annulé
  `aborted`, quoi que dise le fichier
* Un fichier non valide (pas de message, un autre statut, du YAML cassé) est ignoré : le job reste un succès, et sa sortie en
  donne la raison dans une ligne `[WARNING]`
* Le message s'affiche sur la page du job dans un encadré ambre, avec le détail replié en dessous en YAML, comme info-bulle du
  statut dans la liste, et dans la dernière ligne de sortie du job. **Requiert une attention** sous **Passé** dans le menu des jobs
  liste ces jobs
* Les [notifications](../forms/notifications.html) avec `onStatus: [warning]` sont envoyées pour ces jobs ; le mail et les canaux
  portent le message, un webhook sous la forme [{% raw %}`{{statusMessage}}`{% endraw %}](../notification-channels/webhook.html)
* Dans un multistep, une étape qui requiert une attention passe et l'étape suivante s'exécute ; le multistep requiert alors lui
  aussi une attention. Dans un [workflow](../workflows/), le job compte comme réussi pour le nœud suivant

Les jobs Semaphore, Rundeck et Jenkins ne peuvent pas se terminer en Requiert une attention.

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

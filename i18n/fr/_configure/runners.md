---
layout: default
title: Runners
nav_order: 12
has_children: true
has_toc: false
permalink: /runners.html
translated_from: e6663cf2e7dc14a1559383c7f49fd968a4cbf635
---

# Runners
{: .no_toc }

Où les jobs s'exécutent : des conteneurs d'environnement d'exécution pour les playbooks, et AWX, AAP, Ascender, Semaphore, Rundeck ou Jenkins pour les modèles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : ajoutez les runners sur lesquels s'exécutent vos jobs, choisissez celui par défaut de chaque type, approuvez les RTE qui demandent à rejoindre, testez-les.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [La page des runners](runners/list.html) | La liste des runners, l'ajout d'un runner, son activation ou sa désactivation, et le runner par défaut de chaque type |
| [Types de runners](runners/types.html) | Les produits que peut être un runner, leur adresse et leur accès |
| [Enregistrement](runners/registration.html) | Comment un RTE demande à rejoindre et est approuvé, les jetons d'adhésion pour les installations sans intervention, et le mode base de données |
| [La page d'un runner](runners/runner-page.html) | Les onglets d'un runner, le mode et la connexion d'un RTE, et Tester la connexion |
| [Qui gère les runners](runners/permissions.html) | Qui peut ajouter, modifier et tester des runners |


---

## Fonctionnement

Depuis la version 7, l'application n'exécute rien elle-même : chaque job s'exécute sur un **runner**, ajouté dans **Connexions > Runners**.
Le type d'un formulaire décide du type de runner dont il a besoin :

| Type de formulaire | S'exécute sur un runner de type | Ce qui s'exécute |
|---|---|---|
| `ansible` | RTE | Un playbook, dans un conteneur d'environnement d'exécution |
| `awx`, `aap`, `ascender` | AWX (les variantes AWX, AAP et Ascender) | Un modèle de job ou de workflow |
| `semaphore` | Semaphore | Un modèle Semaphore UI |
| `rundeck` | Rundeck | Un job Rundeck |
| `jenkins` | Jenkins | Un job Jenkins |

Un formulaire `workflow` ou `subform` n'a pas de runner propre : chaque nœud d'un [workflow](workflows/) choisit le sien. Un nœud
avec un `runner:` s'exécute sur ce runner (un RTE, ou un modèle ou un job sur AWX, Semaphore, Rundeck ou Jenkins), tout autre sur
le RTE par défaut, si bien que les nœuds d'un même job peuvent s'exécuter sur des runners différents. Le formulaire `multistep`, déprécié depuis la 7 et
remplacé par les workflows, fonctionne de la même façon : chacune de ses étapes s'exécute sur le runner dont son propre type a besoin.

Un formulaire choisit son runner de l'une de deux façons :

- **Par son nom** : `runner: <name>` sur le formulaire, sur un nœud de workflow, ou sur une étape d'un multistep déprécié (aussi dans les
  paramètres du formulaire du concepteur). Le runner doit être du type dont le formulaire a besoin, sinon le job échoue. L'ancien `awx: <name>`
  fonctionne toujours, journalise un avertissement de dépréciation, et disparaîtra dans la 8.
- **Par défaut** : un formulaire qui ne nomme aucun runner s'exécute sur le runner par défaut de son type. Sans lui, le job échoue
  avec un message qui indique quel type de runner ajouter.

Un runner désactivé dans **Connexions > Runners** ne reçoit aucun job, ni par son nom ni par défaut : le job échoue et indique de l'activer
ou de nommer un autre runner (voir [Par défaut et Activé](runners/list.html#default-and-enabled)).


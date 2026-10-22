---
layout: default
title: La page des runners
parent: Runners
nav_order: 1
translated_from: 622b7c995b553611b6b3eb2eb16d076f669f0476
---

# La page des runners
{: .no_toc }

La liste des runners, l'ajout d'un runner, son activation ou sa désactivation, et le runner par défaut de chaque type
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La liste

La page **Connexions > Runners** liste chaque runner avec ces colonnes :

| Colonne | Signification |
|---|---|
| Activé | S'il reçoit des jobs. Un runner désactivé ne reçoit aucun job, même comme runner par défaut de son type. |
| Nom | Comment les formulaires y font référence, avec `runner: <name>`. |
| Type | RTE, AWX, Ansible Automation Platform, Ascender, Semaphore UI, Rundeck ou Jenkins. Le runner par défaut de son type a une pastille **Par défaut** après lui. |
| Description | À quoi il sert. |

**Colonnes** en ajoute deux autres, masquées par défaut : **Mode**, le mode d'un RTE (Sortant, Entrant ou Base de données (obsolète), voir
[Modes](../rte/modes.html)), et **Connexion**, si un nœud d'application détient un socket vers un RTE en mode socket : **Connecté** ou
**Non connecté**.

Depuis la 7.3.0, les runners en attente d'approbation ne figurent pas dans la liste mais dans un avis au-dessus, voir [Approuver un RTE](registration.html#approving-an-rte).
**Ajouter un runner** ouvre une boîte de dialogue en étapes : **Runner** (nom et description), **Type** et **Identifiants**, avec une étape **Mode** après
**Type** pour un RTE (Sortant, la valeur par défaut pour un nouveau, Entrant ou Base de données (obsolète)) : quatre étapes pour un RTE, trois pour les
autres. Dans l'étape **Type**, chaque produit a une indication : celle du RTE donne son nom complet, *Environnement d'exécution*. Une ligne ouvre la page
du runner, et son menu propose :

| Action | Ce qu'elle fait |
|---|---|
| Modifier | Ouvre sa page |
| Tester la connexion | Vérifie qu'il répond et accepte son identifiant, voir [Tester la connexion](runner-page.html#test-connection) |
| Activer, Désactiver | L'active ou le désactive, selon son état |
| Modifier les identifiants | Ouvre l'onglet Identifiants de sa page |
| Supprimer | Le retire |

---

## Par défaut et Activé

Le runner par défaut de chaque type est celui où s'exécutent les formulaires de ce type quand ils ne nomment aucun runner :

| Par défaut pour | Où s'exécutent ces formulaires quand ils ne nomment aucun runner |
|---|---|
| Formulaires playbook | Les formulaires `ansible`, sur un RTE |
| Formulaires AWX, AAP et Ascender | Les formulaires `awx`, `aap` et `ascender`, sur un runner AWX |
| Formulaires Semaphore | Les formulaires `semaphore` |
| Formulaires Rundeck | Les formulaires `rundeck` |
| Formulaires Jenkins | Les formulaires `jenkins` |

Le premier runner d'un type devient celui par défaut, si bien qu'un seul runner par type ne nécessite aucune étape supplémentaire. Pour faire d'un autre runner celui par défaut,
activez l'interrupteur **Par défaut** sur sa page (voir [La page d'un runner](runner-page.html)).

Un runner désactivé reste listé avec ses paramètres, mais aucun job ne lui est envoyé, y compris comme runner par défaut de son type. Un job qui lui est destiné échoue avec
*Runner '&lt;name&gt;' is disabled - enable it under Connections > Runners, or name another runner on the form with runner: &lt;name&gt;*.
Activez-le ou désactivez-le avec **Activer** ou **Désactiver** dans le menu de sa ligne, ou avec l'interrupteur **Activé** sur sa page. Un nouveau runner est activé, et les
runners qui existaient avant la 7.3.0 sont activés après la mise à jour. Le [seed de configuration](../seed/example.html) peut en désactiver un avec
`enabled: false`.

---
layout: default
title: Workflows
nav_order: 5
has_children: true
has_toc: false
permalink: /workflows/
translated_from: e6133a683d5bc1d0ba822dd52b4fed99028ea63c
---

# Workflows
{: .no_toc }

Enchaîner des playbooks, des approbations et d'autres workflows, comme le fait AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les auteurs de formulaires : ce qu'est un workflow, comment ses nœuds s'exécutent, et où en lire davantage.

Un workflow est un graphe de nœuds. Chaque nœud exécute quelque chose : l'un des playbooks du concepteur, un autre workflow, une approbation,
ou un pull de dépôt. Les liens entre les nœuds indiquent ce qui s'exécute ensuite, en cas de succès, en cas d'échec ou toujours. Un formulaire de
[type `workflow`](../forms/workflow.html) le lance, et la page des jobs le dessine en direct pendant son exécution.

Les workflows suivent la syntaxe et les règles d'AWX : un workflow exporté d'AWX se lit donc de la même façon dans AnsibleForms. Ils s'exécutent sur
le RTE, sans AWX : un nœud playbook est un job à part entière, avec l'inventaire, les identifiants, la limite et les tags du nœud.

---

## Comment un workflow s'exécute

Les nœuds s'exécutent selon les règles d'AWX, et les branches qui ne dépendent pas les unes des autres s'exécutent en parallèle.

- **Un nœud sans parent démarre immédiatement**, au démarrage du workflow.
- **Un lien se déclenche quand son nœud est terminé** : un lien *en cas de succès* après un succès, un lien *en cas d'échec* après un échec,
  un lien *toujours* après l'un ou l'autre. Un nœud annulé ne déclenche aucun de ses liens.
- **Un nœud démarre dès qu'un lien qui y mène se déclenche.** Avec **Tous les parents doivent converger** activé, il attend que tous les liens
  qui y mènent se soient déclenchés.
- **Un nœud qui ne peut plus démarrer est marqué *ne pas exécuter***, ainsi que les nœuds que lui seul pouvait démarrer.
- **Le workflow échoue quand un nœud a échoué et que rien ne le prend en charge** : ce nœud n'a ni lien *en cas d'échec* ni lien *toujours*.
  Un échec pris en charge par un lien ne fait pas échouer le workflow.

Un nœud avec une condition (`if_extra_var`) non remplie est ignoré. Ce qui le suit s'exécute comme après un succès. Un nœud
d'approbation ne prend pas de condition : il attend toujours une réponse.

---

## Transmettre des données entre nœuds

Ce que le playbook d'un nœud rassemble avec `set_stats` parvient aux nœuds suivants comme extra vars, de la même façon qu'AWX transmet
les artefacts d'un job. Un nœud reçoit les données de chaque parent dont le lien vers lui s'est déclenché, fusionnées dans l'ordre où les parents sont
écrits, et transmet ce qu'il a reçu plus les données de son propre job, les siennes l'emportant sur une clé définie des deux côtés.

```yaml
# build.yaml, the first node : its version and build id go to the nodes after it
- name: Build
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Pass the build on
      ansible.builtin.set_stats:
        data:
          version: "2.4.1"
          build_id: 42
```

Un nœud suivant lit alors {% raw %}`{{ version }}` et `{{ build_id }}`{% endraw %} comme n'importe quelle autre extra var.

Les extra vars d'un nœud proviennent de quatre endroits. L'un d'eux, `extra_data`, contient les variables propres au nœud : c'est le nom qu'AWX leur donne,
définies sur le nœud dans le [fichier de workflow](file.html#run-settings). Quand deux sources définissent la même clé, l'ordre de priorité est
celui d'AWX, de la plus faible à la plus forte :

| Source | L'emporte sur |
|---|---|
| les variables propres au nœud (`extra_data`) | rien |
| les données transmises avec `set_stats` | l'`extra_data` du nœud |
| les `extra_vars` du workflow | les données transmises |
| les valeurs du formulaire | tout |

- Seules les données au niveau du playbook sont transmises : `set_stats` avec `per_host: false`, sa valeur par défaut.
- Un nœud d'approbation, un nœud ignoré et un nœud de projet transmettent ce qu'ils ont reçu.
- La sortie d'un nœud se termine par les clés qu'il a transmises, par leur nom seulement, car leurs valeurs peuvent être secrètes.
- Le job du nœud conserve ses données comme artefacts (**Afficher les artefacts** sur sa page), et le job du workflow conserve les données de tous ses
  nœuds : un workflow imbriqué les transmet donc lui aussi aux nœuds qui le suivent.
- Un nœud qui s'exécute sur un runner AWX transmet de la même façon les artefacts de son job AWX.
---

## Dans cette section

Les pages suivantes décrivent les workflows en détail :

| Page | Contenu |
|---|---|
| [Le fichier de workflow](file.html) | La syntaxe du fichier, les types de nœud et les réglages d'exécution de chaque nœud |
| [Modifier dans le concepteur](designer.html) | La section Workflows du concepteur : le graphe, les boîtes de dialogue des nœuds et des liens, et l'exécution à blanc |
| [Exécuter un workflow](running.html) | Le formulaire qui le lance, la page du job, les sorties des nœuds, les approbations et l'interruption |

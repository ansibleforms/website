---
layout: default
title: Modifier dans le concepteur
parent: Workflows
nav_order: 2
translated_from: dd4e281ec223f5c4995d804e774ac49e4d5934da
---

# Modifier dans le concepteur
{: .no_toc }

Dessiner un workflow, et l'essayer sans rien exécuter
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La section Workflows

**Concepteur > Workflows** liste les fichiers de workflow dans un explorateur de fichiers, avec les onglets YAML, Visuel et Aperçu de chaque
section du [concepteur](../designer/).

- **Le bouton `+`** de la barre d'outils crée un fichier de workflow, avec un workflow vide comme point de départ.
- **YAML** montre le fichier tel qu'il est écrit. Les commentaires et l'ordre des clés sont aussi conservés par les autres onglets.
- **Visuel** dessine chaque workflow du fichier sous forme de graphe, avec son nom et sa description au-dessus. Un fichier contenant deux workflows
  les affiche tous les deux, l'un sous l'autre.
- **Aperçu** est une exécution à blanc du workflow : voir [L'essayer](#trying-it-out).

Les problèmes sont listés au-dessus du graphe, chacun avec un lien qui ouvre le YAML à sa ligne : un lien vers un nœud qui n'existe
pas, une boucle, un playbook, un inventaire, un identifiant, un runner ou un dépôt que le concepteur ne connaît pas.

---

## Le graphe

Le graphe se lit de gauche à droite, de **START** jusqu'aux derniers nœuds. Chaque nœud affiche son identifiant et, en dessous, ce
qu'il exécute ; les liens sont colorés selon ce qui les déclenche, comme l'indique la légende dans le graphe : en cas de succès, en cas d'échec,
toujours.

- **Cliquez sur START** pour ajouter un premier nœud : un nœud sans parent, qui s'exécute dès que le workflow démarre.
- **Cliquez sur un nœud** pour le modifier.
- **Cliquez sur un lien** pour changer ce qui le déclenche, ou pour le retirer.

---

## Ajouter un nœud

Un nouveau nœud s'ajoute avec un assistant : **Nouveau nœud en cas de succès**, **Nouveau nœud en cas d'échec** ou **Nouveau nœud toujours** sur un nœud
existant, ou START pour un premier nœud.

1. **Ce qu'il exécute** : l'identifiant du nœud, **Exécute** (le genre de nœud et, pour un nœud playbook, où il s'exécute)
   et ce qu'il exécute : un playbook, un modèle ou un job, un workflow, le nom et le délai d'une approbation, ou un dépôt. Voir
   [Où un nœud s'exécute](#where-a-node-runs).
2. **Comment il s'exécute** : les réglages d'exécution : l'inventaire, les identifiants, la limite, les tags, la verbosité,
   les modes check et diff, la condition (**S'exécute si**) et **Valeurs de** (voir [le fichier de workflow](file.html#run-settings)).
3. **Où il va** : le nœud après lequel il s'exécute, et dans quel cas.

**Créer** ajoute le nœud au YAML.

---

## Où un nœud s'exécute

**Exécute** indique ce qu'un nœud exécute et où, dans une seule liste : **Playbook sur le RTE**, **Modèle sur AWX**, **Modèle sur
Semaphore**, **Job sur Rundeck**, **Job sur Jenkins**, puis **Workflow**, **Approbation** et **Pull de dépôt**.

| Exécute | Le champ en dessous | Runner |
|---|---|---|
| **Playbook sur le RTE** | **Playbook** : un playbook du concepteur | **Le RTE par défaut**, ou un runner RTE par son nom |
| **Modèle sur AWX** (AAP et Ascender compris) | **Modèle** : le nom du modèle, saisi | les runners AWX, chacun avec sa variante |
| **Modèle sur Semaphore** | **Modèle** : le nom du modèle, saisi | les runners Semaphore |
| **Job sur Rundeck** ou **Job sur Jenkins** | **Job** : le nom du job, saisi | les runners Rundeck ou Jenkins |

- **Playbook sur le RTE** est toujours proposé ; les autres uniquement quand l'instance a un [runner](../runners.html) de ce type.
- **Runner** ne liste que les runners de ce type, celui par défaut étant marqué et présélectionné (ou le premier par nom).
- Choisir un autre emplacement efface ce que le nœud exécute, pour qu'il soit choisi de nouveau.
- Un nœud dont le concepteur ne connaît pas le runner affiche **Modèle ou job sur** ce runner.

Le fichier de workflow ne change pas : un tel nœud est un nœud `job_template` avec un `runner:` (voir
[le fichier de workflow](file.html#run-settings)).

---

## Modifier un nœud

Cliquer sur un nœud ouvre sa boîte de dialogue, en quatre onglets :

| Onglet | Ce qu'il contient |
|---|---|
| **Ce qu'il exécute** | L'identifiant, **Exécute**, ce qu'il exécute et, pour un nœud playbook, le runner |
| **Comment il s'exécute** | Les réglages d'exécution ; les identifiants sont choisis dans une liste, chacun ajouté avec `+` |
| **S'exécute après** | Les liens qui mènent au nœud, et **Tous les parents doivent converger** |
| **Exécute ensuite** | Les liens qui en partent, avec **Lier à un nœud existant :** et **Lier à un nouveau nœud :** |

**Voir en YAML** ouvre le YAML sur le nœud, et **Retirer le nœud** le retire avec ses liens. Chaque modification est écrite immédiatement dans le
YAML ; **Enregistrer** enregistre le fichier.

---

## L'essayer

L'onglet **Aperçu** déroule le workflow sans rien lancer, selon les règles d'AWX.

Chaque nœud démarre comme un succès. Cliquez sur un nœud pour le faire échouer, et cliquez de nouveau pour le faire réussir ; le graphe montre alors
quels nœuds s'exécuteraient, lesquels ne s'exécuteraient pas, et si le workflow échouerait. **Réinitialiser** fait de nouveau réussir chaque nœud.

---
layout: default
title: Suivre un job
parent: Jobs
nav_order: 2
translated_from: 3beb53d60eeac0e108e31a8dabf2877ab15d2126
---

# Suivre un job
{: .no_toc }

Sortie en direct, extravars, filtres et téléchargements
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Suivre un job

Cliquer sur un job ouvre sa page : le formulaire du job comme titre, ses actions dans l'en-tête et sa sortie en dessous.

![La sortie d'un job](../assets/screenshots/job-output.jpg)

Depuis la 7.3.0, la page est composée de cartes, et chacune se replie sous son en-tête :

| Carte | Ce qu'elle affiche |
|---|---|
| **Résumé** | Le nom, le statut et le type du job dans son en-tête, et ses informations en dessous dans une grille de trois colonnes (deux, puis une, sur une page étroite) |
| **Workflow** | Pour un job de workflow, y compris un job de workflow AWX ou AAP, son graphe et son nombre de nœuds (voir [Le graphe du workflow](#the-workflow-graph)) |
| **Sortie** | La sortie du job et sa barre d'outils |

Un job exécuté sur AWX, AAP, Ascender, Jenkins, Semaphore ou Rundeck y affiche son numéro sous forme de lien vers sa page dans cet outil, ouvert
dans un nouvel onglet. Le lien est conservé sur le job : il fonctionne donc toujours si le runner est renommé ou supprimé plus tard.

La page se met à jour en direct : le serveur envoie un événement chaque fois qu'un job est lancé, change de statut, écrit de la sortie ou est
supprimé, et la page relit le job, si bien que la sortie s'allonge au fur et à mesure que le job l'écrit. La liste des jobs se met à jour de la même façon.
**Actualiser** recharge le job à la main.

Tant que vous êtes à la fin de la sortie, la page la suit vers le bas à mesure que de nouvelles lignes arrivent. Remontez pour lire une ligne précédente
et la page reste où vous êtes : **Aller aux dernières** apparaît alors en bas de la sortie, et devient **Nouvelles lignes** dès que
d'autres sont arrivées. Cliquez dessus, ou redescendez jusqu'à la fin, pour suivre de nouveau les nouvelles lignes. La sortie sur la page du formulaire, après
**Soumettre**, et le [journal du serveur](../production/logs.html) suivent leurs nouvelles lignes de la même façon.

La barre d'outils de la sortie contient :

| Bouton | Ce qu'il fait |
|---|---|
| **Afficher les variables supplémentaires** | Affiche les extravars avec lesquelles le job s'est exécuté dans un panneau au-dessus de la sortie, avec un sélecteur **JSON** / **YAML** et **Copier** |
| **Afficher les artefacts** | Affiche les artefacts du job dans le même panneau (voir ci-dessous) |
| **Afficher les paramètres** | Remplace **Afficher les variables supplémentaires** pour un job Jenkins : les valeurs avec lesquelles il s'est exécuté, ses paramètres de build |
| **Afficher la payload** | Remplace **Afficher les variables supplémentaires** pour un job Rundeck : la payload qui lui a été envoyée |
| **Hôtes et tâches** | Affiche les hôtes et les tâches d'un playbook au-dessus de sa sortie (voir [Hôtes et tâches](#hosts-and-tasks)) |
| **Actualiser** | Recharge la sortie |
| **Appliquer le filtre** | Masque les tâches dont le nom correspond au filtre de sortie ; **Supprimer le filtre** les affiche de nouveau |
| **Copier la sortie** | Copie la sortie en texte brut, avec ou sans le filtre appliqué |
| **Télécharger la sortie** | Télécharge la sortie sous le nom `ansibleforms-job-<id>.txt` |

**Afficher les artefacts** est proposé pour tout job qui n'est pas un job de template, comme un playbook sur le RTE ou un workflow (vide quand
ses playbooks n'ont rassemblé aucun artefact avec `set_stats`), et pour un job de template exécuté sur AWX, AAP ou Ascender. Les jobs Semaphore, Rundeck
et Jenkins n'ont pas d'artefacts : il n'est donc jamais proposé pour eux.

À gauche de la barre d'outils, le bouton **Tout réduire** replie chaque section de la sortie (chaque play et chaque tâche) et devient
**Tout développer**, qui les déplie de nouveau.

**Afficher les variables supplémentaires** nécessite l'option de rôle `showExtravars` et **Afficher les artefacts** l'option de rôle `showArtifacts` (voir
les [options de rôle](../config/roles.html#role-options)). Les valeurs des champs mot de passe et des clés qui correspondent à
[`MASK_EXTRAVARS_REGEX`](../customization/security.html#env_MASK_EXTRAVARS_REGEX) sont masquées.

Le filtre est défini par [`REGEX_FILTER_JOB_OUTPUT`](../customization/security.html#env_REGEX_FILTER_JOB_OUTPUT), `\[low\]` par
défaut. Mettez `[low]` dans le nom d'une tâche bavarde, et **Appliquer le filtre** masque cette tâche et ses lignes.

La page d'un job multistep affiche chaque étape sous le job principal, l'une sous l'autre, chacune sous une barre de titre comme
**Étape 1 · Prepare the server (id du job 98)** avec son statut. Cliquez sur un titre (ou appuyez sur Entrée ou Espace dessus) pour replier cette sortie,
et de nouveau pour la déplier. Les workflows AWX/AAP affichent aussi le statut de leurs nœuds.

Les jobs de [workflow](../workflows/running.html#the-job) conservent la sortie de chaque nœud dans la leur, sous une bannière `WORKFLOW NODE` par
nœud ; ils dessinent leur graphe en direct, et un clic sur un nœud ouvre sa sortie.

---

## Trouver un texte dans la sortie

Depuis la 7.3.0, la page du job a une zone de recherche, **Chercher dans la sortie**, sur sa ligne de titre, à gauche des actions du job.

Chaque endroit où le texte apparaît dans la sortie est mis en évidence, quelle que soit la casse, et la page se place sur le premier. **Entrée** passe au
suivant, affiché plus fortement, et la barre d'outils indique lequel sur combien (**2 sur 4**), ou **Introuvable**. La recherche déplie d'abord la sortie et
ses sections, et pendant l'exécution du job les nouvelles lignes sont aussi parcourues, sans déplacer la page.

---

## Se déplacer dans une longue sortie

Depuis la 7.3.0, une longue sortie, sur la page du job et sous un formulaire après **Soumettre**, offre ces moyens de s'y déplacer :

| Contrôle | Ce qu'il fait |
|---|---|
| En-têtes fixes | L'en-tête d'une section (un nœud de workflow, le playbook du job, l'étape d'un job multistep) reste en haut pendant que ses lignes défilent |
| **2 en échec** | Compte les tâches en échec, sans les échecs qu'Ansible devait ignorer ; chaque clic passe à la suivante, dépliée et mise en évidence. Sans tâche en échec, **1 erreur** compte plutôt les lignes d'erreur |
| Numéros de ligne | Chaque numéro de ligne renvoie vers sa ligne, comme `#L45` dans l'adresse : ouvrir cette adresse fait défiler jusqu'à la ligne et la met en évidence |
| Boutons haut et bas | Affichés en bas à droite dès que la page a défilé, pour revenir en haut ou aller à la fin |
| **En cours** et **Arrêter** | Pendant l'exécution du job, la barre de la page du formulaire reste en bas de la fenêtre, et **Arrêter** y arrête le job immédiatement |

---

## Résultats des tâches

Depuis la 7.3.0, la ligne de résultat d'un hôte dans la sortie d'un playbook ouvre ce résultat dans une boîte de dialogue **Résultat de la tâche**, comme le fait AWX.

La ligne, le corps du résultat qui la suit (`=> { ... }`) et l'erreur affichée avant un résultat en échec sont mis en évidence comme un seul bloc au survol, et un
clic ouvre la boîte de dialogue. Cela fonctionne sur la page du job et sous un formulaire après **Soumettre**, pour un playbook exécuté sur un RTE 7.3.0 ou
plus récent, car le résultat provient des mêmes événements que [Hôtes et tâches](#hosts-and-tasks). La boîte de dialogue a ces onglets :

| Onglet | Ce qu'il affiche |
|---|---|
| **Détails** | Le statut, l'hôte, le play, la tâche, le module, l'élément de boucle, l'heure de début, la durée, le code de retour et le message |
| **JSON** et **YAML** | Le résultat complet du module, coloré et avec des lignes numérotées |
| **Sortie standard** et **Erreur standard** | Le `stdout` et le `stderr` du résultat, quand il en a |

Le résultat complet, et avec lui les onglets **JSON**, **YAML** et de sortie, n'est stocké que lorsque le job s'exécute en mode verbeux, puisque la sortie
l'affiche alors aussi ; sinon, la boîte de dialogue n'affiche que les détails. Même en mode verbeux, les arguments du module (`invocation`) sont
omis, les valeurs des clés qui ressemblent à un secret sont masquées, et un résultat est tronqué dès qu'il dépasse 64 Ko de JSON.

---

## Le graphe du workflow

Depuis la 7.3.0, le graphe d'un workflow en cours glisse pour garder le nœud en cours en vue.

Faites défiler le graphe ailleurs et il reste là où vous l'avez mis, avec un bouton **Suivre le nœud en cours** pour le suivre de nouveau. Survoler un nœud
affiche sa carte avec le nom complet et met en avant le nœud et ses liens, le reste du graphe étant estompé. Le graphe a des boutons **Ajuster à
l'écran** et **Plein écran**, et sous un formulaire après **Soumettre**, un clic sur un nœud ouvre sa sortie comme sur la page du job.

---

## Hôtes et tâches

Depuis la 7.3.0, un job de playbook exécuté sur un RTE 7.3.0 ou plus récent enregistre ses événements structurés à côté de sa sortie texte : chaque play, chaque tâche
et chaque résultat d'hôte, ainsi que le récapitulatif. **Hôtes et tâches**, dans la barre d'outils de la sortie, les affiche dans un panneau au-dessus de la sortie, sur la page du job et
sous un formulaire après **Soumettre**. Il est proposé dès que le job a des événements, et le panneau est relu toutes les quelques secondes pendant l'exécution du job :

| Vue | Ce qu'elle affiche |
|---|---|
| **Grille** | Le récapitulatif par hôte (ok, changed, failed, unreachable, skipped, rescued, ignored), puis une grille des hôtes par tâche : chaque cellule est colorée selon le résultat de l'hôte pour cette tâche, avec son message et sa durée au survol, ou *non exécutée* |
| **Chronologie** | Chaque tâche sous forme de barre, aussi longue que le temps pris par son hôte le plus lent, avec sa durée en secondes et le total |

La sortie texte reste telle quelle. Les événements sont écrits par le plugin de callback `af_events` propre au RTE : le playbook n'a donc besoin d'aucune modification.

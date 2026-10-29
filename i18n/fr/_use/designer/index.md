---
layout: default
title: Concepteur
nav_order: 1
has_children: true
has_toc: false
permalink: /designer/
translated_from: bf0bdf119ae004ec2da8640d18a254483027098c
---

# Concepteur
{: .no_toc }

Modifier des formulaires, des playbooks, des inventaires et des workflows dans le navigateur
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les auteurs de formulaires : les sections du concepteur, et ce que montre chacun de leurs onglets.

Le concepteur nécessite l'[option de rôle](../config/roles.html#role-options) `showDesigner`. Il modifie un élément à la fois, un
formulaire, un playbook ou un fichier de workflow, avec ses sections dans le menu de gauche. Chaque type de fichier nécessite aussi sa propre option, toutes
activées par défaut : `allowPlaybookDesign` pour les **Playbooks**, `allowWorkflowDesign` pour les **Workflows**,
`allowInventoryDesign` pour les **Inventaires** et `allowVarsFileDesign` pour les **Fichiers de variables**. Sans elle, sa section est
en lecture seule et le serveur refuse d'enregistrer, créer, supprimer ou pousser ses fichiers ; les formulaires et les workflows peuvent toujours les choisir. Les sections
**Formulaires**, **Catégories** et **Constantes** nécessitent de la même façon `allowFormDesign` : sans elle, elles sont en lecture seule, et le serveur
refuse de les enregistrer, de les tirer ou de les pousser. Une seule personne modifie à la fois : voir [Le verrou du concepteur](lock.html).
Un rôle peut aussi masquer les formulaires, playbooks et workflows des autres équipes : voir [Concepteurs limités](#limited-designers).

---

## Ses sections

Chaque section modifie un type de fichier, conservé localement ou dans un [dépôt](../repositories/) :

| Section | Ce qu'elle modifie |
|---|---|
| **Formulaires** | Les fichiers de formulaires |
| **Catégories** | Les catégories de `config.yaml` |
| **Constantes** | Les constantes de `config.yaml` |
| **Fichiers de variables** | Les fichiers de variables que chargent les formulaires |
| **Playbooks** | Les playbooks qu'exécutent les formulaires et les workflows |
| **Inventaires** | Les inventaires : `inventory.yaml`, `group_vars` et `host_vars` |
| **Workflows** | Les fichiers de [workflow](../workflows/) |

Les sections qui ont des fichiers les listent dans un explorateur de fichiers et ouvrent le premier ; une section qui n'a pas encore de fichiers l'indique. La
section **Formulaires** et chaque section de fichiers ont un bouton **Nouveau fichier** en tête de leur barre d'outils : dans les Inventaires il crée un nouvel
inventaire, dans les Workflows un nouveau workflow vide. La loupe de l'explorateur ouvre une zone qui filtre ses fichiers par nom.

La zone de recherche de la ligne de titre trouve un texte dans le YAML ouvert : elle marque chaque endroit où il apparaît. Elle fonctionne dans
l'onglet **YAML**, une fois que le verrou du concepteur est à vous.

---

## Ses onglets

Chaque section a les trois mêmes onglets, tous sur le même YAML : une modification dans l'un apparaît dans les autres, et **Enregistrer** l'enregistre.

- **YAML** est le fichier tel qu'il est écrit.
- **Visuel** le modifie avec des champs. Seules les clés touchées par une modification changent : les commentaires et le reste restent tels qu'ils sont écrits.
- **Aperçu** montre ce qu'il fait, et ne modifie rien.

Ce que montrent les onglets Visuel et Aperçu, section par section :

| Section | Visuel | Aperçu |
|---|---|---|
| **Formulaires** | Les réglages du formulaire et ses champs, avec des listes des playbooks, inventaires et workflows du concepteur | Le formulaire tel qu'il est maintenant, modifications non enregistrées comprises ; sa soumission n'exécute rien |
| **Catégories** | Les catégories sous forme de tableau, modifiable | Le menu de la page Formulaires, construit à partir d'elles |
| **Constantes** | Les constantes sous forme d'arborescence, modifiable (une clé se déplace avec les touches fléchées) | Chaque constante avec sa référence, `$(NAME)`, à copier, et les formulaires qui l'utilisent |
| **Fichiers de variables** | Les variables, modifiables | Chaque variable avec sa référence dans un playbook, {% raw %}`{{ name }}`{% endraw %}, à copier, et les formulaires qui chargent le fichier |
| **Playbooks** | Les plays : le nom, les hosts, **Become**, **Collecter les facts** et les rôles de chaque play, et ses tâches, chacune avec son module et ses arguments | Le plan du playbook : ses plays, avec leurs hosts, rôles et tâches, et les playbooks qu'il importe |
| **Inventaires** | Les groupes, leurs groupes enfants, leurs hôtes, et les variables que chacun définit | L'inventaire sous forme d'arbre, avec ses `group_vars` et `host_vars` |
| **Workflows** | Le graphe du workflow, pour le [modifier](../workflows/designer.html) | Une [exécution à blanc](../workflows/designer.html#trying-it-out) : cliquez sur un nœud pour le faire échouer |

Quand le YAML ne peut pas être lu, les onglets Visuel et Aperçu en indiquent la raison, avec **Voir en YAML** pour ouvrir le YAML à la ligne concernée.

---

## Concepteurs limités

Depuis la 7.5.0, trois options de rôle limitent les formulaires, playbooks et workflows que montre le concepteur, pour que chaque équipe conçoive les siens.
Toutes trois sont activées par défaut et toujours activées pour les admins :

| Option | Désactivée, le concepteur ne montre que |
|---|---|
| `designAllForms` (**Modifier Tous les Formulaires**) | Les formulaires dont les `roles` contiennent un des rôles de l'utilisateur, et les sous-formulaires qu'aucun formulaire masqué n'utilise |
| `designAllPlaybooks` (**Modifier Tous les Playbooks**) | Les playbooks qu'exécutent les formulaires de l'utilisateur, et ceux qu'aucun formulaire n'utilise encore |
| `designAllWorkflows` (**Modifier Tous les Workflows**) | Les fichiers de workflow qu'exécutent les formulaires de l'utilisateur, imbriqués compris, et ceux qu'aucun formulaire n'utilise encore |

Un formulaire exécute un playbook par son `playbook`, ses étapes ansible et les workflows qu'il exécute. Ce qu'un concepteur limité ne peut pas faire :

- **Voir un fichier masqué.** Il n'est jamais listé ni nommé : en ouvrir un répond comme un fichier absent, et un nouveau fichier portant son
  nom comme un fichier déjà présent.
- **Y faire référence.** Un formulaire qui nomme un formulaire masqué comme sous-formulaire n'en montre rien, et un formulaire ou un fichier de
  workflow qui nomme un playbook ou un workflow masqué est refusé.
- **Changer un sous-formulaire partagé.** Un sous-formulaire qu'utilise aussi un formulaire masqué est en lecture seule, et un formulaire
  enregistré doit garder un des rôles de l'utilisateur.
- **Toucher aux formulaires masqués d'un fichier.** Un fichier qui contient plusieurs formulaires garde les masqués tels quels à
  l'enregistrement, et la restauration d'une sauvegarde des formulaires est refusée.
- **Ajouter du code que le serveur exécute.** Un formulaire enregistré ne peut gagner ni expression ni requête que le serveur exécute, et
  l'aperçu d'un formulaire pas encore enregistré n'exécute aucune expression à lui.
- **Lire des noms de fichiers dans la sortie de git.** La sortie d'un pull ou d'un push omet les lignes qui nomment des fichiers.

`allowFormDesign`, `allowPlaybookDesign` et `allowWorkflowDesign` décident toujours si les fichiers montrés peuvent être modifiés.
Les inventaires, fichiers de variables, catégories et constantes restent visibles pour tout concepteur. Un utilisateur qui n'a qu'une partie
des paramètres ne voit que ses propres formulaires et fichiers de workflow dans les onglets **Formulaires** des pages de paramètres et dans
l'onglet **Utilisé par** d'un identifiant.

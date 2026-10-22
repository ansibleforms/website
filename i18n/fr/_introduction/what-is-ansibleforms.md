---
layout: default
title: Qu'est-ce qu'AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Qu'est-ce qu'AnsibleForms
{: .no_toc }

Des formulaires en libre-service devant Ansible et AWX, et quand vous en avez besoin
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Ce qu'il fait

AnsibleForms place un formulaire web devant un playbook, un workflow, ou un modèle ou un job sur AWX, AAP, Ascender, Semaphore, Rundeck
ou Jenkins, pour que chacun puisse lancer de l'automatisation sans passer par la ligne de commande.

Un formulaire recueille les saisies, les vérifie, les met en forme en extravars et lance le job. Les données d'un formulaire peuvent venir de bases de données,
d'API REST, de fichiers et d'autres champs, et chaque lancement est enregistré dans l'historique des jobs avec sa sortie.

---

## Usages courants

Les équipes utilisent AnsibleForms pour confier l'automatisation de routine aux personnes qui la demandent :

* **Demandes en libre-service** : une machine virtuelle, un volume de stockage, un partage ou un compte utilisateur, rempli par le demandeur
* **Opérations encadrées** : des actions avec des points d'approbation, pour qu'une deuxième personne valide avant que le job ne s'exécute
* **Choix pilotés par les données** : des listes déroulantes alimentées par une CMDB, une base de données ou une API REST, en cascade d'un champ au suivant
* **Jobs récurrents** : des formulaires exécutés plus tard ou selon une planification cron, avec les mêmes saisies validées à chaque fois
* **Automatisation pour les outils et les agents** : l'API REST, le serveur MCP et l'assistant de chat lancent les mêmes formulaires

---

## AnsibleForms ou les surveys d'AWX ?

AWX, AAP et Ascender ont leurs propres surveys. Le bon choix dépend de ce dont ont besoin les personnes qui lancent les jobs.

Un **survey** suffit quand :

* les questions sont fixes : du texte, des nombres, des mots de passe et des choix dans une liste statique
* les utilisateurs travaillent déjà dans AWX, AAP ou Ascender, et ses permissions leur conviennent
* vous ne voulez pas faire tourner et maintenir une application et une base de données de plus

**AnsibleForms** est utile quand :

* les choix viennent d'ailleurs : une base de données, une API REST, un fichier ou un autre champ (listes déroulantes en cascade)
* les saisies ont besoin de validation, de structure (listes, objets imbriqués) ou de valeurs calculées avant d'arriver au playbook
* les jobs ont besoin de points d'approbation, de planification, ou d'un workflow qui enchaîne playbooks, modèles et approbations depuis un seul formulaire
* les utilisateurs ne doivent pas voir AWX du tout, ou vous exécutez aussi des playbooks sans AWX

AnsibleForms lance les modèles d'AWX, AAP et Ascender, les deux fonctionnent donc ensemble : les formulaires recueillent et mettent en forme les saisies, et
AWX continue d'exécuter les jobs.

---

## Pour aller plus loin

Le reste de cette section explique les rouages avant l'installation :

| Page | Ce qu'elle couvre |
|---|---|
| [Comment ça marche](how-it-works.html) | L'architecture, les étapes d'un lancement, et où les données sont conservées |
| [Visite de l'interface](gui/) | Des captures de chaque écran, de la connexion aux pages d'administration |
| [Concepts](concepts.html) | Les termes utilisés dans cette documentation |
| [Prérequis](prerequisites.html) | Ce qu'il vous faut avant d'installer |

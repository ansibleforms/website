---
layout: default
title: Annonces
nav_order: 1
has_children: true
has_toc: false
permalink: /announcements.html
translated_from: 9569cbdaa1c1d1d215f521f21023566e3a4df572
---

# Annonces
{: .no_toc }

Des messages sous l'en-tête pour tous, comme une fenêtre de maintenance, chacun de son début à sa fin
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs : informez tous les utilisateurs d'une fenêtre de maintenance ou d'un incident, dans **Paramètres > Apparence > Annonces**.

La page nécessite l'option de rôle `showSettings` ou `showAppearanceSettings`. Depuis la 7.3.0, c'est une seule liste, et chaque annonce
a sa propre page et son interrupteur Activée.

---

## Dans cette section

| Page | Ce qu'elle couvre |
|---|---|
| [Général](announcements/general.html) | L'interrupteur Activée de chaque annonce, qui a remplacé l'interrupteur commun à toutes |
| [Liste](announcements/list.html) | Les annonces qui ne sont pas terminées, leurs colonnes et la page d'une annonce |
| [Ajouter une annonce](announcements/adding-one.html) | L'assistant en deux étapes : le message, puis quand il s'affiche |


---

## Où elles s'affichent

Les annonces s'affichent sous forme de ligne sous l'en-tête de chaque page, pour chaque utilisateur connecté, chacune dans la couleur de son type.

Plusieurs annonces activées peuvent s'afficher en même temps, la plus récente en premier. La page de connexion et un formulaire intégré dans un autre site n'en affichent aucune.

Chacune a un bouton de fermeture. Une annonce fermée reste fermée dans cet onglet du navigateur jusqu'à la fermeture de l'onglet, ou
jusqu'à ce que son message ou sa date de fin change. Une annonce enregistrée atteint tous les navigateurs ouverts en même temps ; celle qui
atteint sa date de début ou de fin s'y affiche ou s'y masque en moins d'une minute.

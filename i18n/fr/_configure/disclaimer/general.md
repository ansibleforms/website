---
layout: default
title: Général
parent: Avertissement
nav_order: 1
translated_from: 5545e95acf978130082fcb459c917894e7a5286a
---

# Général
{: .no_toc }

La liste des versions, l'ajout d'une version, et l'activation de celle qu'acceptent les utilisateurs
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La liste

Depuis la 7.3.0, **Paramètres > Accès > Avertissement** est une liste des versions de l'avertissement, une par texte tel qu'il a été accepté :

| Colonne | Signification |
|---|---|
| **Activé** | Si c'est la version qu'acceptent les utilisateurs ; une au plus est activée |
| **Version** | Son numéro, compté à partir de 1 |
| **Titre** | Le titre de sa boîte de dialogue |
| **Publiée par** | Qui l'a ajoutée |
| **Publiée** | Quand |
| **Acceptations** | Combien d'utilisateurs l'ont acceptée |

Un clic sur une ligne, ou **Modifier** dans le menu de sa ligne, ouvre la [page de la version](versions.html). Le menu propose aussi **Activer** ou **Désactiver**, et **Supprimer**.

---

## Ajouter une version

**Ajouter un avertissement** ouvre une boîte de dialogue pour une nouvelle version, avec le numéro suivant, qui n'est pas activée tant que vous ne l'activez pas :

| Champ | Signification |
|---|---|
| **Titre** | Le titre de la boîte de dialogue, comme Conditions d'utilisation |
| **Texte** | Ce que les utilisateurs acceptent, 20000 caractères au plus. Texte brut : les retours à la ligne sont conservés. |
| **Case** | Ce que les utilisateurs cochent avant de pouvoir accepter, au départ « J'ai lu et j'accepte ces conditions. » |

Les trois sont obligatoires. La version activée jusque-là reste celle qu'acceptent les utilisateurs, si bien qu'un nouveau texte peut être préparé à l'avance.

---

## Activer une version

**Activer** dans un menu de ligne, ou l'interrupteur **Activé** sur la page de la version, fait de cette version celle qu'acceptent les utilisateurs et désactive les
autres.

Les utilisateurs qui ont déjà accepté cette version ne sont pas sollicités à nouveau, si bien qu'une version antérieure peut être réactivée sans redemander à tout le monde.
**Désactiver** sur la version activée désactive l'avertissement jusqu'à ce qu'une version soit de nouveau activée ; les versions et les acceptations restent.
Supprimer une version supprime aussi ses acceptations, et supprimer la version activée désactive l'avertissement.

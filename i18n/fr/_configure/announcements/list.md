---
layout: default
title: Liste
parent: Annonces
nav_order: 2
translated_from: 3bbe4ccb28f9305a450ac85b7d99531ce28a84cd
---

# Liste
{: .no_toc }

Les annonces qui ne sont pas terminées, leurs colonnes et la page d'une annonce
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La liste

**Paramètres > Apparence > Annonces** liste toutes les annonces qui ne sont pas terminées, avec ces colonnes :

| Colonne | Signification |
|---|---|
| **Activée** | Si elle s'affiche sous l'en-tête de son début à sa fin (depuis la 7.3.0) |
| **Message** | Le texte sous l'en-tête |
| **Type** | Info, Avertissement ou Danger |
| **Date de début** | Quand elle commence à s'afficher ; `–` quand elle s'affiche tout de suite |
| **Date de fin** | Quand elle se termine ; `–` quand elle s'affiche jusqu'à sa suppression |
| **Créée par** | Qui l'a ajoutée |

Un clic sur une ligne, ou **Modifier** dans le menu de sa ligne, ouvre la page de l'annonce. Le menu propose aussi **Activer** ou **Désactiver**, et **Supprimer**.

Une fois sa date de fin passée, une annonce est supprimée : la liste ne garde que celles à venir et celles qui s'affichent.

---

## La page d'une annonce

Depuis la 7.3.0, chaque annonce s'ouvre sur sa propre page, à `/settings/announcements/<id>`, avec un seul onglet, **Détails**.

Elle contient le message, le type, les dates de début et de fin et l'interrupteur **Activée**, qui est enregistré immédiatement ; les autres champs sont enregistrés
avec **Enregistrer**, et **Supprimer** retire l'annonce. Le titre de la page la nomme par les premiers caractères de son message.

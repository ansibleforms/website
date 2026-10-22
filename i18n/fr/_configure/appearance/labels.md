---
layout: default
title: Étiquettes
parent: Apparence
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Étiquettes
{: .no_toc }

Des étiquettes à côté du logo qui indiquent de quelle instance il s'agit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La liste

Depuis la 7.3.0, **Paramètres > Apparence > Étiquettes** contient plusieurs étiquettes à côté du logo de l'en-tête, comme PRODUCTION et EU :

| Colonne | Signification |
|---|---|
| **Activée** | Si l'étiquette s'affiche à côté du logo et sur la page de connexion |
| **Étiquette** | Son texte, affiché sous la forme de la pastille colorée que montre l'en-tête |

Les lignes suivent l'ordre de l'en-tête. Un clic sur une ligne, ou **Modifier** dans le menu de sa ligne, ouvre la page de l'étiquette ; le menu de la ligne propose aussi
**Activer** ou **Désactiver**, selon le cas, **Monter** et **Descendre** pour changer l'ordre, et **Supprimer**.

L'en-tête et la page de connexion affichent les étiquettes activées dans leur ordre. Au-delà de trois, un **+N** gris regroupe les autres dans son infobulle,
et un téléphone affiche la première étiquette et le **+N**. Une étiquette enregistrée s'affiche immédiatement dans tous les navigateurs ouverts.

---

## Ajouter une étiquette

**Ajouter une étiquette** ouvre une boîte de dialogue avec les deux champs de l'étiquette, tous deux obligatoires :

| Champ | Signification |
|---|---|
| **Étiquette** | Le texte de l'étiquette, comme PRODUCTION |
| **Couleur** | Bleu, vert, ambre, orange, rouge ou gris, sous forme de pastilles rondes ; rouge au départ |

Un aperçu montre l'en-tête avec toutes les étiquettes activées et la nouvelle au fil de la saisie. Une nouvelle étiquette est activée et vient après les
autres. Sa page a un seul onglet, **Détails**, avec les mêmes champs, l'interrupteur **Activée**, qui est enregistré immédiatement, et l'aperçu.

---

## L'étiquette d'environnement de la 7.2

Jusqu'à la 7.2, **Paramètres > Apparence > Environnement** définissait une seule étiquette à côté du logo.

Avec une seule étiquette, PRODUCTION EU et PRODUCTION US s'affichent toutes deux PRODUCTION quand plusieurs instances sont ouvertes côte à côte. Depuis la 7.3.0,
la mise à jour fait de cette étiquette la première de la liste, avec son texte, sa couleur et le fait qu'elle s'affichait ou non, et l'ancienne adresse
**Environnement** ouvre la liste.

---

## Les étiquettes dans le seed de configuration

Depuis la 7.3.0, le [seed de configuration](../seed/) déclare les étiquettes dans sa section `labels`, chacune avec son texte et, en option, sa couleur :

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` vaut `blue`, `green`, `amber`, `orange`, `red` ou `grey`, et `position` les ordonne, la plus basse en premier. Une étiquette déclarée
dans le seed est en lecture seule sur sa page, comme tout [objet géré](../seed/managed-objects.html).

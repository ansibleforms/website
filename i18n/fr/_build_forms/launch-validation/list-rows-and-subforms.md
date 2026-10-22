---
layout: default
title: Lignes de liste
parent: Validation au lancement
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Lignes de liste
{: .no_toc }

Comment les lignes des champs list sont validées
{: .fs-6 .fw-300 }

---

Un champ `list` contient des lignes ; chaque ligne est une instance de son sous-formulaire, remplie via l'éditeur
de ligne. Un champ `yaml` avec un `subform` est une telle ligne. Le serveur les traite de la même façon
que l'éditeur de ligne du navigateur : chaque ligne est résolue via son sous-formulaire, avec les valeurs du formulaire
comme `__parent__`, ses règles vérifiées et ses champs calculés évalués. Les listes imbriquées fonctionnent de la
même façon : dans la liste propre à une ligne, `$(__parent__.__parent__.x)` atteint le formulaire.

Les lignes sont vérifiées comme suit :

- **Une ligne que l'utilisateur a ajoutée ou modifiée** dans l'éditeur est résolue et validée.
- **Une ligne que personne n'a touchée**, produite par la valeur par défaut, l'expression ou la requête de la liste
  (comme les entrées existantes d'une liste d'ACL), passe **exactement telle qu'elle est arrivée**, comme dans le
  navigateur : elle n'est pas revalidée et rien n'y est ajouté. Une entrée existante qui enfreint une règle
  écrite plus tard n'empêche pas le lancement.
- **Une ligne marquée comme supprimée** (le `deleteMarker` de la liste) est conservée telle quelle et n'est pas validée.

Pour distinguer ces lignes sans faire confiance à la requête, le serveur exécute de nouveau la source propre à la liste
(sa valeur par défaut, sinon son expression ou sa requête) sous la validation au lancement. Une ligne
qui n'est pas passée par l'éditeur passe inchangée **uniquement si elle fait partie des lignes que produit cette
source**. Toute autre ligne, comme une ligne inventée par un appelant REST, est résolue et
validée comme une ligne modifiée. Une simple ligne ne peut donc pas contourner les vérifications, tandis que les
lignes intactes du navigateur passent toujours inchangées.

Un utilisateur du navigateur ne s'en aperçoit que dans un seul cas : les données de la source ont changé entre l'ouverture du
formulaire et son lancement (une entrée a été modifiée ou supprimée entre-temps), **et** cette ligne
enfreint une règle de son sous-formulaire. La ligne ne compte alors plus comme une des lignes de la source : elle
est donc validée, et le lancement est refusé en nommant la ligne, par exemple
`acls[2].user_or_group (regex)`.

Les lignes en échec apparaissent dans `rowErrors` avec leur `index` (un champ `yaml` n'en a pas) et dans le journal sous la forme
`disks[1].size (maxValue)`.

Un lancement peut contenir au maximum **500 lignes** sur tous les niveaux d'imbrication, puisque chaque ligne exécute les requêtes de son sous-formulaire.

---

## Marqueurs de ligne

Les marqueurs qu'une liste pose sur ses lignes (`insertMarker`, `updateMarker` et `deleteMarker` ; sans
`insertMarker`, les nouvelles lignes reçoivent `__inserted__` quand la liste définit `allowDelete: false`, un `deleteMarker` ou un `updateMarker`)
parviennent au playbook sur chaque ligne qui en porte un. Une ligne supprimée est envoyée avec son marqueur de
suppression, pour que le playbook puisse la supprimer. Avant la 6.4.1, une ligne de liste ne portait de marqueur que si son
sous-formulaire le déclarait comme champ (masqué).

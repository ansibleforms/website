---
layout: default
title: Versions
parent: Avertissement
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versions
{: .no_toc }

La page d'une version, et la modification de son texte comme correction ou pour tout le monde à nouveau
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La page d'une version

Depuis la 7.3.0, chaque version a sa propre page, à `/settings/disclaimer/<version>`, avec deux onglets :

| Onglet | Ce qu'il contient |
|---|---|
| **Détails** | Le titre, le texte et le libellé de la case, et l'interrupteur **Activé**, qui est enregistré immédiatement |
| **Acceptations** | Qui a accepté cette version, voir [Acceptations](acceptances.html) |

**Aperçu** montre la boîte de dialogue telle que la verront les utilisateurs, et **Supprimer** retire la version avec ses acceptations. La zone de recherche au-dessus des
onglets cherche dans les deux à la fois : les champs correspondants sous **Détails** et les lignes correspondantes sous **Acceptations**.

---

## Modifier le texte

**Enregistrer** sur un titre, un texte ou un libellé de case modifié que des utilisateurs ont déjà accepté demande **Redemander à tout le monde ?** :

| Réponse | Ce qui se passe |
|---|---|
| **Redemander à tout le monde** | Les acceptations de cette version sont effacées, et chaque utilisateur l'accepte à nouveau à sa prochaine requête |
| **Garder comme correction** | Le texte est réécrit, par exemple pour une coquille, et les acceptations comptent toujours : personne n'est sollicité à nouveau |

Une version que personne n'a encore acceptée est enregistrée sans rien demander. Pour conserver le texte accepté, [ajoutez une nouvelle version](general.html#adding-a-version) et activez-la.

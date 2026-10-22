---
layout: default
title: Liens
parent: Apparence
nav_order: 5
translated_from: b17adbc1210baac2cf6786f7b0cef5e18fea8ae1
---

# Liens
{: .no_toc }

Les liens de l'en-tête, intégrés et les vôtres
{: .fs-6 .fw-300 }

**Liens** définit les liens de l'en-tête, pour chaque utilisateur connecté, dans deux onglets.

**Intégrés** contient l'interrupteur **Designer**, conservé dans [`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER) et appliqué
sans redémarrage. Désactivé, le designer disparaît pour tout le monde : son lien, sa page et son API.

**Personnalisés** contient vos propres liens, comme un wiki, un runbook ou un portail de support. **Ajouter un lien** ajoute une ligne avec ces champs :

| Champ | Signification |
|---|---|
| **Icône** | L'icône avant le libellé, choisie dans une liste |
| **Libellé** | Le texte du lien |
| **Adresse** | Un site (`https://…`) ou une page de l'application (`/forms/all`) |
| **Nouvel onglet** | Ouvre le lien dans un nouvel onglet du navigateur |

Les boutons d'une ligne la déplacent : **→** place le lien dans le lien du dessus, qui s'ouvre alors comme un menu dans l'en-tête,
**←** le ressort dans l'en-tête, et les flèches haut et bas le déplacent (un menu avec les liens qu'il contient).
Un menu n'a pas besoin d'adresse propre.

L'en-tête contient au plus 5 de vos liens après les liens intégrés, et au plus 10 dans chaque menu.

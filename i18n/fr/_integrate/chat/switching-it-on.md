---
layout: default
title: L'activer
parent: Assistant de chat
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# L'activer
{: .no_toc }

Activer l'assistant et y proposer des formulaires
{: .fs-6 .fw-300 }

---

L'assistant a besoin des quatre éléments suivants :

1. **`ENABLE_CHAT=1`** : la variable d'environnement. Modifiée sur la page des paramètres, elle s'applique immédiatement, sans redémarrage ; tant
   qu'elle est désactivée, les endpoints du chat répondent `404`. Voir [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Un fournisseur de modèles** : Paramètres -> Connexions -> **Assistant de chat** (ou le [seed de configuration](../seed) sur Kubernetes).
3. **Des formulaires qui participent** : `enableForChat: true` sur chaque formulaire ; l'assistant ignore tous les autres.
4. **Des utilisateurs qui ont le droit de l'utiliser** : l'option de rôle `allowChat` (par défaut : true). Définissez
   `allowChat: false` sur un rôle pour en exclure les membres.

Le bouton de chat apparaît pour un utilisateur dès que les quatre conditions sont remplies.

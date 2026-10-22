---
layout: default
title: Signaler une vulnérabilité
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Signaler une vulnérabilité
{: .no_toc }

Comment signaler un problème de sécurité en privé, et ce qui se passe ensuite
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Le signaler en privé

AnsibleForms détient des identifiants et des jetons de coffre : ne signalez donc jamais un problème de sécurité dans une issue publique :

1. Ouvrez **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)** : un avis privé que seuls les mainteneurs voient.
2. Si cette page ne vous est pas accessible, ouvrez une issue normale qui dit seulement que vous avez un signalement de sécurité et demande
   un canal privé : pas de détails, pas de reproduction, pas de numéros de version. Un mainteneur ouvre un avis privé et
   vous y invite.

La politique complète est le [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) du dépôt.

---

## Ce qu'il faut inclure

Plus un signalement fournit d'éléments, plus vite le problème est corrigé :

* Ce qu'un attaquant y gagne : les données d'un autre utilisateur, un playbook qu'il n'a pas le droit d'exécuter, l'hôte, ou des droits admin.
* La version, et la façon dont elle est déployée : Docker, Kubernetes, ou installation native.
* Une reproduction, ou la requête qui le déclenche.
* S'il faut un utilisateur connecté, et avec quelles [options de rôle](../config/roles.html).

---

## Ce qui se passe ensuite

Un signalement passe par le même avis privé, du premier message à la publication :

| Étape | Ce que vous obtenez |
|---|---|
| Accusé de réception | La confirmation que le signalement est arrivé, et s'il se reproduit |
| Accepté | Un correctif dans la prochaine version de chaque [version prise en charge](development.html#supported-versions), et un avis publié qui vous mentionne, sauf si vous préférez ne pas être nommé |
| Refusé | Le raisonnement, en général que le comportement exige une autorisation que l'auteur du signalement avait déjà |

Une fois le correctif publié, l'avis est publié et apparaît dans [Avis de sécurité](advisories.html).

---

## Périmètre

La politique trace la limite là où le modèle de rôles la trace :

| Dans le périmètre | Hors périmètre |
|---|---|
| Tout ce qu'un utilisateur connecté peut atteindre au-delà de ce que son rôle lui accorde | Les découvertes qui supposent que le compte admin est déjà compromis : un admin qui exécute n'importe quel playbook, c'est le produit |
| Tout ce qui est accessible sans connexion | Les rapports de scanner sans impact démontré |
| Des identifiants stockés qui deviennent lisibles, ou écrits dans un journal | |
| Une injection dans le shell, la base de données ou le navigateur | |

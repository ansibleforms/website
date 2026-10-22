---
layout: default
title: Obtenir de l'aide
nav_order: 3
translated_from: dfdabe97bba34b6e588429ab17c3c458a136c81c
---

# Obtenir de l'aide
{: .no_toc }

Où poser une question, signaler un bug ou un problème de sécurité, et proposer une amélioration
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avant de demander

La plupart des réponses sont déjà écrites ; un rapide coup d'œil évite souvent un aller-retour :

1. Cherchez sur ce site avec le champ de recherche en haut de chaque page.
2. Cherchez le message d'erreur exact dans [Dépannage](troubleshooting.html), et parcourez la [FAQ](faq.html).
3. Consultez le journal du serveur (**Paramètres**, puis **Journal du serveur**) et la page **Statut**, qui signalent la plupart des problèmes de configuration.
4. Consultez le [Changelog](changelog.html) : le problème est peut-être déjà corrigé dans une version plus récente.

---

## Où aller

Chaque type de demande a son propre endroit, tous sur GitHub :

| Vous voulez | Allez sur |
|---|---|
| Poser une question ou partager une idée | [Discussions](https://github.com/ansibleforms/ansibleforms/discussions) |
| Signaler un bug | [New issue → Bug report](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Proposer une fonctionnalité | [New issue → Feature request](https://github.com/ansibleforms/ansibleforms/issues/new/choose) |
| Signaler un problème de sécurité | [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), en privé |
| Corriger ou améliorer cette documentation | **Modifier cette page sur GitHub** en bas de n'importe quelle page, ou une [issue sur le site web](https://github.com/ansibleforms/website/issues) |

---

## Signaler un bug

Un signalement reproductible est corrigé le plus vite. Le modèle de rapport de bug demande ceci :

* **Version** : affichée sous **À propos** dans le menu d'aide (**?**) de la barre supérieure
* **Déploiement** : Docker, Docker Compose, Kubernetes, l'installateur (et son moteur), une installation native ou depuis les sources
* **Étapes pour reproduire** : ce que vous avez fait, ce que vous attendiez, et ce qui s'est passé à la place
* **Éléments de preuve** : les lignes pertinentes du journal du serveur, et une capture d'écran quand le problème est visible

Pour un problème avec un formulaire, joignez une définition de formulaire minimale qui le montre. Retirez les mots de passe, les jetons, les noms d'hôtes et toute
autre donnée privée des journaux et des formulaires avant de les publier : les issues et les discussions sont publiques.

---

## Signaler un problème de sécurité

**N'ouvrez jamais d'issue publique pour cela :** utilisez [Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new), que seuls les mainteneurs voient.

La [politique de sécurité](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) liste les versions prises en charge et
ce qui se passe après votre signalement.

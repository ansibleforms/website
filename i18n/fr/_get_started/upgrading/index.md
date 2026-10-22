---
layout: default
title: Mise à niveau
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Mise à niveau
{: .no_toc }

Passer AnsibleForms à une version plus récente
{: .fs-6 .fw-300 }

---

Pour les administrateurs d'une instance en service : passer à une version plus récente, avec la méthode utilisée pour l'installer.

---

## Dans cette section

La procédure de mise à niveau dépend de la façon dont vous avez installé AnsibleForms. Chaque méthode est décrite sur sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Passer à la v7](../upgrade-7.html) | Ce qu'il faut changer encore en 6.5, avant de passer à la 7 |
| [Avec l'installateur](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, pour une installation faite par l'installateur : sauvegarde, notes de version et retour arrière |
| [Docker](docker.html) | Récupérer la nouvelle image et recréer le conteneur avec les mêmes paramètres |
| [Docker Compose](docker-compose.html) | Récupérer la nouvelle image et redémarrer le projet docker-compose |
| [Depuis les sources](from-source.html) | Récupérer le nouveau code, le reconstruire et redémarrer l'application |
| [Kubernetes](kubernetes.html) | Rafraîchir le dépôt du chart et lancer `helm upgrade` avec vos valeurs |

{: .note }
> **Sauvegardez d'abord** Faites une sauvegarde avant la mise à niveau (**Paramètres → Sauvegardes**). Le schéma de la base de données est mis à niveau au premier
> démarrage de la nouvelle version, la sauvegarde est donc votre point de retour si quelque chose se passe mal. Depuis la 7.3.0, le worker en fait
> aussi une lui-même avant de mettre à niveau depuis une version plus ancienne, nommée d'après la version, sauf si
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) vaut `0`.

La version que vous recevez dépend du tag d'image que vous utilisez : `latest` suit la version majeure la plus récente, tandis qu'un tag comme `7`
reste sur cette version majeure. Tous les tags sont listés sous [Tags d'image](../installation/#image-tags).

---
layout: default
title: Valeurs par défaut
parent: Apparence
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Valeurs par défaut
{: .no_toc }

Le thème, la langue, le fuseau horaire et le format de date pour les utilisateurs qui n'en ont choisi aucun
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Les valeurs par défaut

**Valeurs par défaut** définit l'apparence de l'application pour un utilisateur qui n'a pas fait son propre choix dans ses
[préférences](../profile/preferences.html) ; le choix propre d'un utilisateur l'emporte toujours :

| Champ | Choix | Sans choix |
|---|---|---|
| **Thème par défaut** | Suivre le navigateur, Clair, Sombre ou Couleur, avec l'une des 12 couleurs pour Couleur | Suivre le navigateur (Clair jusqu'à la 7.2) |
| **Langue par défaut** | Les langues de l'application, conservée dans [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Anglais |
| **Vue des formulaires par défaut** | Tuiles ou Liste, pour la page des formulaires | Tuiles |
| **Fuseau horaire par défaut** | UTC, le navigateur de chaque utilisateur, ou n'importe quel fuseau par son nom | UTC |
| **Format de date par défaut** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` ou `DD.MM.YYYY`, affiché avec la date du jour | `YYYY-MM-DD` |

La langue est une variable d'environnement et s'applique sans redémarrage. Avec
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) à `0`, la page l'affiche en lecture seule.

Depuis la 7.3.0, la page est répartie dans les deux onglets des préférences du profil, **Apparence** (thème, langue et vue des formulaires) et **Date et
heure** (fuseau horaire et format de date, avec un aperçu de l'heure actuelle), et sa zone de recherche liste les résultats sous le nom de chaque onglet.

---

## Suivre le navigateur

Depuis la 7.3.0, **Suivre le navigateur** montre à chaque utilisateur le thème clair ou sombre que demande son navigateur, et change avec lui.

C'est la valeur par défaut quand aucun thème par défaut n'est choisi, si bien qu'une nouvelle installation suit le navigateur. Survoler l'une des couleurs de
**Couleur** donne un aperçu de l'application dans cette couleur ; le thème que vous aviez revient quand le pointeur s'éloigne, et rien n'est conservé avant **Enregistrer**.

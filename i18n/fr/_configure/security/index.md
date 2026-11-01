---
layout: default
title: Sécurité
nav_order: 15
has_children: true
has_toc: false
permalink: /security/
translated_from: e299ab0a4ffb1c12441a3b3fec6eaaef4a19de79
---

# Sécurité
{: .no_toc }

Verrouillez une instance : le compte admin, ses secrets, HTTPS et ce que peuvent faire les utilisateurs et les formulaires
{: .fs-6 .fw-300 }

---

Pour les administrateurs qui préparent une instance pour la production, et pour les revues de sécurité d'une instance existante.

---

## Dans cette section

Chaque thème a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Renforcement](hardening.html) | Le compte admin, les limites de connexion, la base de données, les expressions, les données des jobs, la politique du navigateur, les fonctionnalités facultatives et les options de rôle |
| [HTTPS](https.html) | Où se termine TLS, servir HTTPS depuis l'application, et remplacer le certificat d'exemple |
| [Secrets et chiffrement](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, et la durée de vie des jetons |

Pages liées : [Authentification](../authentication/) pour les méthodes de connexion, [Validation au lancement](../launch-validation/) pour
les vérifications côté serveur de chaque lancement, et les [Variables de sécurité](../customization/security.html).

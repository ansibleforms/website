---
layout: default
title: Variables de sécurité
parent: Variables d'environnement
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Variables de sécurité
{: .no_toc }

Jetons, chiffrement, hôtes REST sortants, masquage et les anciens paramètres VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour définir vos propres secrets de jeton et de chiffrement, et pour limiter ce que les formulaires peuvent appeler et afficher.

---

## Exemple

Vos propres secrets, des appels REST limités à une API et à un réseau interne, et une clé masquée de plus. Dans le `.env` du projet compose :

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Définissez `ENCRYPTION_SECRET` avant que le premier identifiant soit stocké. Depuis la 7.3.0, la définir ou la modifier rechiffre tous les secrets
stockés au démarrage suivant, `ENCRYPTION_SECRET_PREVIOUS` indiquant l'ancienne clé quand c'était la vôtre, voir
[Changer le secret de chiffrement](../security/secrets.html#changing-the-encryption-secret).

---

## Appels REST et jq

Depuis la 7.3.0, les fonctions d'aide REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) vérifient le
certificat de l'endpoint qu'elles appellent, comme toute autre connexion ; jusqu'à la 7.2.0, elles ne le faisaient jamais. Trois paramètres s'y appliquent :

| Variable | Défaut | Effet |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` saute la vérification du certificat : uniquement pour les endpoints avec un certificat auto-signé |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Combien de temps un appel REST attend une réponse avant d'échouer sur un délai dépassé |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Combien de temps un filtre jq peut s'exécuter avant d'être arrêté ; la sortie de jq est aussi plafonnée à 64 Mo |

Les trois prennent effet à l'enregistrement, sans redémarrage. Pour un endpoint dont le certificat est signé par une CA privée, laissez la vérification active
et fournissez plutôt cette CA à Node.js : définissez `NODE_EXTRA_CA_CERTS` sur un fichier PEM qui la contient dans l'environnement de l'application, puis redémarrez l'application.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="security" %}

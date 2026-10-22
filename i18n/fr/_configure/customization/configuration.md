---
layout: default
title: Configuration
parent: Variables d'environnement
nav_order: 5
translated_from: f460336cad995f3fd6cb5a2e4667e4c1a3b67a2b
---

# Configuration
{: .no_toc }

Le seed de configuration, l'endroit où la configuration est conservée, git et ytt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les pour décider d'où vient la configuration : un seed de configuration, la base de données, git ou des modèles ytt.

---

## Exemple

Appliquer un seed de configuration monté, le vérifier toutes les cinq minutes, et conserver `config.yaml` dans la base de données. Dans `docker-compose.yml` :

```yaml
    environment:
      - CONFIG_SEED_PATH=/seed/seed.yaml
      - CONFIG_SEED_RELOAD_SECONDS=300
      - ENABLE_CONFIG_IN_DATABASE=1
      - ALLOW_ENV_EDIT=0              # the environment is declared here, not on the settings pages
    volumes:
      - ./seed:/seed:ro
```

Un seed invalide empêche le serveur de démarrer. Voir [Seed de configuration](../seed/) pour le format du fichier.

---

## D'où config.yaml est lu

Les catégories, les rôles et les constantes proviennent de `config.yaml` sur le disque ou de sa copie dans la base de données, selon cet ordre :

1. [`ENABLE_CONFIG_IN_DATABASE`](#env_ENABLE_CONFIG_IN_DATABASE), quand elle est définie, dans l'environnement ou dans
   l'onglet **Configuration** de la page de paramètres : `1` lit la base de données, `0` lit le fichier.
2. Sinon, la source de configuration stockée dans la base de données (`file` ou `database`), que les instances mises en place
   avant la 6.3.0 choisissaient sur la page de paramètres.
3. Sinon, le fichier : le `config.yaml` du dépôt avec **Utiliser pour la configuration** activé, à défaut celui d'un dépôt avec
   **Utiliser pour les formulaires** activé, à défaut celui de [`CONFIG_PATH`](paths.html#env_CONFIG_PATH).

Une `ENABLE_CONFIG_IN_DATABASE` définie explicitement l'emporte toujours, même `0` sur un `database` stocké. Elle est lue à chaque chargement de la
configuration, si bien qu'une modification s'applique sans redémarrage. La page **Statut** montre la source utilisée dans son onglet **Informations**.

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="configuration" %}

---
layout: default
title: Serveur et base de données
parent: Variables d'environnement
nav_order: 1
translated_from: 0e4bba71dd8dd8efdf5ed7ff9c9644b1c0a89185
---

# Serveur et base de données
{: .no_toc }

Le serveur web, la connexion MySQL, le compte admin, et ce qu'exécute chaque processus (AF_ROLE et les variables RTE_*)
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Modifiez-les quand l'application tourne derrière un reverse proxy, sur un autre port, ou avec une base de données hors du projet compose.

---

## Exemple

Derrière un reverse proxy qui termine TLS, sous `/ansibleforms`, avec un MySQL externe. Dans `docker-compose.yml` :

```yaml
    environment:
      - BASE_URL=/ansibleforms        # the proxy forwards /ansibleforms/ unchanged
      - HTTPS=0                       # the proxy terminates TLS
      - PORT=8000
      - DB_HOST=mysql.example.com
      - DB_PORT=3306
      - DB_USER=ansibleforms
      - DB_PASSWORD=change-me
```

Elles remplacent les lignes `DB_*` et `PORT` que le fichier compose a déjà à cet endroit, et qui l'emportent sur les mêmes noms dans `.env`. Retirez
le service `mysqldb` et le `depends_on` qui l'attend, et mappez le port 8000 dans `ports`. Le côté proxy est décrit sur la page
[Reverse proxy](../production/reverse-proxy.html).

---

## Variables

Toutes les variables de ce groupe, avec leur type, leur valeur par défaut et leur description :

{% include env_vars_table.html group="server" %}

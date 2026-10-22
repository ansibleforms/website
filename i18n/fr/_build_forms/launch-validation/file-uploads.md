---
layout: default
title: Envois de fichiers
parent: Validation au lancement
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Envois de fichiers
{: .no_toc }

Comment les champs fichier sont validés
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un champ fichier ne fait jamais confiance à ce que la requête de lancement dit d'un fichier. La validation au lancement vérifie le fichier lui-même, sur le
disque du serveur.

---

## Comment un envoi parvient à un job

Un fichier est envoyé avant le lancement du formulaire, en deux étapes :

1. Le navigateur envoie le fichier avec `POST /api/v2/job/upload`. Le serveur le stocke dans `UPLOAD_PATH`.
2. La requête de lancement décrit cet envoi dans sa partie `files`.

La validation au lancement compare ensuite la description au disque :

* Le fichier doit exister dans `UPLOAD_PATH`.
* Son chemin et sa taille sont lus sur le disque, jamais dans la requête.

---

## Ce qui est accepté

Un champ fichier ne reçoit de valeur que d'un envoi vérifié. Tout le reste est écarté :

* Un chemin que l'appelant écrit dans `rawFormData` ou `extravars` est ignoré.
* Un champ fichier obligatoire sans envoi réel est signalé comme `missing`.

---

## Règles de fichier

Les règles d'un champ fichier sont vérifiées sur l'envoi réel, avec des tailles en octets :

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` et `maxSize` comparent la taille réelle du fichier, et `regex` son nom. Indépendamment de tout formulaire,
`UPLOAD_MAX_GB` plafonne la taille d'un envoi (10 Go par défaut).

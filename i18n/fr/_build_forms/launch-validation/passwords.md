---
layout: default
title: Mots de passe
parent: Validation au lancement
nav_order: 5
translated_from: 2fc2d2e8cdd997efaf221bd8e0114df2a4ee873e
---

# Mots de passe
{: .no_toc }

Comment les champs mot de passe sont validés, stockés et tenus à l'écart des API
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un champ mot de passe est validé comme n'importe quel autre champ. Sa valeur, en revanche, reste sur le serveur et n'est jamais renvoyée à
un client.

---

## Où un mot de passe est conservé

Le serveur stocke le mot de passe avec le job, dans ses extravars :

* Une **approbation** peut alors poursuivre le job avec le mot de passe que l'utilisateur a saisi.
* Une **relance à l'identique** peut le rejouer, quand la validation au lancement n'est pas `enforce`.

Le mot de passe stocké n'est utilisé que sur le serveur.

---

## Ce que renvoient les API

Aucune API ne renvoie jamais un mot de passe :

* Un job lu via l'API REST ou le `get_job` du serveur MCP masque tous les champs `password` de son formulaire, y compris dans
  les lignes de liste et les sous-formulaires YAML.
* `MASK_EXTRAVARS_REGEX` (par défaut `password|secret|token`) masque aussi toute extravar dont le nom correspond, pour
  les secrets qui ne sont pas des champs mot de passe.

---

## Ce que reçoit une relance

Pour pré-remplir une relance, le navigateur reçoit les données brutes du formulaire du job. Ces données ne contiennent jamais de mot de passe, pas même dans
les lignes de liste ou les sous-formulaires YAML : l'utilisateur saisit donc de nouveau le mot de passe.

Un champ mot de passe que les dépendances du formulaire masquent n'est pas nécessaire et n'a pas à être saisi de nouveau.

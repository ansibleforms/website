---
layout: default
title: Modification et audit
parent: Seed de configuration
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Modification et audit
{: .no_toc }

Verrouiller les pages de paramètres, et ce qu'enregistre le journal d'audit
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Désactiver la modification de l'environnement

`ALLOW_ENV_EDIT=0` met les pages de paramètres en lecture seule. Chaque variable reste affichée avec
la valeur en vigueur et la raison pour laquelle elle ne peut pas être modifiée, et l'endpoint d'enregistrement répond par
403.

Utilisez-la chaque fois que l'environnement est déclaré ailleurs. Sinon, la page de paramètres écrit
`persistent/.env`, qui sur un volume éphémère est perdu sans bruit au redémarrage suivant, et sur
un volume durable s'écarte du manifeste censé faire foi.

{: .note }
> Les sauvegardes incluent `persistent/.env` sous le nom `managed.env`, si bien qu'une reconstruction récupère les paramètres de base de données et
> de chemins. **`ENCRYPTION_SECRET` et `ACCESS_TOKEN_SECRET` en sont retirés** :
> le dump à côté contient chaque identifiant stocké sous forme de texte chiffré AES, et écrire la clé qui
> le déchiffre dans le même dossier suffirait, avec une copie de la sauvegarde, à tous les lire. Définissez
> plutôt ces deux variables sur l'hôte cible ; un commentaire dans le fichier l'indique.
>
> Ce qui reste peut encore contenir des identifiants (`DB_PASSWORD`, `METRICS_TOKEN`, un ancien `VAULT_TOKEN`), le fichier est donc
> écrit en `0600`. Le restaurer est une étape à part, sur demande, et non une partie d'une restauration normale,
> car l'hôte de base de données et les chemins qu'il contient décrivent la machine d'où provient la sauvegarde. La
> boîte de dialogue de restauration liste le fichier et propose son propre bouton *Restaurer l'environnement*
> (`POST /api/v2/backup/:folder/restore-env`), qui conserve le fichier précédent sous `.env.bak`.

---

## Ce qui est enregistré

Chaque application qui change quelque chose écrit une entrée `seed.apply` dans le journal d'audit, qui nomme
les objets créés, mis à jour, libérés et purgés. Les valeurs ne sont jamais enregistrées, car la plupart
sont des secrets. Une application sans effet n'écrit rien, ce qui garde la piste pertinente. Une
vérification qui trouve le fichier inchangé est sans effet, si bien que la piste ne gagne pas une ligne par minute.

Une application demandée via l'endpoint est volontairement enregistrée deux fois, et les deux lignes
enregistrent des choses différentes : `config-seed.apply.create` indique **qui** l'a demandée, `seed.apply`
**ce qu'**elle a changé.

La page Statut rend compte du seed deux fois : une **vérification** que le fichier est toujours lisible et s'analyse,
et que le dernier rechargement a réussi, et une ligne d'**informations** indiquant combien d'enregistrements il
possède actuellement. La vérification est le seul endroit qui signale quand le fichier sur le disque et la configuration
en vigueur ont divergé, car un rechargement échoué laisse l'instance tourner.

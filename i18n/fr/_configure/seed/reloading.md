---
layout: default
title: Rechargement et démarrage
parent: Seed de configuration
nav_order: 3
translated_from: 6cb646436cb2361c1ad2402e0d57b5b56c934630
---

# Rechargement et démarrage
{: .no_toc }

Modifier le fichier sans redémarrage, et ce qui se passe au démarrage
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Modifier le fichier sans redémarrer

Le seed est relu par la tâche système **Rechargement du config seed**, toutes les minutes par défaut, et
réappliqué quand son contenu a changé. Une modification commitée dans git atteint donc
automatiquement une instance en cours d'exécution : sur Kubernetes, une `ConfigMap` est remontée sous le pod en
une minute environ, et la vérification suivante la prend en compte. Il n'y a ni rollout ni redémarrage, et aucun
hook n'a besoin d'appeler quoi que ce soit.

Depuis la 7.8.0, sa planification est un cron à 5 champs dans `CONFIG_SEED_RELOAD_CRON` (`* * * * *` par défaut), défini sur la page
de la tâche sous **Jobs > Système** (voir [Jobs](../jobs/)) ou dans l'environnement. Sans `CONFIG_SEED_PATH`, la tâche est désactivée.

`CONFIG_SEED_RELOAD_SECONDS`, son paramètre d'avant, est déprécié depuis la 7.8.0 et supprimé dans la 8. Il est encore lu tant que
`CONFIG_SEED_RELOAD_CRON` n'est pas défini, avec un avertissement dans le journal au démarrage : `60` se lit comme `* * * * *`, un
multiple de 60 jusqu'à 3600 comme toutes les N minutes, et `0` désactive toujours le rechargement. Définissez plutôt `CONFIG_SEED_RELOAD_CRON`.

Pour un fichier inchangé, la vérification calcule un hash et s'arrête, si bien qu'elle ne réécrit jamais une ligne qu'elle a
déjà appliquée.

Pour appliquer le fichier immédiatement au lieu d'attendre la vérification suivante, utilisez l'un des deux :

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Les deux **forcent** une application même quand le fichier n'a pas changé. Une application forcée réimpose un
enregistrement géré qui a été modifié directement dans la base de données, et reclone un dépôt déclaré
dont l'arbre de travail manque.

{: .note }
> Un rechargement n'est **jamais fatal**, contrairement à l'application au démarrage. Une instance qui sert déjà
> garde sa configuration actuelle, la raison est journalisée, et la ligne *Seed de configuration*
> de la page Statut passe au rouge et la nomme. Une coquille poussée dans git ne doit pas pouvoir faire tomber
> une instance en cours d'exécution sans la moindre action d'un opérateur.
>
> Le même contenu cassé n'est pas non plus retenté à chaque vérification ; sinon, une seule mauvaise modification
> écrirait indéfiniment la même erreur dans le journal. Corrigez le fichier, ou appelez l'endpoint pour réessayer
> immédiatement.

---

## Un seed cassé refuse de démarrer

Un fichier illisible, un YAML invalide, un champ inconnu, un nom en double ou une
`${VARIABLE}` non résolue fait **quitter** le serveur au lieu de démarrer. Cela ne concerne que le chemin du **démarrage** :
voir la note ci-dessus pour ce que le même fichier fait à une instance déjà lancée.

C'est voulu. Continuer avec la configuration précédente laisserait une instance dont le
comportement ne correspond plus au manifeste censé la décrire, sans que rien ne
signale l'écart. La raison est écrite sur la sortie d'erreur standard ainsi que dans le fichier de journal, si bien que
`kubectl logs` et `docker logs` l'affichent.

La validation est stricte : les champs inconnus sont rejetés au lieu d'être ignorés, et l'erreur nomme
la clé fautive :

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Une base de données vide se provisionne elle-même

Avec `ALLOW_SCHEMA_CREATION` activée (par défaut), une base de données qui ne contient **aucune table
AnsibleForms** voit son schéma créé au démarrage. Un nouveau déploiement démarre donc
sans que personne n'ait à appeler manuellement l'endpoint `/schema`.

La condition est volontairement stricte : créer le schéma **supprime d'abord toutes les tables**, si bien
qu'elle ne s'exécute jamais que sur une base de données complètement vide. Une base de données à laquelle il manque
une colonne, ou qui a des tables mais aucun compte utilisateur, n'est *pas* vide et est laissée intacte ;
les patchs du schéma traitent ces cas.

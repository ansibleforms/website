---
layout: default
title: Rechargement et démarrage
parent: Seed de configuration
nav_order: 3
translated_from: c3925e2d8707d37ed572380de4f675615ca31a05
---

# Rechargement et démarrage
{: .no_toc }

Modifier le fichier sans redémarrage, et ce qui se passe au démarrage
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Modifier le fichier sans redémarrer

La tâche système **Rechargement du config seed** relit le seed chaque minute, et le réapplique quand son contenu a changé. Une modification commitée dans git atteint donc
automatiquement une instance en cours d'exécution : sur Kubernetes, une `ConfigMap` est remontée sous le pod en
une minute environ, et la vérification suivante la prend en compte. Il n'y a ni rollout ni redémarrage, et aucun
hook n'a besoin d'appeler quoi que ce soit.

Pour un fichier inchangé, la vérification calcule un hash et s'arrête, si bien qu'elle ne réécrit jamais une ligne qu'elle a
déjà appliquée.

Depuis la 7.8.0, la vérification suit un cron, [`CONFIG_SEED_RELOAD_CRON`](../customization/configuration.html#env_CONFIG_SEED_RELOAD_CRON)
(`* * * * *` par défaut), qu'un admin modifie aussi sur la page de la tâche sous **Jobs > Système** (voir
[Tâches système](../jobs/system-tasks.html)). Elle remplace `CONFIG_SEED_RELOAD_SECONDS`, obsolète et encore lue tant que le cron n'est
pas défini : son `0` désactive toujours le rechargement.

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

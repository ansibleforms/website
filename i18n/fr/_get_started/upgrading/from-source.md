---
layout: default
title: Depuis les sources
parent: Mise à niveau
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Depuis les sources
{: .no_toc }

Mettre à niveau une installation construite depuis les sources
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Une installation construite depuis les sources se met à niveau en récupérant la nouvelle version, en la reconstruisant et en redémarrant
l'application. Vos paramètres, formulaires, playbooks, certificats et journaux sont stockés dans `server/persistent`, que Git et la
construction ne modifient pas.

---

## Avant la mise à niveau

Préparez la mise à niveau pour pouvoir revenir en arrière si quelque chose se passe mal :

* **Faites une sauvegarde** sous **Paramètres → Sauvegardes**. La nouvelle version met à niveau le schéma de la base de données à son premier démarrage.
* **Lisez le [changelog](../changelog)** des versions entre la vôtre et la nouvelle.
* **Vous passez à une nouvelle version majeure ?** Suivez d'abord [Passer à la v7](../upgrade-7.html).
* **Vérifiez la version de Node.js** que demande la nouvelle version, dans le changelog.

---

## 1. Récupérer la nouvelle version

Récupérez les tags de version et passez sur la version souhaitée. Les tags de version portent le numéro de version, et `git tag` les
liste ; la branche `main` peut contenir des changements qui ne sont pas encore publiés :

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Reconstruire

Reconstruisez avec les trois mêmes étapes qu'à l'installation. Reconstruisez d'abord le client :

```bash
cd client
npm ci
npm run build
```

Mettez ensuite à jour les dépendances du serveur :

```bash
cd ../server
npm ci --omit=dev
```

Enfin, copiez à nouveau le client reconstruit dans le dossier `views` du serveur :

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Comparez `.env.example`, à la racine du dépôt, avec votre `persistent/.env` pour reprendre les paramètres que la version ajoute.

---

## 3. Redémarrer

Redémarrez l'application et son RTE pour charger le nouveau code. Le schéma de la base de données est mis à niveau au premier démarrage :

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Si vous venez de la 7.2, le RTE tournait en mode base de données, avec les paramètres de base de données et `RTE_URL`, obsolète en 7.3.0 et supprimé en 8.0.0.
Redémarrez-le en mode entrant, et déclarez son runner avec un identifiant RTE dans le seed ou sous **Connexions → Runners**, comme le montre
l'[installation](../installation/from-source.html#run) : `pm2 delete ansibleforms-rte`, puis sa commande `pm2 start`.

Si vous faites tourner l'application sans PM2, arrêtez `npm run start` et relancez-le.

---

## 4. Vérifier la mise à niveau

Suivez le journal de l'application pendant son démarrage :

```bash
pm2 logs ansibleforms
```

Dans AnsibleForms, **Aide → À propos** affiche la version en cours d'exécution, et **Paramètres → Statut** affiche l'état de santé de la
base de données, du schéma et des autres systèmes dont AnsibleForms dépend.

---

## Revenir en arrière

Pour revenir à la version que vous utilisiez avant, celle qu'affichait **Aide → À propos** avant la mise à niveau, passez sur son tag avec
`git checkout <version>`, puis reconstruisez et redémarrez comme aux étapes 2 et 3. Si cette version ne démarre pas sur la base de données mise à niveau, restaurez la sauvegarde faite sous
**Paramètres → Sauvegardes**.

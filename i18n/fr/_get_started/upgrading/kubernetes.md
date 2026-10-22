---
layout: default
title: Kubernetes
parent: Mise à niveau
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Mettre à niveau une installation faite avec le chart Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Chaque version du chart déploie une version d'AnsibleForms. Une mise à niveau installe une version plus récente du chart avec vos valeurs existantes ;
les données des volumes persistants sont conservées. Une mise à niveau qui ne change rien laisse les pods intacts.

---

## Avant la mise à niveau

Préparez la mise à niveau pour pouvoir revenir en arrière si quelque chose se passe mal :

* **Faites une sauvegarde** sous **Paramètres → Sauvegardes**. La nouvelle version met à niveau le schéma de la base de données à son premier démarrage.
* **Lisez le [changelog](../changelog)** des versions entre la vôtre et la nouvelle.
* **Vous passez à une nouvelle version majeure ?** Suivez d'abord [Passer à la v7](../upgrade-7.html).
* **Lisez le [changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) du chart** pour les changements des valeurs.
* **Avec des identifiants générés** (`secrets.generate`), sauvegardez le Secret `<release>-secrets` : `ENCRYPTION_SECRET` ne peut pas être récupéré.
* **Vous venez de la 7.2 ?** Le RTE du pod serveur change de mode : voir [De la 7.2 à la 7.3](#from-72-to-73).

---

## De la 7.2 à la 7.3

Le chart 7.3.0 sort le RTE placé à côté de l'application du mode base de données, obsolète en 7.3.0 et supprimé en 8.0.0. L'application l'appelle sur
`127.0.0.1` et garde un WebSocket ouvert (`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)) :

* Le conteneur RTE ne reçoit plus `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` ni `RTE_URL`, et prend les fichiers du job sur
  le volume partagé (`RTE_FILES=local`)
* Le seed de configuration du chart déclare un identifiant RTE avec le jeton et l'adresse, et le runner, `rte_mode: inbound`, qui s'authentifie
  avec. Avec le seed du chart, il n'y a rien à faire
* Avec `containers.rte.seedRunner: false`, ou un seed de configuration à vous (`CONFIG_SEED_PATH`), le RTE ne s'ajoute plus lui-même comme runner.
  Déclarez-le vous-même, dans votre seed ou sous **Connexions → Runners** : un identifiant RTE avec `http://127.0.0.1:<port>` et le jeton,
  et un runner de type RTE avec `rte_mode: inbound` qui le nomme. Les notes que Helm affiche après la mise à niveau montrent comment faire

Depuis la 7.3.0, le chart installe aussi un Runner à part, avec `runner.enabled` (voir
[Un Runner sur Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Trouver la nouvelle version du chart

Rafraîchissez le dépôt du chart et listez les versions disponibles :

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Mettre à niveau la release

Lancez la même commande `helm upgrade` qu'à l'installation, avec votre fichier de valeurs et la nouvelle version du chart :

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Avec le registre OCI, utilisez `oci://ghcr.io/ansibleforms/charts/ansibleforms` comme chart.

---

## 3. Vérifier la mise à niveau

Attendez les nouveaux pods, puis lancez le test du chart, qui vérifie à la fois le serveur web et la connexion à la base de données :

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

Dans AnsibleForms, **Aide → À propos** affiche la version en cours d'exécution, et **Paramètres → Statut** affiche l'état de santé de la
base de données, du schéma et des autres systèmes dont AnsibleForms dépend.

---

## Revenir en arrière

Helm conserve l'historique de la release. Pour revenir à la révision précédente :

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Si elle ne démarre pas sur la base de données mise à niveau, restaurez votre sauvegarde (voir le [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) du chart).

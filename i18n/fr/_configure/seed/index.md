---
layout: default
title: Seed de configuration
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 030ff83b1d7c3920600b7e0668b05ab24b949b67
---

# Seed de configuration
{: .no_toc }

Déclarez les objets d'administration dans un fichier
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Pour les administrateurs qui provisionnent depuis git : déclarez les objets d'administration dans un fichier, pour qu'une instance puisse être reconstruite sur une base de données vide.

---

## Ce qu'il couvre

Mettez dans `CONFIG_SEED_PATH` le chemin d'un fichier YAML, et AnsibleForms l'applique au démarrage. Le fichier
déclare des objets qui n'existaient auparavant que dans la base de données :

| Section                 | Ce qu'elle déclare                                                  |
|-------------------------|---------------------------------------------------------------------|
| `runners`               | Où s'exécutent les jobs : RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins |
| `secret_stores`         | Les coffres de secrets (HashiCorp Vault, ...)                       |
| `credentials`           | Les identifiants                                                    |
| `oauth2`                | Les fournisseurs SSO : Entra ID et OIDC                             |
| `repositories`          | Les dépôts Git                                                      |
| `syslog_servers`        | Les serveurs syslog qui reçoivent le journal du serveur et les entrées d'audit |
| `notification_channels` | Les serveurs mail, Slack, Teams, Telegram et les webhooks pour les notifications |
| `labels`                | Les étiquettes à côté du logo de l'en-tête, depuis la 7.3.0          |
| `ldap`                  | La configuration LDAP                                               |
| `settings`              | L'URL publique, et les paramètres mail utilisés quand aucun canal mail n'est actif |
| `chat`                  | Le fournisseur de modèle de l'assistant de chat                     |
| `awx`                   | Déprécié depuis la 7, supprimé dans la 8 : utilisez `runners` avec `type: awx` |

Un seed écrit avant la 7 continue de fonctionner : chaque élément de sa section `awx` est appliqué comme un runner de type `awx`, et le journal
avertit à chaque application. Déplacez ces éléments sous `runners` avec `type: awx` avant de passer à la 8.

Le seed n'est **pas** la même chose que `config.yaml`, qui contient les catégories, les rôles et les constantes
et a son propre `CONFIG_PATH`. Les deux sont volontairement séparés : le
dépôt qui *contient* `config.yaml` fait partie des objets que déclare le seed, le seed
ne peut donc pas se trouver à l'intérieur.

Les utilisateurs et les groupes sont laissés de côté : ils viennent de LDAP ou du SSO, et le premier admin de `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

## Dans cette section

Chaque thème a sa propre page :

| Page | Ce qu'elle couvre |
|---|---|
| [Exemple](example.html) | Un fichier seed complet, section par section |
| [Objets gérés](managed-objects.html) | Comment le seed possède les objets qu'il liste, et comment il garde les secrets à l'écart |
| [Rechargement et démarrage](reloading.html) | Modifier le fichier sans redémarrage, et ce qui se passe au démarrage |
| [Kubernetes](kubernetes.html) | Provisionner AnsibleForms depuis une ConfigMap et des Secrets |
| [Modification et audit](environment-and-audit.html) | Verrouiller les pages de paramètres, et ce qu'enregistre le journal d'audit |

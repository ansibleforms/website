---
layout: default
title: Seed de configuration
nav_order: 4
has_children: true
has_toc: false
permalink: /seed/
translated_from: 45ee9fce4b7686786567d06efd6eceddf3ab4c76
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

Mettez dans `CONFIG_SEED_PATH` le chemin d'un fichier YAML, et AnsibleForms l'applique au démarrage. Le fichier déclare des objets et
des paramètres qui sinon n'existent que dans la base de données :

| Section            | Ce qu'elle déclare                                                                |
|--------------------|-----------------------------------------------------------------------------------|
| `runners`          | Où s'exécutent les jobs : RTE, AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins  |
| `secret_stores`    | Les coffres de secrets (HashiCorp Vault, ...)                                     |
| `credentials`      | Les identifiants                                                                  |
| `databases`        | Les bases de données que les formulaires interrogent, chacune avec son identifiant, depuis la 7.5.0 |
| `sso`              | Les fournisseurs SSO : Entra ID et OIDC (`oauth2` avant la 7.8.0)                 |
| `repositories`     | Les dépôts Git, et ce que l'application lit dans chacun                           |
| `syslog`           | Les serveurs syslog qui reçoivent le journal du serveur et les entrées d'audit (`syslog_servers` avant la 7.8.0) |
| `notifications`    | Les serveurs mail, Slack, Teams, Telegram et les webhooks (`notification_channels` avant la 7.8.0) |
| `labels`           | Les étiquettes à côté du logo de l'en-tête, depuis la 7.3.0                        |
| `ldap`             | La configuration LDAP                                                             |
| `settings`         | L'URL publique ; ses clés mail sont dépréciées depuis la 7.6.0, au profit d'un canal mail |
| `chat_assistant`   | Le fournisseur de modèle de l'assistant de chat (`chat` avant la 7.8.0)           |
| `users`            | Les utilisateurs, locaux et d'un annuaire, depuis la 7.8.0                        |
| `groups`           | Les groupes locaux et leurs membres, depuis la 7.8.0                              |
| `defaults`         | **Paramètres > Apparence > Valeurs par défaut** : thème, langue, fuseau horaire, depuis la 7.8.0 |
| `logo`, `icon`     | Le logo et l'icône du site, des fichiers image à côté du seed, depuis la 7.8.0    |
| `name`             | Le nom de l'application, depuis la 7.8.0                                          |
| `links`            | Les liens de l'en-tête, et si le lien du Designer s'affiche, depuis la 7.8.0      |
| `announcements`    | Les annonces sous l'en-tête, depuis la 7.8.0                                      |
| `disclaimer`       | Les versions de l'avertissement que les utilisateurs acceptent, depuis la 7.8.0   |
| `mcp`              | Les interrupteurs du serveur MCP, depuis la 7.8.0                                 |
| `ssh`              | La clé privée SSH de l'application et ses hôtes connus, depuis la 7.8.0           |
| `awx`              | Déprécié depuis la 7, supprimé dans la 8 : utilisez `runners` avec `type: awx`    |

L'[Exemple](example.html) montre chaque section, et [Objets gérés](managed-objects.html) jusqu'où le seed possède ce que chacune
déclare : la plupart des sections mettent leurs objets en lecture seule dans l'application, quelques-unes ne font que les créer ou les modifier.

Un seed écrit avant la 7 continue de fonctionner : chaque élément de sa section `awx` est appliqué comme un runner de type `awx`, et le journal
avertit à chaque application. Déplacez ces éléments sous `runners` avec `type: awx` avant de passer à la 8.

Le seed n'est **pas** la même chose que `config.yaml` (`CONFIG_PATH`), la configuration de base des catégories, des rôles et des
constantes. Un dépôt peut les contenir à sa place, et ce dépôt fait partie des objets que déclare le seed, qui ne peut donc pas s'y trouver.

Le premier admin vient toujours de `ADMIN_USERNAME` / `ADMIN_PASSWORD`, et les utilisateurs LDAP ou SSO de leur annuaire à la connexion.
Depuis la 7.8.0, les sections `users` et `groups` peuvent ajouter des utilisateurs et des groupes locaux, et bloquer un utilisateur d'annuaire avant sa connexion.

---

## Sections renommées

Depuis la 7.8.0, quatre sections portent le nom des clés sous lesquelles un [dépôt git](../repositories/) contient les mêmes objets,
sans `controller_` (`sso:` pour `controller_sso:`) :

| Avant la 7.8.0            | Depuis la 7.8.0    |
|---------------------------|--------------------|
| `oauth2:`                 | `sso:`             |
| `syslog_servers:`         | `syslog:`          |
| `notification_channels:`  | `notifications:`   |
| `chat:`                   | `chat_assistant:`  |

Leurs éléments ne changent pas. Les anciens noms sont toujours lus, dépréciés depuis la 7.8.0 et supprimés dans la 8 : chacun appliqué
journalise un avertissement dans le journal du serveur, qui indique le nouveau nom. Un seed qui donne une section sous ses deux noms est
refusé. Renommez-les dans le fichier avant de passer à la 8.

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

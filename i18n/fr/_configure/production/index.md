---
layout: default
title: Exploitation en production
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# Exploitation en production
{: .no_toc }

Publiez, sauvegardez et surveillez une instance dont des personnes dépendent
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Avant la mise en service

Les valeurs par défaut permettent de lancer rapidement une instance, mais plusieurs d'entre elles ne servent qu'à un premier aperçu. AnsibleForms
journalise un avertissement `[SECURITY]` au démarrage quand `ENCRYPTION_SECRET` ou `ACCESS_TOKEN_SECRET` n'est pas défini, et la
page **Statut** rend compte des sauvegardes, des paramètres de conservation et du filtre d'expressions.

---

## Liste de contrôle de production

Passez ces points en revue une fois avant que des utilisateurs dépendent de l'instance, puis à nouveau après une mise à jour majeure :

| Point | Que faire | Détails |
|------|------------|---------|
| Mot de passe admin | Changez le mot de passe du compte admin local | [Renforcement](../security/hardening.html#the-admin-account) |
| Secret de chiffrement | Définissez [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) avant de stocker le moindre identifiant | [Secrets et chiffrement](../security/secrets.html#the-two-master-secrets) |
| Secret des jetons | Définissez [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), pour que les sessions survivent à un redémarrage | [Secrets et chiffrement](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Terminez TLS avec votre propre certificat, pas celui d'exemple | [HTTPS](../security/https.html) |
| Reverse proxy | Publiez l'instance derrière un proxy, éventuellement sous [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Reverse proxy](reverse-proxy.html) |
| Endpoint de schéma | Mettez [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) à `0` une fois le schéma créé | [Renforcement](../security/hardening.html#the-database) |
| Appels sortants | Restreignez les expressions REST avec [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Renforcement](../security/hardening.html#expressions-and-outbound-calls) |
| Fonctionnalités facultatives | Laissez MCP et l'assistant de chat désactivés sauf si vous les utilisez | [Renforcement](../security/hardening.html#optional-features) |
| Sauvegardes | Vérifiez que la sauvegarde nocturne fonctionne, et copiez-la hors de l'hôte | [Sauvegardes](backups.html) |
| Conservation | Décidez combien de temps les jobs et les entrées d'audit sont conservés | [Journaux](logs.html#retention) |

---

## Dans cette section

Chaque thème a sa propre page ; la sécurisation de l'instance est traitée dans [Sécurité](../security/) :

| Page | Ce qu'elle couvre |
|---|---|
| [Reverse proxy](reverse-proxy.html) | Publier AnsibleForms derrière Nginx, Traefik ou Apache, à la racine ou sous un sous-chemin |
| [Sauvegardes](backups.html) | Les sauvegardes nocturnes, leur contenu, les restaurations, et ce qu'il faut conserver d'autre |
| [Journaux](logs.html) | Les fichiers de journaux, syslog, la piste d'audit, et la conservation des jobs et des entrées d'audit |
| [Mise à l'échelle](scaling.html) | Plusieurs nœuds d'application avec un worker ; le RTE a sa propre section, [Environnements d'exécution](../rte/) |
| [Supervision](monitoring.html) | Les sondes de santé, les métriques Prometheus et la page Statut |

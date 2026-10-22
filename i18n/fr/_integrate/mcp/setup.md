---
layout: default
title: Configuration
parent: Serveur MCP
nav_order: 1
translated_from: 700a4267f3326788b8c7e4dcd9ce0b2544b0b17f
---

# Configuration
{: .no_toc }

Activer le serveur et authentifier le client
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## L'activer

Mettez [`ENABLE_MCP`](../customization/features.html#env_ENABLE_MCP) à `1`, ou activez-le sous **Paramètres > Connexions > MCP**
(voir [La page MCP](#the-mcp-page)). Modifié sur la page des paramètres, l'interrupteur s'applique immédiatement, sans redémarrage. Tant qu'il est
désactivé, l'endpoint répond `404`. L'endpoint est :

```
POST <your url>/api/v2/mcp
```

Il utilise du Streamable HTTP sans état avec des réponses JSON simples, `GET` et `DELETE` renvoient donc 405.

---

## Limiter ce que les agents peuvent faire

Deux autres interrupteurs restreignent le serveur MCP pour tous les clients. Comme `ENABLE_MCP`, ils s'appliquent sans redémarrage :

| Variable | Avec `1` |
|---|---|
| [`MCP_READ_ONLY`](../customization/features.html#env_MCP_READ_ONLY) | Le serveur ne propose aucun des outils qui lancent, planifient ou modifient (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job`, `delete_stored_job`), et les refuse. Les agents peuvent lister, lire et remplir des formulaires, lire les planifications et les jobs enregistrés, et suivre les jobs, mais ne lancent ni ne modifient rien : une façon sûre d'essayer un agent. |
| [`MCP_CHAT_FORMS_ONLY`](../customization/features.html#env_MCP_CHAT_FORMS_ONLY) | Les agents ne voient que les formulaires qui définissent `enableForChat: true`, la même liste que pour l'[assistant de chat](../chat/). Tout autre formulaire, et tout job de l'un d'eux, répond comme introuvable. |

Les deux sont désactivés par défaut : les agents voient chaque formulaire que les rôles de l'utilisateur autorisent, et peuvent les lancer.

---

## La page MCP

**Paramètres > Connexions > MCP** contient les paramètres du serveur MCP dans deux onglets.

- **Général** a les trois interrupteurs, `ENABLE_MCP`, `MCP_READ_ONLY` et `MCP_CHAT_FORMS_ONLY`, enregistrés avec **Enregistrer**. Les deux
  autres ne peuvent être modifiés que lorsque le serveur MCP est activé.
- **Configuration du client** affiche le **Point de terminaison**, avec un bouton pour le copier, et une configuration prête pour **Claude Code**
  (`.mcp.json`, ou une commande `claude mcp add`), **Cursor** (`~/.cursor/mcp.json`), **VS Code** (`.vscode/mcp.json`, qui demande
  le jeton au premier démarrage du serveur) et **Codex** (`~/.codex/config.toml`, avec le jeton dans la
  variable d'environnement `ANSIBLEFORMS_TOKEN`). Chacune a son bouton de copie ; remplacez `<your-token>` par un jeton à vous, créé
  avec le lien **Créer un jeton**.

L'endpoint est construit à partir de l'URL de l'application (**Paramètres > URL**) quand elle est définie, sinon à partir de l'adresse du navigateur.

---

## Authentification

Chaque requête a besoin d'un jeton d'accès AnsibleForms :

```
Authorization: Bearer <token>
```

Obtenez-en un de la manière habituelle (`POST /api/v2/auth/login`, ou les flux OIDC / Entra ID) et
rafraîchissez-le avec `POST /api/v2/token`. Il n'y a délibérément **aucun outil de connexion** : un mot de passe passé comme
argument d'outil finirait dans le contexte du modèle de langage et dans son historique de chat.

Les rôles de l'utilisateur doivent aussi autoriser le serveur MCP, via l'[option de rôle](../config/roles.html) `allowMcp`. Quand aucun rôle
de l'utilisateur ne la définit, elle suit `allowChat`, activée par défaut. Un utilisateur à qui il est refusé reçoit `403` à chaque requête.

- **Un backend de chat** connecte lui-même l'utilisateur, garde le jeton de rafraîchissement et transmet le jeton
  d'accès à chaque appel MCP.
- **Un client d'IDE** a besoin d'un jeton qui dure assez longtemps pour n'être configuré qu'une fois. Avec un rôle
  qui a l'option `allowApiTokens`, créez-en un sous
  [Profil > Jetons d'API](../profile/api-token.html), ou connectez-vous avec `?expiryDays=<n>` sur
  l'URL de connexion pour un jeton valable ce nombre de jours.

Pour connecter un agent de code avec un tel jeton :

<div class="af-tabs" data-tab-group="mcpclient">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="claude" aria-selected="true">Claude Code</button>
<button type="button" role="tab" class="af-tab" data-tab="codex" aria-selected="false">Codex</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="claude" markdown="1">

Ajoutez le serveur avec le jeton comme en-tête :

```bash
claude mcp add --transport http ansibleforms https://af.example.com/api/v2/mcp \
  --header "Authorization: Bearer <token>"
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="codex" markdown="1" hidden>

Ajoutez le serveur à `~/.codex/config.toml`, avec le jeton lu dans une variable d'environnement :

```toml
[mcp_servers.ansibleforms]
url = "https://af.example.com/api/v2/mcp"
bearer_token_env_var = "ANSIBLEFORMS_TOKEN"
```

Définissez ensuite la variable avant de démarrer Codex :

```bash
export ANSIBLEFORMS_TOKEN=<token>
```

</div>
</div>

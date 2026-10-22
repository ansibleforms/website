---
layout: default
title: Fournisseurs
parent: Assistant de chat
nav_order: 2
translated_from: 234d1d2e9b7ceec20856b33357e93df7c0777c52
---

# Fournisseurs
{: .no_toc }

Le modèle de langage derrière l'assistant, et les proxys
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Choisissez le fournisseur sur la page des paramètres. Cela remplit l'URL de base, l'authentification et
la version d'API, qui restent toutes modifiables. Les champs vides reprennent les valeurs par défaut du fournisseur.

| Fournisseur | Protocole | URL de base (par défaut) | Clé envoyée comme |
|---|---|---|---|
| **Anthropic** | Anthropic | `https://api.anthropic.com` | `x-api-key` |
| **OpenAI** | OpenAI | `https://api.openai.com/v1` | `Authorization: Bearer` |
| **Azure OpenAI** | OpenAI | obligatoire : `https://<resource>.openai.azure.com/openai/deployments/<deployment>` | `api-key`, version d'API `2024-10-21` |
| **Google Gemini** | OpenAI | `https://generativelanguage.googleapis.com/v1beta/openai` | Bearer |
| **xAI Grok** | OpenAI | `https://api.x.ai/v1` | Bearer |
| **Mistral** | OpenAI | `https://api.mistral.ai/v1` | Bearer |
| **DeepSeek** | OpenAI | `https://api.deepseek.com/v1` | Bearer |
| **Groq** | OpenAI | `https://api.groq.com/openai/v1` | Bearer |
| **OpenRouter** | OpenAI | `https://openrouter.ai/api/v1` | Bearer |
| **Ollama** | OpenAI | `http://localhost:11434/v1` | aucune |
| **Autre compatible OpenAI** (LiteLLM, une passerelle, vLLM, LM Studio, ...) | OpenAI | obligatoire, se termine généralement par `/v1` | Bearer |

L'ID du modèle est celui qu'utilise le fournisseur ou le proxy (`claude-opus-5-5`, `gpt-5`, `llama3.3`,
...). L'assistant a besoin d'un modèle qui prend en charge **l'appel d'outils** (tool calling) ; la prise en charge varie selon
les petits modèles locaux.

Pour les serveurs locaux et les proxys qui n'ont besoin d'aucune clé, une URL de base suffit ; aucun en-tête d'autorisation n'est envoyé.

---

## La clé d'API

La clé vient d'un identifiant, elle est donc stockée et renouvelée comme tout autre secret :

* Créez un identifiant de type **api** sous **Paramètres > Connexions > Identifiants** (voir [Identifiants](../credentials.html)),
  avec la clé comme mot de passe. Il peut aussi lire la clé depuis un [coffre de secrets](../secret-stores/).
* Choisissez-le dans le champ **Identifiant** des paramètres du chat. La clé est lue à chaque message, un
  mot de passe modifié s'applique donc au message suivant.

Une clé enregistrée sur la page des paramètres avant l'existence des identifiants continue de fonctionner tant qu'aucun identifiant n'est choisi. Le
[seed de configuration](../seed/) définit la clé lui-même, sous `api_key`.

---

## Pour un proxy

Un proxy ou une passerelle devant le modèle peut avoir besoin de ces paramètres :

- **Authentification** : la façon dont la clé est envoyée : `Authorization: Bearer`, `api-key`, `x-api-key`,
  ou aucune. Vide utilise la valeur par défaut du fournisseur.
- **Version d'API** : l'en-tête `anthropic-version`, ou `?api-version=` dans l'URL pour les compatibles OpenAI (Azure).
- **Utilisateur** : envoyé à chaque appel sous `user` (compatibles OpenAI) ou `metadata.user_id`
  (Anthropic). Certains proxys l'exigent. Vide n'envoie rien.
- **Ignorer les erreurs de certificat** : non sécurisé ; faites plutôt confiance à la CA du proxy avec `NODE_EXTRA_CA_CERTS`.
- **En-têtes supplémentaires** : un objet JSON, p. ex. `{"X-Org": "ops"}`. Des valeurs texte sur une ligne, 20 au maximum ;
  les en-têtes de clé et de contenu ne peuvent pas être remplacés.

---

## Dans un conteneur, derrière un proxy

Le chat utilise du HTTPS sortant simple depuis le conteneur du serveur AnsibleForms. Derrière un
proxy de sortie d'entreprise, définissez `HTTPS_PROXY` **et** `NODE_USE_ENV_PROXY=1` ; sans le second,
le client HTTP intégré de Node ignore `HTTPS_PROXY`. Un fournisseur avec un certificat émis par une
CA interne exige que Node fasse confiance à cette CA (`NODE_EXTRA_CA_CERTS=/path/to/ca.pem`).
Avec `NODE_USE_ENV_PROXY=1`, un modèle ou un proxy à l'intérieur du réseau doit être listé dans
`NO_PROXY`, sinon l'appel part vers le proxy de sortie, qui ne peut pas l'atteindre.

Un test de connexion qui échoue nomme l'hôte et la raison (DNS, connexion refusée ou certificat non approuvé).

---
layout: default
title: Webhook
parent: Canaux de notification
nav_order: 4
translated_from: 99bafedd6f37d6afe3104cd7d8819c3891b518d0
---

# Webhook
{: .no_toc }

Une requête JSON vers n'importe quel endpoint HTTP
{: .fs-6 .fw-300 }

Un canal webhook envoie une requête JSON vers n'importe quel endpoint HTTP. Son étape **Point de terminaison** indique où et comment, et son
étape **Identifiants** contient le **Jeton bearer** :

| Champ | Signification |
|---|---|
| Url | L'adresse à laquelle la requête est envoyée. |
| Méthode | `POST` (par défaut) ou `PUT`. |
| Jeton bearer | Un identifiant **api** de [Connexions > Identifiants](../credentials.html) dont le mot de passe est envoyé sous la forme `Authorization: Bearer <password>`. Vide : pas de jeton. |
| Vérifier le certificat TLS | Activé par défaut ; ne le désactivez que pour un endpoint avec un certificat auto-signé. |

{% raw %}
Son étape **Contenu** contient les **En-têtes**, des en-têtes supplémentaires sous forme d'objet JSON comme `{ "X-Source": "ansibleforms" }`, et le
**Contenu**, le modèle JSON du corps. Ces placeholders sont remplis :

| Placeholder | Valeur |
|---|---|
| `{{title}}` | Le titre de la notification |
| `{{text}}` | Son texte |
| `{{status}}` | Le statut du job |
| `{{event}}` | L'événement du job |
| `{{jobId}}` | L'id du job |
| `{{form}}` | Le nom du formulaire |
| `{{user}}` | L'utilisateur qui a lancé le job |
| `{{link}}` | Le lien vers le job |

Un placeholder qui constitue une chaîne JSON entière (`"{{text}}"`) est remplacé par la valeur au format JSON ; à l'intérieur d'une chaîne plus longue, son
texte est échappé pour JSON. Un placeholder inconnu est laissé tel quel. Un contenu vide envoie ce modèle :

```json
{
  "title": "{{title}}",
  "text": "{{text}}",
  "status": "{{status}}",
  "event": "{{event}}",
  "job": { "id": "{{jobId}}", "form": "{{form}}", "user": "{{user}}" },
  "link": "{{link}}"
}
```
{% endraw %}

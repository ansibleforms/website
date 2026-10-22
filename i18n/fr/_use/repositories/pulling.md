---
layout: default
title: Récupérer les modifications
parent: Dépôts git
nav_order: 3
translated_from: 1246850e9b868af155c96ce8f3f5d55f0464fb6e
---

# Récupérer les modifications
{: .no_toc }

Pulls planifiés, manuels et via l'API, et modifications locales
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Récupérer les modifications

Un pull d'un dépôt se fait selon sa planification, au démarrage, depuis la page ou via l'API ; il n'existe pas de point de terminaison webhook.

| Déclencheur | Comment |
|---|---|
| Planification | **Activer le pull planifié** et une **Planification du pull**, par exemple `0 * * * *` pour toutes les heures |
| Démarrage | **Pull au démarrage de l'application** clone le dépôt, ou fait un pull s'il est déjà cloné |
| Page des paramètres | **Pull** dans le menu de la ligne, ou **Tout puller** au-dessus de la liste |
| Concepteur | **Charger (dépôt)**, qui fait un pull des dépôts de formulaires et recharge le concepteur ; prendre le verrou du concepteur fait aussi d'abord un pull de tous les dépôts de formulaires |
| API | `POST /api/v2/repository/<name>/pull` (`showSettings` ou `showConnectionsSettings`) ou `POST /api/v2/forms-repos/pull/<name>` (voir ci-dessous) |

### Pull depuis un pipeline ou un webhook

AnsibleForms n'a pas de récepteur de webhook dédié, mais un job de CI ou un webhook de serveur git peut appeler le point de terminaison de pull.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" https://af.example.com/api/v2/repository/forms/pull
```

Créez le jeton comme décrit dans [Jetons d'API](../profile/api-token.html), pour un utilisateur dont le rôle a `showSettings` ou
`showConnectionsSettings`. `/api/v2/forms-repos/pull/<name>` nécessite plutôt `showDesigner` et `allowFormDesign`, avec le concepteur
activé ([`SHOW_DESIGNER`](../customization/features.html#env_SHOW_DESIGNER)). `GET /api/v2/repository/<name>` renvoie le
`head`, le `status` et l'`output`, pour qu'un pipeline puisse vérifier quel commit l'instance exécute après un pull.

### Modifications locales

Un pull n'écrase jamais un travail qui n'est pas encore poussé : un pull planifié vérifie donc l'arbre de travail avant de s'exécuter.

Un pull planifié est ignoré tant que l'arbre de travail a des modifications non commitées ou des commits non poussés, et tant qu'un concepteur
détient le verrou du concepteur. Un pull manuel d'un arbre de travail avec des modifications en conflit échoue avec :

```
Repository '<name>' has local changes that block the pull. Use 'Save (repository)' to push them first, or discard them.
```

Poussez les modifications, ou abandonnez-les avec **Réinitialiser** dans le menu de la ligne, ce qui supprime l'arbre de travail et le clone de nouveau.
